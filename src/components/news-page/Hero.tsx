import Link from 'next/link';
import type { ReactNode } from 'react';
import { assetUrl } from '@/lib/cms';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';

type Crumbs = { label: string; home: string; news: string; detail?: string };

/** Breadcrumb under a hero title: HOME • NEWS [• NEWS DETAIL]. The last item is the current page (not a link). */
export function Breadcrumb({ t, locale, current }: { t: Crumbs; locale: AppLocale; current: 'news' | 'detail' }) {
  const items = [
    { key: 'home', label: t.home, to: href(locale), here: false },
    { key: 'news', label: t.news, to: href(locale, 'news'), here: current === 'news' },
    ...(current === 'detail' && t.detail ? [{ key: 'detail', label: t.detail, to: '', here: true }] : []),
  ];
  const link = 'rounded-[2px] hover:underline focus-visible:underline';
  return (
    <nav aria-label={t.label} className="mt-[14px] xl:mt-[19px]">
      <ol className="m-0 flex list-none flex-wrap items-center justify-center p-0 text-[11px] font-normal uppercase leading-[16px] tracking-[1.5px] text-white/90 md:text-[12px] xl:tracking-[2.5px]">
        {items.map((it, i) => (
          <li key={it.key} className="flex items-center">
            {it.here ? <span aria-current="page">{it.label}</span> : <Link href={it.to} className={link}>{it.label}</Link>}
            {i < items.length - 1 && <span aria-hidden="true" className={`h-[5px] w-[5px] rounded-full bg-white/90 ${i === 0 ? 'mx-[12px] xl:ml-[14px] xl:mr-[31px]' : 'mx-[12px] xl:ml-[29px] xl:mr-[14px]'}`} />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Inner-page banner: a decorative full-bleed photo, a centered title block (children) and the breadcrumb.
 * From xl the banner is 495 high and the title block starts at `titleTop` (the header floats over the first banner).
 */
export function InnerHero({ file, titleTop, children }: { file: string; titleTop: number; children: ReactNode }) {
  return (
    <div
      className="relative flex min-h-[260px] flex-col items-center justify-center overflow-hidden bg-[#0f2e82] bg-cover bg-center px-[16px] py-[40px] text-center text-white md:min-h-[340px] xl:h-[495px] xl:justify-start xl:py-0"
      style={{ backgroundImage: `url(${assetUrl(file)})`, ['--hero-top' as string]: `${titleTop}px` }}
    >
      <div className="relative z-10 w-full max-w-[1240px] xl:pt-[var(--hero-top)]">{children}</div>
    </div>
  );
}

export const heroTitleClass = 'm-0 text-[28px] font-bold uppercase leading-[34px] [overflow-wrap:anywhere] md:text-[40px] md:leading-[46px] xl:text-[48px] xl:leading-[48px] xl:tracking-[1.07px]';
