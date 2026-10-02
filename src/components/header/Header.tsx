import Link from 'next/link';
import { MailIcon, PhoneIcon, SocialFacebook, SocialInstagram, SocialTwitter, SocialYoutube } from '@/components/ui/icons';
import { CmsImage } from '@/components/ui/Image';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import type { Messages } from '@/lib/i18n/messages';
import { DesktopNav } from './DesktopNav';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';

const LOGO = '8aabe933-d8af-57ed-9f65-b2686048b28b';
const SOCIAL_ICONS = [SocialTwitter, SocialFacebook, SocialInstagram, SocialYoutube];

function Socials({ items, className, size }: { items: Messages['header']['socialLinks']; className: string; size: string }) {
  return (
    <ul className={`m-0 flex list-none p-0 ${className}`}>
      {items.map((s, i) => {
        const Icon = SOCIAL_ICONS[i];
        return (
          <li key={s.label}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}><Icon className={size} /></a>
          </li>
        );
      })}
    </ul>
  );
}

export function Header({ t, locale }: { t: Messages['header']; locale: AppLocale }) {
  const home = href(locale);
  const quote = `${home}#quote`;
  return (
    <header className="relative z-30 xl:absolute xl:inset-x-0 xl:top-0">
      {/* below xl: top strip + white bar with hamburger */}
      <div className="xl:hidden">
        <div className="flex h-[33px] items-center justify-between bg-navy px-[20px] text-white">
          <LanguageSwitcher locale={locale} label={t.language} names={t.languages} />
          <Socials items={t.socialLinks} className="gap-[22px]" size="h-[16px] w-[16px]" />
        </div>
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-[22px] gap-y-[12px] bg-white px-[20px] pb-[19px] pt-[18px] md:flex md:gap-x-[32px] md:px-[32px] md:py-[16px]">
          <Link href={home} aria-label={t.logoAlt} className="block w-[72px] shrink-0">
            <CmsImage file={LOGO} alt="" width={63} height={56} className="h-auto w-[63px]" priority />
          </Link>
          <div className="min-w-0 text-black md:flex-1">
            <p className="m-0 text-[12px] leading-[16px] md:text-[16px] md:leading-[22px]">{t.address}</p>
            <div className="mt-[8px] flex flex-wrap gap-x-[28px] gap-y-[4px] text-[8px] leading-[12px] text-navy md:text-[13px] md:leading-[16px]">
              <p className="m-0"><span className="mr-[6px] inline-flex items-center gap-[6px] font-bold"><PhoneIcon className="h-[12px] w-[12px]" />{t.hotlineLabel}</span><br /><a href={`tel:${t.hotline.replace(/[^+\d]/g, '')}`}>{t.hotline}</a></p>
              <p className="m-0"><span className="mr-[6px] inline-flex items-center gap-[6px] font-bold"><MailIcon className="h-[12px] w-[14px]" />{t.emailLabel}</span><br /><a href={`mailto:${t.email}`}>{t.email}</a></p>
            </div>
          </div>
          <div className="col-span-2 flex items-center justify-between md:col-span-1 md:gap-[24px]">
            <Link href={quote} className="flex h-[32px] w-[106px] items-center justify-center rounded-[4px] bg-navy text-[13px] font-semibold text-white md:h-[40px] md:w-[124px] md:text-[16px]">{t.booking}</Link>
            <MobileMenu locale={locale} t={{ nav: t.nav, pages: t.pages, menuOpen: t.menuOpen, menuClose: t.menuClose }} />
          </div>
        </div>
      </div>

      {/* xl and up: the design (white info bar over the hero + navigation bar) */}
      <div className="relative mx-auto hidden h-[128px] w-full max-w-[1292px] xl:block">
        <div className="absolute inset-x-0 top-0 h-[72px] bg-white">
          <Link href={home} aria-label={t.logoAlt} className="absolute left-[55px] top-[8px]">
            <CmsImage file={LOGO} alt="" width={63} height={56} priority />
          </Link>
          <p className="absolute left-[143px] top-[24px] m-0 max-w-[500px] truncate text-[20px] leading-[26px] tracking-[0.2px] text-[#404040]" title={t.address}>{t.address}</p>
          <div className="absolute left-[686px] top-[14px] text-navy">
            <p className="m-0 flex items-center gap-[14px] text-[16px] font-bold leading-[20px]"><PhoneIcon className="h-[20px] w-[20px]" />{t.hotlineLabel}</p>
            <a href={`tel:${t.hotline.replace(/[^+\d]/g, '')}`} className="mt-[6px] block text-[16px] leading-[22px]">{t.hotline}</a>
          </div>
          <div className="absolute left-[853px] top-[14px] text-navy">
            <p className="m-0 flex items-center gap-[14px] text-[16px] font-bold leading-[20px]"><MailIcon className="h-[20px] w-[24px]" />{t.emailLabel}</p>
            <a href={`mailto:${t.email}`} className="mt-[6px] block text-[16px] leading-[22px]">{t.email}</a>
          </div>
          <Link href={quote} className="absolute left-[1103px] top-[12px] flex h-[48px] w-[157px] items-center justify-center rounded-[4px] bg-navy text-[20px] font-semibold text-white">
            {t.booking}
          </Link>
        </div>
        <nav aria-label={t.navLabel} className="absolute inset-x-0 top-[72px] h-[56px] rounded-b-[16px] bg-navy">
          <DesktopNav locale={locale} t={{ nav: t.nav, pages: t.pages }} />
          <Socials items={t.socialLinks} className="absolute right-[44px] top-[18px] gap-[22px] text-white" size="h-[14px] w-[14px]" />
        </nav>
      </div>
    </header>
  );
}
