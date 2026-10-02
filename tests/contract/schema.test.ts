import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { Locale, Service, News, Stat, Partner, Office, LeadInput, Lead } from '@/lib/cms/schema';
import {
  omit, base, validService, validNews, validStat, validPartner, validOffice,
  validLeadInput, validLead, UUID_A,
} from '../helpers/fixtures';

const ok = (s: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) => s.safeParse(v).success;
const firstTr = (v: unknown) => (v as { translations: Record<string, unknown>[] }).translations[0];
const without = (o: Record<string, unknown>, k: string) => {
  const c = { ...o };
  delete c[k];
  return c;
};

const contentSchemas = [
  ['Service', Service, validService],
  ['News', News, validNews],
  ['Stat', Stat, validStat],
  ['Partner', Partner, validPartner],
  ['Office', Office, validOffice],
] as const;

describe('Data contracts: Locale', () => {
  it('S2: accepts en and vi, rejects anything else', () => {
    expect(ok(Locale, 'en')).toBe(true);
    expect(ok(Locale, 'vi')).toBe(true);
    expect(ok(Locale, 'fr')).toBe(false);
    expect(ok(Locale, '')).toBe(false);
  });
});

describe.each(contentSchemas)('Data contracts: %s (S4)', (_name, schema, valid) => {
  it('S4: accepts a valid sample', () => {
    expect(ok(schema, valid)).toBe(true);
  });
  it('S4: rejects a missing id', () => {
    expect(ok(schema, without(valid, 'id'))).toBe(false);
  });
  it('S4: rejects a non-uuid id', () => {
    expect(ok(schema, { ...valid, id: 'not-a-uuid' })).toBe(false);
  });
  it('S4: rejects a bad status', () => {
    expect(ok(schema, { ...valid, status: 'deleted' })).toBe(false);
  });
  it.each(['published', 'draft', 'archived'])('S4: accepts status %s', (status) => {
    expect(ok(schema, { ...valid, status })).toBe(true);
  });
  it('S4: sort must be an integer or null', () => {
    expect(ok(schema, { ...valid, sort: null })).toBe(true);
    expect(ok(schema, { ...valid, sort: 1.5 })).toBe(false);
    expect(ok(schema, { ...valid, sort: 'a' })).toBe(false);
  });
  it('S4: rejects non-datetime date_created', () => {
    expect(ok(schema, { ...valid, date_created: '02/10/2026' })).toBe(false);
  });
});

describe('Data contracts: translations (S2)', () => {
  it.each([
    ['Service', Service, validService],
    ['News', News, validNews],
    ['Stat', Stat, validStat],
    ['Office', Office, validOffice],
  ] as const)('S2: %s rejects an unknown languages_code', (_n, schema, valid) => {
    const bad = { ...valid, translations: [{ ...firstTr(valid), languages_code: 'xx' }] };
    expect(ok(schema, bad)).toBe(false);
  });
  it('S2: Service translation requires title and summary', () => {
    const t = firstTr(validService);
    expect(ok(Service, { ...validService, translations: [without(t, 'title')] })).toBe(false);
    expect(ok(Service, { ...validService, translations: [without(t, 'summary')] })).toBe(false);
  });
  it('S2: News translation requires body', () => {
    const t = firstTr(validNews);
    expect(ok(News, { ...validNews, translations: [without(t, 'body')] })).toBe(false);
  });
  it('S2/S4: News body is an array of blocks; a plain string (or HTML) body is rejected', () => {
    const t = firstTr(validNews);
    expect(ok(News, { ...validNews, translations: [{ ...t, body: 'B' }] })).toBe(false);
    expect(ok(News, { ...validNews, translations: [{ ...t, body: '<p>B</p>' }] })).toBe(false);
    expect(ok(News, { ...validNews, translations: [{ ...t, body: [] }] })).toBe(true);
  });
});

describe('Data contracts: file ids and URLs (S4)', () => {
  it('S4: Service.image accepts uuid or null, rejects non-uuid', () => {
    expect(ok(Service, { ...validService, image: null })).toBe(true);
    expect(ok(Service, { ...validService, image: 'logo.png' })).toBe(false);
  });
  it('S4: News.cover accepts uuid or null, rejects non-uuid', () => {
    expect(ok(News, { ...validNews, cover: null })).toBe(true);
    expect(ok(News, { ...validNews, cover: '/img/a.png' })).toBe(false);
  });
  it('S4: Partner.logo is required, uuid only', () => {
    expect(ok(Partner, { ...validPartner, logo: null })).toBe(false);
    expect(ok(Partner, without(validPartner, 'logo'))).toBe(false);
    expect(ok(Partner, { ...validPartner, logo: 'abc' })).toBe(false);
  });
  it('S4: Partner.url must be a url or null', () => {
    expect(ok(Partner, { ...validPartner, url: null })).toBe(true);
    expect(ok(Partner, { ...validPartner, url: 'nope' })).toBe(false);
  });
  it('S4: Stat.as_of must be a date (YYYY-MM-DD)', () => {
    expect(ok(Stat, { ...validStat, as_of: '2026-10-01T00:00:00.000Z' })).toBe(false);
    expect(ok(Stat, without(validStat, 'as_of'))).toBe(false);
  });
  it('S4: News.published_at must be a datetime', () => {
    expect(ok(News, { ...validNews, published_at: '2026-10-02' })).toBe(false);
  });
  it('S4: Office.email must be valid or null', () => {
    expect(ok(Office, { ...validOffice, email: null })).toBe(true);
    expect(ok(Office, { ...validOffice, email: 'not-an-email' })).toBe(false);
  });
  it('S4: any non-uuid string is rejected as a file id (property)', () => {
    fc.assert(
      fc.property(fc.string().filter((s) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)), (s) => {
        return !ok(Partner, { ...validPartner, logo: s });
      }),
    );
  });
});

