import Link from 'next/link';
import type { AppLocale } from '@/lib/i18n/locales';
import type { getNewsCategories, getNewsTags, getPromo } from '@/lib/cms/pages/news';
import { DocumentIcon, SearchIcon } from './icons';
import { ResourceAction } from './ResourceAction';
import { pad2 } from './format';
import { newsHref } from './urls';
import newsMessages from '@/lib/i18n/messages/pages/news.en.json';

type T = typeof newsMessages;
type Category = Awaited<ReturnType<typeof getNewsCategories>>[number];
type Tag = Awaited<ReturnType<typeof getNewsTags>>[number];
type Promo = Awaited<ReturnType<typeof getPromo>>;
export type SidebarFilter = { q?: string | null; category?: string | null; tag?: string | null };

function WidgetTitle({ id, children, rule = 'h-[2px] bg-[#8091d2]' }: { id: string; children: string; rule?: string }) {
  return (
    <h2 id={id} className="m-0 flex h-[16px] items-center justify-between text-[12px] font-bold uppercase leading-[16px] tracking-[1.8px] text-[#1a1b23]">
      {children}
      <span aria-hidden="true" className={`w-[32px] ${rule}`} />
    </h2>
  );
}

/** "Search Insights": a GET form to the list page (works without JS; the list page normalizes the term). */
export function SearchPanel({ t, locale, q }: { t: T['sidebar']; locale: AppLocale; q?: string | null }) {
  return (
    <section aria-labelledby="sb-search" className="bg-[#eeedf7] p-[24px] xl:p-[32px]">
      <WidgetTitle id="sb-search">{t.searchTitle}</WidgetTitle>
      <form role="search" method="get" action={newsHref(locale)} className="mt-[24px]">
        <div className="flex h-[52px] items-center bg-white">
          <label htmlFor="news-search" className="sr-only">{t.searchLabel}</label>
          <input id="news-search" name="q" type="search" maxLength={100} defaultValue={q ?? ''} placeholder={t.searchPlaceholder} autoComplete="off" className="h-full min-w-0 flex-1 bg-transparent pl-[24px] pr-[8px] text-[15px] text-[#1a1b23] placeholder:text-[#7c7e8c] focus-visible:shadow-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0224a6]" />
          <button type="submit" className="flex h-[52px] w-[52px] shrink-0 items-center justify-center text-[#0224a6]">
            <SearchIcon className="h-[20px] w-[20px]" />
            <span className="sr-only">{t.searchSubmit}</span>
          </button>
        </div>
      </form>
    </section>
  );
}

export function SidebarRest({
  t,
  r,
  locale,
  categories,
  tags,
  promo,
  filter,
}: {
  t: T['sidebar'];
  r: T['resource'];
  locale: AppLocale;
  categories: Category[];
  tags: Tag[];
  promo: Promo;
  filter: SidebarFilter;
}) {
  const p = promo?.translations[0];
  return (
    <div className="flex flex-col gap-[48px]">
      <section aria-labelledby="sb-categories">
        <WidgetTitle id="sb-categories">{t.categoriesTitle}</WidgetTitle>
        <ul className="m-0 mt-[16px] list-none p-0">
          {categories.map((c) => {
            const on = filter.category === c.slug && !filter.q;
            return (
              <li key={c.id}>
                <Link
                  href={newsHref(locale, { category: c.slug })}
                  aria-current={on ? 'true' : undefined}
                  className={`group flex min-h-[57px] items-center justify-between pt-[8px] gap-[12px] border-b border-[#e7e5ee] text-[15px] leading-[22px] hover:text-[#0224a6] ${on ? 'font-bold text-[#0224a6]' : 'text-[#1a1b23]'}`}
                >
                  {c.translations[0]?.name}
                  <span className={`flex h-[24px] min-w-[28px] items-center justify-center px-[6px] text-[12px] font-bold ${on ? 'bg-[#0224a6] text-white' : 'bg-[#eeedf7] text-[#444654]'}`}>{pad2(c.count)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {promo && p && (
        <section aria-labelledby="sb-resource" className="bg-gradient-to-br from-[#0224a6] to-[#1a1f8e] px-[24px] pb-[36px] pt-[24px] text-white xl:px-[32px] xl:pt-[32px]">
          <DocumentIcon className="h-[32px] w-[32px] text-[#8fa0e8]" />
          <h2 id="sb-resource" className="m-0 mt-[18px] max-w-[210px] text-[24px] font-bold leading-[30px] sm:max-w-none xl:max-w-[210px]">{p.title}</h2>
          <p className="m-0 text-[14px] leading-[22px] text-[#b9c4f5]">{p.description}</p>
          <ResourceAction
            file={promo.file}
            label={p.cta_label}
            unavailable={r.unavailable}
            variant="card"
            icon
            className="mt-[33px] flex h-[48px] w-full items-center justify-center gap-[10px] bg-white text-[12px] font-bold uppercase tracking-[1.2px] text-[#0224a6] hover:bg-[#eeedf7]"
          />
        </section>
      )}

      <section aria-labelledby="sb-tags">
        <WidgetTitle id="sb-tags" rule="h-px bg-[#0224a6]">{t.tagsTitle}</WidgetTitle>
        <ul className="m-0 mt-[25px] flex list-none flex-wrap gap-[8px] p-0">
          {tags.map((tag) => {
            const on = filter.tag === tag.slug && !filter.q && !filter.category;
            return (
              <li key={tag.id}>
                <Link
                  href={newsHref(locale, { tag: tag.slug })}
                  aria-current={on ? 'true' : undefined}
                  className={`flex h-[32px] items-center px-[16px] text-[12px] font-bold uppercase leading-[16px] tracking-[-0.2px] hover:bg-[#0224a6] hover:text-white ${on ? 'bg-[#0224a6] text-white' : 'bg-[#eeedf7] text-[#444654]'}`}
                >
                  {tag.translations[0]?.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
