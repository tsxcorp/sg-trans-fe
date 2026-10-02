import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isAppLocale, locales } from '@/lib/i18n/locales';
import { getMessages } from '@/lib/i18n/messages';
import t from '@/lib/i18n/messages/pages/service-detail.en.json';
import { getServiceBySlug, getServiceSlugs, getServicesPage } from '@/lib/cms/pages/services';
import { PageShell } from '@/components/shell/PageShell';
import { Cta } from '@/components/cta/Cta';
import { DetailHero } from '@/components/service-detail/DetailHero';
import { IntroSidebar } from '@/components/service-detail/IntroSidebar';
import { ProcessSection } from '@/components/service-detail/ProcessSection';
import { ExpertiseBand } from '@/components/service-detail/ExpertiseBand';
import { FeaturesSection } from '@/components/service-detail/FeaturesSection';
import { WhySection } from '@/components/service-detail/WhySection';

export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/services/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const s = isAppLocale(locale) ? await getServiceBySlug(locale, slug) : null;
  return s ? { title: s.seoTitle, description: s.metaDescription } : {};
}

export default async function ServiceDetailPage({ params }: PageProps<'/[locale]/services/[slug]'>) {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  const [s, site] = await Promise.all([getServiceBySlug(locale, slug), getServicesPage(locale)]);
  if (!s) notFound();
  const msgs = getMessages(locale);
  const d = s;
  const dt = s.translations[0];
  const tr = s.translations[0];
  const process = d.process && d.process.steps.length >= 2 ? d.process : null;

  return (
    <PageShell locale={locale}>
      <DetailHero title={s.heroTitle} subtitle={dt.hero_subtitle} image={d.hero_image} />
      <IntroSidebar
        detail={d}
        introTitle={dt.intro_title || tr.title}
        fallbackIntroHtml={tr.summary}
        related={s.related_services}
        t={t}
        locale={locale}
        forklift={site?.forklift_image ?? null}
        map={site?.detail_map_image ?? null}
      />
      {process && (
        <ProcessSection
          eyebrow={process.translations[0].eyebrow}
          title={process.translations[0].title}
          subtitle={process.translations[0].subtitle}
          steps={process.steps.map((st) => ({ id: st.id, icon: st.icon, label: st.translations[0].label }))}
          defaultActive={process.default_active}
          slideLabel={t.slide}
          listLabel={t.process.listLabel}
        />
      )}
      {d.expertise && <ExpertiseBand expertise={d.expertise} slideLabel={t.slide} cardsLabel={t.expertise.cardsLabel} statsLabel={t.expertise.statsLabel} />}
      <FeaturesSection detail={d} eyebrow={dt.features_eyebrow || t.defaults.featuresEyebrow} title={dt.features_title || t.defaults.featuresTitle} slideLabel={t.slide} />
      {d.why && <WhySection why={d.why} />}
      <Cta t={msgs.cta} locale={locale} />
    </PageShell>
  );
}
