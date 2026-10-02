import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  AboutPage, Capability, CoreValue, getAboutPage, getCapabilities, getCoreValues,
} from '@/lib/cms/pages/about';
import type { Locale } from '@/lib/cms/schema';
import { text, translationsAreResolved, sortKey, type Rec } from '../helpers/cms';
import { base, UUID_B } from '../helpers/fixtures';
import { CAPABILITIES, CORE_VALUES, HERO, INTRO, VISION, MISSION, VALUES_HEADING, PARTNERS } from '../helpers/about-us';

const locale = fc.constantFrom('en', 'vi');
const RUNS = { numRuns: 20 };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const aboutT = {
  languages_code: 'en',
  meta_title: 'T', meta_description: 'D', hero_title: HERO.h1, hero_subtitle: HERO.subtitle,
  intro_eyebrow: INTRO.eyebrow, intro_title: INTRO.h2, intro_paragraphs: [INTRO.p1, INTRO.p2],
  years_label: INTRO.yearsLabel, vision_title: VISION.title, vision_text: VISION.text,
  mission_title: MISSION.title, mission_text: MISSION.text,
  values_eyebrow: VALUES_HEADING.eyebrow, values_title: VALUES_HEADING.h2,
  partners_eyebrow: PARTNERS.eyebrow, partners_title: PARTNERS.h2,
};
const validAbout = base({
  hero_image: UUID_B, intro_image: UUID_B, vision_mission_image: UUID_B,
  years_value: '26+', rating: '5.0',
  translations: [aboutT],
});
const validCapability = base({
  icon: null,
  translations: [{ languages_code: 'en', title: 'Truck and trailer', detail: '+ 50 Set' }],
});
const validCoreValue = base({
  icon: null, layout: 'standard', variant: 'default', background_image: null,
  translations: [{ languages_code: 'en', title: 'QUALITY', body: ['x'] }],
});

describe('AboutPage schema (AB-20)', () => {
  it('AB-20: accepts a valid record; nullable images/rating accepted; image_alts optional', () => {
    expect(AboutPage.safeParse(validAbout).success).toBe(true);
    expect(AboutPage.safeParse({ ...validAbout, hero_image: null, intro_image: null, vision_mission_image: null, rating: null }).success).toBe(true);
    const t = aboutT;
    expect(AboutPage.safeParse({ ...validAbout, translations: [{ ...t, image_alts: { hero: 'alt' } }] }).success).toBe(true);
  });
  it.each([
    ['missing years_value', { years_value: undefined }],
    ['non-uuid image', { hero_image: 'not-a-uuid' }],
    ['status outside enum', { status: 'live' }],
    ['unknown language code', { translations: [{ ...aboutT, languages_code: 'fr' }] }],
    ['intro_paragraphs as a string', { translations: [{ ...aboutT, intro_paragraphs: 'one' }] }],
    ['translations missing hero_title', { translations: [{ ...aboutT, hero_title: undefined }] }],
  ])('AB-20: rejects %s', (_n, patch) => {
    expect(AboutPage.safeParse({ ...validAbout, ...patch }).success).toBe(false);
  });
});

describe('Capability schema (AB-7)', () => {
  it('AB-7: accepts a valid record, detail may be null', () => {
    expect(Capability.safeParse(validCapability).success).toBe(true);
    expect(Capability.safeParse({ ...validCapability, translations: [{ languages_code: 'en', title: 'Tank Container truck', detail: null }] }).success).toBe(true);
  });
  it.each([
    ['missing title', { translations: [{ languages_code: 'en', detail: null }] }],
    ['detail is a number', { translations: [{ languages_code: 'en', title: 'x', detail: 5 }] }],
    ['bad id', { id: 'nope' }],
  ])('AB-7: rejects %s', (_n, patch) => {
    expect(Capability.safeParse({ ...validCapability, ...patch }).success).toBe(false);
  });
});

describe('CoreValue schema (AB-10)', () => {
  it.each(['standard', 'wide', 'wide_columns'])('AB-10: accepts layout %s', (layout) => {
    expect(CoreValue.safeParse({ ...validCoreValue, layout }).success).toBe(true);
  });
  it.each(['default', 'highlight'])('AB-10: accepts variant %s', (variant) => {
    expect(CoreValue.safeParse({ ...validCoreValue, variant, background_image: variant === 'highlight' ? UUID_B : null }).success).toBe(true);
  });
  it.each([
    ['unknown layout', { layout: 'full' }],
    ['unknown variant', { variant: 'dark' }],
    ['body as a string', { translations: [{ languages_code: 'en', title: 'X', body: 'text' }] }],
    ['background_image not a uuid', { background_image: 'img.png' }],
    ['missing layout', { layout: undefined }],
  ])('AB-10: rejects %s', (_n, patch) => {
    expect(CoreValue.safeParse({ ...validCoreValue, ...patch }).success).toBe(false);
  });
});

