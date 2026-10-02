# Requirements

> Status: APPROVED with edits by the user (2026-10-02): English first, Vietnamese later; publish by Directus `status`; sample values for stats and email. Original draft by ck:ba. Sources: user answers in chat, `plans/reports/ba-domain-research-logistics-site.md`, `plans/reports/ba-round1-decisions.md`.
> Marking: **[Decided]** = user said it. **[Proposed]** = my proposal, needs your OK. **[Inferred]** = read from the Figma design.

## Objective
Build the Saigon Trans (SAIGONTRANS) corporate website in Next.js, English first and Vietnamese-ready, faithful to the Figma design, with a Request-a-Quote form that never loses a lead. The frontend runs on Directus-shaped sample data first; Directus is attached afterwards without changing the components.

## Problem
Saigon Trans is a Vietnam-based logistics company (freight forwarding, customs/compliance consultancy, warehousing, transport and port haul, e-commerce fulfilment). It has a finished Figma design (7 desktop pages at 1920px + Home mobile at 428px) but no website. Buyers judge a forwarder on proof and on how easily they can ask for a quote, so the site must look exactly as designed, load fast, and route every quote request to a person.

## Milestones
1. **M1 — Home page** (desktop, English): DONE, 2.16% pixel difference at 1920px.
2. **M1b — Responsive** (user request 2026-10-02): every section works from 320px to 1920px. Breakpoints: 428 (mobile design), 768, 1024, 1280, 1920 (desktop design). Mobile follows the Figma Home mobile frame; tablet and in-between widths are derived. 1920px must stay within the 3% fidelity limit.
3. **M2 — All pages**: About Us, Contact, Our Service, Service Detail (template for every service), News, News Article (template), plus 404. Desktop follows the Figma frames; mobile and tablet are derived from the Home mobile patterns.
4. **M2b — Actions**: everything clickable does something real (list below).
5. M3 — Directus attached, deployment (blocked until server info is given).

## Actions (M2b), all must work with keyboard and touch
- Header: logo → `/en`; nav HOME / PAGES / SERVICES / ABOUT / NEWS / CONTACT go to their pages (PAGES opens a menu with the inner pages); active item reflects the current page; Booking → quote form on Home (or Contact); social icons open the configured URLs in a new tab with `rel=noopener`; hamburger menu below 1024px (open/close, Esc closes, focus trapped, body scroll locked).
- Home: "Explore The Services" → `/en/services`; "Contact Us" → `/en/contact`; service card → `/en/services/<slug>`; "View All Services" → `/en/services`; news card and Read More → `/en/news/<slug>`; CTA "Request a free quote" → quote form; "Contact sales" → `/en/contact`.
- Quote form: as in S3 (validation, honeypot, rate limit, stored lead, success/error focus handling).
- Contact page: contact form stores a Lead (source page `/en/contact`); offices/contacts show phone and email as `tel:` and `mailto:` links; map is a static image that loads the real map only after a click.
- News list: filter/paginate if the design shows it; article page: share links, previous/next, related posts if the design shows them.
- Footer: all links go to real pages; newsletter sign-up stores a subscriber (validated, honeypot, rate limited, success and error states); legal links go to Privacy Policy and Terms pages (simple pages, content to be provided).
- Everywhere: hover, focus-visible and active states; 404 page; links to unfinished content must not be dead (`#` is not allowed in the final build).

