import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isAppLocale } from '@/lib/i18n/locales';
import { getMessages } from '@/lib/i18n/messages';
import { getPartners } from '@/lib/cms';
import { getAboutPage, getCapabilities, getCoreValues } from '@/lib/cms/pages/about';
import { PageShell } from '@/components/shell/PageShell';
import { Partners } from '@/components/partners/Partners';
import { Cta } from '@/components/cta/Cta';
import { AboutHero } from '@/components/about-us/AboutHero';
import { Intro } from '@/components/about-us/Intro';
import { Capabilities } from '@/components/about-us/Capabilities';
import { VisionMission } from '@/components/about-us/VisionMission';
import { CoreValues } from '@/components/about-us/CoreValues';

export async function generateMetadata({ params }: PageProps<'/[locale]/about-us'>): Promise<Metadata> {
  const { locale } = await params;
  const page = await getAboutPage(locale);
  return page ? { title: page.translations[0].meta_title, description: page.translations[0].meta_description } : {};
}

export default async function AboutUsPage({ params }: PageProps<'/[locale]/about-us'>) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = getMessages(locale);
  const [page, capabilities, values, partners] = await Promise.all([
    getAboutPage(locale),
    getCapabilities(locale),
    getCoreValues(locale),
    getPartners(),
  ]);
  if (!page) notFound();
  const tr = page.translations[0];

  return (
    <PageShell locale={locale}>
      <AboutHero locale={locale} image={page.hero_image} title={tr.hero_title} subtitle={tr.hero_subtitle} />
      <Intro locale={locale} page={page} />
      <Capabilities items={capabilities} />
      <VisionMission page={page} />
      <CoreValues page={page} items={values} />
      <div className="bg-white xl:h-[577px] xl:pt-[167px] [&_img]:min-h-[60px] [&_img]:min-w-[40px]">
        <Partners
          t={{ eyebrow: tr.partners_eyebrow, title: tr.partners_title }}
          slideLabel={t.carousel.slide}
          partners={partners}
          className=""
        />
      </div>
      <Cta t={t.cta} locale={locale} />
    </PageShell>
  );
}
