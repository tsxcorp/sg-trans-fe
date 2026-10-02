import { test, expect, type Page } from '@playwright/test';
import {
  CONTACT_PATH, SECTION_IDS, S5_WIDTHS, PEOPLE, FORM_FIELDS, REQUIRED_FIELDS, OPTIONAL_FIELDS,
  norm, has, hasCI, sectionText, uniqueIp, uniqueTag, openContact, quote, field, submitButton, fillForm,
  validValues, serviceOptions, readLeads, expectLeads, expectNoLead, orgCards, connectors, blockBox, near, scrollThrough,
  HEIGHT_FOR,
} from '../helpers/contact';

test.beforeEach(async ({ context }) => {
  await context.setExtraHTTPHeaders({ 'x-forwarded-for': uniqueIp() });
});

/** Text of the error elements a field points at with aria-describedby. */
async function describedText(page: Page, name: string): Promise<string> {
  return field(page, name).evaluate((el) => {
    const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    return ids
      .map((id) => {
        const d = document.getElementById(id);
        if (!d) return '';
        const r = d.getBoundingClientRect();
        return r.width > 0 && r.height > 0 ? (d.textContent ?? '').trim() : '';
      })
      .join(' ')
      .trim();
  });
}

const isInvalid = async (page: Page, name: string, expected = true) => {
  // server validation takes a round trip: poll for the expected state
  const read = () => field(page, name).getAttribute('aria-invalid').then((v) => v === 'true');
  try {
    await expect.poll(read, { timeout: expected ? 5000 : 1500 }).toBe(expected);
  } catch {
    /* fall through to the plain read below */
  }
  return read();
};

const focusedName = (page: Page) => page.evaluate(() => (document.activeElement as HTMLInputElement | null)?.name ?? '');

// ------------------------------------------------------------------------------------------------
test.describe('Contact: document and structure', () => {
  test('CT-1: GET /en/contact is 200, html lang en, exact title, non-empty meta description', async ({ page }) => {
    const res = await page.goto(CONTACT_PATH);
    expect(res?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.title()).toBe('Contact Us | Saigon Trans');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect((desc ?? '').trim().length).toBeGreaterThan(0);
  });

  test('CT-2: exactly one h1 reading CONTACT US', async ({ page }) => {
    await openContact(page);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(norm(await page.locator('h1').innerText())).toBe('CONTACT US');
  });

  test('CT-3: the 8 section ids exist once, are <section aria-labelledby>, in DOM and visual order, footer after', async ({ page }) => {
    await openContact(page, 1920);
    const info = await page.evaluate((ids) => {
      const els = ids.map((id) => document.querySelectorAll(`#${id}`));
      const first = els.map((l) => l[0] as HTMLElement | undefined);
      const footer = document.querySelector('footer');
      return {
        counts: els.map((l) => l.length),
        tags: first.map((e) => e?.tagName ?? null),
        labelled: first.map((e) => {
          const id = e?.getAttribute('aria-labelledby');
          const t = id ? document.getElementById(id) : null;
          return !!t && (t.textContent ?? '').trim().length > 0 && e!.contains(t);
        }),
        following: first.map((e, i) => (i === 0 ? true : !!(first[i - 1]!.compareDocumentPosition(e!) & Node.DOCUMENT_POSITION_FOLLOWING))),
        tops: first.map((e) => (e ? e.getBoundingClientRect().top + window.scrollY : -1)),
        footerAfterCta: !!footer && !!(first[first.length - 1]!.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING),
        footerTop: footer ? footer.getBoundingClientRect().top + window.scrollY : -1,
      };
    }, [...SECTION_IDS]);
    expect(info.counts).toEqual(SECTION_IDS.map(() => 1));
    expect(info.tags).toEqual(SECTION_IDS.map(() => 'SECTION'));
    expect(info.labelled, 'each section has aria-labelledby pointing at a heading inside it').toEqual(SECTION_IDS.map(() => true));
    expect(info.following).toEqual(SECTION_IDS.map(() => true));
    for (let i = 1; i < info.tops.length; i++) expect(info.tops[i], `${SECTION_IDS[i]} below ${SECTION_IDS[i - 1]}`).toBeGreaterThan(info.tops[i - 1]);
    expect(info.footerAfterCta).toBe(true);
    expect(info.footerTop).toBeGreaterThan(info.tops[info.tops.length - 1]);
  });

  test('CT-4: nav marks CONTACT with aria-current=page and HOME without', async ({ page }) => {
    await openContact(page, 1920);
    const cur = await page.evaluate(() =>
      Array.from(document.querySelectorAll('header [aria-current="page"]')).map((e) => ({
        text: (e.textContent ?? '').replace(/\s+/g, ' ').trim().toUpperCase(),
        href: e.getAttribute('href'),
      })),
    );
    expect(cur.map((c) => c.text)).toEqual(['CONTACT']);
    expect(cur[0].href).toMatch(/\/en\/contact\/?$/);
    const home = page.locator('header nav').getByRole('link', { name: /^home$/i });
    await expect(home).toHaveCount(1);
    await expect(home).not.toHaveAttribute('aria-current', /.+/);
  });
});

