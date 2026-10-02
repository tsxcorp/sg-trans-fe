'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import type { Messages } from '@/lib/i18n/messages';

type Column = Messages['footer']['columns'][number];

/** Footer link columns. Below md they become a tab list (one column visible at a time); md and up show all four. */
export function FooterColumns({ columns, locale, tabsLabel }: { columns: Column[]; locale: AppLocale; tabsLabel: string }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const link = 'text-[16px] leading-[24px] text-[#c5ddfd] hover:text-white';
  return (
    <>
      <div className="md:hidden">
        <div role="tablist" aria-label={tabsLabel} className="flex flex-wrap justify-between gap-x-[12px] gap-y-[8px]">
          {columns.map((c, i) => (
            <button
              key={c.id}
              id={`${id}-tab-${i}`}
              role="tab"
              type="button"
              aria-selected={active === i}
              aria-controls={`${id}-panel-${i}`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') setActive((active + 1) % columns.length);
                if (e.key === 'ArrowLeft') setActive((active + columns.length - 1) % columns.length);
              }}
              className={`border-b-2 pb-[6px] text-[15px] font-semibold text-white min-[400px]:text-[17px] ${active === i ? 'border-white' : 'border-transparent opacity-80'}`}
            >
              {c.title}
            </button>
          ))}
        </div>
        {columns.map((c, i) => (
          <ul key={c.id} id={`${id}-panel-${i}`} role="tabpanel" aria-labelledby={`${id}-tab-${i}`} hidden={active !== i} className="m-0 mt-[16px] flex list-none flex-col gap-[14px] p-0">
            {c.links.map((l) => (<li key={l.label}><Link href={href(locale, l.path)} className={link}>{l.label}</Link></li>))}
          </ul>
        ))}
      </div>
      <div className="hidden grid-cols-4 gap-[32px] md:grid xl:contents">
        {columns.map((c, i) => (
          <nav key={c.id} aria-label={c.title} className={`xl:absolute xl:top-[82px] ${['xl:left-[321px]', 'xl:left-[632px]', 'xl:left-[829px]', 'xl:left-[1083px]'][i]}`}>
            <h3 className="m-0 text-[18px] font-semibold leading-[24px] text-white">{c.title}</h3>
            <ul className="m-0 mt-[24px] flex list-none flex-col gap-[16px] p-0">
              {c.links.map((l) => (<li key={l.label}><Link href={href(locale, l.path)} className={link}>{l.label}</Link></li>))}
            </ul>
          </nav>
        ))}
      </div>
    </>
  );
}
