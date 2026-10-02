# Page spec: About Us

> Source: `design/exports/about-us/desktop-1920@1x.png` (1920x6182, Figma frame 33:2386). Mobile/tablet are DERIVED from Home mobile (`design/exports/home/mobile-428@1x.png`); the user reviews them later. y values are px in the 1920 export (measured by pixel scan, +-2 px). Text is verbatim, typos kept.
> Shared blocks are NOT re-specified: "shared: header / footer / cta / partners / quote form" = same components and data as Home (`design/reference/home.md`).

## 1. Route and purpose
- Route: `/en/about-us` (`[locale]/about-us/page.tsx`; `/vi/about-us` later, not enabled). `<html lang="en">`.
- Purpose: tell the visitor who Saigon Trans is (intro, vision/mission), prove capability (fleet/people/assets), state values, show partners, push to a quote or sales contact.
- Title proposal: `About Saigontrans | End-to-End Logistics in Vietnam`
- Meta description proposal: `Saigontrans provides end-to-end logistics solutions with over 25 years of experience. Our vision, mission, fleet and core values.` (the "25 years" claim is from the design; confirm, see Q1.)
- Exactly one `<h1>`: "ABOUT SAIGONTRANS". Title/description come from the message file or the AboutPage singleton (section 3), not hard-coded in components.

## 2. Sections top to bottom

Order (fixed): header, hero, intro, capabilities, vision/mission, core values, partners, cta, footer.

### 2.0 Header (shared: header) y 0-128 (overlays hero)
Differences from Home: none in content. Visible: white bar y 0-72 (logo + address `55 Main Street, 2nd block, Malborne, Australia`, `HOTLINE: (028) 456 564 687`, `Email needhelp@company.com`, `Booking` button), nav bar y 72-128: HOME (drawn as the ACTIVE tab, blue), PAGES, SERVICES, ABOUT, NEWS, CONTACT; social icons twitter, facebook, instagram, youtube. Anomaly A1: design marks HOME active on the About page; spec rule: ACTIVE = ABOUT (see 4 and AB-3).

### 2.1 Hero y 0-799
- Purpose: page title. Full-bleed photo (white/blue container truck on a road, blurred, dark overlay), content image, not decorative-only: `alt=""` is acceptable (decorative backdrop); it is the same truck photo family as Home hero.
- Texts: H1 `ABOUT SAIGONTRANS` (white, bold, centred, y ~230-330); subtitle `SAIGON TRANS — A logistics bridge for a prosperous Vietnam` (centred, y ~386; note spaced "SAIGON TRANS" here vs "SAIGONTRANS" in H1 and "SAIGONTRANS – A logistics bridge..." on Home, see A5); buttons y 495-558, centred pair: primary `Explore The Services` (solid blue `#3851DD`-family, white check-in-square icon at right), secondary text link `Contact Us` (white bold, circle-chevron icon).
- Interactive: both buttons. Drawn states: default only.

### 2.2 Intro ("About Saigontrans") y 800-1621, white bg
- Decoration: faint dotted world map top-right (x ~1450-1920, y ~830-1250, light grey, decoration, `aria-hidden`); faint grey forklift photo bottom-left (x 0-290, y ~1255-1621, cropped at the edge, decoration).
- Left column (x ~370-950): eyebrow `About Saigontrans` (red, italic, underlined, y ~955); H2 `End-to-End Logistics Solutions` (navy, bold, ~56 px, two lines: "End-to-End" / "Logistics Solutions", y 1000-1110); paragraph 1 `With over 25 years of experience, Saigontrans provides comprehensive End-to-End logistics solutions. Our vision is to become the admired National Champion in Vietnam's logistics industry.`; paragraph 2 `We are committed to building an integrated, future-ready ecosystem founded on safety, trust, and on-time delivery.`; buttons y 1414-1479: primary `View Services` (blue, white check-in-square icon), text link `Read More` (blue bold, no icon).
- Right column: photo x 1070-1550, y 932-1488 (480x556, portrait): red truck in front of stacked red shipping containers, aircraft in the sky. Content image (alt from CMS). Over it: white circle top-right (x ~1445-1600, y ~930-1050, decoration, overlaps photo corner and the map); small solid red circle at right edge (x ~1500-1550, y ~1295-1360, decoration); red badge x 1016-1276, y 1357-1524 (overlaps photo bottom-left): `25+` (white bold ~45 px) / `Years Of Experience` (white, small bold); inside badge a white tab top-right with `5.0` (red) and a red star icon (x ~1230-1265, y ~1357-1405).
- Interactive: `View Services`, `Read More`. Drawn states: default only.

