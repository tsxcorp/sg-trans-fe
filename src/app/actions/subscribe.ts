'use server';

import { headers } from 'next/headers';
import { SubscriberInput } from '@/lib/cms/schema';
import { createSubscriber } from '@/lib/cms';
import { allow } from '@/lib/cms/rateLimit';
import { getMessages } from '@/lib/i18n/messages';
import { defaultLocale, isAppLocale } from '@/lib/i18n/locales';

export type SubscribeResult = { ok: true } | { ok: false; error: string };

async function clientIp(): Promise<string> {
  const h = await headers();
  const parts = h.get('x-forwarded-for')?.split(',').map((s) => s.trim()).filter(Boolean);
  return parts?.[parts.length - 1] || h.get('x-real-ip') || 'unknown';
}

/** Newsletter sign-up. Order: honeypot -> validate -> rate limit -> store. Duplicates look like success. */
export async function subscribeNewsletter(formData: FormData): Promise<SubscribeResult> {
  const str = (k: string) => (typeof formData.get(k) === 'string' ? (formData.get(k) as string) : '');
  if (str('website') !== '') return { ok: true };
  const requested = str('locale') || defaultLocale;
  const locale = isAppLocale(requested) ? requested : defaultLocale;
  const msg = getMessages(locale).footer.newsletterErrors;

  const parsed = SubscriberInput.safeParse({ email: str('email'), locale, website: '' });
  if (!parsed.success) return { ok: false, error: msg.email };
  if (!allow(`newsletter:${await clientIp()}`)) return { ok: false, error: msg.rateLimit };
  try {
    await createSubscriber(parsed.data, `/${locale}`);
  } catch (err) {
    console.error('[subscriber] could not store a subscriber', err instanceof Error ? err.name : 'error');
    return { ok: false, error: msg.server };
  }
  return { ok: true };
}
