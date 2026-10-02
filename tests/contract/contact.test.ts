import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Framework boundary only: the visitor IP arrives through request headers.
const ctx = vi.hoisted(() => ({ ip: '203.0.113.9' }));
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': ctx.ip, 'x-real-ip': ctx.ip }),
}));
vi.mock('server-only', () => ({}));

import { submitQuote } from '@/app/actions/submitQuote';
import { listLeads, resetLeads, setMailTransport, getSentCount } from '@/lib/cms/testing';
import { Lead, LeadInput } from '@/lib/cms/schema';
import * as contact from '@/lib/cms/pages/contact';
import { base, validLead, validLeadInput, omit, UUID_A } from '../helpers/fixtures';
import { text, translationsAreResolved, sortKey, type Rec } from '../helpers/cms';
import { REPO_ROOT, walk } from '../helpers/fs';

type Schema = { safeParse: (v: unknown) => { success: boolean; data?: unknown } };
type Getter = (locale: string) => Promise<unknown>;
const mod = contact as unknown as Record<string, unknown>;
const schema = (name: string): Schema => {
  const s = mod[name] as Schema | undefined;
  if (!s || typeof s.safeParse !== 'function') throw new Error(`@/lib/cms/pages/contact must export the Zod contract "${name}"`);
  return s;
};
const getter = (name: string): Getter => {
  const g = mod[name] as Getter | undefined;
  if (typeof g !== 'function') throw new Error(`@/lib/cms/pages/contact must export the getter "${name}"`);
  return g;
};
const asList = (v: unknown): Rec[] => (Array.isArray(v) ? (v as Rec[]) : v ? [v as Rec] : []);
const ok = (s: Schema, v: unknown) => s.safeParse(v).success;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------------------------
// Zod contracts (spec section 3)
// ---------------------------------------------------------------------------------------------
const tr = (fields: Record<string, unknown>) => [{ languages_code: 'en', ...fields }];

const person = (over: Record<string, unknown> = {}) =>
  base({ level: 1, column: 2, full_name: 'Khoa Pham', email: 'khoapham@saigontrans.com.vn', extension: '102', translations: tr({ role: 'Vice Director' }), ...over });
const hours = (over: Record<string, unknown> = {}) =>
  base({ icon: 'briefcase', time_range: '08:00 - 18:00', translations: tr({ title: 'Business Hours', days: 'Mon-Fri' }), ...over });
const group = (over: Record<string, unknown> = {}) => base({ panel: 1, translations: tr({ label: 'Airport Terminals' }), ...over });
const point = (over: Record<string, unknown> = {}) => base({ group: UUID_A, location: 'TCS Airport', persons: ['Pham Trung Nghia'], ...over });
const profile = (over: Record<string, unknown> = {}) =>
  base({ legal_name: 'SAIGONTRANSERVICE', license_tax: '4102001961/GP-HCM', vat: '0302070998', phone: '(84) 028 38233 068', email: 'linhpham@saigontrans.com.vn', ...over });
// The ContactPage sample is the record the getter returns (the builder may add required fields beyond the spec,
// e.g. other images or labels); the cases below mutate it, so only the spec-named fields are exercised.
let realPage: Rec;
beforeAll(async () => {
  realPage = asList(await getter('getContactPage')('en'))[0];
});
const realT = () => ((realPage.translations as Rec[])[0] ?? {}) as Rec;
const pageRec = (over: Record<string, unknown> = {}) => ({ ...realPage, ...over });

const cases: [string, () => Record<string, unknown>][] = [
  ['ContactPerson', person],
  ['OpeningHours', hours],
  ['OperationGroup', group],
  ['OperationPoint', point],
  ['CompanyProfile', profile],
  ['ContactPage', () => pageRec()],
];

describe.each(cases)('Contact contract: %s (CT-43)', (exportName, make) => {
  it('CT-43: accepts a valid sample', () => {
    expect(ok(schema(exportName), make())).toBe(true);
  });
  it('CT-43: rejects a missing or non-uuid id, a bad status, a non-integer sort', () => {
    const s = schema(exportName);
    expect(ok(s, omit(make(), 'id'))).toBe(false);
    expect(ok(s, { ...make(), id: 'not-a-uuid' })).toBe(false);
    expect(ok(s, { ...make(), status: 'deleted' })).toBe(false);
    expect(ok(s, { ...make(), sort: 1.5 })).toBe(false);
    for (const status of ['published', 'draft', 'archived']) expect(ok(s, { ...make(), status })).toBe(true);
  });
});

