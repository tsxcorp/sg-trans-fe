'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { NAV, PAGES, isActive } from '@/lib/nav';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import { ChevronDown } from '@/components/ui/icons';

type Labels = { nav: Record<string, string>; pages: Record<string, string> };

/** Desktop navigation bar (>= xl). Active entry follows the route; PAGES opens a keyboard-operable menu. */
export function DesktopNav({ locale, t }: { locale: AppLocale; t: Labels }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const root = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => root.current && !root.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const item = 'flex h-[56px] items-center px-[34px] text-[16px] text-white';
  const current = 'bg-nav font-semibold';

  return (
    <ul className="m-0 ml-[54px] flex h-full list-none p-0">
      {NAV.map((n) => {
        if (n.path === null) {
          const anyPageActive = PAGES.some((p) => isActive(pathname, locale, p.path));
          return (
            <li key={n.id} ref={root} className="relative">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={menuId}
                onClick={() => setOpen((v) => !v)}
                className={`${item} gap-[8px] ${anyPageActive && !NAV.some((x) => x.path && isActive(pathname, locale, x.path)) ? current : ''}`}
              >
                {t.nav[n.id]}
                <ChevronDown className="h-[12px] w-[12px]" />
              </button>
              {open && (
                <ul id={menuId} className="absolute left-0 top-[56px] z-50 m-0 min-w-[220px] list-none rounded-b-[8px] bg-navy p-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                  {PAGES.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={href(locale, p.path)}
                        onClick={() => setOpen(false)}
                        aria-current={isActive(pathname, locale, p.path) ? 'page' : undefined}
                        className="block rounded-[4px] px-[18px] py-[10px] text-[16px] text-white hover:bg-nav"
                      >
                        {t.pages[p.id]}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        }
        const active = isActive(pathname, locale, n.path);
        return (
          <li key={n.id}>
            <Link href={href(locale, n.path)} aria-current={active ? 'page' : undefined} className={`${item} ${active ? current : ''}`}>
              {t.nav[n.id]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
