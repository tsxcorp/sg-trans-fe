import Link from 'next/link';
import type { ReactNode } from 'react';

const TOKEN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g;

/** Only these link targets survive: site paths, https:, mailto:, tel:. Anything else (javascript:, data:, //host) is dropped. */
export function safeUrl(url: string): { url: string; kind: 'internal' | 'external' | 'other' } | null {
  const u = url.trim();
  if (u.startsWith('/') && !u.startsWith('//') && !u.includes('\\')) return { url: u, kind: 'internal' };
  if (/^https:\/\/[^\s/]+/i.test(u)) return { url: u, kind: 'external' };
  if (/^(mailto|tel):[^\s]+$/i.test(u)) return { url: u, kind: 'other' };
  return null;
}

/**
 * Renders the allowed inline marks of an article text: **bold**, *italic*, [label](url).
 * The output is React nodes only: text is escaped by React and no HTML is ever injected.
 */
export function Inline({ text }: { text: string }): ReactNode {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (m) {
      const target = safeUrl(m[2]);
      if (!target) return m[1];
      const cls = 'text-[#0224a6] underline underline-offset-2 hover:no-underline';
      if (target.kind === 'internal') return <Link key={i} href={target.url} className={cls}>{m[1]}</Link>;
      if (target.kind === 'external') return <a key={i} href={target.url} target="_blank" rel="noopener noreferrer" className={cls}>{m[1]}</a>;
      return <a key={i} href={target.url} className={cls}>{m[1]}</a>;
    }
    return part;
  });
}
