import type { getContactPage, getContactPersons } from '@/lib/cms/pages/contact';
import type contactMessages from '@/lib/i18n/messages/pages/contact.en.json';
import { EnvelopeIcon, PhoneHandset } from './icons';

type Page = Awaited<ReturnType<typeof getContactPage>>;
type Person = Awaited<ReturnType<typeof getContactPersons>>[number];

const COL_START = ['', 'lg:col-start-1', 'lg:col-start-2', 'lg:col-start-3', 'lg:col-start-4'];
// Connector geometry at lg and up: the centres of the 4 columns of a 4-column grid with a 45 px gap.
const DROPS = ['11.18%', '37.06%', '62.94%', '88.82%'];
const LINE = 'absolute hidden bg-[#d6d6e2] lg:block';

function TopCard({ p, t }: { p: Person; t: (typeof contactMessages)['leadership'] }) {
  return (
    <li className="relative md:col-span-2 lg:col-span-4 lg:mb-[34px]">
      <div className="mx-auto w-full border-t-[5px] border-red bg-white px-[24px] pb-[24px] pt-[28px] text-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] lg:h-[221px] lg:max-w-[364px] lg:p-0 lg:pt-[24px]">
        <p className="m-0 mx-auto w-[120px] text-[14px] font-semibold uppercase leading-[22px] tracking-[0.02em] text-[#757685]">{p.translations[0].role}</p>
        <p className="m-0 mt-[8px] text-[25.2px] font-semibold leading-[32px] text-[#1a1b23] lg:mt-[4px]">{p.full_name}</p>
        {p.email && (
          <p className="m-0 mt-[24px] flex items-center justify-center gap-[17px] text-[17px] leading-[24px] lg:mt-[27px]">
            <EnvelopeIcon className="h-[13px] w-[13px] shrink-0 text-[#0224a6]" />
            <a href={`mailto:${p.email}`} title={p.email} className="min-w-0 truncate text-[#0224a6]">{p.email}</a>
          </p>
        )}
        {p.extension && (
          <p className="m-0 mt-[4px] flex items-center justify-center gap-[14px] text-[16px] leading-[24px] text-[#444654] lg:mt-[2px]">
            <PhoneHandset className="h-[12px] w-[12px] shrink-0 text-[#444654]" />
            <span aria-label={t.extAria}>{t.ext} {p.extension}</span>
          </p>
        )}
      </div>
      <span data-testid="org-connector" aria-hidden="true" className={`${LINE} left-1/2 top-full -ml-px h-[33px] w-[2px]`} />
      <span data-testid="org-connector" aria-hidden="true" className={`${LINE} left-[11.18%] right-[11.18%] top-[calc(100%+33px)] h-[2px]`} />
      {DROPS.map((left) => (
        <span key={left} data-testid="org-connector" aria-hidden="true" className={`${LINE} top-[calc(100%+33px)] -ml-px h-[36px] w-[2px]`} style={{ left }} />
      ))}
    </li>
  );
}

function PersonCard({ p, t }: { p: Person; t: (typeof contactMessages)['leadership'] }) {
  const col = p.level === 1 || p.level === 2 ? COL_START[p.column ?? 0] : '';
  return (
    <li className={`border-t-[3px] border-[#0224a6] bg-white px-[16px] pb-[28px] pt-[32px] text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:h-[197px] lg:px-[32px] lg:pb-0 lg:pt-[31px] ${col}`}>
      <p className="m-0 text-[14px] font-semibold uppercase leading-[16px] tracking-[0.02em] text-[#757685]">{p.translations[0].role}</p>
      <p className="m-0 mt-[16px] text-[22px] font-semibold lg:mt-[17px] leading-[28px] text-[#1a1b23]">{p.full_name}</p>
      {p.email && (
        <p className="m-0 mt-[7px] text-[15.5px] leading-[20px] lg:mt-[23px]">
          <a href={`mailto:${p.email}`} title={p.email} aria-label={`${t.emailAria} ${p.email}`} className="mx-auto block max-w-full truncate py-[12px] text-[#0224a6] lg:max-w-[222px] lg:py-0">{p.email}</a>
        </p>
      )}
      {p.extension && <p className="m-0 mt-[9px] text-[15.5px] lg:mt-[4px] leading-[20px] text-[#444654]">{t.ext} {p.extension}</p>}
    </li>
  );
}

export function Leadership({ page, persons, t }: { page: Page; persons: Person[]; t: (typeof contactMessages)['leadership'] }) {
  const tr = page.translations[0];
  return (
    <section id="leadership" aria-labelledby="leadership-title" className="bg-[#f8f8f8] px-[16px] py-[48px] md:px-[24px] md:py-[64px] xl:h-[1136px] xl:p-0">
      <div className="mx-auto max-w-[1280px] xl:w-[1280px] xl:max-w-none">
        <header className="text-center xl:pt-[101px]">
          <p className="m-0 text-[16px] font-bold italic leading-[24px] text-red underline md:text-[18px] xl:text-[20px]">{tr.leadership_eyebrow}</p>
          <h2 id="leadership-title" className="m-0 mt-[8px] text-[32px] font-bold leading-[40px] text-navy md:text-[44px] md:leading-[54px] xl:mt-[18px] xl:text-[56px] xl:leading-[64px]">{tr.leadership_title}</h2>
        </header>
        <ul className="m-0 mt-[32px] grid list-none grid-cols-1 gap-[16px] p-0 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-[45px] lg:gap-y-[35px] xl:mt-[80px]">
          {persons.map((p) => (p.level === 0 ? <TopCard key={p.id} p={p} t={t} /> : <PersonCard key={p.id} p={p} t={t} />))}
        </ul>
      </div>
    </section>
  );
}