## Definition of Done — M1 (measurable)
- [ ] `/en` renders the Home page; `/` redirects to `/en`. The `[locale]` route and `translations` data shape exist, but only `en` is enabled. `/vi` is added later.
- [ ] At viewport 1920px, a full-page screenshot of `/en` differs from `design/exports/home/desktop-1920@1x.png` by **≤ 3% of pixels** [Proposed threshold; text rendering and images will never be 0%].
- [ ] At viewport 428px, Home follows the Figma mobile frame (node 33:3960) structurally: same section order, same layout rules (see S5), no horizontal scroll. Pixel difference is measured but NOT gated at 428 (changed 2026-10-02): the mobile frame uses other photos, numbers and service names than the desktop frame, so a 3% pixel match is impossible with one data set. Measured: 32%.
- [ ] Every value in the "We Good With Number" band, the services, partners and news on Home comes from fixtures read through `lib/cms`, not hard-coded in components.
- [ ] Submitting the quote form with valid data stores a lead record and shows a success state; with invalid data shows per-field errors and stores nothing.
- [ ] Keyboard-only use reaches every interactive element with a visible focus ring; no WCAG 2.1 AA contrast failures on text [Proposed target].
- [ ] `tsc`, lint and the contract tests (below) pass.

## REASONS Canvas
- **Requirements**: pixel-faithful Home in EN+VI; quote form; editable content later.
- **Entities**: Page, Service, News, Stat, Partner, Office/Contact, Lead (quote request), plus translations.
- **Approach**: Next.js App Router, locale-prefixed routes, content through `lib/cms` (fixtures now, Directus SDK later), server-side form handling.
- **Structure**: `src/app/[locale]/…`, `src/components/<section>/`, `src/lib/cms/`, `src/content/fixtures/`, `design/` for Figma exports and measured values.
- **Operations**: no hosting decided (server info pending); local run and preview only in M1.
- **Norms**: values taken from Figma via exact reads, not estimated; changes to design are listed, never silent.
- **Safeguards**: lead stored before any email; honeypot + rate limit; no third-party scripts without consent.

## User stories (INVEST) — M1

**S1. Visitor sees the faithful Home page**
- As a prospective customer, I want the Home page to look like the approved design, so that I trust the company.
  - AC: Given viewport 1920px, When I open `/en`, Then sections appear in this order: header, hero, Request a Quote, "We Good With Number", services, partners and clients, latest news, CTA "Ready to optimize your supply chain", footer.
  - AC: Given viewport 428px, When I open `/en`, Then the mobile layout of the Figma mobile Home is shown with no horizontal scroll.
  - AC: Given the screenshot-diff test, When it compares Home to the exported design, Then the pixel difference is ≤ 3%.

**S2. Language-ready structure (Vietnamese deferred)**
- As the owner, I want the site built so Vietnamese can be added later without restructuring.
  - AC: Given any page, When it renders, Then it is served under `/en/...` and `<html lang="en">` is set.
  - AC: Given a fixture record, When it is read, Then its text lives in `translations[]` keyed by `languages_code`, with `en` filled and no hard-coded strings in components (UI labels also come from a message file).
  - AC: Given a record without the requested locale, When it is read, Then it falls back to `en` and does not error.
  - Deferred: language switcher, `/vi` routes, Vietnamese content (the user asked me to translate it later).

**S3. Visitor requests a quote**
- As a prospective customer, I want to send a quote request, so that a salesperson contacts me.
  - AC (fields exactly as in the Figma design, which has NO message input): first name, last name, company name, email address, phone number, country, job title. Required: first name, last name, email, phone. Company, country, job title optional. [Proposed: the design has no asterisks]. The design shows the hint "Please enter your request here, we will be send you an offer" but no input for it; see open question 6.
  - AC: Given valid data, When I submit, Then a Lead is stored first, then one notification email goes to the fixed sales address, then I see a success message.
  - AC: Given the email send fails, When I submit valid data, Then the Lead is still stored, the visitor still sees success, and the failure is logged for retry.
  - AC: Given the honeypot field is filled, When I submit, Then nothing is stored and no email is sent.
  - AC: Given 6 submissions from one IP within 10 minutes [Proposed limit], When the 6th arrives, Then it is rejected with a friendly message.
  - AC: Given an invalid email or empty required field, When I submit, Then field-level errors appear (only for invalid fields) and no Lead is stored.
  - AC: The honeypot is checked first (filled → silent success, nothing stored), then validation, then the rate limit; only submissions that passed validation count toward the rate limit.
  - AC: The confirmation text states no response deadline. [Decided]

