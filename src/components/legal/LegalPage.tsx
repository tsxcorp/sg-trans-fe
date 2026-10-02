import { PageShell } from '@/components/shell/PageShell';
import type { AppLocale } from '@/lib/i18n/locales';
import legal from '@/lib/i18n/messages/pages/legal.en.json';

type Doc = (typeof legal)['privacy'];

export function LegalPage({ locale, doc }: { locale: AppLocale; doc: Doc }) {
  return (
    <PageShell locale={locale}>
      <section className="bg-navy px-[20px] pb-[48px] pt-[48px] text-center text-white xl:pb-[72px] xl:pt-[200px]">
        <h1 className="m-0 text-[32px] font-bold leading-[40px] md:text-[48px] md:leading-[56px]">{doc.title}</h1>
      </section>
      <section className="bg-page px-[20px] py-[48px] md:px-[32px] xl:py-[72px]">
        <div className="mx-auto max-w-[820px] rounded-[8px] bg-white p-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] md:p-[40px]">
          <p className="m-0 rounded-[4px] bg-[#fff4e5] px-[14px] py-[10px] text-[14px] leading-[22px] text-[#7a4a00]">{legal.draftNotice}</p>
          {doc.sections.map((s) => (
            <section key={s.heading} className="mt-[28px]">
              <h2 className="m-0 text-[22px] font-bold leading-[30px] text-navy">{s.heading}</h2>
              {s.paragraphs.map((p) => (
                <p key={p} className="m-0 mt-[10px] text-[16px] leading-[28px] text-ink">{p}</p>
              ))}
            </section>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
