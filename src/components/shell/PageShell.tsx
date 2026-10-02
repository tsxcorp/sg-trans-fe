import type { ReactNode } from 'react';
import { Header } from '@/components/header/Header';
import { Footer } from '@/components/footer/Footer';
import { getMessages } from '@/lib/i18n/messages';
import type { AppLocale } from '@/lib/i18n/locales';

/**
 * Common frame of every page: skip link, header (overlays the first section from xl), the single <main>, footer.
 * Pages render their sections as children; the first section starts at y = 0 (the header floats over it from xl).
 */
export function PageShell({ locale, children }: { locale: AppLocale; children: ReactNode }) {
  const t = getMessages(locale);
  return (
    <div className="relative bg-white">
      <a href="#main" className="sr-skip">{t.skip}</a>
      <Header t={t.header} locale={locale} />
      <main id="main">{children}</main>
      <Footer t={t.footer} locale={locale} />
    </div>
  );
}
