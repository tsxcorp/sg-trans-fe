import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const ROOT = process.cwd();
const DESIGN = path.join(ROOT, 'design/exports/home');
const DIFF_DIR = path.join(ROOT, 'tests/visual/__diff__');
const MAX_DIFF_RATIO = 0.03; // DoD M1 (proposed threshold)
const PIXEL_THRESHOLD = 0.1;

async function compareHome(page: Page, width: number, height: number, designFile: string, tag: string) {
  const expectedPath = path.join(DESIGN, designFile);
  expect(fs.existsSync(expectedPath), `missing design export ${expectedPath}`).toBe(true);

  await page.setViewportSize({ width, height });
  await page.goto('/en');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  // Lazy images below the fold only load when scrolled into view: scroll down in steps, wait for
  // every image (load or error, bounded per image), then return to the top.
  await page.evaluate(async () => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await sleep(120);
    }
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete
          ? null
          : new Promise<void>((resolve) => {
              const done = () => resolve();
              img.addEventListener('load', done, { once: true });
              img.addEventListener('error', done, { once: true });
              setTimeout(done, 5000);
            }),
      ),
    );
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);

  const actual = PNG.sync.read(await page.screenshot({ fullPage: true, animations: 'disabled' }));
  const expected = PNG.sync.read(fs.readFileSync(expectedPath));

  fs.mkdirSync(DIFF_DIR, { recursive: true });
  fs.writeFileSync(path.join(DIFF_DIR, `${tag}-actual.png`), PNG.sync.write(actual));

  // A different canvas size is itself a fidelity failure; still write a diff on the common area.
  const w = Math.min(actual.width, expected.width);
  const h = Math.min(actual.height, expected.height);
  const crop = (img: PNG) => {
    const out = new PNG({ width: w, height: h });
    PNG.bitblt(img, out, 0, 0, w, h, 0, 0);
    return out;
  };
  const a = crop(actual);
  const e = crop(expected);
  const diff = new PNG({ width: w, height: h });
  const mismatched = pixelmatch(a.data, e.data, diff.data, w, h, { threshold: PIXEL_THRESHOLD });
  fs.writeFileSync(path.join(DIFF_DIR, `${tag}-diff.png`), PNG.sync.write(diff));

  // Size mismatch counts the non-overlapping area as differing.
  const totalPixels = Math.max(actual.width, expected.width) * Math.max(actual.height, expected.height);
  const extra = totalPixels - w * h;
  const ratio = (mismatched + extra) / totalPixels;

  console.log(`[visual] ${tag}: ${(ratio * 100).toFixed(3)}% pixels differ (${mismatched + extra} of ${totalPixels})`);
  expect(
    ratio,
    `${(ratio * 100).toFixed(2)}% pixels differ (actual ${actual.width}x${actual.height}, design ${expected.width}x${expected.height}); see tests/visual/__diff__/${tag}-diff.png`,
  ).toBeLessThanOrEqual(MAX_DIFF_RATIO);
}

test.describe('Home visual fidelity (S1, DoD2)', () => {
  test('S1/DoD2: /en at 1920px differs from desktop-1920@1x.png by <= 3% of pixels', async ({ page }) => {
    test.setTimeout(60_000);
    await compareHome(page, 1920, 1080, 'desktop-1920@1x.png', 'home-desktop-1920');
  });

  // The export design/exports/home/mobile-428@1x.png does not exist yet. Remove fixme once it is added.
  test.fixme('S1/DoD3: /en at 428px differs from mobile-428@1x.png by <= 3% of pixels', async ({ page }) => {
    await compareHome(page, 428, 926, 'mobile-428@1x.png', 'home-mobile-428');
  });
});
