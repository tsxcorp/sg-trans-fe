import Link from 'next/link';
import { Carousel } from '@/components/ui/Carousel';
import { StickyHighlightGroup } from './StickyHighlightGroup';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import { GroupHeading } from './GroupHeading';
import type { Child, Group, OurServiceMessages } from './types';

const ACTIVE_BY_DEFAULT = 0; // the design draws the first card in its hover state

export function LifecycleGroup({ group, t, locale }: { group: Group; t: OurServiceMessages; locale: AppLocale }) {
  const g = group.translations[0];
  return (
    <section id={group.slug} aria-labelledby={`${group.slug}-title`} className="bg-[#f8fafc] px-[20px] py-[48px] md:px-[32px] md:py-[64px] xl:h-[689px] xl:px-0 xl:py-0">
      <GroupHeading id={`${group.slug}-title`} eyebrow={g.section_eyebrow} title={g.section_title ?? g.title} align="center" className="xl:pt-[125px] xl:[&_h2]:mt-[18px]" />
      <div className="mx-auto mt-[28px] grid max-w-[1270px] gap-[24px] lg:grid-cols-[minmax(0,604fr)_minmax(0,605fr)] lg:gap-[24px] xl:gap-[61px] xl:mt-[61px]">
        <div className="min-w-0">
        <StickyHighlightGroup>
        <Carousel
          label={g.section_title ?? g.title}
          slideLabel={t.slide}
          trackClassName="gap-[16px] md:grid md:grid-cols-2 md:gap-[17px] md:overflow-visible"
          itemClassName="w-[85%] shrink-0 md:w-auto md:min-w-0"
          dotsClassName="md:hidden"
        >
          {group.children.map((c, i) => (
            <LifeCard key={c.id} child={c} active={i === ACTIVE_BY_DEFAULT} locale={locale} t={t} />
          ))}
        </Carousel>
        </StickyHighlightGroup>
        </div>
        {g.steps_title && (
          <div className="border border-[#0224a6] px-[16px] pb-[18px] pt-[11px] xl:h-[277px]">
            <h3 className="m-0 text-[22px] font-medium leading-[30px] text-red xl:text-[24.9px]">{g.steps_title}</h3>
            <ol aria-label={t.step.lifecycleLabel} className="m-0 mt-[14px] list-none p-0 xl:mt-[14px]">
              {group.steps.map((s, i) => {
                const final = s.variant === 'final';
                return (
                  <li key={s.id} data-variant={s.variant} className="flex h-[52px] items-center gap-[20px] xl:h-[56px]">
                    <span className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full border text-[12px] font-bold ${final ? 'border-red bg-red text-white' : 'border-[#0e2087] text-[#0e2087]'}`}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={`text-[16px] font-bold xl:text-[15.8px] ${final ? 'text-red' : 'text-[#0e2087]'}`}>{s.translations[0].label}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

function LifeCard({ child, active, locale, t }: { child: Child; active: boolean; locale: AppLocale; t: OurServiceMessages }) {
  const tr = child.translations[0];
  return (
    <article className="hl-card relative min-h-[129px] bg-white px-[17px] pb-[16px] pt-[24px] xl:h-[129px] xl:p-0 xl:pl-[17px] xl:pt-[30px]" data-active={active ? 'true' : 'false'}>
      <span aria-hidden="true" className="hl-panel pointer-events-none absolute inset-0 border border-[#c5cefd] shadow-[0_10px_24px_rgba(39,64,205,0.12)]" />
      <h3 className="relative m-0 text-[20.2px] font-bold leading-[26px] text-[#0224a6]">{tr.title}</h3>
      <p className="relative m-0 mt-[11px] max-w-[190px] text-[13px] leading-[20px] text-[#666872] xl:mt-[1px]">{tr.summary}</p>
      <Link href={href(locale, `services/${child.slug}`)} aria-label={`${t.card.readMore}: ${tr.title}`} className="absolute inset-0 z-10" />
    </article>
  );
}