### 2.3 Capabilities (fleet and people) y 1622-2345, bg light lavender `~#F5F6FF`
- No heading, no eyebrow. 8 cards in a 4x2 grid, white, radius ~8, soft shadow, 299 wide x 261 high, gap 24. Row 1 y 1711-1972, row 2 y 1996-2257; columns x 326-625, 649-948, 972-1271, 1295-1594.
- Each card: red outline warehouse icon (top-left, ~48 px; the SAME icon in all 8, see A6), title (navy, bold ~24 px, up to 2 lines), optional sub-line (navy, ~16 px).
- Verbatim, reading order:
  1. `Truck and trailer` / `+ 50 Set`
  2. `Container 40’HC` / `(30PCS)`
  3. `Tank Container truck` / (no sub-line)
  4. `Prime mover for port haul` / `50 Truck`
  5. `Skillful Manpower / Experience driver` / `with FC license (+50)`
  6. `Skillful mechanical engineering` / `3 persons`
  7. `Trained Vehicle operation Staff` / `03 Persons`
  8. `Trucking park in Biên Hoà Province` / (no sub-line)
- Drawn state: card 6 is drawn HOVER/active: stronger shadow + navy bottom border (~4 px, full card width). Treat as hover/focus state of any card (same convention as Home service/news cards: design-drawn hover is the default-active one; here it must NOT be default-active, see A8 and Q6). Cards are not links (no destination in the design).

### 2.4 Vision and Mission y 2346-3024
- Background: dark photo of the blue container truck (same truck as hero) under a strong navy overlay (`~#20328F`), content image-as-background (decoration, `aria-hidden`/empty alt).
- One white card, x 322-1598, y 2490-2880, radius ~6, split into 2 halves by a thin vertical divider at x ~842:
  - Left: red warehouse outline icon (~48 px), H3 `Our Vision` (navy bold ~32 px), text `To position Saigontrans Logistics as the admired National Champion in the logistics industry of Vietnam`
  - Right: same icon, H3 `Our Mission`, text `To create the most integrated and future-ready ecosystem for contract logistics, built on a foundation of trust and exceptional goodwill to those we serve.`
- Interactive: none. (Vision text has no final period; mission has one: A4.)

### 2.5 Core Values y 3025-~5303 (shared bg `~#F4F7FF` with partners below; one continuous band)
- Heading block centred: eyebrow `Services` (red, italic, underlined, y ~3128; see A3), H2 `Our Core Values` (navy bold ~56 px, y ~3170-3240).
- Cards (white, 1-2 px grey border `~#E5E5E5`, radius ~4, soft shadow, container x 322-1598). Each has an orange-red outline "box in hand" icon (~64 px), title (navy bold ~40 px, UPPERCASE), body (black ~18 px, line 32).
  - Row A (y 3255-3644): two cards, x 322-949 and 971-1598.
    - `INTERGRATED LOGISTICS`: `We provide solution for transport of our Customers' Supply Chains, provide a skill team for custom clearances. Through our expertise, service diversification, and extensive asset owner ship, we possess all the means to provide End-to-End logistic solutions.`
    - `CUSTOMER SATISFACTION`: `We listen to our customers and understand their needs. We design tailor-made solutions that suit their goals and challenges. We deliver on our promises and ensure customer satisfaction.`
  - Row B (y 3664-4010): one full-width card, icon and title `SOT` on the SAME line (icon left, title right of it), then 3 text columns (x ~365, 775, 1190):
    - col 1 (smaller ~15 px text): `Safety first, we consider safe delivery and safe driving our top priority` then, on a new line, `On time delivery`
    - col 2: `For over 25 years, on-time delivery has been the cornerstone of our logistics service. This unwavering commitment to punctuality reflects our dedication to reliability, operational excellence, and customer satisfaction.`
    - col 3: `Trust means safeguarding every shipment, honoring every deadline, navigating customs with precision, resolving challenges with expertise, and delivering excellence at every step. When trust leads the way, everyone wins.`
  - Row C (y 4030-4280): full-width card, icon and title `OPERATION EXCELLENCE` on one line, body `Planning transportation, preparing complete documentation, inspecting goods before delivery, managing and distributing efficiently, monitoring the transportation process, closely collaborating with logistics partners, and storing records and delivery reports. We utilize advanced technology and best practices to enhance operational efficiency and performance.`
  - Row D (y 4300-4657): two cards, x 322-949 and 971-1598.
    - `QUALITY` (white card): `We strive for excellence in our services and ensure quality control systems are implemented. Our certified quality management systems GSP-CCTV 24/7 compliant, Safety and delivery on time is value of services of Saigontrans`
    - `TEAMWORK` (inverted card: navy `~#0F1F8C` bg with truck/warehouse photo faintly visible at the right, white title and white body, no border, radius ~6): `We work together as one team. We respect each other and value diversity. We share knowledge and ideas. We support each other and celebrate our achievements.`
