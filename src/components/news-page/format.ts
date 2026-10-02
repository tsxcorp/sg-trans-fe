import type { AppLocale } from '@/lib/i18n/locales';

/** "April 28, 2024" in the site time zone (Vietnam). */
export function formatDate(iso: string, locale: AppLocale = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(iso));
}

/** Two-digit zero padded number: 8 -> "08"; 100+ prints as is. */
export const pad2 = (n: number) => String(n).padStart(2, '0');

export const fill = (tpl: string, vars: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
