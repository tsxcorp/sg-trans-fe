import { test, expect, type Page } from '@playwright/test';
import {
  S5_WIDTHS, SLUGS, uniqueIp, noHScroll, open, box, markCards, markSection, markScroller,
  markAround, textOf, sectionTops, expectInOrder, markInteractive, tabThrough, loadLazy, emptyHeadings,
  squash, norm,
} from '../helpers/services';

const LOGISTICS = '/en/services/logistic-service';
const HEADINGS = [
  'Logistics Experts for Highly Technical Industries',
  'IMPORT FLOW',
  'Consultancy & Compliance',
  'Key Logistics Features',
  'Why Choose Saigontrans?',
];
const HIGHLIGHTS = ['Ground Pickup', 'Sea/Air Transit', 'Customs Clearance', 'Final Delivery'];
const PROCESS = ['Port / Airport Arrival', 'Customs Clearance', 'Inland Transport', 'Delivery to Warehouse'];
const EXPERTISE_STATS: [string, string][] = [['38', 'TRUCKS'], ['31', 'TRAILERS'], ['45', 'DRIVERS'], ['24/7', 'CCTV MONITORING']];
const EXPERTISE_CARDS = ['Trade Compliance', 'Regulatory Consulting', 'Risk Management'];
const FEATURES: [string, string][] = [
  ['Real-time Tracking', 'Complete visibility into your shipment status with our proprietary GPS tracking dashboard.'],
  ['Risk Management', 'Comprehensive cargo insurance and proactive contingency planning for every shipment.'],
  ['Global Compliance', 'Expertise in international trade laws ensuring all documentation meets regulatory standards.'],
];
const WHY = ['Cost Optimization', 'Quality Control', 'Scalable Logistics', 'Account Management'];
const RELATED = ['Ocean Freight', 'Air Cargo', 'Customs Brokerage', 'Warehousing'];
const SUBTITLE =
  'CONNECTING YOUR SUPPLY CHAIN WITH SAFETY, ON-TIME DELIVERY, AND TRUST (SOT). YOUR EXPERT PARTNER FOR TIGHTLY CONTROLLED INDUSTRIES AND DANGEROUS CHEMICALS.';
const SLIDE = /^slide \d+$/i;

const sec = (page: Page, tag: string, heading: string) => markSection(page, tag, heading, HEADINGS);
const related = (page: Page) => markAround(page, 'Related Services', 'rel', { sel: 'a[href^="/en/services/"]' });
const needHelp = (page: Page) => markAround(page, 'Need Help?', 'help', { sel: 'a[href]' });
const highlightsBox = (page: Page) => markAround(page, 'KEY HIGHLIGHTS', 'hl', { texts: HIGHLIGHTS });

test.beforeEach(async ({ context }) => {
  await context.setExtraHTTPHeaders({ 'x-forwarded-for': uniqueIp() });
});

