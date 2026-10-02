import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({ width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p });

export const SearchIcon = (p: P) => (
  <svg {...base(p)}><circle cx="10.500" cy="10.500" r="6.500" /><path d="m20 20-4.900-4.900" /></svg>
);
export const DocumentIcon = (p: P) => (
  <svg {...base({ strokeWidth: 1.800, ...p })}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6M9 9h2" /></svg>
);
export const DownloadIcon = (p: P) => (
  <svg {...base(p)}><path d="M12 4v11m-4.500-4.500L12 15l4.500-4.500M5 20h14" /></svg>
);
export const ArrowLeftLong = (p: P) => (
  <svg {...base({ strokeWidth: 1.800, ...p })}><path d="M20 12H4m6-6-6 6 6 6" /></svg>
);
export const ArrowRightLong = (p: P) => (
  <svg {...base({ strokeWidth: 1.800, ...p })}><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
);
/** Two overlapping speech bubbles (comments counter of the cards). */
export const CommentsIcon = (p: P) => (
  <svg {...base({ strokeWidth: 1.700, ...p })}>
    <path d="M3 9.500A3 3 0 0 1 6 6.500h5.500a3 3 0 0 1 3 3v2.500a3 3 0 0 1-3 3H8.500L5 17.500V15A3 3 0 0 1 3 12z" />
    <path d="M9.500 6.500V5.500a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V8a3 3 0 0 1-2 2.800V14.500l-3-2.500" />
  </svg>
);
