import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAppLocale, locales } from '@/lib/i18n/locales';
import { getMessages } from '@/lib/i18n/messages';
import { assetUrl } from '@/lib/cms';
import { getNewsBySlug, getNewsCategories, getNewsSlugs, getNewsTags, getPromo, getRelatedNews } from '@/lib/cms/pages/news';
import { PageShell } from '@/components/shell/PageShell';
import { Cta } from '@/components/cta/Cta';
import { Breadcrumb, InnerHero, heroTitleClass } from '@/components/news-page/Hero';
import { SearchPanel, SidebarRest } from '@/components/news-page/Sidebar';
import { Insights } from '@/components/news-page/Insights';
import { newsHref } from '@/components/news-page/urls';
import { Blocks } from '@/components/news-article/Blocks';
import { CmsImage } from '@/components/ui/Image';
import list from '@/lib/i18n/messages/pages/news.en.json';
import t from '@/lib/i18n/messages/pages/news-article.en.json';

const HERO_1 = 'f71c4cd6-cad9-51f7-9b48-52e2dcb27f3b';

export const dynamicParams = true; // unknown slugs render on demand and end in notFound()

export async function generateStaticParams() {
  const slugs = await getNewsSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

const plain = (s: string) => s.replace(/\s+/g, ' ').trim();

export async function generateMetadata({ params }: PageProps<'/[locale]/news/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) return {};
  const a = await getNewsBySlug(locale, slug);
  if (!a) return {};
  const tr = a.translations[0];
  const first = tr.body.find((b) => b.type === 'paragraph' || b.type === 'lead');
  const description = tr.excerpt || (first && 'text' in first ? plain(first.text).slice(0, 160) : undefined);
  const title = `${tr.title} | ${t.meta.siteName}`;
  const canonical = `/${locale}/news/${a.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: a.published_at,
      url: canonical,
      images: a.cover ? [{ url: assetUrl(a.cover) }] : undefined,
    },
  };
}

export default async function NewsArticlePage({ params }: PageProps<'/[locale]/news/[slug]'>) {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  const article = await getNewsBySlug(locale, slug);
  if (!article) notFound();

  const m = getMessages(locale);
  const [categories, tags, promo, related] = await Promise.all([
    getNewsCategories(locale),
    getNewsTags(locale),
    getPromo(locale),
    getRelatedNews(locale, article.slug, 3),
  ]);
  const tr = article.translations[0];

  return (
    <PageShell locale={locale}>
      <InnerHero file={HERO_1} titleTop={249}>
        <h1 className={heroTitleClass}>{tr.title}</h1>
        <Breadcrumb t={t.breadcrumb} locale={locale} current="detail" />
      </InnerHero>

      <div className="mx-auto w-full max-w-[1360px] px-[16px] pt-[32px] md:px-[24px] md:pt-[48px] lg:px-[40px] xl:pt-[80px]">
        <div className="flex flex-col gap-y-[40px] lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-x-[24px] xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-x-[32px] 2xl:grid-cols-[minmax(0,1fr)_384px]">
          <article aria-label={t.article.bodyLabel} className="min-w-0">
            {article.cover && (
              <CmsImage file={article.cover} alt={article.cover_alt || tr.title} width={861} height={329} priority className="block aspect-[861/329] h-auto min-h-[180px] w-full max-w-[861px] object-cover" />
            )}
            <div className="mt-[32px] xl:mt-[47px]">
              <Blocks blocks={tr.body} />
            </div>
            {article.tagItems.length > 0 && (
              <div className="mt-[40px] border-t border-[#e7e5ee] pt-[32px] xl:mt-[64px]">
                <ul aria-label={t.article.tagsLabel} className="m-0 flex list-none flex-wrap gap-[8px] p-0 xl:gap-[12px]">
                  {article.tagItems.map((tag) => (
                    <li key={tag.id}>
                      <Link href={newsHref(locale, { tag: tag.slug })} className="flex h-[30px] items-center bg-[#eeedf7] px-[16px] text-[11px] font-bold uppercase leading-[16px] tracking-[0.2px] text-[#444654] hover:bg-[#0224a6] hover:text-white max-md:min-h-[44px]">{tag.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
          <aside className="flex flex-col gap-[48px]">
            <SearchPanel t={list.sidebar} locale={locale} />
            <SidebarRest t={list.sidebar} r={list.resource} locale={locale} categories={categories} tags={tags} promo={promo} filter={{}} />
          </aside>
        </div>
      </div>

      <div className="pb-[48px] xl:pb-[119px]">
        <Insights t={list.insights} home={m.news} slideLabel={list.insights.slide} variant="grid" locale={locale} items={related} className="pt-[56px] xl:pt-[204px]" />
      </div>
      <Cta t={m.cta} locale={locale} />
    </PageShell>
  );
}
