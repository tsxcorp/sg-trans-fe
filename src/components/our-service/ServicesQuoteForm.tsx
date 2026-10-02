'use client';

import { useActionState, useEffect, useRef } from 'react';
import { submitQuote, type QuoteResult } from '@/app/actions/submitQuote';
import { ChevronDown } from '@/components/ui/icons';
import type { AppLocale } from '@/lib/i18n/locales';
import type { OurServiceMessages } from './types';

type State = QuoteResult | null;

const line =
  'block h-[52px] w-full appearance-none rounded-none border-0 border-b border-[#e2e8f0] bg-transparent px-0 pb-0 pt-[7px] text-[13.9px] leading-[22px] text-[#1a1b23] outline-none placeholder:text-[#9aa0ab] aria-[invalid=true]:border-red';
const label = 'block text-[10px] font-semibold uppercase leading-[16px] tracking-[0.05em] text-[#94a3b8]';

/** Services page quote form: posts to the shared submitQuote action (hidden source=services). */
export function ServicesQuoteForm({ t, groups, locale }: { t: OurServiceMessages['quote']; groups: { slug: string; title: string }[]; locale: AppLocale }) {
  const [state, action, pending] = useActionState<State, FormData>((_prev, fd) => submitQuote(fd), null);
  const errors = state && !state.ok ? state.errors : {};
  const values = state && !state.ok ? (state.values ?? {}) : {};
  const done = state?.ok === true;
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) successRef.current?.focus();
    else formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  const err = (name: string) =>
    errors[name] ? (
      <p id={`sq-${name}-error`} role="alert" className="m-0 mt-[4px] text-[13px] leading-[16px] text-red">{errors[name]}</p>
    ) : null;
  const common = (name: string) => ({
    id: `sq-${name}`,
    name,
    defaultValue: values[name] ?? '',
    'aria-invalid': errors[name] ? (true as const) : undefined,
    'aria-describedby': errors[name] ? `sq-${name}-error` : undefined,
    className: line,
  });

  if (done) {
    return (
      <div role="status" className="flex min-h-[320px] items-center">
        <p ref={successRef} tabIndex={-1} className="m-0 text-[22px] font-semibold leading-[32px] text-navy outline-none">{t.success}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} noValidate className="relative mt-[24px] xl:mt-[38px]">
      <div className="grid gap-x-[24px] gap-y-[16px] sm:grid-cols-2 xl:gap-y-[24px]">
        <div>
          <label htmlFor="sq-first_name" className={label}>{t.firstName}</label>
          <input {...common('first_name')} type="text" placeholder={t.firstNamePlaceholder} autoComplete="given-name" />
          {err('first_name')}
        </div>
        <div>
          <label htmlFor="sq-last_name" className={label}>{t.lastName}</label>
          <input {...common('last_name')} type="text" placeholder={t.lastNamePlaceholder} autoComplete="family-name" />
          {err('last_name')}
        </div>
        <div>
          <label htmlFor="sq-email" className={label}>{t.email}</label>
          <input {...common('email')} type="email" placeholder={t.emailPlaceholder} autoComplete="email" />
          {err('email')}
        </div>
        <div>
          <label htmlFor="sq-phone" className={label}>{t.phone}</label>
          <input {...common('phone')} type="tel" placeholder={t.phonePlaceholder} autoComplete="tel" />
          {err('phone')}
        </div>
        <div>
          <label htmlFor="sq-service_type" className={label}>{t.serviceType}</label>
          <div className="relative">
          <select {...common('service_type')} defaultValue={values.service_type ?? ''}>
            <option value="" disabled>{t.servicePlaceholder}</option>
            {groups.map((g) => (
              <option key={g.slug} value={g.slug}>{g.title}</option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 top-[20px] h-[12px] w-[12px] text-[#4b5563]" strokeWidth={1.6} />
          </div>
          {err('service_type')}
        </div>
        <div>
          <label htmlFor="sq-estimated_volume" className={label}>{t.volume}</label>
          <input {...common('estimated_volume')} type="text" placeholder={t.volumePlaceholder} />
          {err('estimated_volume')}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="sq-message" className={label}>{t.brief}</label>
          <textarea {...common('message')} rows={3} placeholder={t.briefPlaceholder} className={`${line} h-[92px] resize-none pt-[20px]`} />
          {err('message')}
        </div>
      </div>

      {/* honeypot: hidden from people and assistive tech, bots fill it */}
      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" defaultValue="" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value="services" />

      {errors.form && <p role="alert" className="m-0 mt-[8px] text-[14px] text-red">{errors.form}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-[24px] flex h-[56px] w-full items-center justify-center bg-gradient-to-r from-[#0425a6] to-[#2940bb] text-[12px] font-semibold tracking-[0.14em] text-white shadow-[0_12px_20px_rgba(2,36,166,0.25)] disabled:opacity-80 xl:mt-[48px]"
      >
        {pending ? t.sending : t.submit}
      </button>
    </form>
  );
}
