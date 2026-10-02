# Page spec: Our Service (service list) — `/en/services`

Source: `design/exports/our-service/desktop-1920@1x.png` (Figma frame "Our Service", 33:2467). Export is 1928x7558: it has a 4 px black stripe on the left and the right. The real frame is x 4..1923; crop `(4,0,1924,7558)` before any comparison. All y values below are in the cropped 1920x7558 frame; all x values are frame x (0..1919).
Shared blocks (not re-specified; follow `design/reference/home.md` and the Home spec): **shared: header / footer / cta / partners**. The page's own quote form is NOT the Home quote form (see 2.10).
Text is verbatim from the design, typos kept.

## 1. Route and purpose
- Route `/en/services` (locale-prefixed; `/vi` deferred). Static page, content via `lib/cms`.
- Purpose: one page that lists every service group (logistics, freight forwarding, warehousing, e-commerce) and links each service to its detail page `/en/services/<slug>`.
- Design frame name: "Our Service" (singular). Visible hero H1 is "OUR SERVICES".
- Proposed `<title>`: `Our Services | Saigon Trans`. Proposed meta description: `End-to-end logistics from Saigon Trans: customs clearance, door to door, freight forwarding, warehousing and e-commerce fulfilment.` [Proposed; owner to confirm wording; contains no figures].
- Header nav: the design draws HOME as the active tab; per requirements "active item reflects the current page" so SERVICES is active here (anomaly A2).

## 2. Sections top to bottom
Container conventions seen in the design: wide grid x 32..1888 (services cards); narrow container x 320..1600 (1280 wide, freight/warehousing/e-commerce); intro container x 360..1608.

### 2.0 Header — y 0..128 (shared: header). No visible difference except the active tab (A2).

### 2.1 Hero — y 0..518
- Purpose: page title.
- Background: full-bleed photo of a blue container truck in a yard, blurred, with a dark-blue overlay (content image; export from Figma, same family as Home hero). Header overlays its top.
- Text: H1 `OUR SERVICES` (white, bold, uppercase, centered, ≈75 px like the Home hero title, vertical centre y≈281). No subtitle.
- Buttons, centered, y 348..411: primary `Explore The Services` (blue `#3851DD`-family fill, white text, white square check icon at right; x 762..1034) and text link `Contact Us` with white circle-arrow icon (x 1054..1170).
- States: hover/focus-visible/active as in Home hero buttons.

### 2.2 Intro "End-to-End Logistics Solutions" — y 519..1230 (white)
- Left column x 360..1052:
  - Eyebrow (red, italic, bold, underlined): `Our Services` (y≈652)
  - H2 (navy, bold, ≈57 px, 2 lines): `End-to-End` / `Logistics Solutions` (y 690..815)
  - Paragraph (grey `#6E6E6E`-family, ≈18 px, line ≈29 px, 5 lines, y 835..970): `Saigontrans has authored and provided highly technical export / import training across these tightly controlled industries. If you have questions, need a partner to assist, or someone to handle the transaction start to finish - we have done it, we're here to do it and we're good at it. This is not work for an inexperienced Broker or Forwarder - you need clarity, communication and commitment to your business.`
  - Two inline stats (y 1010..1075), each: orange brain-gear outline icon + number (navy bold ≈40 px) + label (navy uppercase ≈18 px): `25+` / `YEARS EXPERIENCE` (x 360); `200` / `GLOBAL PARTNERS` (x 678).
  - Thin grey divider y≈1112, x 360..974.
- Right column image collage (decoration + content):
  - Photo 1 x 1082..1468, y 683..1067: aerial/port scene, cranes, cargo plane over container ship; an orange-red parallelogram graphic overlays its lower part (x 1112..1295, y 892..965): decoration.
  - Photo 2 x 1321..1608, y 783..1144: crane lifting a container over a port yard with a trailer.
  - White badge card (soft shadow) x 1112..1288, y 976..1152: `25` (red, bold ≈70 px) over `YEARS EXPERIENCE` (grey uppercase ≈17 px).
  - Dot-grid ornament (black dots) x ≈1500..1610, y 680..780; dotted world-map watermark (light grey) behind, x ≈1340..1920, y ≈590..800: decoration, `aria-hidden`.
