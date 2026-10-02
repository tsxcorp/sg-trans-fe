import { CmsImage } from '@/components/ui/Image';
import type { getContactPage } from '@/lib/cms/pages/contact';
import type { AppLocale } from '@/lib/i18n/locales';
import type contactMessages from '@/lib/i18n/messages/pages/contact.en.json';
import { QuoteRequestForm } from './QuoteRequestForm';

type Page = Awaited<ReturnType<typeof getContactPage>>;

export function ProjectQuote({ page, t, locale, services }: { page: Page; t: (typeof contactMessages)['form']; locale: AppLocale; services: { slug: string; title: string }[] }) {
  const tr = page.translations[0];
  return (
    <section id="project-quote" aria-labelledby="project-quote-title" className="relative scroll-mt-0 overflow-clip bg-[#0f2a9b] px-[16px] py-[40px] shadow-[0_2px_8px_rgba(0,0,0,0.25)] md:px-[24px] md:py-[64px] xl:z-10 xl:h-[901px] xl:p-0">
      {page.quote_bg && <CmsImage file={page.quote_bg} alt="" width={1920} height={901} className="absolute inset-0 h-full w-full object-cover" />}
      <div className="relative mx-auto grid max-w-[1232px] bg-white lg:grid-cols-2 xl:absolute xl:left-1/2 xl:top-[96px] xl:h-[708px] xl:w-[1232px] xl:max-w-none xl:-translate-x-1/2">
        <QuoteRequestForm t={t} locale={locale} services={services} title={tr.quote_title} />
        {page.quote_photo && (
          <div className="relative hidden h-[360px] overflow-hidden bg-[#1a2a6c] md:block lg:h-auto">
            <CmsImage file={page.quote_photo} alt={tr.quote_photo_alt} width={616} height={708} className="absolute inset-0 h-full w-full object-cover object-right-bottom" />
            <div className="absolute inset-x-[16px] bottom-[16px] bg-white/80 px-[32px] pb-[24px] pt-[24px] xl:pt-[33px] backdrop-blur-[2px] lg:inset-x-[32px] xl:inset-x-[48px] xl:bottom-[48px] xl:h-[150px]">
              <p className="m-0 text-[23.5px] font-bold leading-[30px] text-[#1a1b23]">{tr.quote_photo_title}</p>
              <p className="m-0 mt-[8px] text-[14px] leading-[22px] text-[#444654]">{tr.quote_photo_text}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