// ------------------------------------------------------------------------------------------------
test.describe('Contact: hero', () => {
  test('CT-5: hero texts and links (Explore The Services -> /en/services, Contact Us -> #project-quote)', async ({ page }) => {
    await openContact(page);
    const t = await sectionText(page, '#contact-hero');
    expect(has(t, 'CONTACT US')).toBe(true);
    expect(has(t, 'We are here to support your logistics needs')).toBe(true);
    const hero = page.locator('#contact-hero');
    await expect(hero.getByRole('link', { name: /explore the services/i })).toHaveAttribute('href', '/en/services');
    await expect(hero.getByRole('link', { name: /^contact us$/i })).toHaveAttribute('href', '#project-quote');
  });

  test('CT-6: clicking hero "Contact Us" sets the hash and focuses first_name', async ({ page }) => {
    await openContact(page);
    await page.locator('#contact-hero').getByRole('link', { name: /^contact us$/i }).click();
    await expect.poll(() => new URL(page.url()).hash).toBe('#project-quote');
    await expect.poll(() => focusedName(page)).toBe('first_name');
  });
});

// ------------------------------------------------------------------------------------------------
test.describe('Contact: offices and map', () => {
  test('CT-7: offices texts', async ({ page }) => {
    await openContact(page);
    const t = await sectionText(page, '#offices');
    for (const s of ['SAIGONTRANSERVICE', 'MAIN OFFICE', 'OPERATION OFFICE', 'LICENSE/TAX', 'DIRECT CONNECT']) expect(has(t, s), s).toBe(true);
    for (const s of [
      '45 Dinh Tien Hoang Street, Saigon Ward, Ho Chi Minh City',
      '19 To Huu, Lakeview 1, An Khanh Ward, HCMC',
      '4102001961/GP-HCM',
      'VAT: 0302070998',
    ])
      expect(hasCI(t, s), s).toBe(true);
    await expect(page.locator('#offices').getByRole('heading', { name: 'SAIGONTRANSERVICE' })).toBeVisible();
  });

  test('CT-7: office addresses are plain text, not links (A4)', async ({ page }) => {
    await openContact(page);
    for (const addr of ['45 Dinh Tien Hoang Street', '19 To Huu']) {
      const linked = await page.locator('#offices').getByText(addr).first().evaluate((e) => !!e.closest('a'));
      expect(linked, addr).toBe(false);
    }
  });

  test('CT-8: DIRECT CONNECT has a tel: link with the visible number and a mailto: link', async ({ page }) => {
    await openContact(page);
    const tel = page.locator('#offices a[href^="tel:"]').filter({ hasText: '(84) 028 38233 068' });
    await expect(tel).toHaveCount(1);
    expect(norm(await tel.innerText())).toBe('(84) 028 38233 068');
    await expect(page.locator('#offices a[href="mailto:linhpham@saigontrans.com.vn"]')).toHaveCount(1);
  });

  test('CT-8: tel href follows the rule of A5 (+842838233068)', async ({ page }) => {
    await openContact(page);
    await expect(page.locator('#offices a[href^="tel:"]').filter({ hasText: '(84) 028 38233 068' })).toHaveAttribute('href', 'tel:+842838233068');
  });

  test('CT-9: no request leaves the page origin before any click; map image has alt and the hub chip shows', async ({ page }) => {
    const urls: string[] = [];
    page.on('request', (r) => urls.push(r.url()));
    await openContact(page, 1920);
    await scrollThrough(page);
    await page.waitForLoadState('networkidle');
    const origin = new URL(page.url()).origin;
    const foreign = urls.filter((u) => !/^(data|blob|about):/.test(u) && new URL(u).origin !== origin);
    expect(foreign, 'third-party requests before the click').toEqual([]);
    expect(await page.locator('iframe').count()).toBe(0);
    const img = page.locator('#offices a[target="_blank"] img');
    await expect(img).toHaveCount(1);
    expect(((await img.getAttribute('alt')) ?? '').trim().length).toBeGreaterThan(0);
    expect(has(await sectionText(page, '#offices'), 'ACTIVE HUB: HCMC')).toBe(true);
  });

  test('CT-10: map is a static image linking to the maps provider in a new tab (build-guide decision 6); click opens it, page keeps no iframe', async ({ page, context }) => {
    await openContact(page, 1920);
    const link = page.locator('#offices a[target="_blank"]').filter({ has: page.locator('img') });
    await expect(link).toHaveCount(1);
    const href = (await link.getAttribute('href')) ?? '';
    const u = new URL(href); // must be absolute
    expect(u.protocol).toBe('https:');
    expect(u.origin).not.toBe(new URL(page.url()).origin);
    const rel = ((await link.getAttribute('rel')) ?? '').split(/\s+/);
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
    const name = (await link.evaluate((e) => (e.getAttribute('aria-label') ?? (e as HTMLElement).innerText ?? '').trim())) || (await link.locator('img').getAttribute('alt'));
    expect((name ?? '').length).toBeGreaterThan(0);
    // never hit the real provider from a test
    const origin = new URL(page.url()).origin;
    await context.route((url) => url.origin !== origin, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>stub</title>' }));
    const [popup] = await Promise.all([page.waitForEvent('popup'), link.click()]);
    expect(new URL(popup.url() === 'about:blank' ? href : popup.url()).host).toBe(u.host);
    expect(new URL(page.url()).pathname).toBe(CONTACT_PATH);
    expect(await page.locator('iframe').count()).toBe(0);
  });

  test('CT-11: the map link is reachable by Tab and Enter opens the provider in a new tab', async ({ page, context }) => {
    await openContact(page, 1920);
    const origin = new URL(page.url()).origin;
    await context.route((url) => url.origin !== origin, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>stub</title>' }));
    const target = await page.locator('#offices a[target="_blank"]').filter({ has: page.locator('img') }).getAttribute('href');
    let reached = false;
    for (let i = 0; i < 60 && !reached; i++) {
      await page.keyboard.press('Tab');
      reached = await page.evaluate(() => {
        const a = document.activeElement as HTMLAnchorElement | null;
        return !!a && a.tagName === 'A' && !!a.closest('#offices') && a.target === '_blank' && !!a.querySelector('img');
      });
    }
    expect(reached, 'map link reached by Tab').toBe(true);
    const ring = await page.evaluate(() => {
      const cs = getComputedStyle(document.activeElement as Element);
      return (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow !== 'none' && cs.boxShadow !== '');
    });
    expect(ring, 'visible focus ring on the map link').toBe(true);
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.keyboard.press('Enter')]);
    expect(new URL(popup.url() === 'about:blank' ? target! : popup.url()).host).toBe(new URL(target!).host);
    expect(await page.locator('iframe').count()).toBe(0);
  });
});

