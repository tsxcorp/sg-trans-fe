'use client';

import type { MouseEvent, ReactNode } from 'react';

/**
 * In-page link to a group section (`#<slug>`). The browser's own fragment navigation would reset focus to the
 * document, so the jump is done here: update the hash, scroll (instant under prefers-reduced-motion) and move
 * keyboard / screen-reader focus to the section's heading. Without JavaScript it stays a plain anchor.
 */
export function ExploreLink({ target, className, children }: { target: string; className?: string; children: ReactNode }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const section = document.getElementById(target);
    const heading = section?.querySelector<HTMLElement>('h2');
    if (!section || !heading) return;
    e.preventDefault();
    window.history.pushState(null, '', `#${target}`);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    heading.focus({ preventScroll: true });
  };
  return (
    <a href={`#${target}`} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
