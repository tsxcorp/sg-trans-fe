import { describe, it, expect, vi, beforeEach } from 'vitest';

// Framework boundary only: the visitor IP arrives through request headers.
const ctx = vi.hoisted(() => ({ ip: '203.0.113.1' }));
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': ctx.ip, 'x-real-ip': ctx.ip }),
}));
vi.mock('server-only', () => ({}));

import { submitQuote } from '@/app/actions/submitQuote';
import { listLeads, resetLeads, setMailTransport, getSentCount } from '@/lib/cms/testing';
import type { LeadT } from '@/lib/cms/schema';
import { validLeadInput } from '../helpers/fixtures';

let n = 0;
function uniqueIp() {
  n += 1;
  return `10.${(n >> 16) & 255}.${(n >> 8) & 255}.${n & 255}`;
}

function form(patch: Record<string, string | undefined> = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries({ ...validLeadInput, ...patch })) if (v !== undefined) fd.set(k, v);
  return fd;
}

beforeEach(async () => {
  await resetLeads(); // also resets transport, sent count and rate limiter
  ctx.ip = uniqueIp();
});

describe('submitQuote validation (S3)', () => {
  it('S3: valid input returns exactly { ok: true }', async () => {
    expect(await submitQuote(form())).toEqual({ ok: true });
  });

  it('S3: optional fields (company, country, job_title, message) may be omitted', async () => {
    const res = await submitQuote(form({ company: undefined, country: undefined, job_title: undefined, message: undefined }));
    expect(res).toEqual({ ok: true });
  });

  it('S3: an empty message is not an error', async () => {
    expect(await submitQuote(form({ message: '' }))).toEqual({ ok: true });
  });

  it('S3: invalid email returns ok:false with an email field error', async () => {
    const res = await submitQuote(form({ email: 'not-an-email' }));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(typeof res.errors.email).toBe('string');
    expect(res.errors.email.length).toBeGreaterThan(0);
  });

  it.each(['first_name', 'last_name', 'email', 'phone'])(
    'S3: empty required field %s returns ok:false with an error keyed to it',
    async (field) => {
      const res = await submitQuote(form({ [field]: '' }));
      expect(res.ok).toBe(false);
      if (res.ok) return;
      expect(typeof res.errors[field]).toBe('string');
      expect(res.errors[field].length).toBeGreaterThan(0);
    },
  );

  it('S3: errors only name fields that are actually invalid', async () => {
    const res = await submitQuote(form({ email: 'bad' }));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(Object.keys(res.errors)).toEqual(['email']);
  });

  it('S3: all-empty submission reports every required field and none of the optional ones', async () => {
    const empty = new FormData();
    empty.set('website', '');
    empty.set('locale', 'en');
    const res = await submitQuote(empty);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    for (const f of ['first_name', 'last_name', 'email', 'phone']) expect(res.errors).toHaveProperty(f);
    for (const f of ['company', 'country', 'job_title', 'message']) expect(res.errors).not.toHaveProperty(f);
  });

  it('S3: honeypot filled returns ok:true (bot sees success)', async () => {
    expect(await submitQuote(form({ website: 'http://spam.example' }))).toEqual({ ok: true });
  });

  it('S3: honeypot is checked before validation (invalid data + honeypot still looks like success)', async () => {
    expect(await submitQuote(form({ website: 'x', email: 'bad' }))).toEqual({ ok: true });
  });
});

