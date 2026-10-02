import { describe, it, expect, vi, beforeEach } from 'vitest';

// Framework boundary only: the visitor IP arrives through request headers.
const ctx = vi.hoisted(() => ({ ip: '203.0.113.1' }));
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': ctx.ip, 'x-real-ip': ctx.ip }),
}));
vi.mock('server-only', () => ({}));

import { subscribeNewsletter } from '@/app/actions/subscribe';
import { submitQuote } from '@/app/actions/submitQuote';
import { createSubscriber } from '@/lib/cms';
import { listSubscribersForTest, listLeads, resetLeads } from '@/lib/cms/testing';
import { validLeadInput } from '../helpers/fixtures';

let n = 0;
function uniqueIp() {
  n += 1;
  return `10.${(n >> 16) & 255}.${(n >> 8) & 255}.${n & 255}`;
}

function nl(patch: Record<string, string | undefined> = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries({ email: 'sub@example.com', locale: 'en', website: '', ...patch })) {
    if (v !== undefined) fd.set(k, v);
  }
  return fd;
}

function quote() {
  const fd = new FormData();
  for (const [k, v] of Object.entries(validLeadInput)) fd.set(k, v as string);
  return fd;
}

beforeEach(async () => {
  await resetLeads(); // also clears subscribers and the rate limiter
  ctx.ip = uniqueIp();
});

describe('subscribeNewsletter (S7)', () => {
  it('S7: a valid email returns exactly { ok: true } and stores one subscriber', async () => {
    expect(await subscribeNewsletter(nl())).toEqual({ ok: true });
    const subs = await listSubscribersForTest();
    expect(subs).toHaveLength(1);
    expect(subs[0]).toMatchObject({ locale: 'en' });
    expect(subs[0].email.toLowerCase()).toBe('sub@example.com');
    expect(typeof subs[0].id).toBe('string');
    expect(Number.isNaN(Date.parse(subs[0].date_created))).toBe(false);
    expect(typeof subs[0].source_page).toBe('string');
    expect('website' in subs[0]).toBe(false);
  });

  it.each(['not-an-email', '', 'a@', '@b.com', 'a b@c.com'])('S7: invalid email %j returns ok:false with a message and stores nothing', async (email) => {
    const res = await subscribeNewsletter(nl({ email }));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(typeof res.error).toBe('string');
    expect(res.error.length).toBeGreaterThan(0);
    expect(await listSubscribersForTest()).toHaveLength(0);
  });

  it('S7: a missing email field is invalid', async () => {
    const fd = new FormData();
    fd.set('locale', 'en');
    fd.set('website', '');
    expect((await subscribeNewsletter(fd)).ok).toBe(false);
    expect(await listSubscribersForTest()).toHaveLength(0);
  });

  it('S7: honeypot filled looks like success and stores nothing', async () => {
    expect(await subscribeNewsletter(nl({ website: 'http://spam.example' }))).toEqual({ ok: true });
    expect(await listSubscribersForTest()).toHaveLength(0);
  });

  it('S7: honeypot is checked before validation (invalid email + honeypot still looks like success)', async () => {
    expect(await subscribeNewsletter(nl({ website: 'x', email: 'bad' }))).toEqual({ ok: true });
    expect(await listSubscribersForTest()).toHaveLength(0);
  });

  it('S7: the same email twice (different letter case) shows success both times and stores exactly one', async () => {
    expect(await subscribeNewsletter(nl({ email: 'Dup@Example.com' }))).toEqual({ ok: true });
    expect(await subscribeNewsletter(nl({ email: 'dup@example.COM' }))).toEqual({ ok: true });
    expect(await listSubscribersForTest()).toHaveLength(1);
  });

  it('S7: different emails are stored separately', async () => {
    await subscribeNewsletter(nl({ email: 'a@example.com' }));
    await subscribeNewsletter(nl({ email: 'b@example.com' }));
    expect(await listSubscribersForTest()).toHaveLength(2);
  });
});

