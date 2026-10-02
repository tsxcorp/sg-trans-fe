'use client';

import { useState } from 'react';
import { NarrowCarousel as Carousel } from './NarrowCarousel';
import { serviceIcon } from '@/components/our-service/icons';

/* The design draws unequal cards and gaps (239/237/240/230 px; gaps 114/100/122): reproduced from xl. */
const GEOMETRY = ['xl:w-[239px]', 'xl:ml-[114px] xl:w-[237px]', 'xl:ml-[100px] xl:w-[240px]', 'xl:ml-[122px] xl:w-[230px]'];
const LINK = ['', 'w-[97px]', 'w-[83px]', 'w-[105px]'];

type Step = { id: string; icon: string | null; label: string };
type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  steps: Step[];
  defaultActive: number | null; // 1-based
  slideLabel: string;
  listLabel: string;
};

/** Process cards: the active card (red) follows hover, focus or tap; the last active card stays. No navigation. */
export function ProcessSection({ eyebrow, title, subtitle, steps, defaultActive, slideLabel, listLabel }: Props) {
  const [active, setActive] = useState(defaultActive && defaultActive >= 1 && defaultActive <= steps.length ? defaultActive - 1 : 0);
  return (
    <section aria-labelledby="process-title" className="relative bg-white px-[16px] py-[48px] md:px-[32px] md:py-[64px] xl:h-[618px] xl:px-0 xl:py-0">
      <div className="mx-auto max-w-[1282px] text-center xl:pt-[105px]">
        <p className="m-0 text-[14px] font-bold italic leading-[22px] text-red md:text-[17px] xl:text-[18.4px]">{eyebrow}</p>
        <span aria-hidden="true" className="mx-auto mt-[8px] block h-[2px] w-[40px] bg-red xl:mt-[13px]" />
        <h2 id="process-title" className="m-0 mt-[14px] text-[30px] font-bold uppercase leading-[38px] text-[#0a1a6b] md:text-[40px] md:leading-[48px] xl:mt-[10px] xl:text-[52px] xl:leading-[60px]">{title}</h2>
        <p className="mx-auto m-0 mt-[12px] max-w-[580px] text-[15px] leading-[24px] text-[#475569] md:text-[17px] md:leading-[27px] xl:mt-[10px] xl:text-[19.6px] xl:leading-[29.5px]">{subtitle}</p>
        <div className="mt-[28px] text-left xl:-ml-[6px] xl:mt-[31px]">
          <Carousel
            label={listLabel}
            slideLabel={slideLabel}
            trackClassName="gap-[16px] px-[2px] pb-[24px] pt-[2px] md:grid md:grid-cols-2 md:overflow-visible xl:flex xl:justify-start xl:gap-0 xl:pb-0"
            itemClassName="w-[78%] shrink-0 md:w-auto md:min-w-0 xl:contents"
          >
            {steps.map((s, i) => {
              const Icon = serviceIcon(s.icon);
              const on = i === active;
              return (
                <div
                  key={s.id}
                  tabIndex={0}
                  data-active={on ? 'true' : 'false'}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActive(i);
                    }
                  }}
                  className={`relative h-[150px] cursor-default rounded-[8px] border bg-white shadow-[0_2px_10px_rgba(15,23,42,0.07)] outline-none xl:h-[190px] xl:shrink-0 ${GEOMETRY[Math.min(i, GEOMETRY.length - 1)]} ${on ? 'border-[#e11d1d] shadow-[0_8px_20px_rgba(225,29,29,0.16)]' : 'border-[#e2e8f0]'}`}
                >
                  <span className={`absolute left-[16px] top-[18px] flex h-[48px] w-[48px] items-center justify-center rounded-full text-[19px] font-bold shadow-[0_2px_8px_rgba(15,23,42,0.12)] xl:left-[19px] xl:top-[26px] xl:h-[60px] xl:w-[60px] xl:text-[24px] ${on ? 'bg-[#e11d1d] text-white' : 'bg-white text-[#0a1a6b]'}`}>{String(i + 1).padStart(2, '0')}</span>
                  <Icon aria-hidden="true" className={`absolute right-[18px] top-[18px] h-[48px] w-[48px] xl:right-[28px] xl:top-[24px] xl:h-[72px] xl:w-[72px] ${on ? 'text-[#e11d1d]' : 'text-[#0a1a9b]'}`} strokeWidth={1.8} />
                  <p className="absolute bottom-[16px] right-[14px] m-0 w-[120px] text-center text-[14.5px] font-bold leading-[22px] text-[#0a1a6b] xl:bottom-[26px] xl:right-[24px] xl:text-[18px] xl:leading-[29px]">{s.label}</p>
                  {on && <span aria-hidden="true" className="absolute -bottom-[19px] left-1/2 hidden h-[19px] w-[26px] -translate-x-1/2 bg-[#e11d1d] [clip-path:polygon(0_0,100%_0,50%_100%)] xl:block" />}
                  {i > 0 && (
                    <span aria-hidden="true" className={`absolute right-full top-[94px] mr-[17px] hidden h-px bg-gradient-to-r from-transparent to-[#2158d8] xl:block ${LINK[Math.min(i, LINK.length - 1)]}`}>
                      <span className="absolute -right-[3px] -top-[2.5px] h-[6px] w-[6px] rounded-full bg-[#2158d8]" />
                    </span>
                  )}
                </div>
              );
            })}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
