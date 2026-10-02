'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { locales, type AppLocale } from '@/lib/i18n/locales';
import { ChevronDown, GlobeSmall } from '@/components/ui/icons';

/** Language menu. Only enabled locales are listed; with one locale it still shows the current language. */
export function LanguageSwitcher({
  locale,
  label,
  names,
}: {
  locale: AppLocale;
  label: string;
  names: Record<string, string>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);

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

  const rest = pathname.replace(new RegExp(`^/${locale}`), '');
  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${label}: ${names[locale]}`}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-[8px] text-[16px] leading-[24px] text-white"
      >
        <GlobeSmall className="h-[24px] w-[24px]" />
        {names[locale]}
        <ChevronDown className="h-[14px] w-[14px]" />
      </button>
      {open && (
        <ul id={id} role="listbox" aria-label={label} className="absolute left-0 top-[32px] z-50 m-0 min-w-[160px] list-none rounded-[6px] bg-white p-[6px] shadow-[0_6px_24px_rgba(0,0,0,0.2)]">
          {locales.map((l) => (
            <li key={l} role="option" aria-selected={l === locale}>
              <Link href={`/${l}${rest}`} onClick={() => setOpen(false)} className="block rounded-[4px] px-[12px] py-[8px] text-[16px] text-navy hover:bg-page">
                {names[l]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
