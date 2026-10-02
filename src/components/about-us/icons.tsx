import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const line = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Red outline warehouse (Capabilities, Vision / Mission). Drawn from the measured design icon (43 x 43). */
export const WarehouseOutline = (p: P) => (
  <svg viewBox="8 1 43 43" width={43} height={43} aria-hidden="true" {...line} strokeWidth={1.6} {...p}>
    <path d="M8.8 42.5V11L29.200 1.800 49.800 11v31.500Z" />
    <circle cx="29.200" cy="12" r="2.800" />
    <path d="M14.800 42.500V19.600h29.600v22.900M24.700 33.300v-8h9.800v8M19.700 41.900v-8.600h19.600v8.600M29.500 33.300v8.600" />
  </svg>
);

/** Orange box-in-hand (Core values). Drawn from the measured design icon (65 x 70). */
export const BoxHandOutline = (p: P) => (
  <svg viewBox="9 9 65 70" width={65} height={70} aria-hidden="true" {...line} strokeWidth={1.8} {...p}>
    <path d="M44.400 9.800 71.500 18.300v28.600L44.400 55.200 17.700 46.900V18.300Z" />
    <path d="M17.700 18.300 44.400 27l27.100-8.700" />
    <path d="M44.400 27v28.200" strokeDasharray="5 3.500" />
    <path d="m24 19.800 25 7.600M31 14.400l24.200 7.400" />
    <path d="M54.500 24.800v6.700h4M62 22.600v4.600l-3.500 4.300" />
    <path d="M22.900 39.600v5.200M27.500 40.600v4" />
    <path d="M9.400 58.800h7.300M9.400 72.900h7.300M16.700 58v16.600H26V58ZM21.200 62.500v3M21.200 69.500v2" />
    <path d="M26 59.200h4.200c8 0 13.800 4.200 21.800 4.600h8.600c3.500 0 6 .6 8 .8 3.300 1.200 3.600 4.600-.2 6.400L52 77.300c-6.500 3-11.400 2-16.600-.3L26 74.200" />
    <path d="M41 67.400h21.500" />
  </svg>
);

export const StarIcon = (p: P) => (
  <svg viewBox="0 0 24 24" width={17} height={17} aria-hidden="true" fill="currentColor" {...p}>
    <path d="m12 1.500 3.200 7 7.600.9-5.600 5.200 1.500 7.500L12 18.300 5.300 22.100l1.500-7.500L1.200 9.400l7.600-.9Z" />
  </svg>
);

const ICONS = { warehouse: WarehouseOutline, 'box-hand': BoxHandOutline } as const;

/** Icon by CMS name; unknown or empty names fall back to `fallback`. */
export function OutlineIcon({ icon, fallback, ...p }: P & { icon: string | null; fallback: keyof typeof ICONS }) {
  const key = icon && Object.hasOwn(ICONS, icon) ? (icon as keyof typeof ICONS) : fallback;
  return key === 'warehouse' ? <WarehouseOutline {...p} /> : <BoxHandOutline {...p} />;
}
