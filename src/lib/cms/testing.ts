import 'server-only';
// Test-only hooks (see docs/architecture.md). Not imported by application code.
import { listStoredLeads, clearStoredLeads } from './leadStore';
import { setTransport, getSent, resetMail, type MailTransport } from './mail';
import { resetRateLimit } from './rateLimit';
import { clearSubscribers, listSubscribers } from './subscriberStore';
import type { SubscriberT } from './schema';
import type { LeadT } from './schema';

export const listSubscribersForTest = (): Promise<SubscriberT[]> => listSubscribers();
export const listLeads = (): Promise<LeadT[]> => listStoredLeads();
export async function resetLeads(): Promise<void> {
  await clearStoredLeads();
  await clearSubscribers();
  resetMail();
  resetRateLimit();
}
export const setMailTransport = (fn: MailTransport | null): void => setTransport(fn);
export const getSentCount = (): number => getSent();
