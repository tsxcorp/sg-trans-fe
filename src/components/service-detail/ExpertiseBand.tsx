import { NarrowCarousel as Carousel } from './NarrowCarousel';
import { CmsImage } from '@/components/ui/Image';
import { serviceIcon } from '@/components/our-service/icons';
import type { Detail } from './types';

type Expertise = NonNullable<Detail['expertise']>;

export function ExpertiseBand({ expertise, slideLabel, cardsLabel, statsLabel }: { expertise: Expertise; slideLabel: string; cardsLabel: string; statsLabel: string }) {
  const tr = expertise.translations[0];
  if (!tr) return null;
  return (
    <section aria-labelledby="expertise-title" className="relative overflow-hidden bg-[#021150] px-[16px] py-[48px] text-white md:px-[32px] md:py-[64px] 2xl:h-[935px] 2xl:px-0 2xl:py-0">
      <div className="mx-auto max-w-[1292px] 2xl:ml-[max(16px,calc(50%-767px))] 2xl:flex 2xl:w-[1559px] 2xl:max-w-[calc(100%-32px)] 2xl:pt-[136px]">
        <div className="2xl:w-[430px] 2xl:shrink-0">
          <h2 id="expertise-title" className="m-0 text-[32px] font-bold leading-[40px] md:text-[44px] md:leading-[54px] 2xl:w-[430px] 2xl:pt-[5px] 2xl:-ml-[3px] 2xl:text-[58.8px] 2xl:leading-[77px]">
            {tr.title}
            <span aria-hidden="true" className="text-[#ff5b0a]">.</span>
          </h2>
          <p className="m-0 mt-[12px] max-w-[460px] text-[16px] leading-[26px] text-[#b6c3e6] md:text-[19px] md:leading-[30px] 2xl:mt-[33px] 2xl:text-[22px] 2xl:leading-[37px]">{tr.text}</p>
          {expertise.stats.length > 0 && (
            <ul aria-label={statsLabel} className="relative m-0 mt-[28px] grid list-none grid-cols-2 p-0 md:grid-cols-4 2xl:-ml-[3px] 2xl:mt-[62px] 2xl:w-[430px] 2xl:grid-cols-[199px_231px]">
              <li aria-hidden="true" className="absolute bottom-0 left-[199px] top-0 hidden w-px bg-white/15 2xl:block" />
              <li aria-hidden="true" className="absolute inset-x-[-3px] top-[173px] hidden h-px bg-white/20 2xl:block" />
              {expertise.stats.map((s, i) => {
                const Icon = serviceIcon(s.icon);
                return (
                  <li key={i} className={`flex flex-col items-center px-[8px] py-[16px] text-center md:border-r md:border-white/15 md:last:border-r-0 2xl:h-[202px] 2xl:border-r-0 2xl:px-0 2xl:py-0 2xl:pt-[2px] ${i % 2 === 0 ? '2xl:-translate-x-[19px]' : ''}`}>
                    <Icon aria-hidden="true" className="h-[44px] w-[44px] text-[#ff5b0a] 2xl:h-[66px] 2xl:w-[66px]" strokeWidth={1.2} />
                    <p className="m-0 mt-[8px] text-[26px] font-extrabold leading-[32px] text-[#ff5b0a] 2xl:mt-[14px] 2xl:text-[36px] 2xl:leading-[40px]">{s.value}</p>
                    <p className="m-0 mt-[4px] text-[12px] font-medium uppercase leading-[18px] text-[#e2e8f8] 2xl:mt-[13px] 2xl:text-[15.8px]">{s.translations[0].label}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="mt-[32px] 2xl:ml-[79px] 2xl:mt-0 2xl:min-w-0 2xl:flex-1">
          <Carousel
            label={cardsLabel}
            slideLabel={slideLabel}
            trackClassName="gap-[16px] md:grid md:grid-cols-3 md:gap-[16px] md:overflow-visible 2xl:grid-cols-[341fr_339fr_339fr] 2xl:gap-[17px]"
            itemClassName="w-[80%] shrink-0 md:w-auto md:min-w-0"
          >
            {expertise.cards.map((c, i) => {
              const Icon = serviceIcon(c.icon);
              return (
                <div key={i} className="relative aspect-[340/698] overflow-hidden rounded-[28px] [container-type:inline-size] 2xl:aspect-auto 2xl:h-[698px]">
                  <CmsImage file={c.image} alt="" width={341} height={698} className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute left-1/2 top-[102.4cqw] flex h-[29.7cqw] w-[29.7cqw] -translate-x-1/2 items-center justify-center rounded-full border-[0.9cqw] border-[#1d4fe8] bg-white">
                    <Icon aria-hidden="true" className="h-[13cqw] w-[13cqw] text-[#1d3fe0]" strokeWidth={1.4} />
                  </span>
                  <h3 className="absolute left-[12%] right-[12%] top-[141.4cqw] m-0 text-center text-[9.4cqw] font-bold leading-[12.4cqw] text-white">{c.translations[0].title}</h3>
                  <span aria-hidden="true" className="absolute left-1/2 top-[172.2cqw] h-[0.6cqw] w-[11.8cqw] -translate-x-1/2 bg-[#ff5b0a]" />
                </div>
              );
            })}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
