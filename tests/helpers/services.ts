import { expect, type Locator, type Page } from '@playwright/test';

// Helpers for the Our Service (list) and Service Detail specs. Selectors are derived from the
// spec files only (ids, data attributes and roles that the specs name); everything else is found
// by text and DOM structure so the tests do not depend on class names.

export const S5_WIDTHS = [320, 360, 375, 428, 600, 768, 900, 1024, 1180, 1280, 1366, 1440, 1536, 1920];

export const SLUGS = ['logistic-service', 'freight-forwarding', 'warehousing', 'e-commerce'] as const;

export const GROUPS = [
  { slug: 'logistic-service', title: 'Logistics Services' },
  { slug: 'freight-forwarding', title: 'Freight Forwarding' },
  { slug: 'warehousing', title: 'Ware housing services' },
  { slug: 'e-commerce', title: 'E-commerce Solutions' },
] as const;

export const TILES = [
  'Custom Clearance service',
  'Door to Door services',
  'Transport delivery services with haulage and long haul',
  'Project cargo handling',
  'Consolidation LTL services',
];

export const FREIGHT_CARDS: [string, string][] = [
  ['Air Freight Consolidation', 'High-speed global reach with priority cargo space on premium airlines and dedicated charter options for urgent payloads.'],
  ['Sea Freight (FCL & LCL)', 'Comprehensive ocean solutions from Full Container Loads to Less than Container Loads, integrated with major global carrier alliances.'],
  ['Inland & Rail Transport', 'Reliable land-based connectivity bridging ports and hinterlands via advanced trucking fleets and high-capacity rail networks.'],
];

export const STEPS: [string, string][] = [
  ['Origin', 'Step 01'],
  ['Pick Up', 'Step 02'],
  ['Main Leg', 'Transit'],
  ['Clearance', 'Step 04'],
  ['Sorting', 'Step 05'],
  ['Delivered', 'Success'],
];

export const WAREHOUSE_CELLS: [string, string][] = [
  ['Warehousing & packing services', 'Automated sorting and high-density storage for optimized picking and packing.'],
  ['Distribution center services', 'Automated sorting and high-density storage for optimized picking and packing.'],
  ['Personal Effect handling services', 'Strategically located hubs designed for high-velocity regional fulfillment.'],
  ['Container renting to store goods', 'Strategically located hubs designed for high-velocity regional fulfillment.'],
];

export const ECOM_CARDS = ['Domestic Parcel', 'Cross-Border Transport', 'Return Management', 'API Integration'];
export const LIFECYCLE = ['Automated Picking & Packing', 'Regional Hub Consolidation', 'Local Carrier Distribution', 'Final Consumer Delivery'];

export const SUCCESS = /thank|success|received|submitted|we have your/i;
export const DEADLINE = /within \d+|hours?|business days?/i;

export const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
export const squash = (s: string) => s.replace(/\s+/g, '').toLowerCase();

let n = 0;
/** A forged client IP per test so the 5-per-10-minutes limit never bleeds between tests. */
export const uniqueIp = () => `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${(++n % 250) + 1}`;

export async function noHScroll(page: Page) {
  return page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
}

/** Scrolls the whole page in steps so lazy images load, waits for them, returns to the top. */
export async function loadLazy(page: Page) {
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
}

export async function open(page: Page, url: string, width = 1920, height = 1080) {
  await page.setViewportSize({ width, height });
  const res = await page.goto(url);
  await page.waitForLoadState('networkidle');
  return res;
}

/** True when at least one match really shows: rendered, not visibility:hidden, not (nearly) transparent. */
export async function isShown(loc: Locator): Promise<boolean> {
  const n = await loc.count();
  for (let i = 0; i < n; i++) {
    const ok = await loc.nth(i).evaluate((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return false;
      const e = el as HTMLElement & { checkVisibility?: (o: object) => boolean };
      if (typeof e.checkVisibility === 'function') {
        return e.checkVisibility({ opacityProperty: true, visibilityProperty: true });
      }
      for (let x: Element | null = el; x; x = x.parentElement) {
        const cs = getComputedStyle(x);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
      }
      return true;
    });
    if (ok) return true;
  }
  return false;
}

export async function box(loc: Locator) {
  const b = await loc.first().boundingBox();
  if (!b) throw new Error('element has no bounding box');
  return b;
}

/**
 * Tags, for each title, the card that holds it: the highest ancestor of the title element that
 * contains none of the OTHER titles. Returns locators in the order of `titles`.
 */
