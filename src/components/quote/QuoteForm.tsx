'use client';

import { useActionState, useEffect, useRef } from 'react';
import { submitQuote, type QuoteResult } from '@/app/actions/submitQuote';
import { CheckBoxIcon, InfoDot } from '@/components/ui/icons';
import type { Messages } from '@/lib/i18n/messages';
import type { AppLocale } from '@/lib/i18n/locales';

type State = QuoteResult | null;

const input =
  'block h-[32px] w-full rounded-[4px] border border-line bg-white px-[13px] text-[11px] md:h-[50px] md:rounded-[8px] md:px-[20px] md:text-[16px] text-navy outline-none placeholder:text-navy aria-[invalid=true]:border-red';

export function QuoteForm({ t, locale }: { t: Messages['quote']; locale: AppLocale }) {
  const [state, action, pending] = useActionState<State, FormData>((_prev, fd) => submitQuote(fd), null);
  const errors = state && !state.ok ? state.errors : {};
  const values = state && !state.ok ? (state.values ?? {}) : {};
  const done = state?.ok === true;
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);

  // Move focus to what changed: the first invalid field, or the success message.
  useEffect(() => {
    if (!state) return;
    if (state.ok) successRef.current?.focus();
    else formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  const field = (name: string, label: string, type = 'text', autoComplete?: string) => (
    <div>
      <input
        name={name}
        type={type}
        placeholder={label}
        aria-label={label}
        defaultValue={values[name] ?? ''}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        autoComplete={autoComplete}
        className={input}
      />
      {errors[name] && (
        <p id={`${name}-error`} role="alert" className="m-0 mt-[2px] text-[13px] leading-[16px] text-red">{errors[name]}</p>
      )}
    </div>
  );

  if (done) {
    return (
      <div className="flex min-h-[320px] items-center p-[24px] xl:absolute xl:left-[24px] xl:top-[109px] xl:h-[400px] xl:w-[532px] xl:p-0" role="status">
        <p ref={successRef} tabIndex={-1} className="m-0 text-[22px] font-semibold leading-[32px] text-navy outline-none">{t.success}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} noValidate className="relative p-[15px] md:p-[32px] xl:absolute xl:left-[24px] xl:top-[109px] xl:w-[532px] xl:p-0">
      <p className="m-0 text-[10px] font-bold leading-[16px] text-navy md:text-[16px] xl:pt-[24px]">{t.section}</p>
      <div className="mt-[10px] grid gap-[9px] md:mt-[14px] md:gap-[10px] xl:mt-[18px] xl:gap-[15px]">
        <div className="grid grid-cols-2 gap-[9px] md:gap-[10px]">
          {field('first_name', t.firstName, 'text', 'given-name')}
          {field('last_name', t.lastName, 'text', 'family-name')}
        </div>
        {field('company', t.company, 'text', 'organization')}
        <div className="grid grid-cols-2 gap-[10px]">
          {field('email', t.email, 'email', 'email')}
          {field('phone', t.phone, 'tel', 'tel')}
        </div>
        {field('country', t.country, 'text', 'country-name')}
        {field('job_title', t.jobTitle, 'text', 'organization-title')}
      </div>

      {/* honeypot: hidden from people and assistive tech, bots fill it */}
      <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" defaultValue="" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <input type="hidden" name="locale" value={locale} />

      <p className="m-0 mt-[10px] flex items-center gap-[6px] text-[10.5px] leading-[14px] text-black md:mt-[16px] md:gap-[8px] md:text-[16px] md:leading-[21px] xl:mt-[20px]">
        <InfoDot className="h-[20px] w-[20px] text-brand" />
        {t.hint}
      </p>
      {errors.form && <p role="alert" className="m-0 mt-[6px] text-[14px] text-red">{errors.form}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-[12px] flex h-[42px] w-full items-center justify-center gap-[12px] rounded-[4px] bg-brand text-[12px] md:mt-[16px] md:h-[65px] md:rounded-[8px] md:text-[16px] xl:mt-[19px] text-white disabled:opacity-80"
      >
        {pending ? t.sending : t.submit}
        <CheckBoxIcon className="h-[24px] w-[24px] text-white" mark="#2740cd" />
      </button>
    </form>
  );
}
