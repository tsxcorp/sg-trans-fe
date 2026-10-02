# Page spec: Service Detail (template for every service)

Source: `design/exports/service-detail/desktop-1920@1x.png` (1920x5478, Figma frame "Service Detail_Logistics", node 33:2772). All y values are px in that export. Mobile patterns come from `design/exports/home/mobile-428@1x.png`. Shared blocks (header, footer, CTA band, Partners & Clients, quote form) are NOT re-specified here: see `design/reference/home.md` and the Home spec. Only visible differences are noted. Texts are verbatim, typos kept.

## 1. Route and purpose

- Route: `/en/services/<slug>` (`[locale]/services/[slug]`). Fixture slug for the design example: `logistics`. The page is static per published Service.
- Purpose: explain one service to a prospective customer and push to a quote / sales contact.
- Title proposal: `<service.title> | Saigon Trans`. Example: `Logistics Solution | Saigon Trans` (hero title is the service `title`, see 3). Meta description proposal: `service.meta_description` if filled, else `service.summary` trimmed to 160 chars at a word boundary. Open question Q1 (brand string).
- Unknown slug, or slug whose Service is `draft`/`archived`, or whose `en` translation is missing and no fallback: HTTP 404 using the site 404 page. No redirect.
- `generateStaticParams` returns slugs of published services. `<html lang="en">`.
- Reached from: Home service cards, "View All Services" -> Our Service list, Our Service list cards, header SERVICES / PAGES menu, Related Services links on other service pages (see 4).

## 2. Sections top to bottom

Page background alternates: hero image, white, dark navy, light grey-blue, white, CTA gradient, footer.

### 2.0 Header (shared) y 0-128
Shared header. Differences: none visible; nav item HOME is drawn active (same as every inner-page export); per requirement the active item reflects the current page, so on this page SERVICES is active (deviation from the export, log in progress.md). Header overlays the hero image.

### 2.1 Hero y 0-495
- Purpose: page title.
- Image: full-width photo of blue harbour container cranes at dusk, blue-purple tint overlay, covers 1920x495 (cover crop, centered). Content (service hero image), not decoration. File = `service.hero_image`.
- Texts: H1 `LOGISTICS SOLUTION` (white, bold, uppercase, letter-spaced, centered at y~295). Subtitle (white, small uppercase, letter-spaced, 2 lines centered, y 335-357): `CONNECTING YOUR SUPPLY CHAIN WITH SAFETY, ON-TIME DELIVERY, AND TRUST (SOT). YOUR EXPERT PARTNER FOR TIGHTLY CONTROLLED INDUSTRIES AND DANGEROUS CHEMICALS.`
- Uppercase is the design rendering (CSS `text-transform`); stored text is sentence case-agnostic.
- No buttons (unlike Home and Our Service heroes).
- Interactive: none. States: none.

### 2.2 Intro with sidebar y 495-1567
Two columns inside the 1292-wide container (x 314-1605): main column x 352-1200, sidebar x 1248-1568. Decorations: faint dotted world map at the right (x ~1440-1920, y ~550-1000, light grey, decoration, `aria-hidden`); grey forklift photo cut off at the left edge (x 0-275, y 1204-1567, decoration, `aria-hidden`; same asset as Our Service intro). Both are template decoration, same on all services.

Main column:
- Eyebrow (red, italic, bold, underlined) y~628: `Our Services` (template label).
- H2 (navy, bold, 2 lines, y 665-790): `Logistics Experts for Highly Technical Industries.`
- Intro paragraph (grey, y 810-915, 4 lines; first line begins with a leading space in the design, ignore it): `Saigontrans has authored and provided highly technical export/import solutions across tightly controlled industries. With 25 years of experience, we are not just standard forwarders; we offer unparalleled expertise in **Customs Clearance, Transport Solutions, E-commerce, and Drop Shipping.**` (the last phrase is bold). Needs inline bold: store as rich text (`intro_html`, sanitized, only `<strong>`, `<em>`, `<a>`).
- Key Highlights box y 954-1448, x 352-1200, white, 1px light border, no radius visible:
  - Title (navy, bold, uppercase, letter-spaced, centered, y~970): `KEY HIGHLIGHTS`
  - 4 items in a row, each = icon tile (62x62 rounded square, navy outline, icon navy; the 4th tile is filled navy with white icon) + label below (bold, dark). Items: truck icon `Ground Pickup`; ship icon `Sea/Air Transit`; bank/customs-building icon `Customs Clearance`; archive-box icon `Final Delivery`. Filled 4th tile = the design's "active/last" emphasis; treat as an `emphasis` flag (Q3).
  - Illustration below the 4 items (y ~1105-1448, x 352-1200): isometric supply-chain scene (ship, crane, warehouse, trucks, plane over a world map, office), light blue/white. Content image, full box width, `object-fit: contain`, bottom aligned. File = `service.highlights_image`.
  - Interactive: none visible.

