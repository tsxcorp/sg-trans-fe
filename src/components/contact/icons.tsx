import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({ width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p });

export const PinIcon = (p: P) => (
  <svg {...base(p)}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
);
export const BuildingIcon = (p: P) => (
  <svg {...base({ strokeWidth: 0, ...p })}>
    <path fill="currentColor" fillRule="evenodd" d="M3 21V8h6V3h12v18zm2-11v2h2v-2zm0 4v2h2v-2zm0 4v2h2v-2zm6-14v2h2V5zm4 0v2h2V5zm-4 4v2h2V9zm4 0v2h2V9zm-4 4v2h2v-2zm4 0v2h2v-2zm-4 4v2h2v-2zm4 0v2h2v-2z" />
  </svg>
);
export const BriefcaseIcon = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}><rect x="2.500" y="7" width="19" height="13" rx="1.500" /><path d="M8.500 7V4.500h7V7M2.500 13h19" /><rect x="10" y="11.500" width="4" height="3" fill="currentColor" stroke="none" /></svg>
);
export const ClipboardCheckIcon = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}><path d="M8.500 4H5.500a1.500 1.500 0 0 0-1.500 1.500v15A1.500 1.500 0 0 0 5.500 22h13a1.500 1.500 0 0 0 1.500-1.500v-15A1.500 1.500 0 0 0 18.500 4h-3" /><rect x="8.500" y="2" width="7" height="4" rx="1" /><path d="m8.500 14 2.800 2.800L16 11.500" /></svg>
);
export const ClockIcon = (p: P) => (
  <svg {...base({ viewBox: '0 0 100 100', strokeWidth: 8, ...p })}><circle cx="50" cy="50" r="46" /><path d="M42 24v34l22 18" strokeWidth="9" /></svg>
);
export const CrosshairIcon = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
);
export const EnvelopeIcon = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const PhoneHandset = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><path d="M22 16.900v3a2 2 0 0 1-2.200 2 19.800 19.800 0 0 1-8.600-3.100 19.500 19.500 0 0 1-6-6A19.800 19.800 0 0 1 2.100 4.200 2 2 0 0 1 4.100 2h3a2 2 0 0 1 2 1.700c.1 1 .4 1.900.7 2.800a2 2 0 0 1-.5 2.100L8.100 9.900a16 16 0 0 0 6 6l1.300-1.300a2 2 0 0 1 2.100-.4c.9.3 1.800.6 2.800.7a2 2 0 0 1 1.700 2z" /></svg>
);
export const ChevronDownThin = (p: P) => (
  <svg {...base({ strokeWidth: 2, ...p })}><path d="m6 9 6 6 6-6" /></svg>
);