describe('Contact contract: ContactPerson (CT-43)', () => {
  const s = () => schema('ContactPerson');
  it.each([0, 1, 2])('CT-43: level %i is accepted', (level) => expect(ok(s(), person({ level, column: level === 0 ? null : 1 }))).toBe(true));
  it.each([-1, 3, 1.5, '1'])('CT-43: level %j is rejected', (level) => expect(ok(s(), person({ level }))).toBe(false));
  it.each([1, 2, 3, 4, null])('CT-43: column %j is accepted', (column) => expect(ok(s(), person({ column }))).toBe(true));
  it.each([0, 5, 2.5])('CT-43: column %j is rejected', (column) => expect(ok(s(), person({ column }))).toBe(false));
  it('CT-43: email must be a valid address or null; extension may be null', () => {
    expect(ok(s(), person({ email: 'nope' }))).toBe(false);
    expect(ok(s(), person({ email: null }))).toBe(true);
    expect(ok(s(), person({ extension: null }))).toBe(true);
  });
  it('CT-43: full_name and the translated role are required', () => {
    expect(ok(s(), omit(person(), 'full_name'))).toBe(false);
    expect(ok(s(), person({ translations: tr({}) }))).toBe(false);
  });
});

describe('Contact contract: OpeningHours, OperationGroup, OperationPoint, CompanyProfile, ContactPage (CT-43)', () => {
  it('CT-43: OpeningHours requires time_range, title and days; icon may be null', () => {
    const s = schema('OpeningHours');
    expect(ok(s, hours({ icon: null }))).toBe(true);
    expect(ok(s, omit(hours(), 'time_range'))).toBe(false);
    expect(ok(s, hours({ translations: tr({ title: 'x' }) }))).toBe(false);
    expect(ok(s, hours({ translations: tr({ days: 'x' }) }))).toBe(false);
  });
  it.each([1, 2])('CT-43: OperationGroup panel %i is accepted', (panel) => expect(ok(schema('OperationGroup'), group({ panel }))).toBe(true));
  it.each([0, 3, 1.5])('CT-43: OperationGroup panel %j is rejected', (panel) => expect(ok(schema('OperationGroup'), group({ panel }))).toBe(false));
  it('CT-43: OperationGroup requires a translated label', () => {
    expect(ok(schema('OperationGroup'), group({ translations: tr({}) }))).toBe(false);
  });
  it('CT-43: OperationPoint needs a uuid group, a location and at least one person', () => {
    const s = schema('OperationPoint');
    expect(ok(s, point({ persons: ['A', 'B'] }))).toBe(true);
    expect(ok(s, point({ persons: [] }))).toBe(false);
    expect(ok(s, point({ persons: 'A' }))).toBe(false);
    expect(ok(s, point({ group: 'x' }))).toBe(false);
    expect(ok(s, omit(point(), 'location'))).toBe(false);
  });
  it('CT-43: CompanyProfile requires every field and a valid email', () => {
    const s = schema('CompanyProfile');
    for (const k of ['legal_name', 'license_tax', 'vat', 'phone', 'email']) expect(ok(s, omit(profile(), k)), `missing ${k}`).toBe(false);
    expect(ok(s, profile({ email: 'nope' }))).toBe(false);
  });
  it('CT-43: ContactPage accepts null files and a null map_embed_url, rejects bad urls, non-uuid files and incomplete translations', () => {
    const s = schema('ContactPage');
    expect(ok(s, pageRec({ hero_image: null, map_embed_url: null, map_open_url: null }))).toBe(true);
    expect(ok(s, pageRec({ map_embed_url: 'https://maps.example.com/embed' }))).toBe(true);
    expect(ok(s, pageRec({ map_embed_url: 'not a url' }))).toBe(false);
    expect(ok(s, pageRec({ hero_image: 'not-a-uuid' }))).toBe(false);
    expect(ok(s, pageRec({ translations: [omit(realT(), 'seo_title')] }))).toBe(false);
    expect(ok(s, pageRec({ translations: [{ ...realT(), notice_blocks: [{ lead: 'only lead' }] }] }))).toBe(false);
    expect(ok(s, pageRec({ translations: [{ ...realT(), notice_blocks: [] }] }))).toBe(true);
  });
});