Sidebar (sticky? not shown; static):
- Card "Related Services" y 613-903, x 1248-1568, white, 1px border, small radius: title (navy bold) `Related Services`, 1px divider, 4 rows each (text grey + right chevron `>`): `Ocean Freight`, `Air Cargo`, `Customs Brokerage`, `Warehousing`. Rows are links. Hover state not drawn (derive: text navy + chevron navy). Row separation only by spacing (no lines).
- Card "Need Help?" y 928-1447, x 1248-1568, solid navy `#0A24A8`-like blue (read exact from export when building), radius ~8: title (white bold) `Need Help?`; text (white, 2 lines) `Our logistics experts are ready to assist with your custom requirements.`; phone row (white phone icon + bold white) `+1 (800) SAIGON-1`. Bottom right: faint headset/support-person emblem (decoration, low-opacity). The card stretches to the bottom of the Key Highlights box (equal bottom y 1447/1448) leaving empty blue space in the middle. Phone is a `tel:` link.

### 2.3 Process / flow y 1567-2185 (white, faint very light grey panel x ~200-1720)
- Eyebrow (red italic bold, centered, y~1684, NOT underlined; a short red rule 40px below it): `Execution Strategy`
- H2 (dark navy, bold, uppercase, centered, y~1750): `IMPORT FLOW`
- Subtitle (grey, centered, 2 lines, y 1800-1840): `A clear and efficient 4-step process to ensure your cargo is imported smoothly and delivered on time.`
- 4 step cards in a row, y 1881-2070, x 315-554 / 668-905 / 1005-1245 / 1367-1597 (unequal widths in design: Q4), white, light border and soft shadow, radius ~8. Each: round number badge top-left (white circle, navy number) + large icon (navy, line-and-fill style) top-right + label bottom-right (navy bold, 2 lines):
  1. badge `01`, icon ship + small plane, label `Port / Airport Arrival`
  2. badge `02`, icon clipboard with shield, label `Customs Clearance`
  3. badge `03`, icon container truck, label `Inland Transport`
  4. badge `04`, icon warehouse with boxes, label `Delivery to Warehouse`
- Between cards: thin blue horizontal connector lines with a dot at the right end (between 1-2, 2-3, 3-4), decoration.
- Visible state: card 02 is in the active state (red 1.5px border, red-filled badge with white `02`, icon and label red, red downward pointer triangle under the card at x~780, y 2070-2090). Same "hover state drawn by default" pattern as Home (home.md anomaly 3): the first-render active card is card index 2 by data flag `is_default_active`, hover/focus/tap on another card moves the highlight (Q5). Cards are focusable (`tabindex=0`) so keyboard moves the highlight; no navigation.
- The heading says IMPORT FLOW but the template must use per-service `process.title` (Q6).

### 2.4 Dark band: Consultancy & Compliance y 2185-3120
Background deep navy `#021150`-like with a subtle dotted texture. Container x 320-1600.
- Left column x 190-620:
  - H2 (white, bold, 2 lines, y 2310-2460) `Consultancy & Compliance` followed by an orange full stop `.` (the dot is orange, part of the design).
  - Text (light grey-blue, 2 lines): `Expert guidance to ensure compliance, reduce risk and support your growth.`
  - 2x2 stats grid y 2640-3010 with thin vertical and horizontal divider lines (low-opacity white): each = orange line icon, bold orange number (big), small white uppercase label:
    - ship with containers icon, `200+`, `SHIPPING LANES`
    - globe with pin icon, `85`, `GLOBAL OFFICES`
    - box icon, `12M+`, `TONS SHIPPED YEARLY`
    - headset icon, `24/7`, `SUPPORT CENTER`
