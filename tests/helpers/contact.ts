// Helpers for the Contact page tests (derived from docs/pages/contact.md and docs/pages/_build-guide.md).
import { expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const CONTACT_PATH = '/en/contact';
export const SECTION_IDS = ['contact-hero', 'offices', 'hours', 'leadership', 'operations', 'project-quote', 'partners', 'cta'] as const;

/** Widths of requirements S5. */
export const S5_WIDTHS = [320, 360, 375, 428, 600, 768, 900, 1024, 1180, 1280, 1366, 1440, 1536, 1920];
export const HEIGHT_FOR = (w: number) => (w >= 1280 ? 1080 : w >= 768 ? 1024 : 900);

export const PEOPLE = [
  { name: 'Linh Pham', role: 'GENERAL DIRECTOR', user: 'linhpham', ext: 'Ext: 101' },
  { name: 'Tieu Dieu', role: 'CHIEF ACCOUNTANT', user: 'tieudieu', ext: 'Ext: 302' },
  { name: 'Khoa Pham', role: 'VICE DIRECTOR', user: 'khoapham', ext: 'Ext: 102' },
  { name: 'Trang Anh', role: 'IMPORT MANAGER', user: 'tranganh', ext: 'Ext: 201' },
  { name: 'Nhu Quynh', role: 'IMPORT CHEMICAL', user: 'quynhnhu', ext: 'Ext: 205' },
  { name: 'Huong Nguyen', role: 'CONTROL DEBIT NOTE', user: 'huongnguyen', ext: 'Ext: 301' },
  { name: 'Truc Long', role: 'EXPORT MANAGER', user: 'truclong', ext: 'Ext: 202' },
] as const;

export const FORM_FIELDS = ['first_name', 'last_name', 'email', 'phone', 'service_type', 'estimated_volume', 'message'] as const;
export const REQUIRED_FIELDS = ['first_name', 'last_name', 'email', 'phone'] as const;
export const OPTIONAL_FIELDS = ['service_type', 'estimated_volume', 'message'] as const;

/** Collapse whitespace (including nbsp) so wrapped text compares equal. */
export const norm = (s: string) => s.replace(/[\s ]+/g, ' ').trim();

export async function sectionText(page: Page, sel: string): Promise<string> {
  return norm(await page.locator(sel).first().innerText());
}

/** Case-insensitive containment (for strings the page may or may not upper-case with CSS). */
export const hasCI = (haystack: string, needle: string) => norm(haystack).toLowerCase().includes(norm(needle).toLowerCase());
/** Case-sensitive containment on whitespace-normalized rendered text (innerText applies text-transform). */
export const has = (haystack: string, needle: string) => norm(haystack).includes(norm(needle));

let ipCounter = 0;
/** One forged client IP per test, so the 5-per-10-minutes limit never bleeds between tests. */
export const uniqueIp = () => `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${(++ipCounter % 250) + 1}`;

let tagCounter = 0;
export const uniqueTag = (prefix = 'Ct') => `${prefix}${Date.now().toString(36)}${(++tagCounter).toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

export async function openContact(page: Page, width = 1920, height = HEIGHT_FOR(width)) {
  await page.setViewportSize({ width, height });
  const res = await page.goto(CONTACT_PATH);
  await page.waitForLoadState('networkidle');
  return res;
}

export const quote = (page: Page) => page.locator('#project-quote');
export const field = (page: Page, name: string) => page.locator(`#project-quote [name="${name}"]`);
export const submitButton = (page: Page) => page.locator('#project-quote').getByRole('button', { name: /initialize inquiry/i });

export type FormValues = Partial<Record<(typeof FORM_FIELDS)[number], string>>;

export function validValues(tag = uniqueTag()): Required<Pick<FormValues, 'first_name' | 'last_name' | 'email' | 'phone'>> & { tag: string } {
  return { first_name: 'An', last_name: tag, email: `${tag.toLowerCase()}@example.com`, phone: '0901234567', tag };
}

export async function fillForm(page: Page, v: FormValues) {
  for (const [name, value] of Object.entries(v)) {
    if (value === undefined || !(FORM_FIELDS as readonly string[]).includes(name)) continue;
    const f = field(page, name);
    if (name === 'service_type') {
      if (/^index:\d+$/.test(value)) await f.selectOption({ index: Number(value.slice(6)) });
      else await f.selectOption(value);
    } else await f.fill(value);
  }
}

/** The value of every non-empty option of `service_type` (slugs). */
export async function serviceOptions(page: Page): Promise<{ value: string; label: string }[]> {
  return field(page, 'service_type').evaluate((sel) =>
    Array.from((sel as HTMLSelectElement).options).map((o) => ({ value: o.value, label: (o.textContent ?? '').trim() })),
  );
}

// ---------------------------------------------------------------------------------------------
// Stored leads as seen from the e2e process: the server runs with LEADS_DIR (playwright.config.ts).
// The file format is not part of the spec, so the reader accepts JSON files (object, array, nested)
// and JSON-lines files and collects every object that looks like a Lead (has `email` and `source_page`).
// ---------------------------------------------------------------------------------------------
export type StoredLead = Record<string, unknown>;

export const LEADS_DIR = process.env.LEADS_DIR ?? '/tmp/sg-trans-e2e-leads';

function collect(v: unknown, out: StoredLead[]) {
  if (Array.isArray(v)) v.forEach((x) => collect(x, out));
  else if (v && typeof v === 'object') {
    const o = v as StoredLead;
    if ('email' in o && 'source_page' in o) out.push(o);
    else Object.values(o).forEach((x) => collect(x, out));
  }
}

function filesIn(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) filesIn(full, out);
    else out.push(full);
  }
  return out;
}

