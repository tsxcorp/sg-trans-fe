import { test, expect, type Page } from '@playwright/test';

const header = (p: Page) => p.locator('header').first();
const navLink = (p: Page, re: RegExp) => header(p).getByRole('link', { name: re });
const pagesBtn = (p: Page) => header(p).getByRole('button', { name: /^pages$/i });

async function desktop(page: Page, path = '/en') {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(path);
}

async function mobile(page: Page, width = 768) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/en');
}

test.describe('Navigation (S6)', () => {
  const items: [string, RegExp, string][] = [
    ['HOME', /^home$/i, '/en'],
    ['SERVICES', /^services$/i, '/en/services'],
    ['ABOUT', /^about$/i, '/en/about-us'],
    ['NEWS', /^news$/i, '/en/news'],
    ['CONTACT', /^contact$/i, '/en/contact'],
  ];

  test('S6: the nav bar shows the six entries at 1280', async ({ page }) => {
    await desktop(page);
    for (const [, re] of items) await expect(navLink(page, re)).toBeVisible();
    await expect(pagesBtn(page)).toBeVisible();
  });

  for (const [name, re, href] of items) {
    test(`S6: ${name} links to ${href}`, async ({ page }) => {
      await desktop(page);
      await expect(navLink(page, re)).toHaveAttribute('href', href);
      await navLink(page, re).click();
      await expect(page).toHaveURL(new RegExp(`${href.replace(/\//g, '\\/')}/?$`));
    });
  }

  test('S6: on /en only HOME has aria-current="page"', async ({ page }) => {
    await desktop(page);
    await expect(navLink(page, /^home$/i)).toHaveAttribute('aria-current', 'page');
    for (const [name, re] of items.slice(1)) {
      await expect(navLink(page, re), name).not.toHaveAttribute('aria-current', 'page');
    }
    await expect(header(page).locator('[aria-current="page"]')).toHaveCount(1);
  });
});

