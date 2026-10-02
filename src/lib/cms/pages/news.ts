import 'server-only';
import { z } from 'zod';
import { ArticleBlock, News as BaseNews, type Locale, type Resolved } from '@/lib/cms/schema';
import { bySort, published, resolveRecord } from '@/lib/cms/resolve';
import newsJson from '@/content/fixtures/news.json';
import articlesJson from '@/content/fixtures/pages/news/articles.json';
import categoriesJson from '@/content/fixtures/pages/news/categories.json';
import tagsJson from '@/content/fixtures/pages/news/tags.json';
import overlays from '@/content/fixtures/pages/news/home-overlays.json';
import resourcesJson from '@/content/fixtures/pages/news/resources.json';

/**
 * News group (News list + News Article). One consistent model for both specs:
 *  - `News` of the shared schema is extended (not replaced): category, tags, is_featured, cover_alt, and a structured `body`.
 *  - `NewsCategory` / `NewsTag` / `Resource` follow docs/pages/news.md section 3.1 (the article spec's `Promo` is the
 *    `Resource` with slot `sidebar`; its category/tag collections are the same collections).
 *  - Home fixtures (news.json, body "") are merged with the news-page fixtures; their body string becomes [].
 */

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

export { ArticleBlock };
export type ArticleBlockT = z.infer<typeof ArticleBlock>;

// The shared fixtures store `body` as a string (""): accept it and turn it into blocks.
const Body = z.union([z.array(ArticleBlock), z.string()]).transform((b): ArticleBlockT[] =>
  typeof b === 'string' ? (b.trim() ? [{ type: 'paragraph', text: b }] : []) : b,
);

export const NewsArticle = BaseNews.omit({ translations: true }).extend({
  cover_alt: z.string().nullable().optional(),
  list_image: File.nullable().optional(), // crop used by list views (featured card, rows, Industry Insights cards); falls back to `cover`
  related_image: File.nullable().optional(), // crop used by the related cards of the article page; falls back to `list_image`
  category: z.uuid().nullable().optional(),
  tags: z.array(z.uuid()).default([]),
  is_featured: z.boolean().default(false),
  translations: z.array(T({ title: z.string(), excerpt: z.string(), body: Body })),
});

export const NewsCategory = Base.extend({
  slug: z.string(),
  in_sidebar: z.boolean(),
  translations: z.array(T({ name: z.string() })),
});
export const NewsTag = Base.extend({
  slug: z.string(),
  trending: z.boolean(),
  translations: z.array(T({ name: z.string() })),
});
export const Resource = Base.extend({
  slot: z.enum(['sidebar', 'banner_left', 'banner_right']),
  file: File.nullable(), // PDF; null = not available yet
  translations: z.array(T({ eyebrow: z.string().nullable(), title: z.string(), description: z.string(), cta_label: z.string() })),
});

export type NewsArticleT = z.infer<typeof NewsArticle>;
export type NewsCategoryT = z.infer<typeof NewsCategory>;
export type NewsTagT = z.infer<typeof NewsTag>;
export type ResourceT = z.infer<typeof Resource>;

const overlay = overlays as Record<string, { list_image?: string; related_image?: string } | string>;
const homeNews = newsJson.map((n) => ({ ...n, ...(typeof overlay[n.slug] === 'object' ? (overlay[n.slug] as object) : {}) }));
const articles = z.array(NewsArticle).parse([...homeNews, ...articlesJson]);
const categories = z.array(NewsCategory).parse(categoriesJson);
const tags = z.array(NewsTag).parse(tagsJson);
const resources = z.array(Resource).parse(resourcesJson);

export const NEWS_PAGE_SIZE = 4;
export const NEWS_Q_MAX = 100;

const byDateDesc = <T extends { published_at: string }>(rows: T[]) =>
  [...rows].sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
const visibleArticles = () => byDateDesc(published(articles).filter((a) => Date.parse(a.published_at) <= Date.now()));

type ResolvedArticle = Resolved<NewsArticleT>;
export type NewsItem = ResolvedArticle & {
  categoryName: string | null;
  categorySlug: string | null;
  tagItems: { id: string; slug: string; name: string }[];
  /** File shown in list views: `list_image`, else `cover`. */
  image: string | null;
};

const catById = (id: string | null | undefined) => categories.find((c) => c.id === id && c.status === 'published');
const tagById = (id: string) => tags.find((t) => t.id === id && t.status === 'published');

