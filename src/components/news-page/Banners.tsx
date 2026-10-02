import type { getResources } from '@/lib/cms/pages/news';
import { ResourceAction } from './ResourceAction';
import newsMessages from '@/lib/i18n/messages/pages/news.en.json';

type Resource = Awaited<ReturnType<typeof getResources>>[number];

/** The two promo banners below Industry Insights (slots banner_left / banner_right). */
export function Banners({ r, left, right }: { r: (typeof newsMessages)['resource']; left?: Resource; right?: Resource }) {
  const l = left?.translations[0];
  const rt = right?.translations[0];
  return (
    <div className="mx-auto mt-[40px] grid w-full max-w-[1360px] grid-cols-1 gap-[24px] px-[16px] md:px-[24px] lg:mt-[48px] lg:grid-cols-2 lg:gap-[32px] lg:px-[40px]">
      {left && l && (
        <section aria-label={l.title} className="relative flex min-h-[300px] flex-col overflow-hidden bg-[#0224a6] px-[24px] pb-[32px] pt-[36px] text-white md:px-[48px] lg:h-[355px] lg:min-h-0 lg:pt-[48px]">
          <span aria-hidden="true" className="absolute right-0 top-0 hidden h-[109px] w-[110px] rounded-bl-[16px] bg-[#1b3aaf] sm:block">
            <span className="absolute left-[34px] top-[34px] h-[42px] w-[18px] bg-[#0224a6]" />
            <span className="absolute left-[67px] top-[19px] h-[16px] w-[16px] bg-[#0224a6]" />
            <span className="absolute left-[67px] top-[52px] h-[24px] w-[16px] bg-[#0224a6]" />
          </span>
          {l.eyebrow && <p className="m-0 text-[11px] font-bold leading-[16px] tracking-[3.3px] text-white/85">{l.eyebrow}</p>}
          <h2 className="relative m-0 mt-[16px] max-w-[330px] text-[26px] font-bold uppercase leading-[32px] md:text-[30px] md:leading-[36px]">{l.title}</h2>
          <p className="relative m-0 mt-[23px] max-w-[440px] text-[14px] leading-[20px] text-[#8091d2]">{l.description}</p>
          <div className="relative mt-[24px]">
            <ResourceAction file={left.file} label={l.cta_label} unavailable={r.unavailable} variant="view" className="inline-block border-b-2 border-white pb-[5px] text-[12px] font-bold uppercase leading-[16px] text-white" />
          </div>
        </section>
      )}
      {right && rt && (
        <section aria-label={rt.title} className="relative flex min-h-[300px] flex-col overflow-hidden bg-[#111a23] px-[24px] pb-[32px] pt-[32px] text-white md:px-[48px] lg:h-[355px] lg:min-h-0 lg:pt-[38px]">
          <span aria-hidden="true" className="absolute left-[64%] top-[240px] h-[300px] w-[215px] origin-top-left -rotate-[10deg] rounded-[28px] bg-[#41484f]" />
          {rt.eyebrow && <p className="m-0 text-[11px] font-bold leading-[16px] tracking-[3.3px] text-[#ffdad6]">{rt.eyebrow}</p>}
          <h2 className="relative m-0 mt-[16px] max-w-[330px] text-[26px] font-bold uppercase leading-[32px] md:text-[30px] md:leading-[36px]">{rt.title}</h2>
          <p className="relative m-0 mt-[25px] max-w-[290px] text-[14px] leading-[20px] text-[#9aa0a8]">{rt.description}</p>
          <div className="relative mt-[25px]">
            <ResourceAction file={right.file} label={rt.cta_label} unavailable={r.unavailable} variant="download" className="inline-block border-b-2 border-red pb-[5px] text-[12px] font-bold uppercase leading-[16px] text-white" />
          </div>
        </section>
      )}
    </div>
  );
}
