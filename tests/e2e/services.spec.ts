import { test, expect, type Page } from '@playwright/test';
import {
  S5_WIDTHS, GROUPS, TILES, FREIGHT_CARDS, STEPS, WAREHOUSE_CELLS, ECOM_CARDS, LIFECYCLE,
  SUCCESS, DEADLINE, QL, uniqueIp, noHScroll, open, isShown, box, markCards, markScroller, variantOf,
  textOf, sectionTops, expectInOrder, markInteractive, tabThrough, allHrefs, fillQuote, setField,
  squash, norm, loadLazy,
} from '../helpers/services';

const URL_LIST = '/en/services';
const HERO_EXPLORE = 'Explore The Services';

const quote = (page: Page) => page.locator('#quote');
const submitBtn = (page: Page) => quote(page).getByRole('button', { name: /initialize inquiry/i });
const successCount = (page: Page) => quote(page).getByText(SUCCESS).count();
const tiles = (page: Page) => markCards(page, '#logistic-service', TILES, 'tile');

test.describe('Our Service list /en/services', () => {
  test.beforeEach(async ({ context }) => {
    await context.setExtraHTTPHeaders({ 'x-forwarded-for': uniqueIp() });
  });

  // ---------------------------------------------------------------- page, sections, meta
  test('SV-1: status 200, <html lang="en">, exactly one h1 "OUR SERVICES"', async ({ page }) => {
    const res = await open(page, URL_LIST);
    expect(res?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveCount(1);
    expect(norm(await textOf(page.locator('h1'))).toUpperCase()).toBe('OUR SERVICES');
  });

  test('SV-3: sections appear in the specified order at 1920', async ({ page }) => {
    await open(page, URL_LIST);
    const exact = (t: string) => `^\\s*${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`;
    const tops = await sectionTops(page, [
      { name: 'header', sel: 'header' },
      { name: 'hero', sel: 'h1' },
      { name: 'intro', sel: 'h2', re: 'End-to-End\\s*Logistics\\s*Solutions', flags: 'i' },
      ...GROUPS.map((g) => ({ name: `group ${g.title}`, sel: 'h2', re: exact(g.title), flags: 'i' })),
      { name: 'quote', sel: 'h2,h3', re: 'Request a Project Quote', flags: 'i' },
      { name: 'partners', sel: 'h2', re: 'Partners\\s*(&|and)\\s*Clients', flags: 'i' },
      { name: 'cta', sel: 'h2,h3', re: 'READY TO OPTIMI[SZ]E YOUR SUPPLY CHAIN', flags: 'i' },
      { name: 'footer', sel: 'footer' },
    ]);
    expectInOrder(tops);
  });

  test('SV-4: <title> is "Our Services | Saigon Trans" and the meta description is non-empty', async ({ page }) => {
    await page.goto(URL_LIST);
    await expect(page).toHaveTitle('Our Services | Saigon Trans');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect((desc ?? '').trim().length).toBeGreaterThan(20);
  });

  test('SV-5: intro has the H2, the paragraph, stats 26+ / 06 and the badge 26', async ({ page }) => {
    await open(page, URL_LIST);
    const h2 = page.locator('h2').filter({ hasText: /End-to-End\s*Logistics\s*Solutions/i });
    await expect(h2).toHaveCount(1);
    await expect(h2).toBeVisible();
    await expect(page.getByText(/^Saigontrans has authored and provided/)).toBeVisible();
    const main = page.locator('main');
    await expect(main.getByText('26+', { exact: true }).first()).toBeVisible();
    await expect(main.getByText('06', { exact: true }).first()).toBeVisible();
    await expect(main.getByText(/^years experience$/i)).toHaveCount(2); // stat label + badge label
    await expect(main.getByText(/^service locations$/i)).toHaveCount(1);
    await expect(main.getByText('26', { exact: true }).first()).toBeVisible(); // badge value
  });

  test('SV-6: exactly 4 group sections (id = slug), in order, each with its H2', async ({ page }) => {
    await open(page, URL_LIST);
    let prevTop = -1;
    for (const g of GROUPS) {
      const sec = page.locator(`#${g.slug}`);
      await expect(sec, g.slug).toHaveCount(1);
      const h2 = sec.locator('h2').first();
      expect(norm(await textOf(h2)).toLowerCase()).toBe(g.title.toLowerCase());
      const top = (await box(sec)).y;
      expect(top, `${g.slug} below previous group`).toBeGreaterThan(prevTop);
      prevTop = top;
    }
    // no further group sections: the four group H2 are the only H2s between intro and quote
    const titles = await page.evaluate(() => {
      const hs = Array.from(document.querySelectorAll('main h2')).map((h) => (h.textContent ?? '').replace(/\s+/g, ' ').trim());
      return hs;
    });
    const groupH2 = titles.filter((t) => GROUPS.some((g) => g.title.toLowerCase() === t.toLowerCase()));
    expect(groupH2).toEqual(GROUPS.map((g) => g.title));
  });

  // ---------------------------------------------------------------- group 1
  test('SV-7: group 1 shows 5 cards: 3 in row 1, 2 in row 2', async ({ page }) => {
    await open(page, URL_LIST);
    const cards = await tiles(page);
    const boxes: { x: number; y: number; width: number; height: number }[] = [];
    for (const c of cards) {
      await expect(c).toHaveCount(1);
      boxes.push(await box(c));
    }
    const tops = [...new Set(boxes.map((b) => Math.round(b.y / 10)))];
    expect(tops.length).toBe(2);
    const row1 = boxes.filter((b) => Math.abs(b.y - boxes[0].y) < 10);
    const row2 = boxes.filter((b) => Math.abs(b.y - boxes[0].y) >= 10);
    expect(row1).toHaveLength(3);
    expect(row2).toHaveLength(2);
    expect(row1[0].width).toBeGreaterThan(500);
    expect(row2[0].width).toBeGreaterThan(row1[0].width); // 2 wider cards in row 2
  });

  test('SV-8: Door to Door is active by default; hover or focus moves the highlight', async ({ page }) => {
    await open(page, URL_LIST);
    const cards = await tiles(page);
    const readMore = (i: number) => cards[i].getByText(/read more/i);
    await cards[1].scrollIntoViewIfNeeded();
    await expect.poll(() => isShown(readMore(1))).toBe(true);
    await expect(cards[1].getByText(/Synergistical empower parallel processes/)).toBeVisible();
    for (const i of [0, 2, 3, 4]) expect(await isShown(readMore(i)), `card ${i} default`).toBe(false);

    await cards[0].hover();
    await expect.poll(() => isShown(readMore(0))).toBe(true);
    await expect.poll(() => isShown(readMore(1))).toBe(false);

    await cards[2].locator('a[href]').first().focus();
    await expect.poll(() => isShown(readMore(2))).toBe(true);
    await expect.poll(() => isShown(readMore(0))).toBe(false);

    await page.mouse.move(2, 2); // leaving all cards keeps the last highlight
    await expect.poll(() => isShown(readMore(2))).toBe(true);
  });

  test('SV-9: clicking a group 1 card goes to /en/services/<slug> and is not a 404', async ({ page }) => {
    await open(page, URL_LIST);
    const cards = await tiles(page);
    const link = cards[0].locator('a[href^="/en/services/"]').first();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^\/en\/services\/[a-z0-9-]+$/);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    expect((await page.request.get(href as string)).status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  // ---------------------------------------------------------------- group 2
  test('SV-10: group 2 shows 3 cards with summaries, the lead text and the 6-step tracker', async ({ page }) => {
    await open(page, URL_LIST);
    const sec = page.locator('#freight-forwarding');
    await expect(sec.getByText(/^Global reach with local intelligence/)).toBeVisible();
    const cards = await markCards(page, '#freight-forwarding', FREIGHT_CARDS.map(([t]) => t), 'fcard');
    for (const [i, [title, summary]] of FREIGHT_CARDS.entries()) {
      await expect(cards[i], title).toHaveCount(1);
      expect(squash(await textOf(cards[i]))).toContain(squash(summary));
    }
    const steps = await markCards(page, '#freight-forwarding', STEPS.map(([l]) => l), 'step');
    const xs: number[] = [];
    for (const [i, [label, kicker]] of STEPS.entries()) {
      await expect(steps[i], label).toHaveCount(1);
      expect(squash(await textOf(steps[i])), `${label} kicker`).toContain(squash(kicker));
      xs.push((await box(steps[i])).x);
    }
    for (let i = 1; i < xs.length; i++) expect(xs[i], 'steps run left to right').toBeGreaterThan(xs[i - 1]);
  });

  test('SV-11: tracker step 3 is active, step 6 final, no other step has either', async ({ page }) => {
    await open(page, URL_LIST);
    const steps = await markCards(page, '#freight-forwarding', STEPS.map(([l]) => l), 'step');
    const vs: (string | null)[] = [];
    for (const s of steps) vs.push(await variantOf(s));
    expect(vs[2]).toBe('active');
    expect(vs[5]).toBe('final');
    for (const i of [0, 1, 3, 4]) expect(['active', 'final']).not.toContain(vs[i]);
    const sec = page.locator('#freight-forwarding');
    await expect(sec.locator('[data-variant="active"]')).toHaveCount(1);
    await expect(sec.locator('[data-variant="final"]')).toHaveCount(1);
  });

  // ---------------------------------------------------------------- group 3
  test('SV-12: group 3 shows 4 photo cells with summaries, loaded images and View Facilities below', async ({ page }) => {
    await open(page, URL_LIST);
    await loadLazy(page);
    const cells = await markCards(page, '#warehousing', WAREHOUSE_CELLS.map(([t]) => t), 'cell');
    let lastBottom = 0;
    for (const [i, [title, summary]] of WAREHOUSE_CELLS.entries()) {
      await expect(cells[i], title).toHaveCount(1);
      expect(squash(await textOf(cells[i]))).toContain(squash(summary));
      const img = cells[i].locator('img').first();
      await expect(img, `${title} image`).toHaveCount(1);
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      const b = await box(cells[i]);
      lastBottom = Math.max(lastBottom, b.y + b.height);
    }
    const view = page.locator('#warehousing').getByText(/^view facilities$/i);
    await expect(view.first()).toBeVisible();
    expect((await box(view)).y).toBeGreaterThanOrEqual(lastBottom - 2);
  });

  test('SV-13: View Facilities goes to /en/services/warehousing', async ({ page }) => {
    await open(page, URL_LIST);
    await page.locator('#warehousing').getByText(/^view facilities$/i).first().click();
    await expect(page).toHaveURL(/\/en\/services\/warehousing$/);
  });

  // ---------------------------------------------------------------- group 4
  test('SV-14: group 4 shows 4 cards and the Service Lifecycle box with items 01..04, item 04 final', async ({ page }) => {
    await open(page, URL_LIST);
    const sec = page.locator('#e-commerce');
    for (const t of ECOM_CARDS) await expect(sec.getByText(t, { exact: true }).first(), t).toBeVisible();
    await expect(sec.getByText('Service Lifecycle', { exact: true }).first()).toBeVisible();
    const items = await markCards(page, '#e-commerce', LIFECYCLE, 'life');
    const vs: (string | null)[] = [];
    for (const [i, label] of LIFECYCLE.entries()) {
      await expect(items[i], label).toHaveCount(1);
      expect(squash(await textOf(items[i])), `${label} number`).toContain(`0${i + 1}`);
      vs.push(await variantOf(items[i]));
    }
    expect(vs[3]).toBe('final');
    for (const i of [0, 1, 2]) expect(vs[i]).not.toBe('final');
  });

  // ---------------------------------------------------------------- hero actions, links
  test('SV-15: Explore The Services sets the hash to the first group, scrolls there, stays on the page', async ({ page }) => {
    await open(page, URL_LIST);
    await page.locator('main').getByText(HERO_EXPLORE, { exact: true }).first().click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#logistic-service');
    expect(new URL(page.url()).pathname).toBe(URL_LIST);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const r = document.getElementById('logistic-service')!.getBoundingClientRect();
          return r.top < window.innerHeight && r.bottom > 0;
        }),
      )
      .toBe(true);
    // spec section 4: focus moves to that section's H2
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.tagName + ':' + (document.getElementById('logistic-service')?.contains(document.activeElement) ?? false)))
      .toBe('H2:true');
  });

  test('SV-16: Contact Us goes to /en/contact', async ({ page }) => {
    await open(page, URL_LIST);
    await page.locator('main').getByRole('link', { name: /^contact us$/i }).first().click();
    await expect(page).toHaveURL(/\/en\/contact$/);
  });

  test('SV-17: no link is "#" or empty and every internal target responds non-404', async ({ page }) => {
    await open(page, URL_LIST);
    const hrefs = await allHrefs(page);
    const bad = hrefs.filter((h) => h.trim() === '' || h.trim() === '#');
    expect(bad, 'empty or # hrefs').toEqual([]);
    const internal = [...new Set(hrefs.filter((h) => h.startsWith('/')).map((h) => h.split('#')[0] || URL_LIST))];
    expect(internal.length).toBeGreaterThan(10);
    for (const h of internal) {
      const status = (await page.request.get(h)).status();
      expect(status, h).toBeLessThan(400);
    }
  });

  // ---------------------------------------------------------------- quote form
  test('SV-18: quote section shows its title, the 7 labelled fields and INITIALIZE INQUIRY', async ({ page }) => {
    await open(page, URL_LIST);
    const q = quote(page);
    await expect(q).toHaveCount(1);
    await expect(q.getByText('Request a Project Quote').first()).toBeVisible();
    for (const l of [QL.first, QL.last, QL.email, QL.phone, QL.type, QL.volume, QL.brief]) {
      await expect(q.getByLabel(l).first(), String(l)).toBeVisible();
    }
    await expect(q.getByLabel(QL.email).first()).toHaveAttribute('type', 'email');
    expect(await q.getByLabel(QL.brief).first().evaluate((e) => e.tagName.toLowerCase())).toBe('textarea');
    expect(await q.getByLabel(QL.type).first().evaluate((e) => e.tagName.toLowerCase())).toBe('select');
    await expect(submitBtn(page)).toBeVisible();
  });

  test('SV-18: the design copy "respond within 4 hours" is not rendered (build guide decision 2)', async ({ page }) => {
    await open(page, URL_LIST);
    await expect(page.getByText(/within\s+4\s+hours|respond within/i)).toHaveCount(0);
  });

  test('SV-19: empty first name and invalid email show errors on those fields only, no success', async ({ page }) => {
    await open(page, URL_LIST);
    const before = await successCount(page);
    await fillQuote(quote(page), { first: '', email: 'not-an-email' });
    await submitBtn(page).click();
    const q = quote(page);
    await expect(q.getByLabel(QL.first).first()).toHaveAttribute('aria-invalid', 'true');
    await expect(q.getByLabel(QL.email).first()).toHaveAttribute('aria-invalid', 'true');
    for (const l of [QL.last, QL.phone, QL.type, QL.volume, QL.brief]) {
      await expect(q.getByLabel(l).first()).not.toHaveAttribute('aria-invalid', 'true');
    }
    expect(await successCount(page)).toBe(before);
  });

  test('SV-19: empty submit flags the four required fields; service type, volume and brief stay optional', async ({ page }) => {
    await open(page, URL_LIST);
    const before = await successCount(page);
    await submitBtn(page).click();
    const q = quote(page);
    for (const l of [QL.first, QL.last, QL.email, QL.phone]) {
      await expect(q.getByLabel(l).first()).toHaveAttribute('aria-invalid', 'true');
    }
    for (const l of [QL.type, QL.volume, QL.brief]) {
      await expect(q.getByLabel(l).first()).not.toHaveAttribute('aria-invalid', 'true');
    }
    expect(await successCount(page)).toBe(before);
  });

  test('SV-20: valid data shows success with no response deadline (optional fields filled)', async ({ page }) => {
    await open(page, URL_LIST);
    const q = quote(page);
    const before = await successCount(page);
    await fillQuote(q);
    await setField(q, QL.volume, '50 containers/month');
    await setField(q, QL.brief, 'Need door to door from HCMC to Hanoi');
    await submitBtn(page).click();
    await expect.poll(() => successCount(page)).toBeGreaterThan(before);
    await expect(q.locator('[aria-invalid="true"]')).toHaveCount(0);
    const text = norm(await textOf(q));
    expect(text).not.toMatch(/within \d+|business days?/i);
    const ok = await q.getByText(SUCCESS).first().textContent();
    expect(ok ?? '').not.toMatch(DEADLINE);
  });

  test('SV-21: a filled honeypot looks like success to the visitor', async ({ page }) => {
    await open(page, URL_LIST);
    const q = quote(page);
    const before = await successCount(page);
    await fillQuote(q);
    await q.locator('[name="website"]').evaluate((el) => {
      (el as HTMLInputElement).value = 'http://spam.example';
    });
    await submitBtn(page).click();
    await expect.poll(() => successCount(page)).toBeGreaterThan(before);
  });

  test('SV-22: service type options are the top-level group titles plus the disabled placeholder', async ({ page }) => {
    await open(page, URL_LIST);
    const opts = await quote(page).getByLabel(QL.type).first().evaluate((s) =>
      Array.from((s as HTMLSelectElement).options).map((o) => ({
        text: (o.textContent ?? '').replace(/\s+/g, ' ').trim(),
        value: o.value,
        disabled: o.disabled,
        selected: o.selected,
      })),
    );
    expect(opts).toHaveLength(5);
    expect(opts[0]).toMatchObject({ text: 'Select Logistics Service', disabled: true, selected: true });
    expect(opts.slice(1).map((o) => o.value)).toEqual(GROUPS.map((g) => g.slug));
    for (const o of opts.slice(1)) {
      expect(o.text.length).toBeGreaterThan(0);
      expect(o.disabled).toBe(false);
    }
  });

  // ---------------------------------------------------------------- responsive
  test('SV-24: no horizontal scroll at every S5 width', async ({ page }) => {
    test.setTimeout(180_000);
    const bad: string[] = [];
    for (const w of S5_WIDTHS) {
      await open(page, URL_LIST, w, 900);
      const { sw, iw } = await noHScroll(page);
      if (sw > iw) bad.push(`${w}: scrollWidth ${sw} > ${iw}`);
    }
    expect(bad).toEqual([]);
  });

  test('SV-25: at 428 group 1 is a snap carousel with dots; dot 2 or scrolling brings the next card in', async ({ page }) => {
    await open(page, URL_LIST, 428, 926);
    const cards = await tiles(page);
    const sc = await markScroller(cards[0], 'sv25');
    expect(sc.found, 'cards sit in a horizontally scrollable container').toBe(true);
    expect(sc.snap).toMatch(/x/);
    const dots = page.locator('#logistic-service').getByRole('button', { name: /^slide \d+$/i });
    await expect(dots).toHaveCount(5);
    for (let i = 0; i < 5; i++) expect(await isShown(dots.nth(i))).toBe(true);
    await dots.nth(1).scrollIntoViewIfNeeded();
    await dots.nth(1).click();
    await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
    const scroller = page.locator('[data-tscroll="sv25"]');
    await expect
      .poll(async () => {
        const c = await box(cards[1]);
        const s = await box(scroller);
        return c.x >= s.x - 6 && c.x + c.width <= s.x + s.width + 6;
      })
      .toBe(true);
    await scroller.evaluate((el) => el.scrollTo({ left: el.scrollWidth }));
    await expect(dots.nth(4)).toHaveAttribute('aria-current', 'true');
    const { sw, iw } = await noHScroll(page);
    expect(sw).toBeLessThanOrEqual(iw);
  });

  test('SV-26: at 428 groups 2 and 4 are snap carousels with dots; group 3 cells stack in one column', async ({ page }) => {
    await open(page, URL_LIST, 428, 926);
    const f = await markCards(page, '#freight-forwarding', FREIGHT_CARDS.map(([t]) => t), 'fc');
    const fs = await markScroller(f[0], 'sv26f');
    expect(fs.found).toBe(true);
    expect(fs.snap).toMatch(/x/);
    await expect(page.locator('#freight-forwarding').getByRole('button', { name: /^slide \d+$/i })).toHaveCount(3);

    const e = await markCards(page, '#e-commerce', ECOM_CARDS, 'ec');
    const es = await markScroller(e[0], 'sv26e');
    expect(es.found).toBe(true);
    expect(es.snap).toMatch(/x/);
    await expect(page.locator('#e-commerce').getByRole('button', { name: /^slide \d+$/i })).toHaveCount(4);

    const cells = await markCards(page, '#warehousing', WAREHOUSE_CELLS.map(([t]) => t), 'wc');
    const bs = [];
    for (const c of cells) bs.push(await box(c));
    for (let i = 1; i < bs.length; i++) {
      expect(Math.abs(bs[i].x - bs[0].x), `cell ${i} same column`).toBeLessThanOrEqual(2);
      expect(bs[i].y, `cell ${i} below previous`).toBeGreaterThanOrEqual(bs[i - 1].y + bs[i - 1].height - 2);
    }
    expect(bs[0].width).toBeGreaterThan(428 - 48);
    const view = page.locator('#warehousing').getByText(/^view facilities$/i).first();
    const vb = await box(view);
    expect(Math.abs(vb.x + vb.width / 2 - 214), 'View Facilities centered').toBeLessThan(30);
  });

  test('SV-27: at 768 group 1 cards are in 2 columns, the last card spans both', async ({ page }) => {
    await open(page, URL_LIST, 768, 1024);
    const cards = await tiles(page);
    const b = [];
    for (const c of cards) b.push(await box(c));
    expect(Math.abs(b[0].y - b[1].y)).toBeLessThanOrEqual(4);
    expect(b[1].x).toBeGreaterThan(b[0].x + b[0].width / 2);
    expect(Math.abs(b[2].y - b[3].y)).toBeLessThanOrEqual(4);
    expect(b[2].y).toBeGreaterThan(b[0].y + 50);
    expect(b[4].y).toBeGreaterThan(b[2].y + 50);
    expect(b[4].width).toBeGreaterThan(b[0].width * 1.6);
    expect(Math.abs(b[4].x - b[0].x)).toBeLessThanOrEqual(4);
  });

  test('SV-28: hamburger below 1280, full nav bar at 1280 and above', async ({ page }) => {
    const names = [/^home$/i, /^pages$/i, /^services$/i, /^about/i, /^news$/i, /^contact$/i];
    const nav = (p: Page, re: RegExp) => p.locator('header').getByRole('link', { name: re }).or(p.locator('header').getByRole('button', { name: re }));
    for (const w of [428, 768, 1024, 1180]) {
      await open(page, URL_LIST, w, 900);
      await expect(page.getByRole('button', { name: /open menu/i }), `${w}: hamburger`).toBeVisible();
      for (const re of names) expect(await isShown(nav(page, re)), `${w}: ${re} hidden`).toBe(false);
    }
    for (const w of [1280, 1920]) {
      await open(page, URL_LIST, w, 900);
      await expect(page.getByRole('button', { name: /open menu/i }), `${w}: no hamburger`).toBeHidden();
      for (const re of names) expect(await isShown(nav(page, re)), `${w}: ${re} visible`).toBe(true);
    }
  });

  test('SV-29: SERVICES is the active nav item (aria-current="page") at 1920 and 1280', async ({ page }) => {
    for (const w of [1920, 1280]) {
      await open(page, URL_LIST, w, 900);
      const h = page.locator('header');
      await expect(h.getByRole('link', { name: /^services$/i }).first()).toHaveAttribute('aria-current', 'page');
      for (const re of [/^home$/i, /^about/i, /^news$/i, /^contact$/i]) {
        await expect(h.getByRole('link', { name: re }).first(), `${w} ${re}`).not.toHaveAttribute('aria-current', 'page');
      }
    }
  });

  // ---------------------------------------------------------------- keyboard, network
  test('SV-30: Tab reaches hero buttons, cards, View Facilities and form controls in DOM order, each with a focus ring', async ({ page }) => {
    test.setTimeout(90_000);
    await open(page, URL_LIST);
    const total = await markInteractive(page);
    expect(total).toBeGreaterThan(20);
    const cards = await tiles(page);
    const wants = [
      page.locator('main').getByText(HERO_EXPLORE, { exact: true }).first(),
      page.locator('main').getByRole('link', { name: /^contact us$/i }).first(),
      ...cards.map((c) => c.locator('a[href]').first()),
      page.locator('#warehousing').getByText(/^view facilities$/i).first(),
      ...[QL.first, QL.last, QL.email, QL.phone, QL.type, QL.volume, QL.brief].map((l) => quote(page).getByLabel(l).first()),
      submitBtn(page),
    ];
    const ids: string[] = [];
    for (const w of wants) {
      // the clickable ancestor (link/button) or the control itself carries the id
      const id = await w.evaluate((el) => (el.closest('[data-kb-id]') as HTMLElement | null)?.dataset.kbId ?? null);
      expect(id, 'wanted element is not interactive/tagged').not.toBeNull();
      ids.push(id as string);
    }
    const { seen, order } = await tabThrough(page, total);
    for (const id of ids) expect(seen.has(id), `element ${id} not reachable by Tab`).toBe(true);
    const noRing = [...seen.entries()].filter(([, ring]) => !ring).map(([id]) => id);
    expect(noRing, 'focused without outline or box-shadow').toEqual([]);
    const sorted = [...order].sort((a, b) => a - b);
    expect(order, 'Tab order follows DOM order').toEqual(sorted);
  });

  test('SV-32: no request leaves the site during load and scroll', async ({ page }) => {
    const hosts = new Set<string>();
    page.on('request', (r) => {
      const u = new URL(r.url());
      if (u.protocol === 'http:' || u.protocol === 'https:') hosts.add(u.host);
    });
    await open(page, URL_LIST);
    await loadLazy(page);
    expect([...hosts]).toEqual(['localhost:3000']);
  });

  test('SV-24: intro decorations (forklift, map watermark) are hidden at 428', async ({ page }) => {
    await open(page, URL_LIST, 428, 926);
    const res = await page.evaluate(() => {
      const first = document.getElementById('logistic-service');
      const h1 = document.querySelector('h1');
      if (!first || !h1) return { total: 0, visible: 0 };
      const deco = Array.from(document.querySelectorAll('[aria-hidden="true"]')).filter((el) => {
        const isImg = el.tagName === 'IMG' || el.querySelector('img') !== null || getComputedStyle(el).backgroundImage.includes('url(');
        const after = !!(h1.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
        const before = !!(first.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) && !first.contains(el);
        return isImg && after && before && !h1.contains(el) && !el.closest('header');
      });
      const visible = deco.filter((el) => {
        const r = el.getBoundingClientRect();
        const e = el as HTMLElement & { checkVisibility?: (o: object) => boolean };
        return r.width > 1 && r.height > 1 && (e.checkVisibility ? e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true);
      });
      return { total: deco.length, visible: visible.length };
    });
    expect(res.total, 'decorative images exist in the DOM between hero and group 1').toBeGreaterThan(0);
    expect(res.visible).toBe(0);
  });
});
