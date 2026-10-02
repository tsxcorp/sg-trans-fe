import 'server-only';
import { z } from 'zod';
import { Service as HomeService, ServiceLayout, Locale, type Locale as LocaleT, type Resolved } from '../schema';
import { bySort, published, resolveRecord } from '../resolve';
import homeServices from '@/content/fixtures/services.json';
import groupsJson from '@/content/fixtures/pages/services/groups.json';
import childrenJson from '@/content/fixtures/pages/services/children.json';
import pageJson from '@/content/fixtures/pages/services/page.json';
import defaultDetailJson from '@/content/fixtures/pages/services/detail-default.json';

/**
 * Services group (our-service list + service detail): ONE model, `ServiceNode` = the Home `Service` record
 * extended. A node is a group (parent null: a section of the list page, also listed on Home) or a child
 * card (parent set). Every node has a detail page /services/<slug>; its optional blocks (highlights,
 * process, expertise, features, why) live on the node itself. A node with no block of its own renders the
 * default sample blocks (`detail-default.json`). Directus-shaped: Base fields, translations[] keyed by
 * languages_code, file ids as uuid, sub-collections with `sort`.
 */
const Base = z.object({
  id: z.uuid(),
  status: z.enum(['published', 'draft', 'archived']),
  sort: z.number().int().nullable(),
  date_created: z.iso.datetime({ offset: true }),
  date_updated: z.iso.datetime({ offset: true }).nullable(),
});
const File = z.uuid();
const T = <S extends z.ZodRawShape>(shape: S) => z.object({ languages_code: Locale, ...shape });
const nn = z.string().nullable();

export { ServiceLayout };

/** A step: list page process tracker / lifecycle rows (kicker, variant) and detail process cards (label only). */
export const ServiceStep = Base.extend({
  kind: z.enum(['process', 'lifecycle']),
  variant: z.enum(['default', 'active', 'final']),
  icon: nn,
  translations: z.array(T({ label: z.string(), kicker: nn })),
});

const Labelled = Base.extend({ icon: z.string(), translations: z.array(T({ label: z.string() })) });
const Titled = Base.extend({ icon: z.string(), translations: z.array(T({ title: z.string(), text: z.string() })) });

/** Detail blocks (all optional: a block that is empty or null is not rendered). */
const blocks = {
  hero_image: File.nullable().default(null),
  highlights_image: File.nullable().default(null),
  highlights: z.array(Labelled.extend({ emphasis: z.boolean() })).default([]),
  process: z
    .object({
      default_active: z.number().int().nullable(), // 1-based step number drawn active on first render
      steps: z.array(ServiceStep),
      translations: z.array(T({ eyebrow: z.string(), title: z.string(), subtitle: z.string() })),
    })
    .nullable()
    .default(null),
  expertise: z
    .object({
      stats: z.array(z.object({ value: z.string(), icon: z.string(), translations: z.array(T({ label: z.string() })) })),
      cards: z.array(z.object({ image: File, icon: z.string(), translations: z.array(T({ title: z.string() })) })),
      translations: z.array(T({ title: z.string(), text: z.string() })),
    })
    .nullable()
    .default(null),
  features: z.array(Titled).default([]),
  why: z
    .object({
      images: z.array(File).max(4),
      items: z.array(z.object({ icon: z.string(), translations: z.array(T({ title: z.string(), text: z.string() })) })),
      translations: z.array(T({ eyebrow: z.string(), title: z.string(), text: z.string(), image_alts: z.array(z.string()).default([]) })),
    })
    .nullable()
    .default(null),
};

/** Detail texts (translation fields of the node). `hero_title` overrides `title` as the H1 / page title. */
const detailText = {
  hero_title: nn.default(null), hero_subtitle: nn.default(null), intro_eyebrow: nn.default(null), intro_title: nn.default(null),
  intro_html: nn.default(null), highlights_title: nn.default(null), features_eyebrow: nn.default(null),
  features_title: nn.default(null), meta_description: nn.default(null),
};