describe('subscribeNewsletter rate limit (S7)', () => {
  it('S7: 5 valid sign-ups from one IP are accepted (boundary)', async () => {
    for (let i = 0; i < 5; i++) expect(await subscribeNewsletter(nl({ email: `u${i}@example.com` }))).toEqual({ ok: true });
    expect(await listSubscribersForTest()).toHaveLength(5);
  });

  it('S7: the 6th valid sign-up from the same IP is rejected with a friendly message and not stored', async () => {
    for (let i = 0; i < 5; i++) await subscribeNewsletter(nl({ email: `u${i}@example.com` }));
    const sixth = await subscribeNewsletter(nl({ email: 'u6@example.com' }));
    expect(sixth.ok).toBe(false);
    if (sixth.ok) return;
    expect(sixth.error.length).toBeGreaterThan(10);
    expect(sixth.error).not.toMatch(/429|exception|stack|undefined|null|\[object/i);
    const subs = await listSubscribersForTest();
    expect(subs).toHaveLength(5);
    expect(subs.map((s) => s.email.toLowerCase())).not.toContain('u6@example.com');
  });

  it('S7: the limit is per IP, a different IP is not blocked', async () => {
    for (let i = 0; i < 6; i++) await subscribeNewsletter(nl({ email: `u${i}@example.com` }));
    ctx.ip = uniqueIp();
    expect(await subscribeNewsletter(nl({ email: 'other@example.com' }))).toEqual({ ok: true });
  });

  it('S7: invalid and honeypot submissions do not consume the quota', async () => {
    for (let i = 0; i < 10; i++) expect((await subscribeNewsletter(nl({ email: 'bad' }))).ok).toBe(false);
    for (let i = 0; i < 10; i++) expect(await subscribeNewsletter(nl({ website: 'bot' }))).toEqual({ ok: true });
    for (let i = 0; i < 5; i++) expect(await subscribeNewsletter(nl({ email: `q${i}@example.com` }))).toEqual({ ok: true });
    expect((await subscribeNewsletter(nl({ email: 'q9@example.com' }))).ok).toBe(false);
  });

  it('S7: newsletter and quote limits are counted separately (5 quotes do not block sign-up)', async () => {
    for (let i = 0; i < 5; i++) expect(await submitQuote(quote())).toEqual({ ok: true });
    expect((await submitQuote(quote())).ok).toBe(false);
    expect(await subscribeNewsletter(nl())).toEqual({ ok: true });
    expect(await listSubscribersForTest()).toHaveLength(1);
  });

  it('S7: newsletter and quote limits are counted separately (5 sign-ups do not block a quote)', async () => {
    for (let i = 0; i < 5; i++) await subscribeNewsletter(nl({ email: `u${i}@example.com` }));
    expect((await subscribeNewsletter(nl({ email: 'u6@example.com' }))).ok).toBe(false);
    expect(await submitQuote(quote())).toEqual({ ok: true });
    expect(await listLeads()).toHaveLength(1);
  });

  it('S7: resetLeads also clears subscribers and the newsletter rate limiter', async () => {
    for (let i = 0; i < 6; i++) await subscribeNewsletter(nl({ email: `u${i}@example.com` }));
    await resetLeads();
    expect(await listSubscribersForTest()).toHaveLength(0);
    expect(await subscribeNewsletter(nl())).toEqual({ ok: true });
  });
});

describe('createSubscriber (S7 data contract)', () => {
  const input = (email: string) => ({ email, locale: 'en' as const, website: '' });

  it('S7: returns the stored subscriber { id, email, locale, date_created, source_page }', async () => {
    const sub = await createSubscriber(input('x@example.com'), '/en');
    expect(sub).not.toBeNull();
    expect(sub).toMatchObject({ email: expect.stringMatching(/^x@example\.com$/i), locale: 'en', source_page: '/en' });
    expect(typeof sub!.id).toBe('string');
    expect(Number.isNaN(Date.parse(sub!.date_created))).toBe(false);
    expect(await listSubscribersForTest()).toHaveLength(1);
  });

  it('S7: returns null for a duplicate e-mail, case-insensitively, and does not store it again', async () => {
    expect(await createSubscriber(input('Dup@Example.com'), '/en')).not.toBeNull();
    expect(await createSubscriber(input('dup@example.com'), '/en/news')).toBeNull();
    expect(await createSubscriber(input('DUP@EXAMPLE.COM'), '/en')).toBeNull();
    expect(await listSubscribersForTest()).toHaveLength(1);
  });

  it('S7: the source page of the first sign-up is kept', async () => {
    await createSubscriber(input('keep@example.com'), '/en/contact');
    expect((await listSubscribersForTest())[0].source_page).toBe('/en/contact');
  });
});
