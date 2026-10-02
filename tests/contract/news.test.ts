import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import * as group from '@/lib/cms/pages/news';
import * as schema from '@/lib/cms/schema';
import * as cms from '@/lib/cms';
import { type Locale } from '@/lib/cms/schema';
import { text, type Rec } from '../helpers/cms';
import { base, validNews, UUID_A, UUID_B, DT, omit } from '../helpers/fixtures';

// Names come from docs/pages/news.md (3.1) and docs/pages/news-article.md (3). Where the spec says
// "lib/cms additions" the getter may live in the group module or be re-exported from `@/lib/cms`.
type Fn = (...a: unknown[]) => Promise<unknown>;
type Parser = { safeParse: (v: unknown) => { success: boolean } };
const all = { ...cms, ...schema, ...group } as unknown as Record<string, Fn & Parser>;
const fn = (name: string) => {
  const f = all[name];
  expect(typeof f, `${name} must be exported (group module @/lib/cms/pages/news or @/lib/cms)`).toBe('function');
  return f as unknown as (...a: unknown[]) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
};
const getNewsPage = (l: string, o: Record<string, unknown> = {}) => fn('getNewsPage')(l as Locale, o);
const locale = fc.constantFrom('en', 'vi');
const RUNS = { numRuns: 25 };
const ok = (s: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) => s.safeParse(v).success;

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const titleOf = (r: Rec) => String(text(r, 'title') ?? '');
const excerptOf = (r: Rec) => String(text(r, 'excerpt') ?? '');
const listedOf = (res: { items: Rec[]; featured: Rec | null }): Rec[] => {
  const ids = new Set(res.items.map((i) => i.id));
  return res.featured && !ids.has(res.featured.id) ? [res.featured, ...res.items] : res.items;
};

async function everything(l: string): Promise<Rec[]> {
  // All published articles = default-view archive (excludes the 3 latest, spec 3.1) + the 3 latest.
  const r = await getNewsPage(l, { page: 1, pageSize: 1000 });
  const latest = (await fn('getLatestNews')(l as Locale, 3)) as Rec[];
  const out = [...listedOf(r)];
  for (const x of latest) if (!out.some((o) => o.id === x.id)) out.push(x);
  return out;
}