export const ServiceNode = HomeService.extend({
  parent: z.uuid().nullable(),
  layout: ServiceLayout.nullable().default(null),
  related_services: z.array(z.uuid()).default([]),
  steps: z.array(ServiceStep).default([]),
  ...blocks,
  translations: z.array(
    T({
      title: z.string(), summary: z.string(), body: nn,
      nav_title: nn.default(null), section_eyebrow: nn.default(null), section_title: nn.default(null),
      section_intro: nn.default(null), section_link_label: nn.default(null), steps_title: nn.default(null),
      ...detailText,
    }),
  ),
});

const DefaultDetail = z.object({ ...blocks, translations: z.array(T(detailText)) });

const Stat = z.object({ value: z.string(), icon: nn, translations: z.array(T({ label: z.string() })) });
export const ServicesPage = Base.extend({
  hero_image: File,
  intro_images: z.array(File).length(2),
  intro_stats: z.array(Stat),
  forklift_image: File, // grey forklift cut-out, decoration of the intro (list) and detail pages
  intro_map_image: File, // dotted world map watermark, list page
  detail_map_image: File, // dotted world map watermark, detail page
  quote_image: File,
  quote_background: File,
  translations: z.array(
    T({
      seo_title: z.string(), seo_description: z.string(), hero_title: z.string(),
      intro_eyebrow: z.string(), intro_title: z.string(), intro_body: z.string(),
      badge_value: z.string(), badge_label: z.string(),
      quote_title: z.string(), quote_intro: z.string(), quote_caption_title: z.string(), quote_caption_body: z.string(),
    }),
  ),
});

export type ServiceNodeT = z.infer<typeof ServiceNode>;
export type ServiceStepT = z.infer<typeof ServiceStep>;

// ---- fixtures: the Home records (4 groups) merged with the group overlay, plus the child cards.
const overlays = new Map((groupsJson as { id: string; translations: Record<string, unknown>[] }[]).map((o) => [o.id, o]));
const groupRows = z.array(HomeService).parse(homeServices).map((h) => {
  const o = overlays.get(h.id);
  if (!o) throw new Error(`services fixture: no overlay for ${h.slug}`);
  const translations = h.translations.map((t) => ({ ...t, ...(o.translations.find((x) => x.languages_code === t.languages_code) ?? {}) }));
  return { ...h, ...o, translations };
});
const nodes = z.array(ServiceNode).parse([...groupRows, ...childrenJson]);
const page = z.array(ServicesPage).parse(pageJson);
const defaultDetail = DefaultDetail.parse(defaultDetailJson);

const live = <R extends { status: string; sort: number | null }>(rows: R[]) => bySort(published(rows));

/** Nodes that are visible: published, and for a child also with a published parent group. */
function visible(): ServiceNodeT[] {
  const groups = new Set(live(nodes.filter((n) => n.parent === null)).map((g) => g.id));
  return nodes.filter((n) => n.status === 'published' && (n.parent === null || groups.has(n.parent)));
}

const resolveSteps = (steps: ServiceStepT[], l: LocaleT) => live(steps).map((s) => resolveRecord(s, l));

type R<X extends { translations: { languages_code: LocaleT }[] }> = Resolved<X>;
type ResolvedChild = R<ServiceNodeT>;
export type ServiceGroup = Omit<R<ServiceNodeT>, 'steps'> & { children: ResolvedChild[]; steps: R<ServiceStepT>[] };

/** Top-level groups (parent null) by `sort`, each with its published children and steps. Never throws. */
export async function getServiceGroups(locale: LocaleT): Promise<ServiceGroup[]> {
  const vis = visible();
  return live(vis.filter((n) => n.parent === null)).map((g) => ({
    ...resolveRecord(g, locale),
    steps: resolveSteps(g.steps, locale),
    children: live(vis.filter((c) => c.parent === g.id)).map((c) => resolveRecord(c, locale)),
  }));
}

