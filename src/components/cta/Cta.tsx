import Link from 'next/link';
import { CheckBoxIcon } from '@/components/ui/icons';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import type { Messages } from '@/lib/i18n/messages';

export function Cta({ t, locale, surface = 'bg-page', heightClass = 'xl:h-[364px]', id, primaryHref, secondaryHref }: { t: Messages['cta']; locale: AppLocale; surface?: string; heightClass?: string; id?: string; primaryHref?: string; secondaryHref?: string }) {
  return (
    <div className={`hidden md:block ${surface}`}>
      <section id={id} aria-labelledby="cta-title" className={`relative overflow-hidden rounded-t-[32px] bg-gradient-to-r from-[#2980f6] to-[#053fb2] px-[20px] py-[48px] text-white md:px-[48px] ${heightClass} xl:rounded-t-[64px] xl:p-0`}>
        <div className="mx-auto max-w-[760px] xl:relative xl:h-full xl:w-[1280px] xl:max-w-none">
          <h2 id="cta-title" className="m-0 text-[28px] font-bold leading-[36px] md:text-[44px] md:leading-[54px] xl:absolute xl:left-0 xl:top-[82px] xl:w-[640px] xl:text-[56px] xl:leading-[67px]">{t.title}</h2>
          <p className="m-0 mt-[16px] text-[15px] leading-[26px] md:max-w-[520px] md:text-[17px] md:leading-[30px] xl:absolute xl:left-0 xl:top-[224px] xl:mt-0 xl:w-[520px] xl:text-[17.5px]">{t.text}</p>
          <div className="mt-[28px] flex flex-col gap-[16px] md:flex-row xl:mt-0 xl:block">
            <Link href={primaryHref ?? `${href(locale)}#quote`} className="flex h-[56px] items-center justify-center bg-[#de2627] text-[18px] font-medium md:w-[300px] xl:absolute xl:left-[884px] xl:top-[92px] xl:h-[79px] xl:w-[396px] xl:text-[24px]">{t.primary} <span aria-hidden="true">›</span></Link>
            <Link href={secondaryHref ?? href(locale, 'contact')} className="flex h-[56px] items-center justify-center gap-[16px] border-[3px] border-white/50 bg-white/10 text-[18px] md:w-[300px] xl:absolute xl:left-[884px] xl:top-[209px] xl:h-[62px] xl:w-[396px] xl:gap-[20px] xl:text-[24px]">
              {t.secondary}
              <CheckBoxIcon className="h-[26px] w-[26px] text-white xl:h-[30px] xl:w-[30px]" mark="#2965ce" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
