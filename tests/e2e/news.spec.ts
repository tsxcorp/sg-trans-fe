import { test, expect, type Page } from '@playwright/test';
import {
  FEATURED, ROWS, INSIGHTS, SIDEBAR_CATEGORIES, SIDEBAR_TAGS, WHITE_PAPER, ALL_WIDTHS,
  open, settle, expectNoHScroll, findText, h1Top, listedArticles, listedSlugs, insightSlugs, pager,
  allListedSlugs, cardText, tabSequence, collectHosts, hamburger,
} from '../helpers/news';

const LIST = '/en/news';
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
const searchInput = (page: Page) => page.getByPlaceholder('Search articles...').first();
const categoryLink = (page: Page, name: string) =>
  page.locator('a[href*="category="]').filter({ hasText: new RegExp(`^\\s*${name}\\s*\\d+\\s*$`, 'i') }).first();
const tagChip = (page: Page, name: string) =>
  page.locator('a[href*="tag="]').filter({ hasText: new RegExp(`^\\s*${name}\\s*$`, 'i') }).first();

async function insightTitles(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const h = Array.from(document.querySelectorAll('h2')).find((e) => /industry insights/i.test(e.textContent || ''));
    if (!h) return [];
    const top = h.getBoundingClientRect().top + scrollY;
    return Array.from(document.querySelectorAll<HTMLAnchorElement>('main a[href^="/en/news/"]'))
      .filter((a) => a.getBoundingClientRect().top + scrollY > top && (a.textContent || '').trim().length > 20)
      .map((a) => (a.textContent || '').replace(/\s+/g, ' ').trim());
  });
}