export async function getServicesPage(locale: LocaleT) {
  const p = live(page)[0];
  return p ? { ...resolveRecord(p, locale), intro_stats: p.intro_stats.map((s) => resolveRecord(s, locale)) } : null;
}

type Blocks = Pick<ServiceNodeT, 'hero_image' | 'highlights_image' | 'highlights' | 'process' | 'expertise' | 'features' | 'why'>;
const hasOwnBlocks = (n: Blocks) => !!(n.hero_image || n.highlights.length || n.process || n.expertise || n.features.length || n.why);

function resolveBlocks(b: Blocks, l: LocaleT) {
  return {
    hero_image: b.hero_image,
    highlights_image: b.highlights_image,
    highlights: live(b.highlights).map((h) => resolveRecord(h, l)),
    process: b.process && { ...resolveRecord(b.process, l), steps: resolveSteps(b.process.steps, l) },
    expertise: b.expertise && {
      ...resolveRecord(b.expertise, l),
      stats: b.expertise.stats.map((s) => resolveRecord(s, l)),
      cards: b.expertise.cards.map((c) => resolveRecord(c, l)),
    },
    features: live(b.features).map((f) => resolveRecord(f, l)),
    why: b.why && { ...resolveRecord(b.why, l), items: b.why.items.map((i) => resolveRecord(i, l)) },
  };
}

const excerpt = (s: string, max = 160) => {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : max).trim();
};

export type ServiceDetailPage = Omit<R<ServiceNodeT>, 'process' | 'expertise' | 'features' | 'why' | 'highlights' | 'related_services' | 'steps'> &
  ReturnType<typeof resolveBlocks> & {
    heroTitle: string;
    seoTitle: string;
    metaDescription: string;
    related_services: { slug: string; title: string }[];
  };

/**
 * One service with everything the detail template needs; null when unknown or not published.
 * `title` is the hero title (`hero_title` when set); a node without blocks of its own gets the default sample blocks.
 */
export async function getServiceBySlug(locale: LocaleT, slug: string): Promise<ServiceDetailPage | null> {
  const vis = visible();
  const node = vis.find((n) => n.slug === slug);
  if (!node) return null;
  const rec = resolveRecord(node, locale);
  const tr = rec.translations[0];
  if (!tr) return null;
  const own = hasOwnBlocks(node);
  const blocksSrc: Blocks = own ? node : defaultDetail;
  const defText = own ? null : resolveRecord(defaultDetail, locale).translations[0];
  const text = { ...tr };
  if (defText) for (const [k, v] of Object.entries(defText)) if (k !== 'languages_code' && v && !text[k as keyof typeof text]) (text as Record<string, unknown>)[k] = v;
  const heroTitle = text.hero_title || tr.title;

  const byId = new Map(vis.map((n) => [n.id, n]));
  let relNodes = node.related_services.map((id) => byId.get(id)).filter((n): n is ServiceNodeT => !!n && n.id !== node.id);
  // Automatic when none is set: the other published top-level services, current excluded, at most 4.
  if (!node.related_services.length) relNodes = live(vis.filter((n) => n.parent === null && n.id !== node.id));
  const related = relNodes.slice(0, 4).map((n) => {
    const t = resolveRecord(n, locale).translations[0];
    return { slug: n.slug, title: t?.nav_title || t?.title || n.slug };
  });

  const { process: _p, expertise: _e, features: _f, why: _w, highlights: _h, steps: _s, related_services: _r, ...rest } = rec;
  void [_p, _e, _f, _w, _h, _s, _r];
  return {
    ...rest,
    translations: [{ ...text, title: heroTitle }],
    ...resolveBlocks(blocksSrc, locale),
    heroTitle,
    seoTitle: `${heroTitle} | Saigon Trans`,
    metaDescription: text.meta_description || excerpt(tr.summary),
    related_services: related,
  } as ServiceDetailPage;
}

export async function getServiceSlugs(): Promise<string[]> {
  return visible().map((n) => n.slug);
}

export { Locale };