- Interactive: none drawn. TEAMWORK dark style is a content variant (`variant: highlight`), not a state (Q6).

### 2.6 Partners & Clients (shared: partners) y ~4850-5303
Eyebrow `Our Key`, H2 `Partners & Clients`, one row of 7 logos (placeholders `COMPANY TAGLINE HERE`: triangle, ring, dots, triangle, check-stripes, arrows, check-stripes), evenly spaced across x ~170-1750, logos y ~5026-5122. Difference from Home: none visible except it sits on the shared grey-blue band; on Home the same block is on white. No dots/arrows at 1920.

### 2.7 CTA band (shared: cta) y 5304-5640
`READY TO OPTIMIZE YOUR SUPPLY CHAIN?`, `Get a tailored quote for your international shipping needs today from our expert logistics consultants.`, buttons `REQUEST A FREE QUOTE ›` (red) and `CONTACT SALES` (outlined, check icon). Identical to Home.

### 2.8 Footer (shared: footer) y 5641-6182
Identical to Home (4 link columns Solutions/Company/Resource/Features, newsletter, copyright bar y 6116-6182 with facebook and linkedin circles).

NOT on this page: shared Quote form (no form in the design), stats band, services carousel, news.

## 3. Data model
Reuse: `Partner` (section 2.6, same `getPartners()`); header/footer contact data from `Office` as on Home. New (all follow `Base`, `T`, `File` from `src/lib/cms/schema.ts`):

```ts
// Singleton (Directus singleton collection `about_page`): texts and images of hero, intro, vision/mission, section headings.
export const AboutPage = Base.extend({
  hero_image: File.nullable(),            // [design] truck photo
  intro_image: File.nullable(),           // [design] red truck + containers
  vision_mission_image: File.nullable(),  // [design] dark truck background
  years_value: z.string(),                // [design] "25+"
  rating: z.string().nullable(),          // [design] "5.0" — source unknown, Q2
  translations: z.array(T({
    meta_title: z.string(),               // [proposed] section 1
    meta_description: z.string(),         // [proposed] section 1
    hero_title: z.string(),               // [design] "ABOUT SAIGONTRANS"
    hero_subtitle: z.string(),            // [design] "SAIGON TRANS — A logistics bridge for a prosperous Vietnam"
    intro_eyebrow: z.string(),            // [design] "About Saigontrans"
    intro_title: z.string(),              // [design] "End-to-End Logistics Solutions"
    intro_paragraphs: z.array(z.string()),// [design] 2 items
    years_label: z.string(),              // [design] "Years Of Experience"
    vision_title: z.string(), vision_text: z.string(),   // [design]
    mission_title: z.string(), mission_text: z.string(), // [design]
    values_eyebrow: z.string(), values_title: z.string(),// [design] "Services" / "Our Core Values" (Q3)
    partners_eyebrow: z.string(), partners_title: z.string(), // [design] shared with Home
    image_alts: z.record(z.string(), z.string()).optional(),  // [proposed]
  })),
});
// Button labels/targets (Explore The Services, Contact Us, View Services, Read More) live in messages/en.json (UI labels), targets in section 4.

export const Capability = Base.extend({   // collection `capabilities`, 8 rows
  icon: z.string().nullable(),            // [design] same warehouse icon for all (A6)
  translations: z.array(T({ title: z.string(), detail: z.string().nullable() })), // [design] section 2.3 verbatim; detail null for items 3 and 8
});

export const CoreValue = Base.extend({    // collection `core_values`, 6 rows, ordered by `sort`
  icon: z.string().nullable(),            // [design] box-in-hand
  layout: z.enum(['standard', 'wide', 'wide_columns']), // standard=half width (rows A, D), wide=full width title+body (Operation Excellence), wide_columns=title + 3 columns (SOT)
  variant: z.enum(['default', 'highlight']),             // highlight = TEAMWORK dark photo card
  background_image: File.nullable(),      // [design] only for highlight
  translations: z.array(T({
    title: z.string(),                    // [design] verbatim incl. "INTERGRATED" (A2)
    body: z.array(z.string()),            // 1 paragraph, or 3 columns for wide_columns; SOT col 1 = ["Safety first, ... top priority", "On time delivery"] kept as two lines within column 1 (Q4)
  })),
});
```
Fixture rows: all text above is [design]; `sort` order as in 2.5 (INTERGRATED LOGISTICS, CUSTOMER SATISFACTION, SOT, OPERATION EXCELLENCE, QUALITY, TEAMWORK). All uuids, dates, `status: published` are fixture-only values (not from design). `lib/cms` additions: `getAboutPage(locale)`, `getCapabilities(locale)`, `getCoreValues(locale)` with the same rules (published, sorted, en fallback, never throw). Components never read fixtures directly.

