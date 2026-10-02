import Link from 'next/link';
import { ArrowRightCircle } from '@/components/ui/icons';
import { Carousel } from '@/components/ui/Carousel';
import { CmsImage } from '@/components/ui/Image';
import { StickyHighlightGroup } from './StickyHighlightGroup';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import { ServiceIcon } from './icons';
import { GroupHeading } from './GroupHeading';
import type { Child, Group, OurServiceMessages } from './types';

const ACTIVE_BY_DEFAULT = 1; // the design draws the second card in its hover state

export function TilesGroup({ group, t, locale }: { group: Group; t: OurServiceMessages; locale: AppLocale }) {
  const g = group.translations[0];
  return (
    <section id={group.slug} aria-labelledby={`${group.slug}-title`} className="bg-[#f5f8fe] py-[48px] md:py-[64px] xl:pb-[32px] xl:pt-[134px]">
      <GroupHeading id={`${group.slug}-title`} eyebrow={g.section_eyebrow} title={g.section_title ?? g.title} align="center" className="px-[20px] xl:[&_h2]:mt-[18px]" />
      <div className="mx-auto mt-[28px] max-w-[1856px] xl:mt-[62px]">
        <StickyHighlightGroup>
        <Carousel
          label={g.section_title ?? g.title}
          slideLabel={t.slide}
          trackClassName="gap-[16px] px-[20px] md:grid md:grid-cols-2 md:gap-0 md:overflow-visible md:px-0 lg:grid-cols-6"
          itemClassName="w-[85%] shrink-0 md:w-auto md:min-w-0 md:last:col-span-2 lg:col-span-2 lg:nth-[n+4]:col-span-3 lg:last:col-span-3"
          dotsClassName="md:hidden"
        >
          {group.children.map((c, i) => (
            <Tile key={c.id} child={c} active={i === ACTIVE_BY_DEFAULT} t={t} locale={locale} />
          ))}
        </Carousel>
        </StickyHighlightGroup>
      </div>
    </section>
  );
}

function Tile({ child, active, t, locale }: { child: Child; active: boolean; t: OurServiceMessages; locale: AppLocale }) {
  const tr = child.translations[0];
  return (
    <article className="hl-card relative h-[430px] overflow-hidden bg-[#0b1a52] md:h-[380px] xl:h-[469px]" data-active={active ? 'true' : 'false'}>
      {child.image && <CmsImage file={child.image} alt="" width={928} height={468} className="absolute inset-0 h-full w-full object-cover" />}
      <div className="hl-rest absolute inset-x-0 bottom-0 pb-[32px] pl-[60px] pr-[60px] text-white" aria-hidden="true">
        <ServiceIcon icon={child.icon} className="mb-[10px] block h-[88px] w-[77px] text-[#ed421a]" strokeWidth={1.3} />
        <p className="m-0 text-[39px] font-bold leading-[59px]">{tr.title}</p>
      </div>
      <div className="hl-panel absolute inset-0 overflow-hidden border border-[#e5e5e5] bg-white">
        <span className="absolute left-[24px] right-[24px] top-[31px] h-[4px] bg-brand xl:left-[60px] xl:right-[32px]" />
        <ServiceIcon icon={child.icon} aria-hidden="true" className="absolute -right-[10px] top-[17px] h-[150px] w-[140px] text-red opacity-[0.07]" strokeWidth={0.8} />
        <ServiceIcon icon={child.icon} className="absolute left-[24px] top-[56px] h-[56px] w-[52px] text-[#ed421a] xl:left-[60px] xl:top-[64px] xl:h-[88px] xl:w-[77px]" strokeWidth={1.4} />
        <h3 className="absolute left-[24px] right-[24px] top-[126px] m-0 text-[20px] font-bold leading-[28px] text-red xl:left-[60px] xl:top-[158px] xl:text-[22.4px] xl:leading-[30px]">{tr.title}</h3>
        <p className="absolute left-[24px] right-[24px] top-[170px] m-0 whitespace-pre-line text-[14px] leading-[24px] text-muted md:text-[15px] xl:left-[60px] xl:right-[32px] xl:top-[238px] xl:text-[15px] xl:leading-[31.7px]">{tr.summary}</p>
        <div className="absolute bottom-[20px] left-[24px] right-[24px] flex h-[44px] items-center justify-between border-t border-[#e5e5e5] text-[15px] font-bold text-[#0224a6] xl:bottom-[29px] xl:left-[60px] xl:right-[32px] xl:h-[49px] xl:text-[15.7px]">
          <span>{t.card.readMore}</span>
          <ArrowRightCircle className="h-[26px] w-[26px] text-brand" />
        </div>
      </div>
      <Link href={href(locale, `services/${child.slug}`)} aria-label={`${t.card.readMore}: ${tr.title}`} className="absolute inset-0 z-10" />
    </article>
  );
}
