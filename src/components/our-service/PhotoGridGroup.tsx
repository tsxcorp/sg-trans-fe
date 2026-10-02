import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CmsImage } from '@/components/ui/Image';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import { GroupHeading } from './GroupHeading';
import type { Group, OurServiceMessages } from './types';

export function PhotoGridGroup({ group, t, locale }: { group: Group; t: OurServiceMessages; locale: AppLocale }) {
  const g = group.translations[0];
  return (
    <section id={group.slug} aria-labelledby={`${group.slug}-title`} className="bg-white px-[20px] py-[48px] md:px-[32px] md:py-[64px] xl:h-[1152px] xl:px-0 xl:py-0">
      <div className="mx-auto max-w-[1280px] xl:pt-[131px]">
        <GroupHeading id={`${group.slug}-title`} eyebrow={g.section_eyebrow} title={g.section_title ?? g.title} align="left" className="xl:[&_h2]:mt-[19px]" />
        <ul className="m-0 mt-[24px] grid list-none gap-px bg-[#f1f5f9] p-px md:grid-cols-2 md:gap-0 xl:mt-[39px]">
          {group.children.map((c) => {
            const tr = c.translations[0];
            return (
              <li key={c.id} className="relative aspect-[16/11] overflow-hidden bg-[#0b1a52] md:aspect-auto md:h-[260px] lg:h-[300px] xl:h-[342px] xl:border-b xl:border-white/80">
                {c.image && <CmsImage file={c.image} alt="" width={640} height={342} className="absolute inset-0 h-full w-full object-cover" />}
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#0a22a0]/70 to-transparent md:hidden" />
                <div className="absolute bottom-[20px] left-[20px] right-[20px] text-white md:bottom-[28px] md:left-[28px] xl:bottom-[40px] xl:left-[40px] xl:right-[100px] xl:[&_p]:max-w-[395px]">
                  <h3 className="m-0 text-[18px] font-semibold leading-[26px] md:text-[20px] xl:text-[24px] xl:leading-[32px]">{tr.title}</h3>
                  <p className="m-0 mt-[4px] text-[13px] leading-[18px] text-white/80 md:text-[14px] xl:mt-[7px] xl:text-[13.7px] xl:leading-[20px]">{tr.summary}</p>
                </div>
                <Link href={href(locale, `services/${c.slug}`)} aria-label={`${t.card.openService}: ${tr.title}`} className="absolute inset-0 z-10" />
              </li>
            );
          })}
        </ul>
        {g.section_link_label && (
          <p className="m-0 mt-[24px] text-center xl:mt-[19px]">
            <Link href={href(locale, `services/${group.slug}`)} className="inline-flex min-h-[44px] items-center gap-[12px] text-[22px] font-bold text-[#0224a6] xl:text-[28px]">
              {g.section_link_label}
              <ArrowRight aria-hidden="true" className="h-[22px] w-[22px] xl:h-[26px] xl:w-[26px]" strokeWidth={2.2} />
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
