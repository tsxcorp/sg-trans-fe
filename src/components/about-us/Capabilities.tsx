import { Carousel } from '@/components/ui/Carousel';
import type { getCapabilities } from '@/lib/cms/pages/about';
import messages from '@/lib/i18n/messages/pages/about-us.en.json';
import { OutlineIcon } from './icons';

type Capability = Awaited<ReturnType<typeof getCapabilities>>[number];

export function Capabilities({ items }: { items: Capability[] }) {
  return (
    <section id="capabilities" aria-label={messages.capabilitiesLabel} className="bg-[#f5f6ff] py-[40px] md:py-[56px] xl:h-[724px] xl:py-0 xl:pt-[89px]">
      <div className="mx-auto max-w-[1280px] pl-[20px] md:px-[32px] xl:w-[1268px] xl:max-w-none xl:p-0">
        <Carousel
          label={messages.capabilitiesLabel}
          slideLabel={messages.capabilitySlide}
          trackClassName="-my-[16px] gap-[16px] py-[16px] md:m-0 md:grid md:grid-cols-2 md:gap-[20px] md:overflow-visible md:p-0 xl:grid-cols-4 xl:gap-[24px]"
          itemClassName="relative flex shrink-0 basis-[85%] overflow-hidden rounded-[8px] bg-white md:basis-auto shadow-[0_4px_20px_rgba(47,67,155,0.06)] transition-[box-shadow] duration-200 after:absolute after:inset-x-0 after:bottom-0 after:h-[4px] after:bg-transparent after:transition-colors after:duration-200 after:content-[''] hover:shadow-[0_8px_32px_rgba(47,67,155,0.22)] hover:after:bg-navy"
          dotsClassName="md:hidden"
        >
          {items.map((c) => {
            const tr = c.translations[0];
            return (
              <article key={c.id} className="w-full px-[24px] pb-[28px] pt-[24px] md:min-h-[200px] xl:h-[261px] xl:pl-[32px] xl:pr-[31px] xl:pb-0 xl:pt-[30px]">
                <OutlineIcon icon={c.icon} fallback="warehouse" className="h-[43px] w-[43px] text-red xl:ml-[11px]" />
                <h3 className="m-0 mt-[24px] text-[20px] font-bold leading-[30px] text-navy md:text-[22px] md:leading-[34px] xl:mt-[26px] xl:text-[24.7px] xl:leading-[38px]">{tr.title}</h3>
                {tr.detail && <p className="m-0 mt-[12px] text-[15px] leading-[24px] text-navy xl:mt-[19px] xl:text-[16px]">{tr.detail}</p>}
                              </article>
            );
          })}
        </Carousel>
      </div>
    </section>
  );
}
