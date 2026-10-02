import type { ReactNode } from 'react';

/** Eyebrow + H2 of a group section. The H2 is focusable (tabIndex -1) so the hero link can move focus here. */
export function GroupHeading({ id, eyebrow, title, align, className = '', children }: { id: string; eyebrow: string | null; title: string; align: 'center' | 'left'; className?: string; children?: ReactNode }) {
  return (
    <div className={`${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
      {eyebrow && <p className="m-0 text-[14px] font-bold italic leading-[24px] text-red underline md:text-[18px] xl:text-[20px]">{eyebrow}</p>}
      <h2
        id={id}
        tabIndex={-1}
        className="m-0 mt-[8px] text-[32px] font-bold leading-[40px] text-navy outline-none md:text-[44px] md:leading-[54px] xl:text-[55.6px] xl:leading-[64px]"
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