- Right: 3 tall glass cards y 2321-3017, x 702-1042 / 1060-1398 / 1415-1753 (340 wide), border 1px light blue at low opacity, radius ~28, translucent blue. Each: 3D illustration on top (clipboard + containers; folders + scales of justice; shield + globe + growth chart), then a white round badge with a blue outline icon (clipboard-checklist; shield-check; bar chart), title (white, bold, 2 lines, centered), short orange rule (40px). Titles: `Trade Compliance`, `Regulatory Consulting`, `Risk Management`. No body text, no links visible. Illustrations are content images (one per card).
- Numbers in this band (`200+`, `85`, `12M+`, `24/7`) are fixture values from the design, per service data, NOT facts to reuse for other services (Q2). They also differ from the Home stats band.
- Interactive: none visible (Q7: are the cards links to related services? Not indicated; render as non-links).

### 2.5 Key features y 3120-3691 (grey-blue `#F1F5F9`)
- Eyebrow (red italic bold underlined, centered, y~3214): `Our Capabilities`
- H2 (navy bold, centered, y~3277): `Key Logistics Features`
- 3 white cards y 3374-3607, x 320-725 / 757-1162 / 1194-1600 (405 wide, gap 32), padding ~32, no border, no radius: blue line icon (28px, top-left), title (dark bold), description (grey, 3 lines):
  1. radar/target icon, `Real-time Tracking`, `Complete visibility into your shipment status with our proprietary GPS tracking dashboard.`
  2. shield icon, `Risk Management`, `Comprehensive cargo insurance and proactive contingency planning for every shipment.`
  3. globe icon, `Global Compliance`, `Expertise in international trade laws ensuring all documentation meets regulatory standards.`
- Interactive: none.
- The text claims (GPS dashboard, cargo insurance) are design copy; they are fixture values only (Q2). The count is 3 in the design; the data allows 1..6 (grid wraps).

### 2.6 Why choose y 3691-4575 (white)
- Left, x 320-920: collage of 4 photos, rounded ~16 with soft shadow, two staggered columns (right column starts lower). Col A x 320-612 (292 wide): photo 1 starts y 3787 (dark blue tech scene with 4 cartoon business people), photo 3 below it (warehouse with yellow forklift truck). Col B x 628-920: photo 2 starts y ~3818 (man writing at a desk), photo 4 below it ends y 4516 (blue port cranes and containers by the sea). Measure exact heights from the export when building. Content photos: `service.why.images[0..3]`, `object-fit: cover`.
- Right, x 1000-1600:
  - Eyebrow (red italic bold underlined): `The STS Edge`
  - H2 (navy bold, 2 lines): `Why Choose Saigontrans?`
  - Paragraph (grey, 3 lines): `Beyond basic transport, we provide business intelligence. Our partnership approach means we integrate with your supply chain to find efficiencies you didn't know existed.`
  - 2x2 grid of benefits: each = 48px rounded light-blue-lavender tile with navy icon + title (dark bold) + description (grey, small, 3 lines):
    - banknote icon, `Cost Optimization`, `Route consolidation and volume rates that reduce overhead by up to 20%.`
    - badge-check icon, `Quality Control`, `Rigorous audit processes at every transit point to ensure cargo integrity.`
    - lightning icon, `Scalable Logistics`, `Infrastructure that grows with your business needs, from 1 pallet to 1,000.`
    - headset icon, `Account Management`, `A dedicated single point of contact who understands your business nuances.`
- Interactive: none. "up to 20%" and "1 pallet to 1,000" are design copy, unverified claims (Q2).

### 2.7 CTA band (shared) y 4575-4937
Shared CTA band ("Ready to optimize your supply chain"). Visible differences vs Home: text reads `READY TO OPTIMIZE YOUR SUPPLY CHAIN?` (uppercase heading, 2 lines), `Get a tailored quote for your international shipping needs today from our expert logistics consultants.`, buttons `REQUEST A FREE QUOTE >` (red) and `CONTACT SALES` (outlined, with checkbox-style icon). No difference in structure: use the shared block. Top corners of the band have a large radius (Home: ~64).

