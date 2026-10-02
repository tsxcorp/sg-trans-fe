'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { NAV, PAGES, isActive } from '@/lib/nav';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import { ChevronDown, CloseIcon, MenuIcon } from '@/components/ui/icons';

type Labels = { nav: Record<string, string>; pages: Record<string, string>; menuOpen: string; menuClose: string };

/** Hamburger menu for widths below xl: panel with all links, Esc closes, focus returns to the button. */
export function MobileMenu({ locale, t }: { locale: AppLocale; t: Labels }) {
  const pathname = usePathname();
  // `openAt` stores the route the menu was opened on: navigating elsewhere closes it without an effect.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const [pagesOpen, setPagesOpen] = useState(false);
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('a, button')?.focus();
    const mq = window.matchMedia('(min-width: 1280px)');
    const onWide = () => { if (mq.matches) setOpenAt(null); };
    mq.addEventListener('change', onWide);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenAt(null);
        button.current?.focus();
      }
      if (e.key === 'Tab' && panel.current) {
        const f = [...panel.current.querySelectorAll<HTMLElement>('a, button')];
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onWide);
    };
  }, [open]);

  const row = 'flex w-full items-center justify-between border-b border-white/15 px-[24px] py-[16px] text-left text-[18px] text-white';
  return (
    <>
      <button
        ref={button}
        type="button"
        aria-label={open ? t.menuClose : t.menuOpen}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpenAt(open ? null : pathname)}
        className="flex h-[40px] w-[40px] items-center justify-center text-black"
      >
        <MenuIcon className="h-[30px] w-[30px]" />
      </button>
      {open && (
        <div ref={panel} id={id} role="dialog" aria-modal="true" aria-label={t.menuOpen} onClick={(e) => { if ((e.target as HTMLElement).closest('a[href]')) setOpenAt(null); }} className="fixed inset-0 z-[60] overflow-y-auto bg-navy">
          <div className="flex justify-end p-[16px]">
            <button type="button" aria-label={t.menuClose} onClick={() => { setOpenAt(null); button.current?.focus(); }} className="flex h-[40px] w-[40px] items-center justify-center text-white">
              <CloseIcon className="h-[28px] w-[28px]" />
            </button>
          </div>
          <ul className="m-0 list-none p-0">
            {NAV.map((n) =>
              n.path === null ? (
                <li key={n.id}>
                  <button type="button" aria-expanded={pagesOpen} onClick={() => setPagesOpen((v) => !v)} className={row}>
                    {t.nav[n.id]}
                    <ChevronDown className={`h-[16px] w-[16px] transition-transform ${pagesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {pagesOpen && (
                    <ul className="m-0 list-none bg-black/15 p-0">
                      {PAGES.map((p) => (
                        <li key={p.id}>
                          <Link href={href(locale, p.path)} aria-current={isActive(pathname, locale, p.path) ? 'page' : undefined} className="block border-b border-white/10 py-[14px] pl-[44px] pr-[24px] text-[16px] text-white">
                            {t.pages[p.id]}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={n.id}>
                  <Link href={href(locale, n.path)} aria-current={isActive(pathname, locale, n.path) ? 'page' : undefined} className={`${row} ${isActive(pathname, locale, n.path) ? 'bg-nav font-semibold' : ''}`}>
                    {t.nav[n.id]}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </>
  );
}