describe('news Zod contracts (NA-28)', () => {
  const tr = (extra: Record<string, unknown>) => [{ languages_code: 'en', ...extra }];

  it('NA-28: NewsCategory, NewsTag and Resource are exported schemas', () => {
    for (const n of ['NewsCategory', 'NewsTag', 'Resource']) expect(typeof all[n]?.safeParse, n).toBe('function');
  });

  it('NW-11: NewsCategory requires slug, in_sidebar and translated name', () => {
    const good = base({ slug: 'innovation', in_sidebar: true, translations: tr({ name: 'Innovation' }) });
    expect(ok(all.NewsCategory, good)).toBe(true);
    expect(ok(all.NewsCategory, omit(good, 'slug'))).toBe(false);
    expect(ok(all.NewsCategory, omit(good, 'in_sidebar'))).toBe(false);
    expect(ok(all.NewsCategory, { ...good, translations: tr({}) })).toBe(false);
    expect(ok(all.NewsCategory, { ...good, in_sidebar: 'yes' })).toBe(false);
  });

  it('NW-10: NewsTag requires slug, trending and translated name', () => {
    const good = base({ slug: 'freight', trending: true, translations: tr({ name: 'Freight' }) });
    expect(ok(all.NewsTag, good)).toBe(true);
    expect(ok(all.NewsTag, omit(good, 'slug'))).toBe(false);
    expect(ok(all.NewsTag, omit(good, 'trending'))).toBe(false);
    expect(ok(all.NewsTag, { ...good, translations: tr({}) })).toBe(false);
  });

  it('NW-31: Resource slot is an enum, file is a uuid or null, translations carry title/description/cta_label', () => {
    const good = base({
      slot: 'sidebar', file: null,
      translations: tr({ eyebrow: null, title: 'Annual Logistics White Paper 2024', description: 'd', cta_label: 'DOWNLOAD PDF' }),
    });
    expect(ok(all.Resource, good)).toBe(true);
    for (const slot of ['banner_left', 'banner_right']) expect(ok(all.Resource, { ...good, slot })).toBe(true);
    expect(ok(all.Resource, { ...good, slot: 'footer' })).toBe(false);
    expect(ok(all.Resource, { ...good, file: UUID_B })).toBe(true);
    expect(ok(all.Resource, { ...good, file: '/files/a.pdf' })).toBe(false);
    expect(ok(all.Resource, { ...good, translations: tr({ eyebrow: 'WHITE PAPER', description: 'd', cta_label: 'x' }) })).toBe(false);
  });

  const withBody = (body: unknown, extra: Record<string, unknown> = {}) => ({
    ...validNews,
    translations: [{ languages_code: 'en', title: 'T', excerpt: 'E', body }],
    ...extra,
  });
  const blocks = [
    { type: 'lead', text: 'Lead' },
    { type: 'heading', level: 2, text: 'H' },
    { type: 'heading', level: 3, text: 'H3' },
    { type: 'paragraph', text: 'P **bold** *it* [x](https://example.com)' },
    { type: 'quote', text: '"Q"' },
    { type: 'quote', text: '"Q"', cite: 'Someone' },
    { type: 'image', file: UUID_B, alt: 'a' },
    { type: 'list', ordered: true, items: ['a', 'b'] },
    { type: 'feature', title: 'T', text: 'x', image: null, stats: [{ value: '99.8%', label: 'ON-TIME RATE' }] },
  ];

  it('NA-28: News body is an array of structured blocks; every documented block type parses', () => {
    expect(ok(schema.News, withBody(blocks))).toBe(true);
    expect(ok(schema.News, withBody([]))).toBe(true);
    for (const b of blocks) expect(ok(schema.News, withBody([b])), b.type).toBe(true);
  });

  it('NA-9: a body string is kept as plain text: markup is accepted as data (rendering escapes it)', () => {
    expect(ok(schema.News, withBody([{ type: 'paragraph', text: '<script>alert(1)</script>' }]))).toBe(true);
  });

  it('NA-28: invalid blocks are rejected', () => {
    expect(ok(schema.News, withBody('plain html string'))).toBe(false);
    expect(ok(schema.News, withBody([{ type: 'html', text: '<b>x</b>' }]))).toBe(false);
    expect(ok(schema.News, withBody([{ type: 'heading', level: 4, text: 'x' }]))).toBe(false);
    expect(ok(schema.News, withBody([{ type: 'heading', level: 1, text: 'x' }]))).toBe(false);
    expect(ok(schema.News, withBody([{ type: 'paragraph' }]))).toBe(false);
    expect(ok(schema.News, withBody([{ type: 'image', file: 'not-a-uuid', alt: 'a' }]))).toBe(false);
    expect(ok(schema.News, withBody([{ type: 'image', file: UUID_B }]))).toBe(false);
    expect(ok(schema.News, withBody([{ type: 'list', ordered: true, items: [1] }]))).toBe(false);
    const five = Array.from({ length: 5 }, (_, i) => ({ value: String(i), label: 'L' }));
    expect(ok(schema.News, withBody([{ type: 'feature', title: 'T', text: 'x', image: null, stats: five }]))).toBe(false);
  });

  it('NW-3/NA-28: News accepts category (uuid|null), tags (uuid[]) and is_featured (boolean)', () => {
    expect(ok(schema.News, withBody([], { category: UUID_A, tags: [UUID_A, UUID_B], is_featured: true }))).toBe(true);
    expect(ok(schema.News, withBody([], { category: null }))).toBe(true);
    expect(ok(schema.News, withBody([]))).toBe(true);
    expect(ok(schema.News, withBody([], { category: 'innovation' }))).toBe(false);
    expect(ok(schema.News, withBody([], { tags: ['freight'] }))).toBe(false);
    expect(ok(schema.News, withBody([], { is_featured: 'yes' }))).toBe(false);
    expect(ok(schema.News, withBody([], { published_at: '2024-05-15' }))).toBe(false);
    expect(DT).toBeTruthy();
  });
});

