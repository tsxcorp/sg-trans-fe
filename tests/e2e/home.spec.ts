import { test, expect, type Page } from '@playwright/test';

test.describe('Home /en (S1, S2, DoD)', () => {
  test('DoD1: / redirects to /en', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test('S2: <html lang="en"> is set', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('S1: sections appear in the specified order at 1920px', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Each section is the first match that sits below the previous one (headings only, so footer
    // nav titles and links cannot match).
    type Def = { name: string; sel: string; re?: string; flags?: string };
    const H = 'h1,h2,h3,[role=heading]';
    const sections: Def[] = [
      { name: 'header', sel: 'header' },
      { name: 'hero', sel: 'h1' },
      { name: 'request a quote', sel: H, re: 'request a quote', flags: 'i' },
      { name: 'we good with number', sel: H, re: 'we good with number', flags: 'i' },
      { name: 'services', sel: H, re: 'services?', flags: 'i' },
      { name: 'partners and clients', sel: H, re: 'partners?\\s*(and|&)\\s*clients?', flags: 'i' },
      { name: 'latest news', sel: H, re: 'latest news', flags: 'i' },
      { name: 'cta', sel: H, re: 'ready to optimi[sz]e your supply chain', flags: 'i' },
      { name: 'footer', sel: 'footer' },
    ];
    const tops = await page.evaluate((defs) => {
      const out: { name: string; top: number | null }[] = [];
      let prev = -Infinity;
      for (const d of defs) {
        const rx = d.re ? new RegExp(d.re, d.flags) : null;
        const cands = Array.from(document.querySelectorAll<HTMLElement>(d.sel))
          .filter((el) => !rx || rx.test(el.textContent || ''))
          .map((el) => el.getBoundingClientRect().top + window.scrollY)
          .filter((t) => t > prev || d.name === 'header')
          .sort((x, y) => x - y);
        const top = cands.length ? cands[0] : null;
        out.push({ name: d.name, top });
        if (top !== null) prev = top;
      }
      return out;
    }, sections);

    for (const t of tops) expect(t.top, `section "${t.name}" not found in order`).not.toBeNull();
    const ys = tops.map((t) => t.top as number);
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i], `"${tops[i].name}" must be below "${tops[i - 1].name}"`).toBeGreaterThan(ys[i - 1]);
    }
  });

  test('S1: no horizontal scroll at 428px', async ({ page }) => {
    await page.setViewportSize({ width: 428, height: 926 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    const { sw, cw } = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(sw).toBeLessThanOrEqual(cw);
  });

  test('DoD6: keyboard-only reaches every interactive element, each with a visible focus indicator', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const total = await markInteractive(page);
    expect(total).toBeGreaterThan(0);

    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    const seen = new Map<string, boolean>();
    for (let i = 0; i < total + 10; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
        const shadow = cs.boxShadow !== 'none' && cs.boxShadow !== '';
        return { id: el.dataset.kbId ?? null, visible: outline || shadow };
      });
      if (info?.id) seen.set(info.id, (seen.get(info.id) ?? true) && info.visible);
    }
    const missed: string[] = [];
    const noRing: string[] = [];
    for (let i = 0; i < total; i++) {
      if (!seen.has(String(i))) missed.push(String(i));
      else if (!seen.get(String(i))) noRing.push(String(i));
    }
    const names = async (ids: string[]) =>
      page.evaluate((x) => x.map((id) => document.querySelector(`[data-kb-id="${id}"]`)?.outerHTML.slice(0, 80)), ids);
    expect(await names(missed), 'not reachable by Tab').toEqual([]);
    expect(await names(noRing), 'focused without outline or box-shadow').toEqual([]);
  });
});

/** Tags visible, non-honeypot interactive elements with data-kb-id; returns the count. */
async function markInteractive(page: Page): Promise<number> {
  return page.evaluate(() => {
    const sel = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"]';
    let n = 0;
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      if ((el as HTMLInputElement).name === 'website') continue; // honeypot
      if ((el as HTMLInputElement).disabled || (el as HTMLInputElement).type === 'hidden') continue;
      if (el.getAttribute('tabindex') === '-1') continue;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (r.width <= 1 || r.height <= 1 || cs.visibility === 'hidden' || cs.display === 'none') continue;
      el.dataset.kbId = String(n++);
    }
    return n;
  });
}