// ------------------------------------------------------------------------------------------------
test.describe('Contact: hours band', () => {
  test('CT-12: hours and notice texts', async ({ page }) => {
    await openContact(page);
    const t = await sectionText(page, '#hours');
    for (const s of ['Business Hours', 'Customs Hours', '08:00 - 18:00', '07:30 - 17:00', 'Custom working hours:', 'Normally effective time for clearance formalities:', 'Monday – Friday: 07:30 hour – 17:00hour', 'Customs offers on-duty'])
      expect(hasCI(t, s), s).toBe(true);
    expect(has(t, 'NOTICE')).toBe(true);
    expect(t.match(/Mon-Fri/gi) ?? []).toHaveLength(2);
  });

  test('CT-38: at 1920 the hours blocks and the notice sit in one row, in order', async ({ page }) => {
    await openContact(page, 1920);
    const b1 = await blockBox(page, '#hours', ['Business Hours', '08:00 - 18:00'], ['Customs Hours', 'NOTICE']);
    const b2 = await blockBox(page, '#hours', ['Customs Hours', '07:30 - 17:00'], ['Business Hours', 'NOTICE']);
    const bn = await blockBox(page, '#hours', ['NOTICE', 'Custom working hours:'], ['Business Hours', 'Customs Hours']);
    expect(b2.left).toBeGreaterThan(b1.right - 2);
    expect(bn.left).toBeGreaterThan(b2.right - 2);
    expect(b1.top).toBeLessThan(bn.bottom);
    expect(bn.top).toBeLessThan(b1.bottom);
  });

  test('CT-38: at 428 the two hour blocks and the notice are stacked with the same left edge', async ({ page }) => {
    await openContact(page, 428);
    const b1 = await blockBox(page, '#hours', ['Business Hours', '08:00 - 18:00'], ['Customs Hours', 'NOTICE']);
    const b2 = await blockBox(page, '#hours', ['Customs Hours', '07:30 - 17:00'], ['Business Hours', 'NOTICE']);
    const bn = await blockBox(page, '#hours', ['NOTICE', 'Custom working hours:'], ['Business Hours', 'Customs Hours']);
    expect(near(b1.left, b2.left)).toBe(true);
    expect(near(b1.left, bn.left)).toBe(true);
    expect(b2.top).toBeGreaterThanOrEqual(b1.bottom - 1);
    expect(bn.top).toBeGreaterThanOrEqual(b2.bottom - 1);
  });

  for (const w of [1024, 768]) {
    test(`CT-38: at ${w} the notice moves under the hour blocks`, async ({ page }) => {
      await openContact(page, w);
      const b1 = await blockBox(page, '#hours', ['Business Hours', '08:00 - 18:00'], ['Customs Hours', 'NOTICE']);
      const b2 = await blockBox(page, '#hours', ['Customs Hours', '07:30 - 17:00'], ['Business Hours', 'NOTICE']);
      const bn = await blockBox(page, '#hours', ['NOTICE', 'Custom working hours:'], ['Business Hours', 'Customs Hours']);
      expect(bn.top).toBeGreaterThanOrEqual(Math.max(b1.bottom, b2.bottom) - 1);
      expect(b2.left).toBeGreaterThan(b1.right - 2); // the two hour blocks share a row
    });
  }
});

