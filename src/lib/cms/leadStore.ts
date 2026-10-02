import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { LeadT } from './schema';

// M1 storage. Tests (NODE_ENV=test) use memory; otherwise one JSON file per lead in .data/leads/.
const memory = new Map<string, LeadT>();
const inMemory = () => process.env.NODE_ENV === 'test';
const dir = () => process.env.LEADS_DIR ?? path.join(process.cwd(), '.data', 'leads');

export async function saveLead(lead: LeadT): Promise<void> {
  if (inMemory()) {
    memory.set(lead.id, lead);
    return;
  }
  await fs.mkdir(dir(), { recursive: true, mode: 0o700 });
  await fs.writeFile(path.join(dir(), `${lead.id}.json`), JSON.stringify(lead, null, 2), { encoding: 'utf8', mode: 0o600 });
}

export async function setEmailStatus(id: string, status: LeadT['email_status']): Promise<void> {
  if (inMemory()) {
    const lead = memory.get(id);
    if (lead) memory.set(id, { ...lead, email_status: status });
    return;
  }
  const file = path.join(dir(), `${id}.json`);
  const lead = JSON.parse(await fs.readFile(file, 'utf8')) as LeadT;
  await fs.writeFile(file, JSON.stringify({ ...lead, email_status: status }, null, 2), 'utf8');
}

export async function listStoredLeads(): Promise<LeadT[]> {
  if (inMemory()) return [...memory.values()];
  try {
    const names = await fs.readdir(dir());
    return Promise.all(names.map(async (n) => JSON.parse(await fs.readFile(path.join(dir(), n), 'utf8')) as LeadT));
  } catch {
    return [];
  }
}

export async function clearStoredLeads(): Promise<void> {
  memory.clear();
  // Never wipe the default lead folder: only an explicit LEADS_DIR (e.g. a temp dir in e2e) may be cleared.
  if (!inMemory() && process.env.LEADS_DIR) await fs.rm(dir(), { recursive: true, force: true });
}
