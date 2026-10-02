// Full-page screenshot. Usage: PAGE=home DEVICE=desktop-1920 node scripts/shot.mjs [route]
//   route defaults to the page's route (home -> /en, others -> /en/<page>); width comes from DEVICE (…-<width>).
// Output: design/reference/_work/render-<PAGE>-<DEVICE>.png
import { chromium } from '@playwright/test';

const page_ = process.env.PAGE ?? 'home';
const device = process.env.DEVICE ?? 'desktop-1920';
const width = Number(device.split('-').pop());
const route = process.argv[2] ?? (page_ === 'home' ? '/en' : `/en/${page_}`);
const base = process.env.BASE ?? 'http://localhost:3000';
const out = `design/reference/_work/render-${page_}-${device}.png`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: width < 700 ? 900 : 1080 } });
await page.goto(base + route, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
// trigger lazy images below the fold, then come back to the top
await page.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  window.scrollTo(0, 0);
  await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 5000); }))));
});
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: true });
const h = await page.evaluate(() => document.documentElement.scrollHeight);
const sw = await page.evaluate(() => document.documentElement.scrollWidth);
console.log(`${out}  height ${h}  scrollWidth ${sw} (viewport ${width})`);
await browser.close();