- Grey forklift photo (desaturated, cut-out) sticks out of the left edge x 0..280, y ≈870..1230: decoration, `aria-hidden`.
- No interactive elements.

### 2.3 Group 1 "Logistics Services" — y 1231..2502 (bg ≈ `#F4F7FE`)
- Eyebrow centered (red italic underlined): `Services` (y≈1377). H2 centered navy bold ≈56 px: `Logistics Services` (y≈1439).
- Card grid, y 1533..2470, x 32..1888, no gaps: row 1 (y 1533..2002) three cards of equal width (x 32..650, 650..1269, 1269..1888); row 2 (y 2002..2470) two cards (x 32..960, 960..1888). Design layout key: `tiles`.
- Card (default state): full-bleed photo (aerial cargo plane over container terminal, the same photo in all five cards in the design) under a navy overlay; content anchored bottom-left with ≈60 px inset: orange box-in-hand outline icon (≈60 px) above a white bold title ≈40 px. Titles (verbatim): `Custom Clearance service`, `Door to Door services`, `Transport delivery services with haulage and long haul` (3 lines; icon sits higher), `Project cargo handling`, `Consolidation LTL services`.
- Card (hover/active state, drawn on card 2 "Door to Door services" in the export): white panel, 4 px blue bar at top (x 711..1237, y≈1567), large faint red watermark icon top right, orange icon, title turns red (≈24 px bold), summary 4 lines (≈16 px grey): `Energistically reconceptualize ubiquitous solution wherea` / `market-driven expertise.` / `Synergistical empower parallel processes with highly efficient infomediaries.`; divider; `Read More` (blue bold) with blue circle-arrow button at right.
- Same behavior as Home service cards: one card is highlighted by default (card 2 = `data-active`), hover or keyboard focus moves the highlight.
- Summary text is visible only in the hover state; in default state only icon + title show.

### 2.4 Group 2 "Freight Forwarding" — y 2503..3376 (grey `#F8F8F8`)
- Header row x 320..1600: eyebrow `Our Services` (left, y≈2646); H2 `Freight Forwarding` (left, navy bold ≈72 px, y≈2710); right-aligned lead text, 2 lines, ≈24 px dark grey (x ≈1040..1600, y 2697..2727): `Global reach with local intelligence. We coordinate complex international shipments across every mode of transport.`
- Three white text cards, y 2802..3009, x 320..725 / 758..1162 / 1195..1600 (405 x 207), no icon, no image, no link text. Font in the cards is a geometric sans different from Inter (A6). Layout key: `cards`.
  1. `Air Freight Consolidation` / `High-speed global reach with priority cargo space on premium airlines and dedicated charter options for urgent payloads.`
  2. `Sea Freight (FCL & LCL)` / `Comprehensive ocean solutions from Full Container Loads to Less than Container Loads, integrated with major global carrier alliances.` — drawn in hover state: 1 px grey border + large soft shadow (default highlighted card).
  3. `Inland & Rail Transport` / `Reliable land-based connectivity bridging ports and hinterlands via advanced trucking fleets and high-capacity rail networks.`
- Process tracker, y 3095..3250, six steps centered on x ≈466, 663, 861, 1059, 1256, 1453, joined by dashed lines whose colour goes light pink → red (strongest between steps 4–5). Each step: dark-navy rounded square (≈80 px) with a white icon, a grey kicker, a black label. Layout of the kicker/label per step (verbatim): 
  1. icon factory — `Step 01` / `Origin`
  2. icon delivery truck — `Step 02` / `Pick Up`
  3. icon ship — ACTIVE: lighter-blue square with orange border, kicker `Transit` (orange) / `Main Leg`
  4. icon gavel — `Step 04` / `Clearance`
  5. icon archive box — `Step 05` / `Sorting`
  6. icon map pin — FINAL: orange filled square, kicker `Success` (orange) / `Delivered`
- Step squares and label baselines vary by a few px in the export (A7); treat as one aligned row.
- Interactive: cards hover/focus (see 4). Steps are static.