**S4. Content manager edits content (M3, shape fixed now)**
- As a content manager (not a developer), I want to edit news, services, stats and partners in Directus, so that the site stays current without a developer.
  - AC: Given a fixture record, When it is read through `lib/cms`, Then it has the same field names and types as the Directus collection will have (see data contracts).
  - AC: Given a stat record, When it is read through `lib/cms`, Then it carries an `as_of` date (data only). The date is NOT rendered on the page in M1, because the design shows none. [Changed 2026-10-02: was "displays an as-of date"; design fidelity wins. Show it later only if the owner asks.]

**S5. Responsive layout (every page, from M1b)**
- AC: Given any page, When the viewport width is each of 320, 360, 375, 428, 600, 768, 900, 1024, 1180, 1280, 1366, 1440, 1536, 1920, Then `document.documentElement.scrollWidth <= clientWidth` (no horizontal page scroll; carousels scroll inside their own box).
- AC: Given width < 1280, Then the desktop navigation bar is not shown and a hamburger button "Open menu" is; Given width >= 1280, Then the navigation bar with HOME, PAGES, SERVICES, ABOUT, NEWS, CONTACT is shown and the hamburger is not.
- AC: Given width < 768 (phones), Then on Home: the CTA band "READY TO OPTIMIZE YOUR SUPPLY CHAIN?" and the "View All Services" button and the news intro paragraph are not shown (the mobile design has none of them); the stats form a 2-column grid whose last card spans both columns; services, partners are horizontal scroll-snap carousels with dots; news is a 2-column grid; the footer link columns are a tab list.
- AC: Given width >= 1280, Then the Home layout is the 1920 design (fixed-size containers centered), within the 3% limit at 1920.

**S6. Navigation and header actions**
- AC: Given the nav, When I click HOME / SERVICES / ABOUT / NEWS / CONTACT, Then I land on `/en`, `/en/services`, `/en/about-us`, `/en/news`, `/en/contact`; the entry of the current page has `aria-current="page"`.
- AC: Given the PAGES button, When I click it, Then a menu opens (`aria-expanded="true"`) with About Us, Our Service, News, Contact, Privacy Policy, Terms of Use linking to `/en/about-us`, `/en/services`, `/en/news`, `/en/contact`, `/en/privacy-policy`, `/en/terms`; Esc or an outside click closes it.
- AC: Given width < 1280 and the hamburger, When I activate it, Then a modal menu opens, body scroll is locked, focus moves inside and stays inside (Tab wraps), Esc closes it and returns focus to the hamburger; following a link closes it.
- AC: Given the logo and "Booking", Then the logo links to `/en` and Booking goes to the quote form on Home (`/en#quote`). Social icons are links that open in a new tab with `rel` containing `noopener`. No link in the header or footer has `href="#"`.
- AC: Given width < 1280 (the language control exists only in the phone/tablet top strip of the design; the desktop design has none), Given the language control, Then it shows the current language "English", opens a list that contains only the enabled languages, and each entry links to the same page under that language.

**S7. Newsletter sign-up (footer)**
- AC: Given a valid email, When I submit, Then a subscriber is stored (email, locale, source page, date) and the form is replaced by a success message that receives focus.
- AC: Given an invalid email, Then an error message appears (role alert), the field has `aria-invalid="true"` and nothing is stored.
- AC: Given the honeypot field is filled, Then it looks like success and nothing is stored.
- AC: Given the same email is submitted twice (any letter case), Then both show success and exactly one subscriber is stored.
- AC: Given 5 valid sign-ups from one IP within 10 minutes, Then the 6th is rejected with a friendly message and not stored. Newsletter and quote limits are counted separately.

