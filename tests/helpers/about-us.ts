// Helpers for the About Us tests (spec: docs/pages/about-us.md). Black-box: only text, roles and geometry.
import type { Page } from '@playwright/test';

export const ABOUT_PATH = '/en/about-us';

/** S5 widths (requirements) plus the spec widths. */
export const S5_WIDTHS = [320, 360, 375, 428, 600, 768, 900, 1024, 1180, 1280, 1366, 1440, 1536, 1920];

export const TITLE = 'About Saigontrans | End-to-End Logistics in Vietnam';

export const HERO = {
  h1: 'ABOUT SAIGONTRANS',
  subtitle: 'SAIGON TRANS — A logistics bridge for a prosperous Vietnam',
  primary: 'Explore The Services',
  secondary: 'Contact Us',
};

export const INTRO = {
  eyebrow: 'About Saigontrans',
  h2: 'End-to-End Logistics Solutions',
  p1: "With 26 years of experience, Saigontrans provides comprehensive End-to-End logistics solutions. Our vision is to become the admired National Champion in Vietnam's logistics industry.",
  p2: 'We are committed to building an integrated, future-ready ecosystem founded on safety, trust, and on-time delivery.',
  primary: 'View Services',
  secondary: 'Read More',
  years: '26+',
  yearsLabel: 'Years Of Experience',
  rating: '5.0',
};

export const CAPABILITIES: { title: string; detail: string | null }[] = [
  { title: 'Trucks and trailers', detail: '38 trucks, 31 trailers' },
  { title: 'Container 40’HC', detail: '(20 PCS, rental)' },
  { title: 'Tank Container truck', detail: null },
  { title: 'Prime mover for port haul', detail: '05 Units' },
  { title: 'Skillful Manpower / Experienced drivers', detail: '25 staff, 45 drivers (B2, C, FC)' },
  { title: 'Skillful mechanical engineering', detail: '03 Persons' },
  { title: 'Trained Vehicle operation Staff', detail: '03 Persons' },
  { title: 'Trucking park in Biên Hoà Province', detail: null },
];

export const VISION = {
  title: 'Our Vision',
  text: 'To position Saigontrans Logistics as the admired National Champion in the logistics industry of Vietnam',
};
export const MISSION = {
  title: 'Our Mission',
  text: 'To create the most integrated and future-ready ecosystem for contract logistics, built on a foundation of trust and exceptional goodwill to those we serve.',
};

export const VALUES_HEADING = { eyebrow: 'Services', h2: 'Our Core Values' };

export const SOT_COL1 = [
  'Safety first, we consider safe delivery and safe driving our top priority',
  'On time delivery',
];
export const SOT_COL2 =
  'For 26 years, on-time delivery has been the cornerstone of our logistics service. This unwavering commitment to punctuality reflects our dedication to reliability, operational excellence, and customer satisfaction.';
export const SOT_COL3 =
  'Trust means safeguarding every shipment, honoring every deadline, navigating customs with precision, resolving challenges with expertise, and delivering excellence at every step. When trust leads the way, everyone wins.';

export const CORE_VALUES: { title: string; bodies: string[] }[] = [
  {
    title: 'INTERGRATED LOGISTICS',
    bodies: [
      "We provide solution for transport of our Customers' Supply Chains, provide a skill team for custom clearances. Through our expertise, service diversification, and extensive asset owner ship, we possess all the means to provide End-to-End logistic solutions.",
    ],
  },
  {
    title: 'CUSTOMER SATISFACTION',
    bodies: [
      'We listen to our customers and understand their needs. We design tailor-made solutions that suit their goals and challenges. We deliver on our promises and ensure customer satisfaction.',
    ],
  },
  { title: 'SOT', bodies: [...SOT_COL1, SOT_COL2, SOT_COL3] },
  {
    title: 'OPERATION EXCELLENCE',
    bodies: [
      'Planning transportation, preparing complete documentation, inspecting goods before delivery, managing and distributing efficiently, monitoring the transportation process, closely collaborating with logistics partners, and storing records and delivery reports. We utilize advanced technology and best practices to enhance operational efficiency and performance.',
    ],
  },
  {
    title: 'QUALITY',
    bodies: [
      'We strive for excellence in our services and ensure quality control systems are implemented. Our certified quality management systems GSP-CCTV 24/7 compliant, Safety and delivery on time is value of services of Saigontrans',
    ],
  },
  {
    title: 'TEAMWORK',
    bodies: [
      'We work together as one team. We respect each other and value diversity. We share knowledge and ideas. We support each other and celebrate our achievements.',
    ],
  },
];

