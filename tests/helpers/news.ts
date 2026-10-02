import { expect, type Page, type Response } from '@playwright/test';

// ---- Verbatim values from docs/pages/news.md and docs/pages/news-article.md ----
export const FEATURED = {
  slug: 'implementing-ai-driven-predictive-routing',
  title: 'Implementing AI-Driven Predictive Routing for Trans-Pacific Corridors',
  category: 'Innovation',
  excerpt:
    'Saigontrans announces the full integration of artificial intelligence across its Pacific shipping routes, aiming to reduce transit times by up to 18% while optimizing fuel consumption for a greener fleet. This landmark shift represents a new era in precision logistics management.',
};
export const ROWS = [
  { slug: 'opening-new-strategic-hub-singapore', title: 'Opening Our New Strategic Hub in Singapore', category: 'NETWORK EXPANSION', date: 'April 28, 2024' },
  { slug: 'quarterly-market-outlook-supply-volatility', title: 'Quarterly Market Outlook: Navigating Supply Volatility', category: 'GLOBAL SUPPLY', date: 'April 12, 2024' },
  { slug: 'blockchain-transparent-bill-of-lading', title: 'Blockchain for Transparent Bill of Lading', category: 'INNOVATION', date: 'March 30, 2024' },
];
export const INSIGHTS = [
  { slug: 'vietnam-logistics-digital-shift', title: 'Vietnam’s Logistics Industry: From Traditional Supply Chains to a Full-Scale Digital Shift', author: 'Quang Ng' },
  { slug: 'logistics-turning-point', title: 'Vietnam Logistics at the Turning Point: Great Opportunities Amid Growing Pressures', author: 'KD Duong' },
  { slug: 'talent-shortage', title: 'Talent Shortage: The Biggest Bottleneck in Vietnam’s Logistics Growth', author: 'Henry Tran' },
];
export const SIDEBAR_CATEGORIES = ['Global Supply', 'Innovation', 'Network Updates', 'Sustainability'];
export const SIDEBAR_TAGS = ['FREIGHT', 'BLOCKCHAIN', 'ASIA-PACIFIC', 'GREEN-LOGISTICS', 'WAREHOUSING'];
export const WHITE_PAPER = 'Annual Logistics White Paper 2024';
export const ALL_WIDTHS = [320, 360, 375, 428, 600, 768, 900, 1024, 1180, 1280, 1366, 1440, 1536, 1920];
export const HEIGHT_FOR = (w: number) => (w >= 1280 ? 1080 : w >= 768 ? 1024 : 900);

export const ARTICLE_SLUG = FEATURED.slug;
export const ARTICLE = {
  lead: 'Global trade is navigating',
  h2a: 'The Kinetic Architect Strategy',
  p1: 'The modern logistician',
  featureTitle: 'Real-Time Transit Efficiency',
  stats: [['99.8%', 'ON-TIME RATE'], ['12k', 'ACTIVE UNITS']],
  h2b: 'Sustainable Logistics: The New Standard',
  p2: 'The future of logistics is green',
  quote: '"Sustainability is no longer',
  p3: 'Through asymmetrical growth',
  tags: ['FUTURE TECH', 'SUPPLY CHAIN', 'GREEN LOGISTICS', 'SUSTAINABILITY'],
};

// ---- Navigation helpers ----
export async function open(page: Page, url: string, width = 1920): Promise<Response | null> {
  await page.setViewportSize({ width, height: HEIGHT_FOR(width) });
  const res = await page.goto(url);
  await page.waitForLoadState('networkidle');
  return res;
}

/** Scroll in steps so lazy images load, then wait for every image (bounded), back to top. */
export async function settle(page: Page): Promise<void> {
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
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
              setTimeout(resolve, 5000);
            }),
      ),
    );
    window.scrollTo(0, 0);
  });
}

export async function expectNoHScroll(page: Page, label = ''): Promise<void> {
  const { sw, cw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  expect(sw, `scrollWidth ${sw} > clientWidth ${cw} ${label}`).toBeLessThanOrEqual(cw);
}

/** Top (document y) and rect of the first leaf element whose textContent matches the regex. */
export async function findText(
  page: Page,
  re: RegExp,
  opts: { after?: number; before?: number; skipHeader?: boolean } = {},
): Promise<{ top: number; bottom: number; left: number; right: number; tag: string } | null> {
  return page.evaluate(
    ({ src, flags, after, before }) => {
      const rx = new RegExp(src, flags);
      const all = Array.from(document.body.querySelectorAll<HTMLElement>('*'));
      const hits = all.filter((el) => {
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) return false;
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (!rx.test(t)) return false;
        return !Array.from(el.children).some((c) => rx.test((c.textContent || '').replace(/\s+/g, ' ').trim()));
      });
      const out = hits
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left + scrollX, right: r.right + scrollX, tag: el.tagName.toLowerCase(), w: r.width, h: r.height };
        })
        .filter((r) => r.w > 0 && r.h > 0 && (after === undefined || r.top > after) && (before === undefined || r.top < before))
        .sort((a, b) => a.top - b.top);
      return out[0] ?? null;
    },
    { src: re.source, flags: re.flags, after: opts.after, before: opts.before },
  );
}

