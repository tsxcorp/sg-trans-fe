import { PackageCheck } from '@/components/ui/icons';
import { CmsImage } from '@/components/ui/Image';
import { QuoteForm } from './QuoteForm';
import type { Messages } from '@/lib/i18n/messages';
import type { AppLocale } from '@/lib/i18n/locales';

const TRUCK = '85fc309b-01af-530b-9b84-f8dd4ba8425b';

export function QuoteCard({ t, locale }: { t: Messages['quote']; locale: AppLocale }) {
  return (
    <section
      id="quote"
      aria-labelledby="quote-title"
      className="relative mx-auto -mt-[82px] w-[calc(100%-50px)] max-w-[760px] overflow-hidden rounded-[24px] bg-white shadow-[0_6px_30px_rgba(0,0,0,0.12)] md:-mt-[96px] lg:max-w-[1040px] xl:-mt-[160px] xl:h-[624px] xl:w-[1180px] xl:max-w-none"
    >
      <div className="flex h-[62px] flex-col items-center justify-center bg-brand px-[16px] text-center text-white md:h-auto md:py-[18px] xl:absolute xl:inset-x-0 xl:top-0 xl:block xl:h-[109px] xl:p-0">
        <div className="flex items-center gap-[10px] xl:contents">
          <PackageCheck className="h-[26px] w-[26px] text-[#aeb7ec] md:h-[32px] md:w-[32px] xl:absolute xl:left-[479px] xl:top-[20px] xl:h-[40px] xl:w-[40px]" strokeWidth={1.5} />
          <h2 id="quote-title" className="m-0 text-[10.5px] font-bold leading-[18px] md:text-[18px] md:leading-[24px] xl:absolute xl:left-[550px] xl:top-[30px]">{t.title}</h2>
        </div>
        <p className="m-0 text-[10.5px] leading-[14px] text-[#e4e7f9] md:text-[16px] md:leading-[24px] xl:absolute xl:inset-x-0 xl:top-[64px]">{t.subtitle}</p>
      </div>
      <div className="lg:grid lg:grid-cols-2 xl:contents">
        <QuoteForm t={t} locale={locale} />
        <CmsImage file={TRUCK} alt={t.imageAlt} width={580} height={509} className="hidden h-full min-h-[420px] w-full object-cover lg:block xl:absolute xl:left-[600px] xl:top-[109px] xl:h-[509px] xl:min-h-0 xl:w-[580px]" />
      </div>
    </section>
  );
}
