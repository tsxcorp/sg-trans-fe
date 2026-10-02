import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { SubscriberT } from './schema';

// M1 storage for newsletter subscribers: memory under tests, otherwise one JSON file per subscriber.
const memory = new Map<string, SubscriberT>();
const inMemory = () => process.env.NODE_ENV === 'test';
const dir = () => process.env.SUBSCRIBERS_DIR ?? path.join(process.cwd(), '.data', 'subscribers');

export async function listSubscribers(): Promise<SubscriberT[]> {
  if (inMemory()) return [...memory.values()];
  try {
    const names = await fs.readdir(dir());
    return Promise.all(names.map(async (n) => JSON.parse(await fs.readFile(path.join(dir(), n), 'utf8')) as SubscriberT));
  } catch {
    return [];
  }
}

/** Stores a subscriber unless the e-mail is already subscribed (case-insensitive). Returns false if it was a duplicate. */
export async function saveSubscriber(sub: SubscriberT): Promise<boolean> {
  const email = sub.email.toLowerCase();
  if ((await listSubscribers()).some((s) => s.email.toLowerCase() === email)) return false;
  if (inMemory()) {
    memory.set(sub.id, sub);
    return true;
  }
  await fs.mkdir(dir(), { recursive: true, mode: 0o700 });
  await fs.writeFile(path.join(dir(), `${sub.id}.json`), JSON.stringify(sub, null, 2), { encoding: 'utf8', mode: 0o600 });
  return true;
}

export async function clearSubscribers(): Promise<void> {
  memory.clear();
  if (!inMemory() && process.env.SUBSCRIBERS_DIR) await fs.rm(dir(), { recursive: true, force: true });
}
