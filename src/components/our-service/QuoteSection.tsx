import { CmsImage } from '@/components/ui/Image';
import type { AppLocale } from '@/lib/i18n/locales';
import { ServicesQuoteForm } from './ServicesQuoteForm';
import type { OurServiceMessages } from './types';

type Page = {
  quote_image: string;
  quote_background: string;
  translations: [{ quote_title: string; quote_intro: string; quote_caption_title: string; quote_caption_body: string }];
};

export function QuoteSection({ page, groups, t, locale }: { page: Page; groups: { slug: string; title: string }[]; t: OurServiceMessages; locale: AppLocale }) {
  const p = page.translations[0];
  return (
    <section id="quote" aria-labelledby="quote-title" className="relative overflow-hidden bg-[#102ba1] px-[16px] py-[40px] md:px-[32px] md:py-[64px] xl:h-[902px] xl:px-0 xl:py-0">
      <div aria-hidden="true" className="absolute inset-0">
        <CmsImage file={page.quote_background} alt="" width={1920} height={902} className="h-full w-full object-cover" />
      </div>
      <div className="relative mx-auto grid max-w-[1232px] overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:grid-cols-2 xl:mt-[96px] xl:h-[708px] xl:max-w-none xl:w-[1232px]">
        <div className="px-[20px] pb-[32px] pt-[32px] md:px-[40px] md:pt-[40px] xl:px-[49px] xl:pb-0 xl:pt-[51px]">
          <h2 id="quote-title" className="m-0 text-[24px] font-bold leading-[32px] text-[#3c4ea1] xl:text-[25px] xl:leading-[34px]">{p.quote_title}</h2>
          <p className="m-0 mt-[8px] text-[14px] leading-[22px] text-[#73747f] xl:mt-[10px] xl:text-[13.7px]">{p.quote_intro}</p>
          <ServicesQuoteForm t={t.quote} groups={groups} locale={locale} />
        </div>
        <div className="relative min-h-[320px] bg-[#102ba1] md:min-h-[420px] xl:min-h-0">
          <CmsImage file={page.quote_image} alt={t.quote.imageAlt} width={616} height={708} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-x-[16px] bottom-[16px] bg-white/85 px-[20px] py-[16px] backdrop-blur-[2px] xl:inset-x-auto xl:bottom-[48px] xl:left-[48px] xl:h-[150px] xl:w-[520px] xl:px-[32px] xl:py-0 xl:pt-[32px]">
            <p className="m-0 text-[20px] font-medium leading-[28px] text-[#1a1b23] xl:text-[23.7px]">{p.quote_caption_title}</p>
            <p className="m-0 mt-[8px] text-[13.5px] leading-[23px] text-[#4b4c55] xl:mt-[8px] xl:text-[14px]">{p.quote_caption_body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