## 4. Actions
| Element | Behavior |
|---|---|
| Header logo | -> `/en` |
| Header nav | HOME `/en`; PAGES opens menu of inner pages; SERVICES `/en/services`; ABOUT `/en/about-us` (ACTIVE, `aria-current="page"`); NEWS `/en/news`; CONTACT `/en/contact` |
| Header Booking | -> quote form on Home (`/en#quote`) or Contact, per global rule (no form on this page) |
| Header socials | configured URLs, new tab, `rel="noopener"` |
| Hero `Explore The Services` | -> `/en/services` |
| Hero `Contact Us` | -> `/en/contact` |
| Intro `View Services` | -> `/en/services` |
| Intro `Read More` | -> Q5 (no target in design). Default until answered: `/en/services`? NOT assumed; builder must ask. Must not be `#`. |
| Capability cards (8), Vision, Mission, Value cards | not interactive; no link, no tab stop. Hover highlight (shadow + navy bottom border) on capability cards only (pointer devices) |
| Partners | as Home (logos, `url` link if set) |
| CTA `REQUEST A FREE QUOTE` | quote form target (as Home); `CONTACT SALES` -> `/en/contact` |
| Footer | as Home (newsletter, legal links, socials) |
No forms, tabs, accordions or carousels on desktop. Carousels appear only in derived mobile (partners, section 5). Keyboard: all links/buttons reachable by Tab in DOM order with visible focus ring; Enter activates.

## 5. Responsive behavior
Global: no horizontal page scroll from 320 up; 1920 stays within the fidelity limit; text never clipped; images keep aspect ratio. Breakpoints 428, 768, 1024, 1280, 1920; hamburger header below 1024 (shared rule).

| Section | 1920 (design) | 1280 | 1024 | 768 | 428 (and 320-427) |
|---|---|---|---|---|---|
| Hero | as design, centred | same, content width capped to viewport minus 32 px gutter | same | H1 and subtitle scale down, buttons in one row | H1 wraps to 2 lines ("ABOUT / SAIGONTRANS" ok), subtitle wraps, buttons side by side like Home mobile (primary + text link) |
| Intro | 2 columns, text left, photo right + red badge | 2 columns, scaled | 2 columns, scaled | 1 column: text then photo, photo centred, badge keeps overlapping photo bottom-left | 1 column: eyebrow, H2, paragraphs, buttons, then photo full content width; badge overlaps photo; map and forklift decoration hidden or reduced |
| Capabilities | 4x2 grid | 4x2 | 2 columns x 4 rows | 2 columns x 4 rows | 1 horizontal scroll-snap carousel (card width ~ 85% viewport, next card peeks) with pagination dots (8 dots, Home pattern); carousel scrolls inside its own container only. Alternative accepted by user later: 2-col grid. Rule here: carousel |
| Vision/Mission | one card, 2 halves with divider | same | same | same | stacked: Vision above Mission in one full-width card (horizontal divider instead of vertical), photo bg stays |
| Core values | row A 2 cols; SOT 3 text cols; Operation 1 wide; row D 2 cols | same | same | row A and D 2 cols; SOT columns stack to 1 | all cards 1 column, full width, DOM order (INTERGRATED, CUSTOMER, SOT, OPERATION, QUALITY, TEAMWORK); SOT icon+title stay on one line, 3 text blocks stacked; TEAMWORK keeps dark photo style |
| Partners | 7 logos in one row | 7 in a row | 4 per view scroll-snap carousel + dots begins at < 1024 | carousel + dots | carousel, 4 logos visible like Home mobile, pagination dots below |
| CTA / Footer / Header | shared rules (Home mobile: stacked footer, full-width buttons in CTA) | | | | |
Order of sections never changes across widths.

