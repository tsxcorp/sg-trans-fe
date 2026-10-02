import { NarrowCarousel as Carousel } from './NarrowCarousel';
import { serviceIcon } from '@/components/our-service/icons';
import type { Detail } from './types';

export function FeaturesSection({ detail, eyebrow, title, slideLabel }: { detail: Detail; eyebrow: string; title: string; slideLabel: string }) {
  if (detail.features.length === 0) return null;
  return (
    <section aria-labelledby="features-title" className="bg-[#f1f5f9] px-[16px] py-[48px] md:px-[32px] md:py-[64px] xl:h-[571px] xl:px-0 xl:py-0">
      <div className="mx-auto max-w-[1280px] text-center xl:pt-[83px]">
        <p className="m-0 text-[14px] font-bold italic leading-[24px] text-red underline md:text-[18px] xl:text-[20px]">{eyebrow}</p>
        <h2 id="features-title" className="m-0 mt-[8px] text-[30px] font-bold leading-[38px] text-navy md:text-[44px] md:leading-[54px] xl:mt-[19px] xl:text-[55.5px] xl:leading-[64px]">{title}</h2>
        <div className="mt-[28px] text-left xl:mt-[65px]">
          <Carousel
            label={title}
            slideLabel={slideLabel}
            trackClassName="gap-[16px] md:grid md:grid-cols-2 md:gap-[24px] md:overflow-visible lg:grid-cols-3 xl:gap-[32px]"
            itemClassName="w-[85%] shrink-0 md:w-auto md:min-w-0"
          >
            {detail.features.map((f) => {
              const Icon = serviceIcon(f.icon);
              const tr = f.translations[0];
              return (
                <div key={f.id} className="h-full bg-white p-[24px] shadow-[0_1px_2px_rgba(15,23,42,0.06)] xl:h-[233px] xl:px-[32px] xl:pb-[32px] xl:pt-[36px]">
                  <Icon aria-hidden="true" className="h-[32px] w-[32px] text-[#0224a6]" strokeWidth={1.9} />
                  <h3 className="m-0 mt-[16px] text-[19.8px] font-bold leading-[28px] text-[#0f172a] xl:mt-[20px]">{tr.title}</h3>
                  <p className="m-0 mt-[8px] max-w-[320px] xl:mt-[13px] text-[15.9px] leading-[24px] text-[#64748b]">{tr.text}</p>
                </div>
              );
            })}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