### 2.8 Footer (shared) y 4937-5478
Shared footer + copyright bar. Visible text: columns `Solutions` (Shipping Instruction, Process Import and Export, Transport solution), `Company` (About, Career, Contact), `Resource` (Customers, Strategic Finance, Ebooks & Guides), `Features` (Freelancer, Data Analytics, Small Business); newsletter block; `©Copyright 2025 STS All Rights Reserved`. No differences vs Home.

Not in this design (vs Home): Request a Quote card, stats band, Partners & Clients, news. Partners & Clients is NOT shown on this page (the task lists it as recurring, but it does not appear in this export; do not add it, Q8).

## 3. Data model

Constraint: Service today (`src/lib/cms/schema.ts`) = Base + `slug`, `icon`, `image`, `translations[{title, summary, body}]`. The design needs far more. Proposal: extend Service and add sub-collections (Directus O2M with `sort`), all following the Base + `translations[]` conventions. Existing fields keep their meaning: `title` = list/card name, `summary` = card text, `image` = card image on Home/Our Service lists. Existing fixture services stay valid because every new field is optional or defaulted.

Marking: [D] = value from the design (fixture); [Q] = open question; unmarked = structure only.

```ts
// Reuse: Base, File, T, Locale from schema.ts
const Icon = z.string();                 // icon key from the shared icon set (SVG sprite), not a file. See Q9.

const Service = Base.extend({            // existing fields kept
  slug: z.string(),                      // [D] "logistics"
  icon: z.string().nullable(),
  image: File.nullable(),                // card image on lists (existing)
  hero_image: File.nullable(),           // [D] 2.1 harbour cranes photo
  highlights_image: File.nullable(),     // [D] 2.2 isometric scene
  related_services: z.array(z.uuid()),   // M2M to Service, ordered; empty = auto (see 4)
  highlights: z.array(ServiceHighlight),         // sub-collection service_highlights
  process: ServiceProcess.nullable(),            // 1 per service (inline group)
  expertise: ServiceExpertise.nullable(),        // dark band group
  features: z.array(ServiceFeature),             // service_features
  why: ServiceWhy.nullable(),                    // group
  translations: z.array(T({
    title: z.string(),                   // [D] "Logistics Solution" (hero H1) [Q1: card title in lists differs, see Q10]
    summary: z.string(),                 // card text on lists
    body: z.string().nullable(),         // unused by this page (Q11)
    hero_subtitle: z.string(),           // [D] 2.1 text
    intro_eyebrow: z.string().nullable(),// [D] "Our Services" (template default from messages if null)
    intro_title: z.string(),             // [D] "Logistics Experts for Highly Technical Industries."
    intro_html: z.string(),              // [D] 2.2, sanitized rich text (strong/em/a)
    highlights_title: z.string().nullable(), // [D] "KEY HIGHLIGHTS" (template default)
    meta_description: z.string().nullable(), // none in design [Q1]
  })),
});

const ServiceHighlight = Base.extend({   // 2.2, 0..6 items; design = 4
  service: z.uuid(), icon: Icon, emphasis: z.boolean(),   // [D] only #4 true
  translations: z.array(T({ label: z.string() })),       // [D] Ground Pickup, Sea/Air Transit, Customs Clearance, Final Delivery
});

const ServiceProcess = z.object({        // 2.3 group fields on Service (or 1:1 collection)
  steps: z.array(ServiceStep),           // 2..6; design = 4
  default_active: z.number().int().nullable(),   // [D] 2 (1-based step number) [Q5]
  translations: z.array(T({ eyebrow: z.string(), title: z.string(), subtitle: z.string() })),
  // [D] eyebrow "Execution Strategy", title "IMPORT FLOW", subtitle "A clear and efficient 4-step process to ensure your cargo is imported smoothly and delivered on time."
});
const ServiceStep = Base.extend({
  icon: Icon,                            // [D] ship-plane, clipboard-shield, truck, warehouse
  translations: z.array(T({ label: z.string() })),  // [D] Port / Airport Arrival, Customs Clearance, Inland Transport, Delivery to Warehouse
  // number is derived from sort order (01, 02...), not stored
});

const ServiceExpertise = z.object({      // 2.4, optional group; hidden entirely when null
  stats: z.array(z.object({ value: z.string(), icon: Icon,
    translations: z.array(T({ label: z.string() })) })),  // [D] 200+/SHIPPING LANES, 85/GLOBAL OFFICES, 12M+/TONS SHIPPED YEARLY, 24/7/SUPPORT CENTER [Q2]
  cards: z.array(z.object({ image: File, icon: Icon,
    translations: z.array(T({ title: z.string() })) })),  // [D] Trade Compliance, Regulatory Consulting, Risk Management
  translations: z.array(T({ title: z.string(), text: z.string() })),
  // [D] title "Consultancy & Compliance" (the orange "." is added by the template), text "Expert guidance to ensure compliance, reduce risk and support your growth."
});

const ServiceFeature = Base.extend({     // 2.5
  service: z.uuid(), icon: Icon,
  translations: z.array(T({ title: z.string(), text: z.string() })),  // [D] 3 cards, see 2.5
});
// Section heading texts on Service translations: features_eyebrow "Our Capabilities", features_title "Key Logistics Features" [D]

const ServiceWhy = z.object({            // 2.6
  images: z.array(File).max(4),          // [D] 4 photos, order = collage order
  items: z.array(z.object({ icon: Icon,
    translations: z.array(T({ title: z.string(), text: z.string() })) })),   // [D] 4 items, see 2.6
  translations: z.array(T({ eyebrow: z.string(), title: z.string(), text: z.string() })),
  // [D] "The STS Edge" / "Why Choose Saigontrans?" / paragraph in 2.6
});

const ServiceSidebar = z.object({ translations: z.array(T({ help_title: z.string(), help_text: z.string() })), help_phone: z.string() });
// [D] "Need Help?", "Our logistics experts are ready to assist with your custom requirements.", "+1 (800) SAIGON-1".
// Sidebar help is the same for all services: store once in a global "contact settings"/messages, not per service [Q12].
```

