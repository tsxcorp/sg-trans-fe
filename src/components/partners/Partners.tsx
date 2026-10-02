import { CmsImage } from '@/components/ui/Image';
import { Carousel } from '@/components/ui/Carousel';
import type { Messages } from '@/lib/i18n/messages';
import type { getPartners } from '@/lib/cms';

type Partner = Awaited<ReturnType<typeof getPartners>>[number];

export function Partners({ t, slideLabel, partners, className = 'xl:absolute xl:inset-x-0 xl:top-[1053px]', id }: { t: Messages['partners']; slideLabel: string; partners: Partner[]; className?: string; id?: string }) {
  return (
    <section id={id} aria-labelledby="partners-title" className={`relative py-[40px] pl-[23px] text-left md:px-0 md:text-center xl:py-0 xl:pl-0 ${className}`}>
      <p className="m-0 text-[12px] font-bold italic leading-[20px] text-red underline xl:leading-[24px] md:text-[18px] xl:text-[20px]">{t.eyebrow}</p>
      <h2 id="partners-title" className="m-0 mt-[8px] text-[32px] font-bold leading-[40px] text-navy md:text-[44px] md:leading-[54px] xl:mt-[20px] xl:pl-[14px] xl:text-[57px] xl:leading-[64px]">{t.title}</h2>
      <div className="mx-auto mt-[28px] max-w-[1750px] px-[12px] xl:mt-[48px] xl:px-0">
        <Carousel
          label={t.title}
          slideLabel={slideLabel}
          trackClassName="lg:grid lg:grid-cols-7 lg:place-items-center lg:overflow-visible"
          itemClassName="flex shrink-0 basis-1/4 items-center justify-center md:basis-1/5 lg:basis-auto"
          dotsClassName="lg:hidden"
        >
          {partners.map((p) => (
            <CmsImage key={p.id} file={p.logo} alt={p.name} width={100} height={103} loading="eager" className="h-auto w-[44px] max-w-none md:w-[90px] xl:w-auto" />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