export function readLeads(): StoredLead[] {
  const out: StoredLead[] = [];
  for (const f of filesIn(LEADS_DIR)) {
    const raw = fs.readFileSync(f, 'utf8');
    try {
      collect(JSON.parse(raw), out);
    } catch {
      for (const line of raw.split('\n')) {
        if (!line.trim()) continue;
        try {
          collect(JSON.parse(line), out);
        } catch {
          /* not a lead line */
        }
      }
    }
  }
  return out;
}

export const leadsWithLastName = (tag: string) => readLeads().filter((l) => l.last_name === tag);

/** Waits (bounded) until exactly `count` leads with this unique last name are stored, returns them. */
export async function expectLeads(tag: string, count: number, timeout = 8000): Promise<StoredLead[]> {
  await expect.poll(() => leadsWithLastName(tag).length, { timeout, message: `leads stored for ${tag} (dir ${LEADS_DIR})` }).toBe(count);
  return leadsWithLastName(tag);
}

/** Asserts no lead with this unique last name appears, after giving the server a moment. */
export async function expectNoLead(page: Page, tag: string) {
  await page.waitForTimeout(800);
  expect(leadsWithLastName(tag), `no lead may be stored for ${tag}`).toHaveLength(0);
}

// ---------------------------------------------------------------------------------------------
// DOM probes
// ---------------------------------------------------------------------------------------------
export type Box = { left: number; top: number; right: number; bottom: number; width: number; height: number };

export type OrgCard = Box & { text: string; href: string | null; title: string | null };

/** The 7 org-chart cards in DOM order. A card = the outermost ancestor of a mailto link that holds exactly one "Ext:" and has a >= 3px top border (fallback: innermost ancestor with that Ext). */
export async function orgCards(page: Page): Promise<OrgCard[]> {
  return page.evaluate(() => {
    const n = (s: string) => s.replace(/[\s ]+/g, ' ').trim();
    const sec = document.querySelector('#leadership') as HTMLElement;
    const links = Array.from(sec.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]'));
    return links.map((a) => {
      const chain: HTMLElement[] = [];
      let el: HTMLElement | null = a;
      while (el && el !== sec) {
        const c = ((el.innerText || '').match(/Ext:/gi) || []).length;
        if (c === 1) chain.push(el);
        else if (c > 1) break;
        el = el.parentElement;
      }
      const card = chain.find((e) => parseFloat(getComputedStyle(e).borderTopWidth) >= 3) ?? chain[0] ?? a;
      const r = card.getBoundingClientRect();
      return {
        text: n(card.innerText),
        href: a.getAttribute('href'),
        title: a.getAttribute('title'),
        left: r.left, top: r.top + window.scrollY, right: r.right, bottom: r.bottom + window.scrollY, width: r.width, height: r.height,
      };
    });
  });
}

/** Boxes (document coordinates) of every `[data-testid="org-connector"]`, with visibility. */
export async function connectors(page: Page): Promise<(Box & { visible: boolean })[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-testid="org-connector"]')).map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      let hiddenByAncestor = false;
      for (let p: HTMLElement | null = el; p; p = p.parentElement) if (getComputedStyle(p).display === 'none') hiddenByAncestor = true;
      const visible = !hiddenByAncestor && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0 && r.width > 0 && r.height > 0;
      return { left: r.left, top: r.top + window.scrollY, right: r.right, bottom: r.bottom + window.scrollY, width: r.width, height: r.height, visible };
    }),
  );
}

/**
 * Box of a "block": the outermost ancestor that contains every text in `inside` and none of `outside`.
 * Texts are matched case-insensitively against the smallest element that contains them.
 */
export async function blockBox(page: Page, sectionSel: string, inside: string[], outside: string[] = []): Promise<Box> {
  const r = await page.evaluate(
    ({ sectionSel, inside, outside }) => {
      const n = (s: string) => s.replace(/[\s ]+/g, ' ').trim().toLowerCase();
      const sec = document.querySelector(sectionSel) as HTMLElement;
      const all = Array.from(sec.querySelectorAll<HTMLElement>('*'));
      const find = (t: string) => {
        const want = n(t);
        const hits = all.filter((e) => n(e.innerText || '').includes(want));
        hits.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length);
        return hits[0] ?? null;
      };
      const ins = inside.map(find);
      const outs = outside.map(find);
      if (ins.some((e) => !e)) return { error: `not found: ${inside.filter((_, i) => !ins[i]).join(', ')}` };
      let el: HTMLElement = ins[0]!;
      while (el !== sec && !ins.every((i) => el.contains(i!))) el = el.parentElement!;
      if (outs.some((o) => o && el.contains(o))) return { error: 'common ancestor of inside texts also holds an outside text' };
      while (el.parentElement && el.parentElement !== sec && !outs.some((o) => o && el.parentElement!.contains(o))) el = el.parentElement;
      const b = el.getBoundingClientRect();
      return { left: b.left, top: b.top + window.scrollY, right: b.right, bottom: b.bottom + window.scrollY, width: b.width, height: b.height };
    },
    { sectionSel, inside, outside },
  );
  if ('error' in r) throw new Error(`blockBox(${sectionSel}): ${r.error}`);
  return r as Box;
}

export const near = (a: number, b: number, tol = 2) => Math.abs(a - b) <= tol;

/** Scroll in steps so lazy images load, then wait for images (bounded), then return to top. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await sleep(120);
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
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
  });
  await page.waitForTimeout(200);
}