// ------------------------------------------------------------------ the template, every slug
test.describe('Service detail template for each service (decision 8)', () => {
  for (const slug of SLUGS) {
    const url = `/en/services/${slug}`;

    test(`SD-1/SD-4: ${slug} answers 200 with lang="en", one h1 and a matching <title>`, async ({ page }) => {
      const res = await open(page, url);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('h1')).toHaveCount(1);
      const h1 = norm(await textOf(page.locator('h1')));
      expect(h1.length).toBeGreaterThan(0);
      await expect(page).toHaveTitle(`${h1} | Saigon Trans`);
      if (slug === 'logistic-service') expect(h1).toBe('Logistics Solution');
      else expect(h1.toLowerCase()).not.toBe('logistics solution');
    });

    test(`SD-5: ${slug} renders the template sections, CTA and footer; Partners & Clients is absent`, async ({ page }) => {
      await open(page, url);
      const hs = await page.locator('main h2').count();
      expect(hs, 'intro, process, expertise, features and why headings').toBeGreaterThanOrEqual(5);
      await expect(page.getByText('Our Services', { exact: true }).first()).toBeVisible();
      await expect(page.locator('[data-active]').first()).toBeAttached(); // process cards
      expect(await page.locator('[data-active="true"]').count()).toBe(1);
      await expect(page.locator('h2,h3').filter({ hasText: /READY TO OPTIMI[SZ]E YOUR SUPPLY CHAIN/i }).first()).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      await expect(page.locator('h1,h2,h3').filter({ hasText: /partners\s*(&|and)\s*clients/i })).toHaveCount(0);
    });

    test(`SD-8/SD-10: ${slug} Related Services lists 1..4 other services, never itself, all resolving`, async ({ page }) => {
      await open(page, url);
      const card = await related(page);
      await expect(card).toHaveCount(1);
      const links = card.locator('a[href^="/en/services/"]');
      const n = await links.count();
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(4);
      for (let i = 0; i < n; i++) {
        const href = (await links.nth(i).getAttribute('href')) as string;
        expect(href).toMatch(/^\/en\/services\/[a-z0-9-]+$/);
        expect(href, 'current service is excluded').not.toBe(url);
        expect((await page.request.get(href)).status(), href).toBe(200);
      }
    });

    test(`SD-17: ${slug} has no empty headings`, async ({ page }) => {
      await open(page, url);
      expect(await emptyHeadings(page)).toEqual([]);
    });

    test(`SD-28: ${slug} marks SERVICES as the current nav item`, async ({ page }) => {
      await open(page, url);
      const h = page.locator('header');
      await expect(h.getByRole('link', { name: /^services$/i }).first()).toHaveAttribute('aria-current', 'page');
      for (const re of [/^home$/i, /^about/i, /^news$/i, /^contact$/i]) {
        await expect(h.getByRole('link', { name: re }).first()).not.toHaveAttribute('aria-current', 'page');
      }
    });

    test(`SD-21: ${slug} has no horizontal scroll at 1280, 1024, 768, 428, 320`, async ({ page }) => {
      const bad: string[] = [];
      for (const w of [1280, 1024, 768, 428, 320]) {
        await open(page, url, w, 900);
        const { sw, iw } = await noHScroll(page);
        if (sw > iw) bad.push(`${w}: ${sw} > ${iw}`);
      }
      expect(bad).toEqual([]);
    });
  }

  test('SD-4: the four services have distinct hero titles', async ({ page }) => {
    const titles: string[] = [];
    for (const slug of SLUGS) {
      await page.goto(`/en/services/${slug}`);
      titles.push(norm(await textOf(page.locator('h1'))).toLowerCase());
    }
    expect(new Set(titles).size).toBe(SLUGS.length);
  });
});