export async function markCards(page: Page, rootSel: string | null, titles: string[], tag: string): Promise<Locator[]> {
  await page.evaluate(
    ({ rootSel, titles, tag }) => {
      const nm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
      const root = rootSel ? document.querySelector(rootSel) : document.body;
      if (!root) return;
      const skip = new Set(['SCRIPT', 'STYLE', 'OPTION', 'SELECT', 'TITLE']);
      const all = Array.from(root.querySelectorAll('*')).filter((e) => !skip.has(e.tagName));
      const deepest = (t: string) => {
        const c = all.filter(
          (e) => nm(e.textContent) === nm(t) && !Array.from(e.children).some((k) => nm(k.textContent) === nm(t)),
        );
        return c.find((e) => e.getBoundingClientRect().width > 0) ?? c[0] ?? null;
      };
      const els = titles.map(deepest);
      els.forEach((el, i) => {
        if (!el) return;
        const others = els.filter((o, j) => j !== i && o);
        let cur: Element = el;
        while (cur.parentElement && cur.parentElement !== root && !others.some((o) => cur.parentElement!.contains(o))) {
          cur = cur.parentElement;
        }
        cur.setAttribute('data-tcard', `${tag}-${i}`);
      });
    },
    { rootSel, titles, tag },
  );
  return titles.map((_, i) => page.locator(`[data-tcard="${tag}-${i}"]`));
}

/**
 * Tags the section that holds a heading: the highest ancestor of the heading that contains none of
 * the other listed headings. Headings match by case-insensitive prefix of their text.
 */
export async function markSection(page: Page, tag: string, heading: string, allHeadings: string[]): Promise<Locator> {
  await page.evaluate(
    ({ tag, heading, allHeadings }) => {
      const nm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
      const hs = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
      const find = (t: string) => hs.find((h) => nm(h.textContent).startsWith(nm(t)));
      const h = find(heading);
      if (!h) return;
      const others = allHeadings.filter((o) => o !== heading).map(find).filter((x): x is Element => !!x && x !== h);
      let cur: Element = h;
      while (cur.parentElement && cur.parentElement !== document.body && !others.some((o) => cur.parentElement!.contains(o))) {
        cur = cur.parentElement;
      }
      cur.setAttribute('data-tsec', tag);
    },
    { tag, heading, allHeadings },
  );
  return page.locator(`[data-tsec="${tag}"]`);
}

/** Tags the nearest horizontally scrollable ancestor of `card`; returns it with its snap type. */
export async function markScroller(card: Locator, tag: string) {
  return card.first().evaluate((el, tag) => {
    for (let x = el.parentElement; x; x = x.parentElement) {
      const cs = getComputedStyle(x);
      if ((cs.overflowX === 'auto' || cs.overflowX === 'scroll') && x.scrollWidth > x.clientWidth) {
        x.setAttribute('data-tscroll', tag);
        return { found: true, snap: cs.scrollSnapType, overflowX: cs.overflowX };
      }
    }
    return { found: false, snap: '', overflowX: '' };
  }, tag);
}

/** data-variant of the card or of the first descendant carrying it. */
export async function variantOf(card: Locator): Promise<string | null> {
  return card.first().evaluate((el) => {
    const v = el.matches('[data-variant]') ? el : el.querySelector('[data-variant]') ?? el.closest('[data-variant]');
    return v ? v.getAttribute('data-variant') : null;
  });
}

export async function textOf(loc: Locator): Promise<string> {
  return (await loc.first().evaluate((el) => el.textContent ?? '')) as string;
}

export type Def = { name: string; sel: string; re?: string; flags?: string };

/** Each section is the first match that sits below the previous one (see tests/e2e/home.spec.ts). */
export async function sectionTops(page: Page, defs: Def[]) {
  return page.evaluate((defs) => {
    const out: { name: string; top: number | null }[] = [];
    let prev = -Infinity;
    for (const d of defs) {
      const rx = d.re ? new RegExp(d.re, d.flags) : null;
      const cands = Array.from(document.querySelectorAll<HTMLElement>(d.sel))
        .filter((el) => !rx || rx.test((el.textContent || '').replace(/\s+/g, ' ')))
        .map((el) => el.getBoundingClientRect().top + window.scrollY)
        .filter((t) => t > prev || d.name === 'header')
        .sort((x, y) => x - y);
      const top = cands.length ? cands[0] : null;
      out.push({ name: d.name, top });
      if (top !== null) prev = top;
    }
    return out;
  }, defs);
}