// ------------------------------------------------------------------------------------------------
test.describe('Contact: key logistics contacts (org chart)', () => {
  test('CT-13: eyebrow, heading and exactly 7 person cards', async ({ page }) => {
    await openContact(page);
    const t = await sectionText(page, '#leadership');
    expect(hasCI(t, 'Our Leadership')).toBe(true);
    await expect(page.locator('#leadership').getByRole('heading', { name: 'Key Logistics Contacts' })).toBeVisible();
    expect(await orgCards(page)).toHaveLength(7);
    expect(t.match(/Ext:/g) ?? []).toHaveLength(7);
  });

  test('CT-14: cards in DOM order carry name, uppercase role and extension', async ({ page }) => {
    await openContact(page);
    const cards = await orgCards(page);
    expect(cards).toHaveLength(7);
    PEOPLE.forEach((p, i) => {
      expect(has(cards[i].text, p.name), `card ${i} name ${p.name}: ${cards[i].text}`).toBe(true);
      expect(has(cards[i].text, p.role), `card ${i} role ${p.role}: ${cards[i].text}`).toBe(true);
      expect(has(cards[i].text, p.ext), `card ${i} ${p.ext}: ${cards[i].text}`).toBe(true);
    });
  });

  test('CT-15: 7 mailto links, full @saigontrans.com.vn address equal to title; General Director address', async ({ page }) => {
    await openContact(page);
    const links = await page.locator('#leadership a[href^="mailto:"]').evaluateAll((as) =>
      as.map((a) => ({ href: a.getAttribute('href') ?? '', title: a.getAttribute('title') })),
    );
    expect(links).toHaveLength(7);
    links.forEach((l, i) => {
      expect(l.href).toMatch(/^mailto:[^@\s]+@saigontrans\.com\.vn$/);
      expect(l.title, `title of link ${i}`).toBe(l.href.replace(/^mailto:/, ''));
      expect(l.href.startsWith(`mailto:${PEOPLE[i].user}@`), `link ${i} is for ${PEOPLE[i].name}`).toBe(true);
    });
    expect(links[0].href).toBe('mailto:linhpham@saigontrans.com.vn');
  });

  test('CT-14: "Ext: NNN" is plain text, not a link (A9)', async ({ page }) => {
    await openContact(page);
    expect(await page.locator('#leadership a[href^="tel:"]').count()).toBe(0);
    const linked = await page.locator('#leadership').getByText(/Ext:\s*\d+/).evaluateAll((els) => els.map((e) => !!e.closest('a')));
    expect(linked).toHaveLength(7);
    expect(linked.every((x) => x === false)).toBe(true);
  });

  for (const w of [1920, 1280, 1024]) {
    test(`CT-16: at ${w} the tree has a centered top card, 4 aligned cards, row 2 under columns 1 and 3`, async ({ page }) => {
      await openContact(page, w);
      const c = await orgCards(page);
      expect(c).toHaveLength(7);
      expect(near((c[0].left + c[0].right) / 2, w / 2), `top card centre ${(c[0].left + c[0].right) / 2} vs ${w / 2}`).toBe(true);
      const row1 = c.slice(1, 5);
      for (const x of row1) expect(near(x.top, row1[0].top), 'level-1 cards share one top').toBe(true);
      for (let i = 1; i < 4; i++) expect(row1[i].left, 'level-1 cards ordered left to right').toBeGreaterThan(row1[i - 1].left + 10);
      expect(near(c[5].left, c[1].left), 'Huong Nguyen under Tieu Dieu').toBe(true);
      expect(near(c[6].left, c[3].left), 'Truc Long under Trang Anh').toBe(true);
      const row1Bottom = Math.max(...row1.map((x) => x.bottom));
      expect(c[5].top).toBeGreaterThan(row1Bottom);
      expect(c[6].top).toBeGreaterThan(row1Bottom);
      expect(c[1].top, 'row 1 below the top card').toBeGreaterThan(c[0].bottom);
    });
  }

  test('CT-17: at 1920 connectors exist and none reaches the second row', async ({ page }) => {
    await openContact(page, 1920);
    const c = await orgCards(page);
    const row1Top = Math.min(...c.slice(1, 5).map((x) => x.top));
    const lines = (await connectors(page)).filter((x) => x.visible);
    expect(lines.length).toBeGreaterThan(0);
    for (const l of lines) expect(l.bottom, 'connector bottom vs first row top').toBeLessThanOrEqual(row1Top + 1);
  });

  test('CT-18: at 428 the 7 cards are one column (same left and width), stacked in DOM order, no visible connector', async ({ page }) => {
    await openContact(page, 428);
    const c = await orgCards(page);
    expect(c).toHaveLength(7);
    for (const x of c) {
      expect(near(x.left, c[0].left), 'same left').toBe(true);
      expect(near(x.width, c[0].width), 'same width').toBe(true);
    }
    for (let i = 1; i < c.length; i++) expect(c[i].top, `card ${i} below card ${i - 1}`).toBeGreaterThanOrEqual(c[i - 1].bottom - 1);
    expect((await connectors(page)).filter((x) => x.visible)).toHaveLength(0);
    for (const x of c) expect(x.height, 'tap target >= 44px').toBeGreaterThanOrEqual(44);
  });

  test('CT-19: at 768 the six lower cards form exactly 2 columns, the top card is above them, no visible connector', async ({ page }) => {
    await openContact(page, 768);
    const c = await orgCards(page);
    expect(c).toHaveLength(7);
    const lefts: number[] = [];
    for (const x of c.slice(1)) if (!lefts.some((l) => near(l, x.left))) lefts.push(x.left);
    expect(lefts, 'distinct column left edges').toHaveLength(2);
    expect(c[1].top).toBeGreaterThan(c[0].bottom - 1);
    expect((await connectors(page)).filter((x) => x.visible)).toHaveLength(0);
  });
});

