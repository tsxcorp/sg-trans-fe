import Link from 'next/link';
import { ArrowRightCircle, CheckBoxIcon, iconByName } from '@/components/ui/icons';
import { CmsImage } from '@/components/ui/Image';
import { Carousel } from '@/components/ui/Carousel';
import { HighlightGroup } from '@/components/ui/HighlightGroup';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import type { Messages } from '@/lib/i18n/messages';
import type { getServices } from '@/lib/cms';

type Service = Awaited<ReturnType<typeof getServices>>[number];
const ACTIVE_BY_DEFAULT = 2; // from xl the design shows the third card in its hover state

export function Services({ t, slideLabel, services, locale }: { t: Messages['services']; slideLabel: string; services: Service[]; locale: AppLocale }) {
  return (
    <section id="services" aria-labelledby="services-title" className="relative pb-[48px] pt-[56px] xl:absolute xl:inset-x-0 xl:top-[228px] xl:p-0">
      <div className="relative mx-auto px-[23px] md:px-[32px] xl:h-[130px] xl:w-[1180px] xl:p-0">
        <p className="m-0 text-[12px] font-bold italic leading-[20px] text-red underline xl:leading-[24px] md:text-[18px] xl:absolute xl:left-0 xl:top-[1px] xl:text-[20px]">{t.eyebrow}</p>
        <h2 id="services-title" className="m-0 mt-[6px] text-[32px] font-bold leading-[40px] text-navy md:text-[44px] md:leading-[54px] xl:absolute xl:left-0 xl:top-[44px] xl:mt-0 xl:text-[58px] xl:leading-[64px]">{t.title}</h2>
        <Link href={href(locale, 'services')} className="mt-[16px] hidden h-[48px] w-[190px] items-center md:flex justify-center gap-[12px] rounded-[4px] bg-brand text-[15px] text-white xl:absolute xl:right-0 xl:top-[20px] xl:mt-0 xl:h-[64px] xl:w-[218px] xl:gap-[14px] xl:text-[16px]">
          {t.viewAll}
          <CheckBoxIcon className="h-[20px] w-[20px] text-white" mark="#2740cd" />
        </Link>
      </div>
      <div className="mt-[28px] xl:mt-[24px]">
        <HighlightGroup defaultIndex={ACTIVE_BY_DEFAULT}>
        <Carousel
          label={t.title}
          slideLabel={slideLabel}
          trackClassName="gap-[16px] px-[20px] md:px-[32px] xl:gap-[24px] xl:overflow-visible xl:px-[16px]"
          itemClassName="shrink-0 w-[270px] md:w-[340px] xl:w-auto xl:min-w-0 xl:flex-1"
          dotsClassName="xl:hidden"
        >
          {services.map((s, i) => {
            const Icon = iconByName(s.icon);
            const tr = s.translations[0];
            return (
              <article key={s.id} className="hl-card relative h-[430px] overflow-hidden rounded-[8px] xl:h-[469px]" data-active={i === ACTIVE_BY_DEFAULT ? 'true' : 'false'}>
                {s.image && <CmsImage file={s.image} alt="" width={454} height={469} className="absolute inset-0 h-full w-full object-cover" />}
                <div className="hl-rest text-white" aria-hidden="true">
                  <Icon className="absolute left-[16px] top-[319px] h-[70px] w-[64px] text-[#ed421a]" strokeWidth={1.4} />
                  <p className="absolute left-[18px] top-[401px] m-0 text-[24px] font-semibold leading-[32px]">{tr?.title}</p>
                </div>
                <div className="hl-panel absolute inset-0 border border-[#e5e5e5] bg-white">
                  <span className="absolute left-[16px] top-[10px] h-[3px] w-[160px] bg-brand" />
                  <Icon className="absolute left-[16px] top-[28px] h-[48px] w-[48px] text-red md:h-[56px] md:w-[56px]" />
                  <h3 className="absolute left-[20px] top-[120px] m-0 text-[18px] font-bold leading-[26px] text-red md:text-[22px] md:leading-[30px]">{tr?.title}</h3>
                  <p className="absolute left-[16px] top-[176px] m-0 w-[calc(100%-32px)] max-w-[330px] whitespace-pre-line text-[12.5px] leading-[27px] text-[#6e6e6e] md:text-[15px]">{tr?.summary}</p>
                </div>
                <Link href={href(locale, `services/${s.slug}`)} aria-label={`${t.readMore}: ${tr?.title}`} className="absolute inset-0 z-10" />
                <div className="hl-panel pointer-events-none absolute inset-x-[16px] bottom-[16px] z-10 flex items-center justify-between border-t border-[#e5e5e5] pt-[14px] text-[13px] font-semibold text-brand md:text-[16px]" aria-hidden="true">
                  <span>{t.readMore}</span>
                  <ArrowRightCircle className="h-[24px] w-[24px] text-brand" />
                </div>
              </article>
            );
          })}
        </Carousel>
        </HighlightGroup>
      </div>
    </section>
  );
}
