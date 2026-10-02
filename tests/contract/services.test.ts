import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import fs from 'node:fs';
import path from 'node:path';

// Framework boundary only: the visitor IP arrives through request headers.
const ctx = vi.hoisted(() => ({ ip: '203.0.113.9' }));
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': ctx.ip, 'x-real-ip': ctx.ip }),
}));
vi.mock('server-only', () => ({}));

import { getServiceGroups, getServicesPage, getServiceBySlug, getServiceSlugs } from '@/lib/cms/pages/services';
import { getServices } from '@/lib/cms';
import { ServiceLayout, type Locale } from '@/lib/cms/schema';
import { submitQuote } from '@/app/actions/submitQuote';
import { listLeads, resetLeads, getSentCount } from '@/lib/cms/testing';
import { text, sortKey, type Rec } from '../helpers/cms';
import { validLeadInput } from '../helpers/fixtures';
import { REPO_ROOT, walk } from '../helpers/fs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const locale = fc.constantFrom('en', 'vi');
const GROUP_SLUGS = ['logistic-service', 'freight-forwarding', 'warehousing', 'e-commerce'];
const arr = (v: unknown): Rec[] => (Array.isArray(v) ? (v as Rec[]) : []);
const bySlug = async (slug: string) => {
  const g = arr(await getServiceGroups('en' as Locale)).find((x) => x.slug === slug);
  if (!g) throw new Error(`group ${slug} missing`);
  return g;
};

// ------------------------------------------------------------------ schema
describe('Service schema extension (our-service section 3)', () => {
  it('SV-6: ServiceLayout is exactly tiles | cards | photo-grid | cards-lifecycle', () => {
    expect(ServiceLayout.options).toEqual(['tiles', 'cards', 'photo-grid', 'cards-lifecycle']);
    expect(ServiceLayout.safeParse('tiles').success).toBe(true);
    expect(ServiceLayout.safeParse('carousel').success).toBe(false);
  });
});