test.describe('PAGES menu (S6)', () => {
  const menu: [string, string][] = [
    ['/en/about-us', 'About Us'],
    ['/en/services', 'Our Service'],
    ['/en/news', 'News'],
    ['/en/contact', 'Contact'],
    ['/en/privacy-policy', 'Privacy Policy'],
    ['/en/terms', 'Terms of Use'],
  ];
  // How many links to the same href the bar itself already has (HOME/SERVICES/ABOUT/NEWS/CONTACT).
  const inBar: Record<string, number> = { '/en/about-us': 1, '/en/services': 1, '/en/news': 1, '/en/contact': 1, '/en/privacy-policy': 0, '/en/terms': 0 };
  const visibleCount = (page: Page, href: string) => header(page).locator(`a[href="${href}"]:visible`).count();

  test('S6: PAGES starts collapsed, click opens (aria-expanded) and click again closes', async ({ page }) => {
    await desktop(page);
    await expect(pagesBtn(page)).toHaveAttribute('aria-expanded', 'false');
    await pagesBtn(page).click();
    await expect(pagesBtn(page)).toHaveAttribute('aria-expanded', 'true');
    await pagesBtn(page).click();
    await expect(pagesBtn(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('S6: the open menu has the 6 inner pages with the right hrefs', async ({ page }) => {
    await desktop(page);
    const before: Record<string, number> = {};
    for (const [href] of menu) before[href] = await visibleCount(page, href);
    for (const [href] of menu) expect(before[href], `${href} hidden while closed`).toBe(inBar[href]);
    await pagesBtn(page).click();
    for (const [href, label] of menu) {
      await expect.poll(() => visibleCount(page, href), href).toBe(inBar[href] + 1);
      await expect(header(page).getByText(new RegExp(`^${label}$`, 'i')).first(), label).toBeVisible();
    }
  });

  test('S6: Escape closes the PAGES menu', async ({ page }) => {
    await desktop(page);
    await pagesBtn(page).click();
    await expect(pagesBtn(page)).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(pagesBtn(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(header(page).locator('a[href="/en/privacy-policy"]:visible')).toHaveCount(0);
  });

  test('S6: a click outside closes the PAGES menu', async ({ page }) => {
    await desktop(page);
    await pagesBtn(page).click();
    await expect(pagesBtn(page)).toHaveAttribute('aria-expanded', 'true');
    await page.locator('h1').first().click();
    await expect(pagesBtn(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(header(page).locator('a[href="/en/privacy-policy"]:visible')).toHaveCount(0);
  });

  test('S6: Privacy Policy and Terms of Use entries navigate', async ({ page }) => {
    await desktop(page);
    await pagesBtn(page).click();
    await header(page).locator('a[href="/en/terms"]:visible').click();
    await expect(page).toHaveURL(/\/en\/terms\/?$/);
  });
});

test.describe('Mobile menu (S6)', () => {
  const open = (p: Page) => p.getByRole('button', { name: /open menu/i });
  const dialog = (p: Page) => p.getByRole('dialog');
  const insideDialog = (p: Page) =>
    p.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      return !!d && !!document.activeElement && d.contains(document.activeElement);
    });

  test('S6: the hamburger opens a modal menu with the nav links', async ({ page }) => {
    await mobile(page);
    await expect(dialog(page)).toHaveCount(0);
    await open(page).click();
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page).locator('a[href="/en/about-us"]')).toBeVisible();
    await expect(dialog(page).locator('a[href="/en/contact"]')).toBeVisible();
  });

  test('S6: body scroll is locked while open and released after closing', async ({ page }) => {
    await mobile(page);
    await open(page).click();
    await expect(dialog(page)).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  });

  test('S6: focus moves inside the menu on open', async ({ page }) => {
    await mobile(page);
    await open(page).click();
    await expect(dialog(page)).toBeVisible();
    await expect.poll(() => insideDialog(page)).toBe(true);
  });

  test('S6: Tab and Shift+Tab wrap inside the menu (focus never leaves)', async ({ page }) => {
    await mobile(page);
    await open(page).click();
    await expect(dialog(page)).toBeVisible();
    await expect.poll(() => insideDialog(page)).toBe(true);
    const focusables = await dialog(page).locator('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
    expect(focusables).toBeGreaterThan(1);
    for (let i = 0; i < focusables + 3; i++) {
      await page.keyboard.press('Tab');
      expect(await insideDialog(page), `Tab #${i + 1}`).toBe(true);
    }
    for (let i = 0; i < focusables + 3; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await insideDialog(page), `Shift+Tab #${i + 1}`).toBe(true);
    }
  });

  test('S6: Escape closes the menu and returns focus to the hamburger', async ({ page }) => {
    await mobile(page);
    await open(page).click();
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toHaveCount(0);
    await expect(open(page)).toBeFocused();
  });

  test('S6: following a link closes the menu', async ({ page }) => {
    await mobile(page);
    await open(page).click();
    await dialog(page).locator('a[href="/en/contact"]').first().click();
    await expect(page).toHaveURL(/\/en\/contact\/?$/);
    await expect(dialog(page)).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  });
});

test.describe('Logo, Booking, social (S6)', () => {
  test('S6: the logo links to /en', async ({ page }) => {
    await desktop(page);
    const logo = header(page).locator('a[href="/en"]:visible', { has: page.locator('img, svg') }).first();
    await expect(logo).toBeVisible();
    await page.goto('/en#quote');
    await logo.click();
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test('S6: Booking goes to the quote form on Home', async ({ page }) => {
    await desktop(page);
    const booking = navLink(page, /booking/i);
    await expect(booking).toHaveAttribute('href', '/en#quote');
    await booking.click();
    await expect(page).toHaveURL(/\/en#quote$/);
    await expect(page.locator('#quote')).toBeInViewport();
  });

  test('S6: social icons are external links with target=_blank and rel containing noopener', async ({ page }) => {
    await desktop(page);
    const ext = page.locator('header a[href^="http"], footer a[href^="http"]');
    const count = await ext.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const a = ext.nth(i);
      await expect(a, `external link #${i}`).toHaveAttribute('target', '_blank');
      await expect(a, `external link #${i}`).toHaveAttribute('rel', /noopener/);
      expect((await a.getAttribute('aria-label')) || (await a.textContent())?.trim(), `external link #${i} has an accessible name`).toBeTruthy();
    }
  });

  test('S6: a social icon opens in a new tab', async ({ page, context }) => {
    await context.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (r) => r.abort());
    await desktop(page);
    const a = page.locator('header a[href^="http"]:visible, footer a[href^="http"]:visible').first();
    await a.scrollIntoViewIfNeeded();
    const [popup] = await Promise.all([context.waitForEvent('page'), a.click()]);
    expect(popup).not.toBe(page);
    expect(page.url()).toMatch(/\/en\/?$/);
    await popup.close();
  });

  for (const w of [1280, 428]) {
    test(`S6: no a[href="#"] in header or footer at ${w}px (menu open on phones)`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto('/en');
      expect(await page.locator('header a[href="#"], footer a[href="#"]').count()).toBe(0);
      if (w < 1280) {
        await page.getByRole('button', { name: /open menu/i }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        expect(await page.locator('a[href="#"]').count()).toBe(0);
      } else {
        await pagesBtn(page).click();
        expect(await page.locator('header a[href="#"], footer a[href="#"]').count()).toBe(0);
      }
    });
  }
});

test.describe('Language control (S6, phones and tablets only)', () => {
  const langBtn = (p: Page) => header(p).getByRole('button', { name: /english/i });
  const W = 428;

  test('S6: no language control is shown at 1280', async ({ page }) => {
    await desktop(page);
    await expect(header(page).getByRole('button', { name: /english/i })).toHaveCount(0);
    await expect(header(page).getByRole('link', { name: /english/i })).toHaveCount(0);
  });

  test('S6: it shows the current language "English" below 1280', async ({ page }) => {
    await mobile(page, W);
    await expect(langBtn(page)).toBeVisible();
    await expect(langBtn(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('S6: it opens a list with only English, linking to the same path under /en', async ({ page }) => {
    await mobile(page, W);
    await langBtn(page).click();
    await expect(langBtn(page)).toHaveAttribute('aria-expanded', 'true');
    const entries = header(page).getByRole('link', { name: /english/i });
    await expect(entries).toHaveCount(1);
    await expect(entries.first()).toBeVisible();
    await expect(entries.first()).toHaveAttribute('href', /^\/en\/?$/);
    await expect(header(page).getByText(/ti(ê|e)ng vi(ệ|e)t|vietnam/i)).toHaveCount(0);
    await expect(header(page).locator('a[href^="/vi"]')).toHaveCount(0);
  });

  test('S6: Escape closes the language list', async ({ page }) => {
    await mobile(page, W);
    await langBtn(page).click();
    await page.keyboard.press('Escape');
    await expect(langBtn(page)).toHaveAttribute('aria-expanded', 'false');
  });
});
