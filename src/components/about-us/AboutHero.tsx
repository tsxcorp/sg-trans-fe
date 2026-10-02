import Link from 'next/link';
import { ArrowRightCircle, CheckBoxIcon } from '@/components/ui/icons';
import { CmsImage } from '@/components/ui/Image';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import messages from '@/lib/i18n/messages/pages/about-us.en.json';

export function AboutHero({ locale, image, title, subtitle }: { locale: AppLocale; image: string | null; title: string; subtitle: string }) {
  return (
    <section id="hero" className="relative h-[380px] overflow-hidden bg-[#12365e] text-center text-white md:h-[560px] xl:h-[800px]">
      {image && <CmsImage file={image} alt="" width={1920} height={800} className="absolute inset-0 h-full w-full object-cover" priority />}
      <div className="relative z-10 flex h-full flex-col items-center justify-start px-[20px] pt-[70px] md:justify-center md:pb-[80px] md:pt-0 xl:contents">
        <h1 className="m-0 max-w-[560px] text-[36px] font-bold leading-[42px] md:max-w-none md:text-[56px] md:leading-[64px] xl:absolute xl:inset-x-0 xl:top-[241px] xl:text-[75px] xl:leading-[84px]">{title}</h1>
        <p className="m-0 mt-[12px] text-[12.5px] leading-[18px] md:mt-[20px] md:text-[22px] md:leading-[32px] xl:absolute xl:inset-x-0 xl:top-[364px] xl:mt-0 xl:text-[32px] xl:leading-[44px]">{subtitle}</p>
        <div className="mt-[40px] flex items-center md:mt-[32px] xl:absolute xl:inset-x-0 xl:top-[496px] xl:mt-0 xl:justify-center">
          <Link href={href(locale, 'services')} className="flex h-[30px] items-center justify-center gap-[10px] bg-nav px-[14px] text-[12px] font-medium md:h-[56px] md:px-[28px] md:text-[16px] xl:h-[63px] xl:w-[271px] xl:gap-[16px] xl:p-0">
            {messages.heroExplore}
            <CheckBoxIcon className="h-[16px] w-[16px] text-white md:h-[28px] md:w-[28px]" />
          </Link>
          <Link href={href(locale, 'contact')} className="ml-[10px] flex items-center gap-[6px] text-[11px] font-semibold md:ml-[22px] md:gap-[10px] md:text-[16px]">
            {messages.heroContact}
            <ArrowRightCircle className="h-[9px] w-[9px] text-white md:h-[16px] md:w-[16px]" mark="#2f439b" />
          </Link>
        </div>
      </div>
    </section>
  );
}