### 2.5 Group 3 "Ware housing services" — y 3377..4529 (white)
- x 320..1600. Eyebrow left `Our Services` (y≈3520). H2 left `Ware housing services` (design typo: "Ware housing", y≈3584, ≈64 px).
- Photo grid 2x2, y 3655..4338, cells 640 x 342 (x 321..960, 960..1599; rows 3655..3996, 3996..4338), 1 px white gaps. Layout key: `photo-grid`. Each cell: full-bleed photo with blue gradient overlay increasing toward the bottom; bottom-left white title (≈26 px, geometric sans) and 2-line translucent white summary (≈16 px):
  1. `Warehousing & packing services` / `Automated sorting and high-density storage for optimized picking and packing.` (photo: forklift and packers in a rack warehouse)
  2. `Distribution center services` / `Automated sorting and high-density storage for optimized picking and packing.` (photo: conveyor sorting hall)
  3. `Personal Effect handling services` / `Strategically located hubs designed for high-velocity regional fulfillment.` (photo: packing zone with signage)
  4. `Container renting to store goods` / `Strategically located hubs designed for high-velocity regional fulfillment.` (photo: container storage yard, sign `CONTAINER STORAGE RENTAL` / `DỊCH VỤ CHO THUÊ CONTAINER LƯU TRỮ` is baked into the photo)
- Centered link under the grid, y≈4381: `View Facilities` + right arrow (navy bold ≈28 px).
- Photos are content images (CMS files); overlay is CSS.

### 2.6 Group 4 "E-commerce Solutions" — y 4529..5217 (bg ≈ `#F8FAFC`)
- Eyebrow centered `Our Services` (y≈4665); H2 centered `E-commerce Solutions` (y≈4729).
- Left 2x2 cards, x 325..930, y 4822..5098; card ≈294 x 129, gap ≈16; white, title navy bold ≈24 px, 2-line grey summary. Layout key: `cards-lifecycle`.
  1. `Domestic Parcel` / `Last-mile delivery with full tracking.` — drawn in hover state (light-blue 1 px border + shadow)
  2. `Global Shipping` / `200+ countries with customs support.`
  3. `Return Management` / `Simplified reverse logistics flows.`
  4. `API Integration` / `Seamless checkout connectivity.`
- Right box "Service Lifecycle", x 990..1595, y 4822..5098, 1 px blue border, white/transparent: title red `Service Lifecycle`; four rows with a numbered circle (outlined navy, ≈32 px) and navy bold label: `01` `Automated Picking & Packing`; `02` `Regional Hub Consolidation`; `03` `Local Carrier Distribution`; `04` `Final Consumer Delivery` (row 4 final: red filled circle, red label).

### 2.7 Quote section "Request a Project Quote" — y 5218..6119
- Background: full-bleed photo of trucks and trees, strongly blue-tinted (`#0F25A0` family), decoration.
- Card x 344..1576, y 5314..6022, two halves 616 wide.
- Left half (white, padding ≈50): H3 navy bold ≈28 px `Request a Project Quote`; sub `Our architects will analyze your requirements and respond within 4 hours.` Form, underline-style inputs (label small grey uppercase, placeholder grey):
  - `FIRST NAME` / `Enter first name`; `LAST NAME` / `Enter last name`
  - `CORPORATE EMAIL` / `name@company.com`; `PHONE NUMBER` / `+1 (555) 000-0000`
  - `SERVICE TYPE` / select showing `Select Logistics Service` with chevron; `ESTIMATED VOLUME` / `e.g. 50 containers/month`
  - `PROJECT BRIEF` / textarea `Describe your logistics challenges...` (full width, ≈75 px)
  - Submit button full width, blue gradient with glow shadow, white spaced uppercase `INITIALIZE INQUIRY`.
- Right half: photo of a white tractor with a blue container (fades in from the left edge into the section blue); overlaid translucent white caption card x 1008..1528, y 5825..5974: `Kinetic Efficiency` (bold ≈26 px) / `Leverage...` verbatim: `Leveraging Vietnam's strategic position with precision logistics and real-time manifest tracking.`
- This form differs from the Home quote form in fields, labels, button and copy; it adds fields and a response-time promise: see A3, A4, Q1, Q2 (guardrail: ask first).

