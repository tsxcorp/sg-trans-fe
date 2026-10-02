import type { AppLocale } from '@/lib/i18n/locales';
import { CardsGroup } from './CardsGroup';
import { LifecycleGroup } from './LifecycleGroup';
import { PhotoGridGroup } from './PhotoGridGroup';
import { TilesGroup } from './TilesGroup';
import type { Group, OurServiceMessages } from './types';

/** Renders a service group with the block its `layout` names. A group without a layout renders nothing. */
export function GroupSection({ group, t, locale }: { group: Group; t: OurServiceMessages; locale: AppLocale }) {
  switch (group.layout) {
    case 'tiles':
      return <TilesGroup group={group} t={t} locale={locale} />;
    case 'cards':
      return <CardsGroup group={group} t={t} locale={locale} />;
    case 'photo-grid':
      return <PhotoGridGroup group={group} t={t} locale={locale} />;
    case 'cards-lifecycle':
      return <LifecycleGroup group={group} t={t} locale={locale} />;
    default:
      return null;
  }
}
