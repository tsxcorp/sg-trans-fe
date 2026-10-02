import { CmsImage } from '@/components/ui/Image';
import type { getCompanyProfile, getContactPage, getOffices } from '@/lib/cms/pages/contact';
import type contactMessages from '@/lib/i18n/messages/pages/contact.en.json';
import { BuildingIcon, CrosshairIcon, PinIcon } from './icons';

type Page = Awaited<ReturnType<typeof getContactPage>>;
type Company = Awaited<ReturnType<typeof getCompanyProfile>>;
type Office = Awaited<ReturnType<typeof getOffices>>[number];

const OFFICE_ICONS = { pin: PinIcon, building: BuildingIcon } as const;

/** `(84) 028 38233 068` -> `tel:+842838233068`: digits only, national 0 after the country code dropped. */
const telHref = (phone: string) => `tel:+${phone.replace(/\D/g, '').replace(/^840/, '84')}`;

function MapCard({ page }: { page: Page }) {
  const tr = page.translations[0];
  const image = page.map_image && <CmsImage file={page.map_image} alt={tr.map_alt} width={608} height={400} className="h-full w-full object-cover" />;
  return (
    <div className="relative h-[264px] w-full overflow-hidden bg-[#f1ece0] md:h-[360px] xl:absolute xl:left-[672px] xl:top-[118px] xl:h-[400px] xl:w-[608px]">
      {page.map_open_url ? (
        <a href={page.map_open_url} target="_blank" rel="noopener noreferrer" aria-label={tr.map_link_label} className="block h-full w-full">
          {image}
        </a>
      ) : (
        image
      )}
      <p className="pointer-events-none absolute right-[16px] top-[16px] m-0 flex h-[48px] w-[170px] items-center gap-[7px] rounded-[2px] bg-white/95 pl-[14px] text-[12.2px] font-bold uppercase text-navy shadow-[0_3px_10px_rgba(0,0,0,0.1)]">
        <CrosshairIcon className="h-[16px] w-[16px]" />
        {tr.map_chip}
      </p>
    </div>
  );
}

export function Offices({ page, company, offices, t }: { page: Page; company: Company; offices: Office[]; t: (typeof contactMessages)['offices'] }) {
  return (
    <section id="offices" aria-labelledby="offices-title" className="relative overflow-clip bg-white py-[40px] md:py-[64px] xl:h-[550px] xl:py-0">
      {page.world_image && (
        <CmsImage file={page.world_image} alt="" width={520} height={700} className="pointer-events-none absolute right-0 top-[42px] hidden h-[700px] w-[520px] max-w-none min-[1536px]:block" />
      )}
      <div className="relative mx-auto grid max-w-[1280px] gap-[32px] px-[16px] lg:grid-cols-2 lg:gap-[48px] md:px-[24px] xl:block xl:h-full xl:w-[1280px] xl:max-w-none xl:p-0">
        <MapCard page={page} />
        <div className="order-first min-w-0 xl:contents">
          <h2 id="offices-title" className="m-0 text-[30px] font-bold leading-[38px] tracking-[-0.03em] text-navy md:text-[36px] md:leading-[44px] xl:absolute xl:left-0 xl:top-[117px]">{company.legal_name}</h2>
          <ul className="m-0 mt-[24px] list-none p-0 xl:contents">
            {offices.map((o, i) => {
              const Icon = OFFICE_ICONS[(o.icon as keyof typeof OFFICE_ICONS) ?? 'pin'] ?? PinIcon;
              const o_tr = o.translations[0];
              return (
                <li key={o.id} className={`mt-[20px] flex gap-[12px] first:mt-0 xl:absolute xl:left-0 xl:mt-0 ${i === 0 ? 'xl:top-[189px]' : 'xl:top-[257px]'}`}>
                  <Icon className={`mt-[1px] h-[20px] w-[20px] shrink-0 text-navy`} />
                  <div className="min-w-0">
                    <p className="m-0 text-[13px] font-bold uppercase leading-[18px] tracking-[0.06em] text-[#1a1b23]">{o_tr.name}</p>
                    <p className="m-0 mt-[4px] text-[16px] leading-[24px] text-[#444654]">{o_tr.address}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-[28px] grid grid-cols-1 gap-[20px] border-l-[8px] border-navy bg-[#f4f2fd] px-[24px] py-[24px] min-[360px]:grid-cols-2 md:px-[32px] xl:absolute xl:left-0 xl:top-[350px] xl:mt-0 xl:h-[124px] xl:w-[608px] xl:grid-cols-[285px_1fr] xl:gap-0 xl:px-[32px] xl:py-0 xl:pt-[33px]">
            <div className="min-w-0">
              <p className="m-0 text-[12px] leading-[16px] text-[#757685]">{t.licenseTax}</p>
              <p className="m-0 mt-[2px] text-[14.4px] leading-[21px] text-[#1a1b23]">{company.license_tax}</p>
              <p className="m-0 text-[14.4px] leading-[21px] text-[#1a1b23]">{t.vat} {company.vat}</p>
            </div>
            <div className="min-w-0">
              <p className="m-0 text-[12px] leading-[16px] text-[#757685]">{t.directConnect}</p>
              <p className="m-0 mt-[2px] text-[14.4px] font-semibold leading-[21px]"><a href={telHref(company.phone)} className="text-navy">{company.phone}</a></p>
              <p className="m-0 break-words text-[14.4px] leading-[21px]"><a href={`mailto:${company.email}`} className="text-[#444654]">{company.email}</a></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