## 6. Acceptance criteria (Playwright)
- AB-1 Given `/en/about-us`, When loaded, Then status 200, `<html lang="en">`, `document.title` equals the proposed/CMS title, a meta description is present, and exactly one `h1` has text `ABOUT SAIGONTRANS`.
- AB-2 Given viewport 1920, When the page renders, Then section landmarks appear in this order: header, hero, intro, capabilities, vision/mission, core values, partners, CTA, footer (compare DOM/vertical order of their headings: `ABOUT SAIGONTRANS`, `End-to-End Logistics Solutions`, `Our Vision`, `Our Core Values`, `Partners & Clients`, `READY TO OPTIMIZE YOUR SUPPLY CHAIN?`).
- AB-3 Given the page, When I read the header nav, Then the ABOUT item has `aria-current="page"` and no other item does.
- AB-4 Given the hero, When I click `Explore The Services`, Then URL is `/en/services`; When I click `Contact Us` (from `/en/about-us`), Then URL is `/en/contact`.
- AB-5 Given the intro, Then it shows eyebrow `About Saigontrans`, H2 `End-to-End Logistics Solutions`, both paragraphs verbatim, badge text `25+`, `Years Of Experience` and `5.0`.
- AB-6 Given the intro, When I click `View Services`, Then URL is `/en/services`; `Read More` has a non-empty `href` that is not `#` (target per Q5).
- AB-7 Given the capabilities section, Then exactly 8 cards exist with the 8 titles in section 2.3 order and the sub-lines `+ 50 Set`, `(30PCS)`, `50 Truck`, `with FC license (+50)`, `3 persons`, `03 Persons`; cards 3 and 8 have no sub-line.
- AB-8 Given viewport >= 1280, Then the capability cards form 4 columns x 2 rows (4 distinct x positions in row 1, 2 distinct y positions overall).
- AB-9 Given the vision/mission card, Then `Our Vision` and `Our Mission` with their verbatim texts are visible; at >= 768 they sit side by side, at 428 Vision is above Mission.
- AB-10 Given the core values, Then 6 cards exist with titles `INTERGRATED LOGISTICS`, `CUSTOMER SATISFACTION`, `SOT`, `OPERATION EXCELLENCE`, `QUALITY`, `TEAMWORK` in that order, each with its verbatim body, and the heading `Our Core Values` with eyebrow `Services`.
- AB-11 Given viewport 1920, Then INTERGRATED and CUSTOMER share one row (same top), SOT, OPERATION EXCELLENCE each span the full card container width, QUALITY and TEAMWORK share one row; at 428 all six are stacked in a single column.
- AB-12 Given the TEAMWORK card, Then its computed background is dark (luminance < 0.2) and its title is white; QUALITY card background is white.
- AB-13 Given the partners block, Then eyebrow `Our Key`, H2 `Partners & Clients` and 7 logos are present at 1920; at 428 the logos are in a horizontal scroll-snap container with pagination dots and the page has no horizontal scroll.
- AB-14 Given viewport 428, Then the capabilities are a horizontal scroll-snap carousel (scroll container `scrollWidth > clientWidth`), 8 pagination dots exist, swiping/scrolling changes the active dot, and `document.documentElement.scrollWidth <= innerWidth`.
- AB-15 Given each width in 1920, 1280, 1024, 768, 428, 320, When the page loads, Then `document.documentElement.scrollWidth <= window.innerWidth`.
- AB-16 Given width < 1024, Then the header shows the hamburger and the header meets the shared menu rules (open, Esc closes, focus trapped).
- AB-17 Given the CTA, When I click `REQUEST A FREE QUOTE`, Then focus/scroll reaches the quote form target; `CONTACT SALES` goes to `/en/contact`.
- AB-18 Given keyboard only, When I press Tab from the top, Then focus visits header items, `Explore The Services`, `Contact Us`, `View Services`, `Read More`, partner links (if any), CTA buttons, footer links in DOM order, each with a visible focus ring, and no capability/value/vision card is a tab stop.
- AB-19 Given hover on a capability card at 1920, Then it shows a navy bottom border and larger shadow; no card shows that state before hover.
- AB-20 Given the page source, Then no text from sections 2.1-2.6 is hard-coded in components (texts equal fixture values via `lib/cms`; a fixture edit changes the rendered text) and no link has `href="#"`.
- AB-21 Given a record without `vi` translation or with `status != published`, When the page renders, Then it falls back to `en` / is not shown, without error.
- AB-22 Given viewport 1920, Then full-page pixel difference vs `design/exports/about-us/desktop-1920@1x.png` (cropped to 1920 wide and 6182 high) is <= 3%.

