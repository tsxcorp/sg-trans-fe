import 'server-only';
import en from './messages/en.json';
import { defaultLocale, type AppLocale } from './locales';

export type Messages = typeof en;

// Add `vi: () => import('./messages/vi.json')` here when Vietnamese is enabled.
const loaders: Record<AppLocale, () => Messages> = { en: () => en };

export function getMessages(locale: string): Messages {
  return (loaders[locale as AppLocale] ?? loaders[defaultLocale])();
}