Rules:
- Every group is optional: a section whose data is empty/null is NOT rendered (no empty heading). `process.steps` < 2 hides section 2.3. Text for template labels (eyebrows with defaults, "Related Services", "KEY HIGHLIGHTS") lives in `messages/en.json`, overridable by the translated field when non-null.
- `lib/cms` new functions (contract like the existing ones: published only, locale resolved with `en` fallback, nulls instead of throws, sub-collections sorted by `sort`): `getServiceBySlug(locale, slug): Promise<ServiceDetail | null>` (Service with all sub-collections resolved, `related_services` resolved to `{slug,title}`), `getServiceSlugs(): Promise<string[]>`. Components never read fixtures.
- Fixture: add a `logistics` record to `services.json` (+ fixture sub-collections) with values [D] above. Existing fixture slugs (`logistic-service`, `freight-forwarding`, `warehousing`, `e-commerce`) have no detail content in the design: they must still render with only the sections their data fills (hero from `title` + `summary`, no other sections), or be filled with the same example only if the owner agrees (Q10). Image ids: new uuids; the files are exported from the Figma frame to `public/fixtures/`.
- Do not invent facts: every number or claim in [D] above stays flagged as sample (Q2).

## 4. Actions

| Element | Behavior |
|---|---|
| Entry points | Home service card, Our Service list card ("Read More"), header menu, Related Services rows all link to `/en/services/<slug>`. Services without a published detail still resolve (hero only). |
| Header, footer, newsletter | Shared behavior (requirements.md, Actions). SERVICES nav item gets `aria-current="page"` here. |
| Hero | No actions. |
| Related Services row | Link to `/en/services/<related.slug>`, same tab. Source: `service.related_services` in order; if empty, the other published services sorted by `sort`, current excluded, at most 4. Hidden card when the list is empty. Keyboard focus ring visible; hover: text and chevron navy. |
| Need Help phone | The visible text stays `+1 (800) SAIGON-1` (letters, not dialable). `href` comes from a separate `help_phone_href` setting (Q13). Until it is given, the row links to `/en/contact`. |
| Key Highlights tiles | Not interactive (no hover, not focusable). |
| Process cards | Focusable, hover/focus/tap sets the active card (red state, pointer triangle); leaving does not clear (the last active stays; initial = `default_active`). No navigation. Key: Enter/Space on focused card also activates; arrow keys not required. |
| Expertise cards, feature cards, why items | Not interactive. |
| CTA `REQUEST A FREE QUOTE` | Same as Home: goes to the quote form on Home (`/en#quote`) [or Contact, shared decision]. `CONTACT SALES` -> `/en/contact`. |
| Header Booking | Shared. |
| Accordions, tabs, galleries/lightbox | None in this design. |
| Links to unfinished content | `#` not allowed. |

