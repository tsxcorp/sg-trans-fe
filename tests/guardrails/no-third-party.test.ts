import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, walk } from '../helpers/fs';

const LOCAL = String.raw`(?!(?:localhost|127\.0\.0\.1|\[::1\])(?:[:/'"\`)]|$))`;
const EXT = String.raw`https?:\/\/${LOCAL}`;
const RULES: [string, RegExp][] = [
  ['<script|img|iframe|source|video|audio|embed> src to external host', new RegExp(String.raw`<(?:script|img|iframe|source|video|audio|embed|Script|Image)\b[^>]*?\bsrc\s*=\s*[{]?\s*['"\`]${EXT}`, 'i')],
  ['<link href to external host', new RegExp(String.raw`<link\b[^>]*?\bhref\s*=\s*[{]?\s*['"\`]${EXT}`, 'i')],
  ['srcSet to external host', new RegExp(String.raw`\bsrcSet\s*=\s*[{]?\s*['"\`]${EXT}`, 'i')],
  ['CSS url() to external host', new RegExp(String.raw`url\(\s*['"]?${EXT}`, 'i')],
  ['CSS @import to external host', new RegExp(String.raw`@import\s+(?:url\()?\s*['"]?${EXT}`, 'i')],
  ['fetch/axios/XHR/sendBeacon/WebSocket to external host', new RegExp(String.raw`\b(?:fetch|axios(?:\.\w+)?|sendBeacon|XMLHttpRequest\(\)\.open)\s*\(\s*(?:['"\`]\w+['"\`]\s*,\s*)?['"\`]${EXT}|new\s+(?:WebSocket|EventSource)\(\s*['"\`]wss?:\/\/${LOCAL}`, 'i')],
  ['next/font/google or external font import', /from\s+['"]next\/font\/google['"]/],
];

export function findThirdParty(source: string): string[] {
  return RULES.filter(([, re]) => re.test(source)).map(([n]) => n);
}

describe('detector self-check (so the guardrail cannot pass vacuously)', () => {
  it.each([
    ['<script src="https://www.googletagmanager.com/gtag/js"></script>'],
    ['<img src="https://cdn.example.com/a.png" alt="" />'],
    ['<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter" />'],
    ['.a{background:url(https://cdn.example.com/x.png)}'],
    ["@import url('https://fonts.googleapis.com/css');"],
    ["await fetch('https://api.example.com/x')"],
    ["import { Inter } from 'next/font/google';"],
  ])('flags: %s', (src) => {
    expect(findThirdParty(src).length).toBeGreaterThan(0);
  });
  it.each([
    ['<img src="/images/a.png" alt="" />'],
    ['<img src="http://localhost:3000/a.png" alt="" />'],
    ['<a href="https://partner.example.com">Partner</a>'],
    ["import localFont from 'next/font/local';"],
    ['<link rel="icon" href="/favicon.ico" />'],
  ])('does not flag: %s', (src) => {
    expect(findThirdParty(src)).toEqual([]);
  });
});

describe('Guardrail: no third-party loads from components (Guardrails > Never, Decisions: no analytics)', () => {
  const dir = path.join(REPO_ROOT, 'src/components');
  const files = walk(dir, (rel) => /node_modules/.test(rel)).filter((f) => /\.(tsx?|jsx?|css|scss|html|mdx?)$/.test(f));

  it('no file under src/components requests a third-party host', () => {
    const hits: string[] = [];
    for (const f of files) {
      const found = findThirdParty(fs.readFileSync(f, 'utf8'));
      for (const r of found) hits.push(`${path.relative(REPO_ROOT, f)}: ${r}`);
    }
    expect(hits).toEqual([]);
  });
});
