import { test, expect, type Page } from '@playwright/test';
import {
  ABOUT_PATH, S5_WIDTHS, TITLE, HERO, INTRO, CAPABILITIES, VISION, MISSION, VALUES_HEADING, CORE_VALUES,
  SOT_COL1, SOT_COL2, SOT_COL3, PARTNERS, CTA, HEADING_ORDER, strip,
  openAbout, cardsFor, leafBox, containingBox, headingTops, horizontalOverflow,
} from '../helpers/about-us';

const capTitles = CAPABILITIES.map((c) => c.title);
const valueTitles = CORE_VALUES.map((v) => v.title);
const main = (page: Page) => page.locator('main');
const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

/* eslint-disable @typescript-eslint/no-explicit-any */

test.describe('About Us /en/about-us', () => {
  test('AB-1: status 200, lang en, title, meta description, exactly one h1 "ABOUT SAIGONTRANS"', async ({ page }) => {
    const res = await page.goto(ABOUT_PATH);
    expect(res?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(TITLE);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect((desc ?? '').trim().length).toBeGreaterThan(20);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(HERO.h1);
  });

  test('AB-2: sections appear in order at 1920 (header, hero, intro, vision, values, partners, CTA, footer)', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    const tops = await headingTops(page, HEADING_ORDER);
    HEADING_ORDER.forEach((h, i) => expect(tops[i], `heading "${h}" not found`).not.toBeNull());
    for (let i = 1; i < tops.length; i++) {
      expect(tops[i]!, `"${HEADING_ORDER[i]}" must be below "${HEADING_ORDER[i - 1]}"`).toBeGreaterThan(tops[i - 1]!);
    }
    const { headerTop, footerTop, heroTop } = await page.evaluate(() => ({
      headerTop: document.querySelector('header')!.getBoundingClientRect().top + window.scrollY,
      footerTop: document.querySelector('footer')!.getBoundingClientRect().top + window.scrollY,
      heroTop: document.querySelector('h1')!.getBoundingClientRect().top + window.scrollY,
    }));
    expect(headerTop).toBeLessThanOrEqual(heroTop);
    expect(footerTop).toBeGreaterThan(tops[tops.length - 1]!);
    // capabilities sit between intro and vision/mission
    const cards = await cardsFor(page, 'cap', capTitles);
    const intro = tops[1]!;
    const vision = tops[2]!;
    for (const c of cards) {
      expect(c.box!.top).toBeGreaterThan(intro);
      expect(c.box!.top).toBeLessThan(vision);
    }
  });

  test('AB-3: only ABOUT carries aria-current="page" in the header nav; nav targets', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    const current = page.locator('header [aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText(/^\s*ABOUT\s*$/i);
    await expect(current).toHaveAttribute('href', '/en/about-us');
    const targets: [RegExp, string][] = [
      [/^\s*HOME\s*$/i, '/en'], [/^\s*SERVICES\s*$/i, '/en/services'], [/^\s*NEWS\s*$/i, '/en/news'],
      [/^\s*CONTACT\s*$/i, '/en/contact'],
    ];
    for (const [re, href] of targets) {
      const link = page.locator('header a').filter({ hasText: re }).first();
      await expect(link, String(re)).toHaveAttribute('href', href);
      expect(await link.getAttribute('aria-current'), String(re)).toBeNull();
    }
    await expect(page.getByRole('button', { name: /^\s*PAGES\s*$/i }).first()).not.toHaveAttribute('aria-current', /.+/);
  });

  test('AB-4: hero texts; Explore The Services -> /en/services; Contact Us -> /en/contact', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    await expect(main(page).getByText(HERO.subtitle, { exact: true }).first()).toBeVisible();
    const explore = main(page).getByRole('link', { name: /^\s*Explore The Services\s*$/ }).first();
    const contact = main(page).getByRole('link', { name: /^\s*Contact Us\s*$/ }).first();
    await expect(explore).toHaveAttribute('href', '/en/services');
    await expect(contact).toHaveAttribute('href', '/en/contact');
    await explore.click();
    await expect(page).toHaveURL(/\/en\/services\/?$/);
    await page.goto(ABOUT_PATH);
    await main(page).getByRole('link', { name: /^\s*Contact Us\s*$/ }).first().click();
    await expect(page).toHaveURL(/\/en\/contact\/?$/);
  });

  test('AB-5: intro eyebrow, H2, both paragraphs verbatim, badge 26+ / Years Of Experience / 5.0', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    const m = main(page);
    await expect(m.getByText(INTRO.eyebrow, { exact: true }).first()).toBeVisible();
    await expect(m.getByRole('heading', { level: 2, name: INTRO.h2, exact: true })).toBeVisible();
    await expect(m.getByText(INTRO.p1, { exact: true }).first()).toBeVisible();
    await expect(m.getByText(INTRO.p2, { exact: true }).first()).toBeVisible();
    for (const t of [INTRO.years, INTRO.yearsLabel, INTRO.rating]) {
      await expect(m.getByText(t, { exact: true }).first(), t).toBeVisible();
    }
    // vertical order inside the intro: eyebrow < H2 < p1 < p2 < buttons
    const ys = await Promise.all([INTRO.eyebrow, INTRO.h2, INTRO.p1, INTRO.p2].map(async (t) => (await containingBox(page, t))!.top));
    for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeGreaterThan(ys[i - 1]);
  });

  test('AB-6: View Services -> /en/services; Read More has a real href (not "#")', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    const rm = main(page).getByRole('link', { name: /^\s*Read More\s*$/ }).first();
    const href = await rm.getAttribute('href');
    expect((href ?? '').trim().length).toBeGreaterThan(0);
    expect(href).not.toBe('#');
    await expect(main(page).getByRole('link', { name: /^\s*View Services\s*$/ }).first()).toHaveAttribute('href', '/en/services');
    await main(page).getByRole('link', { name: /^\s*View Services\s*$/ }).first().click();
    await expect(page).toHaveURL(/\/en\/services\/?$/);
  });

  test('AB-7: exactly 8 capability cards with the 8 titles in order and the sub-lines (cards 3 and 8 have none)', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    const cards = await cardsFor(page, 'cap', capTitles);
    expect(cards.filter((c) => c.found)).toHaveLength(8);
    // 8 distinct card boxes
    const keys = new Set(cards.map((c) => `${Math.round(c.box!.left)}x${Math.round(c.box!.top)}`));
    expect(keys.size).toBe(8);
    cards.forEach((c, i) => {
      const exp = CAPABILITIES[i];
      expect(c.text, `card ${i + 1} text`).toBe(strip(exp.title + (exp.detail ?? '')));
    });
    // reading order = DOM order
    const domOrdered = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[data-ab-card^="cap-"]'));
      return els.map((e) => e.getAttribute('data-ab-card')).join(',');
    });
    expect(domOrdered).toBe(capTitles.map((_, i) => `cap-${i}`).join(','));
  });

  for (const width of [1280, 1920]) {
    test(`AB-8: at ${width} the capability cards form 4 columns x 2 rows`, async ({ page }) => {
      await openAbout(page, width, 1080);
      const cards = await cardsFor(page, 'cap', capTitles);
      const row1 = cards.slice(0, 4).map((c) => c.box!);
      const row2 = cards.slice(4).map((c) => c.box!);
      expect(new Set(row1.map((b) => Math.round(b.left))).size).toBe(4);
      expect(new Set(row2.map((b) => Math.round(b.left))).size).toBe(4);
      row1.forEach((b) => expect(near(b.top, row1[0].top, 2)).toBe(true));
      row2.forEach((b) => expect(near(b.top, row2[0].top, 2)).toBe(true));
      expect(new Set(cards.map((c) => Math.round(c.box!.top / 4))).size).toBe(2);
      expect(row2[0].top).toBeGreaterThan(row1[0].bottom - 1);
    });
  }

  for (const width of [768, 1024]) {
    test(`AB-8: at ${width} the capability cards are 2 columns x 4 rows (spec section 5)`, async ({ page }) => {
      await openAbout(page, width, 1024);
      const cards = await cardsFor(page, 'cap', capTitles);
      expect(new Set(cards.map((c) => Math.round(c.box!.left))).size).toBe(2);
      expect(new Set(cards.map((c) => Math.round(c.box!.top))).size).toBe(4);
    });
  }

  test('AB-9: vision and mission texts verbatim; side by side at 1920', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    const m = main(page);
    await expect(m.getByRole('heading', { level: 3, name: VISION.title, exact: true })).toBeVisible();
    await expect(m.getByRole('heading', { level: 3, name: MISSION.title, exact: true })).toBeVisible();
    await expect(m.getByText(VISION.text, { exact: true }).first()).toBeVisible();
    await expect(m.getByText(MISSION.text, { exact: true }).first()).toBeVisible();
  });

  for (const width of [768, 1024, 1280, 1920]) {
    test(`AB-9: at ${width} Our Vision and Our Mission sit side by side`, async ({ page }) => {
      await openAbout(page, width, 1000);
      const v = (await leafBox(page, VISION.title))!;
      const mi = (await leafBox(page, MISSION.title))!;
      expect(near(v.top, mi.top, 4)).toBe(true);
      expect(mi.left).toBeGreaterThan(v.right - 1);
    });
  }

  test('AB-9: at 428 Our Vision is above Our Mission and both texts are visible', async ({ page }) => {
    await openAbout(page, 428, 926);
    const v = (await leafBox(page, VISION.title))!;
    const mi = (await leafBox(page, MISSION.title))!;
    expect(mi.top).toBeGreaterThan(v.bottom);
    expect(near(v.left, mi.left, 4)).toBe(true);
    await expect(main(page).getByText(VISION.text, { exact: true }).first()).toBeVisible();
    await expect(main(page).getByText(MISSION.text, { exact: true }).first()).toBeVisible();
  });

  test('AB-10: 6 core value cards in order with verbatim bodies; heading "Our Core Values" with eyebrow "Services"', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    const cards = await cardsFor(page, 'val', valueTitles);
    expect(cards.filter((c) => c.found)).toHaveLength(6);
    cards.forEach((c, i) => {
      expect(c.text.startsWith(strip(valueTitles[i])) || c.text.includes(strip(valueTitles[i]))).toBe(true);
      for (const body of CORE_VALUES[i].bodies) {
        expect(c.text, `${valueTitles[i]} body`).toContain(strip(body));
      }
    });
    const order = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-ab-card^="val-"]')).map((e) => e.getAttribute('data-ab-card')).join(','));
    expect(order).toBe(valueTitles.map((_, i) => `val-${i}`).join(','));
    await expect(main(page).getByRole('heading', { level: 2, name: VALUES_HEADING.h2, exact: true })).toBeVisible();
    const eyebrow = await leafBox(page, VALUES_HEADING.eyebrow);
    const h2 = (await headingTops(page, [VALUES_HEADING.h2]))[0]!;
    expect(eyebrow).not.toBeNull();
    expect(eyebrow!.top).toBeLessThan(h2);
    expect(h2).toBeLessThan(cards[0].box!.top);
  });

  test('AB-10: SOT keeps its three text columns incl. the two lines of column 1 at 1920', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    const c1 = (await containingBox(page, SOT_COL1[0]))!;
    const c1b = (await containingBox(page, SOT_COL1[1]))!;
    const c2 = (await containingBox(page, SOT_COL2))!;
    const c3 = (await containingBox(page, SOT_COL3))!;
    expect(c1b.top).toBeGreaterThanOrEqual(c1.top);
    expect(c2.left).toBeGreaterThan(c1.left + 100);
    expect(c3.left).toBeGreaterThan(c2.left + 100);
  });

  test('AB-11: at 1920 row layout of the core values (A: two, SOT and OPERATION full width, D: two)', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    const [intg, cust, sot, op, qual, team] = (await cardsFor(page, 'val', valueTitles)).map((c) => c.box!);
    expect(near(intg.top, cust.top, 2)).toBe(true);
    expect(cust.left).toBeGreaterThan(intg.right - 1);
    expect(near(qual.top, team.top, 2)).toBe(true);
    expect(team.left).toBeGreaterThan(qual.right - 1);
    const containerW = cust.right - intg.left;
    expect(near(sot.width, containerW, 6)).toBe(true);
    expect(near(op.width, containerW, 6)).toBe(true);
    expect(near(sot.left, intg.left, 4)).toBe(true);
    expect(near(op.left, intg.left, 4)).toBe(true);
    expect(sot.top).toBeGreaterThan(intg.bottom - 1);
    expect(op.top).toBeGreaterThan(sot.bottom - 1);
    expect(qual.top).toBeGreaterThan(op.bottom - 1);
    expect(near(qual.left, intg.left, 4)).toBe(true);
    expect(near(team.right, cust.right, 4)).toBe(true);
  });

  test('AB-11: at 1920 the icon and title of SOT and OPERATION EXCELLENCE share one line', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    for (const title of ['SOT', 'OPERATION EXCELLENCE']) {
      const r = await page.evaluate((t) => {
        const a = (window as any).__ab;
        const l = a.leaf(t);
        let c: Element = l;
        // card = ancestor holding an icon (svg/img) but not another value title
        while (c.parentElement && !c.querySelector('svg,img')) c = c.parentElement;
        const icon = c.querySelector('svg,img')!;
        return { icon: a.box(icon), title: a.box(l) };
      }, title);
      expect(r.icon.right, title).toBeLessThanOrEqual(r.title.left + 2);
      const overlap = Math.min(r.icon.bottom, r.title.bottom) - Math.max(r.icon.top, r.title.top);
      expect(overlap, `${title}: icon and title vertically overlap`).toBeGreaterThan(0);
    }
  });

  test('AB-11: at 428 all six core value cards are stacked in one column in DOM order; SOT icon and title on one line', async ({ page }) => {
    await openAbout(page, 428, 926);
    const boxes = (await cardsFor(page, 'val', valueTitles)).map((c) => c.box!);
    for (let i = 0; i < boxes.length; i++) {
      expect(near(boxes[i].left, boxes[0].left, 3), `card ${i} left`).toBe(true);
      expect(boxes[i].width).toBeGreaterThan(428 * 0.8);
      if (i) expect(boxes[i].top).toBeGreaterThan(boxes[i - 1].bottom - 1);
    }
    const r = await page.evaluate(() => {
      const a = (window as any).__ab;
      const l = a.leaf('SOT');
      let c: Element = l;
      while (c.parentElement && !c.querySelector('svg,img')) c = c.parentElement;
      return { icon: a.box(c.querySelector('svg,img')!), title: a.box(l) };
    });
    expect(r.icon.right).toBeLessThanOrEqual(r.title.left + 2);
    expect(Math.min(r.icon.bottom, r.title.bottom) - Math.max(r.icon.top, r.title.top)).toBeGreaterThan(0);
    // the 3 SOT text blocks are stacked
    const c2 = (await containingBox(page, SOT_COL2))!;
    const c3 = (await containingBox(page, SOT_COL3))!;
    const c1 = (await containingBox(page, SOT_COL1[0]))!;
    expect(c2.top).toBeGreaterThan(c1.top);
    expect(c3.top).toBeGreaterThan(c2.top);
  });

  for (const width of [768, 1024]) {
    test(`AB-11: at ${width} rows A and D keep 2 columns; at 768 the SOT columns stack`, async ({ page }) => {
      await openAbout(page, width, 1024);
      const [intg, cust, , , qual, team] = (await cardsFor(page, 'val', valueTitles)).map((c) => c.box!);
      expect(near(intg.top, cust.top, 2)).toBe(true);
      expect(cust.left).toBeGreaterThan(intg.right - 1);
      expect(near(qual.top, team.top, 2)).toBe(true);
      expect(team.left).toBeGreaterThan(qual.right - 1);
      if (width === 768) {
        const c2 = (await containingBox(page, SOT_COL2))!;
        const c3 = (await containingBox(page, SOT_COL3))!;
        const c1 = (await containingBox(page, SOT_COL1[0]))!;
        expect(c2.top).toBeGreaterThan(c1.top);
        expect(c3.top).toBeGreaterThan(c2.top);
        expect(near(c2.left, c3.left, 4)).toBe(true);
      }
    });
  }

  test('AB-12: TEAMWORK card is dark with a white title; QUALITY card is white', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    await cardsFor(page, 'val', valueTitles);
    const r = await page.evaluate(() => {
      const a = (window as any).__ab;
      const team = document.querySelector('[data-ab-card="val-5"]')!;
      const qual = document.querySelector('[data-ab-card="val-4"]')!;
      const teamBg = a.paint(team);
      const qualBg = a.paint(qual);
      const title = a.leaf('TEAMWORK');
      return {
        teamBg, qualBg,
        teamLum: teamBg ? a.lum(teamBg) : null,
        qualLum: qualBg ? a.lum(qualBg) : null,
        titleColor: getComputedStyle(title).color,
        titleLum: a.lum(getComputedStyle(title).color),
      };
    });
    expect(r.teamBg, 'TEAMWORK has an opaque background colour').not.toBeNull();
    expect(r.teamLum!).toBeLessThan(0.2);
    expect(r.titleLum, `title colour ${r.titleColor}`).toBeGreaterThan(0.9);
    expect(r.qualBg, 'QUALITY has an opaque background colour').not.toBeNull();
    expect(r.qualLum!).toBeGreaterThan(0.97);
  });

  test('AB-13: partners eyebrow, H2 and 7 logos at 1920', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    await expect(main(page).getByText(PARTNERS.eyebrow, { exact: true }).first()).toBeVisible();
    await expect(main(page).getByRole('heading', { level: 2, name: PARTNERS.h2, exact: true })).toBeVisible();
    const logos = await page.evaluate(() => {
      const a = (window as any).__ab;
      const h = Array.from(document.querySelectorAll('h2')).find((x) => (x.textContent || '').replace(/\s+/g, ' ').trim() === 'Partners & Clients')!;
      let c: Element | null = h;
      while (c && c.querySelectorAll('img').length < 7) c = c.parentElement;
      if (!c) return -1;
      return Array.from(c.querySelectorAll('img')).filter((i) => a.shown(i) && i.getBoundingClientRect().width > 10).length;
    });
    expect(logos).toBe(7);
  });

  test('AB-13: at 428 the partner logos are a scroll-snap carousel with dots, 4 visible, no horizontal page scroll', async ({ page }) => {
    await openAbout(page, 428, 926);
    const r = await page.evaluate(() => {
      const a = (window as any).__ab;
      const h = Array.from(document.querySelectorAll('h2')).find((x) => (x.textContent || '').replace(/\s+/g, ' ').trim() === 'Partners & Clients')!;
      let sec: Element | null = h;
      while (sec && sec.querySelectorAll('img').length < 7) sec = sec.parentElement;
      if (!sec) return null;
      const imgs = Array.from(sec.querySelectorAll('img'));
      const scroller = a.scrollerOf(imgs);
      if (!scroller) return { scroller: false } as any;
      const sr = scroller.getBoundingClientRect();
      const visible = imgs.filter((i) => {
        const r = i.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        return r.width > 5 && cx > sr.left && cx < sr.right;
      }).length;
      return {
        scroller: true,
        snap: getComputedStyle(scroller).scrollSnapType,
        overflow: scroller.scrollWidth > scroller.clientWidth,
        dots: a.dotsOf(scroller, 2).length,
        visible,
      };
    });
    expect(r).not.toBeNull();
    expect((r as any).scroller, 'a horizontal scroll container wraps the logos').toBe(true);
    expect((r as any).snap).not.toBe('none');
    expect((r as any).overflow).toBe(true);
    expect((r as any).dots).toBeGreaterThanOrEqual(2);
    expect((r as any).visible).toBe(4);
    const { sw, iw } = await horizontalOverflow(page);
    expect(sw).toBeLessThanOrEqual(iw);
  });

  test('AB-14: at 428 capabilities are a scroll-snap carousel with 8 dots; scrolling and dot click move the active dot', async ({ page }) => {
    await openAbout(page, 428, 926);
    await cardsFor(page, 'cap', capTitles);
    const info = await page.evaluate(() => {
      const a = (window as any).__ab;
      const els = Array.from(document.querySelectorAll('[data-ab-card^="cap-"]'));
      const s = a.scrollerOf(els);
      if (!s) return null;
      s.setAttribute('data-ab-scroller', '1');
      const dots = a.dotsOf(s, 8);
      dots.forEach((d: Element, i: number) => d.setAttribute('data-ab-dot', String(i)));
      const r0 = els[0].getBoundingClientRect();
      const r1 = els[1].getBoundingClientRect();
      return {
        snap: getComputedStyle(s).scrollSnapType,
        overflow: s.scrollWidth > s.clientWidth,
        dots: dots.length,
        cardRatio: r0.width / window.innerWidth,
        peek: r1.left < window.innerWidth,
      };
    });
    expect(info, 'capabilities sit in a horizontal scroll container').not.toBeNull();
    expect(info!.snap).not.toBe('none');
    expect(info!.overflow).toBe(true);
    expect(info!.dots).toBe(8);
    expect(info!.cardRatio).toBeGreaterThan(0.7);
    expect(info!.cardRatio).toBeLessThan(0.95);
    expect(info!.peek).toBe(true);
    const active = () => page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-ab-dot]')).findIndex((d) => d.getAttribute('aria-current') === 'true'));
    expect(await active()).toBe(0);
    await page.evaluate(() => {
      const s = document.querySelector('[data-ab-scroller]')!;
      s.scrollTo({ left: s.scrollWidth, behavior: 'instant' as ScrollBehavior });
    });
    await page.waitForTimeout(600);
    expect(await active()).toBeGreaterThan(0);
    await page.locator('[data-ab-dot="0"]').click();
    await page.waitForTimeout(800);
    expect(await active()).toBe(0);
    await page.locator('[data-ab-dot="3"]').click();
    await page.waitForTimeout(800);
    expect(await active()).toBe(3);
    expect(await page.evaluate(() => document.querySelector('[data-ab-scroller]')!.scrollLeft)).toBeGreaterThan(0);
    const { sw, iw } = await horizontalOverflow(page);
    expect(sw).toBeLessThanOrEqual(iw);
  });

  for (const width of S5_WIDTHS) {
    test(`AB-15: no horizontal page scroll at ${width}px`, async ({ page }) => {
      await openAbout(page, width, 900);
      const { sw, iw } = await horizontalOverflow(page);
      expect(sw).toBeLessThanOrEqual(iw);
      const h1 = (await leafBox(page, HERO.h1))!;
      expect(h1.left).toBeGreaterThanOrEqual(0);
      expect(h1.right).toBeLessThanOrEqual(iw + 1);
    });
  }

  test('AB-15: hero buttons stay in one row at 428 and 768', async ({ page }) => {
    for (const width of [428, 768]) {
      await openAbout(page, width, 900);
      const a = await main(page).getByRole('link', { name: /^\s*Explore The Services\s*$/ }).first().boundingBox();
      const b = await main(page).getByRole('link', { name: /^\s*Contact Us\s*$/ }).first().boundingBox();
      expect(near(a!.y + a!.height / 2, b!.y + b!.height / 2, 12), `row at ${width}`).toBe(true);
      expect(b!.x).toBeGreaterThan(a!.x);
    }
  });

  for (const width of [1024, 1280, 1920]) {
    test(`AB-15: intro is two columns (photo right of the text, overlapped by the badge) at ${width}`, async ({ page }) => {
      await openAbout(page, width, 1000);
      const r = await introGeometry(page);
      expect(r.photo, 'intro photo (img with alt overlapping the 26+ badge)').not.toBeNull();
      expect(r.photo!.left).toBeGreaterThan(r.h2.right - 80);
      expect(r.photo!.top).toBeLessThan(r.readMore.bottom);
      expect(r.badge.left).toBeLessThan(r.photo!.left);
      expect(r.badge.bottom).toBeGreaterThan(r.photo!.bottom - 1);
    });
  }

  for (const width of [768, 428]) {
    test(`AB-15: intro is one column (text, then photo, badge overlapping) at ${width}`, async ({ page }) => {
      await openAbout(page, width, 1000);
      const r = await introGeometry(page);
      expect(r.photo, 'intro photo (img with alt overlapping the 26+ badge)').not.toBeNull();
      expect(r.photo!.top).toBeGreaterThanOrEqual(r.readMore.bottom - 8);
      expect(r.photo!.right).toBeLessThanOrEqual(width + 1);
    });
  }

  test('AB-16: below 1024 the header shows the hamburger; menu opens, locks scroll, traps focus, Esc closes and restores focus', async ({ page }) => {
    for (const width of [428, 768]) {
      await openAbout(page, width, 900);
      const burger = page.getByRole('button', { name: 'Open menu' });
      await expect(burger, `hamburger at ${width}`).toBeVisible();
      await burger.focus();
      await burger.click();
      const dialog = page.locator('[role="dialog"], [aria-modal="true"], dialog[open]').first();
      await expect(dialog).toBeVisible();
      const locked = await page.evaluate(() =>
        [document.documentElement, document.body].some((e) => getComputedStyle(e).overflow === 'hidden'));
      expect(locked, 'body scroll locked').toBe(true);
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press('Tab');
        const inside = await page.evaluate(() => {
          const d = document.querySelector('[role="dialog"], [aria-modal="true"], dialog[open]');
          return !!d && d.contains(document.activeElement);
        });
        expect(inside, `Tab ${i + 1} stays inside the menu at ${width}`).toBe(true);
      }
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
    }
  });

  test('AB-16: at 1280 and 1920 the nav bar shows ABOUT and no hamburger', async ({ page }) => {
    for (const width of [1280, 1920]) {
      await openAbout(page, width, 900);
      await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden();
      await expect(page.locator('header a').filter({ hasText: /^\s*ABOUT\s*$/i }).first()).toBeVisible();
    }
  });

  test('AB-17: REQUEST A FREE QUOTE reaches the quote form target; CONTACT SALES -> /en/contact', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    const quote = main(page).getByRole('link', { name: new RegExp(`^\\s*${CTA.quote}`) }).first();
    await quote.click();
    await expect(page).toHaveURL(/\/en\/?#quote$/);
    await expect(page.locator('#quote')).toBeVisible();
    // scroll-behavior is smooth: wait until the target is in the viewport and scrollY is stable
    await expect.poll(async () => {
      const y1 = await page.evaluate(() => window.scrollY);
      await page.waitForTimeout(300);
      return page.evaluate((y) => {
        const r = document.querySelector('#quote')!.getBoundingClientRect();
        return window.scrollY === y && r.top < window.innerHeight && r.bottom > 0;
      }, y1);
    }, { timeout: 10_000 }).toBe(true);
    await expect(page).toHaveURL(/\/en\/?#quote$/);
    await page.goto(ABOUT_PATH);
    await main(page).getByRole('link', { name: new RegExp(`^\\s*${CTA.sales}`) }).first().click();
    await expect(page).toHaveURL(/\/en\/contact\/?$/);
  });

  test('AB-18: Tab order follows the DOM, every stop has a visible focus ring, cards are not tab stops', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    await cardsFor(page, 'cap', capTitles);
    await cardsFor(page, 'val', valueTitles);
    await cardsFor(page, 'vm', [VISION.title, MISSION.title]);
    const cardInteractive = await page.evaluate(() => {
      const a = (window as any).__ab;
      return Array.from(document.querySelectorAll('[data-ab-card]')).reduce((n, c) => n + c.querySelectorAll(a.INTERACTIVE).length, 0);
    });
    expect(cardInteractive, 'interactive elements inside cards').toBe(0);

    const total = await page.evaluate(() => {
      const a = (window as any).__ab;
      return Array.from(document.querySelectorAll<HTMLElement>(a.INTERACTIVE)).filter((e) => a.shown(e)).length;
    });
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    const stops: { label: string; header: boolean; footer: boolean; card: boolean; ring: boolean }[] = [];
    for (let i = 0; i < Math.min(total + 8, 150); i++) {
      await page.keyboard.press('Tab');
      const s = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body || el.tagName.toLowerCase() === 'nextjs-portal') return null;
        const cs = getComputedStyle(el);
        const label = (el.getAttribute('aria-label') || el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
        return {
          label,
          header: !!el.closest('header'),
          footer: !!el.closest('footer'),
          card: !!el.closest('[data-ab-card]'),
          ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow !== 'none' && cs.boxShadow !== ''),
        };
      });
      if (s) stops.push(s);
    }
    expect(stops.length).toBeGreaterThan(5);
    expect(stops.filter((s) => s.card)).toEqual([]);
    expect(stops.filter((s) => !s.ring).map((s) => s.label), 'stops without focus ring').toEqual([]);
    const idx = (re: RegExp) => stops.findIndex((s) => !s.header && !s.footer && re.test(s.label));
    const order = [/^Explore The Services/i, /^Contact Us$/i, /^View Services/i, /^Read More/i, /^REQUEST A FREE QUOTE/i, /^CONTACT SALES/i].map(idx);
    order.forEach((n, i) => expect(n, `stop ${i} reached`).toBeGreaterThanOrEqual(0));
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThan(order[i - 1]);
    expect(stops.findIndex((s) => s.header)).toBeGreaterThanOrEqual(0);
    expect(stops.findIndex((s) => s.header)).toBeLessThan(order[0]);
    const lastFooter = stops.map((s) => s.footer).lastIndexOf(true);
    expect(lastFooter, 'footer links reached after the CTA').toBeGreaterThan(order[5]);
  });

  test('AB-19: hover on a capability card shows a navy bottom border and a larger shadow; none before hover', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    await cardsFor(page, 'cap', capTitles);
    const before = await page.evaluate(() => {
      const a = (window as any).__ab;
      return Array.from(document.querySelectorAll('[data-ab-card^="cap-"]')).map((c) => ({
        navy: a.navyBottom(c), shadow: getComputedStyle(c).boxShadow,
      }));
    });
    expect(before).toHaveLength(8);
    expect(before.filter((b) => b.navy), 'no card shows the navy bottom border before hover').toEqual([]);
    expect(new Set(before.map((b) => b.shadow)).size, 'all cards share one resting shadow').toBe(1);
    await page.locator('[data-ab-card="cap-0"]').hover();
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => {
      const a = (window as any).__ab;
      const c = document.querySelector('[data-ab-card="cap-0"]')!;
      const others = Array.from(document.querySelectorAll('[data-ab-card^="cap-"]')).slice(1).map((e) => a.navyBottom(e));
      return { navy: a.navyBottom(c), shadow: getComputedStyle(c).boxShadow, others };
    });
    expect(after.navy).toBe(true);
    expect(after.shadow).not.toBe(before[0].shadow);
    expect(after.others.filter(Boolean)).toEqual([]);
  });

  test('AB-20: no link on the page has href="#"', async ({ page }) => {
    await openAbout(page, 1920, 1080);
    const bad = await page.evaluate(() => Array.from(document.querySelectorAll('a')).filter((a) => a.getAttribute('href') === '#').map((a) => a.outerHTML.slice(0, 100)));
    expect(bad).toEqual([]);
    const empty = await page.evaluate(() => Array.from(document.querySelectorAll('a')).filter((a) => !(a.getAttribute('href') || '').trim()).length);
    expect(empty).toBe(0);
  });
});

async function introGeometry(page: Page) {
  return page.evaluate(() => {
    const a = (window as any).__ab;
    const h2 = a.leaf('End-to-End Logistics Solutions');
    const rm = Array.from(document.querySelectorAll('main a')).find((x) => (x.textContent || '').replace(/\s+/g, ' ').trim() === 'Read More')!;
    const badge = a.leaf('26+');
    const bb = badge.getBoundingClientRect();
    const photoEl = Array.from(document.querySelectorAll('main img')).find((i) => {
      const r = i.getBoundingClientRect();
      return a.shown(i) && (i.getAttribute('alt') || '').trim() !== '' && r.left < bb.right && r.right > bb.left && r.top < bb.bottom && r.bottom > bb.top;
    });
    return { h2: a.box(h2), readMore: a.box(rm), badge: a.box(badge), photo: photoEl ? a.box(photoEl) : null };
  });
}
