import type { getContactPage, getOperationGroups } from '@/lib/cms/pages/contact';
import type contactMessages from '@/lib/i18n/messages/pages/contact.en.json';

type Page = Awaited<ReturnType<typeof getContactPage>>;
type Group = Awaited<ReturnType<typeof getOperationGroups>>[number];

export function Operations({ page, groups, t }: { page: Page; groups: Group[]; t: (typeof contactMessages)['operations'] }) {
  const tr = page.translations[0];
  const panels = [1, 2].map((n) => groups.filter((g) => g.panel === n));
  return (
    <section id="operations" aria-labelledby="operations-title" className="bg-white px-[16px] py-[48px] md:px-[24px] md:py-[64px] xl:h-[571px] xl:p-0">
      <div className="mx-auto max-w-[1232px] xl:w-[1232px] xl:max-w-none">
        <h2 id="operations-title" className="m-0 text-left text-[32px] font-bold leading-[40px] text-navy md:text-[44px] md:leading-[54px] xl:pt-[129px] xl:text-[56px] xl:leading-[64px]">{tr.operations_title}</h2>
        <div className="mt-[28px] grid gap-[24px] md:grid-cols-1 lg:grid-cols-2 lg:gap-[32px] xl:mt-[50px]">
          {panels.map((gs, i) => (
            <div key={i} className="grid gap-[24px] border-l-[8px] border-[#0224a6] bg-[#eeedf7] px-[24px] py-[24px] min-[480px]:grid-cols-2 xl:h-[200px] xl:grid-cols-[264px_1fr] xl:gap-0 xl:py-[32px] xl:pl-[32px]">
              {gs.map((g) => (
                <div key={g.id} className="min-w-0">
                  <h3 className="m-0 text-[12px] font-normal uppercase leading-[16px] text-[#757685]">{g.translations[0].label}</h3>
                  <ul className="m-0 mt-[9px] list-none p-0">
                    {g.points.map((p) => (
                      <li key={p.id} className="mt-[24px] first:mt-0">
                        <p className="m-0 text-[16px] font-semibold leading-[22px] text-[#1a1b23]">{p.location}</p>
                        <p className="m-0 text-[14px] leading-[22px] text-[#444654]">{p.persons.join(t.personsSeparator)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
