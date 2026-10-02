import Link from 'next/link';
import { SocialFacebook, SocialLinkedin } from '@/components/ui/icons';
import { CmsImage } from '@/components/ui/Image';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import type { Messages } from '@/lib/i18n/messages';
import { FooterColumns } from './FooterColumns';
import { NewsletterForm } from './NewsletterForm';

const LOGO = 'd50cd0c8-25d0-59b3-b272-f56044e208bd';
const ICONS = { facebook: SocialFacebook, linkedin: SocialLinkedin } as const;

export function Footer({ t, locale }: { t: Messages['footer']; locale: AppLocale }) {
  return (
    <footer className="relative">
      <div className="relative bg-gradient-to-r from-[#1328a0] to-[#153ea6] px-[20px] pb-[40px] pt-[48px] text-white md:px-[32px] xl:h-[475px] xl:p-0">
        <div className="xl:relative xl:mx-auto xl:h-full xl:w-[1216px]">
        <div className="flex items-start gap-[22px] md:block">
          <Link href={href(locale)} aria-label={t.homeLabel} className="block shrink-0 xl:absolute xl:left-[21px] xl:top-[89px]">
            <CmsImage file={LOGO} alt="" width={114} height={100} className="h-auto w-[100px] md:w-[114px]" />
          </Link>
          <p className="m-0 max-w-[560px] text-[14px] leading-[21px] text-[#c5ddfd] md:mt-[24px] md:text-[16px] md:leading-[24px] xl:absolute xl:left-[19px] xl:top-[200px] xl:mt-0 xl:w-[285px]">{t.about}</p>
        </div>
        <div className="mt-[32px] xl:mt-0">
          <FooterColumns columns={t.columns} locale={locale} tabsLabel={t.homeLabel} />
        </div>
        <div className="mt-[32px] xl:absolute xl:left-[321px] xl:top-[312px] xl:mt-0">
          <h3 className="m-0 text-[16px] font-bold leading-[24px]">{t.newsletterTitle}</h3>
          <p className="m-0 mt-[16px] text-[16px] leading-[24px] text-[#c5ddfd]">{t.newsletterText}</p>
        </div>
        <div className="relative mt-[24px] md:max-w-[520px] xl:absolute xl:left-[748px] xl:top-[300px] xl:mt-0 xl:max-w-none">
          <NewsletterForm t={t} locale={locale} privacyHref={href(locale, t.privacyPath)} />
        </div>
        </div>
      </div>
      <div className="relative flex min-h-[66px] items-center justify-between gap-[16px] bg-[#98c2f9] px-[20px] py-[10px] text-[12px] text-white md:px-[32px] xl:block xl:h-[66px] xl:p-0">
        <div className="contents xl:relative xl:mx-auto xl:block xl:h-full xl:w-[1216px]">
        <p className="m-0 xl:absolute xl:left-0 xl:top-[25px]">{t.copyright} <b className="text-brand">{t.brand}</b>. {t.rights}</p>
        <ul className="m-0 flex list-none gap-[2px] p-0 xl:absolute xl:left-[1118px] xl:top-[10px]">
          {t.socialLinks.map((s) => {
            const Icon = ICONS[s.icon as keyof typeof ICONS];
            return (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#1e40ea]"><Icon className="h-[16px] w-[16px]" /></a>
              </li>
            );
          })}
        </ul>
        </div>
      </div>
    </footer>
  );
}
