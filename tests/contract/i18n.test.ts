import { describe, it, expect } from 'vitest';
import { locales, defaultLocale } from '@/lib/i18n/locales';
import { Locale } from '@/lib/cms/schema';

describe('Locales (S2, DoD M1)', () => {
  it('DoD1: only en is enabled for now', () => {
    expect([...locales]).toEqual(['en']);
  });
  it('DoD1/S2: default locale is en and is enabled', () => {
    expect(defaultLocale).toBe('en');
    expect(locales).toContain(defaultLocale);
  });
  it('S2: every enabled locale is a valid data-contract Locale', () => {
    for (const l of locales) expect(Locale.safeParse(l).success).toBe(true);
  });
});
