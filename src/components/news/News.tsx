import Link from 'next/link';
import { ChevronRight, CommentIcon, UserIcon } from '@/components/ui/icons';
import { CmsImage } from '@/components/ui/Image';
import { HighlightGroup } from '@/components/ui/HighlightGroup';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import type { Messages } from '@/lib/i18n/messages';
import type { getLatestNews } from '@/lib/cms';

type Item = Awaited<ReturnType<typeof getLatestNews>>[number];
const ACTIVE_BY_DEFAULT = 0; // from xl the design shows the first card in its hover state

export function News({ t, news, locale }: { t: Messages['news']; news: Item[]; locale: AppLocale }) {
  return (
    <section aria-labelledby="news-title" className="relative pb-[56px] pt-[24px] pl-[23px] text-left md:px-0 md:text-center xl:absolute xl:inset-x-0 xl:top-[1468px] xl:p-0">
      <p className="m-0 text-[12px] font-bold italic leading-[20px] text-red underline xl:leading-[24px] md:text-[18px] xl:text-[20px]">{t.eyebrow}</p>
      <h2 id="news-title" className="m-0 mt-[8px] pr-[20px] text-[32px] font-bold leading-[38px] text-navy md:px-[20px] md:text-[44px] md:leading-[54px] xl:mt-[20px] xl:text-[57px] xl:leading-[64px]">{t.title}</h2>
      <p className="m-0 mx-auto mt-[16px] hidden max-w-[580px] px-[20px] text-[14px] leading-[26px] text-muted md:block md:text-[16px] md:leading-[32px] xl:mt-[17px]">{t.subtitle}</p>
      <HighlightGroup defaultIndex={ACTIVE_BY_DEFAULT}>
      <ul data-hl-list className="m-0 mx-auto mt-[28px] grid list-none grid-cols-2 gap-[12px] p-0 pr-[16px] text-left md:max-w-[960px] md:px-[16px] md:grid-cols-3 md:gap-[20px] xl:mt-[47px] xl:flex xl:w-[1180px] xl:max-w-none xl:items-stretch xl:justify-between xl:gap-[20px] xl:px-0">
        {news.map((n, i) => {
          const tr = n.translations[0];
          return (
            <li key={n.id} data-active={i === ACTIVE_BY_DEFAULT ? 'true' : 'false'} className="hl-card group flex flex-col rounded-[10px] bg-white p-[8px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-shadow data-[active=true]:shadow-[0_4px_20px_rgba(0,0,0,0.12)] md:p-[12px] xl:w-[380px] xl:rounded-[16px] xl:p-[16px]">
              {n.cover && <CmsImage file={n.cover} alt="" width={348} height={278} className="block aspect-[348/278] h-auto w-full rounded-[2px] object-cover" />}
              <h3 className="m-0 mt-[10px] text-[11px] font-bold leading-[15px] text-navy md:text-[14px] md:leading-[19px] md:mt-[14px] md:text-[18px] md:leading-[28px] xl:mt-[16px] xl:text-[22px] xl:leading-[36px] xl:tracking-[0.06px]">{tr?.title}</h3>
              <p className="m-0 mt-[10px] hidden flex-wrap items-center gap-x-[14px] gap-y-[4px] text-[11px] leading-[16px] text-[#9a9a9a] xl:mt-[16px] xl:gap-x-[20px] xl:text-[13px] xl:leading-[20px] md:flex">
                <span className="flex items-center gap-[6px]"><UserIcon className="h-[14px] w-[14px] text-red xl:h-[16px] xl:w-[16px]" />{n.author}</span>
                <span className="flex items-center gap-[6px]"><CommentIcon className="h-[14px] w-[14px] text-red xl:h-[16px] xl:w-[16px]" />{t.comments} ({String(n.comments_count ?? 0).padStart(2, '0')})</span>
              </p>
              <Link href={href(locale, `news/${n.slug}`)} aria-label={`${t.readMore}: ${tr?.title}`} className="hl-news mt-auto inline-flex items-center gap-[6px] pt-[8px] text-[9px] font-medium shadow-none md:pt-[12px] md:text-[14px] xl:gap-[8px] xl:pt-[16px] xl:text-[16px]">
                {t.readMore}
                <ChevronRight className="h-[12px] w-[12px]" />
              </Link>
            </li>
          );
        })}
      </ul>
      </HighlightGroup>
    </section>
  );
}