/** Document y of the single h1 (hero 2 on the list: below the list area). */
export async function h1Top(page: Page): Promise<number> {
  return page.evaluate(() => {
    const h = document.querySelector('h1');
    return h ? h.getBoundingClientRect().top + scrollY : -1;
  });
}

export type Listed = { slug: string; title: string; top: number; left: number; imgTop: number | null; imgLeft: number | null; imgWidth: number | null; imgBottom: number | null };

/** Articles listed in the main column of the list (links to /en/news/<slug> above the h1 of hero 2). */
export async function listedArticles(page: Page): Promise<Listed[]> {
  return page.evaluate((): Listed[] => {
    const h1 = document.querySelector('h1');
    const limit = h1 ? h1.getBoundingClientRect().top + scrollY : Infinity;
    const bySlug = new Map<string, Record<string, any>>(); // eslint-disable-line @typescript-eslint/no-explicit-any
    for (const a of Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
      const m = /^\/en\/news\/([^/?#]+)$/.exec(a.getAttribute('href') || '');
      if (!m) continue;
      const r = a.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.top + scrollY >= limit) continue;
      const cur = bySlug.get(m[1]) ?? { slug: m[1], title: '', top: Infinity, left: Infinity, imgTop: null, imgLeft: null, imgWidth: null, imgBottom: null };
      const text = (a.textContent || '').replace(/\s+/g, ' ').trim();
      if (text.length > cur.title.length && !/^(read full article|continue)$/i.test(text)) cur.title = text;
      const img = a.querySelector('img');
      if (img) {
        const ir = img.getBoundingClientRect();
        cur.imgTop = ir.top + scrollY; cur.imgLeft = ir.left + scrollX; cur.imgWidth = ir.width; cur.imgBottom = ir.bottom + scrollY;
      } else if (text && !/^(read full article|continue)/i.test(text)) {
        cur.top = Math.min(cur.top, r.top + scrollY); cur.left = Math.min(cur.left, r.left + scrollX);
      }
      bySlug.set(m[1], cur);
    }
    return (Array.from(bySlug.values()) as Listed[]).sort((x, y) => (x.top === y.top ? 0 : x.top - y.top)).map((x) => ({ ...x, top: x.top === Infinity ? x.imgTop ?? 0 : x.top, left: x.left === Infinity ? x.imgLeft ?? 0 : x.left }));
  });
}

export const listedSlugs = async (page: Page) => (await listedArticles(page)).map((a) => a.slug);

/** Industry Insights / related cards: unique /en/news/<slug> links below the h1 (until the CTA/footer). */
export async function insightSlugs(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const limit = h1 ? h1.getBoundingClientRect().top + scrollY : -1;
    const out: string[] = [];
    for (const a of Array.from(document.querySelectorAll<HTMLAnchorElement>('main a[href]'))) {
      const m = /^\/en\/news\/([^/?#]+)$/.exec(a.getAttribute('href') || '');
      if (!m) continue;
      const r = a.getBoundingClientRect();
      if (r.width === 0 || r.top + scrollY <= limit) continue;
      if (!out.includes(m[1])) out.push(m[1]);
    }
    return out;
  });
}

export type Pager = {
  labels: string[];
  current: string | null;
  hrefs: Record<string, string | null>;
  prev: { tag: string; href: string | null; disabled: boolean } | null;
  next: { tag: string; href: string | null; disabled: boolean } | null;
};

/** Reads the pagination: zero padded numbers (01, 02, ...), PREVIOUS and NEXT. */
export async function pager(page: Page): Promise<Pager> {
  return page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const limit = h1 ? h1.getBoundingClientRect().top + scrollY : Infinity;
    const leafIn = (root: ParentNode, rx: RegExp) =>
      Array.from(root.querySelectorAll<HTMLElement>('*')).filter((el) => {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        const r = el.getBoundingClientRect();
        return rx.test(t) && r.width > 0 && r.top + scrollY < limit && !Array.from(el.children).some((c) => rx.test((c.textContent || '').replace(/\s+/g, ' ').trim()));
      });
    const info = (el: HTMLElement | undefined) => {
      if (!el) return null;
      const host = el.closest<HTMLElement>('a,button,[aria-disabled]') ?? el;
      const disabled = host.getAttribute('aria-disabled') === 'true' || el.getAttribute('aria-disabled') === 'true' || (host as HTMLButtonElement).disabled === true;
      return { tag: host.tagName.toLowerCase(), href: host.tagName === 'A' ? host.getAttribute('href') : null, disabled };
    };
    const main = document.querySelector('main') ?? document.body;
    const prevEl = leafIn(main, /^previous$/i)[0];
    const nextEl = leafIn(main, /^next$/i)[0];
    // The pagination control: nearest common ancestor of PREVIOUS and NEXT (sidebar counts are outside it).
    let control: HTMLElement | null = (prevEl ?? nextEl) ?? null;
    while (control && (!control.contains(prevEl ?? control) || !control.contains(nextEl ?? control))) control = control.parentElement;
    const labels: string[] = [];
    const hrefs: Record<string, string | null> = {};
    let current: string | null = null;
    if (control) {
      for (const el of leafIn(control, /^\d{2}$/)) {
        const label = (el.textContent || '').trim();
        if (labels.includes(label)) continue;
        labels.push(label);
        const host = el.closest<HTMLElement>('a,[aria-current]') ?? el;
        hrefs[label] = host.tagName === 'A' ? host.getAttribute('href') : null;
        if (host.getAttribute('aria-current') === 'page' || el.getAttribute('aria-current') === 'page') current = label;
      }
    }
    return { labels, current, hrefs, prev: info(prevEl), next: info(nextEl) };
  });
}

