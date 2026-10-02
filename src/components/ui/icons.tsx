import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({ width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p });

export const PhoneIcon = (p: P) => (
  <svg {...base(p)}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></svg>
);
export const MailIcon = (p: P) => (
  <svg {...base(p)}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
);
/** Filled rounded box with a check mark. `mark` is the colour of the tick (default: brand blue). */
export const CheckBoxIcon = ({ mark = '#3851dd', ...p }: P & { mark?: string }) => (
  <svg {...base(p)}><rect x="1" y="1" width="22" height="22" rx="4" fill="currentColor" stroke="none" /><path d="m7 12.500 3.500 3.500L17 8.500" stroke={mark} strokeWidth="2.600" /></svg>
);
export const InfoDot = ({ mark = '#fff', ...p }: P & { mark?: string }) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="11" fill="currentColor" stroke="none" /><path d="M12 11v6M12 7.200v.1" stroke={mark} strokeWidth="2.600" /></svg>
);
export const ArrowRightCircle = ({ mark = '#fff', ...p }: P & { mark?: string }) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="11" fill="currentColor" stroke="none" /><path d="M8 12h8m-3.500-3.500L16 12l-3.500 3.500" stroke={mark} strokeWidth="2.400" /></svg>
);
export const ChevronRight = (p: P) => (
  <svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>
);
export const PackageCheck = (p: P) => (
  <svg {...base(p)}><path d="m16 16 2 2 4-4" /><path d="M21 10V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l2-1.1" /><path d="m7.5 4.3 9 5.2" /><path d="M3.3 7 12 12l8.7-5" /><path d="M12 22V12" /></svg>
);
export const UserIcon = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M6.2 18.6a7 7 0 0 1 11.6 0" /></svg>
);
export const CommentIcon = (p: P) => (
  <svg {...base(p)}><path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-5.2A8 8 0 1 1 21 12z" /></svg>
);
export const SocialTwitter = (p: P) => (
  <svg {...base({ fill: 'currentColor', stroke: 'none', ...p })}><path d="M22 5.9c-.7.3-1.5.5-2.4.6.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4.1 4.1 0 0 0 1.3 5.5c-.7 0-1.3-.2-1.9-.5 0 2 1.4 3.7 3.300 4.100-.6.2-1.200.2-1.800.1.500 1.600 2 2.800 3.800 2.800A8.200 8.200 0 0 1 2 18.300 11.600 11.600 0 0 0 8.300 20c7.500 0 11.700-6.300 11.700-11.700v-.5c.8-.6 1.500-1.300 2-2z" /></svg>
);
export const SocialFacebook = (p: P) => (
  <svg {...base({ fill: 'currentColor', stroke: 'none', ...p })}><path d="M14 8.500V6.800c0-.8.2-1.200 1.300-1.200H17V2.200C16.700 2.200 15.700 2 14.600 2 12.100 2 10.500 3.500 10.500 6.200v2.300H8v3.600h2.500V22H14v-9.900h2.700l.4-3.600H14z" /></svg>
);
export const SocialInstagram = (p: P) => (
  <svg {...base(p)}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.500" cy="6.500" r=".6" fill="currentColor" /></svg>
);
export const SocialYoutube = (p: P) => (
  <svg {...base({ fill: 'currentColor', stroke: 'none', ...p })}><path d="M21.600 7.200a2.500 2.500 0 0 0-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 0 0 2.400 7.200C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800c.4-1.600.4-4.800.4-4.800s0-3.200-.4-4.800zM10 15V9l5.200 3z" /></svg>
);
export const SocialLinkedin = (p: P) => (
  <svg {...base({ fill: 'currentColor', stroke: 'none', ...p })}><path d="M4.500 8.500h3.600V20H4.500zM6.300 3a2.100 2.100 0 1 1 0 4.200 2.100 2.100 0 0 1 0-4.200zM10.300 8.500h3.400v1.600c.5-.9 1.700-1.900 3.500-1.900 3.700 0 4.300 2.400 4.300 5.600V20h-3.600v-5.400c0-1.300 0-3-1.800-3s-2.100 1.400-2.100 2.900V20h-3.600z" /></svg>
);
export const ChevronDown = (p: P) => (
  <svg {...base({ strokeWidth: 2.4, ...p })}><path d="m6 9 6 6 6-6" /></svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base({ strokeWidth: 2.6, ...p })}><path d="M3 6h18M3 12h18M3 18h18" /></svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base({ strokeWidth: 2.4, ...p })}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const GlobeSmall = (p: P) => (
  <svg {...base({ strokeWidth: 1.8, ...p })}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></svg>
);
export const MailSmall = (p: P) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const ShipIcon = (p: P) => (
  <svg {...base({ strokeWidth: 1.6, ...p })}><path d="M2 20c1.200.8 2.500 1 4 .5s2.500-.5 4 0 2.800.3 4 0 2.500-.5 4 0 2.800.3 4-.5" /><path d="M4 17 2.500 12H21.500L20 17" /><path d="M12 12V3m-4 9V7h8v5M9 7V4" /></svg>
);
export const PlaneIcon = (p: P) => (
  <svg {...base({ strokeWidth: 1.6, ...p })}><path d="M17.800 19.200 16 11l3.500-3.500C21 6 21.500 4 21 3c-1-.5-3 0-4.500 1.500L13 8 4.800 6.200c-.5-.1-.9.100-1.100.5l-.3.5c-.2.500-.1 1 .3 1.300L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.500 5.300c.3.400.8.500 1.300.3l.5-.2c.4-.3.600-.7.500-1.200z" /></svg>
);
export const BoxHandIcon = (p: P) => (
  <svg {...base({ strokeWidth: 1.6, ...p })}><path d="M12 3 7 5.500v5L12 13l5-2.500v-5z" /><path d="M7 5.500 12 8l5-2.500M12 8v5" /><path d="M2 17h3.500l3 1.500h5.500c1 0 1.500.9 1 1.700L14 22H8.500L5 20.500H2" /><path d="M14 18.500 20.500 16a1.500 1.500 0 0 1 1.500 2l-4 2.500" /></svg>
);
export const WarehouseIcon = (p: P) => (
  <svg {...base({ strokeWidth: 1.6, ...p })}><path d="M22 8.400V20h-4v-7H6v7H2V8.400L12 3z" /><path d="M6 21v-3h12v3M6 17v-2.500h12V17" /></svg>
);
export const TruckIcon = (p: P) => (
  <svg {...base({ strokeWidth: 1.6, ...p })}><path d="M14 17V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1" /><path d="M14 9h4l4 4v4h-2" /><circle cx="7" cy="17.500" r="2" /><circle cx="17" cy="17.500" r="2" /><path d="M9 17.500h6" /></svg>
);
export const GlobeIcon = (p: P) => (
  <svg {...base({ strokeWidth: 1.6, ...p })}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
);

export const ICONS = {
  warehouse: WarehouseIcon,
  truck: TruckIcon,
  globe: GlobeIcon,
  'box-hand': BoxHandIcon,
  ship: ShipIcon,
  plane: PlaneIcon,
} as const;
export type IconName = keyof typeof ICONS;
export const iconByName = (name: string | null) => (name && Object.hasOwn(ICONS, name) ? ICONS[name as IconName] : BoxHandIcon);