// ------------------------------------------------------------------------------------------------
test.describe('Contact: operation key persons', () => {
  test('CT-20: heading, 4 labels and the location/person pairs', async ({ page }) => {
    await openContact(page);
    await expect(page.locator('#operations').getByRole('heading', { name: 'Operation Key Persons' })).toBeVisible();
    const t = await sectionText(page, '#operations');
    for (const s of ['AIRPORT TERMINALS', 'SEA & LAND', 'WAREHOUSING', 'ECONOMIC ZONES']) expect(has(t, s), s).toBe(true);
    for (const [a, b] of [
      ['TCS Airport', 'Pham Trung Nghia'],
      ['SCSC Airport', 'Le Van Hoang'],
      ['Cat Lai Terminal', 'Ho Vu Khuong / Vo Dien Kim'],
      ['Bonded Warehouse TBS', 'Nguyen Van Ty'],
      ['Tan Thuan EPZ', 'Doan Cong Danh'],
    ])
      expect(hasCI(t, `${a} ${b}`), `${a} then ${b}`).toBe(true);
  });

  const panels = (page: Page) =>
    Promise.all([
      blockBox(page, '#operations', ['AIRPORT TERMINALS', 'SEA & LAND'], ['WAREHOUSING', 'ECONOMIC ZONES']),
      blockBox(page, '#operations', ['WAREHOUSING', 'ECONOMIC ZONES'], ['AIRPORT TERMINALS', 'SEA & LAND']),
    ]);

  test('CT-21: at 1920 the two panels are side by side', async ({ page }) => {
    await openContact(page, 1920);
    const [l, r] = await panels(page);
    expect(near(l.top, r.top)).toBe(true);
    expect(r.left).toBeGreaterThan(l.left + 100);
    expect(r.left).toBeGreaterThanOrEqual(l.right - 2);
  });

  for (const w of [768, 428]) {
    test(`CT-21: at ${w} the two panels are stacked`, async ({ page }) => {
      await openContact(page, w);
      const [l, r] = await panels(page);
      expect(near(l.left, r.left)).toBe(true);
      expect(r.top).toBeGreaterThanOrEqual(l.bottom - 1);
    });
  }

  test('CT-21: at 428 the heading "Operation Key Persons" is left aligned', async ({ page }) => {
    await openContact(page, 428);
    const h = await page.locator('#operations').getByRole('heading', { name: 'Operation Key Persons' }).evaluate((e) => getComputedStyle(e).textAlign);
    expect(['left', 'start']).toContain(h);
  });
});

// ------------------------------------------------------------------------------------------------
test.describe('Contact: quote section content and form structure', () => {
  test('CT-22: heading, neutral intro (no "4 hours" promise), photo texts, submit button', async ({ page }) => {
    await openContact(page, 1920);
    await expect(quote(page).getByRole('heading', { name: 'Request a Project Quote' })).toBeVisible();
    const t = await sectionText(page, '#project-quote');
    expect(hasCI(t, 'Kinetic Efficiency')).toBe(true);
    expect(hasCI(t, "Leveraging Vietnam's strategic position with precision logistics and real-time manifest tracking.")).toBe(true);
    await expect(submitButton(page)).toBeVisible();
    expect(has(norm(await submitButton(page).innerText()), 'INITIALIZE INQUIRY')).toBe(true);
    expect(t, 'build-guide decision 2: no response-time promise').not.toMatch(/4 hours/i);
    expect(t).not.toMatch(/respond within/i);
    // a neutral intro sentence exists between the heading and the first field
    const ok = await page.evaluate(() => {
      const q = document.querySelector('#project-quote')!;
      const h = Array.from(q.querySelectorAll('h2')).find((e) => /request a project quote/i.test(e.textContent ?? ''))!;
      const first = q.querySelector('[name="first_name"]')!.getBoundingClientRect();
      const hb = h.getBoundingClientRect();
      return Array.from(q.querySelectorAll('p')).some((p) => {
        const r = p.getBoundingClientRect();
        return (p.textContent ?? '').trim().length > 10 && r.top >= hb.bottom - 1 && r.bottom <= first.top + 1 && r.width > 0;
      });
    });
    expect(ok, 'intro paragraph between heading and first field').toBe(true);
  });

  test('CT-23: controls in DOM order, tags, labels, placeholders, one hidden honeypot', async ({ page }) => {
    await openContact(page, 1920);
    const info = await page.evaluate(() => {
      const form = document.querySelector('#project-quote form') as HTMLFormElement;
      const els = Array.from(form.querySelectorAll<HTMLInputElement>('input, select, textarea')).filter((e) => e.type !== 'hidden' && e.name !== 'website');
      const hp = Array.from(form.querySelectorAll<HTMLInputElement>('[name="website"]'));
      const vis = (e: HTMLElement) => {
        const r = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0 && r.right > 0 && r.left > -500;
      };
      return {
        order: els.map((e) => e.name),
        tags: els.map((e) => e.tagName.toLowerCase()),
        labels: els.map((e) => Array.from(e.labels ?? []).map((l) => (l.textContent ?? '').replace(/\s+/g, ' ').trim()).join(' ')),
        placeholders: els.map((e) => e.getAttribute('placeholder')),
        hp: hp.map((e) => ({ hidden: !vis(e), tabindex: e.getAttribute('tabindex') })),
      };
    });
    expect(info.order).toEqual([...FORM_FIELDS]);
    expect(info.tags).toEqual(['input', 'input', 'input', 'input', 'select', 'input', 'textarea']);
    expect(info.labels.map((l) => l.toLowerCase())).toEqual(['first name', 'last name', 'corporate email', 'phone number', 'service type', 'estimated volume', 'project brief']);
    expect(info.placeholders[0]).toBe('Enter first name');
    expect(info.placeholders[1]).toBe('Enter last name');
    expect(info.placeholders[2]).toBe('name@company.com');
    expect(info.placeholders[3]).toBe('+1 (555) 000-0000');
    expect(info.placeholders[5]).toBe('e.g. 50 containers/month');
    expect(info.placeholders[6]).toBe('Describe your logistics challenges...');
    expect(info.hp).toHaveLength(1);
    expect(info.hp[0].hidden).toBe(true);
    expect(info.hp[0].tabindex).toBe('-1');
  });

  test('CT-24: service_type first option is the empty placeholder, followed by one option per service (slug values, unique)', async ({ page }) => {
    await openContact(page);
    const opts = await serviceOptions(page);
    expect(opts[0]).toEqual({ value: '', label: 'Select Logistics Service' });
    expect(await field(page, 'service_type').inputValue(), 'placeholder selected by default').toBe('');
    const rest = opts.slice(1);
    expect(rest.length).toBeGreaterThan(0);
    for (const o of rest) {
      expect(o.value).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(o.label.length).toBeGreaterThan(0);
    }
    expect(new Set(rest.map((o) => o.value)).size).toBe(rest.length);
  });

  test('CT-25: exactly 7 visible inputs/selects/textareas, no checkbox', async ({ page }) => {
    await openContact(page);
    const n = await page.evaluate(() => {
      const form = document.querySelector('#project-quote form')!;
      return Array.from(form.querySelectorAll<HTMLInputElement>('input, select, textarea')).filter((e) => {
        if (e.type === 'hidden' || e.name === 'website') return false;
        const r = e.getBoundingClientRect();
        return r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden';
      }).length;
    });
    expect(n).toBe(7);
    await expect(page.locator('#project-quote input[type="checkbox"]')).toHaveCount(0);
    for (const bad of ['company', 'country', 'job_title']) await expect(field(page, bad)).toHaveCount(0);
  });
});