## 5. Responsive behavior

Global: container max 1292 centred, side gutter 16px below 1292 (428 and below: 16px as Home mobile). `box-sizing: border-box`, images `max-width:100%`. No horizontal page scroll from 320 up (carousels scroll inside their own container only). Header/footer/CTA follow the shared rules (hamburger below 1024; stacked footer at 428).

| Section | 1920 (design) | 1280 | 1024 | 768 | 428 (and 320-767) |
|---|---|---|---|---|---|
| Hero | 495 high, centered, H1 ~75px class, subtitle 2 lines | same, fluid font (clamp) | same | height ~360, subtitle wraps to 3-4 lines | height ~300, H1 up to 2 lines (clamp ~34px), subtitle small, 16px gutters; header stacked as Home mobile |
| Intro | 2 columns: main 848 + sidebar 320 | 2 columns, container shrinks, sidebar 300 | 2 columns, sidebar 280 | 1 column: main, then sidebar cards stacked full width (Related, then Need Help, Need Help height auto, no empty space) | 1 column; H2 ~30px; decorations (dotted map, forklift) hidden below 768 |
| Key Highlights | 4 tiles in a row + image | same | same | 4 tiles in a row (labels wrap) | 2x2 grid of tiles, image full width under them |
| Process | 4 cards in a row with connectors | same | same, narrower | 2x2 grid, connectors hidden | horizontal scroll-snap carousel, 1 card ~80% width visible, pagination dots below (Home pattern); connectors hidden; the pointer triangle hidden |
| Expertise band | left text+stats, right 3 cards in a row | same | text on top (full width), stats 4 across, 3 cards below in a row | text, stats 2x2, cards in 1 row of 3 narrower or 2+1 (rule: 3 across down to 768) | text, stats 2x2, cards in a scroll-snap carousel with dots (1 card ~80% visible) |
| Key features | 3 cards in a row | 3 | 3 | 2 columns, third wraps full row (or 3 narrow: rule is 2 columns) | scroll-snap carousel with dots, 1 card ~85% visible |
| Why choose | collage left, text right | same | collage left narrower, text right | 1 column: text first, then collage | 1 column: text first (benefits 1 column), collage as 2-column grid of the 4 photos |
| CTA band | shared | shared | shared | shared | shared (stacked, full-width buttons) |
| Footer | shared | shared | shared | shared | shared (stacked) |

Rule of order on mobile: hero, intro text, Key Highlights, Related Services, Need Help, process, expertise, features, why, CTA, footer. Tap targets >= 44px. The carousels need dots that reflect the current slide, work with touch swipe and keyboard (focusable container, arrow keys).

## 6. Acceptance criteria

Shared rule: full-page pixel difference vs `design/exports/service-detail/desktop-1920@1x.png` at viewport 1920 is <= 3% (for `/en/services/logistics`, with the header SERVICES-active deviation excluded from the diff or logged).

