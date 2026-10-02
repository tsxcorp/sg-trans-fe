import { z } from 'zod';

// Data contracts from docs/requirements.md. Shapes mirror Directus collections.
export const Locale = z.enum(['en', 'vi']);
export type Locale = z.infer<typeof Locale>;

export const Base = z.object({
  id: z.uuid(),
  status: z.enum(['published', 'draft', 'archived']),
  sort: z.number().int().nullable(),
  date_created: z.iso.datetime({ offset: true }),
  date_updated: z.iso.datetime({ offset: true }).nullable(),
});

export const File = z.uuid(); // Directus file id; URL built by assetUrl(id)
export const T = <S extends z.ZodRawShape>(shape: S) => z.object({ languages_code: Locale, ...shape });

// Layout of a service group on the Our Service page.
export const ServiceLayout = z.enum(['tiles', 'cards', 'photo-grid', 'cards-lifecycle']);

export const Service = Base.extend({
  slug: z.string(),
  icon: z.string().nullable(),
  image: File.nullable(),
  translations: z.array(T({ title: z.string(), summary: z.string(), body: z.string().nullable() })),
});

// Structured article body (never raw HTML). Inline marks inside text: **bold**, *italic*, [label](https://… | /path | mailto: | tel:).
export const ArticleBlock = z.discriminatedUnion('type', [
  z.object({ type: z.literal('lead'), text: z.string() }),
  z.object({ type: z.literal('heading'), level: z.union([z.literal(2), z.literal(3)]), text: z.string() }),
  z.object({ type: z.literal('paragraph'), text: z.string() }),
  z.object({ type: z.literal('quote'), text: z.string(), cite: z.string().nullable().optional() }),
  z.object({ type: z.literal('image'), file: File, alt: z.string(), caption: z.string().nullable().optional() }),
  z.object({ type: z.literal('list'), ordered: z.boolean(), items: z.array(z.string()) }),
  z.object({
    type: z.literal('feature'),
    title: z.string(),
    text: z.string(),
    image: File.nullable(),
    stats: z.array(z.object({ value: z.string(), label: z.string() })).max(4),
  }),
]);

export const News = Base.extend({
  slug: z.string(),
  cover: File.nullable(),
  published_at: z.iso.datetime({ offset: true }),
  author: z.string().nullable().optional(), // shown on the news card
  comments_count: z.number().int().nonnegative().nullable().optional(),
  // News page / article page extensions (all optional so Home fixtures stay valid)
  cover_alt: z.string().nullable().optional(),
  list_image: File.nullable().optional(),
  related_image: File.nullable().optional(),
  category: z.uuid().nullable().optional(),
  tags: z.array(z.uuid()).default([]),
  is_featured: z.boolean().default(false),
  translations: z.array(T({ title: z.string(), excerpt: z.string(), body: z.array(ArticleBlock) })),
});

export const Stat = Base.extend({
  value: z.string(),
  icon: z.string().nullable(),
  as_of: z.iso.date(),
  translations: z.array(T({ label: z.string() })),
});

export const Partner = Base.extend({
  name: z.string(),
  logo: File,
  url: z.url().nullable(),
});

export const Office = Base.extend({
  phone: z.string().nullable(),
  email: z.email().nullable(),
  translations: z.array(T({ name: z.string(), address: z.string(), role: z.string().nullable() })),
});

export const LeadInput = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  company: z.string().trim().max(160).optional(),
  email: z.email().max(254),
  phone: z.string().trim().min(5).max(30).regex(/^[+()\d\s.-]+$/),
  country: z.string().trim().max(80).optional(),
  job_title: z.string().trim().max(120).optional(),
  message: z.string().trim().max(4000).optional(), // Home has no input for it; the Contact and Services forms use it as the project brief
  service_type: z.string().trim().max(120).optional(), // Contact / Services quote forms (a Service slug)
  estimated_volume: z.string().trim().max(120).optional(), // Contact / Services quote forms
  locale: Locale,
  website: z.string().max(0), // honeypot: must stay empty
});

export const Lead = LeadInput.omit({ website: true }).extend({
  id: z.uuid(),
  date_created: z.iso.datetime({ offset: true }),
  email_status: z.enum(['pending', 'sent', 'failed']),
  source_page: z.string(),
});

/** Newsletter sign-up (footer). `website` is the honeypot. */
export const SubscriberInput = z.object({
  email: z.email().max(254),
  locale: Locale,
  website: z.string().max(0),
});
export const Subscriber = SubscriberInput.omit({ website: true }).extend({
  id: z.uuid(),
  date_created: z.iso.datetime({ offset: true }),
  source_page: z.string(),
});

export type SubscriberInputT = z.infer<typeof SubscriberInput>;
export type SubscriberT = z.infer<typeof Subscriber>;
export type ServiceT = z.infer<typeof Service>;
export type NewsT = z.infer<typeof News>;
export type StatT = z.infer<typeof Stat>;
export type PartnerT = z.infer<typeof Partner>;
export type OfficeT = z.infer<typeof Office>;
export type LeadInputT = z.infer<typeof LeadInput>;
export type LeadT = z.infer<typeof Lead>;

/** A record after locale resolution: translations holds exactly one entry. */
export type Resolved<R extends { translations: unknown[] }> = Omit<R, 'translations'> & {
  translations: [R['translations'][number]];
};
