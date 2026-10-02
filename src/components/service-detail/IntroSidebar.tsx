import Link from 'next/link';
import { ChevronRight, Headset, Phone } from 'lucide-react';
import { CmsImage } from '@/components/ui/Image';
import { href } from '@/lib/i18n/paths';
import type { AppLocale } from '@/lib/i18n/locales';
import { serviceIcon } from '@/components/our-service/icons';
import { sanitizeRich } from './rich';
import type { Detail, ServiceDetailMessages } from './types';

type Related = { slug: string; title: string };

export function IntroSidebar({
  detail, introTitle, fallbackIntroHtml, related, t, locale, forklift, map,
}: {
  detail: Detail; introTitle: string; fallbackIntroHtml: string; related: Related[]; t: ServiceDetailMessages; locale: AppLocale; forklift: string | null; map: string | null;
}) {
  const d = detail.translations[0];
  const intro = d?.intro_html || fallbackIntroHtml;
  return (
    <section aria-labelledby="detail-intro-title" className="relative overflow-hidden bg-white px-[16px] pb-[48px] pt-[40px] md:px-[32px] md:pt-[56px] xl:h-[1072px] xl:p-0">
      {/* decoration: dotted world map and grey forklift, hidden below md */}
      {map && (
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-[45px] hidden w-[590px] md:block xl:left-[calc(50%+370px)] xl:right-auto">
          <CmsImage file={map} alt="" width={590} height={470} className="h-auto w-full max-w-none" />
        </div>
      )}
      {forklift && (
        <div aria-hidden="true" className="pointer-events-none absolute left-0 top-[701px] hidden w-[300px] md:block">
          <CmsImage file={forklift} alt="" width={300} height={371} className="h-auto w-full max-w-none" />
        </div>
      )}
      <div className="relative mx-auto flex max-w-[1292px] flex-col gap-[32px] lg:flex-row lg:items-stretch lg:gap-[40px] xl:h-full xl:w-[1292px] xl:max-w-none xl:gap-0 xl:pl-[38px] xl:pt-[118px] xl:pb-[119px]">
        <div className="min-w-0 lg:flex-1 xl:w-[848px] xl:flex-none xl:pt-[3px]">
          <p className="m-0 text-[14px] font-bold italic leading-[24px] text-red underline md:text-[18px] xl:text-[20px]">{d?.intro_eyebrow || t.defaults.introEyebrow}</p>
          <h2 id="detail-intro-title" className="m-0 mt-[8px] text-[30px] font-bold leading-[38px] text-navy md:text-[44px] md:leading-[54px] xl:mt-[17px] xl:text-[56px] xl:leading-[67px]">{introTitle}</h2>
          <p
            className="m-0 mt-[14px] text-[16px] leading-[27px] text-[#475569] md:text-[17px] xl:mt-[14px] xl:text-[18px] xl:leading-[29.3px] xl:[text-indent:5px] [&_strong]:font-bold [&_strong]:text-[#334155]"
            dangerouslySetInnerHTML={{ __html: sanitizeRich(intro) }}
          />
          <Highlights detail={detail} t={t} />
        </div>
        <aside className="flex flex-col gap-[16px] xl:ml-[48px] xl:w-[320px] xl:flex-none xl:gap-[25px] xl:-mt-[3px]">
          {related.length > 0 && (
            <nav aria-label={t.related.title} className="rounded-[4px] border border-[#e2e8f0] bg-white p-[20px] shadow-[0_2px_8px_rgba(15,23,42,0.06)] xl:h-[290px] xl:px-[24px] xl:pt-[30px]">
              <h3 className="m-0 border-b border-[#f1f5f9] pb-[14px] text-[17.8px] font-bold leading-[24px] text-[#0224a6] xl:pb-[9px]">{t.related.title}</h3>
              <ul className="m-0 mt-[8px] list-none p-0 xl:mt-[14px]">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={href(locale, `services/${r.slug}`)} className="group flex min-h-[44px] items-center justify-between px-[13px] text-[14.2px] leading-[20px] text-[#475569] hover:text-navy xl:h-[48px]">
                      {r.title}
                      <ChevronRight aria-hidden="true" className="h-[14px] w-[14px] text-[#94a3b8] group-hover:text-navy" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className="relative overflow-hidden rounded-[8px] bg-[#0224a6] p-[24px] text-white shadow-[0_6px_16px_rgba(2,36,166,0.2)] xl:flex-1 xl:px-[24px] xl:pt-[27px]">
            <Headset aria-hidden="true" strokeWidth={1.5} className="absolute -bottom-[14px] -right-[12px] h-[110px] w-[110px] text-white/10" />
            <h3 className="relative m-0 text-[19.8px] font-bold leading-[28px]">{t.help.title}</h3>
            <p className="relative m-0 mt-[8px] max-w-[270px] text-[14.4px] leading-[20px] text-white/80">{t.help.text}</p>
            <Link href={href(locale, 'contact')} className="relative mt-[20px] inline-flex min-h-[44px] items-center gap-[14px] text-[17.8px] font-semibold leading-[24px] text-white xl:mt-[15px]">
              <Phone aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={2} />
              {t.help.phone}
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Highlights({ detail, t }: { detail: Detail; t: ServiceDetailMessages }) {
  if (detail.highlights.length === 0) return null;
  const d = detail.translations[0];
  return (
    <div className="relative mt-[24px] overflow-hidden border border-[#e2e8f0] bg-white xl:mt-[33px] xl:h-[495px]">
      <h3 className="m-0 pt-[16px] text-center text-[18px] font-bold uppercase leading-[24px] tracking-[0.06em] text-[#0224a6] xl:pt-[1px] xl:text-[21.4px]">{d?.highlights_title || t.defaults.highlightsTitle}</h3>
      <ul className="m-0 mt-[20px] grid list-none grid-cols-2 gap-x-[8px] gap-y-[20px] p-0 px-[8px] md:grid-cols-4 xl:-mx-px xl:mt-[17px] xl:px-0">
        {detail.highlights.map((h) => {
          const Icon = serviceIcon(h.icon);
          return (
            <li key={h.id} className="flex flex-col items-center text-center">
              <span className={`flex h-[64px] w-[64px] items-center justify-center rounded-[10px] border-2 border-[#0224a6] ${h.emphasis ? 'bg-[#0224a6] text-white' : 'bg-[#f8fafc] text-[#0224a6]'}`}>
                <Icon aria-hidden="true" className="h-[26px] w-[26px]" strokeWidth={1.8} />
              </span>
              <span className="mt-[14px] text-[13px] font-semibold leading-[20px] text-[#1e293b] xl:mt-[12px] xl:text-[14px]">{h.translations[0].label}</span>
            </li>
          );
        })}
      </ul>
      {detail.highlights_image && (
        <div className="mt-[16px] xl:absolute xl:inset-x-0 xl:bottom-px xl:mt-0">
          <CmsImage file={detail.highlights_image} alt={t.highlightsImageAlt} width={846} height={341} className="h-auto w-full object-contain" />
        </div>
      )}
    </div>
  );
}
