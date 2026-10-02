import { notFound } from 'next/navigation';
import { isAppLocale } from '@/lib/i18n/locales';
import { getMessages } from '@/lib/i18n/messages';
import { getLatestNews, getPartners, getServices, getStats } from '@/lib/cms';
import { PageShell } from '@/components/shell/PageShell';
import { Hero } from '@/components/hero/Hero';
import { QuoteCard } from '@/components/quote/QuoteCard';
import { StatsBand } from '@/components/stats/StatsBand';
import { Services } from '@/components/services/Services';
import { Partners } from '@/components/partners/Partners';
import { News } from '@/components/news/News';
import { Cta } from '@/components/cta/Cta';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = getMessages(locale);
  const [stats, services, partners, news] = await Promise.all([
    getStats(locale),
    getServices(locale),
    getPartners(),
    getLatestNews(locale, 3),
  ]);

  return (
    <PageShell locale={locale}>
      <div className="pb-[48px] xl:pb-[144px]">
        <Hero t={t.hero} locale={locale} />
        <QuoteCard t={t.quote} locale={locale} />
      </div>
      <StatsBand t={t.stats} stats={stats} />
      <div className="relative bg-page xl:h-[2381px]">
        <Services t={t.services} slideLabel={t.carousel.slide} services={services} locale={locale} />
        <Partners t={t.partners} slideLabel={t.carousel.slide} partners={partners} />
        <News t={t.news} news={news} locale={locale} />
      </div>
      <Cta t={t.cta} locale={locale} />
    </PageShell>
  );
}
