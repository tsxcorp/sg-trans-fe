import { CmsImage } from '@/components/ui/Image';
import { serviceIcon } from '@/components/our-service/icons';
import type { Detail } from './types';

type Why = NonNullable<Detail['why']>;
const SIZES = [
  { w: 292, h: 292 }, { w: 292, h: 390 }, { w: 292, h: 389 }, { w: 292, h: 293 },
];

export function WhySection({ why }: { why: Why }) {
  const tr = why.translations[0];
  if (!tr) return null;
  const imgs = why.images.slice(0, 4);
  const frame = 'overflow-hidden rounded-[16px] shadow-[0_8px_24px_rgba(15,23,42,0.18)]';
  return (
    <section aria-labelledby="why-title" className="bg-white px-[16px] py-[48px] md:px-[32px] md:py-[64px] xl:h-[882px] xl:px-0 xl:py-0">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-[32px] lg:flex-row lg:gap-[40px] xl:w-[1280px] xl:max-w-none xl:gap-0">
        <div className="order-2 lg:order-1 lg:w-[46%] xl:ml-0 xl:w-[600px] xl:shrink-0 xl:pt-[96px]">
          {imgs.length > 0 && (
            <div className="grid grid-cols-2 gap-[12px] lg:flex lg:gap-[16px] xl:gap-[16px]">
              <div className="contents lg:flex lg:w-[292px] lg:flex-col lg:gap-[16px]">
                {[0, 2].map((i) => imgs[i] && (
                  <div key={i} className={frame}>
                    <CmsImage file={imgs[i]} alt={tr.image_alts[i] ?? ''} width={SIZES[i].w} height={SIZES[i].h} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="contents lg:mt-[32px] lg:flex lg:w-[292px] lg:flex-col lg:gap-[15px]">
                {[1, 3].map((i) => imgs[i] && (
                  <div key={i} className={frame}>
                    <CmsImage file={imgs[i]} alt={tr.image_alts[i] ?? ''} width={SIZES[i].w} height={SIZES[i].h} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="order-1 lg:order-2 lg:flex-1 xl:ml-[80px] xl:w-[600px] xl:flex-none xl:pt-[177px]">
          <p className="m-0 text-[14px] font-bold italic leading-[24px] text-red underline md:text-[18px] xl:text-[20px]">{tr.eyebrow}</p>
          <h2 id="why-title" className="m-0 mt-[8px] text-[30px] font-bold leading-[38px] text-navy md:text-[44px] md:leading-[54px] xl:mt-[16px] xl:text-[55.4px] xl:leading-[66px]">{tr.title}</h2>
          <p className="m-0 mt-[12px] max-w-[560px] text-[16px] leading-[26px] text-[#475569] md:text-[17px] xl:mt-[34px] xl:text-[17.9px] xl:leading-[29.5px]">{tr.text}</p>
          <ul className="m-0 mt-[24px] grid list-none gap-[24px] p-0 sm:grid-cols-2 xl:mt-[31px] xl:gap-x-[28px] xl:gap-y-[32px]">
            {why.items.map((it, i) => {
              const Icon = serviceIcon(it.icon);
              const t = it.translations[0];
              return (
                <li key={i} className="flex items-start gap-[16px]">
                  <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[8px] bg-[#e8ecfb] text-[#0224a6]">
                    <Icon aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={1.9} />
                  </span>
                  <div>
                    <h3 className="m-0 text-[16px] font-bold leading-[24px] text-[#0f172a]">{t.title}</h3>
                    <p className="m-0 mt-[2px] max-w-[175px] text-[13.8px] leading-[20px] text-[#64748b]">{t.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
