import Link from 'next/link';
import { ArrowRightLong, ArrowLeftLong } from './icons';
import { ChevronRight } from '@/components/ui/icons';
import { CmsImage } from '@/components/ui/Image';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import type { NewsItem, PageLabel } from '@/lib/cms/pages/news';
import { formatDate, fill } from './format';
import { newsHref, type NewsFilter } from './urls';
import newsMessages from '@/lib/i18n/messages/pages/news.en.json';

type T = typeof newsMessages;

const title = (n: NewsItem) => n.translations[0]?.title ?? '';
const articleHref = (locale: AppLocale, n: NewsItem) => href(locale, `news/${n.slug}`);

/** The large card on top of page 1 of the default view. One tab stop (the title); cover and link are mouse shortcuts. */
export function FeaturedCard({ t, locale, item }: { t: T['featured']; locale: AppLocale; item: NewsItem }) {
  const tr = item.translations[0];
  const to = articleHref(locale, item);
  return (
    <article className="group border-b border-[#e7e5ee] pb-[46px]">
      <div className="relative">
        {item.image && (
          <Link href={to} tabIndex={-1} aria-hidden="true" className="block overflow-hidden">
            <CmsImage file={item.image} alt={item.cover_alt || title(item)} width={861} height={329} priority className="block aspect-[16/10] h-auto w-full object-cover md:aspect-[768/329]" />
          </Link>
        )}
        {item.categoryName && (
          <span className="absolute left-0 top-0 flex h-[32px] items-center bg-[#790008] px-[16px] text-[12px] font-bold uppercase leading-[16px] tracking-[1.2px] text-white">{item.categoryName}</span>
        )}
      </div>
      <p className="m-0 mt-[24px] flex items-center gap-[16px] text-[13px] font-bold uppercase leading-[16px] text-[#444654]">
        <time dateTime={item.published_at}>{formatDate(item.published_at, locale)}</time>
        <span aria-hidden="true" className="h-px w-[32px] bg-[#c9c7d3]" />
        <span>{t.metaLabel}</span>
      </p>
      <h3 className="m-0 mt-[16px] text-[26px] font-bold leading-[32px] tracking-[-0.6px] text-[#1a1b23] md:text-[36px] md:leading-[40px] md:tracking-[-0.9px]">
        <Link href={to} className="hover:text-[#0224a6]">{title(item)}</Link>
      </h3>
      <p className="m-0 mt-[16px] text-[16px] leading-[26px] text-[#444654]">{tr?.excerpt}</p>
      <Link href={to} aria-label={`${t.readFull}: ${title(item)}`} className="mt-[16px] inline-flex items-center gap-[8px] text-[13px] font-bold uppercase leading-[16px] tracking-[0.3px] text-[#0224a6]">
        {t.readFull}
        <ArrowRightLong className="h-[12px] w-[12px] transition-transform group-hover:translate-x-[4px]" />
      </Link>
    </article>
  );
}

export function ArticleRow({ t, locale, item }: { t: T['row']; locale: AppLocale; item: NewsItem }) {
  const tr = item.translations[0];
  const to = articleHref(locale, item);
  return (
    <article className="group grid grid-cols-1 gap-[16px] md:grid-cols-[200px_minmax(0,1fr)] md:gap-[24px] lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-[245px_minmax(0,1fr)] 2xl:gap-[32px]">
      {item.image && (
        <Link href={to} tabIndex={-1} aria-hidden="true" className="block aspect-[16/9] overflow-hidden md:aspect-square">
          <CmsImage file={item.image} alt={item.cover_alt || title(item)} width={245} height={245} className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        </Link>
      )}
      <div className="min-w-0">
        <p className="m-0 text-[12px] font-bold uppercase leading-[16px] tracking-[-0.45px] text-[#790008]">
          {item.categorySlug ? (
            <Link href={newsHref(locale, { category: item.categorySlug })} className="hover:underline">{item.categoryName}</Link>
          ) : (
            item.categoryName
          )}
        </p>
        <h3 className="m-0 mt-[12px] text-[22px] font-bold leading-[28px] text-[#1a1b23] md:text-[24px] md:leading-[30px]">
          <Link href={to} className="hover:text-[#0224a6]">{title(item)}</Link>
        </h3>
        <p className="m-0 mt-[10px] text-[13px] leading-[20px] text-[#444654]"><time dateTime={item.published_at}>{formatDate(item.published_at, locale)}</time></p>
        <p className="m-0 mt-[6px] text-[14px] leading-[23px] text-[#444654] md:line-clamp-3 2xl:line-clamp-2">{tr?.excerpt}</p>
        <Link href={to} aria-label={`${t.continue}: ${title(item)}`} className="mt-[14px] inline-flex items-center gap-[4px] text-[13px] font-bold uppercase leading-[16px] tracking-[0.4px] text-[#0224a6]">
          {t.continue}
          <ChevronRight className="h-[12px] w-[12px] transition-transform group-hover:translate-x-[3px]" />
        </Link>
      </div>
    </article>
  );
}

