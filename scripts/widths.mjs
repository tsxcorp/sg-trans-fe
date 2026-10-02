// Checks horizontal overflow of a route at many widths. Usage: node scripts/widths.mjs [route] [widths comma list]
import { chromium } from '@playwright/test';
const route = process.argv[2] ?? '/en';
const widths = (process.argv[3] ?? '320,360,375,428,600,768,900,1024,1180,1280,1366,1440,1536,1920').split(',').map(Number);
const base = process.env.BASE ?? 'http://localhost:3000';
const b = await chromium.launch();
let bad = 0;
for (const w of widths) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(base + route, { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const off = [...document.querySelectorAll('body *')].filter((e) => { const s = getComputedStyle(e); if (s.position === 'fixed') return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.right > vw + 1 && !e.closest('[aria-roledescription="carousel"] ul'); }).slice(0, 4).map((e) => `${e.tagName.toLowerCase()}.${(e.className?.toString?.() ?? '').slice(0, 40)} right=${Math.round(e.getBoundingClientRect().right)}`);
    return { sw: document.documentElement.scrollWidth, vw, off };
  });
  const ok = r.sw <= r.vw;
  if (!ok) bad++;
  console.log(`${String(w).padStart(5)}  scrollWidth ${r.sw}  ${ok ? 'ok' : 'OVERFLOW'}  ${r.off.join(' | ')}`);
  await p.close();
}
await b.close();
process.exit(bad ? 1 : 0);
