import type { ComponentType, SVGProps } from 'react';
import {
  Archive, Banknote, BadgeCheck, BrainCog, ChartColumn, ClipboardCheck, ClipboardList, Factory, Gavel,
  Globe, Headset, Landmark, MapPin, MapPinned, Package, Radar, Shield, ShieldCheck, Ship, Truck, Warehouse, Zap,
} from 'lucide-react';
import { BoxHandIcon } from '@/components/ui/icons';

type Icon = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number | string }>;

/** Icon keys used by the Services pages' CMS data. Unknown keys fall back to the box-in-hand icon. */
const MAP: Record<string, Icon> = {
  'box-hand': BoxHandIcon,
  factory: Factory,
  truck: Truck,
  ship: Ship,
  gavel: Gavel,
  archive: Archive,
  'map-pin': MapPin,
  landmark: Landmark,
  'ship-plane': Ship,
  'clipboard-shield': ClipboardCheck,
  'container-truck': Truck,
  'warehouse-boxes': Warehouse,
  'globe-pin': MapPinned,
  globe: Globe,
  package: Package,
  headset: Headset,
  'clipboard-list': ClipboardList,
  'shield-check': ShieldCheck,
  chart: ChartColumn,
  radar: Radar,
  shield: Shield,
  banknote: Banknote,
  'badge-check': BadgeCheck,
  zap: Zap,
  'brain-cog': BrainCog,
};

export const serviceIcon = (name: string | null | undefined): Icon => (name && Object.hasOwn(MAP, name) ? MAP[name] : BoxHandIcon);

/** Renders the icon for a CMS icon key (use where a component variable would be created during render). */
export function ServiceIcon({ icon, ...props }: { icon: string | null | undefined } & SVGProps<SVGSVGElement> & { strokeWidth?: number | string }) {
  const Icon = icon && Object.hasOwn(MAP, icon) ? MAP[icon] : BoxHandIcon;
  return <Icon {...props} />;
}