/** Walks every result page of `query` ("" or "?q=x") and returns all listed slugs (unique, in order). */
export async function allListedSlugs(page: Page, query: string, width = 1920): Promise<string[]> {
  const seen: string[] = [];
  for (let p = 1; p <= 30; p++) {
    const sep = query ? `${query}&` : '?';
    await open(page, p === 1 ? `/en/news${query}` : `/en/news${sep}page=${p}`, width);
    for (const s of await listedSlugs(page)) if (!seen.includes(s)) seen.push(s);
    const pg = await pager(page);
    if (!pg.next || pg.next.disabled) break;
  }
  return seen;
}

/** Text of the card around the link to `slug`: first ancestor whose text matches `marker`. */
export async function cardText(page: Page, slug: string, marker: RegExp): Promise<string> {
  return page.evaluate(
    ({ slug, src, flags }) => {
      const rx = new RegExp(src, flags);
      const a = document.querySelector(`a[href="/en/news/${slug}"]`);
      let el: HTMLElement | null = a as HTMLElement | null;
      while (el && el !== document.body) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (rx.test(t)) return t;
        el = el.parentElement;
      }
      return '';
    },
    { slug, src: marker.source, flags: marker.flags },
  );
}

export type Focus = { tag: string; href: string | null; type: string | null; name: string | null; ring: boolean; inBreadcrumb: boolean; text: string };

/** Presses Tab `n` times from the top and records each focused element. */
export async function tabSequence(page: Page, n: number): Promise<Focus[]> {
  await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); window.scrollTo(0, 0); });
  const out: Focus[] = [];
  for (let i = 0; i < n; i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body || el.tagName.toLowerCase() === 'nextjs-portal') return null;
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        href: el.getAttribute('href'),
        type: el.getAttribute('type'),
        name: el.getAttribute('name'),
        ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow !== 'none' && cs.boxShadow !== ''),
        inBreadcrumb: !!el.closest('[aria-label="Breadcrumb"], [aria-label="breadcrumb"], nav ol'),
        text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      };
    });
    if (f) out.push(f);
  }
  return out;
}

/** Index of each predicate in order (subsequence match); returns -1 entries for missing ones. */
export function subsequence(seq: Focus[], preds: ((f: Focus) => boolean)[]): number[] {
  const idx: number[] = [];
  let from = 0;
  for (const p of preds) {
    const i = seq.findIndex((f, k) => k >= from && p(f));
    idx.push(i);
    if (i >= 0) from = i + 1;
  }
  return idx;
}

/** Collects hostnames of all requests made while `fn` runs. */
export async function collectHosts(page: Page, fn: () => Promise<void>): Promise<string[]> {
  const hosts = new Set<string>();
  const onReq = (req: { url(): string }) => {
    const u = req.url();
    if (u.startsWith('data:') || u.startsWith('blob:')) return;
    hosts.add(new URL(u).hostname);
  };
  page.on('request', onReq);
  try { await fn(); } finally { page.off('request', onReq); }
  return [...hosts];
}

/** Elements whose right edge exceeds the viewport and that are not clipped by a scroll/overflow ancestor. */
export async function overflowOffenders(page: Page, selector: string): Promise<string[]> {
  return page.evaluate((sel) => {
    const vw = document.documentElement.clientWidth;
    const bad: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.right <= vw + 1) continue;
      let clipped = false;
      for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (['auto', 'scroll', 'hidden', 'clip'].includes(ox)) { clipped = true; break; }
      }
      if (!clipped) bad.push(`${el.tagName.toLowerCase()}: ${(el.textContent || '').trim().slice(0, 40)}`);
    }
    return bad;
  }, selector);
}

export const hamburger = (page: Page) => page.getByRole('button', { name: /open menu/i });