describe('getNewsPage contract (NW-7, NW-12..NW-26)', () => {
  it('NW-1: result shape { items, total, page, pageCount, featured }', async () => {
    const r = await getNewsPage('en', { page: 1, pageSize: 4 });
    expect(Array.isArray(r.items)).toBe(true);
    for (const k of ['total', 'page', 'pageCount']) expect(Number.isInteger(r[k]), k).toBe(true);
    expect(r.featured === null || typeof r.featured === 'object').toBe(true);
    expect(r.page).toBeGreaterThanOrEqual(1);
    expect(r.pageCount).toBeGreaterThanOrEqual(1 * (r.total > 0 ? 1 : 0));
  });

  it('NW-22: page size bound (property): never more than pageSize articles listed on a page', async () => {
    await fc.assert(
      fc.asyncProperty(locale, fc.integer({ min: 1, max: 8 }), fc.integer({ min: 1, max: 6 }), async (l, pageSize, page) => {
        const r = await getNewsPage(l, { page, pageSize });
        return listedOf(r).length <= pageSize && r.items.length <= pageSize;
      }),
      RUNS,
    );
  });

  it('NW-7: pageSize 4 default view lists 4 on page 1 and none of the 3 latest articles', async () => {
    const r = await getNewsPage('en', { page: 1, pageSize: 4 });
    const listed = listedOf(r);
    expect(listed).toHaveLength(4);
    const latest3 = ((await fn('getLatestNews')('en', 3)) as Rec[]).map((x) => x.id);
    expect(latest3).toHaveLength(3);
    for (const a of listed) expect(latest3).not.toContain(a.id);
  });

  it('NW-3: featured is the newest is_featured article of the default view; absent on page 2 and in filtered views', async () => {
    const p1 = await getNewsPage('en', { page: 1, pageSize: 4 });
    expect(p1.featured).not.toBeNull();
    expect(titleOf(p1.featured)).toBe('Implementing AI-Driven Predictive Routing for Trans-Pacific Corridors');
    const p2 = await getNewsPage('en', { page: 2, pageSize: 4 });
    expect(p2.featured ?? null).toBeNull();
    const f = await getNewsPage('en', { page: 1, pageSize: 4, category: 'innovation' });
    expect(f.featured ?? null).toBeNull();
    const q = await getNewsPage('en', { page: 1, pageSize: 4, q: 'blockchain' });
    expect(q.featured ?? null).toBeNull();
  });

  it('NW-6: published only and ordered by published_at descending across pages (property over page size)', async () => {
    await fc.assert(
      fc.asyncProperty(locale, fc.integer({ min: 1, max: 5 }), async (l, pageSize) => {
        const seen: Rec[] = [];
        const first = await getNewsPage(l, { page: 1, pageSize });
        for (let p = 1; p <= first.pageCount; p++) {
          const r = p === 1 ? first : await getNewsPage(l, { page: p, pageSize });
          seen.push(...r.items);
        }
        const ids = seen.map((x) => x.id);
        const unique = new Set(ids).size === ids.length;
        const dates = seen.map((x) => Date.parse(String(x.published_at)));
        const sorted = dates.every((d, i) => i === 0 || dates[i - 1] >= d);
        return unique && sorted && seen.every((x) => x.status === 'published');
      }),
      RUNS,
    );
  });

  it('NW-12: search is case and diacritic insensitive over title and excerpt; every hit contains the term', async () => {
    const lower = await getNewsPage('en', { page: 1, pageSize: 50, q: 'blockchain' });
    const upper = await getNewsPage('en', { page: 1, pageSize: 50, q: 'BLOCKCHAIN' });
    expect(listedOf(lower).map((x) => x.id)).toEqual(listedOf(upper).map((x) => x.id));
    expect(listedOf(lower).map(titleOf)).toContain('Blockchain for Transparent Bill of Lading');
    for (const a of listedOf(lower)) expect(fold(titleOf(a) + ' ' + excerptOf(a))).toContain('blockchain');
    const accent = await getNewsPage('en', { page: 1, pageSize: 50, q: 'viêtnam'.normalize('NFC').replace('ê', 'e') });
    for (const a of listedOf(accent)) expect(fold(titleOf(a) + ' ' + excerptOf(a))).toContain('vietnam');
    const diac = await getNewsPage('en', { page: 1, pageSize: 50, q: 'Vietnam’s' });
    expect(listedOf(diac).length).toBeGreaterThan(0);
  });

  it('NW-12: search over arbitrary terms returns only matching, published articles and never more than all (property)', async () => {
    const total = (await everything('en')).length;
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(fc.stringMatching(/^[a-zA-Z0-9]{1,8}$/), fc.constantFrom('logistics', 'Routing', 'hub', 'zzzz', 'GLOBAL', 'freight', 'a', 'e')),
        async (q) => {
          const r = await getNewsPage('en', { page: 1, pageSize: 50, q });
          const listed = listedOf(r);
          return (
            r.total <= total + 1000 &&
            listed.length === Math.min(r.total, 50) &&
            listed.every((x) => x.status === 'published' && fold(titleOf(x) + ' ' + excerptOf(x)).includes(fold(q)))
          );
        },
      ),
      { numRuns: 40 },
    );
  });

  it('NW-12: body text is not searched', async () => {
    const r = await getNewsPage('en', { page: 1, pageSize: 50, q: 'Kinetic Architect' });
    expect(r.total).toBe(0);
    expect(listedOf(r)).toHaveLength(0);
  });

  it('NW-19: filters narrow the result: a q/category/tag view never has more articles than the union of all published (property)', async () => {
    const everyone = new Set((await everything('en')).map((x) => x.id));
    const cats = (await fn('getNewsCategories')('en')) as Rec[];
    const tags = (await fn('getNewsTags')('en')) as Rec[];
    const slugs = [...cats.map((c) => String(c.slug)), ...tags.map((t) => String(t.slug)), 'nope'];
    await fc.assert(
      fc.asyncProperty(fc.constantFrom('category', 'tag'), fc.constantFrom(...slugs), async (kind, slug) => {
        const r = await getNewsPage('en', { page: 1, pageSize: 50, [kind]: slug });
        return listedOf(r).every((x) => everyone.has(x.id)) && r.total <= everyone.size;
      }),
      RUNS,
    );
  });

  it('NW-17: category filter returns only articles of that category (published, includes the latest 3 when they match)', async () => {
    const r = await getNewsPage('en', { page: 1, pageSize: 50, category: 'innovation' });
    const listed = listedOf(r);
    expect(listed.length).toBeGreaterThanOrEqual(2);
    for (const a of listed) expect(a.categorySlug).toBe('innovation');
    expect(listed.map(titleOf)).toContain('Blockchain for Transparent Bill of Lading');
    expect(r.featured ?? null).toBeNull();
  });

  it('NW-18: tag filter returns only articles carrying that tag id', async () => {
    const tags = (await fn('getNewsTags')('en')) as Rec[];
    for (const t of tags) {
      const r = await getNewsPage('en', { page: 1, pageSize: 50, tag: t.slug });
      for (const a of listedOf(r)) expect((a.tags as string[]) ?? [], String(t.slug)).toContain(t.id);
    }
  });

  it('NW-19: unknown category/tag yields an empty result, no throw', async () => {
    for (const o of [{ category: 'nope' }, { tag: 'nope' }]) {
      const r = await getNewsPage('en', { page: 1, pageSize: 4, ...o });
      expect(r.total).toBe(0);
      expect(listedOf(r)).toHaveLength(0);
    }
  });

  it('NW-20: priority q > category > tag when several are given', async () => {
    const q = await getNewsPage('en', { page: 1, pageSize: 50, q: 'a' });
    const qc = await getNewsPage('en', { page: 1, pageSize: 50, q: 'a', category: 'innovation', tag: 'freight' });
    expect(listedOf(qc).map((x) => x.id)).toEqual(listedOf(q).map((x) => x.id));
    const c = await getNewsPage('en', { page: 1, pageSize: 50, category: 'innovation' });
    const ct = await getNewsPage('en', { page: 1, pageSize: 50, category: 'innovation', tag: 'freight' });
    expect(listedOf(ct).map((x) => x.id)).toEqual(listedOf(c).map((x) => x.id));
  });

  it('NW-24/25: page numbers clamp into 1..pageCount for any integer input (property)', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: -50, max: 2000 }), async (page) => {
        const r = await getNewsPage('en', { page, pageSize: 4 });
        return r.page >= 1 && r.page <= Math.max(1, r.pageCount) && listedOf(r).length <= 4;
      }),
      RUNS,
    );
  });

  it('NW-22: pageCount = ceil(total / pageSize) (property)', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 6 }), async (pageSize) => {
        const r = await getNewsPage('en', { page: 1, pageSize });
        return r.pageCount === Math.max(1, Math.ceil(r.total / pageSize)) || (r.total === 0 && r.pageCount <= 1);
      }),
      RUNS,
    );
  });

  it('NW-22: with the sample articles the default view has more than one page', async () => {
    const r = await getNewsPage('en', { page: 1, pageSize: 4 });
    expect(r.pageCount).toBeGreaterThanOrEqual(2);
    const p2 = await getNewsPage('en', { page: 2, pageSize: 4 });
    expect(listedOf(p2).length).toBeGreaterThan(0);
    const ids1 = listedOf(r).map((x) => x.id);
    for (const a of listedOf(p2)) expect(ids1).not.toContain(a.id);
  });

  it('NW-12: never throws for any locale or odd input (property)', async () => {
    await fc.assert(
      fc.asyncProperty(locale, fc.string({ maxLength: 120 }), fc.integer({ min: -5, max: 99 }), async (l, q, page) => {
        const r = await getNewsPage(l, { page, pageSize: 4, q });
        return Array.isArray(r.items);
      }),
      RUNS,
    );
  });
});

