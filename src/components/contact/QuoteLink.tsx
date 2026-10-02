'use client';

import type { MouseEvent, ReactNode } from 'react';

/**
 * In-page jump to the quote form: scrolls there (smooth unless the visitor prefers reduced motion),
 * updates the hash and moves focus to the first field of the form.
 */
export function QuoteLink({ className, children }: { className?: string; children: ReactNode }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('project-quote');
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'start' });
    window.history.pushState(window.history.state, '', '#project-quote');
    target.querySelector<HTMLElement>('[name="first_name"]')?.focus({ preventScroll: true });
  };
  return (
    <a href="#project-quote" onClick={onClick} className={className}>
      {children}
    </a>
  );
}