## 7. Design anomalies and open questions
Anomalies (kept verbatim unless the owner fixes Figma):
- A1 Header marks HOME active on the About page; spec overrides to ABOUT (a deliberate deviation, log in `docs/progress.md`). Header address still `Malborne, Australia` (as Home).
- A2 Typos: `INTERGRATED LOGISTICS`; `asset owner ship`; `provide solution`; `a skill team`; `custom clearances`; `End-to-End logistic solutions`; `Skillful`; `Trained Vehicle operation Staff` (random capitals); `03 Persons` vs `3 persons`; `+ 50 Set` (space, plus); `Container 40’HC` with curly apostrophe; `(30PCS)` has no noun; `Tank Container truck`.
- A3 Eyebrow above `Our Core Values` is `Services` (copy of Home's services eyebrow; likely should be "Our Values"/"Core Values").
- A4 Vision text ends without a period, Mission with one. Section 2.5 `QUALITY` text has no final period, `GSP-CCTV` likely means GSP (Good Storage Practice) + CCTV; "certified" claim is unverified (guardrail: no invented certifications).
- A5 Hero subtitle `SAIGON TRANS — ...` (spaced, em dash) differs from Home `SAIGONTRANS – ...` and from the H1 `SAIGONTRANS`.
- A6 All 8 capability cards and both Vision/Mission cards use the same warehouse icon (placeholder-like); core values use box-in-hand icon in all 6.
- A7 SOT is not expanded anywhere; column 1 is smaller text than columns 2-3 and its second line `On time delivery` is not a sentence (looks like a truncated copy: Safety / On time / Trust).
- A8 Card 6 in Capabilities is drawn in hover state (as Home service/news cards drawn in hover); TEAMWORK card is dark (variant, not state).
- A9 Export file is 1920x6182; `design/exports/README.md` lists it as `1928x?` — update the README.
- A10 Mobile/tablet for this page do not exist in Figma.
Open questions (do not invent answers):
- Q1 Are "over 25 years of experience" / `25+` correct and publishable?
- Q2 What is the `5.0` star rating (source, what is rated)? Remove if no source.
- Q3 Correct eyebrow for Core Values (design says `Services`).
- Q4 Should SOT column 1 keep its two lines as designed?
- Q5 Target of intro `Read More` (no page exists; candidates: `/en/services` or a section anchor).
- Q6 Is the TEAMWORK dark card permanent styling (assumed) or a hover state? Should capability card hover also apply on focus (assumed no, cards are not focusable)?
- Q7 Are the 8 capability figures (`+ 50 Set`, `30PCS`, `50 Truck`, `+50`, `3 persons`, `03 Persons`) real? They are fixture values from the design; owner confirms before launch.
- Q8 Mobile capabilities as carousel (derived from Home) vs 2-col grid.
- Q9 Real photos: hero, intro, vision/mission backgrounds must be re-exported from Figma (export is flattened; text is baked into hero/vision backgrounds, as on Home, inpaint needed).
