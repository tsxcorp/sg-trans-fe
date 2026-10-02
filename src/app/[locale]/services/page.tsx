import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isAppLocale } from '@/lib/i18n/locales';
import { getMessages } from '@/lib/i18n/messages';
import t from '@/lib/i18n/messages/pages/our-service.en.json';
import { getPartners } from '@/lib/cms';
import { getServiceGroups, getServicesPage } from '@/lib/cms/pages/services';
import { PageShell } from '@/components/shell/PageShell';
import { Partners } from '@/components/partners/Partners';
import { Cta } from '@/components/cta/Cta';
import { ServicesHero } from '@/components/our-service/ServicesHero';
import { Intro } from '@/components/our-service/Intro';
import { GroupSection } from '@/components/our-service/GroupSection';
import { QuoteSection } from '@/components/our-service/QuoteSection';

export async function generateMetadata({ params }: PageProps<'/[locale]/services'>): Promise<Metadata> {
  const { locale } = await params;
  const page = await getServicesPage(isAppLocale(locale) ? locale : 'en');
  const tr = page?.translations[0];
  return tr ? { title: tr.seo_title, description: tr.seo_description } : {};
}

export default async function ServicesPage({ params }: PageProps<'/[locale]/services'>) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const [page, groups, partners] = await Promise.all([getServicesPage(locale), getServiceGroups(locale), getPartners()]);
  if (!page) notFound();
  const msgs = getMessages(locale);
  const options = groups.map((g) => ({ slug: g.slug, title: g.translations[0].title }));

  return (
    <PageShell locale={locale}>
      <ServicesHero title={page.translations[0].hero_title} image={page.hero_image} firstGroup={groups[0]?.slug ?? null} t={t.hero} locale={locale} />
      <Intro page={page} forklift={page.forklift_image} map={page.intro_map_image} />
      {groups.map((g) => (
        <GroupSection key={g.id} group={g} t={t} locale={locale} />
      ))}
      <QuoteSection page={page} groups={options} t={t} locale={locale} />
      <div className="bg-white py-[8px] xl:h-[533px] xl:py-0 xl:pt-[122px]">
        <Partners t={msgs.partners} slideLabel={msgs.carousel.slide} partners={partners} className="" />
      </div>
      <Cta t={msgs.cta} locale={locale} />
    </PageShell>
  );
}
