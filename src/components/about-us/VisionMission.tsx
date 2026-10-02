import { CmsImage } from '@/components/ui/Image';
import type { getAboutPage } from '@/lib/cms/pages/about';
import messages from '@/lib/i18n/messages/pages/about-us.en.json';
import { WarehouseOutline } from './icons';

type Page = NonNullable<Awaited<ReturnType<typeof getAboutPage>>>;

export function VisionMission({ page }: { page: Page }) {
  const tr = page.translations[0];
  const blocks = [
    { id: 'vision', title: tr.vision_title, text: tr.vision_text, cls: 'xl:w-[521px]', max: 'xl:max-w-[412px]' },
    { id: 'mission', title: tr.mission_title, text: tr.mission_text, cls: 'xl:w-[755px]', max: 'xl:max-w-[640px]' },
  ];
  return (
    <section id="vision-mission" aria-label={messages.visionLabel} className="relative overflow-hidden bg-[#212f93] px-[20px] py-[48px] md:px-[32px] md:py-[72px] xl:h-[679px] xl:p-0 xl:pt-[144px]">
      {page.vision_mission_image && (
        <CmsImage file={page.vision_mission_image} alt="" width={1920} height={679} className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="relative mx-auto flex max-w-[1276px] flex-col divide-y divide-line rounded-[6px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] md:flex-row md:divide-x md:divide-y-0 xl:h-[391px] xl:w-[1276px] xl:max-w-none">
        {blocks.map((b) => (
          <div key={b.id} className={`px-[24px] py-[32px] md:flex-1 md:px-[32px] md:py-[40px] xl:flex-none xl:px-[50px] xl:pb-0 xl:pt-[60px] ${b.cls}`}>
            <WarehouseOutline className="h-[43px] w-[43px] text-red xl:ml-[9px] xl:h-[47px] xl:w-[47px]" />
            <h3 className="m-0 mt-[24px] text-[26px] font-bold leading-[38px] text-navy md:text-[28px] xl:mt-[40px] xl:text-[39px] xl:leading-[48px]">{b.title}</h3>
            <p className={`m-0 mt-[12px] text-[16px] leading-[28px] text-navy md:text-[18px] md:leading-[32px] xl:mt-[32px] xl:text-[23.8px] xl:leading-[38px] ${b.max}`}>{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
