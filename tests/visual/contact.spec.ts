import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const ROOT = process.cwd();
const EXPECTED = path.join(ROOT, 'design/exports/contact/desktop-1920@1x.png');
const DIFF_DIR = path.join(ROOT, 'tests/visual/__diff__');
const MAX_DIFF_RATIO = 0.03; // shared fidelity rule (CT-44)
const PIXEL_THRESHOLD = 0.1;
// The export is 1928 wide: a 4 px black strip on each side; the 1920 frame is x 4..1923.
const FRAME_X = 4;
const FRAME_W = 1920;

test.describe('Contact visual fidelity (CT-44)', () => {
  test('CT-44: /en/contact at 1920px differs from the design export (cropped to x 4..1923) by <= 3% of pixels', async ({ page }) => {
    test.setTimeout(60_000);
    expect(fs.existsSync(EXPECTED), `missing design export ${EXPECTED}`).toBe(true);

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/en/contact');
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
    const full = PNG.sync.read(fs.readFileSync(EXPECTED));
    expect(full.width, 'design export is 1928 wide (4 px strips)').toBeGreaterThanOrEqual(FRAME_X + FRAME_W);

    // Crop the export to the 1920 frame.
    const expected = new PNG({ width: FRAME_W, height: full.height });
    PNG.bitblt(full, expected, FRAME_X, 0, FRAME_W, full.height, 0, 0);

    fs.mkdirSync(DIFF_DIR, { recursive: true });
    fs.writeFileSync(path.join(DIFF_DIR, 'contact-desktop-1920-actual.png'), PNG.sync.write(actual));

    // A different canvas size is itself a fidelity failure; the diff is computed on the common area.
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
    fs.writeFileSync(path.join(DIFF_DIR, 'contact-desktop-1920-diff.png'), PNG.sync.write(diff));

    // Size mismatch counts the non-overlapping area as differing.
    const totalPixels = Math.max(actual.width, expected.width) * Math.max(actual.height, expected.height);
    const extra = totalPixels - w * h;
    const ratio = (mismatched + extra) / totalPixels;

    console.log(`[visual] contact-desktop-1920: ${(ratio * 100).toFixed(3)}% pixels differ (${mismatched + extra} of ${totalPixels})`);
    expect(
      ratio,
      `${(ratio * 100).toFixed(2)}% pixels differ (actual ${actual.width}x${actual.height}, design frame ${expected.width}x${expected.height}); see tests/visual/__diff__/contact-desktop-1920-diff.png`,
    ).toBeLessThanOrEqual(MAX_DIFF_RATIO);
  });
});
