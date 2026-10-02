import { test, expect, type Page } from '@playwright/test';

const WIDTHS = [320, 360, 375, 428, 600, 768, 900, 1024, 1180, 1280, 1366, 1440, 1536, 1920];

async function at(page: Page, width: number, path = '/en') {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

const header = (p: Page) => p.locator('header').first();

test.describe('Responsive (S5)', () => {
  for (const w of WIDTHS) {
    test(`S5: no horizontal scroll at ${w}px`, async ({ page }) => {
      await at(page, w);
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(sw).toBeLessThanOrEqual(cw);
    });
  }

  test('S5: at 1279 the hamburger is shown and the nav bar is not', async ({ page }) => {
    await at(page, 1279);
    await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible();
    for (const re of [/^home$/i, /^services$/i, /^about$/i, /^news$/i, /^contact$/i]) {
      await expect(header(page).getByRole('link', { name: re })).toHaveCount(0);
    }
    await expect(header(page).getByRole('button', { name: /^pages$/i })).toHaveCount(0);
  });

  test('S5: at 1280 the nav bar is shown and the hamburger is not', async ({ page }) => {
    await at(page, 1280);
    await expect(page.getByRole('button', { name: /open menu/i })).toHaveCount(0);
    for (const re of [/^home$/i, /^services$/i, /^about$/i, /^news$/i, /^contact$/i]) {
      await expect(header(page).getByRole('link', { name: re })).toBeVisible();
    }
    await expect(header(page).getByRole('button', { name: /^pages$/i })).toBeVisible();
  });

  const cta = (p: Page) => p.getByRole('heading', { name: /ready to optimi[sz]e your supply chain/i });
  const viewAll = (p: Page) => p.getByRole('link', { name: /view all services/i });

  test('S5: phones (767) hide the CTA band, the View All Services button and the news intro', async ({ page }) => {
    await at(page, 767);
    await expect(cta(page)).toBeHidden();
    await expect(viewAll(page)).toBeHidden();
    expect(await newsIntroVisible(page)).toBe(0);
  });

  test('S5: from 768 the CTA band, the View All Services button and the news intro are shown', async ({ page }) => {
    await at(page, 768);
    await expect(cta(page)).toBeVisible();
    await expect(viewAll(page)).toBeVisible();
    expect(await newsIntroVisible(page)).toBeGreaterThan(0);
  });

  test('S5: stats form a 2-column grid at 428 and the last card spans both columns', async ({ page }) => {
    await at(page, 428);
    const r = await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h1,h2,h3,[role=heading]')).find((e) => /we good with number/i.test(e.textContent || ''));
      const sec = h?.closest('section') ?? h?.parentElement?.parentElement;
      if (!sec) return null;
      const grids = Array.from(sec.querySelectorAll<HTMLElement>('*')).filter((el) => {
        const cs = getComputedStyle(el);
        return cs.display === 'grid' && el.children.length >= 3;
      });
      const g = grids.find((el) => getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length === 2);
      if (!g) return { found: false as const };
      const kids = Array.from(g.children).map((c) => c.getBoundingClientRect());
      const first = kids[0];
      const second = kids[1];
      const last = kids[kids.length - 1];
      return {
        found: true as const,
        sideBySide: Math.abs(first.top - second.top) < 2 && second.left > first.left + first.width * 0.5,
        lastWide: last.width > first.width * 1.5,
        lastBelow: last.top >= first.bottom - 1,
        fits: g.scrollWidth <= g.clientWidth + 1,
      };
    });
    expect(r, 'stats section not found').not.toBeNull();
    if (!r) return;
    expect(r.found, 'a 2-column grid with 3+ stat cards must exist').toBe(true);
    if (!r.found) return;
    expect(r.sideBySide).toBe(true);
    expect(r.lastWide).toBe(true);
    expect(r.lastBelow).toBe(true);
    expect(r.fits).toBe(true);
  });

  test('S5: the footer link columns are a tab list at 428', async ({ page }) => {
    await at(page, 428);
    const tablist = page.locator('footer').getByRole('tablist');
    await expect(tablist).toBeVisible();
    const tabs = tablist.getByRole('tab');
    expect(await tabs.count()).toBeGreaterThanOrEqual(2);
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('footer').getByRole('tabpanel')).toBeVisible();
  });

  for (const w of [768, 1024, 1920]) {
    test(`S5: the footer link columns are 4 columns, no tab list, at ${w}px`, async ({ page }) => {
      await at(page, w);
      await expect(page.locator('footer').getByRole('tablist')).toHaveCount(0);
      const cols = await page.evaluate(() => {
        const f = document.querySelector('footer')!;
        let els = Array.from(f.querySelectorAll<HTMLElement>('nav'));
        if (els.length < 4) els = Array.from(f.querySelectorAll<HTMLElement>('ul'));
        const rects = els.filter((e) => e.checkVisibility()).map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
        // largest set of link lists that share one row
        let best = 0;
        for (const r of rects) best = Math.max(best, rects.filter((o) => Math.abs(o.top - r.top) < 4).length);
        return best;
      });
      expect(cols).toBe(4);
    });
  }
});