### 2.8 Partners & Clients — y 6120..6653 (shared: partners)
Eyebrow `Our Key`, H2 `Partners & Clients`, 7 logos in one row (same 7 sample logos as Home). No difference.

### 2.9 CTA band — y 6654..7016 (shared: cta)
`READY TO OPTIMIZE YOUR SUPPLY CHAIN?` / `Get a tailored quote for your international shipping needs today from our expert logistics consultants.` / `REQUEST A FREE QUOTE` / `CONTACT SALES`. No difference.

### 2.10 Footer — y 7017..7557 (shared: footer). No difference (copyright bar 7492..7557).

## 3. Data model
Principle: the existing `Service` records (4, used on Home) are the top-level groups. Each card on this page is a child `Service` with its own slug (the detail page `/en/services/<slug>` is built from a Service). Home keeps listing only top-level records (`parent = null`).

```ts
// Extension of src/lib/cms/schema.ts
export const ServiceLayout = z.enum(['tiles', 'cards', 'photo-grid', 'cards-lifecycle']);

export const Service = Base.extend({
  slug: z.string(),                         // unique across parents and children
  icon: z.string().nullable(),              // existing icon-name set; new names listed in section 5 notes
  image: File.nullable(),                   // card photo (child) / Home card photo (parent)
  parent: z.uuid().nullable(),              // NEW. null = group (Home + section on this page); set = child card
  layout: ServiceLayout.nullable(),         // NEW. only for groups: which block renders its children
  translations: z.array(T({
    title: z.string(), summary: z.string(), body: z.string().nullable(),
    section_eyebrow: z.string().nullable(),   // NEW, groups only
    section_title: z.string().nullable(),     // NEW, groups only (differs from `title`)
    section_intro: z.string().nullable(),     // NEW, groups only (freight lead text)
    section_link_label: z.string().nullable(),// NEW, groups only (e.g. "View Facilities")
    steps_title: z.string().nullable(),       // NEW, groups only (e.g. "Service Lifecycle")
  })),
});

export const ServiceStep = Base.extend({      // NEW collection
  service: z.uuid(),                          // the group it belongs to
  kind: z.enum(['process', 'lifecycle']),
  variant: z.enum(['default', 'active', 'final']),
  icon: z.string().nullable(),                // process only; lifecycle shows the number
  translations: z.array(T({ label: z.string(), kicker: z.string().nullable() })),
  // kicker null => UI renders "Step NN" (NN = 1-based position by `sort`, zero padded); lifecycle ignores kicker
});

export const ServicesPage = Base.extend({     // NEW singleton "services_page"
  hero_image: File,
  intro_images: z.array(File).length(2),      // photo 1, photo 2
  intro_stats: z.array(z.uuid()),             // NEW: ids of Stat records? see Q3; alternative below
  quote_image: File,                          // right half of the quote card
  quote_background: File,
  translations: z.array(T({
    seo_title: z.string(), seo_description: z.string(),
    hero_title: z.string(),
    intro_eyebrow: z.string(), intro_title: z.string(), intro_body: z.string(),
    badge_value: z.string(), badge_label: z.string(),
    quote_title: z.string(), quote_intro: z.string(),
    quote_caption_title: z.string(), quote_caption_body: z.string(),
  })),
});
```
`intro_stats` (Q3): the two inline stats are page content, not Home stats (Home values are 50+/30/50+/50/03). Preferred: reuse the `Stat` shape inside the singleton as a Directus repeater `intro_stats: z.array(z.object({ value: z.string(), icon: z.string().nullable(), translations: z.array(T({ label: z.string() })) }))`. Use that, not a uuid list.

`lib/cms` additions: `getServiceGroups(locale)` → groups (parent null, published, by `sort`) each with `children` (published, by `sort`) and `steps`; `getServicesPage(locale)`; `getServiceBySlug(locale, slug)` (detail spec). Same rules: published only, locale fallback to `en`, never throws, `[]`/`null` when missing. Existing `getServices` must return only `parent = null`.