export function Pagination({
  t,
  locale,
  page,
  pageCount,
  labels,
  filter,
}: {
  t: T['pagination'];
  locale: AppLocale;
  page: number;
  pageCount: number;
  labels: PageLabel[];
  filter: NewsFilter;
}) {
  const link = 'inline-flex items-center gap-[8px] text-[12px] font-bold uppercase leading-[16px] tracking-[1.2px] text-[#444654]';
  const edge = (dir: 'prev' | 'next') => {
    const target = dir === 'prev' ? page - 1 : page + 1;
    const off = target < 1 || target > pageCount;
    const Arrow = dir === 'prev' ? ArrowLeftLong : ArrowRightLong;
    const label = dir === 'prev' ? t.previous : t.next;
    const icon = <Arrow className="h-[20px] w-[20px]" />;
    const body = dir === 'prev' ? <>{icon}{label}</> : <>{label}{icon}</>;
    const cls = `${link} min-h-[44px] xl:min-h-0 `;
    if (off) {
      return (
        <button type="button" aria-disabled="true" className={`${cls} cursor-not-allowed opacity-40`}>{body}</button>
      );
    }
    return (
      <Link href={newsHref(locale, { ...filter, page: target })} rel={dir} className={`${cls} hover:text-[#0224a6]`}>
        {body}
      </Link>
    );
  };
  return (
    <nav aria-label={t.label} className="mt-[48px] xl:mt-[93px]">
      <ul className="m-0 grid list-none grid-cols-2 items-center gap-y-[8px] p-0 md:grid-cols-[1fr_auto_1fr]">
        <li className="order-first col-span-2 md:order-none md:col-span-1 md:col-start-2 md:row-start-1 md:ml-[35px]">
          <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-[4px] p-0 md:gap-x-[16px]">
            {labels.map((l, i) =>
              'gap' in l ? (
                <li key={`g${i}`} aria-hidden="true" className="px-[6px] text-[16px] text-[#444654] md:px-0">{t.gap}</li>
              ) : (
                <li key={l.n}>
                  {l.n === page ? (
                    <span aria-current="page" className="flex h-[44px] min-w-[44px] items-center justify-center text-[16px] font-bold leading-[24px] text-[#0224a6] md:h-auto md:min-w-0">{String(l.n).padStart(2, '0')}</span>
                  ) : (
                    <Link href={newsHref(locale, { ...filter, page: l.n })} aria-label={fill(t.page, { n: l.n })} className="flex h-[44px] min-w-[44px] items-center justify-center text-[16px] leading-[24px] text-[#444654] hover:text-[#0224a6] md:h-auto md:min-w-0">{String(l.n).padStart(2, '0')}</Link>
                  )}
                </li>
              ),
            )}
          </ul>
        </li>
        <li className="justify-self-start md:col-start-1 md:row-start-1">{edge('prev')}</li>
        <li className="justify-self-end md:col-start-3 md:row-start-1">{edge('next')}</li>
      </ul>
    </nav>
  );
}
