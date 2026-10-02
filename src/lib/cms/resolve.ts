import type { Locale, Resolved } from './schema';
import { defaultLocale } from '@/lib/i18n/locales';

type WithTr = { translations: { languages_code: Locale }[] };

export const supported: readonly Locale[] = ['en', 'vi'];
export function normalizeLocale(value: string): Locale {
  return (supported as readonly string[]).includes(value) ? (value as Locale) : defaultLocale;
}

/** Keep one translation: requested locale, else English, else the first one. Never throws. */
export function resolveRecord<R extends WithTr>(rec: R, locale: string): Resolved<R> {
  const want = normalizeLocale(locale);
  const en = rec.translations.find((t) => t.languages_code === 'en');
  const wanted = rec.translations.find((t) => t.languages_code === want);
  const base = en ?? wanted ?? rec.translations[0];
  if (!base) return { ...rec, translations: [] } as unknown as Resolved<R>;
  // Field-level fallback: an empty or null field in the requested locale falls back to English.
  const merged: Record<string, unknown> = { ...base };
  if (wanted && wanted !== base) {
    for (const [k, v] of Object.entries(wanted as Record<string, unknown>)) if (v !== null && v !== undefined && v !== '') merged[k] = v;
  }
  return { ...rec, translations: [merged] } as unknown as Resolved<R>;
}

type Sortable = { status: string; sort: number | null };
export const published = <T extends Sortable>(rows: T[]) => rows.filter((r) => r.status === 'published');
export const bySort = <T extends Sortable>(rows: T[]) =>
  [...rows].sort((a, b) => (a.sort ?? Number.POSITIVE_INFINITY) - (b.sort ?? Number.POSITIVE_INFINITY));
