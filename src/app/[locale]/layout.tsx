import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import { isAppLocale, locales } from '@/lib/i18n/locales';
import { getMessages } from '@/lib/i18n/messages';
import '../globals.css';

const inter = localFont({
  src: '../fonts/Inter-Variable.ttf',
  variable: '--font-inter',
  weight: '100 900',
  display: 'swap',
});

// Public origin for canonical and og:image URLs; set SITE_URL at deploy time.
const siteUrl = new URL(process.env.SITE_URL ?? 'http://localhost:3000');

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const { meta } = getMessages(isAppLocale(locale) ? locale : 'en');
  return { metadataBase: siteUrl, title: meta.title, description: meta.description };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  return (
    <html lang={locale} className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