async function newsIntroVisible(page: Page) {
  return page.evaluate(() => {
    const h = Array.from(document.querySelectorAll('h1,h2,h3,[role=heading]')).find((e) => /latest news/i.test(e.textContent || ''));
    const sec = h?.closest('section');
    if (!sec) throw new Error('news section not found');
    return Array.from(sec.querySelectorAll<HTMLElement>('p')).filter((p) => /^\s*Dramatically Enhance/i.test(p.textContent || '') && p.checkVisibility()).length;
  });
}

// ---------------------------------------------------------------- S8

const main = (p: Page) => p.locator('main');
const servicesSection = (p: Page) => p.locator('main section').filter({ has: p.locator('a[href^="/en/services/"]') }).first();
const newsSection = (p: Page) => p.locator('main section').filter({ has: p.locator('a[href^="/en/news/"]') }).first();
const partnersSection = (p: Page) => p.locator('main section').filter({ has: p.getByRole('heading', { name: /partners?/i }) }).first();

async function uniqueHrefs(sec: ReturnType<typeof servicesSection>, prefix: string) {
  const all = await sec.locator(`a[href^="${prefix}"]`).evaluateAll((els) => els.map((e) => e.getAttribute('href') as string));
  return Array.from(new Set(all));
}

test.describe('Home actions (S8)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/en');
  });

  test('S8: each service card links to /en/services/<slug>', async ({ page }) => {
    const hrefs = await uniqueHrefs(servicesSection(page), '/en/services/');
    expect(hrefs.length).toBeGreaterThanOrEqual(3);
    for (const h of hrefs) expect(h).toMatch(/^\/en\/services\/[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  test('S8: each news card and Read More link goes to /en/news/<slug>', async ({ page }) => {
    const hrefs = await uniqueHrefs(newsSection(page), '/en/news/');
    expect(hrefs.length).toBeGreaterThanOrEqual(1);
    for (const h of hrefs) expect(h).toMatch(/^\/en\/news\/[a-z0-9]+(-[a-z0-9]+)*$/);
    const readMore = newsSection(page).getByRole('link', { name: /read more/i });
    expect(await readMore.count()).toBeGreaterThanOrEqual(1);
    for (const h of await readMore.evaluateAll((els) => els.map((e) => e.getAttribute('href') as string))) {
      expect(hrefs).toContain(h);
    }
  });

  test('S8: clicking a service card lands on its /en/services/<slug>', async ({ page }) => {
    const [first] = await uniqueHrefs(servicesSection(page), '/en/services/');
    await servicesSection(page).locator(`a[href="${first}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${first.replace(/\//g, '\\/')}/?$`));
  });

  test('S8: clicking a news card lands on its /en/news/<slug>', async ({ page }) => {
    const [first] = await uniqueHrefs(newsSection(page), '/en/news/');
    await newsSection(page).locator(`a[href="${first}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${first.replace(/\//g, '\\/')}/?$`));
  });

  const buttons: [string, (p: Page) => ReturnType<Page['locator']>, string, RegExp][] = [
    ['Explore The Services', (p) => main(p).getByRole('link', { name: /explore the services/i }).first(), '/en/services', /\/en\/services\/?$/],
    ['Contact Us', (p) => main(p).getByRole('link', { name: /^contact us$/i }).first(), '/en/contact', /\/en\/contact\/?$/],
    ['View All Services', (p) => main(p).getByRole('link', { name: /view all services/i }).first(), '/en/services', /\/en\/services\/?$/],
    ['Contact sales', (p) => main(p).getByRole('link', { name: /contact sales/i }).first(), '/en/contact', /\/en\/contact\/?$/],
    ['Request a free quote', (p) => main(p).getByRole('link', { name: /request a free quote/i }).first(), '/en#quote', /\/en#quote$/],
  ];
  for (const [name, loc, href, url] of buttons) {
    test(`S8: "${name}" links to ${href}`, async ({ page }) => {
      const l = loc(page);
      await expect(l).toHaveAttribute('href', href);
      await l.scrollIntoViewIfNeeded();
      await l.click();
      await expect(page).toHaveURL(url);
    });
  }

  test('S8: "Request a free quote" brings the quote form into view', async ({ page }) => {
    await main(page).getByRole('link', { name: /request a free quote/i }).first().click();
    await expect(page.locator('#quote')).toBeInViewport();
  });
});

// Dots of a carousel section = its buttons; track = its horizontally scrollable element.
async function trackInfo(sec: ReturnType<typeof servicesSection>) {
  const handle = await sec.evaluateHandle((s) => {
    const cands = Array.from(s.querySelectorAll<HTMLElement>('*')).filter((el) => {
      const ox = getComputedStyle(el).overflowX;
      return (ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 2 && el.children.length > 1;
    });
    return cands[0] ?? null;
  });
  return handle.asElement();
}

function carouselTests(name: string, width: number, section: (p: Page) => ReturnType<typeof servicesSection>) {
  test.describe(`${name} carousel at ${width}px (S8)`, () => {
    test.beforeEach(async ({ page }) => {
      await at(page, width);
      await section(page).scrollIntoViewIfNeeded();
    });

    test('S8: one dot per slide, the first dot is current', async ({ page }) => {
      const sec = section(page);
      const track = await trackInfo(sec);
      expect(track, 'a horizontally scrollable track must exist').not.toBeNull();
      const slides = await track!.evaluate((t) => t.children.length);
      const dots = sec.getByRole('button');
      await expect(dots).toHaveCount(slides);
      await expect(sec.locator('button[aria-current="true"]')).toHaveCount(1);
      await expect(dots.first()).toHaveAttribute('aria-current', 'true');
    });

    test('S8: clicking a dot scrolls that slide into view and makes it current', async ({ page }) => {
      const sec = section(page);
      const track = (await trackInfo(sec))!;
      const dots = sec.getByRole('button');
      const target = 2;
      expect(await dots.count()).toBeGreaterThan(target);
      await dots.nth(target).click();
      await expect(dots.nth(target)).toHaveAttribute('aria-current', 'true');
      await expect(sec.locator('button[aria-current="true"]')).toHaveCount(1);
      await expect
        .poll(() =>
          track.evaluate((t, i) => {
            const s = t.children[i].getBoundingClientRect();
            const b = t.getBoundingClientRect();
            const overlap = Math.min(s.right, b.right) - Math.max(s.left, b.left);
            return overlap / s.width;
          }, target),
        )
        .toBeGreaterThan(0.5);
    });

    test('S8: scrolling the track updates the current dot', async ({ page }) => {
      const sec = section(page);
      const track = (await trackInfo(sec))!;
      const dots = sec.getByRole('button');
      const last = (await dots.count()) - 1;
      await track.evaluate((t) => t.scrollTo({ left: t.scrollWidth, behavior: 'instant' as ScrollBehavior }));
      await expect(dots.nth(last)).toHaveAttribute('aria-current', 'true');
      await expect(dots.first()).not.toHaveAttribute('aria-current', 'true');
      await track.evaluate((t) => t.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior }));
      await expect(dots.first()).toHaveAttribute('aria-current', 'true');
    });
  });
}

