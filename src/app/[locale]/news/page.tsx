import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { isAppLocale } from '@/lib/i18n/locales';
import { getMessages } from '@/lib/i18n/messages';
import { href } from '@/lib/i18n/paths';
import { getNewsCategories, getNewsPage, getNewsTags, getFeaturedNews, getPromo, getInsightsNews, getResources, NEWS_Q_MAX, pageList } from '@/lib/cms/pages/news';
import { PageShell } from '@/components/shell/PageShell';
import { Cta } from '@/components/cta/Cta';
import { Breadcrumb, InnerHero, heroTitleClass } from '@/components/news-page/Hero';
import { ArticleRow, FeaturedCard, Pagination } from '@/components/news-page/ArticleList';
import { SearchPanel, SidebarRest } from '@/components/news-page/Sidebar';
import { Insights } from '@/components/news-page/Insights';
import { Banners } from '@/components/news-page/Banners';
import { fill } from '@/components/news-page/format';
import { newsHref } from '@/components/news-page/urls';
import t from '@/lib/i18n/messages/pages/news.en.json';

// Hero backgrounds (cut from the design export, see src/content/fixtures/pages/news/extract_images.py).
const HERO_1 = 'f71c4cd6-cad9-51f7-9b48-52e2dcb27f3b';
const HERO_2 = '6da74a9a-c0b8-567e-b922-9f73bb973f42';

type SP = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function parse(sp: SP) {
  const rawQ = first(sp.q);
  const q = (rawQ ?? '').trim().slice(0, NEWS_Q_MAX);
  const category = (first(sp.category) ?? '').trim();
  const tag = (first(sp.tag) ?? '').trim();
  const n = Number(first(sp.page));
  const page = Number.isInteger(n) && n >= 1 ? n : 1;
  return { rawQ, q, category, tag, page };
}

export async function generateMetadata({ params, searchParams }: PageProps<'/[locale]/news'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const p = parse(await searchParams);
  const filtered = !!(p.q || p.category || p.tag);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { canonical: newsHref(locale, filtered ? {} : { page: p.page }) },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function NewsPage({ params, searchParams }: PageProps<'/[locale]/news'>) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const p = parse(await searchParams);

  // Normalize the search term in the URL (trimmed, no empty `q=`), so a plain GET form gives clean URLs.
  if (p.rawQ !== undefined && (p.q === '' || p.rawQ !== p.q)) redirect(newsHref(locale, { q: p.q, category: p.category, tag: p.tag, page: p.page }));

  const m = getMessages(locale);
  const [list, categories, tags, resources, featured, insightItems, promo] = await Promise.all([
    getNewsPage(locale, { page: p.page, q: p.q, category: p.category, tag: p.tag }),
    getNewsCategories(locale),
    getNewsTags(locale),
    getResources(locale),
    getFeaturedNews(locale),
    getInsightsNews(locale, 3), // the 3 newest published articles (same as Home)
    getPromo(locale),
  ]);
  const filter = list.filter;
  if (list.requestedPage > list.pageCount) permanentRedirect(newsHref(locale, { ...filter, page: list.pageCount }));

  const card = list.featured;
  const rows = list.items.filter((i) => i !== card);
  const empty = list.items.length === 0;
  const status = list.total === 1 ? t.status.one : fill(t.status.many, { n: list.total });

  return (
    <PageShell locale={locale}>
      {featured && (
        <InnerHero file={HERO_1} titleTop={249}>
          <p className={heroTitleClass}>{featured.translations[0]?.title}</p>
          <Breadcrumb t={t.breadcrumb} locale={locale} current="detail" />
        </InnerHero>
      )}

      <div className="mx-auto w-full max-w-[1360px] px-[16px] pb-[56px] pt-[40px] md:px-[24px] md:pb-[64px] md:pt-[56px] lg:px-[40px] xl:pb-[82px] xl:pt-[101px]">
        <div className="flex flex-col gap-y-[40px] lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:grid-rows-[auto_1fr] lg:gap-x-[40px] lg:gap-y-[48px] xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-x-[64px] 2xl:grid-cols-[minmax(0,1fr)_384px] 2xl:gap-x-[128px]">
          <div className="order-2 min-w-0 lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <p role="status" className="sr-only">{status}</p>
            {empty ? (
              <div>
                <p className="m-0 text-[17px] leading-[26px] text-[#444654]">{filter.q ? fill(t.empty.noneFor, { q: filter.q }) : t.empty.none}</p>
                <Link href={href(locale, 'news')} className="mt-[16px] inline-flex min-h-[44px] items-center text-[13px] font-bold uppercase tracking-[1.3px] text-[#0224a6] hover:underline">{t.empty.clear}</Link>
              </div>
            ) : (
              <>
                {card && <FeaturedCard t={t.featured} locale={locale} item={card} />}
                <div role="list" aria-label={t.featured.listLabel} className={`flex flex-col gap-[40px] xl:gap-[64px] ${card ? 'mt-[40px] xl:mt-[47px]' : ''}`}>
                  {rows.map((item) => (
                    <div role="listitem" key={item.id}><ArticleRow t={t.row} locale={locale} item={item} /></div>
                  ))}
                </div>
                <Pagination t={t.pagination} locale={locale} page={list.page} pageCount={list.pageCount} labels={pageList(list.page, list.pageCount)} filter={{ q: filter.q, category: filter.category, tag: filter.tag }} />
              </>
            )}
          </div>
          <div className="order-1 lg:order-none lg:col-start-2 lg:row-start-1">
            <SearchPanel t={t.sidebar} locale={locale} q={filter.q} />
          </div>
          <div className="order-3 lg:order-none lg:col-start-2 lg:row-start-2">
            <SidebarRest t={t.sidebar} r={t.resource} locale={locale} categories={categories} tags={tags} promo={promo} filter={filter} />
          </div>
        </div>
      </div>

      <InnerHero file={HERO_2} titleTop={275}>
        <h1 className={heroTitleClass}>{t.hero.title}</h1>
        <Breadcrumb t={t.breadcrumb} locale={locale} current="news" />
      </InnerHero>

      <div className="pb-[48px] xl:pb-[120px]">
        <Insights t={t.insights} home={m.news} slideLabel={t.insights.slide} locale={locale} items={insightItems} className="pt-[56px] xl:pt-[123px]" />
        <Banners r={t.resource} left={resources.find((r) => r.slot === 'banner_left')} right={resources.find((r) => r.slot === 'banner_right')} />
      </div>
      <div className="md:-mb-px">
        <Cta t={m.cta} locale={locale} />
      </div>
    </PageShell>
  );
}
