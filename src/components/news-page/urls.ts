import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';

export type NewsFilter = { q?: string | null; category?: string | null; tag?: string | null; page?: number };

/** `/en/news` with the active filter and page (page 1 omits `page`). Only one of q / category / tag is kept. */
export function newsHref(locale: AppLocale, f: NewsFilter = {}): string {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  else if (f.category) p.set('category', f.category);
  else if (f.tag) p.set('tag', f.tag);
  if (f.page && f.page > 1) p.set('page', String(f.page));
  const qs = p.toString();
  return href(locale, 'news') + (qs ? `?${qs}` : '');
}