describe('submitQuote rate limit (S3)', () => {
  it('S3: 5 valid submissions from one IP are accepted (boundary)', async () => {
    for (let i = 0; i < 5; i++) expect(await submitQuote(form())).toEqual({ ok: true });
  });

  it('S3: the 6th valid submission from the same IP is rejected under key `form` with a friendly message', async () => {
    for (let i = 1; i <= 5; i++) expect(await submitQuote(form())).toEqual({ ok: true });
    const sixth = await submitQuote(form());
    expect(sixth.ok).toBe(false);
    if (sixth.ok) return;
    expect(Object.keys(sixth.errors)).toEqual(['form']);
    const m = sixth.errors.form;
    expect(typeof m).toBe('string');
    expect(m.length).toBeGreaterThan(10);
    expect(m).not.toMatch(/429|exception|stack|undefined|null|\[object/i);
  });

  it('S3: the rejected 6th submission stores nothing and sends nothing', async () => {
    for (let i = 1; i <= 5; i++) await submitQuote(form());
    await submitQuote(form());
    expect(await listLeads()).toHaveLength(5);
    expect(getSentCount()).toBe(5);
  });

  it('S3: the limit is per IP, a different IP is not blocked', async () => {
    for (let i = 1; i <= 6; i++) await submitQuote(form());
    ctx.ip = uniqueIp();
    expect(await submitQuote(form())).toEqual({ ok: true });
  });

  it('S3: invalid submissions do not consume the quota (10 invalid, then a valid one succeeds)', async () => {
    for (let i = 0; i < 10; i++) expect((await submitQuote(form({ email: 'bad' }))).ok).toBe(false);
    expect(await submitQuote(form())).toEqual({ ok: true });
    for (let i = 0; i < 4; i++) expect(await submitQuote(form())).toEqual({ ok: true }); // 5 valid in total
    expect((await submitQuote(form())).ok).toBe(false); // 6th valid rejected
  });

  it('S3: honeypot submissions do not consume the quota', async () => {
    for (let i = 0; i < 10; i++) expect(await submitQuote(form({ website: 'bot' }))).toEqual({ ok: true });
    for (let i = 0; i < 5; i++) expect(await submitQuote(form())).toEqual({ ok: true });
  });

  it('S3: validation errors win over the rate limit for an invalid 6th submission', async () => {
    for (let i = 1; i <= 5; i++) await submitQuote(form());
    const res = await submitQuote(form({ email: 'bad' }));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.errors).toHaveProperty('email');
    expect(res.errors).not.toHaveProperty('form');
  });
});

describe('submitQuote side effects (S3)', () => {
  it('S3: valid input stores exactly one Lead with the submitted data', async () => {
    await submitQuote(form());
    const leads = await listLeads();
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({ first_name: 'An', last_name: 'Nguyen', email: 'an@example.com', phone: '0901234567', locale: 'en' });
    expect('website' in leads[0]).toBe(false);
  });

  it('S3: invalid email / empty required field stores nothing and sends nothing', async () => {
    await submitQuote(form({ email: 'bad' }));
    await submitQuote(form({ first_name: '' }));
    await submitQuote(form({ phone: '' }));
    expect(await listLeads()).toHaveLength(0);
    expect(getSentCount()).toBe(0);
  });

  it('S3: honeypot filled stores nothing and sends nothing', async () => {
    expect(await submitQuote(form({ website: 'http://spam.example' }))).toEqual({ ok: true });
    expect(await listLeads()).toHaveLength(0);
    expect(getSentCount()).toBe(0);
  });

  it('S3: exactly one notification per valid submission', async () => {
    await submitQuote(form());
    expect(getSentCount()).toBe(1);
    await submitQuote(form());
    await submitQuote(form());
    expect(getSentCount()).toBe(3);
  });

  it('S3: a successful transport leaves email_status "sent"', async () => {
    await submitQuote(form());
    expect((await listLeads())[0].email_status).toBe('sent');
  });

  it('S3: the Lead is stored BEFORE the transport runs', async () => {
    const seen: number[] = [];
    setMailTransport(async () => {
      seen.push((await listLeads()).length);
    });
    await submitQuote(form());
    expect(seen).toEqual([1]);
  });

  it('S3: the transport receives the stored lead', async () => {
    const got: LeadT[] = [];
    setMailTransport(async (lead) => {
      got.push(lead);
    });
    await submitQuote(form());
    const [stored] = await listLeads();
    expect(got).toHaveLength(1);
    expect(got[0].id).toBe(stored.id);
    expect(got[0].email).toBe('an@example.com');
  });

  it('S3: a failing transport still returns ok:true and the lead keeps email_status "failed"', async () => {
    setMailTransport(async () => {
      throw new Error('smtp down');
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const res = await submitQuote(form());
    const logged = spy.mock.calls.length + warn.mock.calls.length;
    spy.mockRestore();
    warn.mockRestore();
    expect(res).toEqual({ ok: true });
    const leads = await listLeads();
    expect(leads).toHaveLength(1);
    expect(leads[0].email_status).toBe('failed');
    expect(getSentCount()).toBe(0);
    expect(logged, 'the failure must be logged for retry').toBeGreaterThan(0);
  });

  it('S3: restoring the default transport (null) stops failures', async () => {
    setMailTransport(async () => {
      throw new Error('x');
    });
    setMailTransport(null);
    await submitQuote(form());
    expect((await listLeads())[0].email_status).toBe('sent');
  });

  it('S3: resetLeads clears leads, sent count and the rate limiter', async () => {
    for (let i = 0; i < 5; i++) await submitQuote(form());
    await resetLeads();
    expect(await listLeads()).toHaveLength(0);
    expect(getSentCount()).toBe(0);
    expect(await submitQuote(form())).toEqual({ ok: true });
  });
});