**S8. Card and carousel actions**
- AC: Given Home, Then each service card links to `/en/services/<slug>`, each news card to `/en/news/<slug>` (slugs from the data), "Explore The Services" to `/en/services`, "Contact Us" and CTA "Contact sales" to `/en/contact`, "View All Services" to `/en/services`, CTA "Request a free quote" to `/en#quote`.
- AC: Given a carousel (services below 1280, partners below 1024), Then it has one dot per slide; activating a dot scrolls that slide into view and sets `aria-current="true"` on the dot; scrolling the track updates the active dot; keyboard users can reach the card links.
- AC: Given width >= 1280 on Home, Then exactly one service card and one news card are highlighted by default (third service, first news); hovering or focusing another card moves the highlight to it.

## Data contracts (Zod sketch; become contract tests)

Added 2026-10-02: `SubscriberInput { email, locale, website (honeypot) }` and `Subscriber { id, email, locale, date_created, source_page }`; `lib/cms.createSubscriber(input, sourcePage)` returns the stored subscriber, or null for a duplicate e-mail; test hook `@/lib/cms/testing` also exports `listSubscribersForTest()`.

```ts
const Locale = z.enum(['en', 'vi']);
const Base = z.object({
  id: z.string().uuid(),
  status: z.enum(['published', 'draft', 'archived']),
  sort: z.number().int().nullable(),
  date_created: z.string().datetime(),
  date_updated: z.string().datetime().nullable(),
});
const File = z.string().uuid();                       // Directus file id; URL via assetUrl(id)
const T = <S extends z.ZodRawShape>(s: S) => z.object({ languages_code: Locale, ...s });

const Service = Base.extend({ slug: z.string(), icon: z.string().nullable(), image: File.nullable(),
  translations: z.array(T({ title: z.string(), summary: z.string(), body: z.string().nullable() })) });
// 2026-10-02: News.translations[].body is an array of structured blocks (lead, heading 2/3, paragraph, quote, image, list, feature), never a string or HTML (see docs/pages/news-article.md)
const News = Base.extend({ slug: z.string(), cover: File.nullable(), published_at: z.string().datetime(),
  author: z.string().nullable().optional(), comments_count: z.number().int().nonnegative().nullable().optional(), // shown on the news card in the design
  translations: z.array(T({ title: z.string(), excerpt: z.string(), body: z.string() })) });
const Stat = Base.extend({ value: z.string(), icon: z.string().nullable(), as_of: z.string().date(),
  translations: z.array(T({ label: z.string() })) });
const Partner = Base.extend({ name: z.string(), logo: File, url: z.string().url().nullable() });
const Office = Base.extend({ phone: z.string().nullable(), email: z.string().email().nullable(),
  translations: z.array(T({ name: z.string(), address: z.string(), role: z.string().nullable() })) });

const LeadInput = z.object({           // what the visitor sends
  first_name: z.string().min(1).max(80), last_name: z.string().min(1).max(80),
  company: z.string().max(160).optional(), email: z.string().email(),
  phone: z.string().min(5).max(30), country: z.string().max(80).optional(),
  job_title: z.string().max(120).optional(),
  message: z.string().max(4000).optional(),   // not rendered in M1 (design has no input); kept so the CMS can hold it later
  locale: Locale, website: z.string().max(0),   // honeypot must be empty
});
const Lead = LeadInput.omit({ website: true }).extend({   // what is stored
  id: z.string().uuid(), date_created: z.string().datetime(),
  email_status: z.enum(['pending', 'sent', 'failed']), source_page: z.string() });
```

`lib/cms` contract: every function returns `Promise<T[]>` or `Promise<T | null>` of the types above, filtered to `status = published`, with translations resolved to the requested locale and English fallback. A function never throws on a missing translation.

