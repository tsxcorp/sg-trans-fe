import Link from 'next/link';
import { Carousel } from '@/components/ui/Carousel';
import { ChevronRight, UserIcon } from '@/components/ui/icons';
import { CommentsIcon } from './icons';
import { CmsImage } from '@/components/ui/Image';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import type { Messages } from '@/lib/i18n/messages';
import type { NewsItem } from '@/lib/cms/pages/news';
import { pad2 } from './format';
import newsMessages from '@/lib/i18n/messages/pages/news.en.json';

const ACTIVE_BY_DEFAULT = 0; // from xl the design draws the first card in its hover state

/**
 * "Industry Insights": the newest articles as cards (same card as Home, wider). Below lg a scroll-snap carousel with
 * dots (inside its own box); from lg a 3-column grid; from xl the design (413 px cards in a 1280 px container).
 */
export function Insights({
  t,
  home,
  slideLabel,
  locale,
  items,
  className = '',
  variant = 'carousel',
}: {
  t: (typeof newsMessages)['insights'];
  home: Messages['news'];
  slideLabel: string;
  locale: AppLocale;
  items: NewsItem[];
  className?: string;
  /** Below lg: `carousel` (scroll-snap with dots, list page) or `grid` (2 columns like the Home news block, article page). */
  variant?: 'carousel' | 'grid';
}) {
  const grid = variant === 'grid';
  const small = grid; // 2 columns on phones: Home-like small type, no author/comments line
  const cards = items.map((n, i) => {
    const tr = n.translations[0];
    const to = href(locale, `news/${n.slug}`);
    return (
      <div
        key={n.id}
        data-active={i === ACTIVE_BY_DEFAULT ? 'true' : undefined}
        className={`hl-card group relative flex w-full flex-col bg-white shadow-[inset_0_0_0_1px_#e5e5e5] transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] data-[active=true]:shadow-[0_4px_20px_rgba(0,0,0,0.12)] ${small ? 'p-[8px]' : 'p-[12px]'} md:p-[14px] xl:min-h-[558px] xl:p-[16px]`}
      >
        {n.image && (
          <Link href={to} tabIndex={-1} aria-hidden="true" className="block">
            <CmsImage file={n.image} alt={n.cover_alt || tr?.title || ''} width={382} height={277} className="block aspect-[382/277] h-auto w-full max-w-none rounded-[6px] object-cover 2xl:w-[382px]" />
          </Link>
        )}
        <h3 className={`m-0 mt-[12px] font-bold text-navy md:text-[18px] md:leading-[28px] xl:mt-[20px] xl:pr-[2.8px] xl:text-[22px] xl:leading-[34px] xl:tracking-[0.17px] ${small ? 'text-[12px] leading-[17px]' : 'text-[16px] leading-[24px]'}`}>
          <Link href={to} className="hover:underline">{tr?.title}</Link>
        </h3>
        <p className={`m-0 mt-[12px] flex-wrap items-center gap-x-[18px] gap-y-[4px] text-[12px] leading-[20px] text-[#abb1ba] xl:mt-[24px] xl:gap-x-[26px] xl:text-[14px] ${small ? 'hidden md:flex' : 'flex'}`}>
          {n.author && (
            <span className="flex items-center gap-[8px]">
              <UserIcon className="h-[16px] w-[16px] text-red" />
              <span><span className="sr-only">{t.authorLabel}: </span>{n.author}</span>
            </span>
          )}
          <span className="flex items-center gap-[8px]"><CommentsIcon className="h-[17px] w-[17px] text-red" />{home.comments} ({pad2(n.comments_count ?? 0)})</span>
        </p>
        <Link href={to} aria-label={`${home.readMore}: ${tr?.title}`} className={`hl-news inline-flex items-center gap-[8px] font-medium md:text-[14px] xl:mt-[25px] xl:text-[16px] ${small ? 'mt-auto pt-[8px] text-[10px] md:mt-[14px] md:pt-0' : 'mt-[14px] text-[14px]'}`}>
          {home.readMore}
          <ChevronRight className="h-[12px] w-[12px] xl:h-[14px] xl:w-[14px]" />
        </Link>
      </div>
    );
  });
  return (
    <section aria-labelledby="insights-title" className={`mx-auto w-full max-w-[1360px] px-[16px] md:px-[24px] lg:px-[40px] ${className}`}>
      <p className="m-0 text-[14px] font-bold italic leading-[24px] text-red underline md:text-[18px] xl:text-[20px]">{t.eyebrow}</p>
      <div className="mt-[10px] flex items-end justify-between xl:mt-[20px]">
        <h2 id="insights-title" className="m-0 text-[32px] font-bold leading-[40px] text-navy md:text-[44px] md:leading-[54px] xl:text-[56.4px] xl:leading-[64px]">{t.title}</h2>
        <span aria-hidden="true" className="mb-[14px] hidden h-[2px] w-[128px] bg-[#a4000f] md:block" />
      </div>
      <div className="mt-[28px] xl:mt-[48px]">
        {grid ? (
          <ul data-hl-list className="m-0 grid list-none grid-cols-2 gap-[12px] p-0 md:gap-[20px] lg:grid-cols-3 2xl:grid-cols-[413px_414px_413px]">
            {cards.map((c, i) => (
              <li key={items[i].id} className="flex">{c}</li>
            ))}
          </ul>
        ) : (
          <Carousel
            label={t.carouselLabel}
            slideLabel={slideLabel}
            trackClassName="gap-[12px] pb-[4px] lg:grid lg:grid-cols-3 lg:gap-[20px] lg:overflow-visible lg:pb-0 2xl:grid-cols-[413px_414px_413px]"
            itemClassName="flex w-[calc(50%-6px)] min-w-[200px] shrink-0 md:w-[calc(50%-10px)] lg:w-auto lg:min-w-0"
            dotsClassName="lg:hidden"
          >
            {cards}
          </Carousel>
        )}
      </div>
    </section>
  );
}