// ------------------------------------------------------------------ errors
test.describe('Service detail errors', () => {
  test('SD-2: an unknown slug answers 404 with the site 404 page', async ({ page }) => {
    const res = await page.goto('/en/services/does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText(/404|not found|can.?t be found|could not be found/i).first()).toBeVisible();
    await expect(page.getByText('Logistics Solution')).toHaveCount(0);
  });
});

// ------------------------------------------------------------------ logistic-service content
test.describe('Service detail logistic-service (design example)', () => {
  test('SD-1: title is "Logistics Solution | Saigon Trans"', async ({ page }) => {
    await page.goto(LOGISTICS);
    await expect(page).toHaveTitle('Logistics Solution | Saigon Trans');
  });

  test('SD-4: one h1 "Logistics Solution" and the verbatim hero subtitle', async ({ page }) => {
    await open(page, LOGISTICS);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(norm(await textOf(page.locator('h1')))).toBe('Logistics Solution');
    const sub = page.getByText(/connecting your supply chain with safety/i);
    await expect(sub).toHaveCount(1);
    expect(norm(await textOf(sub)).toUpperCase()).toBe(SUBTITLE);
  });

  test('SD-5: section order at 1920 and Partners & Clients is absent', async ({ page }) => {
    await open(page, LOGISTICS);
    const tops = await sectionTops(page, [
      { name: 'header', sel: 'header' },
      { name: 'hero', sel: 'h1' },
      { name: 'intro eyebrow', sel: 'body *', re: '^\\s*Our Services\\s*$', flags: '' },
      { name: 'intro', sel: 'h2', re: 'Logistics Experts for Highly Technical Industries\\.', flags: 'i' },
      { name: 'process', sel: 'h2', re: '^\\s*IMPORT FLOW\\s*$', flags: 'i' },
      { name: 'expertise', sel: 'h2', re: 'Consultancy\\s*&\\s*Compliance', flags: 'i' },
      { name: 'features', sel: 'h2', re: 'Key Logistics Features', flags: 'i' },
      { name: 'why', sel: 'h2', re: 'Why Choose Saigontrans\\?', flags: 'i' },
      { name: 'cta', sel: 'h2,h3', re: 'READY TO OPTIMI[SZ]E YOUR SUPPLY CHAIN', flags: 'i' },
      { name: 'footer', sel: 'footer' },
    ]);
    expectInOrder(tops);
    await expect(page.locator('h1,h2,h3').filter({ hasText: /partners\s*(&|and)\s*clients/i })).toHaveCount(0);
  });

  test('SD-6: the bold phrase of the intro is inside a strong element', async ({ page }) => {
    await open(page, LOGISTICS);
    const s = page.locator('strong').filter({ hasText: 'Customs Clearance, Transport Solutions, E-commerce, and Drop Shipping.' });
    await expect(s.first()).toBeVisible();
    expect(norm(await textOf(s))).toBe('Customs Clearance, Transport Solutions, E-commerce, and Drop Shipping.');
    await expect(page.getByText(/^\s*Saigontrans has authored and provided highly technical export\/import solutions/)).toBeVisible();
  });

  test('SD-7: Key Highlights has 4 labelled items in order and an illustration with alt text', async ({ page }) => {
    await open(page, LOGISTICS);
    await loadLazy(page);
    const hl = await highlightsBox(page);
    await expect(hl).toHaveCount(1);
    const cards = await markCards(page, '[data-tarea="hl"]', HIGHLIGHTS, 'hlitem');
    const xs: number[] = [];
    for (const [i, l] of HIGHLIGHTS.entries()) {
      await expect(cards[i], l).toHaveCount(1);
      xs.push((await box(cards[i])).x);
    }
    for (let i = 1; i < xs.length; i++) expect(xs[i]).toBeGreaterThan(xs[i - 1]);
    const img = hl.locator('img').last();
    await expect(img).toBeVisible();
    const { alt, role, hidden } = await img.evaluate((el) => ({
      alt: el.getAttribute('alt'),
      role: el.getAttribute('role'),
      hidden: el.getAttribute('aria-hidden'),
    }));
    expect(alt, 'alt attribute present').not.toBeNull();
    if ((alt ?? '').trim() === '') expect(role === 'presentation' || hidden === 'true').toBe(true);
  });

  test('SD-8: Related Services is the data-driven list, in order, each an /en/services/<slug> link', async ({ page }) => {
    await open(page, LOGISTICS);
    const card = await related(page);
    const links = card.locator('a[href]');
    await expect(links).toHaveCount(RELATED.length);
    for (const [i, name] of RELATED.entries()) {
      expect(norm(await textOf(links.nth(i)))).toBe(name);
      expect(await links.nth(i).getAttribute('href')).toMatch(/^\/en\/services\/[a-z0-9-]+$/);
    }
  });

  test('SD-9: clicking a Related Services link opens that service (H1 changes, not a 404)', async ({ page }) => {
    await open(page, LOGISTICS);
    const card = await related(page);
    const first = card.locator('a[href]').first();
    const href = (await first.getAttribute('href')) as string;
    await first.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    expect((await page.request.get(href)).status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(norm(await textOf(page.locator('h1')))).not.toBe('Logistics Solution');
  });

  test('SD-11: Need Help? shows its text and a phone link to tel: or /en/contact', async ({ page }) => {
    await open(page, LOGISTICS);
    const card = await needHelp(page);
    await expect(card).toHaveCount(1);
    await expect(card.getByText('Our logistics experts are ready to assist with your custom requirements.')).toBeVisible();
    const link = card.getByRole('link', { name: /\+1 \(800\) SAIGON-1/ });
    await expect(link).toBeVisible();
    expect(await link.getAttribute('href')).toMatch(/^(tel:.+|\/en\/contact)$/);
  });

  test('SD-12: process shows 4 cards 01..04 with the labels; card 02 is active', async ({ page }) => {
    await open(page, LOGISTICS);
    const proc = await sec(page, 'proc', 'IMPORT FLOW');
    await expect(proc.getByText(/execution strategy/i)).toBeVisible();
    await expect(proc.getByText(/A clear and efficient 4-step process/)).toBeVisible();
    const cards = proc.locator('[data-active]');
    await expect(cards).toHaveCount(4);
    for (const [i, label] of PROCESS.entries()) {
      const t = squash(await textOf(cards.nth(i)));
      expect(t, `card ${i + 1} number`).toContain(`0${i + 1}`);
      expect(t, `card ${i + 1} label`).toContain(squash(label));
      const active = await cards.nth(i).getAttribute('data-active');
      expect(active === 'true', `card ${i + 1} active state`).toBe(i === 1);
    }
  });

  test('SD-13: hover or focus (and Enter/Space) on a process card makes only that card active', async ({ page }) => {
    await open(page, LOGISTICS);
    const proc = await sec(page, 'proc', 'IMPORT FLOW');
    const cards = proc.locator('[data-active]');
    const only = async (idx: number) => {
      for (let i = 0; i < 4; i++) {
        if (i === idx) await expect(cards.nth(i), `card ${i + 1} active`).toHaveAttribute('data-active', 'true');
        else await expect(cards.nth(i), `card ${i + 1} inactive`).not.toHaveAttribute('data-active', 'true');
      }
    };
    await cards.nth(2).scrollIntoViewIfNeeded();
    await cards.nth(2).hover();
    await only(2);
    await cards.nth(0).focus();
    await only(0);
    await cards.nth(3).focus();
    await page.keyboard.press('Enter');
    await only(3);
    await cards.nth(1).focus();
    await page.keyboard.press('Space');
    await only(1);
    await page.mouse.move(2, 2); // leaving keeps the last active card
    await only(1);
  });

  test('SD-14: expertise band shows the 4 stats with labels and the 3 cards', async ({ page }) => {
    await open(page, LOGISTICS);
    const exp = await sec(page, 'exp', 'Consultancy & Compliance');
    await expect(exp.getByText('Expert guidance to ensure compliance, reduce risk and support your growth.')).toBeVisible();
    for (const [v, l] of EXPERTISE_STATS) {
      await expect(exp.getByText(v, { exact: true }).first(), v).toBeVisible();
      await expect(exp.getByText(new RegExp(`^${l}$`, 'i')).first(), l).toBeVisible();
    }
    for (const t of EXPERTISE_CARDS) await expect(exp.getByText(t, { exact: true }).first(), t).toBeVisible();
  });

  test('SD-15: features shows 3 cards with titles and descriptions', async ({ page }) => {
    await open(page, LOGISTICS);
    const feat = await sec(page, 'feat', 'Key Logistics Features');
    await expect(feat.getByText(/^our capabilities$/i)).toBeVisible();
    const cards = await markCards(page, '[data-tsec="feat"]', FEATURES.map(([t]) => t), 'feat');
    for (const [i, [title, desc]] of FEATURES.entries()) {
      await expect(cards[i], title).toHaveCount(1);
      const t = squash(await textOf(cards[i]));
      expect(t).toContain(squash(desc));
      expect(t.length).toBeGreaterThan(squash(title).length + 20);
    }
    const bs = [];
    for (const c of cards) bs.push(await box(c));
    expect(new Set(bs.map((b) => Math.round(b.x))).size).toBe(3);
  });

  test('SD-16: why section shows 4 benefit items and 4 loaded photos', async ({ page }) => {
    await open(page, LOGISTICS);
    await loadLazy(page);
    const why = await sec(page, 'why', 'Why Choose Saigontrans?');
    await expect(why.getByText(/^the sts edge$/i)).toBeVisible();
    for (const t of WHY) await expect(why.getByText(t, { exact: true }).first(), t).toBeVisible();
    const imgs = why.locator('img');
    await expect(imgs).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await imgs.nth(i).scrollIntoViewIfNeeded();
      await expect.poll(() => imgs.nth(i).evaluate((el) => (el as HTMLImageElement).naturalWidth), `photo ${i + 1}`).toBeGreaterThan(0);
    }
  });

  test('SD-20: CONTACT SALES goes to /en/contact', async ({ page }) => {
    await open(page, LOGISTICS);
    await page.getByRole('link', { name: /contact sales/i }).first().click();
    await expect(page).toHaveURL(/\/en\/contact$/);
  });

  test('SD-20: REQUEST A FREE QUOTE shows the quote form (same target as Home, /en#quote)', async ({ page }) => {
    await open(page, LOGISTICS);
    const cta = page.getByRole('link', { name: /request a free quote/i }).first();
    expect(await cta.getAttribute('href')).toBe('/en#quote');
    await cta.click();
    await expect(page).toHaveURL(/\/en#quote$/);
    await expect(page.locator('#quote')).toBeVisible();
  });

  // ---------------------------------------------------------------- responsive
  test('SD-21: no horizontal scroll at every S5 width', async ({ page }) => {
    test.setTimeout(180_000);
    const bad: string[] = [];
    for (const w of S5_WIDTHS) {
      await open(page, LOGISTICS, w, 900);
      const { sw, iw } = await noHScroll(page);
      if (sw > iw) bad.push(`${w}: ${sw} > ${iw}`);
    }
    expect(bad).toEqual([]);
  });

  test('SD-22: Key Highlights is 2x2 at 428 and one row of 4 at 768', async ({ page }) => {
    await open(page, LOGISTICS, 428, 926);
    await highlightsBox(page);
    let cards = await markCards(page, '[data-tarea="hl"]', HIGHLIGHTS, 'hlitem');
    let bs = [];
    for (const c of cards) bs.push(await box(c));
    expect(new Set(bs.map((b) => Math.round(b.x / 20))).size, '2 columns').toBe(2);
    expect(new Set(bs.map((b) => Math.round(b.y / 20))).size, '2 rows').toBe(2);

    await open(page, LOGISTICS, 768, 1024);
    await highlightsBox(page);
    cards = await markCards(page, '[data-tarea="hl"]', HIGHLIGHTS, 'hlitem');
    bs = [];
    for (const c of cards) bs.push(await box(c));
    for (const b of bs) expect(Math.abs(b.y - bs[0].y), 'one row').toBeLessThanOrEqual(6);
    expect(new Set(bs.map((b) => Math.round(b.x))).size).toBe(4);
  });

  test('SD-23: at 428 process, expertise and features cards are snap carousels with dots', async ({ page }) => {
    await open(page, LOGISTICS, 428, 926);
    const cases: { tag: string; heading: string; cards: (root: string) => Promise<ReturnType<Page['locator']>[]>; slides: number }[] = [
      { tag: 'proc', heading: 'IMPORT FLOW', slides: 4, cards: async (r) => [0, 1, 2, 3].map((i) => page.locator(`${r} [data-active]`).nth(i)) },
      { tag: 'exp', heading: 'Consultancy & Compliance', slides: 3, cards: (r) => markCards(page, r, EXPERTISE_CARDS, 'expc') },
      { tag: 'feat', heading: 'Key Logistics Features', slides: 3, cards: (r) => markCards(page, r, FEATURES.map(([t]) => t), 'featc') },
    ];
    for (const c of cases) {
      const root = await sec(page, c.tag, c.heading);
      const rootSel = `[data-tsec="${c.tag}"]`;
      const cards = await c.cards(rootSel);
      const sc = await markScroller(cards[0], `sd23-${c.tag}`);
      expect(sc.found, `${c.tag}: scrollable container`).toBe(true);
      expect(sc.overflowX, c.tag).toMatch(/auto|scroll/);
      expect(sc.snap, c.tag).toMatch(/x/);
      const dots = root.getByRole('button', { name: SLIDE });
      await expect(dots, `${c.tag}: dots`).toHaveCount(c.slides);
      await page.locator(`[data-tscroll="sd23-${c.tag}"]`).evaluate((el) => el.scrollTo({ left: el.scrollWidth }));
      await expect(dots.nth(c.slides - 1), `${c.tag}: last dot current`).toHaveAttribute('aria-current', 'true');
    }
    const { sw, iw } = await noHScroll(page);
    expect(sw).toBeLessThanOrEqual(iw);
  });

  test('SD-24: sidebar cards follow the main column in one column at 768 and 428, sit beside it from 1024', async ({ page }) => {
    for (const w of [428, 768]) {
      await open(page, LOGISTICS, w, 1024);
      const hl = await highlightsBox(page);
      const rel = await related(page);
      const help = await needHelp(page);
      const [h, r, n] = [await box(hl), await box(rel), await box(help)];
      expect(r.y, `${w}: Related below main`).toBeGreaterThanOrEqual(h.y + h.height - 2);
      expect(n.y, `${w}: Need Help below Related`).toBeGreaterThanOrEqual(r.y + r.height - 2);
      expect(Math.abs(r.x - n.x), `${w}: same column`).toBeLessThanOrEqual(2);
    }
    for (const w of [1024, 1280, 1920]) {
      await open(page, LOGISTICS, w, 1024);
      const hl = await highlightsBox(page);
      const rel = await related(page);
      const [h, r] = [await box(hl), await box(rel)];
      expect(r.x, `${w}: Related beside main`).toBeGreaterThanOrEqual(h.x + h.width - 2);
      expect(r.y, `${w}: top-aligned with main block`).toBeLessThan(h.y + h.height);
    }
  });

  test('SD-25: intro decorations (dotted map, forklift) are not displayed at 428', async ({ page }) => {
    await open(page, LOGISTICS, 428, 926);
    const intro = await sec(page, 'intro', 'Logistics Experts for Highly Technical Industries');
    await needHelp(page);
    const res = await intro.evaluate((root) => {
      const help = document.querySelector('[data-tarea="help"]');
      const deco = Array.from(root.querySelectorAll('[aria-hidden="true"]')).filter((el) => {
        if (help && help.contains(el)) return false; // headset emblem is not part of SD-25
        return el.tagName === 'IMG' || el.querySelector('img') !== null || getComputedStyle(el).backgroundImage.includes('url(');
      });
      const visible = deco.filter((el) => {
        const r = el.getBoundingClientRect();
        const e = el as HTMLElement & { checkVisibility?: (o: object) => boolean };
        return r.width > 1 && r.height > 1 && (e.checkVisibility ? e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true);
      });
      return { total: deco.length, visible: visible.length };
    });
    expect(res.total, 'decorative images exist in the intro DOM').toBeGreaterThan(0);
    expect(res.visible).toBe(0);
  });

  // ---------------------------------------------------------------- accessibility
  test('SD-26: every link and process card takes a visible focus ring; highlight tiles and feature cards are not focusable', async ({ page }) => {
    test.setTimeout(90_000);
    await open(page, LOGISTICS);
    const proc = await sec(page, 'proc', 'IMPORT FLOW');
    const feat = await sec(page, 'feat', 'Key Logistics Features');
    const hl = await highlightsBox(page);
    const focusable = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';
    await expect(feat.locator(focusable), 'feature cards are static').toHaveCount(0);
    await expect(hl.locator(focusable), 'highlight tiles are static').toHaveCount(0);

    const total = await markInteractive(page);
    expect(total).toBeGreaterThan(10);
    const cardIds = await proc.locator('[data-active]').evaluateAll((els) =>
      els.map((e) => (e.matches('[data-kb-id]') ? e : e.querySelector('[data-kb-id]') ?? e.closest('[data-kb-id]'))?.getAttribute('data-kb-id') ?? null),
    );
    expect(cardIds.every((x) => x !== null), 'process cards are in the tab order').toBe(true);
    const { seen } = await tabThrough(page, total);
    for (const id of cardIds as string[]) expect(seen.has(id), `process card ${id} reached`).toBe(true);
    const missed = Array.from({ length: total }, (_, i) => String(i)).filter((i) => !seen.has(i));
    expect(missed.length, `interactive elements not reached: ${missed.join(',')}`).toBe(0);
    expect([...seen.entries()].filter(([, ring]) => !ring).map(([id]) => id), 'no focus ring').toEqual([]);
  });

  test('SD-27: images carry alt text; decorative ones have empty alt or aria-hidden; Key Highlights and why photos have alt or presentation role', async ({ page }) => {
    await open(page, LOGISTICS);
    const bad = await page.evaluate(() =>
      Array.from(document.images)
        .filter((i) => i.getAttribute('alt') === null && i.getAttribute('aria-hidden') !== 'true')
        .map((i) => i.outerHTML.slice(0, 100)),
    );
    expect(bad, 'images without alt').toEqual([]);
    const why = await sec(page, 'why', 'Why Choose Saigontrans?');
    const hl = await highlightsBox(page);
    for (const imgs of [why.locator('img'), hl.locator('img')]) {
      const n = await imgs.count();
      for (let i = 0; i < n; i++) {
        const { alt, role, hidden } = await imgs.nth(i).evaluate((el) => ({
          alt: el.getAttribute('alt'),
          role: el.getAttribute('role'),
          hidden: el.getAttribute('aria-hidden'),
        }));
        if ((alt ?? '').trim() === '') expect(role === 'presentation' || hidden === 'true', 'empty alt needs role=presentation').toBe(true);
      }
    }
  });

  test('SD-28: SERVICES is aria-current="page" at 1920 and 1280', async ({ page }) => {
    for (const w of [1920, 1280]) {
      await open(page, LOGISTICS, w, 900);
      await expect(page.locator('header').getByRole('link', { name: /^services$/i }).first()).toHaveAttribute('aria-current', 'page');
    }
  });
});
