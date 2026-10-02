import 'server-only';
import { z } from 'zod';
import { Locale, type Resolved } from '../schema';
import { bySort, published, resolveRecord } from '../resolve';
import aboutPageJson from '@/content/fixtures/pages/about/about_page.json';
import capabilitiesJson from '@/content/fixtures/pages/about/capabilities.json';
import coreValuesJson from '@/content/fixtures/pages/about/core_values.json';

// Data contracts of the About Us page (docs/pages/about-us.md section 3). Same conventions as `../schema`:
// Directus-shaped records, translations[] keyed by languages_code, file ids as uuid.
const Base = z.object({
  id: z.uuid(),
  status: z.enum(['published', 'draft', 'archived']),
  sort: z.number().int().nullable(),
  date_created: z.iso.datetime({ offset: true }),
  date_updated: z.iso.datetime({ offset: true }).nullable(),
});
const File = z.uuid();
const T = <S extends z.ZodRawShape>(shape: S) => z.object({ languages_code: Locale, ...shape });

/** Singleton (Directus singleton collection `about_page`). */
export const AboutPage = Base.extend({
  hero_image: File.nullable(),
  intro_image: File.nullable(),
  vision_mission_image: File.nullable(),
  years_value: z.string(),
  rating: z.string().nullable(), // source unknown (spec Q2)
  translations: z.array(
    T({
      meta_title: z.string(),
      meta_description: z.string(),
      hero_title: z.string(),
      hero_subtitle: z.string(),
      intro_eyebrow: z.string(),
      intro_title: z.string(),
      intro_paragraphs: z.array(z.string()),
      years_label: z.string(),
      vision_title: z.string(),
      vision_text: z.string(),
      mission_title: z.string(),
      mission_text: z.string(),
      values_eyebrow: z.string(),
      values_title: z.string(),
      partners_eyebrow: z.string(),
      partners_title: z.string(),
      image_alts: z.record(z.string(), z.string()).optional(),
    }),
  ),
});

/** Collection `capabilities` (8 rows). */
export const Capability = Base.extend({
  icon: z.string().nullable(),
  translations: z.array(T({ title: z.string(), detail: z.string().nullable() })),
});

/** Collection `core_values` (6 rows, ordered by `sort`). */
export const CoreValue = Base.extend({
  icon: z.string().nullable(),
  layout: z.enum(['standard', 'wide', 'wide_columns']),
  variant: z.enum(['default', 'highlight']),
  background_image: File.nullable(),
  translations: z.array(T({ title: z.string(), body: z.array(z.string()) })),
});

export type AboutPageT = z.infer<typeof AboutPage>;
export type CapabilityT = z.infer<typeof Capability>;
export type CoreValueT = z.infer<typeof CoreValue>;

// Fixtures are validated against the same contracts Directus will have to satisfy.
const aboutPage = AboutPage.parse(aboutPageJson);
const capabilities = z.array(Capability).parse(capabilitiesJson);
const coreValues = z.array(CoreValue).parse(coreValuesJson);

const live = <T extends { status: string; sort: number | null }>(rows: T[]) => bySort(published(rows));

/** The page singleton in the requested locale (English fallback); null when it is not published. */
export async function getAboutPage(locale: string): Promise<Resolved<AboutPageT> | null> {
  return published([aboutPage]).map((r) => resolveRecord(r, locale))[0] ?? null;
}
export async function getCapabilities(locale: string) {
  return live(capabilities).map((r) => resolveRecord(r, locale));
}
export async function getCoreValues(locale: string) {
  return live(coreValues).map((r) => resolveRecord(r, locale));
}