describe('Lead contract with the Contact fields (spec 3.7)', () => {
  it('CT-27: LeadInput keeps service_type, estimated_volume and message (they are part of the contract)', () => {
    const r = LeadInput.safeParse({ ...omit(validLeadInput, 'company', 'country', 'job_title'), service_type: 'logistic-service', estimated_volume: '50 containers/month', message: 'Test brief' });
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({ service_type: 'logistic-service', estimated_volume: '50 containers/month', message: 'Test brief' });
  });
  it('CT-27: LeadInput accepts the lead without the 3 optional contact fields', () => {
    expect(LeadInput.safeParse(omit(validLeadInput, 'company', 'country', 'job_title')).success).toBe(true);
  });
  it.each(['service_type', 'estimated_volume'])('CT-27: LeadInput rejects %s longer than 120 and accepts exactly 120', (k) => {
    const o = omit(validLeadInput, 'company', 'country', 'job_title');
    expect(LeadInput.safeParse({ ...o, [k]: 'a'.repeat(121) }).success).toBe(false);
    expect(LeadInput.safeParse({ ...o, [k]: 'a'.repeat(120) }).success).toBe(true);
  });
  it('CT-27: LeadInput trims service_type and estimated_volume', () => {
    const r = LeadInput.safeParse({ ...validLeadInput, service_type: '  freight  ', estimated_volume: ' 50 ' });
    expect(r.data).toMatchObject({ service_type: 'freight', estimated_volume: '50' });
  });
  it('CT-27: the stored Lead accepts source_page /en/contact and the two extra fields', () => {
    const r = Lead.safeParse({ ...validLead, source_page: '/en/contact', service_type: 'logistic-service', estimated_volume: '50', message: 'm' });
    expect(r.success).toBe(true);
    expect(r.data).toMatchObject({ source_page: '/en/contact', service_type: 'logistic-service', estimated_volume: '50' });
  });
});

// ---------------------------------------------------------------------------------------------
// CMS getters (CT-43)
// ---------------------------------------------------------------------------------------------
const listGetters = [
  ['getContactPersons', 'ContactPerson', 'role'],
  ['getOperationGroups', 'OperationGroup', 'label'],
  ['getOpeningHours', 'OpeningHours', 'title'],
] as const;

describe.each(listGetters)('Contact getter %s (CT-43)', (name, schemaName, field) => {
  it('CT-43: returns only published records, sorted by `sort`, unique uuid ids', async () => {
    const rows = asList(await getter(name)('en'));
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.status === 'published')).toBe(true);
    const keys = rows.map(sortKey);
    expect(keys.every((k, i) => i === 0 || keys[i - 1] <= k)).toBe(true);
    const ids = rows.map((r) => r.id as string);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(UUID_RE);
  });
  it('CT-43: every record passes its Zod contract', async () => {
    for (const r of asList(await getter(name)('en'))) {
      const res = schema(schemaName).safeParse(r);
      expect(res.success, `${name} record ${String(r.id)}`).toBe(true);
    }
  });
  it('CT-43: translations resolve to English text; a vi request falls back to the same strings; unknown locale does not throw', async () => {
    const en = asList(await getter(name)('en'));
    const vi = asList(await getter(name)('vi'));
    expect(vi.length).toBe(en.length);
    en.forEach((r, i) => {
      const t = text(r, field);
      expect(typeof t).toBe('string');
      expect((t as string).length).toBeGreaterThan(0);
      expect(translationsAreResolved(r, 'en')).toBe(true);
      expect(text(vi[i], field)).toBe(t);
      expect(translationsAreResolved(vi[i], 'vi')).toBe(true);
    });
    await expect(getter(name)('zz')).resolves.toBeDefined();
  });
});

