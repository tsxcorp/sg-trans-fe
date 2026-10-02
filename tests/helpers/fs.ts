import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function walk(dir: string, skip: (rel: string) => boolean, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = path.relative(REPO_ROOT, full);
    if (skip(rel)) continue;
    if (e.isDirectory()) walk(full, skip, out);
    else out.push(full);
  }
  return out;
}