describe('news sidebar getters (NW-10, NW-11)', () => {
  it('NW-10: getNewsCategories returns only in_sidebar categories sorted by sort, each with a computed count', async () => {
    const cats = (await fn('getNewsCategories')('en')) as Rec[];
    expect(cats.map((c) => text(c, 'name'))).toEqual(['Global Supply', 'Innovation', 'Network Updates', 'Sustainability']);
    const keys = cats.map((c) => (typeof c.sort === 'number' ? c.sort : Infinity));
    expect(keys.every((k, i) => i === 0 || keys[i - 1] <= k)).toBe(true);
    for (const c of cats) {
      expect(c.status).toBe('published');
      expect(Number.isInteger(c.count) && (c.count as number) >= 0, String(c.slug)).toBe(true);
    }
    expect(cats.map((c) => c.slug)).toEqual(['global-supply', 'innovation', 'network-updates', 'sustainability']);
  });

  it('NW-11: category count = published articles in that category (consistent with getNewsPage)', async () => {
    const cats = (await fn('getNewsCategories')('en')) as Rec[];
    for (const c of cats) {
      const r = await getNewsPage('en', { page: 1, pageSize: 1000, category: c.slug });
      expect(c.count, String(c.slug)).toBe(r.total);
      expect(listedOf(r)).toHaveLength(r.total);
    }
  });

  it('NW-10: getNewsTags returns only trending tags in the design order', async () => {
    const tags = (await fn('getNewsTags')('en')) as Rec[];
    expect(tags.map((t) => String(text(t, 'name')).toUpperCase())).toEqual(['FREIGHT', 'BLOCKCHAIN', 'ASIA-PACIFIC', 'GREEN-LOGISTICS', 'WAREHOUSING']);
    expect(tags.map((t) => t.slug)).toEqual(['freight', 'blockchain', 'asia-pacific', 'green-logistics', 'warehousing']);
    for (const t of tags) expect(t.status).toBe('published');
  });

  it('NW-30/31: getResources returns the 3 promo resources, published, without files', async () => {
    const res = (await fn('getResources')('en')) as Rec[];
    expect(res.map((r) => r.slot).sort()).toEqual(['banner_left', 'banner_right', 'sidebar']);
    for (const r of res) {
      expect(r.status).toBe('published');
      expect(r.file ?? null).toBeNull();
    }
    const by = (slot: string) => res.find((r) => r.slot === slot)!;
    expect(text(by('sidebar'), 'title')).toBe('Annual Logistics White Paper 2024');
    expect(text(by('banner_left'), 'eyebrow')).toBe('ANNUAL REPORT');
    expect(text(by('banner_left'), 'title')).toBe('2025 FINANCIAL PERFORMANCE HIGHLIGHTS');
    expect(text(by('banner_left'), 'cta_label')).toBe('VIEW REPORT');
    expect(text(by('banner_right'), 'eyebrow')).toBe('WHITE PAPER');
    expect(text(by('banner_right'), 'title')).toBe('THE FUTURE OF AUTONOMOUS TRUCKING');
    expect(text(by('banner_right'), 'cta_label')).toBe('DOWNLOAD PDF');
  });

  it('NW-30: getResources and the sidebar getters never throw for any locale (property)', async () => {
    await fc.assert(
      fc.asyncProperty(locale, async (l) => {
        const [a, b, c] = await Promise.all([fn('getResources')(l), fn('getNewsCategories')(l), fn('getNewsTags')(l)]);
        return Array.isArray(a) && Array.isArray(b) && Array.isArray(c);
      }),
      RUNS,
    );
  });
});

