import { CmsImage } from '@/components/ui/Image';
import { serviceIcon } from './icons';

type Stat = { value: string; icon: string | null; translations: { label: string }[] };
type Page = {
  intro_images: string[];
  intro_stats: Stat[];
  translations: [{ intro_eyebrow: string; intro_title: string; intro_body: string; badge_value: string; badge_label: string }];
};

export function Intro({ page, forklift, map }: { page: Page; forklift: string; map: string }) {
  const t = page.translations[0];
  return (
    <section aria-labelledby="intro-title" className="relative overflow-hidden bg-white px-[20px] py-[56px] md:px-[32px] md:py-[72px] xl:h-[712px] xl:p-0">
      {/* decoration: hidden below lg */}
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-[41px] hidden w-[590px] lg:block xl:left-[calc(50%+370px)] xl:right-auto">
        <CmsImage file={map} alt="" width={590} height={450} className="h-auto w-full max-w-none" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-[341px] hidden w-[300px] lg:block">
        <CmsImage file={forklift} alt="" width={300} height={371} className="h-auto w-full max-w-none" />
      </div>
      <div className="relative mx-auto max-w-[1248px] md:flex md:flex-col lg:flex-row lg:items-start lg:gap-[40px] xl:absolute xl:left-1/2 xl:ml-[-600px] xl:block xl:h-full xl:w-[1248px] xl:max-w-none">
        <div className="lg:w-[52%] xl:absolute xl:left-0 xl:top-[121px] xl:w-[692px]">
          <p className="m-0 text-[14px] font-bold italic leading-[24px] text-red underline md:text-[18px] xl:text-[20px]">{t.intro_eyebrow}</p>
          <h2 id="intro-title" className="m-0 mt-[8px] whitespace-pre-line text-[34px] font-bold leading-[40px] text-navy md:text-[48px] md:leading-[56px] xl:mt-[18px] xl:text-[55.5px] xl:leading-[66px]">{t.intro_title}</h2>
          <p className="m-0 mt-[16px] text-[16px] leading-[27px] text-muted md:text-[17px] xl:ml-[10px] xl:mt-[17px] xl:w-[690px] xl:text-[16px] xl:leading-[29px]">{t.intro_body}</p>
          <ul className="m-0 mt-[24px] flex list-none flex-wrap gap-x-[40px] gap-y-[16px] p-0 xl:mt-[33px] xl:gap-x-[0px]">
            {page.intro_stats.map((s, i) => {
              const Icon = serviceIcon(s.icon);
              return (
                <li key={i} className="flex items-start gap-[16px] xl:w-[318px]">
                  <Icon className="mt-[4px] h-[30px] w-[30px] shrink-0 text-[#ed421a] xl:h-[38px] xl:w-[38px]" strokeWidth={1.3} aria-hidden="true" />
                  <div>
                    <p className="m-0 text-[30px] font-bold leading-[36px] text-navy xl:text-[37px] xl:leading-[34px]">{s.value}</p>
                    <p className="m-0 text-[14px] uppercase leading-[22px] text-navy xl:mt-[3px] xl:text-[15.6px] xl:leading-[24px]">{s.translations[0].label}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <hr className="mt-[24px] hidden h-px w-[614px] border-0 bg-[#e5e5e5] xl:mt-[42px] xl:block" />
        </div>
        <div className="relative mx-auto mt-[40px] aspect-[526/470] w-full max-w-[526px] lg:mt-0 lg:w-[44%] xl:absolute xl:left-[722px] xl:top-0 xl:mt-0 xl:h-[633px] xl:w-[526px] xl:max-w-none xl:[aspect-ratio:auto]">
          <div className="absolute left-0 top-0 w-[73.5%] xl:left-0 xl:top-[164px] xl:w-[387px]">
            <CmsImage file={page.intro_images[0]} alt="" width={387} height={384} className="h-auto w-full" />
          </div>
          <div className="absolute left-[44%] top-[16%] w-[54.5%] xl:left-[239px] xl:top-[264px] xl:w-[287px]">
            <CmsImage file={page.intro_images[1]} alt="" width={287} height={361} className="h-auto w-full" />
          </div>
          <div
            className="absolute bottom-[0%] left-[5.7%] flex aspect-square w-[33.5%] flex-col items-center justify-center text-center xl:justify-start xl:pt-[33px] drop-shadow-[0_4px_14px_rgba(0,0,0,0.12)] xl:bottom-auto xl:left-[30px] xl:top-[457px] xl:h-[176px] xl:w-[176px]"
          >
            <span aria-hidden="true" className="absolute inset-0 bg-white [clip-path:polygon(0_0,100%_17.6%,100%_100%,0_100%)]" />
            <p className="relative m-0 text-[36px] font-bold leading-[1] text-red xl:mt-0 xl:text-[64px] xl:leading-[64px]">{t.badge_value}</p>
            <p className="relative m-0 mt-[4px] text-[10px] uppercase leading-[14px] text-muted xl:mt-[8px] xl:text-[15.6px] xl:leading-[24px]">{t.badge_label}</p>
          </div>
          <div aria-hidden="true" className="absolute right-0 top-0 hidden h-[105px] w-[108px] [background:radial-gradient(circle_at_1.5px_1.5px,#000_1.5px,transparent_1.9px)_0_0/15px_15px] xl:block xl:left-[418px] xl:right-auto xl:top-[164px] xl:h-[103px] xl:w-[108px]" />
        </div>
      </div>
    </section>
  );
}
