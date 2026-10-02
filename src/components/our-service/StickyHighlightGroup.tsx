'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Keeps exactly one `.hl-card` marked `data-active="true"` inside it: the default one, moved to the card under
 * the pointer or holding keyboard focus. Unlike the shared HighlightGroup, leaving all cards keeps the last
 * highlight (spec of the Services page, section 4). The visual highlight is pure CSS on `[data-active]`.
 */
export function StickyHighlightGroup({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const activate = (e: Event) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.hl-card');
      if (!card) return;
      el.querySelectorAll<HTMLElement>('.hl-card').forEach((c) => c.setAttribute('data-active', c === card ? 'true' : 'false'));
    };
    el.addEventListener('pointerover', activate);
    el.addEventListener('focusin', activate);
    return () => {
      el.removeEventListener('pointerover', activate);
      el.removeEventListener('focusin', activate);
    };
  }, []);

  return <div ref={root} className="contents">{children}</div>;
}