describe('Data contracts: LeadInput (S3)', () => {
  it('S3: accepts a valid sample', () => {
    expect(ok(LeadInput, validLeadInput)).toBe(true);
  });
  it('S3: company, country, job_title, message are optional (omitted)', () => {
    expect(ok(LeadInput, omit(validLeadInput, 'company', 'country', 'job_title'))).toBe(true);
  });
  it('S3: message may be empty (not rendered in the form)', () => {
    expect(ok(LeadInput, { ...validLeadInput, message: '' })).toBe(true);
  });
  it.each(['first_name', 'last_name', 'email', 'phone'])('S3: required field %s rejects empty/missing', (k) => {
    expect(ok(LeadInput, { ...validLeadInput, [k]: '' })).toBe(false);
    expect(ok(LeadInput, without(validLeadInput, k))).toBe(false);
  });
  it('S3: rejects a bad email', () => {
    for (const e of ['plain', 'a@', '@b.com', 'a b@c.com']) {
      expect(ok(LeadInput, { ...validLeadInput, email: e })).toBe(false);
    }
  });
  it('S3: phone length 5..30', () => {
    expect(ok(LeadInput, { ...validLeadInput, phone: '1234' })).toBe(false);
    expect(ok(LeadInput, { ...validLeadInput, phone: '12345' })).toBe(true);
    expect(ok(LeadInput, { ...validLeadInput, phone: '1'.repeat(30) })).toBe(true);
    expect(ok(LeadInput, { ...validLeadInput, phone: '1'.repeat(31) })).toBe(false);
  });
  it.each([
    ['first_name', 80], ['last_name', 80], ['company', 160], ['country', 80],
    ['job_title', 120], ['message', 4000], // optional-field length checks
  ])('S3: %s allows %i chars, rejects one more', (k, max) => {
    expect(ok(LeadInput, { ...validLeadInput, [k]: 'a'.repeat(max) })).toBe(true);
    expect(ok(LeadInput, { ...validLeadInput, [k]: 'a'.repeat(max + 1) })).toBe(false);
  });
  it('S3: rejects an unknown locale', () => {
    expect(ok(LeadInput, { ...validLeadInput, locale: 'de' })).toBe(false);
  });
  it('S3: honeypot must be empty (property: any non-empty string rejected)', () => {
    fc.assert(fc.property(fc.string({ minLength: 1 }), (s) => !ok(LeadInput, { ...validLeadInput, website: s })));
  });
  it('S3: honeypot field is required to be present as a string', () => {
    expect(ok(LeadInput, without(validLeadInput, 'website'))).toBe(false);
  });
});

describe('Data contracts: Lead (S3)', () => {
  it('S3: accepts a stored-lead sample', () => {
    expect(ok(Lead, validLead)).toBe(true);
  });
  it('S3: does not keep the honeypot field', () => {
    const parsed = Lead.parse({ ...validLead, website: '' }) as Record<string, unknown>;
    expect('website' in parsed).toBe(false);
  });
  it('S3: rejects missing id, non-uuid id, bad email_status', () => {
    expect(ok(Lead, without(validLead, 'id'))).toBe(false);
    expect(ok(Lead, { ...validLead, id: 'x' })).toBe(false);
    expect(ok(Lead, { ...validLead, email_status: 'queued' })).toBe(false);
    for (const s of ['pending', 'sent', 'failed']) expect(ok(Lead, { ...validLead, email_status: s })).toBe(true);
  });
  it('S3: requires source_page and datetime date_created', () => {
    expect(ok(Lead, without(validLead, 'source_page'))).toBe(false);
    expect(ok(Lead, { ...validLead, date_created: 'yesterday' })).toBe(false);
  });
  it('S3: inherits LeadInput limits and bad-email rejection', () => {
    expect(ok(Lead, { ...validLead, email: 'bad' })).toBe(false);
    expect(ok(Lead, { ...validLead, message: 'a'.repeat(4001) })).toBe(false);
    expect(ok(Lead, omit(validLead, 'message'))).toBe(true);
  });
});

// keep helper import used
void base; void UUID_A;