describe('Contact getContactPersons content (CT-13..CT-15, CT-43)', () => {
  const expected = [
    ['Linh Pham', 'General Director', 'linhpham@saigontrans.com.vn', '101', 0, null],
    ['Tieu Dieu', 'Chief Accountant', 'tieudieu@saigontrans.com.vn', '302', 1, 1],
    ['Khoa Pham', 'Vice Director', 'khoapham@saigontrans.com.vn', '102', 1, 2],
    ['Trang Anh', 'Import Manager', 'tranganh@saigontrans.com.vn', '201', 1, 3],
    ['Nhu Quynh', 'Import Chemical', 'quynhnhu@saigontrans.com.vn', '205', 1, 4],
    ['Huong Nguyen', 'Control Debit Note', 'huongnguyen@saigontrans.com.vn', '301', 2, 1],
    ['Truc Long', 'Export Manager', 'truclong@saigontrans.com.vn', '202', 2, 3],
  ] as const;
  it('CT-43: the 7 people in sort order with name, role, email, extension, level and column', async () => {
    const rows = asList(await getter('getContactPersons')('en'));
    expect(rows).toHaveLength(7);
    expected.forEach(([name, role, email, ext, level, column], i) => {
      expect(rows[i].full_name).toBe(name);
      expect((text(rows[i], 'role') as string).toLowerCase()).toBe(role.toLowerCase());
      expect(rows[i].email).toBe(email);
      expect(rows[i].extension).toBe(ext);
      expect(rows[i].level).toBe(level);
      expect(rows[i].column).toBe(column);
    });
  });
});

describe('Contact getOperationGroups content (CT-20, CT-43)', () => {
  it('CT-43: 4 groups with panel, label and nested points (location, persons)', async () => {
    const rows = asList(await getter('getOperationGroups')('en'));
    expect(rows.map((g) => (text(g, 'label') as string).toLowerCase())).toEqual(['airport terminals', 'sea & land', 'warehousing', 'economic zones']);
    expect(rows.map((g) => g.panel)).toEqual([1, 1, 2, 2]);
    const pointsOf = (g: Rec) => {
      const arr = Object.entries(g).find(([k, v]) => k !== 'translations' && Array.isArray(v) && (v as Rec[]).every((p) => p && typeof p === 'object' && 'location' in p));
      return (arr?.[1] ?? []) as Rec[];
    };
    const flat = rows.map((g) => pointsOf(g).map((p) => [p.location, p.persons]));
    expect(flat).toEqual([
      [['TCS Airport', ['Pham Trung Nghia']], ['SCSC Airport', ['Le Van Hoang']]],
      [['Cat Lai Terminal', ['Ho Vu Khuong', 'Vo Dien Kim']]],
      [['Bonded Warehouse TBS', ['Nguyen Van Ty']]],
      [['Tan Thuan EPZ', ['Doan Cong Danh']]],
    ]);
    rows.forEach((g) => pointsOf(g).forEach((p) => {
      if ('group' in p) expect(p.group).toBe(g.id);
      expect(schema('OperationPoint').safeParse(p).success, 'nested point passes OperationPoint').toBe(true);
    }));
  });
});

