'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Keeps exactly one `.hl-card` marked `data-active="true"` inside it: the default one (index `defaultIndex`),
 * moved to the card under the pointer or holding keyboard focus, and back to the default when both leave.
 * The visual highlight is pure CSS on `[data-active]`; server HTML already has the default marked.
 */
export function HighlightGroup({ children, defaultIndex }: { children: ReactNode; defaultIndex: number }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const cards = () => [...el.querySelectorAll<HTMLElement>('.hl-card')];
    const activate = (card: HTMLElement | undefined) => cards().forEach((c) => c.setAttribute('data-active', card === c ? 'true' : 'false'));
    const reset = () => activate(cards()[defaultIndex]);
    const target = (e: Event) => (e.target as HTMLElement).closest<HTMLElement>('.hl-card') ?? undefined;
    const over = (e: Event) => { const c = target(e); if (c) activate(c); };
    const out = (e: Event) => {
      const next = (e as FocusEvent | PointerEvent).relatedTarget as HTMLElement | null;
      if (!next || !el.contains(next)) reset();
    };
    el.addEventListener('pointerover', over);
    el.addEventListener('focusin', over);
    el.addEventListener('pointerleave', reset);
    el.addEventListener('focusout', out);
    return () => {
      el.removeEventListener('pointerover', over);
      el.removeEventListener('focusin', over);
      el.removeEventListener('pointerleave', reset);
      el.removeEventListener('focusout', out);
    };
  }, [defaultIndex]);

  return <div ref={root} className="contents">{children}</div>;
}
