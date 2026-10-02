'use client';

import { useActionState, useEffect, useRef } from 'react';
import { subscribeNewsletter, type SubscribeResult } from '@/app/actions/subscribe';
import { ChevronRight, MailSmall } from '@/components/ui/icons';
import type { AppLocale } from '@/lib/i18n/locales';
import type { Messages } from '@/lib/i18n/messages';

export function NewsletterForm({ t, locale, privacyHref }: { t: Messages['footer']; locale: AppLocale; privacyHref: string }) {
  const [state, action, pending] = useActionState<SubscribeResult | null, FormData>((_p, fd) => subscribeNewsletter(fd), null);
  const input = useRef<HTMLInputElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!state) return;
    if (state.ok) status.current?.focus();
    else input.current?.focus();
  }, [state]);

  if (state?.ok) {
    return (
      <p ref={status} tabIndex={-1} role="status" className="m-0 text-[16px] font-semibold leading-[24px] outline-none">{t.newsletterSuccess}</p>
    );
  }
  return (
    <form action={action} noValidate aria-label={t.newsletterTitle}>
      <div className="flex gap-[10px]">
        <label className="relative block min-w-0 flex-1 xl:w-[262px] xl:flex-none">
          <span className="sr-only">{t.emailPlaceholder}</span>
          <MailSmall className="absolute left-[14px] top-[18px] h-[14px] w-[14px] text-[#c5ddfd]" />
          <input
            ref={input}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t.emailPlaceholder}
            aria-invalid={state && !state.ok ? true : undefined}
            aria-describedby={state && !state.ok ? 'newsletter-error' : undefined}
            className="h-[50px] w-full rounded-[4px] border border-white/30 bg-white/10 pl-[40px] text-[14px] text-white placeholder:text-[#c5ddfd] aria-[invalid=true]:border-[#ff9b9b]"
          />
        </label>
        <button type="submit" disabled={pending} className="flex h-[50px] w-[120px] shrink-0 items-center justify-center gap-[8px] rounded-[4px] bg-red text-[14px] font-semibold text-white disabled:opacity-80 xl:w-[142px]">
          {t.signUp}<ChevronRight className="h-[12px] w-[12px]" />
        </button>
      </div>
      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" defaultValue="" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <input type="hidden" name="locale" value={locale} />
      {state && !state.ok && <p id="newsletter-error" role="alert" className="m-0 mt-[8px] text-[14px] text-[#ffb4b4]">{state.error}</p>}
      <p className="m-0 mt-[18px] text-[13px] font-semibold">{t.consent} <a href={privacyHref} className="underline">{t.privacy}</a></p>
    </form>
  );
}
