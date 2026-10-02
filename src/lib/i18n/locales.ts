// Only English is enabled for now. Adding Vietnamese later = add 'vi' here,
// add messages/vi.json and fill `translations[]` with languages_code 'vi'.
export const locales = ['en'] as const;
export const defaultLocale = 'en' as const;
export type AppLocale = (typeof locales)[number];

export function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}