describe('getAboutPage (AB-1, AB-5, AB-21)', () => {
  it('AB-21: never throws and returns an object or null for en, vi and an unsupported locale', async () => {
    for (const l of ['en', 'vi', 'zz']) {
      const r = await getAboutPage(l as Locale);
      expect(r === null || typeof r === 'object').toBe(true);
    }
  });
  it('AB-21: published singleton with uuid id; vi falls back to the same en texts', async () => {
    const en = (await getAboutPage('en')) as Rec;
    expect(en).toBeTruthy();
    expect(en.status).toBe('published');
    expect(String(en.id)).toMatch(UUID_RE);
    const vi = (await getAboutPage('vi')) as Rec;
    expect(vi).toBeTruthy();
    expect(translationsAreResolved(vi, 'vi')).toBe(true);
    for (const f of ['hero_title', 'intro_title', 'vision_title']) expect(text(vi, f)).toBe(text(en, f));
  });
  it('AB-1/AB-5: en fixture carries the design texts verbatim', async () => {
    const en = (await getAboutPage('en')) as Rec;
    const expected: Record<string, unknown> = {
      hero_title: HERO.h1, hero_subtitle: HERO.subtitle, intro_eyebrow: INTRO.eyebrow, intro_title: INTRO.h2,
      years_label: INTRO.yearsLabel, vision_title: VISION.title, vision_text: VISION.text,
      mission_title: MISSION.title, mission_text: MISSION.text,
      values_eyebrow: VALUES_HEADING.eyebrow, values_title: VALUES_HEADING.h2,
      partners_eyebrow: PARTNERS.eyebrow, partners_title: PARTNERS.h2,
    };
    for (const [k, v] of Object.entries(expected)) expect(text(en, k), k).toBe(v);
    expect(text(en, 'intro_paragraphs')).toEqual([INTRO.p1, INTRO.p2]);
    expect(en.years_value).toBe(INTRO.years);
    expect(en.rating).toBe(INTRO.rating);
    for (const f of ['meta_title', 'meta_description']) {
      expect(typeof text(en, f)).toBe('string');
      expect((text(en, f) as string).length).toBeGreaterThan(0);
    }
  });
});

const lists = [
  ['getCapabilities', (l: string) => getCapabilities(l as Locale), 'title'],
  ['getCoreValues', (l: string) => getCoreValues(l as Locale), 'title'],
] as const;

describe.each(lists)('%s (AB-21)', (_name, fn, field) => {
  it('AB-21: only status=published, sorted by `sort` ascending, uuid unique ids (property over locales)', async () => {
    await fc.assert(
      fc.asyncProperty(locale, async (l) => {
        const rows = (await fn(l)) as Rec[];
        const keys = rows.map(sortKey);
        const ids = rows.map((r) => String(r.id));
        return rows.every((r) => r.status === 'published') &&
          keys.every((k, i) => i === 0 || keys[i - 1] <= k) &&
          new Set(ids).size === ids.length && ids.every((i) => UUID_RE.test(i));
      }),
      RUNS,
    );
  });
  it('AB-21: vi and unsupported locales fall back to en (same records and texts) and never throw', async () => {
    const en = (await fn('en')) as Rec[];
    for (const l of ['vi', 'zz']) {
      const rows = (await fn(l)) as Rec[];
      expect(rows.map((r) => r.id)).toEqual(en.map((r) => r.id));
      expect(rows.map((r) => text(r, field))).toEqual(en.map((r) => text(r, field)));
      if (l === 'vi') expect(rows.every((r) => translationsAreResolved(r, 'vi'))).toBe(true);
    }
  });
});

describe('getCapabilities fixture (AB-7)', () => {
  it('AB-7: returns 8 rows, titles and details verbatim in order, detail null for items 3 and 8', async () => {
    const rows = (await getCapabilities('en')) as Rec[];
    expect(rows).toHaveLength(8);
    rows.forEach((r, i) => {
      expect(text(r, 'title'), `title ${i + 1}`).toBe(CAPABILITIES[i].title);
      const d = text(r, 'detail');
      if (CAPABILITIES[i].detail === null) expect(d == null, `detail ${i + 1} null`).toBe(true);
      else expect(d, `detail ${i + 1}`).toBe(CAPABILITIES[i].detail);
    });
  });
});

describe('getCoreValues fixture (AB-10, AB-11, AB-12)', () => {
  it('AB-10: returns 6 rows in order with the verbatim titles and bodies as string arrays', async () => {
    const rows = (await getCoreValues('en')) as Rec[];
    expect(rows).toHaveLength(6);
    rows.forEach((r, i) => {
      expect(text(r, 'title')).toBe(CORE_VALUES[i].title);
      const body = text(r, 'body') as string[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.every((b) => typeof b === 'string' && b.length > 0)).toBe(true);
      for (const b of CORE_VALUES[i].bodies) expect(body.join('\n'), `${CORE_VALUES[i].title} body`).toContain(b);
      if (CORE_VALUES[i].bodies.length === 1) expect(body).toEqual(CORE_VALUES[i].bodies);
    });
  });
  it('AB-11: layouts are standard, standard, wide_columns, wide, standard, standard', async () => {
    const rows = (await getCoreValues('en')) as Rec[];
    expect(rows.map((r) => r.layout)).toEqual(['standard', 'standard', 'wide_columns', 'wide', 'standard', 'standard']);
  });
  it('AB-12: only TEAMWORK is variant highlight and has a background image; others default', async () => {
    const rows = (await getCoreValues('en')) as Rec[];
    rows.forEach((r, i) => {
      const hl = CORE_VALUES[i].title === 'TEAMWORK';
      expect(r.variant, CORE_VALUES[i].title).toBe(hl ? 'highlight' : 'default');
      if (hl) expect(String(r.background_image)).toMatch(UUID_RE);
    });
  });
});