export const PARTNERS = { eyebrow: 'Our Key', h2: 'Partners & Clients' };

export const CTA = {
  h2: 'READY TO OPTIMIZE YOUR SUPPLY CHAIN?',
  quote: 'REQUEST A FREE QUOTE',
  sales: 'CONTACT SALES',
};

/** Order of headings for AB-2. */
export const HEADING_ORDER = [
  HERO.h1,
  INTRO.h2,
  VISION.title,
  VALUES_HEADING.h2,
  PARTNERS.h2,
  CTA.h2,
];

export const strip = (s: string) => s.replace(/\s+/g, '');

export type Box = { left: number; top: number; right: number; bottom: number; width: number; height: number };

export type CardInfo = {
  title: string;
  found: boolean;
  /** whitespace-stripped text of the card (no markup) */
  text: string;
  box: Box | null;
  titleBox: Box | null;
  /** interactive descendants (a[href], button, tabindex>=0, role=button/link) */
  interactive: number;
};

/** Installed before every navigation; in-page utilities used through `probe*` below. */
export async function installProbe(page: Page): Promise<void> {
  await page.addInitScript(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const w = window as any;
    const strip = (s: string) => (s || '').replace(/\s+/g, '');
    const box = (el: Element) => {
      const r = el.getBoundingClientRect();
      return {
        left: r.left + window.scrollX, top: r.top + window.scrollY,
        right: r.right + window.scrollX, bottom: r.bottom + window.scrollY,
        width: r.width, height: r.height,
      };
    };
    const shown = (el: Element) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none';
    };
    const root = () => document.querySelector('main') ?? document.body;
    /** Deepest element whose stripped text equals `text`; visible ones first. */
    const leaf = (text: string, within?: Element) => {
      const t = strip(text);
      const all = Array.from((within ?? root()).querySelectorAll('*')).filter(
        (e) => !['SCRIPT', 'STYLE', 'SVG', 'PATH'].includes(e.tagName.toUpperCase()) && strip(e.textContent || '') === t,
      );
      const deepest = all.filter((e) => !Array.from(e.children).some((c) => strip(c.textContent || '') === t));
      return deepest.find(shown) ?? deepest[0] ?? null;
    };
    const INTERACTIVE = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"]';
    /** Card = largest ancestor of the title element that contains no other title element. */
    const cards = (group: string, titles: string[]) => {
      const leaves = titles.map((t) => leaf(t));
      return titles.map((title, i) => {
        const l = leaves[i];
        if (!l) return { title, found: false, text: '', box: null, titleBox: null, interactive: 0 };
        const others = leaves.filter((x, j) => j !== i && x) as Element[];
        let card: Element = l;
        while (card.parentElement && card.parentElement !== root() && card.parentElement !== document.body) {
          const p = card.parentElement;
          if (others.some((o) => p.contains(o))) break;
          card = p;
        }
        card.setAttribute('data-ab-card', `${group}-${i}`);
        return {
          title, found: true, text: strip(card.textContent || ''), box: box(card), titleBox: box(l),
          interactive: card.querySelectorAll(INTERACTIVE).length,
        };
      });
    };
    const rgba = (css: string) => {
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
    };
    const lum = (css: string) => {
      const { r, g, b } = rgba(css);
      const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    /** Background colour that paints the card: card itself, else a descendant covering >= 90% of it. */
    const paint = (card: Element) => {
      const cb = card.getBoundingClientRect();
      const cands = [card, ...Array.from(card.querySelectorAll('*'))].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width >= cb.width * 0.9 && r.height >= cb.height * 0.9;
      });
      for (const e of cands) {
        const c = getComputedStyle(e).backgroundColor;
        if (rgba(c).a > 0.5) return c;
      }
      return null;
    };
    const navyBottom = (card: Element) => {
      const cb = card.getBoundingClientRect();
      const els = [card, ...Array.from(card.querySelectorAll('*'))].filter((e) => e.getBoundingClientRect().width >= cb.width * 0.9);
      const isNavy = (css: string) => { const c = rgba(css); return c.a > 0.5 && lum(css) < 0.2 && c.b >= c.r; };
      for (const e of els) {
        const cs = getComputedStyle(e);
        if (parseFloat(cs.borderBottomWidth) >= 2 && cs.borderBottomStyle !== 'none' && isNavy(cs.borderBottomColor)) return true;
        for (const pseudo of ['::after', '::before']) {
          const ps = getComputedStyle(e, pseudo);
          if (ps.content !== 'none' && ps.content !== 'normal' && parseFloat(ps.height) >= 2 && isNavy(ps.backgroundColor)) return true;
        }
      }
      return false;
    };
    const scrollerOf = (inside: Element[]) => {
      let a: Element | null = inside[0];
      while (a && a !== document.documentElement) {
        const cs = getComputedStyle(a);
        if (/(auto|scroll)/.test(cs.overflowX) && a.scrollWidth > a.clientWidth + 1 && inside.every((e) => a!.contains(e))) return a;
        a = a.parentElement;
      }
      return null;
    };
    /** Pagination dots: the first ancestor of the scroller holding >= n buttons outside it. */
    const dotsOf = (scroller: Element, min: number) => {
      let a: Element | null = scroller.parentElement;
      while (a && a !== document.body) {
        const b = Array.from(a.querySelectorAll('button')).filter((x) => !scroller.contains(x));
        if (b.length >= min) return b;
        a = a.parentElement;
      }
      return [] as Element[];
    };
    w.__ab = { strip, box, shown, leaf, cards, rgba, lum, paint, navyBottom, scrollerOf, dotsOf, INTERACTIVE };
  });
}

