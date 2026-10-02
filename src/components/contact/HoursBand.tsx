import { CmsImage } from '@/components/ui/Image';
import type { getContactPage, getOpeningHours } from '@/lib/cms/pages/contact';
import type contactMessages from '@/lib/i18n/messages/pages/contact.en.json';
import { BriefcaseIcon, ClipboardCheckIcon, ClockIcon } from './icons';

type Page = Awaited<ReturnType<typeof getContactPage>>;
type Hours = Awaited<ReturnType<typeof getOpeningHours>>[number];

const ICONS = { briefcase: BriefcaseIcon, 'clipboard-check': ClipboardCheckIcon } as const;

export function HoursBand({ page, hours, t }: { page: Page; hours: Hours[]; t: (typeof contactMessages)['hours'] }) {
  const tr = page.translations[0];
  return (
    <section id="hours" aria-labelledby="hours-title" className="relative overflow-clip bg-white px-[16px] pb-[40px] md:px-[24px] md:pb-[56px] xl:h-[411px] xl:p-0">
      <h2 id="hours-title" className="sr-only">{t.heading}</h2>
      {page.forklift_image && (
        <CmsImage file={page.forklift_image} alt="" width={284} height={363} className="pointer-events-none absolute left-0 top-[48px] hidden h-[363px] w-[284px] max-w-none xl:block" />
      )}
      <div className="relative mx-auto grid max-w-[1280px] bg-[#0224a6] text-white xl:block xl:h-[293px] xl:w-[1280px] xl:max-w-none">
        <ul className="m-0 grid list-none gap-[28px] p-[24px] min-[480px]:grid-cols-2 md:p-[32px] xl:contents">
          {hours.map((h, i) => {
            const Icon = ICONS[(h.icon as keyof typeof ICONS) ?? 'briefcase'] ?? BriefcaseIcon;
            const h_tr = h.translations[0];
            return (
              <li key={h.id} className={`min-w-0 xl:absolute xl:top-[91px] ${i === 0 ? 'xl:left-[48px]' : 'xl:left-[374px]'}`}>
                <p className="m-0 flex items-center gap-[8px] text-[20px] font-semibold leading-[28px] xl:text-[23.5px]">
                  <Icon className="h-[24px] w-[24px] shrink-0 text-red xl:-ml-[1px]" />
                  {h_tr.title}
                </p>
                <p className="m-0 mt-[24px] text-[16px] leading-[20px] text-[#94a3b8] xl:mt-[27px]">{h_tr.days}</p>
                <p className="m-0 mt-[8px] text-[28px] font-bold leading-[34px] tracking-[-0.04em] xl:mt-[4px] xl:text-[29px]">{h.time_range}</p>
              </li>
            );
          })}
        </ul>
        <div className="relative mx-[24px] border-t border-[#334155] py-[24px] md:mx-[32px] md:py-[32px] xl:absolute xl:left-[700px] xl:top-0 xl:m-0 xl:h-full xl:w-[580px] xl:border-0 xl:p-0">
          <span aria-hidden="true" className="pointer-events-none absolute right-[0px] top-[16px] block h-[64px] w-[64px] text-[#1b3aaf] xl:left-[440px] xl:right-auto xl:top-[32px] xl:h-[108px] xl:w-[108px]">
            <ClockIcon className="h-full w-full" />
          </span>
          <span aria-hidden="true" className="absolute hidden w-px bg-[#334155] xl:left-0 xl:top-[48px] xl:block xl:h-[196px]" />
          <div className="relative xl:absolute xl:left-[49px] xl:top-[64px] xl:w-[460px]">
            <p className="m-0 text-[12px] font-medium uppercase leading-[16px] tracking-[0.12em] text-red">{tr.notice_label}</p>
            <p className="m-0 mt-[12px] text-[18px] font-bold leading-[24px] xl:mt-[7px]">{tr.notice_title}</p>
            <div className="mt-[22px] max-w-[430px] text-[16px] leading-[21px] xl:mt-[18px]">
              {tr.notice_blocks.map((b) => (
                <p key={b.lead} className="m-0 mb-[18px] last:mb-0">
                  <strong className="font-bold">{b.lead}</strong>{' '}
                  <span>{b.text}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
