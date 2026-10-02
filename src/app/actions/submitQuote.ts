'use server';

import { headers } from 'next/headers';
import { LeadInput, type LeadT } from '@/lib/cms/schema';
import { createLead } from '@/lib/cms';
import { notify } from '@/lib/cms/mail';
import { setEmailStatus } from '@/lib/cms/leadStore';
import { allow } from '@/lib/cms/rateLimit';
import { getMessages } from '@/lib/i18n/messages';
import { defaultLocale, isAppLocale } from '@/lib/i18n/locales';

/** `values` echoes what the visitor typed so the form can keep it after a validation error. */
export type QuoteResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string>; values?: Record<string, string> };

const FIELDS = ['first_name', 'last_name', 'company', 'email', 'phone', 'country', 'job_title', 'message', 'service_type', 'estimated_volume', 'locale', 'website'] as const;

/** Page a form is placed on (hidden `source` field, allow-listed so it cannot be abused). */
const SOURCES: Record<string, string> = { home: '', contact: '/contact', services: '/services' };
const sourcePath = (key: string | undefined) => {
  const k = key ?? 'home';
  return Object.hasOwn(SOURCES, k) ? SOURCES[k] : '';
};

const text = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === 'string' ? v : undefined;
};

/** Submitted values handed back so a rejected form keeps what the visitor typed. */
function echo(fd: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const k of FIELDS) if (k !== 'website' && k !== 'locale') values[k] = text(fd, k) ?? '';
  return values;
}

/**
 * Client address for the rate limit. The LAST x-forwarded-for entry is the one the nearest proxy appended,
 * so it cannot be forged by the visitor (the first entry can). In production the edge proxy must set or
 * append this header; without it all visitors share the loose 'unknown' bucket.
 */
async function clientIp(): Promise<string> {
  const h = await headers();
  const parts = h.get('x-forwarded-for')?.split(',').map((s) => s.trim()).filter(Boolean);
  return parts?.[parts.length - 1] || h.get('x-real-ip') || 'unknown';
}

/**
 * Order: honeypot -> validate -> rate limit -> store lead -> notify.
 * The lead is stored before any email, so a mail failure never loses it.
 */
export async function submitQuote(formData: FormData): Promise<QuoteResult> {
  // 1. Honeypot: bots fill the hidden field. Answer "success" and keep nothing.
  if ((text(formData, 'website') ?? '') !== '') return { ok: true };

  const requested = text(formData, 'locale') ?? defaultLocale;
  const locale = isAppLocale(requested) ? requested : defaultLocale;
  const msg = getMessages(locale).quote.errors;

  // 2. Validate (empty optional inputs arrive as '' and count as absent).
  const raw: Record<string, string | undefined> = {};
  for (const k of FIELDS) raw[k] = text(formData, k) ?? (k === 'website' ? '' : k === 'locale' ? locale : undefined);
  raw.locale = locale;
  for (const k of ['company', 'country', 'job_title', 'message', 'service_type', 'estimated_volume']) if (raw[k]?.trim() === '') raw[k] = undefined;
  const parsed = LeadInput.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      errors[key] ??= (msg as Record<string, string>)[key] ?? msg.invalid;
    }
    return { ok: false, errors, values: echo(formData) };
  }

  // 3. Rate limit: only validated submissions count.
  if (!allow(await clientIp())) return { ok: false, errors: { form: msg.rateLimit }, values: echo(formData) };

  // 4. Store, then notify. A failed notification keeps the lead and marks it.
  let lead: LeadT;
  try {
    lead = await createLead(parsed.data, `/${locale}${sourcePath(text(formData, 'source'))}`);
  } catch (err) {
    console.error('[lead] could not store a lead', err instanceof Error ? err.name : 'error');
    return { ok: false, errors: { form: msg.server }, values: echo(formData) };
  }
  const sent = await notify(lead);
  try {
    await setEmailStatus(lead.id, sent ? 'sent' : 'failed');
  } catch (err) {
    // The lead is safe on disk: never fail the visitor after saving it.
    console.error(`[lead] could not update email status for lead ${lead.id}`, err instanceof Error ? err.name : 'error');
  }
  return { ok: true };
}