export async function openAbout(page: Page, width: number, height = 900): Promise<void> {
  await installProbe(page);
  await page.setViewportSize({ width, height });
  await page.goto(ABOUT_PATH);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}

export async function cardsFor(page: Page, group: string, titles: string[]): Promise<CardInfo[]> {
  return page.evaluate(([g, t]) => (window as any).__ab.cards(g, t), [group, titles] as [string, string[]]);
}

/** Box of the deepest element whose whitespace-stripped text equals `text`, or null. */
export async function leafBox(page: Page, text: string): Promise<Box | null> {
  return page.evaluate((t) => {
    const ab = (window as any).__ab;
    const el = ab.leaf(t);
    return el ? ab.box(el) : null;
  }, text);
}

/** Box of the deepest element that CONTAINS the stripped text (for multi-line paragraphs). */
export async function containingBox(page: Page, text: string): Promise<Box | null> {
  return page.evaluate((t) => {
    const ab = (window as any).__ab;
    const s = ab.strip(t);
    const root = document.querySelector('main') ?? document.body;
    const all = Array.from(root.querySelectorAll('*')).filter((e) => ab.strip(e.textContent || '').includes(s));
    const deepest = all.filter((e) => !Array.from(e.children).some((c) => ab.strip(c.textContent || '').includes(s)));
    const el = deepest.find(ab.shown) ?? deepest[0];
    return el ? ab.box(el) : null;
  }, text);
}

/** Absolute tops of the first heading (h1-h6, role=heading) whose normalised text equals `text`. */
export async function headingTops(page: Page, texts: string[]): Promise<(number | null)[]> {
  return page.evaluate((ts) => {
    const hs = Array.from(document.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6,[role=heading]'));
    const n = (s: string) => s.replace(/\s+/g, ' ').trim();
    return ts.map((t) => {
      const h = hs.find((x) => n(x.textContent || '') === t);
      return h ? h.getBoundingClientRect().top + window.scrollY : null;
    });
  }, texts);
}

export async function horizontalOverflow(page: Page): Promise<{ sw: number; iw: number }> {
  return page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
}

export const luminanceOf = (page: Page, css: string): Promise<number> =>
  page.evaluate((c) => (window as any).__ab.lum(c), css);
