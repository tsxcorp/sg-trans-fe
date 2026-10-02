import Link from 'next/link';
import { PageShell } from '@/components/shell/PageShell';
import { defaultLocale } from '@/lib/i18n/locales';
import { getMessages } from '@/lib/i18n/messages';
import { href } from '@/lib/i18n/paths';

export default function NotFound() {
  const t = getMessages(defaultLocale).notFound;
  return (
    <PageShell locale={defaultLocale}>
      <section className="bg-page px-[20px] pb-[96px] pt-[48px] text-center xl:pt-[200px]">
        <p className="m-0 text-[14px] font-bold italic text-red underline">{t.code}</p>
        <h1 className="m-0 mt-[12px] text-[32px] font-bold leading-[40px] text-navy md:text-[48px] md:leading-[56px]">{t.title}</h1>
        <p className="m-0 mx-auto mt-[16px] max-w-[520px] text-[16px] leading-[26px] text-muted">{t.text}</p>
        <Link href={href(defaultLocale)} className="mt-[28px] inline-flex h-[52px] items-center justify-center rounded-[4px] bg-brand px-[32px] text-[16px] font-medium text-white">{t.home}</Link>
      </section>
    </PageShell>
  );
}
