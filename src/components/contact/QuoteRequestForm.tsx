'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { submitQuote, type QuoteResult } from '@/app/actions/submitQuote';
import type { AppLocale } from '@/lib/i18n/locales';
import type contactMessages from '@/lib/i18n/messages/pages/contact.en.json';
import { ChevronDownThin } from './icons';

type State = QuoteResult | null;
type T = (typeof contactMessages)['form'];

const FIELDS = ['first_name', 'last_name', 'email', 'phone', 'service_type', 'estimated_volume', 'message'] as const;

const label = 'block text-[11px] font-bold uppercase leading-[16px] tracking-[0] text-[#94a3b8]';
const control =
  'block h-[49px] w-full appearance-none rounded-none border-0 border-b border-[#e2e8f0] bg-transparent p-0 pt-[2px] text-[14px] text-black outline-none placeholder:text-[#6b7280] focus:border-b-brand aria-[invalid=true]:border-b-red';

/** Project quote form: posts to the shared submitQuote action with the hidden source `contact`. */
export function QuoteRequestForm({ t, locale, services, title }: { t: T; locale: AppLocale; services: { slug: string; title: string }[]; title: string }) {
  const [state, action, pending] = useActionState<State, FormData>(async (_prev, fd) => {
    const res = await submitQuote(fd);
    if (res.ok || res.values) return res;
    // server-side failure (rate limit, storage): keep what was typed so the visitor can retry
    const values: Record<string, string> = {};
    for (const k of FIELDS) values[k] = String(fd.get(k) ?? '');
    return { ...res, values };
  }, null);
  const [dismissed, setDismissed] = useState<State>(null);
  const errors = state && !state.ok ? state.errors : {};
  const values = state && !state.ok ? (state.values ?? {}) : {};
  const done = state?.ok === true && state !== dismissed;
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const lock = useRef(false);

  // Move focus to what changed: the first invalid field, the error block, or the success message.
  useEffect(() => {
    lock.current = false;
    if (!state) return;
    if (state.ok) successRef.current?.focus();
    else (formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? errorRef.current)?.focus();
  }, [state]);

  const err = (name: string) =>
    errors[name] ? (
      <p id={`${name}-error`} role="alert" className="m-0 mt-[4px] text-[13px] leading-[16px] text-red">{errors[name]}</p>
    ) : null;
  const common = (name: string) => ({
    id: name,
    name,
    'aria-invalid': errors[name] ? (true as const) : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  const input = (name: string, text: string, placeholder: string, type = 'text', autoComplete?: string) => (
    <div>
      <label htmlFor={name} className={label}>{text}</label>
      <input {...common(name)} type={type} placeholder={placeholder} defaultValue={values[name] ?? ''} autoComplete={autoComplete} className={`${control} mt-[4px]`} />
      {err(name)}
    </div>
  );

  return (
    <div className="px-[20px] py-[32px] md:px-[40px] md:py-[48px] xl:p-0 xl:pl-[49px] xl:pr-[50px] xl:pt-[51px]">
      <h2 id="project-quote-title" className="m-0 text-[22px] font-bold leading-[32px] text-navy md:text-[25px] xl:leading-[32px]">{title}</h2>
      {done ? (
        <div role="status" className="mt-[24px]">
          <p ref={successRef} tabIndex={-1} className="m-0 text-[22px] font-semibold leading-[30px] text-navy outline-none">{t.successTitle}</p>
          <p className="m-0 mt-[8px] text-[15px] leading-[24px] text-[#444654]">{t.success}</p>
          <button
            type="button"
            onClick={() => {
              setDismissed(state);
              requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[name="first_name"]')?.focus());
            }}
            className="mt-[24px] text-[14px] font-semibold text-brand underline"
          >
            {t.another}
          </button>
        </div>
      ) : (
        <>
          <p className="m-0 mt-[8px] text-[13.8px] leading-[22px] text-[#444654] xl:mt-[11px]">{t.intro}</p>
          <form
            ref={formRef}
            action={action}
            noValidate
            onSubmit={(e) => {
              if (lock.current) e.preventDefault();
              else lock.current = true;
            }}
            className="relative mt-[24px] xl:mt-[38px]"
          >
            <div className="grid gap-x-[25px] gap-y-[23px] min-[480px]:grid-cols-2">
              {input('first_name', t.firstName, t.firstNamePlaceholder, 'text', 'given-name')}
              {input('last_name', t.lastName, t.lastNamePlaceholder, 'text', 'family-name')}
              {input('email', t.email, t.emailPlaceholder, 'email', 'email')}
              {input('phone', t.phone, t.phonePlaceholder, 'tel', 'tel')}
              <div>
                <label htmlFor="service_type" className={label}>{t.serviceType}</label>
                <div className="relative mt-[4px]">
                  <select {...common('service_type')} defaultValue={values.service_type ?? ''} className={`${control} pr-[24px]`}>
                    <option value="">{t.servicePlaceholder}</option>
                    {services.map((s) => (
                      <option key={s.slug} value={s.slug}>{s.title}</option>
                    ))}
                  </select>
                  <ChevronDownThin className="pointer-events-none absolute right-0 top-1/2 h-[16px] w-[16px] xl:-right-[15px] -translate-y-1/2 text-[#6b7280]" />
                </div>
                {err('service_type')}
              </div>
              {input('estimated_volume', t.volume, t.volumePlaceholder)}
              <div className="min-[480px]:col-span-2">
                <label htmlFor="message" className={label}>{t.message}</label>
                <textarea {...common('message')} rows={3} placeholder={t.messagePlaceholder} defaultValue={values.message ?? ''} className={`${control} mt-[4px] h-[89px] resize-none pt-[15px] leading-[20px]`} />
                {err('message')}
              </div>
            </div>

            {/* honeypot: hidden from people and assistive tech, bots fill it */}
            <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" defaultValue="" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="source" value="contact" />

            {errors.form && (
              <p ref={errorRef} tabIndex={-1} role="alert" className="m-0 mt-[16px] text-[14px] leading-[20px] text-red outline-none">{errors.form}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              aria-busy={pending}
              className="mt-[32px] flex h-[56px] w-full items-center justify-center bg-gradient-to-r from-[#0224a6] to-[#2a42bd] text-[13px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_12px_24px_-4px_rgba(2,36,166,0.3)] disabled:opacity-80 xl:mt-[48px]"
            >
              {pending ? t.sending : t.submit}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
