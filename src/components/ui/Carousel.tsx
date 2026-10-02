'use client';

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Horizontal scroll-snap carousel with pagination dots (mobile pattern of the design).
 * The track scrolls natively (touch, trackpad, keyboard via focusable children); dots mirror the position and
 * jump to a slide. Use `trackClassName` / `dotsClassName` with breakpoint prefixes to switch to a plain grid on
 * wider screens (e.g. `xl:grid`, dots `xl:hidden`).
 */
export function Carousel({
  children,
  label,
  slideLabel,
  trackClassName = '',
  itemClassName = '',
  dotsClassName = '',
}: {
  children: ReactNode;
  label: string;
  /** e.g. "Slide {n} of {total}" */
  slideLabel: string;
  trackClassName?: string;
  itemClassName?: string;
  dotsClassName?: string;
}) {
  const items = Children.toArray(children);
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const kids = [...el.children] as HTMLElement[];
    let best = 0, bestDist = Infinity;
    kids.forEach((k, i) => {
      const d = Math.abs(k.offsetLeft - el.offsetLeft - el.scrollLeft);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) best = kids.length - 1;
    setActive(best);
  }, []);

  useEffect(() => {
    onScroll();
  }, [onScroll, items.length]);

  const go = (i: number) => {
    const el = track.current;
    const kid = el?.children[i] as HTMLElement | undefined;
    if (el && kid) el.scrollTo({ left: kid.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };

  return (
    <div role="group" aria-roledescription="carousel" aria-label={label}>
      <ul ref={track} data-hl-list onScroll={onScroll} className={`m-0 flex list-none snap-x snap-mandatory overflow-x-auto p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${trackClassName}`}>
        {items.map((child, i) => (
          <li key={i} className={`snap-start ${itemClassName}`} aria-roledescription="slide" aria-label={slideLabel.replace('{n}', String(i + 1)).replace('{total}', String(items.length))}>
            {child}
          </li>
        ))}
      </ul>
      <div className={`mt-[16px] flex justify-center gap-[6px] ${dotsClassName}`}>
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={slideLabel.replace('{n}', String(i + 1)).replace('{total}', String(items.length))}
            aria-current={active === i ? 'true' : undefined}
            onClick={() => go(i)}
            className={`h-[6px] w-[6px] rounded-full md:h-[10px] md:w-[10px] ${active === i ? 'bg-red' : 'bg-[#f2b5b6]'}`}
          />
        ))}
      </div>
    </div>
  );
}
