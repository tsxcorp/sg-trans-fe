'use client';

import { Children, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';

const QUERY = '(max-width: 767px)';
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

/**
 * Scroll-snap carousel like the shared `Carousel`, but the pagination dots are only rendered while the
 * carousel is a carousel (below md): on wider screens the cards are a static grid and there are no buttons in
 * the DOM at all (nothing hidden but focusable-looking, nothing to skip).
 */
export function NarrowCarousel({
  children, label, slideLabel, trackClassName = '', itemClassName = '',
}: {
  children: ReactNode; label: string; slideLabel: string; trackClassName?: string; itemClassName?: string;
}) {
  const items = Children.toArray(children);
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const narrow = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
  const name = (i: number) => slideLabel.replace('{n}', String(i + 1)).replace('{total}', String(items.length));

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
  useEffect(() => { onScroll(); }, [onScroll, items.length]);

  const go = (i: number) => {
    const el = track.current;
    const kid = el?.children[i] as HTMLElement | undefined;
    if (el && kid) el.scrollTo({ left: kid.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };

  return (
    <div role="group" aria-roledescription="carousel" aria-label={label}>
      <ul ref={track} onScroll={onScroll} className={`m-0 flex list-none snap-x snap-mandatory overflow-x-auto p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${trackClassName}`}>
        {items.map((child, i) => (
          <li key={i} className={`snap-start ${itemClassName}`} aria-roledescription="slide" aria-label={name(i)}>{child}</li>
        ))}
      </ul>
      {narrow && (
        <div className="flex justify-center">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={name(i)}
              aria-current={active === i ? 'true' : undefined}
              onClick={() => go(i)}
              className="flex h-[44px] w-[24px] items-center justify-center"
            >
              <span aria-hidden="true" className={`h-[6px] w-[6px] rounded-full ${active === i ? 'bg-red' : 'bg-[#f2b5b6]'}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
