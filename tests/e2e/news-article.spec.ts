import { test, expect, type Page } from '@playwright/test';
import {
  FEATURED, INSIGHTS, SIDEBAR_CATEGORIES, SIDEBAR_TAGS, WHITE_PAPER, ARTICLE, ARTICLE_SLUG, ALL_WIDTHS,
  open, settle, expectNoHScroll, findText, insightSlugs, allListedSlugs, tabSequence, subsequence,
  overflowOffenders, hamburger,
} from '../helpers/news';

const URL_ARTICLE = `/en/news/${ARTICLE_SLUG}`;
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
const searchInput = (page: Page) => page.getByPlaceholder('Search articles...').first();
const categoryLink = (page: Page, name: string) =>
  page.locator('a[href*="category="]').filter({ hasText: new RegExp(`^\\s*${name}\\s*\\d+\\s*$`, 'i') }).first();
const escapeRx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function sidebarLeft(page: Page): Promise<number> {
  return (await findText(page, /^SEARCH INSIGHTS$/i))!.left;
}

test.describe('News Article: document and structure', () => {
  test('NA-1: 200, lang en, single h1 equal to the title (case-insensitive), document.title contains the title', async ({ page }) => {
    const res = await open(page, URL_ARTICLE);
    expect(res?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveCount(1);
    expect(norm(await page.locator('h1').innerText()).toLowerCase()).toBe(FEATURED.title.toLowerCase());
    expect((await page.title()).toLowerCase()).toContain(FEATURED.title.toLowerCase());
  });

  test('NA-2: unknown slug gives 404 and the 404 page', async ({ page }) => {
    const res = await open(page, '/en/news/does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.locator('body')).toContainText(/404|not found/i);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(norm(await page.locator('h1').innerText()).toLowerCase()).not.toContain('implementing');
  });

  test('NA-2: a slug that is markup is also a 404 and is not reflected as HTML', async ({ page }) => {
    const dialogs: string[] = [];
    page.on('dialog', async (d) => { dialogs.push(d.message()); await d.dismiss(); });
    const res = await open(page, `/en/news/${encodeURIComponent('<script>alert(1)</script>')}`);
    expect(res?.status()).toBe(404);
    expect(dialogs).toEqual([]);
    await expect(page.locator('main script')).toHaveCount(0);
  });

  test('NA-4: meta description is the excerpt, og tags and canonical', async ({ page, request }) => {
    await open(page, URL_ARTICLE);
    const meta = (sel: string) => page.locator(sel).first().getAttribute('content');
    // The record excerpt is defined by the News list spec (featured card), see report: ambiguity vs OQ-9.
    expect(await meta('meta[name="description"]')).toBe(FEATURED.excerpt);
    expect(await meta('meta[property="og:description"]')).toBe(FEATURED.excerpt);
    expect((await meta('meta[property="og:title"]'))?.toLowerCase()).toContain(FEATURED.title.toLowerCase());
    expect(await meta('meta[property="og:type"]')).toBe('article');
    expect(await meta('meta[property="article:published_time"]')).toMatch(/^2024-05-15/);
    const og = await meta('meta[property="og:image"]');
    expect(og, 'og:image present').toBeTruthy();
    const img = await request.get(new URL(og!, 'http://localhost:3000').toString());
    expect(img.status()).toBe(200);
    expect(img.headers()['content-type']).toMatch(/^image\//);
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toMatch(new RegExp(`/en/news/${ARTICLE_SLUG}$`));
  });

  test('NA-5: order header, hero+breadcrumb, cover, body, tags, sidebar right, Industry Insights, CTA, footer; no Partners/quote form', async ({ page }) => {
    await open(page, URL_ARTICLE);
    const top = async (re: RegExp, after?: number) => (await findText(page, re, { after }))?.top;
    const h1 = await page.locator('h1').evaluate((e) => e.getBoundingClientRect().top + scrollY);
    const cover = await page.evaluate((t) => {
      const i = Array.from(document.querySelectorAll('main img')).find((x) => (x.getAttribute('alt') || '').toLowerCase() === t.toLowerCase());
      return i ? i.getBoundingClientRect().top + scrollY : null;
    }, FEATURED.title);
    const seq: [string, number | null | undefined][] = [
      ['header', await top(/^HOME$/i, -1)],
      ['hero h1', h1],
      ['breadcrumb', (await findText(page, /^NEWS DETAIL$/i))?.top],
      ['cover', cover],
      ['lead', (await findText(page, new RegExp(`^${ARTICLE.lead}`)))?.top],
      ['tags', (await findText(page, /^SUPPLY CHAIN$/i, { after: 600 }))?.top],
      ['insights', (await findText(page, /^Industry Insights$/i))?.top],
      ['cta', (await findText(page, /READY TO OPTIMI[SZ]E YOUR SUPPLY CHAIN/i))?.top],
      ['footer', await page.evaluate(() => document.querySelector('footer')!.getBoundingClientRect().top + scrollY)],
    ];
    for (const [n, y] of seq) expect(y, n).toBeDefined();
    for (const [n, y] of seq) expect(y, `${n} found`).not.toBeNull();
    for (let i = 2; i < seq.length; i++) expect(seq[i][1]!, `${seq[i][0]} below ${seq[i - 1][0]}`).toBeGreaterThan(seq[i - 1][1]!);
    const lead = await findText(page, new RegExp(`^${ARTICLE.lead}`));
    expect(await sidebarLeft(page)).toBeGreaterThan(lead!.right - 5);
    await expect(page.getByRole('heading', { name: /partners\s*(and|&)\s*clients/i })).toHaveCount(0);
    await expect(page.locator('main input[type="email"], main input[name="email"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /request a quote/i })).toHaveCount(0);
  });

  test('NA-6: breadcrumb HOME, NEWS, NEWS DETAIL with links and current page', async ({ page }) => {
    await open(page, URL_ARTICLE);
    const nav = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(nav).toBeVisible();
    const items = nav.locator('ol > li');
    expect((await items.allInnerTexts()).map((t) => norm(t).toUpperCase())).toEqual(['HOME', 'NEWS', 'NEWS DETAIL']);
    await expect(nav.getByRole('link', { name: 'HOME', exact: false })).toHaveAttribute('href', '/en');
    await expect(nav.locator('a', { hasText: /^\s*NEWS\s*$/i })).toHaveAttribute('href', '/en/news');
    await expect(nav.locator('a', { hasText: /news detail/i })).toHaveCount(0);
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
    expect(norm(await nav.locator('[aria-current="page"]').innerText()).toUpperCase()).toBe('NEWS DETAIL');
  });

  test('NA-7: header NEWS is current, HOME is not', async ({ page }) => {
    await open(page, URL_ARTICLE);
    const current = page.locator('header a[aria-current="page"]');
    await expect(current).toHaveCount(1);
    expect(norm(await current.innerText()).toUpperCase()).toBe('NEWS');
    await expect(page.locator('header a', { hasText: /^\s*HOME\s*$/i }).first()).not.toHaveAttribute('aria-current', 'page');
  });
});

test.describe('News Article: body', () => {
  test('NA-8: body blocks appear in the specified order with the right content', async ({ page }) => {
    await open(page, URL_ARTICLE);
    const y = async (re: RegExp) => (await findText(page, re))?.top;
    const order: [string, number | undefined][] = [
      ['lead', await y(new RegExp(`^${ARTICLE.lead}`))],
      ['h2a', await y(new RegExp(`^${ARTICLE.h2a}$`))],
      ['p1', await y(new RegExp(`^${ARTICLE.p1}`))],
      ['feature', await y(new RegExp(`^${ARTICLE.featureTitle}$`))],
      ['h2b', await y(new RegExp(`^${ARTICLE.h2b}$`))],
      ['p2', await y(new RegExp(`^${ARTICLE.p2}`))],
      ['quote', await y(new RegExp(`^${escapeRx(ARTICLE.quote)}`))],
      ['p3', await y(new RegExp(`^${ARTICLE.p3}`))],
    ];
    for (const [n, v] of order) expect(v, n).toBeDefined();
    for (let i = 1; i < order.length; i++) expect(order[i][1]!, `${order[i][0]} after ${order[i - 1][0]}`).toBeGreaterThan(order[i - 1][1]!);
    const featureTop = order[3][1]!;
    const nextTop = order[4][1]!;
    for (const [value, label] of ARTICLE.stats) {
      const v = await findText(page, new RegExp(`^${escapeRx(value)}$`), { after: featureTop - 5, before: nextTop });
      const l = await findText(page, new RegExp(`^${escapeRx(label)}$`, 'i'), { after: featureTop - 5, before: nextTop });
      expect(v, value).not.toBeNull();
      expect(l, label).not.toBeNull();
    }
    expect(await findText(page, /Our latest fleet of autonomous cargo carriers has improved delivery precision by 22%/, { after: featureTop - 5, before: nextTop })).not.toBeNull();
    // design typo kept verbatim
    await expect(page.getByText('solarintegrated warehousing')).toHaveCount(1);
  });

  test('NA-9: headings are h2, the quote is a blockquote, body text is rendered as text', async ({ page }) => {
    await open(page, URL_ARTICLE);
    await expect(page.locator('h2', { hasText: new RegExp(`^\\s*${ARTICLE.h2a}\\s*$`) })).toHaveCount(1);
    await expect(page.locator('h2', { hasText: new RegExp(`^\\s*${ARTICLE.h2b}\\s*$`) })).toHaveCount(1);
    const bq = page.locator('blockquote');
    await expect(bq).toHaveCount(1);
    expect(norm(await bq.innerText())).toMatch(/^"Sustainability is no longer/);
    await expect(page.locator('main script, article script')).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
    // no raw element injected from text: nothing in the body should be an unknown inline event handler
    expect(await page.locator('[onerror], [onload], [onclick]').count()).toBe(0);
  });

  test('NA-10: no javascript: hrefs; external body links (if any) are noopener and open in a new tab', async ({ page }) => {
    await open(page, URL_ARTICLE);
    const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map((a) => ({ href: a.getAttribute('href') || '', target: a.target, rel: a.rel })));
    for (const l of links) expect(l.href.toLowerCase().trim()).not.toMatch(/^(javascript|data|vbscript):/);
    for (const l of links.filter((x) => /^https?:/.test(x.href) && !x.href.includes('localhost'))) {
      if (l.target === '_blank') expect(l.rel).toMatch(/noopener/);
    }
  });

  test('NA-11: article tags in order link to /en/news?tag=<slug>; SUPPLY CHAIN -> ?tag=supply-chain', async ({ page }) => {
    await open(page, URL_ARTICLE);
    const tags = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="tag="]')).slice(0, 4).map((a) => (a.textContent || '').trim().toUpperCase()));
    expect(tags).toEqual(ARTICLE.tags);
    const chip = page.locator('a[href*="tag="]').filter({ hasText: /^\s*supply chain\s*$/i });
    await expect(chip).toHaveAttribute('href', '/en/news?tag=supply-chain');
    await chip.click();
    await expect(page).toHaveURL(/\/en\/news\?tag=supply-chain$/);
  });
});

test.describe('News Article: sidebar', () => {
  test('NA-12: widget titles and order Search, Categories, Promo (if shown), Trending Tags', async ({ page }) => {
    await open(page, URL_ARTICLE);
    const ySearch = (await findText(page, /^SEARCH INSIGHTS$/i))?.top;
    const yCat = (await findText(page, /^CATEGORIES$/i))?.top;
    const yTags = (await findText(page, /^TRENDING TAGS$/i))?.top;
    for (const v of [ySearch, yCat, yTags]) expect(v).toBeDefined();
    expect(yCat!).toBeGreaterThan(ySearch!);
    expect(yTags!).toBeGreaterThan(yCat!);
    const promo = await findText(page, new RegExp(`^${WHITE_PAPER}$`, 'i'));
    // OQ-8 / build guide: the promo card is either hidden (no file) or shown as a disabled button; when shown it sits between Categories and Trending Tags.
    if (promo) {
      expect(promo.top).toBeGreaterThan(yCat!);
      expect(promo.top).toBeLessThan(yTags!);
    }
  });

  test('NA-13: search "routing" -> /en/news?q=routing; empty submit -> /en/news', async ({ page }) => {
    await open(page, URL_ARTICLE);
    await searchInput(page).fill('routing');
    await searchInput(page).press('Enter');
    await expect(page).toHaveURL(/\/en\/news\?q=routing$/);
    await open(page, URL_ARTICLE);
    await searchInput(page).fill('');
    await searchInput(page).press('Enter');
    await expect(page).toHaveURL(/\/en\/news$/);
    await open(page, URL_ARTICLE);
    await searchInput(page).fill('routing');
    await page.getByRole('button', { name: 'Search' }).first().click();
    await expect(page).toHaveURL(/\/en\/news\?q=routing$/);
  });

  test('NA-14: categories list with computed 2-digit counts; Innovation -> ?category=innovation', async ({ page }) => {
    await open(page, URL_ARTICLE);
    const counts: Record<string, number> = {};
    for (const c of SIDEBAR_CATEGORIES) {
      const link = categoryLink(page, c);
      await expect(link, c).toBeVisible();
      const m = norm(await link.innerText()).match(/(\d+)$/);
      expect(m, c).not.toBeNull();
      expect(m![1]).toMatch(/^\d{2,}$/);
      counts[c] = Number(m![1]);
    }
    const slug = (c: string) => c.toLowerCase().replace(/\s+/g, '-');
    for (const c of SIDEBAR_CATEGORIES) {
      const slugs = await allListedSlugs(page, `?category=${slug(c)}`);
      expect(slugs.length, `count of ${c}`).toBe(counts[c]);
    }
    await open(page, URL_ARTICLE);
    await categoryLink(page, 'Innovation').click();
    await expect(page).toHaveURL(/\/en\/news\?category=innovation$/);
  });

  test('NA-15: trending tags in order; FREIGHT -> ?tag=freight', async ({ page }) => {
    await open(page, URL_ARTICLE);
    const title = (await findText(page, /^TRENDING TAGS$/i))!;
    // scope to the widget: chips below its title and not left of it (the article's own tag chips are in the article column)
    const chips = await page.evaluate(({ top, left }) =>
      Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="tag="]')).filter((a) => { const r = a.getBoundingClientRect(); return r.top + scrollY > top && r.left + scrollX >= left - 40; }).map((a) => (a.textContent || '').trim().toUpperCase()), { top: title.top, left: title.left });
    expect(chips).toEqual(SIDEBAR_TAGS);
    await page.locator('a[href="/en/news?tag=freight"]').click();
    await expect(page).toHaveURL(/\/en\/news\?tag=freight$/);
  });

  test('NA-16: the promo has no file: no DOWNLOAD PDF link; if the card is shown it is a disabled button, never "#"', async ({ page }) => {
    await open(page, URL_ARTICLE);
    await expect(page.locator('a[href="#"]')).toHaveCount(0);
    await expect(page.locator('a', { hasText: /download pdf/i })).toHaveCount(0);
    const buttons = page.locator('button', { hasText: /download pdf/i });
    for (let i = 0; i < (await buttons.count()); i++) await expect(buttons.nth(i)).toHaveAttribute('aria-disabled', 'true');
    // the spec text must never be a link target to the asset (no file exists)
    await expect(page.locator('a[download]')).toHaveCount(0);
  });
});

test.describe('News Article: related posts, CTA, links', () => {
  test('NA-17: Industry Insights: eyebrow, h2, exactly 3 cards, not the current article, newest first', async ({ page }) => {
    await open(page, URL_ARTICLE);
    await settle(page);
    await expect(page.getByText('Latest Briefings', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Industry Insights' })).toBeVisible();
    const slugs = await insightSlugs(page);
    expect(slugs).toHaveLength(3);
    expect(slugs).not.toContain(ARTICLE_SLUG);
    expect(slugs).toEqual(INSIGHTS.map((i) => i.slug));
    for (const i of INSIGHTS) {
      const text = await page.evaluate((slug) => {
        const links = Array.from(document.querySelectorAll(`a[href="/en/news/${slug}"]`));
        const a = links.find((l) => /read more/i.test(l.textContent || '')) ?? links[links.length - 1];
        let el = a as HTMLElement | null;
        while (el && el !== document.body) {
          const t = (el.textContent || '').replace(/\s+/g, ' ');
          if (/comments\s*\(\d+\)/i.test(t) && /read more/i.test(t)) return t;
          el = el.parentElement;
        }
        return '';
      }, i.slug);
      expect(text, i.slug).toContain(i.title);
      expect(text).toContain(i.author);
      expect(text).toMatch(/Comments \(\d{2,}\)/);
      expect(text).toMatch(/Read More/i);
      const img = page.locator(`a[href="/en/news/${i.slug}"] img`).first();
      expect(((await img.getAttribute('alt')) ?? '').trim().length).toBeGreaterThan(0);
      expect(await img.evaluate((e: HTMLImageElement) => e.naturalWidth)).toBeGreaterThan(0);
    }
  });

  test('NA-18: a related card title and Read More open /en/news/<slug> and render the article', async ({ page }) => {
    const first = INSIGHTS[0];
    await open(page, URL_ARTICLE);
    await page.locator(`a[href="/en/news/${first.slug}"]`, { hasText: first.title }).first().click();
    await expect(page).toHaveURL(new RegExp(`/en/news/${first.slug}$`));
    await expect(page.locator('h1')).toHaveCount(1);
    await open(page, URL_ARTICLE);
    await page.locator(`a[href="/en/news/${INSIGHTS[1].slug}"]`, { hasText: /read more/i }).first().click();
    await expect(page).toHaveURL(new RegExp(`/en/news/${INSIGHTS[1].slug}$`));
    expect((await page.request.get(`/en/news/${INSIGHTS[1].slug}`)).status()).toBe(200);
  });

  test('NA-19: CONTACT SALES -> /en/contact; REQUEST A FREE QUOTE -> /en#quote shows the quote form', async ({ page }) => {
    await open(page, URL_ARTICLE);
    await page.getByRole('link', { name: /contact sales/i }).first().click();
    await expect(page).toHaveURL(/\/en\/contact$/);
    await open(page, URL_ARTICLE);
    await page.getByRole('link', { name: /request a free quote/i }).first().click();
    await expect(page).toHaveURL(/\/en#quote$/);
    await expect(page.locator('#quote')).toBeVisible();
  });

  test('NA-20: no link has an empty or # href', async ({ page }) => {
    await open(page, URL_ARTICLE);
    const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href')));
    for (const h of hrefs) {
      expect(h).not.toBeNull();
      expect(h!.trim()).not.toBe('');
      expect(h).not.toBe('#');
    }
  });

  test('NA-21: keyboard order breadcrumb, article tags, search input and button, categories, trending tags, related cards; focus rings', async ({ page }) => {
    await open(page, URL_ARTICLE);
    const seq = await tabSequence(page, 130);
    const idx = subsequence(seq, [
      (f) => f.inBreadcrumb && f.href === '/en',
      (f) => f.inBreadcrumb && f.href === '/en/news',
      (f) => f.href === '/en/news?tag=future-tech' || (!!f.href?.includes('tag=') && /future tech/i.test(f.text)),
      (f) => f.tag === 'input',
      (f) => f.tag === 'button' && /search/i.test(f.text + ' '),
      (f) => !!f.href?.includes('category='),
      (f) => f.href === '/en/news?tag=freight',
      (f) => f.href === `/en/news/${INSIGHTS[0].slug}`,
    ]);
    expect(idx.every((i) => i >= 0), `focus order indexes ${idx}`).toBe(true);
    const noRing = seq.filter((f) => !f.ring).map((f) => `${f.tag} ${f.href ?? f.text.slice(0, 20)}`);
    expect(noRing).toEqual([]);
  });

  test('NA-27: no share buttons, previous/next, comment list or comment form', async ({ page }) => {
    await open(page, URL_ARTICLE);
    await expect(page.locator('textarea')).toHaveCount(0);
    await expect(page.locator('a[href*="sharer"], a[href*="twitter.com/intent"], a[href*="linkedin.com/sharing"]')).toHaveCount(0);
    for (const re of [/^\s*share\b/i, /copy link/i, /previous (article|post)/i, /next (article|post)/i, /leave a (comment|reply)/i, /post (a )?comment/i]) {
      await expect(page.locator('main a, main button, main h2, main h3, main label').filter({ hasText: re }), String(re)).toHaveCount(0);
    }
    await expect(page.getByRole('region', { name: /comments/i })).toHaveCount(0);
  });

  test('NA-27: no third-party host contacted', async ({ page }) => {
    const hosts = new Set<string>();
    page.on('request', (r) => { if (!/^(data|blob):/.test(r.url())) hosts.add(new URL(r.url()).hostname); });
    await open(page, URL_ARTICLE);
    await settle(page);
    expect([...hosts].filter((h) => h !== 'localhost' && h !== '127.0.0.1')).toEqual([]);
  });
});

test.describe('News Article: responsive (S5, NA-22..26)', () => {
  for (const w of ALL_WIDTHS) {
    test(`NA-22: no horizontal scroll at ${w}px (S5)`, async ({ page }) => {
      await open(page, URL_ARTICLE, w);
      await expectNoHScroll(page, `at ${w}`);
    });
  }

  for (const w of [1280, 1024]) {
    test(`NA-22: at ${w}px the sidebar is to the right of the article`, async ({ page }) => {
      await open(page, URL_ARTICLE, w);
      const lead = (await findText(page, new RegExp(`^${ARTICLE.lead}`)))!;
      expect(await sidebarLeft(page)).toBeGreaterThan(lead.right - 5);
      const search = (await findText(page, /^SEARCH INSIGHTS$/i))!;
      const cover = await page.evaluate(() => {
        const i = document.querySelector('main img');
        return i ? i.getBoundingClientRect().right + scrollX : 0;
      });
      expect(search.left).toBeGreaterThan(cover - 5);
    });
  }

  for (const w of [768, 428]) {
    test(`NA-23: at ${w}px the sidebar is below the article, search first`, async ({ page }) => {
      await open(page, URL_ARTICLE, w);
      const lastTag = await page.evaluate(() => {
        const a = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="tag="]')).slice(0, 4);
        return Math.max(...a.map((x) => x.getBoundingClientRect().bottom + scrollY));
      });
      const search = (await findText(page, /^SEARCH INSIGHTS$/i))!;
      const cats = (await findText(page, /^CATEGORIES$/i))!;
      const tags = (await findText(page, /^TRENDING TAGS$/i))!;
      expect(search.top).toBeGreaterThanOrEqual(lastTag);
      expect(cats.top).toBeGreaterThan(search.top);
      expect(tags.top).toBeGreaterThan(cats.top);
      await expectNoHScroll(page);
    });
  }

  test('NA-24: at 320px nothing leaves the viewport (feature block, tags, cards)', async ({ page }) => {
    await open(page, URL_ARTICLE, 320);
    await settle(page);
    await expectNoHScroll(page);
    const bad = await overflowOffenders(page, 'main h1, main h2, main h3, main p, main li, main blockquote, main img, main a, main button, main input');
    expect(bad).toEqual([]);
    const feature = await findText(page, new RegExp(`^${ARTICLE.featureTitle}$`));
    expect(feature!.right).toBeLessThanOrEqual(320);
  });

  test('NA-25: at 428 related cards use the same layout as the Home news block; scrolling inside does not scroll the page', async ({ page }) => {
    const layout = async (url: string) => {
      await open(page, url, 428);
      await settle(page);
      return page.evaluate(() => {
        const reads = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="/en/news/"]')).filter((a) => /read more/i.test(a.textContent || '')).slice(0, 3);
        const tops = new Set(reads.map((a) => Math.round(a.getBoundingClientRect().top)));
        const lefts = new Set(reads.map((a) => Math.round(a.getBoundingClientRect().left)));
        return { cards: reads.length, distinctTops: tops.size, distinctLefts: lefts.size };
      });
    };
    const home = await layout('/en');
    const art = await layout(URL_ARTICLE);
    expect(art.cards).toBe(3);
    expect(art.distinctTops).toBe(home.distinctTops);
    expect(art.distinctLefts).toBe(home.distinctLefts);
    await page.evaluate(() => {
      for (const e of Array.from(document.querySelectorAll<HTMLElement>('main *'))) if (e.scrollWidth > e.clientWidth + 5 && /auto|scroll/.test(getComputedStyle(e).overflowX)) e.scrollLeft = 200;
    });
    expect(await page.evaluate(() => window.scrollX)).toBe(0);
    await expectNoHScroll(page);
  });

  test('NA-26: at 428 the hamburger opens the mobile menu, Esc closes it, body scroll is locked while open', async ({ page }) => {
    await open(page, URL_ARTICLE, 428);
    const toggle = hamburger(page);
    await toggle.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    await expect(toggle).toBeFocused();
  });
});
