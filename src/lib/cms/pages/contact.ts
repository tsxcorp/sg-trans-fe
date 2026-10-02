import 'server-only';
import { z } from 'zod';
import { Office, type Locale } from '@/lib/cms/schema';
import { bySort, published, resolveRecord } from '@/lib/cms/resolve';
import contactPageJson from '@/content/fixtures/pages/contact/contact-page.json';
import companyProfileJson from '@/content/fixtures/pages/contact/company-profile.json';
import officesJson from '@/content/fixtures/pages/contact/offices.json';
import openingHoursJson from '@/content/fixtures/pages/contact/opening-hours.json';
import contactPersonsJson from '@/content/fixtures/pages/contact/contact-persons.json';
import operationGroupsJson from '@/content/fixtures/pages/contact/operation-groups.json';
import operationPointsJson from '@/content/fixtures/pages/contact/operation-points.json';

// Contact page contracts (docs/pages/contact.md section 3). Shapes mirror the future Directus collections.
const Base = z.object({
  id: z.uuid(),
  status: z.enum(['published', 'draft', 'archived']),
  sort: z.number().int().nullable(),
  date_created: z.iso.datetime({ offset: true }),
  date_updated: z.iso.datetime({ offset: true }).nullable(),
});
const File = z.uuid();
const Lang = z.enum(['en', 'vi']);
const T = <S extends z.ZodRawShape>(shape: S) => z.object({ languages_code: Lang, ...shape });

/** Singleton: texts and images of the page. `map_embed_url` stays null: the map is a static image that opens `map_open_url`. */
export const ContactPage = Base.extend({
  hero_image: File.nullable(),
  quote_bg: File.nullable(),
  quote_photo: File.nullable(),
  map_image: File.nullable(),
  map_embed_url: z.url().nullable(),
  map_open_url: z.url().nullable(),
  forklift_image: File.nullable(),
  world_image: File.nullable(),
  translations: z.array(
    T({
      seo_title: z.string(),
      seo_description: z.string(),
      hero_title: z.string(),
      hero_subtitle: z.string(),
      map_chip: z.string(),
      map_alt: z.string(),
      map_link_label: z.string(),
      leadership_eyebrow: z.string(),
      leadership_title: z.string(),
      operations_title: z.string(),
      quote_title: z.string(),
      quote_photo_title: z.string(),
      quote_photo_text: z.string(),
      quote_photo_alt: z.string(),
      notice_label: z.string(),
      notice_title: z.string(),
      notice_blocks: z.array(z.object({ lead: z.string(), text: z.string() })),
    }),
  ),
});

export const CompanyProfile = Base.extend({
  legal_name: z.string(),
  license_tax: z.string(),
  vat: z.string(),
  phone: z.string(),
  email: z.email(),
});

/** Shared `Office` plus the icon the Contact page draws next to it ('pin' | 'building'). */
export const ContactOffice = Office.extend({ icon: z.string().nullable() });

export const OpeningHours = Base.extend({
  icon: z.string().nullable(),
  time_range: z.string(),
  translations: z.array(T({ title: z.string(), days: z.string() })),
});

export const ContactPerson = Base.extend({
  level: z.number().int().min(0).max(2),
  column: z.number().int().min(1).max(4).nullable(),
  full_name: z.string(),
  email: z.email().nullable(),
  extension: z.string().nullable(),
  translations: z.array(T({ role: z.string() })),
});

export const OperationGroup = Base.extend({
  panel: z.number().int().min(1).max(2),
  translations: z.array(T({ label: z.string() })),
});
export const OperationPoint = Base.extend({
  group: z.uuid(),
  location: z.string(),
  persons: z.array(z.string()).min(1),
});

// Fixtures are validated against the contracts above (same rule as the shared fixtures).
const contactPages = z.array(ContactPage).parse(contactPageJson);
const companyProfiles = z.array(CompanyProfile).parse(companyProfileJson);
const offices = z.array(ContactOffice).parse(officesJson);
const openingHours = z.array(OpeningHours).parse(openingHoursJson);
const contactPersons = z.array(ContactPerson).parse(contactPersonsJson);
const operationGroups = z.array(OperationGroup).parse(operationGroupsJson);
const operationPoints = z.array(OperationPoint).parse(operationPointsJson);

const live = <T extends { status: string; sort: number | null }>(rows: T[]) => bySort(published(rows));

export async function getContactPage(locale: Locale) {
  const row = live(contactPages)[0];
  if (!row) throw new Error('No published ContactPage record');
  return resolveRecord(row, locale);
}

// The profile has no translated fields; `locale` is accepted so every getter shares one signature.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCompanyProfile(_locale?: Locale) {
  const row = live(companyProfiles)[0];
  if (!row) throw new Error('No published CompanyProfile record');
  return row;
}

export async function getOffices(locale: Locale) {
  return live(offices).map((r) => resolveRecord(r, locale));
}

export async function getOpeningHours(locale: Locale) {
  return live(openingHours).map((r) => resolveRecord(r, locale));
}

export async function getContactPersons(locale: Locale) {
  return live(contactPersons).map((r) => resolveRecord(r, locale));
}

/** Groups (sorted) with their published points nested (sorted). */
export async function getOperationGroups(locale: Locale) {
  const points = live(operationPoints);
  return live(operationGroups)
    .map((r) => resolveRecord(r, locale))
    .map((g) => ({ ...g, points: points.filter((p) => p.group === g.id) }));
}
