// Navigation structure (routes only). Visible labels live in messages (header.nav, header.pages).
export type NavId = 'home' | 'pages' | 'services' | 'about' | 'news' | 'contact';
export type PageId = 'about' | 'services' | 'news' | 'contact' | 'privacy' | 'terms';

export const NAV: { id: NavId; path: string | null }[] = [
  { id: 'home', path: '' },
  { id: 'pages', path: null }, // opens a menu with PAGES below
  { id: 'services', path: 'services' },
  { id: 'about', path: 'about-us' },
  { id: 'news', path: 'news' },
  { id: 'contact', path: 'contact' },
];

export const PAGES: { id: PageId; path: string }[] = [
  { id: 'about', path: 'about-us' },
  { id: 'services', path: 'services' },
  { id: 'news', path: 'news' },
  { id: 'contact', path: 'contact' },
  { id: 'privacy', path: 'privacy-policy' },
  { id: 'terms', path: 'terms' },
];

/** True when `pathname` (e.g. /en/services/logistics) belongs to the nav entry `path`. */
export function isActive(pathname: string, locale: string, path: string): boolean {
  const base = `/${locale}`;
  if (path === '') return pathname === base || pathname === `${base}/`;
  return pathname === `${base}/${path}` || pathname.startsWith(`${base}/${path}/`);
}
