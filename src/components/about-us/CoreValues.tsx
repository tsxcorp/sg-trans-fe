import { CmsImage } from '@/components/ui/Image';
import type { getAboutPage, getCoreValues } from '@/lib/cms/pages/about';
import { OutlineIcon } from './icons';

type Page = NonNullable<Awaited<ReturnType<typeof getAboutPage>>>;
type CoreValue = Awaited<ReturnType<typeof getCoreValues>>[number];

/** A text block that keeps its own line breaks (SOT column 1 has two lines). */
function Lines({ text }: { text: string }) {
  return text.split('\n').map((line, i) => (
    <span key={i} className="block">{line}</span>
  ));
}

const iconClass = 'h-[52px] w-[48px] shrink-0 md:h-[65px] md:w-[60px] xl:h-[70px] xl:w-[65px]';

function Card({ v }: { v: CoreValue }) {
  const t = v.translations[0];
  const dark = v.variant === 'highlight';
  const title = (
    <h3 className={`m-0 text-[24px] font-bold uppercase leading-[32px] md:text-[32px] md:leading-[44px] xl:text-[39px] xl:leading-[48px] ${dark ? 'text-white' : 'text-navy'}`}>{t.title}</h3>
  );
  const bodyText = 'text-[16px] leading-[28px] md:text-[18px] md:leading-[32px]';
  // Fixed heights from xl: the design rows are 389 / 347 / 251 / 358 px high.
  const height = dark ? 'xl:ml-[2px] xl:mt-[2px] xl:h-[353px] xl:w-[624px]' : { wide_columns: 'xl:h-[346px]', wide: 'xl:h-[250px]', standard: v.sort !== null && v.sort <= 2 ? 'xl:h-[389px]' : 'xl:h-[357px]' }[v.layout];
  return (
    <article
      className={`relative h-full overflow-hidden px-[24px] py-[28px] md:px-[32px] xl:pl-[40px] xl:py-0 xl:pt-[32px] ${height} ${
        dark ? 'rounded-[6px] bg-[#0f1f8c] text-white xl:pr-[56px]' : 'xl:pr-[34px] rounded-[4px] border-2 border-[#e3e3e3] bg-white text-black shadow-[0_6px_20px_rgba(47,67,155,0.07)]'
      }`}
    >
      {dark && v.background_image && <CmsImage file={v.background_image} alt="" width={624} height={353} className="absolute inset-0 h-full w-full object-cover" />}
      <div className="relative">
        {v.layout === 'standard' ? (
          <>
            <OutlineIcon icon={v.icon} fallback="box-hand" className={`${iconClass} text-[#fb461b]`} />
            <div className="mt-[20px] xl:mt-[22px]">{title}</div>
            {t.body.map((p, i) => (
              <p key={i} className={`m-0 mt-[16px] xl:mt-[21px] xl:text-[18.2px] ${bodyText}`}>{p}</p>
            ))}
          </>
        ) : (
          <>
            <div className={`flex items-center ${v.layout === 'wide_columns' ? 'gap-[16px] xl:gap-[29px]' : 'gap-[12px] xl:gap-[16px]'}`}>
              <OutlineIcon icon={v.icon} fallback="box-hand" className={`${iconClass} text-[#fb461b]`} />
              <div className="xl:-mt-[12px]">{title}</div>
            </div>
            {v.layout === 'wide_columns' ? (
              <div className="mt-[20px] grid gap-[16px] lg:grid-cols-3 lg:gap-[24px] xl:mt-[16px] xl:grid-cols-[410px_415px_1fr] xl:gap-0">
                {t.body.map((col, i) => (
                  <p key={i} className={`m-0 ${i === 0 ? 'text-[14px] leading-[26px] xl:max-w-[358px] xl:text-[15px] xl:leading-[29px]' : 'text-[16px] leading-[28px] xl:max-w-[375px] xl:text-[18.2px] xl:leading-[32px]'}`}>
                    <Lines text={col} />
                  </p>
                ))}
              </div>
            ) : (
              t.body.map((p, i) => (
                <p key={i} className={`m-0 mt-[16px] xl:mt-[16px] xl:text-[18.2px] ${bodyText}`}>{p}</p>
              ))
            )}
          </>
        )}
      </div>
    </article>
  );
}

export function CoreValues({ page, items }: { page: Page; items: CoreValue[] }) {
  const tr = page.translations[0];
  return (
    <section id="core-values" aria-labelledby="values-title" className="bg-gradient-to-b from-[#f4f7ff] to-white px-[20px] py-[48px] md:px-[32px] md:py-[72px] xl:h-[1675px] xl:px-0 xl:py-0 xl:pt-[91px]">
      <div className="text-center">
        <p className="m-0 text-[14px] font-bold italic leading-[20px] text-red underline md:text-[18px] xl:text-[20px] xl:leading-[24px]">{tr.values_eyebrow}</p>
        <h2 id="values-title" className="m-0 mt-[8px] text-[32px] font-bold leading-[40px] text-navy md:text-[44px] md:leading-[54px] xl:mt-[20px] xl:text-[56.2px] xl:leading-[64px]">{tr.values_title}</h2>
      </div>
      <ul className="m-0 mx-auto mt-[28px] grid max-w-[1276px] list-none grid-cols-1 gap-[16px] p-0 md:grid-cols-2 md:gap-[20px] xl:mt-[31px] xl:w-[1276px] xl:max-w-none xl:gap-x-[20px] xl:gap-y-[20px]">
        {items.map((v) => (
          <li key={v.id} className={v.layout === 'standard' ? '' : 'md:col-span-2'}>
            <Card v={v} />
          </li>
        ))}
      </ul>
    </section>
  );
}