carouselTests('Services', 428, servicesSection);
carouselTests('Partners', 900, partnersSection);

test('S8: service card links are reachable by keyboard in the phone carousel', async ({ page }) => {
  await at(page, 428);
  const link = servicesSection(page).locator('a[href^="/en/services/"]').first();
  await expect(link).not.toHaveAttribute('tabindex', '-1');
  await link.focus();
  await expect(link).toBeFocused();
});

test.describe('Highlighted cards at >= 1280 (S8)', () => {
  for (const w of [1280, 1920]) {
    test.describe(`${w}px`, () => {
      test.beforeEach(async ({ page }) => {
        await at(page, w);
      });

      const cases: [string, typeof servicesSection, string, number][] = [
        ['service', servicesSection, '/en/services/', 2],
        ['news', newsSection, '/en/news/', 0],
      ];

      for (const [kind, section, prefix, def] of cases) {
        test(`S8: exactly one ${kind} card is highlighted by default (index ${def})`, async ({ page }) => {
          const sec = section(page);
          await expect(sec.locator('[data-active="true"]')).toHaveCount(1);
          const hrefs = await uniqueHrefs(sec, prefix);
          const info = await sec.evaluate((s, { prefix, href }) => {
            const a = s.querySelector('[data-active="true"]')!;
            const link = a.matches(`a[href="${href}"]`) ? a : a.querySelector(`a[href="${href}"]`) ?? a.closest(`a[href="${href}"]`);
            return { hasTarget: !!link, others: Array.from(a.querySelectorAll(`a[href^="${prefix}"]`)).filter((l) => l.getAttribute('href') !== href).length };
          }, { prefix, href: hrefs[def] });
          expect(info.hasTarget, `highlight must be on the card for ${hrefs[def]}`).toBe(true);
          expect(info.others).toBe(0);
        });

        test(`S8: hovering another ${kind} card moves the highlight to it`, async ({ page }) => {
          const sec = section(page);
          const cards = sec.locator('[data-active]');
          expect(await cards.count()).toBeGreaterThanOrEqual(2);
          const idx = def === 0 ? 1 : 0;
          await cards.nth(idx).scrollIntoViewIfNeeded();
          await cards.nth(idx).hover();
          await expect(cards.nth(idx)).toHaveAttribute('data-active', 'true');
          await expect(cards.nth(def)).not.toHaveAttribute('data-active', 'true');
          await expect(sec.locator('[data-active="true"]')).toHaveCount(1);
        });

        test(`S8: focusing another ${kind} card moves the highlight to it`, async ({ page }) => {
          const sec = section(page);
          const hrefs = await uniqueHrefs(sec, prefix);
          const idx = def === 0 ? 1 : 0;
          await sec.locator(`a[href="${hrefs[idx]}"]`).first().focus();
          const cards = sec.locator('[data-active]');
          await expect(sec.locator('[data-active="true"]')).toHaveCount(1);
          await expect(sec.locator('[data-active="true"]').locator(`a[href="${hrefs[idx]}"]`).or(sec.locator(`a[href="${hrefs[idx]}"][data-active="true"]`))).toHaveCount(1);
          await expect(cards.nth(def)).not.toHaveAttribute('data-active', 'true');
        });
      }
    });
  }
});