- SD-1: Given the fixture exists, When I open `/en/services/logistics`, Then the status is 200, `<html lang="en">`, and `<title>` is `Logistics Solution | Saigon Trans` (Q1).
- SD-2: Given a slug that does not exist (`/en/services/does-not-exist`), When I open it, Then the status is 404 and the site 404 page shows.
- SD-3: Given a service with `status=draft`, When I open its slug, Then the status is 404.
- SD-4: Given `/en/services/logistics` at 1920, When the page loads, Then there is exactly one `h1` with text `Logistics Solution` and the subtitle text equals the verbatim hero subtitle (case-insensitive).
- SD-5: Given the page at 1920, When I read the section order, Then it is: header, hero, intro (eyebrow `Our Services`, H2 `Logistics Experts for Highly Technical Industries.`), process (`IMPORT FLOW`), expertise (`Consultancy & Compliance`), features (`Key Logistics Features`), why (`Why Choose Saigontrans?`), CTA, footer; and Partners & Clients is absent.
- SD-6: Given the intro, When I inspect it, Then `Customs Clearance, Transport Solutions, E-commerce, and Drop Shipping.` is inside a `strong` element.
- SD-7: Given the Key Highlights box, When I count items, Then there are 4 with labels `Ground Pickup`, `Sea/Air Transit`, `Customs Clearance`, `Final Delivery` in this order, and the illustration image has non-empty `alt` or `alt=""` with `role=presentation` per Q14.
- SD-8: Given the sidebar, When I list the Related Services links, Then they are the data-driven list (fixture: `Ocean Freight`, `Air Cargo`, `Customs Brokerage`, `Warehousing`) in order, each is an `a` with an `href` matching `/en/services/<slug>`.
- SD-9: Given a Related Services link, When I click it, Then the URL changes to its `/en/services/<slug>` and the H1 changes accordingly (or 404 if the slug has no published service, which the fixture must avoid: Q10).
- SD-10: Given Related Services is empty in data and other published services exist, When the page renders, Then it shows the others (max 4) excluding the current one; and when none exist the card is not rendered.
- SD-11: Given `Need Help?` card, When I inspect it, Then it contains `Our logistics experts are ready to assist with your custom requirements.` and a link with text `+1 (800) SAIGON-1` whose `href` is `tel:` or `/en/contact` per Q13.
- SD-12: Given the process section, When the page loads, Then there are 4 cards numbered `01`..`04` with labels `Port / Airport Arrival`, `Customs Clearance`, `Inland Transport`, `Delivery to Warehouse`, and card `02` has `data-active="true"`.
- SD-13: Given the process section, When I hover or focus card `03`, Then card `03` has `data-active="true"` and no other card does.
- SD-14: Given the expertise band, When I read it, Then the 4 stats `200+`, `85`, `12M+`, `24/7` appear with labels `SHIPPING LANES`, `GLOBAL OFFICES`, `TONS SHIPPED YEARLY`, `SUPPORT CENTER`, and 3 cards titled `Trade Compliance`, `Regulatory Consulting`, `Risk Management`.
- SD-15: Given the features section, When I count cards, Then there are 3, titled `Real-time Tracking`, `Risk Management`, `Global Compliance`, each with a non-empty description.
- SD-16: Given the why section, When I count benefit items and photos, Then there are 4 items (`Cost Optimization`, `Quality Control`, `Scalable Logistics`, `Account Management`) and 4 images.
- SD-17: Given a service whose data has no `process`, `expertise`, `features` and `why`, When I open it, Then only the hero, intro (if filled), CTA and footer render, no empty headings exist, and the status is 200.
- SD-18: Given the fixture files, When the contract test parses `services.json` and the sub-collection fixtures with the Zod schemas of section 3, Then every record parses and no component imports a fixture or the Directus SDK.
- SD-19: Given a record with only the `en` translation, When rendered for locale `vi` (once enabled), Then it falls back to `en` and does not error.
- SD-20: Given the CTA band, When I click `CONTACT SALES`, Then I land on `/en/contact`; When I click `REQUEST A FREE QUOTE`, Then the quote form is shown (same target as Home).
- SD-21: Given viewports 1280, 1024, 768, 428 and 320, When I open the page, Then `document.documentElement.scrollWidth <= window.innerWidth`.
- SD-22: Given viewport 428, When I look at the Key Highlights, Then the 4 tiles are laid out in 2 columns and 2 rows; Given 768 they are 4 in one row.
- SD-23: Given viewport 428, When I look at the process, features and expertise cards, Then each is a horizontally scrollable container (`overflow-x: auto`, scroll-snap) with pagination dots, and swiping/scrolling to the last card makes the last dot current; the page itself does not scroll horizontally.
- SD-24: Given viewport 768 or below, When I read the DOM order and layout, Then the sidebar cards come after the intro main column in a single column; at 1024 and above they are beside it.
- SD-25: Given viewport 428, When I look at the intro, Then the dotted-map and forklift decorations are not visible (`display: none`).
- SD-26: Given the keyboard only, When I press Tab through the page, Then every link and every process card receives a visible focus ring, and no non-interactive element (highlight tiles, feature cards) is in the tab order.
- SD-27: Given the decorative images (dotted map, forklift, connector lines, headset emblem), When I inspect them, Then they have `aria-hidden="true"` or empty `alt`.
- SD-28: Given the header on this page, When I read the nav, Then SERVICES has `aria-current="page"`.
- SD-29: Given the full-page screenshot at 1920 of `/en/services/logistics`, When compared with the export, Then pixel difference <= 3%.