function decorate(a: NewsArticleT, locale: Locale): NewsItem {
  const r = resolveRecord(a, locale);
  const c = catById(a.category);
  const cr = c ? resolveRecord(c, locale) : null;
  const tagItems = a.tags.flatMap((id) => {
    const t = tagById(id);
    return t ? [{ id: t.id, slug: t.slug, name: resolveRecord(t, locale).translations[0]?.name ?? t.slug }] : [];
  });
  // Records without a body fall back to the excerpt as a lead paragraph (so every article page renders).
  const tr = r.translations[0];
  if (tr && tr.body.length === 0 && tr.excerpt) tr.body = [{ type: 'lead', text: tr.excerpt }];
  return { ...r, categoryName: cr?.translations[0]?.name ?? null, categorySlug: c?.slug ?? null, tagItems, image: a.list_image ?? a.cover ?? null };
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();

export type NewsQuery = { page?: number; pageSize?: number; q?: string | null; category?: string | null; tag?: string | null };
export type NewsPageResult = {
  items: NewsItem[];
  total: number;
  page: number;
  pageCount: number;
  /** The page number asked for (>= 1); greater than pageCount means the caller should redirect to pageCount. */
  requestedPage: number;
  pageSize: number;
  /** Only on page 1 of the default view (no q / category / tag): the card drawn above the rows. Also part of `items`. */
  featured: NewsItem | null;
  filter: { q: string | null; category: string | null; tag: string | null; active: 'q' | 'category' | 'tag' | null };
};

/** Newest published article flagged is_featured (hero 1 of the list). */
export async function getFeaturedNews(locale: Locale): Promise<NewsItem | null> {
  const f = visibleArticles().find((a) => a.is_featured);
  return f ? decorate(f, locale) : null;
}

/**
 * List view. Default view (no q/category/tag) excludes the 3 newest articles (Industry Insights teaser).
 * Priority when several filters are present: q > category > tag. Search covers every published article.
 */
export async function getNewsPage(locale: Locale, query: NewsQuery = {}): Promise<NewsPageResult> {
  const pageSize = Math.max(1, Math.floor(query.pageSize ?? NEWS_PAGE_SIZE));
  const q = (query.q ?? '').trim().slice(0, NEWS_Q_MAX) || null;
  const category = q ? null : (query.category ?? '').trim() || null;
  const tag = q || category ? null : (query.tag ?? '').trim() || null;
  const active = q ? 'q' : category ? 'category' : tag ? 'tag' : null;

  const all = visibleArticles();
  let set: NewsArticleT[];
  if (q) {
    const needle = fold(q);
    set = all.filter((a) => {
      const tr = resolveRecord(a, locale).translations[0];
      return !!tr && fold(`${tr.title} ${tr.excerpt}`).includes(needle);
    });
  } else if (category) {
    const c = categories.find((x) => x.slug === category && x.status === 'published');
    set = c ? all.filter((a) => a.category === c.id) : [];
  } else if (tag) {
    const t = tags.find((x) => x.slug === tag && x.status === 'published');
    set = t ? all.filter((a) => a.tags.includes(t.id)) : [];
  } else {
    set = all.slice(3);
  }

  const total = set.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const requestedPage = Number.isFinite(query.page) && (query.page as number) >= 1 ? Math.floor(query.page as number) : 1;
  const page = Math.min(requestedPage, pageCount);
  const items = set.slice((page - 1) * pageSize, page * pageSize).map((a) => decorate(a, locale));
  const featured = !active && page === 1 ? (items.find((i) => i.is_featured) ?? null) : null;
  return { items, total, page, pageCount, requestedPage, pageSize, featured, filter: { q, category, tag, active } };
}

/** Sidebar categories (in_sidebar, by sort) with the computed number of published articles. */
export async function getNewsCategories(locale: Locale) {
  const all = visibleArticles();
  return bySort(published(categories))
    .filter((c) => c.in_sidebar)
    .map((c) => ({ ...resolveRecord(c, locale), count: all.filter((a) => a.category === c.id).length }));
}

/** Trending tags (trending = true, by sort). */
export async function getNewsTags(locale: Locale) {
  return bySort(published(tags))
    .filter((t) => t.trending)
    .map((t) => resolveRecord(t, locale));
}

export async function getResources(locale: Locale) {
  return bySort(published(resources)).map((r) => resolveRecord(r, locale));
}

/** The sidebar white-paper card (article spec name). */
export async function getPromo(locale: Locale) {
  return (await getResources(locale)).find((r) => r.slot === 'sidebar') ?? null;
}

/** One published article by slug (null when unknown, draft or archived). Never throws. */
export async function getNewsBySlug(locale: Locale, slug: string): Promise<NewsItem | null> {
  const a = visibleArticles().find((x) => x.slug === slug);
  return a ? decorate(a, locale) : null;
}

/** The n newest published articles other than `slug` (Industry Insights on the article page). */
export async function getRelatedNews(locale: Locale, slug: string, n = 3): Promise<NewsItem[]> {
  const count = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  return visibleArticles()
    .filter((a) => a.slug !== slug)
    .slice(0, count)
    .map((a) => ({ ...decorate(a, locale), image: a.related_image ?? a.list_image ?? a.cover ?? null }));
}

/** The n newest published articles (Industry Insights on the list page; same data as Home). */
export async function getInsightsNews(locale: Locale, n = 3): Promise<NewsItem[]> {
  const count = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  return visibleArticles()
    .slice(0, count)
    .map((a) => decorate(a, locale));
}

/** Slugs of every published article (generateStaticParams). */
export async function getNewsSlugs(): Promise<string[]> {
  return visibleArticles().map((a) => a.slug);
}

export type PageLabel = { n: number } | { gap: true };

/**
 * Pagination items: first, last, current and current±1; a gap of 2+ hidden numbers becomes an ellipsis;
 * at the first/last page three consecutive numbers are shown at that edge; up to 5 pages show all.
 * Example (8 pages): 1 -> 1 2 3 … 8; 4 -> 1 … 3 4 5 … 8; 8 -> 1 … 6 7 8.
 */
export function pageList(current: number, total: number): PageLabel[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => ({ n: i + 1 }));
  const keep = new Set<number>([1, total, current - 1, current, current + 1]);
  if (current <= 1) { keep.add(2); keep.add(3); }
  if (current >= total) { keep.add(total - 1); keep.add(total - 2); }
  const nums = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: PageLabel[] = [];
  nums.forEach((n, i) => {
    const prev = nums[i - 1];
    if (prev !== undefined && n - prev >= 2) out.push({ gap: true });
    out.push({ n });
  });
  return out;
}
export const getPageList = pageList;

/** Two-digit page label: 1 -> "01". */
export const pageLabel = (n: number) => String(n).padStart(2, '0');
