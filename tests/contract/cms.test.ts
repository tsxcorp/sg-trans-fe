import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  getStats, getServices, getPartners, getLatestNews, getOffices, createLead, assetUrl,
} from '@/lib/cms';
import { Lead, type Locale, type LeadInputT } from '@/lib/cms/schema';
import { text, translationsAreResolved, sortKey, type Rec } from '../helpers/cms';
import { validLeadInput, UUID_A, UUID_B } from '../helpers/fixtures';

const locale = fc.constantFrom('en', 'vi');
const RUNS = { numRuns: 30 };

const localised = [
  ['getStats', (l: string) => getStats(l as Locale), 'label'],
  ['getServices', (l: string) => getServices(l as Locale), 'title'],
  ['getOffices', (l: string) => getOffices(l as Locale), 'name'],
] as const;

const allGetters = [
  ...localised.map(([n, f]) => [n, f] as const),
  ['getPartners', () => getPartners()] as const,
  ['getLatestNews', (l: string) => getLatestNews(l as Locale, 100)] as const,
];

describe.each(allGetters)('lib/cms %s (S4, DoD4)', (_name, fn: (l: string) => Promise<Rec[]>) => {
  it('S4: returns only status=published (property over locales)', async () => {
    await fc.assert(
      fc.asyncProperty(locale, async (l) => (await fn(l)).every((r) => r.status === 'published')),
      RUNS,
    );
  });
  it('S4: sorted by `sort` ascending, null last', async () => {
    await fc.assert(
      fc.asyncProperty(locale, async (l) => {
        const keys = (await fn(l)).map(sortKey);
        return keys.every((k, i) => i === 0 || keys[i - 1] <= k);
      }),
      RUNS,
    );
  });
  it('S4: every record has a uuid id and ids are unique', async () => {
    const rows = await fn('en');
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
  it('S2: never throws for any supported locale and returns an array', async () => {
    await fc.assert(
      fc.asyncProperty(locale, async (l) => Array.isArray(await fn(l))),
      RUNS,
    );
  });
});

describe.each(localised)('lib/cms %s locale resolution (S2)', (_n, fn, field) => {
  it('S2: en returns non-empty resolved text for each record', async () => {
    const rows = (await fn('en')) as Rec[];
    for (const r of rows) {
      const t = text(r, field);
      expect(typeof t).toBe('string');
      expect((t as string).length).toBeGreaterThan(0);
      expect(translationsAreResolved(r, 'en')).toBe(true);
    }
  });
  it('S2: a locale without translations falls back to en (same records, non-empty text, no throw)', async () => {
    await fc.assert(
      fc.asyncProperty(locale, async (l) => {
        const rows = (await fn(l)) as Rec[];
        const en = (await fn('en')) as Rec[];
        return (
          rows.length === en.length &&
          rows.every((r) => typeof text(r, field) === 'string' && (text(r, field) as string).length > 0 && translationsAreResolved(r, l))
        );
      }),
      RUNS,
    );
  });
  it('S2: an unsupported locale value does not throw (falls back)', async () => {
    await expect(fn('zz')).resolves.toBeInstanceOf(Array);
  });
});

describe('lib/cms getStats (S4)', () => {
  it('S4: each stat exposes a value and an as_of date from data', async () => {
    const rows = (await getStats('en')) as Rec[];
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect(typeof r.value).toBe('string');
      expect(r.as_of).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('lib/cms getLatestNews (DoD4)', () => {
  it('DoD4: returns at most n items (property)', async () => {
    await fc.assert(
      fc.asyncProperty(locale, fc.integer({ min: -3, max: 30 }), async (l, n) => {
        const rows = await getLatestNews(l as Locale, n);
        return rows.length <= Math.max(n, 0);
      }),
      RUNS,
    );
  });
  it('DoD4: newest first by published_at (property)', async () => {
    await fc.assert(
      fc.asyncProperty(locale, fc.integer({ min: 1, max: 30 }), async (l, n) => {
        const dates = (await getLatestNews(l as Locale, n) as Rec[]).map((r) => Date.parse(r.published_at as string));
        return dates.every((d, i) => !Number.isNaN(d) && (i === 0 || dates[i - 1] >= d));
      }),
      RUNS,
    );
  });
  it('DoD4: only published items (property)', async () => {
    await fc.assert(
      fc.asyncProperty(locale, fc.integer({ min: 1, max: 30 }), async (l, n) =>
        ((await getLatestNews(l as Locale, n)) as Rec[]).every((r) => r.status === 'published')),
      RUNS,
    );
  });
  it('DoD4: smaller n is a prefix of larger n', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 10 }), fc.integer({ min: 0, max: 10 }), async (n, k) => {
        const a = ((await getLatestNews('en', n)) as Rec[]).map((r) => r.id);
        const b = ((await getLatestNews('en', n + k)) as Rec[]).map((r) => r.id);
        return a.every((id, i) => b[i] === id);
      }),
      RUNS,
    );
  });
  it.each([0, -1, -100])('DoD4: n=%i returns [] without throwing', async (n) => {
    await expect(getLatestNews('en', n)).resolves.toEqual([]);
  });
  it('DoD4: non-integer n (2.7) never throws and respects the bound', async () => {
    const rows = await getLatestNews('en', 2.7);
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeLessThanOrEqual(3);
  });
  it('S2: news text resolves to non-empty title for en and for vi (fallback)', async () => {
    for (const l of ['en', 'vi']) {
      for (const r of (await getLatestNews(l as Locale, 10)) as Rec[]) {
        expect((text(r, 'title') as string).length).toBeGreaterThan(0);
        expect(translationsAreResolved(r, l)).toBe(true);
      }
    }
  });
});

describe('lib/cms assetUrl (S4)', () => {
  it('S4: returns a non-empty string for a uuid (property)', () => {
    fc.assert(fc.property(fc.uuid(), (id) => {
      const u = assetUrl(id);
      return typeof u === 'string' && u.length > 0;
    }));
  });
  it('S4: url contains the file id and differs per id', () => {
    expect(assetUrl(UUID_A)).toContain(UUID_A);
    expect(assetUrl(UUID_A)).not.toBe(assetUrl(UUID_B));
  });
});

describe('lib/cms createLead (S3)', () => {
  it('S3: valid input returns a Lead with email_status pending', async () => {
    const lead = await createLead(validLeadInput as LeadInputT);
    expect(Lead.safeParse(lead).success).toBe(true);
    expect((lead as Rec).email_status).toBe('pending');
    expect((lead as Rec).email).toBe(validLeadInput.email);
    expect('website' in (lead as Rec)).toBe(false);
  });
  it('S3: two leads get different ids', async () => {
    const a = (await createLead(validLeadInput as LeadInputT)) as Rec;
    const b = (await createLead(validLeadInput as LeadInputT)) as Rec;
    expect(a.id).not.toBe(b.id);
  });
  it('S3: valid input without message is accepted', async () => {
    expect('message' in validLeadInput).toBe(false);
    const lead = await createLead(validLeadInput as LeadInputT);
    expect(Lead.safeParse(lead).success).toBe(true);
  });
  it.each([
    ['bad email', { email: 'nope' }],
    ['empty first_name', { first_name: '' }],
    ['over-length message', { message: 'a'.repeat(4001) }],
    ['filled honeypot', { website: 'http://spam.example' }],
  ])('S3: rejects %s (throws or returns a non-Lead)', async (_n, patch) => {
    const out = await createLead({ ...validLeadInput, ...patch } as LeadInputT).then((v) => v, (e) => e);
    expect(Lead.safeParse(out).success).toBe(false);
  });
});
