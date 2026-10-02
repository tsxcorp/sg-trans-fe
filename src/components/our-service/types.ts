import type { ServiceGroup } from '@/lib/cms/pages/services';

export type Group = ServiceGroup;
export type Child = ServiceGroup['children'][number];
export type Step = ServiceGroup['steps'][number];
export type OurServiceMessages = typeof import('@/lib/i18n/messages/pages/our-service.en.json');
