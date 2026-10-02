import { iconByName } from '@/components/ui/icons';
import { CmsImage } from '@/components/ui/Image';
import type { Messages } from '@/lib/i18n/messages';
import type { getStats } from '@/lib/cms';

const BG = 'e4676b2c-05fc-556a-82e2-047b56f5122a';
type Stat = Awaited<ReturnType<typeof getStats>>[number];

export function StatsBand({ t, stats }: { t: Messages['stats']; stats: Stat[] }) {
  return (
    <section aria-labelledby="stats-title" className="relative z-10 bg-[#1b2a52] px-[40px] pb-[56px] pt-[56px] md:px-[32px] xl:h-[433px] xl:p-0">
      <CmsImage file={BG} alt="" width={1920} height={433} className="absolute inset-0 h-full w-full object-cover" />
      <h2 id="stats-title" className="relative m-0 text-center max-md:-mx-[14px] text-[28px] font-bold leading-[36px] text-white min-[400px]:text-[30px] md:text-[44px] md:leading-[52px] xl:absolute xl:inset-x-0 xl:top-[118px] xl:text-[56px] xl:leading-[64px]">{t.title}</h2>
      <ul className="relative m-0 mt-[62px] grid list-none grid-cols-2 gap-x-[17px] gap-y-[74px] p-0 md:mx-auto md:max-w-[900px] md:grid-cols-3 xl:absolute xl:left-1/2 xl:top-[301px] xl:mx-0 xl:mt-0 xl:flex xl:max-w-none xl:-translate-x-1/2 xl:gap-[24px]">
        {stats.map((s) => {
          const Icon = iconByName(s.icon);
          const tr = s.translations[0];
          return (
            <li key={s.id} className="relative min-h-[181px] rounded-[6px] bg-white pb-[24px] pt-[52px] text-center xl:min-h-0 shadow-[0_4px_20px_rgba(0,0,0,0.12)] max-md:last:col-span-2 xl:h-[263px] xl:w-[212px] xl:shrink-0 xl:pb-0 xl:pt-[79px]">
              <span className="absolute -top-[37px] left-1/2 flex h-[75px] w-[75px] -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] xl:-top-[54px] xl:h-[110px] xl:w-[110px]">
                <Icon className="h-[34px] w-[34px] text-red xl:h-[46px] xl:w-[46px]" />
              </span>
              <p className="m-0 text-[30px] font-bold leading-[40px] text-navy xl:text-[45px] xl:leading-[56px]">{s.value}</p>
              <p className="m-0 mt-[14px] whitespace-pre-line px-[12px] text-[12px] leading-[25px] md:text-[15px] md:leading-[28px] text-navy xl:mt-[17px] xl:text-[18px] xl:leading-[36px]">{tr?.label}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
