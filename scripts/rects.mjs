// Usage: node scripts/rects.mjs "<css selector>" [url]  -> prints bounding rects (page coords)
import { chromium } from '@playwright/test';
const sel = process.argv[2] ?? 'section, footer, header';
const url = process.argv[3] ?? 'http://localhost:3000/en';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(url, { waitUntil: 'networkidle' });
const rows = await p.evaluate((s) => [...document.querySelectorAll(s)].map((e) => {
  const r = e.getBoundingClientRect();
  const name = e.id || e.getAttribute('aria-label') || (e.textContent || '').trim().slice(0, 28).replace(/\s+/g, ' ');
  return `${e.tagName.toLowerCase().padEnd(8)} x${Math.round(r.x + scrollX)} y${Math.round(r.y + scrollY)} w${Math.round(r.width)} h${Math.round(r.height)}  ${name}`;
}), sel);
console.log(rows.join('\n'));
await b.close();