test.describe('News list /en/news: document and structure', () => {
  test('NW-1: 200, html lang en, title and a single h1 NEWS & INSIGHTS', async ({ page }) => {
    const res = await open(page, LIST);
    expect(res?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('News & Insights | Saigon Trans');
    await expect(page.locator('h1')).toHaveCount(1);
    expect(norm(await page.locator('h1').innerText()).toUpperCase()).toBe('NEWS & INSIGHTS');
  });

  test('NW-2: vertical order of landmarks; no Partners and no quote form', async ({ page }) => {
    await open(page, LIST);
    // The featured card is the first listed article (its title link); hero 1 is the same text placed above it.
    const featuredTop = (await listedArticles(page))[0]?.top;
    expect(featuredTop, 'featured card').toBeDefined();
    const featuredTitle = { top: featuredTop };
    const hero1 = await findText(page, /^Implementing AI-Driven Predictive Routing for Trans-Pacific Corridors$/i, { before: featuredTop - 1 });
    const pg = await pager(page);
    expect(pg.next, 'pagination NEXT').not.toBeNull();
    const ys: [string, number | undefined][] = [
      ['header', (await findText(page, /^HOME$/, { before: 200 }))?.top],
      ['hero 1', undefined],
      ['featured', featuredTitle?.top],
      ['row 1', (await findText(page, /^Opening Our New Strategic Hub in Singapore$/))?.top],
      ['row 3', (await findText(page, /^Blockchain for Transparent Bill of Lading$/))?.top],
      ['pagination', (await findText(page, /^NEXT$/i))?.top],
      ['hero 2 h1', await h1Top(page)],
      ['industry insights', (await findText(page, /^Industry Insights$/i))?.top],
      ['banners', (await findText(page, /^ANNUAL REPORT$/i))?.top],
      ['cta', (await findText(page, /READY TO OPTIMI[SZ]E YOUR SUPPLY CHAIN/i))?.top],
      ['footer', await page.evaluate(() => document.querySelector('footer')!.getBoundingClientRect().top + scrollY)],
    ];
    ys[1][1] = hero1?.top;
    for (const [name, y] of ys) expect(y, `${name} not found`).toBeDefined();
    for (let i = 1; i < ys.length; i++) expect(ys[i][1]!, `${ys[i][0]} below ${ys[i - 1][0]}`).toBeGreaterThan(ys[i - 1][1]!);
    await expect(page.getByRole('heading', { name: /partners\s*(and|&)\s*clients/i })).toHaveCount(0);
    await expect(page.locator('main input[type="email"], main input[name="email"]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /request a quote/i })).toHaveCount(0);
  });

  test('NW-3: hero 1 shows the featured title, breadcrumb HOME/NEWS/NEWS DETAIL and no heading', async ({ page }) => {
    await open(page, LIST);
    const r = await page.evaluate((title) => {
      const t = title.toLowerCase();
      const leafs = Array.from(document.body.querySelectorAll<HTMLElement>('*')).filter(
        (el) => (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase() === t && !Array.from(el.children).some((c) => (c.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase() === t),
      );
      leafs.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      const el = leafs[0];
      if (!el) return null;
      const inHeading = !!el.closest('h1,h2,h3,h4,h5,h6,[role="heading"]');
      let host: HTMLElement | null = el;
      while (host && host !== document.body && !/NEWS DETAIL/i.test(host.textContent || '')) host = host.parentElement;
      const crumbs = host ? Array.from(host.querySelectorAll<HTMLElement>('a,li,span')).map((e) => (e.textContent || '').trim()).filter((x) => /^(HOME|NEWS|NEWS DETAIL)$/i.test(x)) : [];
      const headings = host ? host.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"]').length : -1;
      const homeHref = host ? Array.from(host.querySelectorAll('a')).find((a) => /^home$/i.test((a.textContent || '').trim()))?.getAttribute('href') : null;
      const newsHref = host ? Array.from(host.querySelectorAll('a')).find((a) => /^news$/i.test((a.textContent || '').trim()))?.getAttribute('href') : null;
      const detailIsLink = host ? Array.from(host.querySelectorAll('a')).some((a) => /^news detail$/i.test((a.textContent || '').trim())) : null;
      return { top: el.getBoundingClientRect().top + scrollY, inHeading, crumbs, headings, homeHref, newsHref, detailIsLink };
    }, FEATURED.title);
    expect(r, 'hero 1 title not found').not.toBeNull();
    expect(r!.top).toBeLessThan(500);
    expect(r!.inHeading).toBe(false);
    expect(r!.headings, 'hero 1 contains no heading element').toBe(0);
    expect(r!.crumbs.map((c) => c.toUpperCase()).filter((c, i, a) => a.indexOf(c) === i)).toEqual(['HOME', 'NEWS', 'NEWS DETAIL']);
    expect(r!.homeHref).toBe('/en');
    expect(r!.newsHref).toBe('/en/news');
    expect(r!.detailIsLink).toBe(false);
  });

  test('NW-4: header NEWS is the current item, HOME is not', async ({ page }) => {
    await open(page, LIST);
    const current = page.locator('header a[aria-current="page"]');
    await expect(current).toHaveCount(1);
    expect(norm(await current.innerText()).toUpperCase()).toBe('NEWS');
    await expect(page.locator('header a', { hasText: /^\s*HOME\s*$/i }).first()).not.toHaveAttribute('aria-current', 'page');
  });

  test('NW-5: featured card (badge, meta, title, verbatim excerpt, READ FULL ARTICLE)', async ({ page }) => {
    await open(page, LIST);
    const text = await cardText(page, FEATURED.slug, /READ FULL ARTICLE/i);
    expect(text.toUpperCase()).toContain('INNOVATION');
    expect(text.toUpperCase()).toContain('MAY 15, 2024');
    expect(text.toUpperCase()).toContain('INSIGHTS');
    expect(text).toContain(FEATURED.title);
    expect(text).toContain(FEATURED.excerpt);
    await expect(page.locator(`a[href="/en/news/${FEATURED.slug}"]`, { hasText: /read full article/i })).toHaveCount(1);
  });

  test('NW-6: the 3 rows in order with category, date and CONTINUE', async ({ page }) => {
    await open(page, LIST);
    const listed = await listedArticles(page);
    expect(listed.slice(1, 4).map((a) => a.slug)).toEqual(ROWS.map((r) => r.slug));
    for (const row of ROWS) {
      const text = await cardText(page, row.slug, /CONTINUE/i);
      expect(text).toContain(row.title);
      expect(text.toUpperCase()).toContain(row.category);
      expect(text).toContain(row.date);
      await expect(page.locator(`a[href="/en/news/${row.slug}"]`, { hasText: /^\s*continue/i })).toHaveCount(1);
    }
  });

  test('NW-7: Industry Insights titles are not among the listed titles; exactly 4 listed', async ({ page }) => {
    await open(page, LIST);
    const listed = await listedArticles(page);
    expect(listed).toHaveLength(4);
    for (const ins of INSIGHTS) {
      expect(listed.map((a) => a.slug)).not.toContain(ins.slug);
      expect(listed.map((a) => a.title)).not.toContain(ins.title);
    }
  });

  test('NW-8: featured title and each row title, thumbnail and CONTINUE open /en/news/<slug>', async ({ page }) => {
    await open(page, LIST);
    await page.locator(`a[href="/en/news/${FEATURED.slug}"]`, { hasText: FEATURED.title }).first().click();
    await expect(page).toHaveURL(new RegExp(`/en/news/${FEATURED.slug}$`));
    for (const row of ROWS) {
      for (const how of ['title', 'thumb', 'continue'] as const) {
        await open(page, LIST);
        const links = page.locator(`a[href="/en/news/${row.slug}"]`);
        const target =
          how === 'title' ? links.filter({ hasText: row.title }).first()
          : how === 'continue' ? links.filter({ hasText: /^\s*continue/i }).first()
          : links.filter({ has: page.locator('img') }).first();
        await target.click();
        await expect(page, `${row.slug} via ${how}`).toHaveURL(new RegExp(`/en/news/${row.slug}$`));
      }
    }
  });

  test('NW-9: content images have alt and are loaded; hero images are decorative', async ({ page }) => {
    await open(page, LIST);
    await settle(page);
    const imgs = await page.evaluate(() =>
      Array.from(document.images).map((i) => ({
        src: i.currentSrc || i.src,
        alt: i.getAttribute('alt'),
        loaded: i.complete && i.naturalWidth > 0,
        inNewsLink: !!i.closest('a[href^="/en/news/"]'),
        top: i.getBoundingClientRect().top + scrollY,
        h: i.getBoundingClientRect().height,
      })),
    );
    for (const i of imgs) {
      if (i.inNewsLink) expect(i.alt && i.alt.trim().length > 0, `empty alt on article image ${i.src}`).toBe(true);
      expect(i.alt, `img without alt attribute ${i.src}`).not.toBeNull();
      if (i.h > 0) expect(i.loaded, `image not loaded ${i.src}`).toBe(true);
    }
    expect(imgs.filter((i) => i.inNewsLink).length).toBeGreaterThanOrEqual(7);
  });

  test('NW-10: sidebar widgets in order: search, categories, white paper, trending tags', async ({ page }) => {
    await open(page, LIST);
    const ySearch = (await findText(page, /^SEARCH INSIGHTS$/i))?.top;
    const yCat = (await findText(page, /^CATEGORIES$/i))?.top;
    const yPaper = (await findText(page, new RegExp(`^${WHITE_PAPER}$`, 'i')))?.top;
    const yTags = (await findText(page, /^TRENDING TAGS$/i))?.top;
    for (const y of [ySearch, yCat, yPaper, yTags]) expect(y).toBeDefined();
    expect(yCat!).toBeGreaterThan(ySearch!);
    expect(yPaper!).toBeGreaterThan(yCat!);
    expect(yTags!).toBeGreaterThan(yPaper!);
    await expect(searchInput(page)).toBeVisible();
    for (const c of SIDEBAR_CATEGORIES) {
      const link = categoryLink(page, c);
      await expect(link, c).toBeVisible();
      expect(norm(await link.innerText())).toMatch(/\d{2}$/);
    }
    const chips = await page.evaluate((top) =>
      Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="tag="]')).filter((a) => a.getBoundingClientRect().top + scrollY > top).map((a) => (a.textContent || '').trim().toUpperCase()),
      yTags!);
    expect(chips).toEqual(SIDEBAR_TAGS);
    const sticky = await page.evaluate(() => {
      for (let e: HTMLElement | null = document.querySelector('form[role="search"]'); e; e = e.parentElement) if (getComputedStyle(e).position === 'sticky') return true;
      return false;
    });
    expect(sticky, 'sidebar must not be sticky').toBe(false);
  });

  test('NW-11: each sidebar count equals the number of published articles in that category', async ({ page }) => {
    await open(page, LIST);
    const counts = await page.evaluate((names) =>
      names.map((n) => {
        const a = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="category="]')).find((x) => new RegExp(`^\\s*${n}\\s*\\d+\\s*$`, 'i').test((x.textContent || '').replace(/\s+/g, ' ')));
        const m = a && /(\d+)\s*$/.exec((a.textContent || '').trim());
        return { n, slug: a?.getAttribute('href') ?? '', count: m ? m[1] : '' };
      }), SIDEBAR_CATEGORIES);
    for (const c of counts) {
      expect(c.count, `${c.n} count has 2 digits`).toMatch(/^\d{2,}$/);
      const slugs = await allListedSlugs(page, `?category=${new URL(c.slug, 'http://x').searchParams.get('category')}`);
      expect(slugs.length, `${c.n}`).toBe(Number(c.count));
    }
  });
});

test.describe('News list: search, category, tag, empty state', () => {
  test('NW-12: searching "blockchain" gives ?q=blockchain with exactly the Blockchain article', async ({ page }) => {
    await open(page, LIST);
    await searchInput(page).fill('blockchain');
    await searchInput(page).press('Enter');
    await expect(page).toHaveURL(/\/en\/news\?q=blockchain$/);
    expect(await listedSlugs(page)).toEqual(['blockchain-transparent-bill-of-lading']);
    await expect(page.getByText(/read full article/i)).toHaveCount(0);
    const pg = await pager(page);
    expect(pg.labels.length).toBeLessThanOrEqual(1);
  });

  for (const typed of ['BLOCKCHAIN', '  blockchain  ']) {
    test(`NW-13: submitting ${JSON.stringify(typed)} shows the same result`, async ({ page }) => {
      await open(page, LIST);
      await searchInput(page).fill(typed);
      await searchInput(page).press('Enter');
      await expect(page).toHaveURL(/\/en\/news\?q=(blockchain|BLOCKCHAIN)$/);
      expect(await listedSlugs(page)).toEqual(['blockchain-transparent-bill-of-lading']);
    });
  }

  test('NW-14: no match shows the empty state with Clear filters; sidebar and Industry Insights remain', async ({ page }) => {
    await open(page, LIST);
    await searchInput(page).fill('zzzz');
    await searchInput(page).press('Enter');
    await expect(page).toHaveURL(/\/en\/news\?q=zzzz$/);
    await expect(page.getByText('No articles found for "zzzz".')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Clear filters' })).toBeVisible();
    expect(await listedSlugs(page)).toEqual([]);
    expect((await pager(page)).labels).toEqual([]);
    await expect(searchInput(page)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Industry Insights' })).toBeVisible();
    expect(await insightSlugs(page)).toEqual(INSIGHTS.map((i) => i.slug));
    await expect(searchInput(page)).toHaveValue('zzzz');
  });

  test('NW-14: the q value is escaped (no markup injected, no script runs)', async ({ page }) => {
    const dialogs: string[] = [];
    page.on('dialog', async (d) => { dialogs.push(d.message()); await d.dismiss(); });
    const q = '<img src=x onerror="window.__xss=1"><script>window.__xss=1</script>';
    const res = await open(page, `${LIST}?q=${encodeURIComponent(q)}`);
    expect(res?.status()).toBe(200);
    await expect(page.getByText(`No articles found for "${q}".`)).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
    await expect(page.locator('main img[src="x"]')).toHaveCount(0);
    expect(dialogs).toEqual([]);
  });

  test('NW-15: Clear filters returns to /en/news default view', async ({ page }) => {
    await open(page, `${LIST}?q=zzzz`);
    await page.getByRole('link', { name: 'Clear filters' }).click();
    await expect(page).toHaveURL(/\/en\/news$/);
    await expect(page.getByText(/read full article/i)).toBeVisible();
    expect(await listedSlugs(page)).toHaveLength(4);
  });

  for (const typed of ['', '   ']) {
    test(`NW-16: submitting ${JSON.stringify(typed)} goes to /en/news without q`, async ({ page }) => {
      await open(page, `${LIST}?q=blockchain`);
      await searchInput(page).fill(typed);
      await searchInput(page).press('Enter');
      await expect(page).toHaveURL(/\/en\/news$/);
    });
  }

  test('NW-17: category Innovation: URL, exact list, no featured card, aria-current, Industry Insights unchanged', async ({ page }) => {
    await open(page, LIST);
    const before = await insightTitles(page);
    await categoryLink(page, 'Innovation').click();
    await expect(page).toHaveURL(/\/en\/news\?category=innovation$/);
    const slugs = await allListedSlugs(page, '?category=innovation');
    expect(slugs).toContain(FEATURED.slug);
    expect(slugs).toContain('blockchain-transparent-bill-of-lading');
    await open(page, `${LIST}?category=innovation`);
    await expect(page.getByText(/read full article/i)).toHaveCount(0);
    await expect(categoryLink(page, 'Innovation')).toHaveAttribute('aria-current', 'true');
    for (const other of ['Global Supply', 'Network Updates', 'Sustainability']) {
      await expect(categoryLink(page, other)).not.toHaveAttribute('aria-current', 'true');
    }
    expect(await insightTitles(page)).toEqual(before);
    expect(before).toHaveLength(3);
    const count = Number((norm(await categoryLink(page, 'Innovation').innerText()).match(/(\d+)$/) ?? [])[1]);
    expect(slugs.length).toBe(count);
  });

  test('NW-18: tag chip FREIGHT: URL, aria-current, results or empty state', async ({ page }) => {
    await open(page, LIST);
    await tagChip(page, 'FREIGHT').click();
    await expect(page).toHaveURL(/\/en\/news\?tag=freight$/);
    await expect(tagChip(page, 'FREIGHT')).toHaveAttribute('aria-current', 'true');
    const n = (await listedSlugs(page)).length;
    if (n === 0) await expect(page.getByText('No articles found.')).toBeVisible();
    else expect(n).toBeLessThanOrEqual(4);
  });

  test('NW-19: unknown category gives 200 and the empty state', async ({ page }) => {
    const res = await open(page, `${LIST}?category=nope`);
    expect(res?.status()).toBe(200);
    await expect(page.getByText('No articles found.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Clear filters' })).toHaveAttribute('href', '/en/news');
  });

  test('NW-19: unknown tag gives the empty state', async ({ page }) => {
    const res = await open(page, `${LIST}?tag=nope`);
    expect(res?.status()).toBe(200);
    await expect(page.getByText('No articles found.')).toBeVisible();
  });

  test('NW-20: q wins over category when both are present', async ({ page }) => {
    await open(page, `${LIST}?q=a`);
    const onlyQ = await listedSlugs(page);
    await open(page, `${LIST}?q=a&category=innovation`);
    expect(await listedSlugs(page)).toEqual(onlyQ);
    await expect(searchInput(page)).toHaveValue('a');
  });
});

test.describe('News list: pagination', () => {
  test('NW-21: a single result page shows only 01; PREVIOUS and NEXT are disabled, not links', async ({ page }) => {
    await open(page, `${LIST}?q=blockchain`);
    const pg = await pager(page);
    expect(pg.labels.length).toBeLessThanOrEqual(1);
    for (const b of [pg.prev, pg.next]) {
      if (!b) continue;
      expect(b.disabled).toBe(true);
      expect(b.href).toBeNull();
    }
    expect(pg.prev?.disabled).toBe(true);
    expect(pg.next?.disabled).toBe(true);
  });

  test('NW-22: with the sample set, pagination shows 01 02 and NEXT links to ?page=2', async ({ page }) => {
    await open(page, LIST);
    const pg = await pager(page);
    expect(pg.labels.slice(0, 2)).toEqual(['01', '02']);
    expect(pg.current).toBe('01');
    expect(pg.prev?.disabled).toBe(true);
    expect(pg.prev?.href).toBeNull();
    expect(pg.next?.disabled).toBe(false);
    expect(pg.next?.href).toBe('/en/news?page=2');
    expect(pg.hrefs['02']).toBe('/en/news?page=2');
    const cur = page.locator('main [aria-current="page"]', { hasText: /^\s*01\s*$/ });
    await expect(cur).toHaveCount(1);
  });

  test('NW-23: page 2 has no featured card and at most 4 rows; PREVIOUS -> /en/news; NEXT disabled on the last page', async ({ page }) => {
    await open(page, `${LIST}?page=2`);
    await expect(page.getByText(/read full article/i)).toHaveCount(0);
    const slugs = await listedSlugs(page);
    expect(slugs.length).toBeGreaterThan(0);
    expect(slugs.length).toBeLessThanOrEqual(4);
    const pg = await pager(page);
    expect(pg.current).toBe('02');
    expect(pg.prev?.href).toBe('/en/news');
    await open(page, `${LIST}?page=999`);
    const last = await pager(page);
    expect(last.next?.disabled).toBe(true);
    expect(last.next?.href).toBeNull();
    const url = page.url();
    await page.getByText(/^\s*next\s*$/i).first().click({ force: true });
    expect(page.url()).toBe(url);
    expect((await listedSlugs(page)).length).toBeLessThanOrEqual(4);
  });

  for (const bad of ['0', 'abc', '-3']) {
    test(`NW-24: ?page=${bad} shows the page 1 default view with 200`, async ({ page }) => {
      const res = await open(page, `${LIST}?page=${bad}`);
      expect(res?.status()).toBe(200);
      await expect(page.getByText(/read full article/i)).toBeVisible();
      expect(await listedSlugs(page)).toHaveLength(4);
      expect((await pager(page)).current).toBe('01');
    });
  }

  test('NW-25: ?page=999 redirects to the last page', async ({ page }) => {
    const res = await open(page, `${LIST}?page=999`);
    expect(res?.request().redirectedFrom(), 'a redirect happened').not.toBeNull();
    expect(res?.status()).toBe(200);
    const pg = await pager(page);
    const lastLabel = pg.labels[pg.labels.length - 1];
    expect(pg.current).toBe(lastLabel);
    expect(new URL(page.url()).searchParams.get('page')).toBe(String(Number(lastLabel)));
  });

  test('NW-26: pagination links keep the active q filter', async ({ page }) => {
    await open(page, `${LIST}?q=e`);
    const pg = await pager(page);
    expect(pg.labels.length, 'q=e matches > 4 articles').toBeGreaterThanOrEqual(2);
    expect(pg.next?.href).toContain('q=e');
    expect(pg.next?.href).toContain('page=2');
    for (const [label, href] of Object.entries(pg.hrefs)) if (href) expect(href, label).toContain('q=e');
    await page.getByRole('link', { name: /next/i }).first().click();
    await expect(page).toHaveURL(/q=e/);
    await expect(page).toHaveURL(/page=2/);
    await expect(searchInput(page)).toHaveValue('e');
  });

  test('NW-26: pagination links keep the active category filter when it has several pages', async ({ page }) => {
    await open(page, `${LIST}?category=innovation`);
    const pg = await pager(page);
    for (const href of [pg.next?.href, ...Object.values(pg.hrefs)]) if (href) expect(href).toContain('category=innovation');
  });
});

test.describe('News list: Industry Insights, banners, actions', () => {
  test('NW-28: three Industry Insights cards with verbatim titles, authors, Comments (03), Read More', async ({ page }) => {
    await open(page, LIST);
    expect(await insightTitles(page)).toEqual(INSIGHTS.map((i) => i.title));
    expect(await insightSlugs(page)).toEqual(INSIGHTS.map((i) => i.slug));
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
      expect(text).toContain('Comments (03)');
      expect(text).toMatch(/Read More/i);
      await expect(page.locator(`a[href="/en/news/${i.slug}"]`, { hasText: /read more/i })).toHaveCount(1);
    }
  });

  test('NW-29: eyebrow Latest Briefings and h2 Industry Insights', async ({ page }) => {
    await open(page, LIST);
    await expect(page.getByText('Latest Briefings', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Industry Insights' })).toBeVisible();
  });

  test('NW-30: promo banners with verbatim text and CTAs', async ({ page }) => {
    await open(page, LIST);
    for (const t of [
      'ANNUAL REPORT', '2025 FINANCIAL PERFORMANCE HIGHLIGHTS', 'Exceptional growth metrics and strategic roadmap for the coming fiscal year.', 'VIEW REPORT',
      'WHITE PAPER', 'THE FUTURE OF AUTONOMOUS TRUCKING', 'Download our latest technical analysis on autonomous freight integration in urban environments.',
    ]) {
      expect(await findText(page, new RegExp(`^${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')), t).not.toBeNull();
    }
    const left = await findText(page, /^ANNUAL REPORT$/i);
    const right = await findText(page, /^WHITE PAPER$/i, { after: left!.top - 40 });
    expect(right!.left).toBeGreaterThan(left!.left + 300);
    // the sidebar white paper card also has DOWNLOAD PDF: one more in the banner
    expect(await page.getByText(/^\s*download pdf\s*$/i).count()).toBeGreaterThanOrEqual(2);
  });

  test('NW-31: file-less resources are disabled buttons, no href="#", clicking does nothing', async ({ page }) => {
    await open(page, LIST);
    await expect(page.locator('a[href="#"]')).toHaveCount(0);
    const ctas = page.locator('button', { hasText: /view report|download pdf/i });
    expect(await ctas.count()).toBe(3);
    for (let i = 0; i < 3; i++) await expect(ctas.nth(i)).toHaveAttribute('aria-disabled', 'true');
    const url = page.url();
    const reqs: string[] = [];
    page.on('request', (r) => { if (new URL(r.url()).origin !== new URL(url).origin && !/^(data|blob):/.test(r.url())) reqs.push(r.url()); });
    for (let i = 0; i < 3; i++) await ctas.nth(i).click({ force: true });
    await page.waitForTimeout(300);
    expect(page.url()).toBe(url);
    expect(reqs, 'cross-origin requests after click').toEqual([]);
  });

  test('NW-32: no dead links (#, empty, javascript:) and internal links resolve with 200', async ({ page }) => {
    await open(page, LIST);
    const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href')));
    for (const h of hrefs) {
      expect(h, 'anchor without href').not.toBeNull();
      expect(h!.trim()).not.toBe('');
      expect(h).not.toBe('#');
      expect(h!.toLowerCase()).not.toMatch(/^javascript:/);
    }
    const internal = [...new Set(hrefs.filter((h): h is string => !!h && h.startsWith('/')))];
    expect(internal.length).toBeGreaterThan(10);
    for (const h of internal) {
      const res = await page.request.get(h);
      expect(res.status(), h).toBe(200);
    }
  });

  test('NW-34: keyboard reaches search, categories, tags, cards and pagination, each with a focus ring; Enter submits search', async ({ page }) => {
    await open(page, LIST);
    const seq = await tabSequence(page, 120);
    const has = (p: (f: (typeof seq)[number]) => boolean) => seq.some(p);
    expect(has((f) => f.href === `/en/news/${FEATURED.slug}`)).toBe(true);
    for (const r of ROWS) expect(has((f) => f.href === `/en/news/${r.slug}`), r.slug).toBe(true);
    expect(has((f) => f.tag === 'input')).toBe(true);
    expect(has((f) => !!f.href?.includes('category='))).toBe(true);
    expect(has((f) => !!f.href?.includes('tag='))).toBe(true);
    expect(has((f) => f.href === '/en/news?page=2')).toBe(true);
    for (const i of INSIGHTS) expect(has((f) => f.href === `/en/news/${i.slug}`), i.slug).toBe(true);
    const noRing = seq.filter((f) => !f.ring).map((f) => `${f.tag} ${f.href ?? f.text.slice(0, 20)}`);
    expect(noRing, 'focused without outline or box-shadow').toEqual([]);
    await searchInput(page).focus();
    await page.keyboard.type('blockchain');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/q=blockchain/);
  });

  test('NW-40: no third-party host is contacted; search stays on /en/news', async ({ page }) => {
    const hosts = await collectHosts(page, async () => {
      await open(page, LIST);
      await settle(page);
      await searchInput(page).fill('routing');
      await searchInput(page).press('Enter');
      await page.waitForURL(/q=routing/);
      await page.waitForLoadState('networkidle');
    });
    expect(hosts.filter((h) => h !== 'localhost' && h !== '127.0.0.1')).toEqual([]);
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/en\/news\?q=routing$/);
  });
});

test.describe('News list: responsive (S5, NW-35..38)', () => {
  for (const w of ALL_WIDTHS) {
    test(`NW-35: no horizontal scroll at ${w}px (S5)`, async ({ page }) => {
      await open(page, LIST, w);
      await expectNoHScroll(page, `at ${w}`);
    });
  }

  for (const w of [1280, 1024]) {
    test(`NW-35: at ${w}px the sidebar is right of the main column`, async ({ page }) => {
      await open(page, LIST, w);
      const search = await findText(page, /^SEARCH INSIGHTS$/i);
      const next = await findText(page, /^NEXT$/i);
      const row = (await listedArticles(page))[1];
      expect(search!.left).toBeGreaterThan(next!.right);
      expect(search!.left).toBeGreaterThan(row.left + 200);
      const cats = await findText(page, /^CATEGORIES$/i);
      // the search title sits inside the 32 px panel padding (design 1216 vs 1248)
      const inset = search!.left - cats!.left; // panel padding: 32 at the design width, smaller when the sidebar narrows
      expect(inset).toBeGreaterThanOrEqual(16);
      expect(inset).toBeLessThanOrEqual(34);
    });
  }

  for (const w of [768, 428]) {
    test(`NW-36: at ${w}px one column: search above featured, then rows, pagination, categories, white paper, tags`, async ({ page }) => {
      await open(page, LIST, w);
      const ys = {
        search: (await findText(page, /^SEARCH INSIGHTS$/i))!.top,
        featured: (await findText(page, new RegExp(`^${FEATURED.title}$`, 'i'), { after: 300 }))!,
        rowTitle: (await findText(page, /^Blockchain for Transparent Bill of Lading$/))!.top,
        pager: (await findText(page, /^NEXT$/i))!,
        cats: (await findText(page, /^CATEGORIES$/i))!.top,
        paper: (await findText(page, new RegExp(`^${WHITE_PAPER}$`, 'i')))!.top,
        tags: (await findText(page, /^TRENDING TAGS$/i))!.top,
        insights: (await findText(page, /^Industry Insights$/i))!.top,
      };
      expect(ys.search).toBeLessThan(ys.featured.top);
      expect(ys.featured.top).toBeLessThan(ys.rowTitle);
      expect(ys.rowTitle).toBeLessThan(ys.pager.top);
      expect(ys.cats).toBeGreaterThanOrEqual(ys.pager.bottom);
      expect(ys.paper).toBeGreaterThan(ys.cats);
      expect(ys.tags).toBeGreaterThan(ys.paper);
      expect(ys.insights).toBeGreaterThan(ys.tags);
    });

    test(`NW-36: at ${w}px Industry Insights is a scroll-snap carousel with dots`, async ({ page }) => {
      await open(page, LIST, w);
      const info = await page.evaluate(() => {
        const h = Array.from(document.querySelectorAll('h2')).find((e) => /industry insights/i.test(e.textContent || ''))!;
        const top = h.getBoundingClientRect().top + scrollY;
        const snap = Array.from(document.querySelectorAll<HTMLElement>('main *')).filter((e) => {
          const cs = getComputedStyle(e);
          return e.getBoundingClientRect().top + scrollY > top - 5 && cs.scrollSnapType !== 'none' && /auto|scroll/.test(cs.overflowX);
        });
        const dots = Array.from(document.querySelectorAll<HTMLElement>('button[aria-label^="Go to slide"]')).filter((b) => b.getBoundingClientRect().top + scrollY > top);
        return { snap: snap.length, scrollable: snap.some((e) => e.scrollWidth > e.clientWidth), dots: dots.length };
      });
      expect(info.snap).toBeGreaterThan(0);
      expect(info.scrollable).toBe(true);
      expect(info.dots).toBeGreaterThan(0);
      await expectNoHScroll(page);
    });
  }

  for (const w of [428, 320]) {
    test(`NW-37: at ${w}px rows are stacked, header has a hamburger, no page h-scroll even when the carousel scrolls`, async ({ page }) => {
      await open(page, LIST, w);
      await settle(page);
      await expectNoHScroll(page);
      const listed = await listedArticles(page);
      for (const row of listed.slice(1, 4)) {
        expect(row.imgBottom, `${row.slug} image above title`).not.toBeNull();
        expect(row.imgBottom!).toBeLessThanOrEqual(row.top + 2);
        expect(row.imgWidth!).toBeGreaterThan(w * 0.7);
      }
      await expect(hamburger(page)).toBeVisible();
      await page.evaluate(() => {
        for (const e of Array.from(document.querySelectorAll<HTMLElement>('main *'))) if (e.scrollWidth > e.clientWidth + 5 && /auto|scroll/.test(getComputedStyle(e).overflowX)) e.scrollLeft = 150;
      });
      expect(await page.evaluate(() => window.scrollX)).toBe(0);
      await expectNoHScroll(page);
    });
  }

  test('NW-35: at 1280 and 768 a row has the thumbnail left of the text', async ({ page }) => {
    for (const w of [1280, 768]) {
      await open(page, LIST, w);
      const row = (await listedArticles(page))[1];
      expect(row.imgLeft!, `thumb left of title at ${w}`).toBeLessThan(row.left);
      expect(row.imgBottom!).toBeGreaterThan(row.top);
    }
  });

  test('NW-38: at 428 the hamburger opens the menu; Esc closes it and focus returns to the toggle', async ({ page }) => {
    await open(page, LIST, 428);
    const toggle = hamburger(page);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await toggle.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(toggle).toBeFocused();
  });
});
