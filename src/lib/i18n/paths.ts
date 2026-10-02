import type { AppLocale } from './locales';

/** Locale-prefixed path: href('en') -> '/en', href('en', 'services') -> '/en/services'. */
export function href(locale: AppLocale, path = ''): string {
  return path ? `/${locale}/${path}` : `/${locale}`;
}
