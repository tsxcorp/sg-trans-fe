import Link from 'next/link';
import { ArrowRightCircle, CheckBoxIcon } from '@/components/ui/icons';
import { CmsImage } from '@/components/ui/Image';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import { ExploreLink } from './ExploreLink';

export function ServicesHero({ title, image, firstGroup, t, locale }: { title: string; image: string; firstGroup: string | null; t: { explore: string; contact: string }; locale: AppLocale }) {
  return (
    <section className="relative h-[380px] overflow-hidden bg-[#12365e] text-center text-white md:h-[420px] xl:h-[519px]">
      <CmsImage file={image} alt="" width={1920} height={518} className="absolute inset-0 h-full w-full object-cover" priority />
      <div className="relative z-10 flex h-full flex-col items-center justify-start px-[20px] pt-[70px] md:justify-center md:pb-[40px] md:pt-0 xl:contents">
        <h1 className="m-0 max-w-[560px] text-[36px] font-bold leading-[42px] md:max-w-none md:text-[56px] md:leading-[64px] xl:absolute xl:inset-x-0 xl:top-[239px] xl:text-[75px] xl:leading-[84px]">{title}</h1>
        <div className="mt-[40px] flex items-center md:mt-[32px] xl:absolute xl:inset-x-0 xl:top-[348px] xl:mt-0 xl:justify-center xl:pr-[0px]">
          {firstGroup && (
            <ExploreLink target={firstGroup} className="flex h-[44px] items-center justify-center gap-[10px] bg-nav px-[18px] text-[14px] font-medium md:h-[56px] md:px-[28px] md:text-[16px] xl:h-[64px] xl:w-[272px] xl:gap-[16px] xl:p-0">
              {t.explore}
              <CheckBoxIcon className="h-[20px] w-[20px] text-white md:h-[28px] md:w-[28px]" />
            </ExploreLink>
          )}
          <Link href={href(locale, 'contact')} className="ml-[14px] flex min-h-[44px] items-center gap-[6px] text-[13px] font-semibold md:ml-[22px] md:gap-[10px] md:text-[16px]">
            {t.contact}
            <ArrowRightCircle className="h-[12px] w-[12px] text-white md:h-[16px] md:w-[16px]" mark="#2f439b" />
          </Link>
        </div>
      </div>
    </section>
  );
}