describe('Contact getOpeningHours, getCompanyProfile, getOffices, getContactPage content (CT-7, CT-12, CT-43)', () => {
  it('CT-43: opening hours are Business Hours then Customs Hours', async () => {
    const rows = asList(await getter('getOpeningHours')('en'));
    expect(rows.map((r) => [text(r, 'title'), text(r, 'days'), r.time_range])).toEqual([
      ['Business Hours', 'Mon-Fri', '08:00 - 18:00'],
      ['Customs Hours', 'Mon-Fri', '07:30 - 17:00'],
    ]);
  });
  it('CT-43: company profile carries the legal name, licence, VAT, phone and email and passes its contract', async () => {
    const [p] = asList(await getter('getCompanyProfile')('en'));
    expect(p).toMatchObject({ legal_name: 'SAIGONTRANSERVICE', license_tax: '4102001961/GP-HCM', vat: '0302070998', phone: '(84) 028 38233 068', email: 'linhpham@saigontrans.com.vn' });
    expect(schema('CompanyProfile').safeParse(p).success).toBe(true);
    expect(p.status).toBe('published');
  });
  it('CT-43: getOffices lists Main Office and Operation Office with their addresses, passes ContactOffice', async () => {
    const rows = asList(await getter('getOffices')('en'));
    const find = (n: string) => rows.find((r) => String(text(r, 'name')).toLowerCase() === n);
    expect(find('main office') && text(find('main office')!, 'address')).toBe('45 Dinh Tien Hoang Street, Saigon Ward, Ho Chi Minh City');
    expect(find('operation office') && text(find('operation office')!, 'address')).toBe('19 To Huu, Lakeview 1, An Khanh Ward, HCMC');
    expect(sortKey(find('main office')!)).toBeLessThan(sortKey(find('operation office')!));
    for (const r of rows) expect(r.status).toBe('published');
    for (const r of rows) expect(schema('ContactOffice').safeParse(r).success, `office ${String(r.id)}`).toBe(true);
  });
  it('CT-43: the ContactPage singleton is published, passes its contract, has the spec texts, resolves vi to the same strings', async () => {
    const pages = asList(await getter('getContactPage')('en'));
    expect(pages).toHaveLength(1);
    const p = pages[0];
    expect(p.status).toBe('published');
    expect(schema('ContactPage').safeParse(p).success).toBe(true);
    const want: Record<string, string> = {
      seo_title: 'Contact Us | Saigon Trans', hero_title: 'CONTACT US', hero_subtitle: 'We are here to support your logistics needs', map_chip: 'ACTIVE HUB: HCMC',
      leadership_eyebrow: 'Our Leadership', leadership_title: 'Key Logistics Contacts', operations_title: 'Operation Key Persons', quote_title: 'Request a Project Quote',
      quote_photo_title: 'Kinetic Efficiency', quote_photo_text: "Leveraging Vietnam's strategic position with precision logistics and real-time manifest tracking.",
      notice_label: 'NOTICE', notice_title: 'Custom working hours:',
    };
    for (const [k, v] of Object.entries(want)) expect(text(p, k), k).toBe(v);
    for (const k of ['seo_description', 'map_alt', 'quote_photo_alt', 'quote_intro']) expect(String(text(p, k)).trim().length, k).toBeGreaterThan(0);
    expect(String(text(p, 'quote_intro')), 'build-guide decision 2: no response-time promise').not.toMatch(/4 hours|within/i);
    expect(text(p, 'notice_blocks')).toEqual([
      { lead: 'Normally effective time for clearance formalities:', text: 'Monday – Friday: 07:30 hour – 17:00hour' },
      { lead: 'Customs offers on-duty', text: 'during week-end and holidays available up to pre-arrangement and depending on a' },
    ]);
    const [pvi] = asList(await getter('getContactPage')('vi'));
    for (const k of Object.keys(want)) expect(text(pvi, k), `vi fallback ${k}`).toBe(text(p, k));
  });
});

// ---------------------------------------------------------------------------------------------
// Contact form through the shared submitQuote action (source=contact)
// ---------------------------------------------------------------------------------------------
let n = 0;
const uniqueIp = () => {
  n += 1;
  return `10.${100 + ((n >> 16) & 100)}.${(n >> 8) & 255}.${n & 255}`;
};

function contactForm(patch: Record<string, string | undefined> = {}) {
  const fd = new FormData();
  const all: Record<string, string | undefined> = {
    first_name: 'An', last_name: 'Nguyen', email: 'an@example.com', phone: '0901234567', locale: 'en', website: '', source: 'contact', ...patch,
  };
  for (const [k, v] of Object.entries(all)) if (v !== undefined) fd.set(k, v);
  return fd;
}
const full = { service_type: 'logistic-service', estimated_volume: '50 containers/month', message: 'Test brief' };

beforeEach(async () => {
  await resetLeads();
  ctx.ip = uniqueIp();
});

