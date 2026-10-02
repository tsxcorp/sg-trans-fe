import 'server-only';
import type { LeadT } from './schema';

export type MailTransport = (lead: LeadT) => Promise<void>;

// M1: no real email. The default transport only logs the lead id (no personal data in logs).
const defaultTransport: MailTransport = async (lead) => {
  console.info(`[lead] notification queued for lead ${lead.id}`);
};

let transport: MailTransport = defaultTransport;
let sent = 0;

export function setTransport(fn: MailTransport | null) {
  transport = fn ?? defaultTransport;
}
export const getSent = () => sent;
export function resetMail() {
  transport = defaultTransport;
  sent = 0;
}

/** Returns true when the notification went out. Never throws. */
export async function notify(lead: LeadT): Promise<boolean> {
  try {
    await transport(lead);
    sent += 1;
    return true;
  } catch (err) {
    console.error(`[lead] notification failed for lead ${lead.id}`, err instanceof Error ? err.name : 'error');
    return false;
  }
}