## Guardrails (AI autonomy fence)
- **Always**: read design values from Figma (inputs in the right panel) or the exported PNG, not by eye; keep content in fixtures behind `lib/cms`; store a Lead before sending email; validate on the server; record any deviation from the design in `docs/progress.md`.
- **Ask first**: any deviation from the Figma design; adding form fields; adding third-party scripts, analytics or fonts from external hosts; anything that sends data outside the project; installing Directus or touching a server; changing the locale URL scheme; privacy/consent wording.
- **Never**: commit secrets or `.env`; weaken or delete a test to make it pass; send real emails from tests; hard-code content strings in components; load Google Maps or any tracker before consent; invent certifications, client names, addresses or numbers not in the design or given by the user.
- **Authority when rules conflict**: user instruction > this file > Figma design > project conventions.

## Decisions & trade-offs
| Decision | Why | Alternative rejected |
|---|---|---|
| **[Decided, changed]** English first, Vietnamese later (changed from "both at launch") | User chose to ship the frontend first; Vietnamese translated later by me | Structure stays bilingual-ready so adding `vi` is content work, not a rebuild |
| **[Decided]** Directus, managed by a non-developer; publishing by `status` (draft/published), no approval step, configured later in Directus | User's choice | Approval workflow: not needed |
| **[Decided]** Under Directus free thresholds (< 5M USD revenue and < 50 employees) | User statement | Payload CMS if over; **re-check licence text before install** (research used secondary sources) |
| **[Decided]** Lead: stored in Directus + one fixed email address | Never lose a lead if email fails | CRM push, routing by service: not needed now |
| **[Decided]** Form fields exactly as design | Faithful, lower spam and privacy risk | Extra service/lane fields, attachments |
| **[Decided]** No response-time promise, no overdue alerts | User choice | SLA wording + reminder email |
| **[Decided]** No CRM/ERP/TMS integration, no shipment tracking | User choice | Tracking portal: separate project |
| **[Decided]** Stats, logos and partners as in the design, editable in CMS | Faithful; editable | Extra certifications, lanes, case studies: add later |
| **[Decided]** No analytics, so no cookie banner | User choice | GA + banner; Plausible/Umami |
| **[Decided]** Contact map: static image, click to load the real map | Fast, no third-party before consent | Embedded Google Maps, OpenStreetMap |
| **[Proposed]** Locale-prefixed routes `/en`, `/vi`; `/` → `/en` | Clean SEO, `hreflang` | Cookie/subdomain-based language |
| **[Proposed]** Screenshot diff ≤ 3% as the fidelity metric | Objective, automatable | "Looks the same" by eye |

## Out of scope (non-goals)
- Shipment tracking, customer portal, login, payments, CRM/ERP integration.
- File attachments and extra qualifying fields on the quote form.
- Analytics, advertising pixels, cookie banner.
- Response-time (SLA) promises and overdue-lead alerts.
- Deployment, DNS, SSL and Directus installation in M1 (server information not given).
- New design: certifications block, case studies, FAQ, coverage map. Not in the Figma; add later if asked.

## Open questions (named, not assumed)
Resolved by the user (2026-10-02):
- Approval step → none; publish by Directus `status`; set up later in Directus.
- Vietnamese → English first; I translate Vietnamese later.
- Stats "as of" date, sales email address, logo permission → not important now; use sample values. Real values are filled in before launch.
- Responsive for pages without a mobile design → derive from Home mobile; the user reviews later.

Still open (do not block M1):
6. **Message input:** the design shows "Please enter your request here…" but no input. M1 follows the design (no textarea; `message` stays optional in the contract). Add a textarea? Needs your OK because it changes the design.
1. **Privacy consent:** Vietnam's Law 91/2025/QH15 (in force 1 Jan 2026) may require separate explicit consent, a privacy notice and a consent log for the quote form. The user chose to follow the design (no checkbox). Revisit before launch, ideally with a lawyer. Research used secondary sources.
2. **Servers A and B:** operating system, resources, which runs production, location. Needed for M3 (deployment), not M1.
3. **Anti-spam:** honeypot + rate limit only; Cloudflare Turnstile not added (not in design).
4. **Directus licence text:** confirm the current terms before install (the research could not open the official licence file).
5. **Real sending provider and sales address** (SPF/DKIM/DMARC) before launch.
