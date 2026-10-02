import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, walk } from '../helpers/fs';

const SKIP_DIRS = /(^|\/)(node_modules|\.git|\.next|coverage|playwright-report|test-results|tests|design\/exports)(\/|$)/;
const files = walk(REPO_ROOT, (rel) => SKIP_DIRS.test(rel) || /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/.test(rel));

const PATTERNS: [string, RegExp][] = [
  ['AWS access key', /AKIA[0-9A-Z]{16}/],
  ['private key block', /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/],
  ['OpenAI/Stripe style secret', /\bsk[-_](?:live|test|proj)?[-_]?[A-Za-z0-9]{20,}/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{30,}/],
  ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/],
  ['hard-coded credential assignment', /\b(?:secret|password|passwd|api[_-]?key|access[_-]?token|auth[_-]?token|directus[_-]?token)\b['"]?\s*[:=]\s*['"][A-Za-z0-9/+_\-.=]{12,}['"]/i],
  ['credentials in URL', /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@'"]+:[^\s@'"]{3,}@(?!localhost|127\.0\.0\.1)[^\s'"]+/i],
];

describe('Guardrail: never commit secrets or .env (Guardrails > Never)', () => {
  it('no .env file is present (only *.example / *.sample / *.template are allowed)', () => {
    const bad = files.filter((f) => /(^|\/)\.env(\..+)?$/.test(f.replace(/\\/g, '/')) && !/\.(example|sample|template)$/.test(f));
    expect(bad.map((f) => path.relative(REPO_ROOT, f))).toEqual([]);
  });

  it('.gitignore excludes .env files', () => {
    const gi = path.join(REPO_ROOT, '.gitignore');
    expect(fs.existsSync(gi), '.gitignore must exist').toBe(true);
    expect(fs.readFileSync(gi, 'utf8')).toMatch(/^\.env(\*|\.local|\.\*)?\s*$/m);
  });

  it.each(PATTERNS)('no committed secret matching: %s', (_name, re) => {
    const hits: string[] = [];
    for (const f of files) {
      let s: string;
      try {
        if (fs.statSync(f).size > 1_000_000) continue;
        s = fs.readFileSync(f, 'utf8');
      } catch {
        continue;
      }
      if (s.includes('\0')) continue;
      const m = re.exec(s);
      if (m) hits.push(`${path.relative(REPO_ROOT, f)}: ${m[0].slice(0, 12)}...`);
    }
    expect(hits).toEqual([]);
  });
});
