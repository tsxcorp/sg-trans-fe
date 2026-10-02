import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isAppLocale } from '@/lib/i18n/locales';
import { getMessages } from '@/lib/i18n/messages';
import contactMessages from '@/lib/i18n/messages/pages/contact.en.json';
import { getPartners, getServices } from '@/lib/cms';
import { getCompanyProfile, getContactPage, getContactPersons, getOffices, getOpeningHours, getOperationGroups } from '@/lib/cms/pages/contact';
import { PageShell } from '@/components/shell/PageShell';
import { Partners } from '@/components/partners/Partners';
import { ContactHero } from '@/components/contact/ContactHero';
import { Offices } from '@/components/contact/Offices';
import { HoursBand } from '@/components/contact/HoursBand';
import { Leadership } from '@/components/contact/Leadership';
import { Operations } from '@/components/contact/Operations';
import { ProjectQuote } from '@/components/contact/ProjectQuote';
import { Cta } from '@/components/cta/Cta';

export async function generateMetadata({ params }: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const { translations } = await getContactPage(locale);
  return { title: translations[0].seo_title, description: translations[0].seo_description };
}

export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = getMessages(locale);
  const [page, company, offices, hours, persons, groups, services, partners] = await Promise.all([
    getContactPage(locale),
    getCompanyProfile(locale),
    getOffices(locale),
    getOpeningHours(locale),
    getContactPersons(locale),
    getOperationGroups(locale),
    getServices(locale),
    getPartners(),
  ]);

  return (
    <PageShell locale={locale}>
      <ContactHero page={page} t={contactMessages.hero} locale={locale} />
      <Offices page={page} company={company} offices={offices} t={contactMessages.offices} />
      <HoursBand page={page} hours={hours} t={contactMessages.hours} />
      <Leadership page={page} persons={persons} t={contactMessages.leadership} />
      <Operations page={page} groups={groups} t={contactMessages.operations} />
      <ProjectQuote page={page} t={contactMessages.form} locale={locale} services={services.map((s) => ({ slug: s.slug, title: s.translations[0].title }))} />
      <Partners id="partners" t={t.partners} slideLabel={t.carousel.slide} partners={partners} className="bg-white xl:h-[535px] xl:pt-[124px]!" />
      <Cta heightClass="xl:h-[362px]" id="cta" t={t.cta} locale={locale} surface="bg-white" primaryHref="#project-quote" secondaryHref="#project-quote" />
    </PageShell>
  );
}
