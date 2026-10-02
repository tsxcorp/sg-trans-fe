import { CmsImage } from '@/components/ui/Image';

export function DetailHero({ title, subtitle, image }: { title: string; subtitle: string | null; image: string | null }) {
  return (
    <section className="relative h-[300px] overflow-hidden bg-[#2a3f9a] text-center text-white md:h-[360px] xl:h-[495px]">
      {image && <CmsImage file={image} alt="" width={1920} height={495} className="absolute inset-0 h-full w-full object-cover" priority />}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-[16px] pt-[40px] md:px-[32px] xl:contents">
        <h1 className="m-0 text-[32px] font-bold uppercase leading-[40px] md:text-[44px] md:leading-[52px] xl:absolute xl:inset-x-0 xl:top-[266px] xl:text-[50px] xl:leading-[60px]">{title}</h1>
        {subtitle && (
          <p className="m-0 mt-[12px] max-w-[900px] text-[11px] uppercase leading-[16px] tracking-[0.1em] md:text-[13px] md:leading-[20px] xl:absolute xl:left-[calc(50%-70px)] xl:top-[327px] xl:mt-0 xl:w-[900px] xl:-translate-x-1/2 xl:text-[14px] xl:leading-[19.5px] xl:tracking-[1.3px]">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