Fixture values taken from the design (everything verbatim in section 2). Mapping:
| Group (existing slug) | `layout` | `section_eyebrow` / `section_title` | children (slug proposed) |
|---|---|---|---|
| `logistic-service` (title "Logistic Service") | `tiles` | `Services` / `Logistics Services` | `custom-clearance-service`, `door-to-door-services`, `transport-delivery-haulage-long-haul`, `project-cargo-handling`, `consolidation-ltl-services` |
| `freight-forwarding` ("Freight Fowarding") | `cards` | `Our Services` / `Freight Forwarding`; intro = lead text | `air-freight-consolidation`, `sea-freight-fcl-lcl`, `inland-rail-transport` + 6 `ServiceStep` (process) |
| `warehousing` | `photo-grid` | `Our Services` / `Ware housing services`; link label `View Facilities` | `warehousing-packing-services`, `distribution-center-services`, `personal-effect-handling-services`, `container-renting-to-store-goods` |
| `e-commerce` | `cards-lifecycle` | `Our Services` / `E-commerce Solutions`; `steps_title` `Service Lifecycle` | `domestic-parcel`, `global-shipping`, `return-management`, `api-integration` + 4 `ServiceStep` (lifecycle) |
Child slugs are proposals (derived from titles; not in the design). Child `icon` for `tiles` children: `box-hand` (design icon). Child summaries: `Door to Door services` has the hover text from the design; the other four `tiles` children show no summary in the design: reuse the same placeholder text (as the fixtures already do) and mark it as sample. Child `image` of `tiles`: one shared photo (A5). Group fixtures `title` stay as today (Home depends on them).
Steps fixtures (freight, `kind: process`, by `sort`): (1 default, icon `factory`, kicker null, `Origin`); (2 default, `truck`, null, `Pick Up`); (3 active, `ship`, `Transit`, `Main Leg`); (4 default, `gavel`, null, `Clearance`); (5 default, `archive`, null, `Sorting`); (6 final, `map-pin`, `Success`, `Delivered`). Lifecycle (`kind: lifecycle`): 1 `Automated Picking & Packing`; 2 `Regional Hub Consolidation`; 3 `Local Carrier Distribution`; 4 (final) `Final Consumer Delivery`.
Page singleton fixture: texts from 2.1, 2.2, 2.7; intro stats `25+`/`YEARS EXPERIENCE`, `200`/`GLOBAL PARTNERS` (design values, sample); badge `25`/`YEARS EXPERIENCE`. Images are cut from the export for now (as on Home) and replaced by Figma originals later.
UI labels not in CMS (message file `services.*`): `Explore The Services`, `Contact Us`, `Read More`, form labels and placeholders, `INITIALIZE INQUIRY`, option label `Select Logistics Service`.
Quote lead: needs `service_type` (z.string, optional; value = group or child slug) and `estimated_volume` (z.string().max(120).optional) added to `LeadInput`/`Lead` and a `source_page` of `/en/services`; `message` already exists. Blocked by Q1.