export function expectInOrder(tops: { name: string; top: number | null }[]) {
  for (const t of tops) expect(t.top, `section "${t.name}" not found in order`).not.toBeNull();
  const ys = tops.map((t) => t.top as number);
  for (let i = 1; i < ys.length; i++) {
    expect(ys[i], `"${tops[i].name}" must be below "${tops[i - 1].name}"`).toBeGreaterThan(ys[i - 1]);
  }
}

/** Tags visible, non-honeypot interactive elements with data-kb-id; returns the count. */
export async function markInteractive(page: Page): Promise<number> {
  return page.evaluate(() => {
    const sel = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"]';
    let k = 0;
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      if ((el as HTMLInputElement).name === 'website') continue;
      if (el.closest('nextjs-portal')) continue; // Next dev tools (dev only)
      if ((el as HTMLInputElement).disabled || (el as HTMLInputElement).type === 'hidden') continue;
      if (el.getAttribute('tabindex') === '-1') continue;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (r.width <= 1 || r.height <= 1 || cs.visibility === 'hidden' || cs.display === 'none') continue;
      el.dataset.kbId = String(k++);
    }
    return k;
  });
}

/** Presses Tab through the page; returns, per tagged id, whether it was reached and had a ring, and the visit order. */
export async function tabThrough(page: Page, total: number) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  const seen = new Map<string, boolean>();
  const order: number[] = [];
  for (let i = 0; i < total + 6; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      const shadow = cs.boxShadow !== 'none' && cs.boxShadow !== '';
      return { id: el.dataset.kbId ?? null, visible: outline || shadow };
    });
    if (info?.id) {
      if (seen.has(info.id)) break; // focus wrapped around: stop, do not record the tail
      seen.set(info.id, (seen.get(info.id) ?? true) && info.visible);
      order.push(Number(info.id));
    }
  }
  return { seen, order };
}

/** Every `a[href]` on the page, as written in the DOM attribute. */
export async function allHrefs(page: Page): Promise<string[]> {
  return page.evaluate(() => Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href') ?? ''));
}

/** Headings (h1..h6) with empty text. */
export async function emptyHeadings(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
      .filter((h) => (h.textContent ?? '').replace(/\s+/g, '') === '')
      .map((h) => h.outerHTML.slice(0, 80)),
  );
}

/** Fills a labelled control inside `scope`; selects pick option index 1 (first real option). */
export async function setField(scope: Locator, label: RegExp, value: string) {
  const f = scope.getByLabel(label).first();
  const tag = await f.evaluate((e) => e.tagName.toLowerCase());
  if (tag === 'select') await f.selectOption({ index: 1 });
  else await f.fill(value);
}

export const QL = {
  first: /first name/i,
  last: /last name/i,
  email: /(corporate )?email/i,
  phone: /phone/i,
  type: /service type/i,
  volume: /estimated volume/i,
  brief: /project brief/i,
};

export const validQuote = { first: 'An', last: 'Nguyen', email: 'an@example.com', phone: '0901234567' };

export async function fillQuote(scope: Locator, over: Partial<typeof validQuote> = {}) {
  const v = { ...validQuote, ...over };
  await setField(scope, QL.first, v.first);
  await setField(scope, QL.last, v.last);
  await setField(scope, QL.email, v.email);
  await setField(scope, QL.phone, v.phone);
}

/**
 * Tags the smallest ancestor of the element whose text equals `anchor` (case-insensitive, exact)
 * that also contains every text in `texts` (as exact element text) and, if given, a `sel` match.
 */
export async function markAround(
  page: Page,
  anchor: string,
  tag: string,
  o: { texts?: string[]; sel?: string } = {},
): Promise<Locator> {
  await page.evaluate(
    ({ anchor, tag, o }) => {
      const nm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
      const skip = new Set(['SCRIPT', 'STYLE', 'OPTION', 'TITLE']);
      const all = Array.from(document.body.querySelectorAll('*')).filter((e) => !skip.has(e.tagName));
      const has = (root: Element, t: string) => Array.from(root.querySelectorAll('*')).some((e) => nm(e.textContent) === nm(t));
      const a = all.find((e) => nm(e.textContent) === nm(anchor) && !Array.from(e.children).some((k) => nm(k.textContent) === nm(anchor)));
      if (!a) return;
      let cur: Element | null = a;
      while (cur && cur !== document.body) {
        const okTexts = (o.texts ?? []).every((t) => has(cur as Element, t));
        const okSel = o.sel ? cur.querySelector(o.sel) !== null : true;
        if (okTexts && okSel) {
          cur.setAttribute('data-tarea', tag);
          return;
        }
        cur = cur.parentElement;
      }
    },
    { anchor, tag, o },
  );
  return page.locator(`[data-tarea="${tag}"]`);
}
