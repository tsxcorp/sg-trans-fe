import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LegalPage } from '@/components/legal/LegalPage';
import { isAppLocale } from '@/lib/i18n/locales';
import legal from '@/lib/i18n/messages/pages/legal.en.json';

export async function generateMetadata(): Promise<Metadata> {
  return { title: `${legal.privacy.title} — Saigon Trans`, description: legal.privacy.meta };
}

export default async function Page({ params }: PageProps<'/[locale]/privacy-policy'>) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  return <LegalPage locale={locale} doc={legal.privacy} />;
}