describe('Contact form via submitQuote (CT-26..CT-35)', () => {
  it('CT-26: required fields only -> ok, one lead with source_page /en/contact, locale en and the typed values', async () => {
    expect(await submitQuote(contactForm())).toEqual({ ok: true });
    const leads = await listLeads();
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({ first_name: 'An', last_name: 'Nguyen', email: 'an@example.com', phone: '0901234567', locale: 'en', source_page: '/en/contact' });
    expect(['pending', 'sent']).toContain(leads[0].email_status);
    expect('website' in leads[0]).toBe(false);
    expect(Lead.safeParse(leads[0]).success).toBe(true);
    expect(getSentCount()).toBe(1);
  });

  it('CT-27: service_type, estimated_volume and message are kept on the stored lead', async () => {
    expect(await submitQuote(contactForm(full))).toEqual({ ok: true });
    const [lead] = await listLeads();
    expect(lead).toMatchObject({ ...full, source_page: '/en/contact' });
    expect(Lead.safeParse(lead).success).toBe(true);
  });

  it('CT-27: the extra fields are trimmed', async () => {
    await submitQuote(contactForm({ service_type: '  logistic-service ', estimated_volume: '  50  ' }));
    expect(await listLeads()).toMatchObject([{ service_type: 'logistic-service', estimated_volume: '50' }]);
  });

  it('CT-27: empty optional fields (service_type, estimated_volume, message) are not errors', async () => {
    expect(await submitQuote(contactForm({ service_type: '', estimated_volume: '', message: '' }))).toEqual({ ok: true });
    expect(await listLeads()).toHaveLength(1);
  });

  it('CT-27: every published service slug is accepted as service_type', async () => {
    const { getServices } = await import('@/lib/cms');
    const services = (await getServices('en')) as Rec[];
    expect(services.length).toBeGreaterThan(0);
    for (const s of services) {
      expect(await submitQuote(contactForm({ service_type: s.slug as string }))).toEqual({ ok: true });
    }
    const stored = (await listLeads()).map((l) => (l as Rec).service_type);
    expect(stored.sort()).toEqual(services.map((s) => s.slug as string).sort());
  });

  it.each(['service_type', 'estimated_volume'])('CT-27: %s over 120 characters is rejected with an error keyed to it, nothing stored', async (k) => {
    const res = await submitQuote(contactForm({ [k]: 'a'.repeat(121) }));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(Object.keys(res.errors)).toEqual([k]);
    expect(await listLeads()).toHaveLength(0);
  });

  it('CT-27: message over 4000 characters is rejected under `message`', async () => {
    const res = await submitQuote(contactForm({ message: 'a'.repeat(4001) }));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(Object.keys(res.errors)).toEqual(['message']);
  });

  it('CT-28: an empty Contact form reports the 4 required fields only', async () => {
    const res = await submitQuote(contactForm({ first_name: '', last_name: '', email: '', phone: '' }));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(Object.keys(res.errors).sort()).toEqual(['email', 'first_name', 'last_name', 'phone']);
    for (const k of ['service_type', 'estimated_volume', 'message']) expect(res.errors).not.toHaveProperty(k);
    expect(await listLeads()).toHaveLength(0);
    expect(getSentCount()).toBe(0);
  });

  it('CT-29: invalid email -> only the email error, nothing stored', async () => {
    const res = await submitQuote(contactForm({ ...full, email: 'not-an-email' }));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(Object.keys(res.errors)).toEqual(['email']);
    expect(await listLeads()).toHaveLength(0);
  });

  it('CT-30: filled honeypot -> ok:true, nothing stored, mail transport not called', async () => {
    const transport = vi.fn(async () => {});
    setMailTransport(transport);
    expect(await submitQuote(contactForm({ ...full, website: 'http://spam.example' }))).toEqual({ ok: true });
    expect(await listLeads()).toHaveLength(0);
    expect(transport).not.toHaveBeenCalled();
    expect(getSentCount()).toBe(0);
  });

  it('CT-31: 5 valid contact submissions pass, the 6th is rejected under `form` and not stored; invalid ones did not count', async () => {
    for (let i = 0; i < 4; i++) expect((await submitQuote(contactForm({ email: 'bad' }))).ok).toBe(false);
    for (let i = 1; i <= 5; i++) expect(await submitQuote(contactForm({ last_name: `L${i}` }))).toEqual({ ok: true });
    const sixth = await submitQuote(contactForm({ last_name: 'L6' }));
    expect(sixth.ok).toBe(false);
    if (sixth.ok) return;
    expect(Object.keys(sixth.errors)).toEqual(['form']);
    expect(sixth.errors.form.length).toBeGreaterThan(10);
    const leads = await listLeads();
    expect(leads).toHaveLength(5);
    expect(leads.map((l) => l.last_name)).not.toContain('L6');
  });

  it('CT-32: a throwing mail transport still gives ok:true; the lead (with its extra fields) is kept with email_status failed', async () => {
    setMailTransport(async () => {
      throw new Error('smtp down');
    });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const res = await submitQuote(contactForm(full));
    spy.mockRestore();
    warn.mockRestore();
    expect(res).toEqual({ ok: true });
    const leads = await listLeads();
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({ ...full, source_page: '/en/contact', email_status: 'failed' });
  });

  it('CT-26: the lead is stored before the transport runs and the transport receives the contact lead', async () => {
    const seen: { stored: number; lead: Rec }[] = [];
    setMailTransport(async (lead) => {
      seen.push({ stored: (await listLeads()).length, lead: lead as unknown as Rec });
    });
    await submitQuote(contactForm(full));
    expect(seen).toHaveLength(1);
    expect(seen[0].stored).toBe(1);
    expect(seen[0].lead).toMatchObject({ source_page: '/en/contact', ...full });
  });

  it('CT-35: without source=contact the lead keeps the Home value /en', async () => {
    await submitQuote(contactForm({ source: undefined }));
    const [lead] = await listLeads();
    expect(lead.source_page).toBe('/en');
  });

  it('CT-35: a Home-style submission (all Home fields, no source) is not stored as /en/contact', async () => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(validLeadInput)) fd.set(k, v);
    await submitQuote(fd);
    expect((await listLeads())[0].source_page).not.toBe('/en/contact');
  });

  it('CT-35: a contact submission does not change the source of the next Home submission', async () => {
    await submitQuote(contactForm());
    const fd = new FormData();
    for (const [k, v] of Object.entries(validLeadInput)) fd.set(k, v);
    await submitQuote(fd);
    const leads = await listLeads();
    expect(leads).toHaveLength(2);
    expect(leads.filter((l) => l.source_page === '/en/contact')).toHaveLength(1);
  });

  it('CT-26: an unknown `source` value can never become an arbitrary source_page', async () => {
    await submitQuote(contactForm({ source: 'evil<script>' }));
    const leads = await listLeads();
    if (leads.length) expect(String(leads[0].source_page)).not.toContain('evil');
  });
});