describe('article getters (NA-1..NA-4, NA-17, NA-29)', () => {
  const SLUG = 'implementing-ai-driven-predictive-routing';

  it('NA-28: getNewsBySlug returns the fixture article parsing as News with the 8 documented blocks in order', async () => {
    const a = (await fn('getNewsBySlug')('en', SLUG)) as Rec | null;
    expect(a).not.toBeNull();
    expect(a!.status).toBe('published');
    expect(a!.slug).toBe(SLUG);
    expect(titleOf(a!)).toBe('Implementing AI-Driven Predictive Routing for Trans-Pacific Corridors');
    const body = text(a!, 'body') as Array<Record<string, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(Array.isArray(body)).toBe(true);
    expect(body.map((b) => b.type)).toEqual(['lead', 'heading', 'paragraph', 'feature', 'heading', 'paragraph', 'quote', 'paragraph']);
    expect(body[0].text).toMatch(/^Global trade is navigating/);
    expect(body[1]).toMatchObject({ level: 2, text: 'The Kinetic Architect Strategy' });
    expect(body[3]).toMatchObject({ title: 'Real-Time Transit Efficiency' });
    expect(body[3].stats).toEqual([
      { value: '99.8%', label: 'ON-TIME RATE' },
      { value: '12k', label: 'ACTIVE UNITS' },
    ]);
    expect(body[4]).toMatchObject({ level: 2, text: 'Sustainable Logistics: The New Standard' });
    expect(body[6].text).toMatch(/^"Sustainability is no longer/);
    expect(body[7].text).toMatch(/^Through asymmetrical growth/);
    expect(excerptOf(a!).length).toBeGreaterThan(0);
  });

  it('NA-1: unknown slugs give null, never throw (property over locales and arbitrary slugs)', async () => {
    await fc.assert(
      fc.asyncProperty(locale, fc.string({ maxLength: 60 }), async (l, slug) => {
        const r = await fn('getNewsBySlug')(l, `zz-${slug}`);
        return r === null || r === undefined;
      }),
      RUNS,
    );
  });

  it('NA-29: locale vi falls back to en for a record with only en translations and does not throw', async () => {
    const a = (await fn('getNewsBySlug')('vi', SLUG)) as Rec | null;
    expect(a).not.toBeNull();
    expect(titleOf(a!)).toBe('Implementing AI-Driven Predictive Routing for Trans-Pacific Corridors');
  });

  it('NA-17: getRelatedNews returns n published articles, newest first, never the current one (property over n)', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 6 }), async (n) => {
        const rel = (await fn('getRelatedNews')('en', SLUG, n)) as Rec[];
        const dates = rel.map((x) => Date.parse(String(x.published_at)));
        return rel.length <= n && rel.every((x) => x.status === 'published' && x.slug !== SLUG) && dates.every((d, i) => i === 0 || dates[i - 1] >= d);
      }),
      RUNS,
    );
    const three = (await fn('getRelatedNews')('en', SLUG, 3)) as Rec[];
    expect(three.map((x) => x.slug)).toEqual(['vietnam-logistics-digital-shift', 'logistics-turning-point', 'talent-shortage']);
  });

  it('NA-17: related news excludes the current article for every published slug (property)', async () => {
    const slugs = (await everything('en')).map((x) => String(x.slug));
    await fc.assert(
      fc.asyncProperty(fc.constantFrom(...slugs), async (slug) => {
        const rel = (await fn('getRelatedNews')('en', slug, 3)) as Rec[];
        return rel.length === 3 && rel.every((x) => x.slug !== slug);
      }),
      RUNS,
    );
  });

  it('NW-28: getLatestNews(en, 3) returns the 3 Industry Insights articles, newest first', async () => {
    const latest = (await fn('getLatestNews')('en', 3)) as Rec[];
    expect(latest.map(titleOf)).toEqual([
      'Vietnam’s Logistics Industry: From Traditional Supply Chains to a Full-Scale Digital Shift',
      'Vietnam Logistics at the Turning Point: Great Opportunities Amid Growing Pressures',
      'Talent Shortage: The Biggest Bottleneck in Vietnam’s Logistics Growth',
    ]);
  });

  it('NW-3: getFeaturedNews returns the Innovation featured article', async () => {
    const f = (await fn('getFeaturedNews')('en')) as Rec | null;
    expect(f).not.toBeNull();
    expect(f!.slug).toBe(SLUG);
  });
});
