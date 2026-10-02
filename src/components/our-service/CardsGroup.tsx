import Link from 'next/link';
import { Carousel } from '@/components/ui/Carousel';
import { StickyHighlightGroup } from './StickyHighlightGroup';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import { serviceIcon } from './icons';
import { GroupHeading } from './GroupHeading';
import type { Child, Group, OurServiceMessages, Step } from './types';

const ACTIVE_BY_DEFAULT = 1; // the design draws the second card in its hover state
const DASH = ['#f5e3e3', '#f5e3e3', '#ef9fa1', '#de3a3a', '#ec9c9c'];

export function CardsGroup({ group, t, locale }: { group: Group; t: OurServiceMessages; locale: AppLocale }) {
  const g = group.translations[0];
  return (
    <section id={group.slug} aria-labelledby={`${group.slug}-title`} className="bg-[#f8f8f8] px-[20px] py-[48px] md:px-[32px] md:py-[64px] xl:h-[874px] xl:px-0 xl:py-0">
      <div className="mx-auto max-w-[1280px] xl:pt-[131px]">
        <div className="lg:flex lg:items-start lg:justify-between lg:gap-[40px]">
          <GroupHeading id={`${group.slug}-title`} eyebrow={g.section_eyebrow} title={g.section_title ?? g.title} align="left" className="xl:[&_h2]:mt-[19px]" />
          {g.section_intro && <p className="m-0 mt-[12px] text-[16px] leading-[26px] text-[#353535] md:text-[20px] md:leading-[30px] lg:mt-[48px] lg:max-w-[560px] lg:text-right xl:mt-[48px] xl:text-[19.8px]">{g.section_intro}</p>}
        </div>
        <div className="mt-[24px] xl:mt-[59px]">
          <StickyHighlightGroup>
          <Carousel
            label={g.section_title ?? g.title}
            slideLabel={t.slide}
            trackClassName="gap-[16px] md:grid md:grid-cols-1 md:overflow-visible lg:grid-cols-3 xl:gap-[32px]"
            itemClassName="w-[80%] shrink-0 md:w-auto md:min-w-0"
            dotsClassName="md:hidden"
          >
            {group.children.map((c, i) => (
              <FlatCard key={c.id} child={c} active={i === ACTIVE_BY_DEFAULT} locale={locale} t={t} />
            ))}
          </Carousel>
          </StickyHighlightGroup>
        </div>
        {group.steps.length > 0 && <Tracker steps={group.steps} t={t} />}
      </div>
    </section>
  );
}

function FlatCard({ child, active, locale, t }: { child: Child; active: boolean; locale: AppLocale; t: OurServiceMessages }) {
  const tr = child.translations[0];
  return (
    <article className="hl-card relative min-h-[170px] bg-white px-[24px] pb-[24px] pt-[32px] xl:h-[207px] xl:px-[41px] xl:py-0 xl:pt-[41px]" data-active={active ? 'true' : 'false'}>
      <span aria-hidden="true" className="hl-panel pointer-events-none absolute inset-0 border border-[#e4e4e4] shadow-[0_18px_36px_rgba(0,0,0,0.08)]" />
      <h3 className="relative m-0 text-[18.2px] font-medium leading-[24px] text-[#1a1b23]">{tr.title}</h3>
      <p className="relative m-0 mt-[16px] max-w-[272px] text-[14px] leading-[20px] text-[#53545a] xl:mt-[17px] xl:text-[12.9px]">{tr.summary}</p>
      <Link href={href(locale, `services/${child.slug}`)} aria-label={`${t.card.readMore}: ${tr.title}`} className="absolute inset-0 z-10" />
    </article>
  );
}

function Tracker({ steps, t }: { steps: Step[]; t: OurServiceMessages }) {
  return (
    <ol aria-label={t.step.listLabel} className="m-0 mt-[40px] grid list-none grid-cols-2 gap-x-[16px] gap-y-[32px] p-0 md:grid-cols-3 lg:flex lg:gap-0 xl:mx-auto xl:mt-[91px] xl:w-[1184px]">
      {steps.map((s, i) => {
        const tr = s.translations[0];
        const Icon = serviceIcon(s.icon);
        const kicker = tr.kicker ?? `${t.step.prefix} ${String(i + 1).padStart(2, '0')}`;
        const sq = s.variant === 'final' ? 'bg-[#ff6b00]' : s.variant === 'active' ? 'border-2 border-[#ff6b00] bg-navy' : 'bg-[#0e2087]';
        const tone = s.variant === 'default' ? 'text-[#949494]' : 'text-[#ff6b00] font-semibold';
        return (
          <li key={s.id} data-variant={s.variant} className="relative flex flex-col items-center text-center lg:flex-1">
            <span className={`relative flex h-[64px] w-[64px] items-center justify-center rounded-[4px] xl:h-[75px] xl:w-[80px] ${sq}`}>
              <Icon aria-hidden="true" className="h-[24px] w-[24px] text-white xl:h-[28px] xl:w-[28px]" strokeWidth={1.8} />
            </span>
            {i < steps.length - 1 && (
              <span aria-hidden="true" className="absolute left-[calc(50%+40px)] top-[37px] hidden h-[2px] w-[calc(100%-80px)] lg:block" style={{ background: `repeating-linear-gradient(90deg, ${DASH[i] ?? DASH[0]} 0 6px, transparent 6px 10px)` }} />
            )}
            <span className={`mt-[14px] text-[13px] leading-[18px] xl:mt-[24px] xl:text-[13px] ${tone}`}>{kicker}</span>
            <span className="mt-[2px] text-[13px] font-medium leading-[18px] text-[#1a1b23] xl:mt-[6px] xl:text-[12px]">{tr.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