## 7. Design anomalies and open questions

Anomalies:
- A1. The frame is the "Logistics" example but the process is titled "IMPORT FLOW" and the dark band covers customs consultancy: the template must not assume a service is logistics.
- A2. Header: HOME is drawn active on an inner page (same on all exports); implement active = current section (SERVICES).
- A3. Related Services lists `Ocean Freight`, `Air Cargo`, `Customs Brokerage`, `Warehousing`; the fixture Services are `Logistic Service`, `Freight Fowarding`, `Warehousing`, `E-Commerce`; Our Service list shows other names. Only `Warehousing` matches.
- A4. Eyebrows are inconsistent: `Our Services`, `Our Capabilities`, `The STS Edge` are underlined; `Execution Strategy` is not underlined and has a rule below.
- A5. Leading space before "Saigontrans has authored..." (ignore). `Saigontrans` vs brand `Saigon Trans` / `SAIGONTRANS` in the same design.
- A6. Process card 02 shown in hover/active state by default (same pattern as Home anomaly 3). Process cards have unequal widths in the export (239/237/240/230 and uneven gaps).
- A7. Phone `+1 (800) SAIGON-1` has letters (not dialable); address in header is Australian (shared, see home.md).
- A8. Sidebar "Need Help?" card is much taller than its content (large empty blue area); at narrow widths use auto height.
- A9. Key Highlights tile 4 is filled while others are outlined: no stated meaning.
- A10. Expertise numbers and benefit claims (25 years, 20%, GPS, insurance, 200+, 85, 12M+) conflict with the guardrail "no invented numbers": they are design copy kept as sample content.

Open questions (do not assume; defaults used in this spec in brackets):
- Q1. Title suffix/brand string and a meta description for each service (none in design). [`<title> | Saigon Trans`; `summary`].
- Q2. Are the stats, claims and numbers in 2.4-2.6 real for Saigon Trans or placeholders? [kept as fixture sample, replaced before launch].
- Q3. Meaning of the filled 4th Key Highlights tile. [`emphasis` flag].
- Q4. Equal-width process cards? [equal widths in build, logged as deviation if the diff allows].
- Q5. Should the red active step be an editorial default (data) or only hover? [`default_active`, hover moves it].
- Q6. Is "IMPORT FLOW" per-service or specific to logistics? [per-service title].
- Q7. Are the 3 expertise cards links? [no].
- Q8. Should Partners & Clients appear on service pages? [no, absent in design].
- Q9. Icon source: icons are approximations of the Figma icon set (as on Home); one icon set keyed by string. Export originals from Figma?
- Q10. What do the 4 existing fixture services show (only hero + intro, or the same example content)? And is the card title (`Logistic Service`) the same as the hero H1 (`Logistics Solution`)? [independent: `title` for lists vs hero uses `title`; the hero H1 is `title` for `logistics`, so a distinct `hero_title` may be needed: owner decides]. Also the slug of the design example (`logistics`) is not among the existing fixture slugs.
- Q11. Is `body` used on this page? [unused].
- Q12. Is the sidebar help text/phone global or per service? [global setting, with per-service override not provided].
- Q13. Real dialable number for `tel:` href. [link to `/en/contact` until given].
- Q14. Alt texts for content images (hero, illustration, why collage, expertise cards): owner or content manager supplies; fallback `alt=""` is not acceptable for content images, so an `alt` field per image is needed [translations].
- Q15. Which background/overlay values exactly (navy `#021150` approx, blue `#0A24A8` approx): measure from the export when building and record in `design/reference/service-detail.md`.
