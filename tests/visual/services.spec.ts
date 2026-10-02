import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const ROOT = process.cwd();
const DIFF_DIR = path.join(ROOT, 'tests/visual/__diff__');
const MAX_DIFF_RATIO = 0.03; // SV-2 / SD-29 / SD-29: <= 3% at 1920
const PIXEL_THRESHOLD = 0.1;

/** Crops `img` to x0..x0+w (full height). */
function cropX(img: PNG, x0: number, w: number): PNG {
  const out = new PNG({ width: w, height: img.height });
  PNG.bitblt(img, out, x0, 0, w, img.height, 0, 0);
  return out;
}

async function compare(page: Page, url: string, designPath: string, tag: string, cropFrom: number | null) {
  const expectedPath = path.join(ROOT, designPath);
  expect(fs.existsSync(expectedPath), `missing design export ${expectedPath}`).toBe(true);

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(url);
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
  let expected: PNG = PNG.sync.read(fs.readFileSync(expectedPath));
  // The our-service export is 1928 wide with a 4 px black stripe on each side: crop x 4..1923.
  if (cropFrom !== null) expected = cropX(expected, cropFrom, 1920);

  fs.mkdirSync(DIFF_DIR, { recursive: true });
  fs.writeFileSync(path.join(DIFF_DIR, `${tag}-actual.png`), PNG.sync.write(actual));

  // A different canvas size is itself a fidelity failure: the non-overlapping area counts as differing.
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

  const totalPixels = Math.max(actual.width, expected.width) * Math.max(actual.height, expected.height);
  const extra = totalPixels - w * h;
  const ratio = (mismatched + extra) / totalPixels;

  console.log(`[visual] ${tag}: ${(ratio * 100).toFixed(3)}% pixels differ (${mismatched + extra} of ${totalPixels})`);
  expect(
    ratio,
    `${(ratio * 100).toFixed(2)}% pixels differ (actual ${actual.width}x${actual.height}, design ${expected.width}x${expected.height}); see tests/visual/__diff__/${tag}-diff.png`,
  ).toBeLessThanOrEqual(MAX_DIFF_RATIO);
}

test.describe('Services visual fidelity at 1920', () => {
  test('SV-2: /en/services differs from our-service/desktop-1920@1x.png (cropped x 4..1923) by <= 3% of pixels', async ({ page }) => {
    test.setTimeout(90_000);
    await compare(page, '/en/services', 'design/exports/our-service/desktop-1920@1x.png', 'services-desktop-1920', 4);
  });

  test('SD-29: /en/services/logistic-service differs from service-detail/desktop-1920@1x.png by <= 3% of pixels', async ({ page }) => {
    test.setTimeout(90_000);
    await compare(page, '/en/services/logistic-service', 'design/exports/service-detail/desktop-1920@1x.png', 'service-detail-desktop-1920', null);
  });
});