// ------------------------------------------------------------------------------------------------
test.describe('Contact: form behaviour', () => {
  test('CT-26: valid required fields only -> success block (role=status, focused), lead stored with source_page /en/contact', async ({ page }) => {
    await openContact(page);
    const v = validValues();
    await fillForm(page, v);
    await submitButton(page).click();
    const status = quote(page).locator('[role="status"]');
    await expect(status).toBeVisible();
    await expect.poll(() => page.evaluate(() => { const s = document.querySelector('#project-quote [role="status"]'); return !!s && (s === document.activeElement || s.contains(document.activeElement)); })).toBe(true);
    const cleared = await page.evaluate(() => {
      const f = document.querySelector('#project-quote form');
      if (!f) return true;
      return Array.from(f.querySelectorAll<HTMLInputElement>('input:not([type="hidden"]), textarea')).every((e) => e.name === 'website' || e.value === '');
    });
    expect(cleared, 'form is gone or cleared').toBe(true);
    await expect(quote(page).locator('[aria-invalid="true"]')).toHaveCount(0);
    const [lead] = await expectLeads(v.tag, 1);
    expect(lead).toMatchObject({ first_name: v.first_name, last_name: v.last_name, email: v.email, phone: v.phone, source_page: '/en/contact', locale: 'en' });
    expect(['pending', 'sent']).toContain(lead.email_status);
    expect('website' in lead).toBe(false);
  });

  test('CT-27: all fields filled -> service_type, estimated_volume and message are stored', async ({ page }) => {
    await openContact(page);
    const v = validValues();
    const slug = (await serviceOptions(page))[1].value;
    await fillForm(page, { ...v, service_type: slug, estimated_volume: '50 containers/month', message: 'Test brief' });
    await submitButton(page).click();
    await expect(quote(page).locator('[role="status"]')).toBeVisible();
    const [lead] = await expectLeads(v.tag, 1);
    expect(lead).toMatchObject({ service_type: slug, estimated_volume: '50 containers/month', message: 'Test brief', source_page: '/en/contact' });
  });

  test('CT-28: empty submit -> errors on the 4 required fields only, focus on first_name, nothing stored', async ({ page }) => {
    await openContact(page);
    const before = readLeads().length;
    await submitButton(page).click();
    for (const n of REQUIRED_FIELDS) {
      expect(await isInvalid(page, n), `${n} aria-invalid`).toBe(true);
      expect((await describedText(page, n)).length, `${n} has a visible message through aria-describedby`).toBeGreaterThan(0);
    }
    for (const n of OPTIONAL_FIELDS) expect(await isInvalid(page, n, false), `${n} must not be invalid`).toBe(false);
    await expect.poll(() => focusedName(page)).toBe('first_name');
    await expect(quote(page).locator('[role="status"]')).toHaveCount(0);
    await page.waitForTimeout(600);
    expect(readLeads().length).toBe(before);
  });

  test('CT-28: the error message of a field sits under that field', async ({ page }) => {
    await openContact(page);
    await submitButton(page).click();
    await expect.poll(() => describedText(page, 'email')).not.toBe('');
    const ok = await field(page, 'email').evaluate((el) => {
      const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
      const fb = el.getBoundingClientRect();
      return ids.some((id) => {
        const d = document.getElementById(id);
        return !!d && (d.textContent ?? '').trim().length > 0 && d.getBoundingClientRect().top >= fb.bottom - 2;
      });
    });
    expect(ok).toBe(true);
  });

  test('CT-29: invalid email -> only the email error, nothing stored', async ({ page }) => {
    await openContact(page);
    const v = validValues();
    await fillForm(page, { ...v, email: 'not-an-email' });
    await submitButton(page).click();
    expect(await isInvalid(page, 'email')).toBe(true);
    for (const n of FORM_FIELDS.filter((x) => x !== 'email')) expect(await isInvalid(page, n, false), `${n} must not be invalid`).toBe(false);
    await expect.poll(() => focusedName(page)).toBe('email');
    await expect(quote(page).locator('[role="status"]')).toHaveCount(0);
    await expectNoLead(page, v.tag);
  });

  test('CT-30: honeypot filled -> UI shows success, nothing stored', async ({ page }) => {
    await openContact(page);
    const v = validValues();
    await fillForm(page, v);
    await field(page, 'website').evaluate((el) => {
      (el as HTMLInputElement).value = 'http://spam.example';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await submitButton(page).click();
    await expect(quote(page).locator('[role="status"]')).toBeVisible();
    await expectNoLead(page, v.tag);
  });

  test('CT-31: 5 valid submissions pass, the 6th is rejected with role=alert, not stored; invalid ones did not count', async ({ page }) => {
    test.setTimeout(150_000);
    // 3 invalid submissions first: they must not consume the quota
    await openContact(page);
    for (let i = 0; i < 3; i++) await submitButton(page).click();
    for (let i = 1; i <= 5; i++) {
      await openContact(page);
      const v = validValues();
      await fillForm(page, v);
      await submitButton(page).click();
      await expect(quote(page).locator('[role="status"]'), `valid submission ${i}`).toBeVisible();
      await expectLeads(v.tag, 1);
    }
    await openContact(page);
    const sixth = validValues();
    await fillForm(page, { ...sixth, message: 'kept after error' });
    await submitButton(page).click();
    const alert = quote(page).locator('[role="alert"]').filter({ hasText: /\S/ });
    await expect(alert.first()).toBeVisible();
    await expect(quote(page).locator('[role="status"]')).toHaveCount(0);
    expect(await field(page, 'first_name').inputValue(), 'typed values stay after an error (A11d)').toBe(sixth.first_name);
    expect(await field(page, 'message').inputValue()).toBe('kept after error');
    await expect.poll(() => page.evaluate(() => { const a = document.activeElement as HTMLElement | null; return !!a && !!a.closest('#project-quote [role="alert"]'); })).toBe(true);
    expect(await submitButton(page).isEnabled(), 'visitor can retry').toBe(true);
    await expectNoLead(page, sixth.tag);
  });

  test('CT-33: double click sends once; the button is disabled and aria-busy while in flight', async ({ page }) => {
    await openContact(page);
    await page.route('**/en/contact', async (route) => {
      if (route.request().method() === 'POST') await new Promise((r) => setTimeout(r, 1000));
      await route.continue();
    });
    const v = validValues();
    await fillForm(page, v);
    const btn = submitButton(page);
    await btn.dblclick();
    await expect(btn).toBeDisabled({ timeout: 800 });
    await expect(btn).toHaveAttribute('aria-busy', 'true');
    await expect(quote(page).locator('[role="status"]')).toBeVisible();
    await page.waitForTimeout(1200);
    await expectLeads(v.tag, 1);
  });

  test('CT-34: the success text states no number of hours or days and no "within"', async ({ page }) => {
    await openContact(page);
    await fillForm(page, validValues());
    await submitButton(page).click();
    const s = quote(page).locator('[role="status"]');
    await expect(s).toBeVisible();
    const txt = norm(await s.innerText());
    expect(txt.length).toBeGreaterThan(0);
    expect(txt).not.toMatch(/\bwithin\b/i);
    expect(txt).not.toMatch(/\d/);
    expect(txt).not.toMatch(/\b(hours?|days?|minutes?)\b/i);
  });

  test('CT-35: a submit from the Home form is not stored with source_page /en/contact', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    const tag = uniqueTag();
    const home = page.locator('#quote');
    await home.getByLabel(/first name/i).first().fill('An');
    await home.getByLabel(/last name/i).first().fill(tag);
    await home.getByLabel(/email/i).first().fill(`${tag.toLowerCase()}@example.com`);
    await home.getByLabel(/phone/i).first().fill('0901234567');
    await home.locator('button[type="submit"]').first().click();
    const [lead] = await expectLeads(tag, 1);
    expect(lead.source_page).not.toBe('/en/contact');
    expect(typeof lead.source_page).toBe('string');
  });
});

// ------------------------------------------------------------------------------------------------
test.describe('Contact: partners, responsive and header', () => {
  test('CT-36: partners block: eyebrow, heading, the same 7 logos as Home, white background', async ({ page }) => {
    await openContact(page, 1920);
    await scrollThrough(page);
    const t = await sectionText(page, '#partners');
    expect(hasCI(t, 'Our Key')).toBe(true);
    expect(has(t, 'Partners & Clients')).toBe(true);
    const keys = (sel: string) => (p: Page) =>
      p.evaluate((s) => {
        const root = (s === '#partners' ? document.querySelector(s) : Array.from(document.querySelectorAll('section')).find((x) => /partners\s*(&|and)\s*clients/i.test(x.querySelector('h2')?.textContent ?? ''))) as HTMLElement;
        return Array.from(root.querySelectorAll('img')).map((i) => {
          const src = i.getAttribute('src') ?? '';
          const m = /[?&]url=([^&]+)/.exec(src);
          return i.getAttribute('alt') || (m ? decodeURIComponent(m[1]) : src);
        });
      }, sel);
    const contactLogos = await keys('#partners')(page);
    expect(contactLogos).toHaveLength(7);
    const bg = await page.locator('#partners').evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(bg).toBe('rgb(255, 255, 255)');
    await page.goto('/en');
    await scrollThrough(page);
    const homeLogos = await keys('home')(page);
    expect([...contactLogos].sort()).toEqual([...homeLogos].sort());
  });

  test('CT-37: at 428 the form card spans the container, photo and overlay are hidden, the form stays operable', async ({ page }) => {
    await openContact(page, 428);
    const card = await page.evaluate(() => {
      const q = document.querySelector('#project-quote')!;
      let el: HTMLElement | null = q.querySelector('[name="first_name"]') as HTMLElement;
      while (el && el !== q) {
        const bg = getComputedStyle(el).backgroundColor;
        if (!/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/.test(bg)) break;
        el = el.parentElement;
      }
      const r = el!.getBoundingClientRect();
      return { left: r.left, right: r.right, width: r.width };
    });
    expect(card.left).toBeGreaterThanOrEqual(0);
    expect(card.right).toBeLessThanOrEqual(428);
    expect(card.width, 'card spans the 428 container minus its side padding').toBeGreaterThanOrEqual(394);
    await expect(quote(page).getByText('Kinetic Efficiency')).toBeHidden();
    const visibleContentImages = await page.locator('#project-quote img').evaluateAll((imgs) =>
      imgs.filter((i) => (i.getAttribute('alt') ?? '').trim() !== '' && (i as HTMLElement).getBoundingClientRect().width > 0 && getComputedStyle(i).display !== 'none').length,
    );
    expect(visibleContentImages, 'truck photo hidden').toBe(0);
    const v = validValues();
    await fillForm(page, v);
    await submitButton(page).click();
    await expect(quote(page).locator('[role="status"]')).toBeVisible();
    const [lead] = await expectLeads(v.tag, 1);
    expect(lead.source_page).toBe('/en/contact');
  });

  test('CT-39: offices stack with the map below the text at 768', async ({ page }) => {
    await openContact(page, 768);
    const text = await page.locator('#offices').getByRole('heading', { name: 'SAIGONTRANSERVICE' }).boundingBox();
    const map = await page.locator('#offices a[target="_blank"] img').boundingBox();
    expect(text && map).toBeTruthy();
    expect(map!.y).toBeGreaterThanOrEqual(text!.y + text!.height - 1);
  });

  for (const w of S5_WIDTHS) {
    test(`CT-39: no horizontal scroll at ${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: HEIGHT_FOR(w) });
      await page.goto(CONTACT_PATH);
      await page.waitForLoadState('networkidle');
      await scrollThrough(page);
      const { sw, cw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, iw: window.innerWidth }));
      expect(sw).toBeLessThanOrEqual(cw);
      expect(sw).toBeLessThanOrEqual(iw);
    });
  }

  test('CT-40: at 428 the hamburger is visible and the language selector is present', async ({ page }) => {
    await openContact(page, 428);
    await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible();
    expect(await page.locator('header').getByText(/english/i).count()).toBeGreaterThan(0);
  });

  test('CT-41: Tab order: nav, hero buttons, map link, tel, mailto, 7 org emails, 7 controls, submit; visible focus on each', async ({ page }) => {
    test.setTimeout(60_000);
    await openContact(page, 1920);
    type Seen = { tag: string; href: string; name: string; text: string; sec: string; ring: boolean; hasImg: boolean };
    const seq: Seen[] = [];
    for (let i = 0; i < 160; i++) {
      await page.keyboard.press('Tab');
      const d = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const sec = el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : (el.closest('section[id]')?.id ?? '');
        return {
          tag: el.tagName.toLowerCase(),
          href: el.getAttribute('href') ?? '',
          name: (el as HTMLInputElement).name ?? '',
          text: (el.innerText ?? '').replace(/\s+/g, ' ').trim(),
          sec,
          ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow !== 'none' && cs.boxShadow !== ''),
          hasImg: !!el.querySelector('img'),
        };
      });
      if (d) seq.push(d);
      if (d && d.tag === 'button' && /initialize inquiry/i.test(d.text)) break;
    }
    const milestones: [string, (s: Seen) => boolean][] = [
      ['nav', (s) => s.sec === 'header' && /^(home|pages|services|about|news|contact)\b/i.test(s.text)],
      ['hero: Explore The Services', (s) => s.sec === 'contact-hero' && /explore the services/i.test(s.text)],
      ['hero: Contact Us', (s) => s.sec === 'contact-hero' && /^contact us/i.test(s.text)],
      ['map link', (s) => s.sec === 'offices' && s.tag === 'a' && s.hasImg],
      ['tel', (s) => s.sec === 'offices' && s.href.startsWith('tel:')],
      ['mailto', (s) => s.sec === 'offices' && s.href === 'mailto:linhpham@saigontrans.com.vn'],
      ...PEOPLE.map((p): [string, (s: Seen) => boolean] => [`org email ${p.name}`, (s) => s.sec === 'leadership' && s.href.startsWith(`mailto:${p.user}@`)]),
      ...FORM_FIELDS.map((n): [string, (s: Seen) => boolean] => [`field ${n}`, (s) => s.sec === 'project-quote' && s.name === n]),
      ['submit', (s) => s.sec === 'project-quote' && s.tag === 'button' && /initialize inquiry/i.test(s.text)],
    ];
    let from = 0;
    for (const [label, pred] of milestones) {
      const idx = seq.findIndex((s, i) => i >= from && pred(s));
      expect(idx, `Tab reaches "${label}" after the previous milestone`).toBeGreaterThanOrEqual(0);
      expect(seq[idx].ring, `visible focus indicator on "${label}"`).toBe(true);
      from = idx + 1;
    }
    expect(seq.some((s) => s.name === 'website'), 'honeypot is not tabbable').toBe(false);
  });
});