// ---------------------------------------------------------------------------------------------
// CT-42: no page text literals in components or app files
// ---------------------------------------------------------------------------------------------
describe('Contact: no text literals in src/components or src/app (CT-42)', () => {
  const literals = [
    'Key Logistics Contacts', 'Linh Pham', 'Operation Key Persons', 'SAIGONTRANSERVICE', 'Request a Project Quote', 'Kinetic Efficiency',
    'Business Hours', 'Customs Hours', 'Dinh Tien Hoang', '4102001961', 'We are here to support your logistics needs', 'Select Logistics Service',
    'Initialize Inquiry', 'Describe your logistics challenges', 'ACTIVE HUB', 'Custom working hours', 'Our Leadership', 'Pham Trung Nghia', 'Tieu Dieu',
  ];
  const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  it('CT-42: none of the section 2-3 literals appears in a .ts/.tsx file under src/components or src/app', () => {
    const files = [
      ...walk(path.join(REPO_ROOT, 'src/components'), (rel) => rel.includes('node_modules')),
      ...walk(path.join(REPO_ROOT, 'src/app'), (rel) => rel.includes('node_modules')),
    ].filter((f) => /\.(ts|tsx)$/.test(f));
    expect(files.length).toBeGreaterThan(0);
    const hits: string[] = [];
    for (const f of files) {
      const src = stripComments(fs.readFileSync(f, 'utf8')).toLowerCase();
      for (const l of literals) if (src.includes(l.toLowerCase())) hits.push(`${path.relative(REPO_ROOT, f)}: "${l}"`);
    }
    expect(hits).toEqual([]);
  });
});