// ------------------------------------------------------------------ getServiceGroups
describe('getServiceGroups (our-service section 3)', () => {
  it('SV-6: returns the 4 published top-level groups in sort order with the specified layouts', async () => {
    const groups = arr(await getServiceGroups('en' as Locale));
    expect(groups.map((g) => g.slug)).toEqual(GROUP_SLUGS);
    expect(groups.map((g) => g.layout)).toEqual(['tiles', 'cards', 'photo-grid', 'cards-lifecycle']);
    const keys = groups.map(sortKey);
    expect(keys).toEqual([...keys].sort((a, b) => a - b));
    for (const g of groups) {
      expect(g.status).toBe('published');
      expect(g.id).toMatch(UUID);
      expect(g.parent ?? null).toBeNull();
    }
  });

  it('SV-6: section eyebrow and title come from the group translation', async () => {
    const groups = arr(await getServiceGroups('en' as Locale));
    expect(groups.map((g) => text(g, 'section_title'))).toEqual(['Logistics Services', 'Freight Forwarding', 'Ware housing services', 'E-commerce Solutions']);
    expect(groups.map((g) => text(g, 'section_eyebrow'))).toEqual(['Services', 'Our Services', 'Our Services', 'Our Services']);
  });

  it('SV-10/SV-12/SV-14: lead text, link label and lifecycle title live on their groups', async () => {
    expect(String(text(await bySlug('freight-forwarding'), 'section_intro'))).toBe(
      'Global reach with local intelligence. We coordinate complex international shipments across every mode of transport.',
    );
    expect(text(await bySlug('warehousing'), 'section_link_label')).toBe('View Facilities');
    expect(text(await bySlug('e-commerce'), 'steps_title')).toBe('Service Lifecycle');
  });

  it('SV-7/SV-10/SV-12/SV-14: children have the design titles, in order, and point at their group', async () => {
    const expected: Record<string, string[]> = {
      'logistic-service': ['Custom Clearance service', 'Door to Door services', 'Transport delivery services with haulage and long haul', 'Project cargo handling', 'Consolidation LTL services'],
      'freight-forwarding': ['Air Freight Consolidation', 'Sea Freight (FCL & LCL)', 'Inland & Rail Transport'],
      warehousing: ['Warehousing & packing services', 'Distribution center services', 'Personal Effect handling services', 'Container renting to store goods'],
      'e-commerce': ['Domestic Parcel', 'Cross-Border Transport', 'Return Management', 'API Integration'],
    };
    for (const slug of GROUP_SLUGS) {
      const g = await bySlug(slug);
      const kids = arr(g.children);
      expect(kids.map((k) => text(k, 'title')), slug).toEqual(expected[slug]);
      const keys = kids.map(sortKey);
      expect(keys, `${slug} sorted`).toEqual([...keys].sort((a, b) => a - b));
      for (const k of kids) {
        expect(k.parent).toBe(g.id);
        expect(k.status).toBe('published');
        expect(typeof k.slug).toBe('string');
        expect(String(k.slug).length).toBeGreaterThan(0);
        expect(String(text(k, 'summary')).length).toBeGreaterThan(0);
      }
    }
  });

  it('SV-7: group 1 children use the box-hand icon; Door to Door carries the design summary', async () => {
    const kids = arr((await bySlug('logistic-service')).children);
    for (const k of kids) expect(k.icon).toBe('box-hand');
    expect(String(text(kids[1], 'summary'))).toContain('Energistically reconceptualize ubiquitous solution wherea');
    expect(String(text(kids[1], 'summary'))).toContain('Synergistical empower parallel processes with highly efficient infomediaries.');
  });

  it('SV-12: warehousing and group 1 children carry an image file id', async () => {
    for (const slug of ['logistic-service', 'warehousing']) {
      for (const k of arr((await bySlug(slug)).children)) expect(String(k.image)).toMatch(UUID);
    }
  });

  it('SV-6: slugs are unique across groups and children', async () => {
    const groups = arr(await getServiceGroups('en' as Locale));
    const slugs = [...groups.map((g) => g.slug), ...groups.flatMap((g) => arr(g.children).map((k) => k.slug))];
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('SV-10/SV-11: freight process tracker has the 6 specified steps', async () => {
    const steps = arr((await bySlug('freight-forwarding')).steps);
    expect(steps).toHaveLength(6);
    expect(steps.every((s) => s.kind === 'process')).toBe(true);
    expect(steps.map((s) => text(s, 'label'))).toEqual(['Origin', 'Pick Up', 'Main Leg', 'Clearance', 'Sorting', 'Delivered']);
    expect(steps.map((s) => text(s, 'kicker') ?? null)).toEqual([null, null, 'Transit', null, null, 'Success']);
    expect(steps.map((s) => s.variant)).toEqual(['default', 'default', 'active', 'default', 'default', 'final']);
    expect(steps.map((s) => s.icon)).toEqual(['factory', 'truck', 'ship', 'gavel', 'archive', 'map-pin']);
    const keys = steps.map(sortKey);
    expect(keys).toEqual([...keys].sort((a, b) => a - b));
  });

  it('SV-14: e-commerce lifecycle has the 4 specified steps, the last is final', async () => {
    const steps = arr((await bySlug('e-commerce')).steps);
    expect(steps).toHaveLength(4);
    expect(steps.every((s) => s.kind === 'lifecycle')).toBe(true);
    expect(steps.map((s) => text(s, 'label'))).toEqual(['Automated Picking & Packing', 'Regional Hub Consolidation', 'Local Carrier Distribution', 'Final Consumer Delivery']);
    expect(steps.map((s) => s.variant)).toEqual(['default', 'default', 'default', 'final']);
  });

  it('SV-6: groups without a tracker have no steps', async () => {
    expect(arr((await bySlug('logistic-service')).steps)).toHaveLength(0);
    expect(arr((await bySlug('warehousing')).steps)).toHaveLength(0);
  });

  it('SV-6: Home keeps listing only top-level records (getServices returns parent = null)', async () => {
    const top = arr(await getServices('en' as Locale));
    expect(top.length).toBeGreaterThan(0);
    for (const s of top) expect(s.parent ?? null).toBeNull();
    expect(top.map((s) => s.slug)).toEqual(GROUP_SLUGS);
  });

  it('SV-23: returns only status=published, for every locale; never throws', async () => {
    await fc.assert(
      fc.asyncProperty(locale, async (l) => {
        const groups = arr(await getServiceGroups(l as Locale));
        const all = [...groups, ...groups.flatMap((g) => [...arr(g.children), ...arr(g.steps)])];
        return all.every((r) => r.status === 'published');
      }),
      { numRuns: 10 },
    );
  });

  it('SV-6 (locale fallback): "vi" falls back to the en texts and does not error', async () => {
    const vi = arr(await getServiceGroups('vi' as Locale));
    const en = arr(await getServiceGroups('en' as Locale));
    expect(vi.map((g) => text(g, 'section_title'))).toEqual(en.map((g) => text(g, 'section_title')));
  });
});

// ------------------------------------------------------------------ getServicesPage
describe('getServicesPage (our-service section 3)', () => {
  it('SV-1/SV-5/SV-18: singleton carries the verbatim hero, intro, badge and quote texts', async () => {
    const p = (await getServicesPage('en' as Locale)) as Rec | null;
    expect(p).not.toBeNull();
    const r = p as Rec;
    expect(text(r, 'hero_title')).toBe('OUR SERVICES');
    expect(text(r, 'intro_eyebrow')).toBe('Our Services');
    expect(String(text(r, 'intro_title')).replace(/\s+/g, ' ')).toBe('End-to-End Logistics Solutions');
    expect(String(text(r, 'intro_body'))).toMatch(/^Saigontrans has authored and provided/);
    expect(text(r, 'badge_value')).toBe('26');
    expect(text(r, 'badge_label')).toBe('YEARS EXPERIENCE');
    expect(text(r, 'quote_title')).toBe('Request a Project Quote');
    expect(text(r, 'quote_caption_title')).toBe('Kinetic Efficiency');
    expect(text(r, 'quote_caption_body')).toBe("Leveraging Vietnam's strategic position with precision logistics and real-time manifest tracking.");
  });

  it('SV-4: seo fields are non-empty', async () => {
    const r = (await getServicesPage('en' as Locale)) as Rec;
    expect(String(text(r, 'seo_title')).length).toBeGreaterThan(0);
    expect(String(text(r, 'seo_description')).length).toBeGreaterThan(20);
  });

  it('SV-20 (decided rule): the quote intro makes no response-time promise', async () => {
    const r = (await getServicesPage('en' as Locale)) as Rec;
    const intro = String(text(r, 'quote_intro'));
    expect(intro.length).toBeGreaterThan(0);
    expect(intro).not.toMatch(/within\s+\d+|\d+\s*hours?|business days?/i);
  });

  it('SV-5: intro stats are 26+ YEARS EXPERIENCE and 06 SERVICE LOCATIONS (repeater, not ids)', async () => {
    const r = (await getServicesPage('en' as Locale)) as Rec;
    const stats = arr(r.intro_stats);
    expect(stats).toHaveLength(2);
    expect(stats.map((s) => s.value)).toEqual(['26+', '06']);
    expect(stats.map((s) => text(s, 'label'))).toEqual(['YEARS EXPERIENCE', 'SERVICE LOCATIONS']);
  });

  it('SV-5: images are file ids: hero, quote, quote background, exactly 2 intro images', async () => {
    const r = (await getServicesPage('en' as Locale)) as Rec;
    for (const f of ['hero_image', 'quote_image', 'quote_background']) expect(String(r[f]), f).toMatch(UUID);
    const imgs = r.intro_images as unknown[];
    expect(imgs).toHaveLength(2);
    for (const i of imgs) expect(String(i)).toMatch(UUID);
  });

  it('SV-6 (locale fallback): never throws; "vi" returns the en content', async () => {
    await fc.assert(
      fc.asyncProperty(locale, async (l) => {
        const r = (await getServicesPage(l as Locale)) as Rec | null;
        return r !== null && text(r, 'hero_title') === 'OUR SERVICES';
      }),
      { numRuns: 6 },
    );
  });
});

// ------------------------------------------------------------------ getServiceBySlug / getServiceSlugs
describe('getServiceBySlug and getServiceSlugs (service-detail section 3)', () => {
  const detail = async (slug: string, l = 'en') => (await getServiceBySlug(l as Locale, slug)) as Rec | null;

  it('SD-1/SD-4: logistic-service has the hero title and the verbatim subtitle', async () => {
    const d = (await detail('logistic-service')) as Rec;
    expect(d).not.toBeNull();
    expect(d.slug).toBe('logistic-service');
    expect(d.status).toBe('published');
    expect(text(d, 'title')).toBe('Logistics Solution');
    expect(String(text(d, 'hero_subtitle')).toUpperCase()).toBe(
      'CONNECTING YOUR SUPPLY CHAIN WITH SAFETY, ON-TIME DELIVERY, AND TRUST (SOT). YOUR EXPERT PARTNER FOR TIGHTLY CONTROLLED INDUSTRIES AND DANGEROUS CHEMICALS.',
    );
    expect(String(d.hero_image)).toMatch(UUID);
  });

  it('SD-5/SD-6: intro title and sanitized rich text with the bold phrase', async () => {
    const d = (await detail('logistic-service')) as Rec;
    expect(text(d, 'intro_title')).toBe('Logistics Experts for Highly Technical Industries.');
    const html = String(text(d, 'intro_html'));
    expect(html).toContain('<strong>Customs Clearance, Transport Solutions, E-commerce, and Drop Shipping.</strong>');
    expect(html).toMatch(/^\s*Saigontrans has authored and provided/);
    const tags = [...html.matchAll(/<\/?([a-z][a-z0-9]*)/gi)].map((m) => m[1].toLowerCase());
    for (const t of tags) expect(['strong', 'em', 'a'], `tag <${t}> is not allowed`).toContain(t);
    expect(html).not.toMatch(/<script|on\w+\s*=|javascript:/i);
  });

  it('SD-7: 4 highlights in order, only the 4th is emphasised', async () => {
    const d = (await detail('logistic-service')) as Rec;
    const hs = arr(d.highlights);
    expect(hs.map((h) => text(h, 'label'))).toEqual(['Ground Pickup', 'Sea/Air Transit', 'Customs Clearance', 'Final Delivery']);
    expect(hs.map((h) => h.emphasis)).toEqual([false, false, false, true]);
    expect(String(d.highlights_image)).toMatch(UUID);
  });

  it('SD-8: related services are resolved to {slug,title} in the specified order', async () => {
    const d = (await detail('logistic-service')) as Rec;
    const rel = arr(d.related_services);
    expect(rel.map((r) => r.title ?? text(r, 'title'))).toEqual(['Ocean Freight', 'Air Cargo', 'Customs Brokerage', 'Warehousing']);
    for (const r of rel) expect(r.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('SD-9: every related slug of every service resolves to a published service (no 404 targets)', async () => {
    for (const slug of await getServiceSlugs()) {
      const d = await detail(slug);
      for (const r of arr(d?.related_services)) {
        expect(await detail(String(r.slug)), `${slug} -> ${String(r.slug)}`).not.toBeNull();
      }
    }
  });

  it('SD-12: process has 4 ordered steps, title IMPORT FLOW, default active step 2', async () => {
    const p = ((await detail('logistic-service')) as Rec).process as Rec;
    expect(p).toBeTruthy();
    expect(text(p, 'eyebrow')).toBe('Execution Strategy');
    expect(text(p, 'title')).toBe('IMPORT FLOW');
    expect(text(p, 'subtitle')).toBe('A clear and efficient 4-step process to ensure your cargo is imported smoothly and delivered on time.');
    expect(p.default_active).toBe(2);
    const steps = arr(p.steps);
    expect(steps.map((s) => text(s, 'label'))).toEqual(['Port / Airport Arrival', 'Customs Clearance', 'Inland Transport', 'Delivery to Warehouse']);
    const keys = steps.map(sortKey);
    expect(keys).toEqual([...keys].sort((a, b) => a - b));
  });

  it('SD-14: expertise has the 4 stats and 3 cards', async () => {
    const x = ((await detail('logistic-service')) as Rec).expertise as Rec;
    expect(text(x, 'title')).toBe('Consultancy & Compliance');
    expect(text(x, 'text')).toBe('Expert guidance to ensure compliance, reduce risk and support your growth.');
    const stats = arr(x.stats);
    expect(stats.map((s) => [s.value, text(s, 'label')])).toEqual([
      ['38', 'TRUCKS'], ['31', 'TRAILERS'], ['45', 'DRIVERS'], ['24/7', 'CCTV MONITORING'],
    ]);
    const cards = arr(x.cards);
    expect(cards.map((c) => text(c, 'title'))).toEqual(['Trade Compliance', 'Regulatory Consulting', 'Risk Management']);
    for (const c of cards) expect(String(c.image)).toMatch(UUID);
  });

  it('SD-15: 3 features with a non-empty description', async () => {
    const fs3 = arr(((await detail('logistic-service')) as Rec).features);
    expect(fs3.map((f) => text(f, 'title'))).toEqual(['Real-time Tracking', 'Risk Management', 'Global Compliance']);
    for (const f of fs3) expect(String(text(f, 'text')).length).toBeGreaterThan(10);
  });

  it('SD-16: why has 4 benefit items and 4 photos', async () => {
    const w = ((await detail('logistic-service')) as Rec).why as Rec;
    expect(text(w, 'eyebrow')).toBe('The STS Edge');
    expect(text(w, 'title')).toBe('Why Choose Saigontrans?');
    expect(arr(w.items).map((i) => text(i, 'title'))).toEqual(['Cost Optimization', 'Quality Control', 'Scalable Logistics', 'Account Management']);
    const imgs = w.images as unknown[];
    expect(imgs).toHaveLength(4);
    for (const i of imgs) expect(String(i)).toMatch(UUID);
  });

  it('SD-1/SD-2: unknown, empty and hostile slugs give null and never throw', async () => {
    expect(await detail('does-not-exist')).toBeNull();
    expect(await detail('')).toBeNull();
    await fc.assert(
      fc.asyncProperty(fc.string(), locale, async (s, l) => {
        const r = await getServiceBySlug(l as Locale, s);
        return r === null || (r as Rec).slug === s;
      }),
      { numRuns: 40 },
    );
  });

  it('SD-1: every published slug resolves; the 4 existing services still render (own title)', async () => {
    const slugs = await getServiceSlugs();
    expect(Array.isArray(slugs)).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of GROUP_SLUGS) expect(slugs).toContain(s);
    const titles: string[] = [];
    for (const s of GROUP_SLUGS) {
      const d = await detail(s);
      expect(d, s).not.toBeNull();
      titles.push(String(text(d as Rec, 'title')));
    }
    expect(titles.every((t) => t.length > 0)).toBe(true);
    expect(new Set(titles.map((t) => t.toLowerCase())).size).toBe(4);
  });

  it('SV-9/SV-17: every child card slug of the list page is a published detail slug', async () => {
    const slugs = await getServiceSlugs();
    for (const g of arr(await getServiceGroups('en' as Locale))) {
      for (const k of arr(g.children)) {
        expect(slugs, `child ${String(k.slug)}`).toContain(k.slug);
        expect(await detail(String(k.slug)), `child ${String(k.slug)}`).not.toBeNull();
      }
    }
  });

  it('SD-3: getServiceSlugs and getServiceBySlug only expose published services', async () => {
    for (const s of await getServiceSlugs()) expect((await detail(s))?.status).toBe('published');
  });

  it('SD-19: locale "vi" falls back to en, does not error', async () => {
    const en = (await detail('logistic-service')) as Rec;
    const vi = (await detail('logistic-service', 'vi')) as Rec | null;
    expect(vi).not.toBeNull();
    expect(text(vi as Rec, 'title')).toBe(text(en, 'title'));
  });
});

// ------------------------------------------------------------------ SD-18 / DRY guardrails
describe('SD-18: components never import fixtures or the Directus SDK', () => {
  it('SD-18: service pages and components read data through lib/cms only', () => {
    const dirs = [
      path.join(REPO_ROOT, 'src/components/services'),
      path.join(REPO_ROOT, 'src/app/[locale]/services'),
    ];
    const files = dirs.flatMap((d) => walk(d, () => false)).filter((f) => /\.(tsx?|jsx?)$/.test(f));
    expect(files.length, 'service page sources exist').toBeGreaterThan(0);
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      expect(src, f).not.toMatch(/content\/fixtures/);
      expect(src, f).not.toMatch(/@directus\/sdk/);
    }
  });
});

// ------------------------------------------------------------------ quote lead from the services page
let n = 0;
const uniqueIp = () => {
  n += 1;
  return `10.${(n >> 16) & 255}.${(n >> 8) & 255}.${n & 255}`;
};
function form(patch: Record<string, string | undefined> = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries({ ...validLeadInput, source: 'services', ...patch })) if (v !== undefined) fd.set(k, v);
  return fd;
}

describe('Services quote form posts to the shared submitQuote (S3, SV-19..SV-21)', () => {
  beforeEach(async () => {
    await resetLeads();
    ctx.ip = uniqueIp();
  });

  it('SV-20: valid data stores a lead with source_page /en/services and the extra fields', async () => {
    const res = await submitQuote(form({ service_type: 'freight-forwarding', estimated_volume: '50 containers/month', message: 'Need a quote' }));
    expect(res).toEqual({ ok: true });
    const leads = await listLeads();
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({
      source_page: '/en/services',
      service_type: 'freight-forwarding',
      estimated_volume: '50 containers/month',
      message: 'Need a quote',
      email: 'an@example.com',
    });
    expect(getSentCount()).toBe(1);
  });

  it('SV-20: service type, estimated volume and message are optional', async () => {
    expect(await submitQuote(form())).toEqual({ ok: true });
    expect((await listLeads())[0].source_page).toBe('/en/services');
  });

  it('SV-20: a submission without a source keeps the Home source_page /en', async () => {
    const fd = form();
    fd.delete('source');
    await submitQuote(fd);
    expect((await listLeads())[0].source_page).toBe('/en');
  });

  it('SV-19: empty first name and invalid email: errors for those fields only, nothing stored or sent', async () => {
    const res = await submitQuote(form({ first_name: '', email: 'not-an-email', estimated_volume: '10 pallets' }));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(Object.keys(res.errors).sort()).toEqual(['email', 'first_name']);
    expect(await listLeads()).toHaveLength(0);
    expect(getSentCount()).toBe(0);
  });

  it('SV-19: estimated_volume longer than 120 characters is rejected on that field only', async () => {
    const res = await submitQuote(form({ estimated_volume: 'x'.repeat(121) }));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(Object.keys(res.errors)).toEqual(['estimated_volume']);
    expect(await listLeads()).toHaveLength(0);
    expect(await submitQuote(form({ estimated_volume: 'x'.repeat(120) }))).toEqual({ ok: true });
  });

  it('SV-21: honeypot filled looks like success, nothing is stored or sent', async () => {
    expect(await submitQuote(form({ website: 'http://spam.example', service_type: 'warehousing' }))).toEqual({ ok: true });
    expect(await listLeads()).toHaveLength(0);
    expect(getSentCount()).toBe(0);
  });
});
