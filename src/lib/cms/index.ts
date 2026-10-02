import 'server-only';
import { randomUUID } from 'node:crypto';
import { LeadInput, Lead, SubscriberInput, Subscriber, type Locale, type LeadInputT, type LeadT, type SubscriberInputT, type SubscriberT } from './schema';
import { services, news, stats, partners, offices } from './fixtures';
import { bySort, published, resolveRecord } from './resolve';
import { saveLead } from './leadStore';
import { saveSubscriber } from './subscriberStore';
export { assetUrl } from './assetUrl';

/**
 * The only door to content. M1 reads fixtures; M3 swaps in the Directus SDK behind the same functions
 * (CMS_DRIVER=directus). Components must never import fixtures or the SDK.
 */
const live = <T extends { status: string; sort: number | null }>(rows: T[]) => bySort(published(rows));

export async function getStats(locale: Locale) {
  return live(stats).map((r) => resolveRecord(r, locale));
}
export async function getServices(locale: Locale) {
  return live(services).map((r) => resolveRecord(r, locale));
}
export async function getPartners() {
  return live(partners);
}
export async function getOffices(locale: Locale) {
  return live(offices).map((r) => resolveRecord(r, locale));
}
export async function getLatestNews(locale: Locale, n: number) {
  const count = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  const now = Date.now();
  return published(news)
    .filter((n) => Date.parse(n.published_at) <= now)
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
    .slice(0, count)
    .map((r) => resolveRecord(r, locale));
}

/** Validates and stores a lead (email_status 'pending'). Throws on invalid input or a filled honeypot. */
export async function createLead(input: LeadInputT, sourcePage = '/en'): Promise<LeadT> {
  const parsed = LeadInput.parse(input);
  const fields: Omit<typeof parsed, "website"> & { website?: string } = { ...parsed };
  delete fields.website;
  const lead = Lead.parse({
    ...fields,
    id: randomUUID(),
    date_created: new Date().toISOString(),
    email_status: 'pending',
    source_page: sourcePage,
  });
  await saveLead(lead);
  return lead;
}

/**
 * Validates and stores a newsletter subscriber. Throws on invalid input or a filled honeypot.
 * Returns null when the e-mail was already subscribed (callers must not reveal that to the visitor).
 */
export async function createSubscriber(input: SubscriberInputT, sourcePage = '/en'): Promise<SubscriberT | null> {
  const parsed = SubscriberInput.parse(input);
  const sub = Subscriber.parse({
    email: parsed.email,
    locale: parsed.locale,
    id: randomUUID(),
    date_created: new Date().toISOString(),
    source_page: sourcePage,
  });
  return (await saveSubscriber(sub)) ? sub : null;
}
