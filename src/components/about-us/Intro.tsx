import Link from 'next/link';
import { CheckBoxIcon } from '@/components/ui/icons';
import { CmsImage } from '@/components/ui/Image';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import type { getAboutPage } from '@/lib/cms/pages/about';
import messages from '@/lib/i18n/messages/pages/about-us.en.json';
import { StarIcon } from './icons';

type Page = NonNullable<Awaited<ReturnType<typeof getAboutPage>>>;

// Decorations that are not CMS content (faint backdrop pictures cut from the design export).
const WORLD_MAP = 'a8d494d0-fa9f-5403-8561-a8e580ded5c8';
const FORKLIFT = '0910bf65-f286-59a2-b717-f8af9e2c2578';

export function Intro({ locale, page }: { locale: AppLocale; page: Page }) {
  const tr = page.translations[0];
  return (
    <section id="intro" aria-labelledby="intro-title" className="relative overflow-hidden bg-white py-[48px] md:py-[72px] xl:h-[822px] xl:py-0">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        <CmsImage file={WORLD_MAP} alt="" width={540} height={460} className="absolute left-1/2 top-[20px] ml-[420px] h-[460px] w-[540px] max-w-none" />
        <CmsImage file={FORKLIFT} alt="" width={300} height={382} className="absolute bottom-0 left-0 hidden h-[382px] w-[300px] max-w-none xl:block" />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-[20px] md:px-[32px] lg:grid lg:grid-cols-[1fr_480px] lg:items-center lg:gap-[40px] xl:block xl:h-full xl:w-[1280px] xl:max-w-none xl:p-0">
        <div className="xl:absolute xl:left-[50px] xl:top-[145px] xl:w-[580px]">
          <p className="m-0 text-[14px] font-bold italic leading-[20px] text-red underline md:text-[18px] xl:text-[20px] xl:leading-[24px]">{tr.intro_eyebrow}</p>
          <h2 id="intro-title" className="m-0 mt-[8px] max-w-[300px] text-[32px] font-bold leading-[40px] text-navy md:max-w-none md:text-[44px] md:leading-[54px] xl:mt-[17px] xl:max-w-none xl:text-[56.5px] xl:leading-[67px]">{tr.intro_title}</h2>
          <div className="mt-[20px] text-[16px] leading-[26px] text-black md:text-[18px] md:leading-[28px] xl:mt-[48px] xl:text-[20px] xl:leading-[30px]">
            {tr.intro_paragraphs.map((p, i) => (
              <p key={i} className="m-0 mt-[14px] first:mt-0 xl:mt-[20px] xl:first:mt-0">{p}</p>
            ))}
          </div>
          <div className="mt-[28px] flex flex-wrap items-center gap-[20px] xl:mt-[47px] xl:gap-[21px]">
            <Link href={href(locale, 'services')} className="flex h-[48px] items-center justify-center gap-[16px] bg-brand px-[28px] text-[14px] font-medium text-white md:h-[56px] md:text-[16px] xl:h-[65px] xl:w-[280px] xl:p-0">
              {messages.introServices}
              <CheckBoxIcon className="h-[20px] w-[20px] text-white md:h-[24px] md:w-[24px]" mark="#2740cd" />
            </Link>
            <Link href={`${href(locale, 'about-us')}${messages.introReadMoreTarget}`} className="flex min-h-[44px] items-center text-[14px] font-bold text-brand md:text-[16px]">
              {messages.introReadMore}
            </Link>
          </div>
        </div>
        <div className="relative mx-auto mt-[40px] aspect-[480/556] w-full max-w-[480px] lg:mt-0 xl:absolute xl:left-[750px] xl:top-[132px] xl:mx-0 xl:mt-0 xl:h-[556px] xl:w-[480px]">
          {page.intro_image && (
            <CmsImage file={page.intro_image} alt={tr.image_alts?.intro ?? ''} width={480} height={556} className="h-full w-full object-cover" sizes="(min-width: 1280px) 480px, 90vw" />
          )}
          <div aria-hidden="true" className="absolute right-[-16px] top-[-44px] hidden h-[160px] w-[160px] rounded-full bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] md:block xl:right-[-54px] xl:top-[-44px]" />
          <div aria-hidden="true" className="absolute right-0 top-[365px] hidden h-[90px] w-[90px] rounded-full bg-[#df1118] xl:block" />
          <div className="absolute bottom-[-24px] left-[-12px] h-[134px] w-[208px] text-white md:bottom-[-36px] md:left-[-54px] md:h-[166px] md:w-[260px]">
            {/* the "25+" block is the red badge itself; the rating tab and the label are laid over it */}
            <p className="m-0 h-full w-full bg-[#df1118] pl-[14px] pt-[44px] text-[36px] font-bold leading-[44px] md:pl-[18px] md:pt-[62px] md:text-[48px] md:leading-[56px]">{page.years_value}</p>
            <div className="absolute right-[8px] top-[9px] flex items-center gap-[6px] bg-white px-[8px] py-[4px] text-[#df1118] md:right-[10px] md:top-[11px] md:h-[47px] md:w-[75px] md:justify-start md:gap-[7px] md:p-0 md:pl-[10px]">
              <span className="text-[16px] font-bold leading-[20px] md:text-[22px]">{page.rating}</span>
              <StarIcon className="h-[14px] w-[14px] md:h-[23px] md:w-[23px]" />
            </div>
            <p className="absolute bottom-[22px] left-[14px] m-0 text-[14px] font-semibold leading-[20px] md:bottom-[24px] md:left-[16px] md:text-[15.3px]">{tr.years_label}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