## 4. Actions
| Element | Behavior |
|---|---|
| Hero `Explore The Services` | Smooth scroll (instant under `prefers-reduced-motion`) to the first group section (id = its slug, here `logistic-service`); updates the hash; focus moves to that section's H2. [Proposed: it is the page's own list] |
| Hero `Contact Us` | Navigates to `/en/contact` |
| Group 1 card (whole card is one link, stretched) and its `Read More` | `/en/services/<child slug>` |
| Group 2 text cards | Whole card is a link to `/en/services/<child slug>` [Proposed: design shows hover style but no link text] |
| Process tracker steps, lifecycle rows | Static, not focusable |
| Group 3 photo cells | Whole cell links to `/en/services/<child slug>` [Proposed] |
| `View Facilities` | `/en/services/warehousing` (the group's detail page) [Proposed, Q4] |
| Group 4 cards | Whole card links to `/en/services/<child slug>` [Proposed] |
| Active highlight (groups 1, 2, 4) | One card has the highlighted look by default (the one drawn in the design: card 2 / card 2 / card 1); pointer hover or keyboard focus on another card moves the highlight; leaving all cards keeps the last one |
| Quote form | Validate (required: first name, last name, corporate email, phone; others optional [Proposed]); honeypot `website`, rate limit and lead storage as the Home form; success and error states as the Home form (focus handling included); no response deadline in success text (decided rule). Blocked by Q1/Q2 until the owner approves the extra fields |
| Service type select | Options = published top-level groups + placeholder `Select Logistics Service` (disabled, selected); option values are slugs |
| Header, footer, CTA, partners | As in shared specs. CTA `REQUEST A FREE QUOTE` on this page scrolls to this page's quote section (id `quote`) instead of Home's form [Proposed] |
All links keyboard reachable in DOM order, visible focus ring; no `#` placeholder links.

## 5. Responsive behavior
No horizontal page scroll at any width from 320 up. Pattern source: Home mobile (428): single column, 16 px gutters, horizontal scroll-snap carousels with pagination dots, stat grid 2 columns, stacked footer, hamburger header with language selector, full-width cards. Carousel = scroll-snap-x mandatory, dots reflect the visible slide, swipe and keyboard (arrow keys / focusable cards) work, dots are buttons labelled `Slide N`.
| Section | 1920 (design) | 1280 | 1024 | 768 | 428 (and 320..427) |
|---|---|---|---|---|---|
| Header | shared | shared | hamburger below 1024 | hamburger | hamburger + language selector |
| Hero | as 2.1; H1 ≈75 px | same, H1 scales (`clamp`) | same | H1 ≈56 px, buttons in a row | H1 ≈40 px, 2 lines, buttons stay in one row, wrap if <360 |
| Intro | 2 columns, collage right | 2 columns, collage scaled to column | 2 columns narrower; collage scaled | 1 column: text then collage (collage full width, badge kept) | 1 column; stats stay side by side (2 col); collage max width 100%; forklift and map watermark hidden |
| Group 1 tiles | 3+2 grid full-bleed | 3+2 | 3+2 (min height keeps titles legible) | 2 columns, last card spans 2 | Horizontal carousel, card ≈ 85% width, dots; active card shows its hover content by default only on the snapped card |
| Group 2 | head row with lead text right; 3 cards; 6-step row | same | head stacks (lead below H2, left aligned); 3 cards; steps row shrinks | cards 1 column; steps 3 x 2 grid, dashed connectors hidden | cards in a carousel with dots; steps 2 x 3 grid (or horizontal scroll inside its own container only); connectors hidden |
| Group 3 | 2x2 photo grid | 2x2 | 2x2 | 2x2, smaller type | 1 column stack of 4 cells (≈ 16:11), `View Facilities` centered |
| Group 4 | 2x2 cards left + lifecycle box right | same | same, narrower | 2x2 cards, lifecycle box below, full width | cards in a carousel with dots (1 per view); lifecycle box full width below |
| Quote | 2 halves | 2 halves | 2 halves | stack: form, then image + caption below | stack; fields 1 column; image with caption card full width |
| Partners / CTA / Footer | shared | shared | shared | shared | shared (Home mobile patterns: partners carousel with dots, stacked CTA and footer) |
Decorative images (forklift, map watermark, dot grid) are hidden below 1024. Text never overflows its container (wraps).

## 6. Acceptance criteria
Shared rule: full-page pixel difference vs the export (cropped to 1920) <= 3% at 1920.
- SV-1 Given `/en/services` at 1920 wide, When it loads, Then the HTTP status is 200, `<html lang="en">` is set and the document has exactly one `<h1>` with text `OUR SERVICES`.
- SV-2 Given `/en/services` at 1920, When the full page is screenshotted and compared to `design/exports/our-service/desktop-1920@1x.png` cropped to x 4..1923, Then the pixel difference is <= 3%.
- SV-3 Given the page at 1920, When sections are read top to bottom, Then the order is: header, hero, intro, group "Logistics Services", group "Freight Forwarding", group "Ware housing services", group "E-commerce Solutions", quote section, partners, CTA, footer.
- SV-4 Given the page, When the title and meta description are read, Then `<title>` is `Our Services | Saigon Trans` and `meta[name=description]` is non-empty and equals the CMS `seo_description`.
- SV-5 Given the intro, When rendered, Then it contains H2 `End-to-End Logistics Solutions` (two lines), the paragraph beginning `Saigontrans has authored and provided`, stats `25+ YEARS EXPERIENCE` and `200 GLOBAL PARTNERS`, and the badge `25` + `YEARS EXPERIENCE`.
- SV-6 Given the CMS fixtures, When the page renders, Then there are exactly 4 group sections, in `sort` order, each with the H2 from `section_title` (`Logistics Services`, `Freight Forwarding`, `Ware housing services`, `E-commerce Solutions`).
- SV-7 Given group 1, When rendered at 1920, Then it shows 5 cards with titles `Custom Clearance service`, `Door to Door services`, `Transport delivery services with haulage and long haul`, `Project cargo handling`, `Consolidation LTL services`; row 1 has 3 cards, row 2 has 2.
- SV-8 Given group 1 on load, When nothing is hovered, Then `Door to Door services` is the active card and its summary and `Read More` are visible; When the pointer hovers (or keyboard focuses) `Custom Clearance service`, Then that card becomes active and `Door to Door services` returns to default.
- SV-9 Given a group 1 card, When it is clicked, Then the URL becomes `/en/services/<that child's slug>` and the response is not 404.
- SV-10 Given group 2, When rendered, Then it shows the three cards `Air Freight Consolidation`, `Sea Freight (FCL & LCL)`, `Inland & Rail Transport` with their summaries, the lead text `Global reach with local intelligence...`, and a tracker of 6 steps with labels `Origin`, `Pick Up`, `Main Leg`, `Clearance`, `Sorting`, `Delivered`, kickers `Step 01`, `Step 02`, `Transit`, `Step 04`, `Step 05`, `Success`.
- SV-11 Given the tracker, When rendered, Then step 3 has the active state and step 6 the final state (exposed as `data-variant="active"` / `"final"`), and no other step has either.
- SV-12 Given group 3, When rendered, Then 4 photo cells show titles `Warehousing & packing services`, `Distribution center services`, `Personal Effect handling services`, `Container renting to store goods` each with its summary, every image has a non-empty natural width, and the link `View Facilities` is visible below the grid.
- SV-13 Given `View Facilities`, When clicked, Then the URL becomes `/en/services/warehousing`.
- SV-14 Given group 4, When rendered, Then 4 cards (`Domestic Parcel`, `Global Shipping`, `Return Management`, `API Integration`) and a box `Service Lifecycle` with items numbered 01..04 labelled `Automated Picking & Packing`, `Regional Hub Consolidation`, `Local Carrier Distribution`, `Final Consumer Delivery`; item 04 has `data-variant="final"`.
- SV-15 Given hero `Explore The Services`, When clicked, Then the URL hash becomes the first group's slug, that section is within the viewport, and the page did not navigate away from `/en/services`.
- SV-16 Given hero `Contact Us`, When clicked, Then the URL becomes `/en/contact`.
- SV-17 Given every card and link on the page, When their `href`s are collected, Then none is `#` or empty and every internal target responds with a non-404 status.
- SV-18 Given the quote section, When rendered, Then it shows title `Request a Project Quote`, the labels `FIRST NAME`, `LAST NAME`, `CORPORATE EMAIL`, `PHONE NUMBER`, `SERVICE TYPE`, `ESTIMATED VOLUME`, `PROJECT BRIEF`, and a submit button `INITIALIZE INQUIRY` (applies once Q1/Q2 are approved).
- SV-19 Given the quote form with an empty first name and an invalid email, When submitted, Then field errors show for those fields only and no lead is stored.
- SV-20 Given valid data, When submitted, Then a lead is stored with `source_page` `/en/services`, a success message appears and the success text contains no response deadline.
- SV-21 Given the honeypot field is filled, When submitted, Then nothing is stored and the visitor sees success.
- SV-22 Given the `SERVICE TYPE` select, When opened, Then its options are the published top-level service group titles plus the disabled placeholder `Select Logistics Service`.
- SV-23 Given `lib/cms` data, When a service group is set to `draft`, Then its section and its children do not appear on the page; When a child is `draft`, Then only that card is missing.
- SV-24 Given widths 1280, 1024, 768, 428 and 320, When the page loads, Then `document.documentElement.scrollWidth <= window.innerWidth`.
- SV-25 Given width 428, When group 1 is viewed, Then its cards are in a single horizontally scrollable snap container (`scroll-snap-type` x), pagination dots are visible, and activating the 2nd dot or swiping brings card 2 into view.
- SV-26 Given width 428, When groups 2 and 4 are viewed, Then their cards are also in snap carousels with dots, and group 3 cells are stacked in one column.
- SV-27 Given width 768, When group 1 is viewed, Then cards are in 2 columns.
- SV-28 Given width 1024 or less, When the header is viewed, Then nav items are replaced by a hamburger button; at 1280 the nav bar shows all six items.
- SV-29 Given the header on this page, When rendered, Then SERVICES is the active nav item (`aria-current="page"`).
- SV-30 Given keyboard-only use, When Tab is pressed from the top, Then focus reaches hero buttons, every service card, `View Facilities`, every form control, in DOM order, each with a visible focus ring.
- SV-31 Given the page source, When searched, Then no text from sections 2.1..2.7 is hard-coded outside the CMS data or the message file (checked by changing a fixture title and seeing the page change).
- SV-32 Given the network log on load, When requests are listed, Then there is no request to a third-party host.

## 7. Design anomalies and open questions
Anomalies
- A1 Export is 1928 wide: 4 px black stripes on both sides; crop to x 4..1923.
- A2 Header draws HOME as the active tab on this page; spec requires SERVICES (deviation from design, to be logged in `docs/progress.md`).
- A3 The quote form here is a different form from Home's (different fields, labels, button, hint, textarea present), though the Home design says the Home form has no message input.
- A4 Copy `respond within 4 hours` conflicts with the decided rule "no response-time promise". Do not render it until the owner decides (Q2).
- A5 All five Logistics Services cards use the same photo; the warehousing photos differ per cell. No per-service images are available for group 1, 2, 4.
- A6 Cards in groups 2-4 and the quote card use a geometric sans (looks like Plus Jakarta Sans), not Inter. External fonts are an ask-first item (Q5).
- A7 Tracker steps differ by a few px in size and baseline in the export; kickers for steps 3 and 6 replace the "Step NN" pattern.
- A8 Typos kept: `Ware housing services`, group fixture title `Freight Fowarding`, `Door to Door services` text `wherea`, `Compnay name` is on Home only. Intro stat `25+` vs badge `25`: same fact twice.
- A9 Eyebrows differ: `Services` (group 1) vs `Our Services` elsewhere; intro says `Our Services` while the H1 says `OUR SERVICES`.
- A10 Headings left-aligned in groups 2-3, centered in groups 1 and 4.
- A11 Detail page sidebar (`Related Services`) lists `Ocean Freight`, `Air Cargo`, `Customs Brokerage`, `Warehousing`: names do not match any card here.
- A12 Intro paragraph says "export / import training": wording as designed.
Open questions
- Q1 Quote form here adds `SERVICE TYPE`, `ESTIMATED VOLUME`, `PROJECT BRIEF` and renames `CORPORATE EMAIL`, and drops company, country and job title. Build as designed (new fields, ask-first rule) or reuse the Home form? Which fields are required?
- Q2 Keep or remove `respond within 4 hours`? Owner's earlier decision says no promise.
- Q3 Are intro stats `25+ YEARS EXPERIENCE` and `200 GLOBAL PARTNERS` real? Sample values until confirmed (no invented numbers).
- Q4 Where should `View Facilities` go (warehousing detail, or a facilities page that does not exist in the design)?
- Q5 Approve the geometric sans font (Plus Jakarta Sans?) as a self-hosted font, or render those blocks in Inter?
- Q6 Do all child cards (groups 2-4) get a detail page, or only some? Detail template needs from this list: `slug`, `title`, `summary`, `image`, `icon`, `parent` (to build `Related Services` as siblings or groups), `sort`; confirm which of Related Services names (A11) are real.
- Q7 Real photos for each child card and the hero/intro/quote images (export from Figma).
- Q8 Anchor behavior of hero `Explore The Services` and CTA `REQUEST A FREE QUOTE` on this page (proposed above).
- Q9 Group 1 summaries for four of five cards are not in the design; keep the placeholder or supply text.
- Q10 Is the order of groups fixed by `sort`, and may a group change its `layout` without a code change? (assumed yes, 4 layouts only)
