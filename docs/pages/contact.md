# Contact page: specification

Source design: `design/exports/contact/desktop-1920@1x.png` (export 1928x5845). Home mobile patterns: `design/exports/home/mobile-428@1x.png`. Slices used while writing: `design/reference/_work/spec-contact-00..08.png` (1920x700 each, 700 px apart).
Conventions: **[D]** = value read from the design. **[P]** = proposal, needs user OK. **[OQ n]** = open question (section 7). y values are export pixels (1920 frame). x values are export x. The frame sits at export x 4..1923 (4 px black strip on the left, 4 px on the right, see A1), so frame x = export x - 4.
"Shared" blocks (header, footer, CTA band, Partners & Clients, the quote-form engine, Lead pipeline) are specified on Home (`design/reference/home.md`, `docs/requirements.md` S3, `docs/architecture.md`) and are not repeated here.

## 1. Route and purpose

- Route: `/en/contact` (static, rendered through `[locale]/contact/page.tsx`). `/` still redirects to `/en`. `<html lang="en">`.
- Purpose: let a visitor find the right office, phone, email and person, see working hours, and send a project quote request (a Lead).
- `<title>` [P]: `Contact Us | Saigon Trans`.
- Meta description [P] (uses only facts shown in the design): `Contact Saigon Trans: office addresses in Ho Chi Minh City, business and customs hours, key logistics contacts and a project quote request form.`
- Both strings live in the `ContactPage` singleton (section 3), not in the component.
- Exactly one `<h1>`: "CONTACT US".

## 2. Sections, top to bottom

Page order: header, hero, offices + map, hours band, Key Logistics Contacts (org chart), Operation Key Persons, Request a Project Quote, Partners & Clients, CTA band, footer.
Landmark ids the build must expose (tests use them): `#contact-hero`, `#offices`, `#hours`, `#leadership`, `#operations`, `#project-quote`, `#partners`, `#cta`. Each section is a `<section aria-labelledby=...>` whose heading carries the visible heading text.

### 2.0 Header (y 0-128), shared: header
Visible texts [D]: "55 Main Street, 2nd block, Malborne, Australia", "HOTLINE:", "(028) 456 564 687", "Email", "needhelp@company.com", "Booking", nav HOME / PAGES / SERVICES / ABOUT / NEWS / CONTACT, 4 social icons (twitter, facebook, instagram, youtube). Same content as Home.
Differences from Home:
- The header container is x 352-1576 (1224 wide); on Home it is x 314-1605 (1292). The white bar is 72 high and the nav bar 56 high as on Home.
- The active (filled) tab is **HOME** in the design. This is a design error; build marks **CONTACT** active (`aria-current="page"`) as required by the "Actions (M2b)" list. Recorded in section 7.
- Header overlays the hero image (hero starts at y 0), not a plain white strip.

### 2.1 Hero (y 0-838; visible part y 128-838)
- Purpose: page title.
- Background image: a heavily blurred photo of a white truck with a blue container (left), tree/utility pole background, covered by a dark navy overlay (about 55 % dark). 1920x838 crop, full bleed, decoration (`alt=""`). The container carries a faint blurred text/logo (design artifact of the blur, not content). Image is a CMS file id on `ContactPage.hero_image`. The export only has the blurred version [OQ 9].
- Texts [D]: H1 "CONTACT US" (white, bold, about 75 px, centered, y about 270-335); subtitle "We are here to support your logistics needs" (white, regular, about 31 px, centered, y about 405).
- Buttons (same component as Home hero buttons, y 514-578):
  - Primary "Explore The Services" with a white square icon holding a red check mark at the right (x 763-1034, filled `#3851DD`-like blue). Links to `/en/services`.
  - Secondary text button "Contact Us" with a white circled chevron icon at the right (x 1055-1165). Links to `#project-quote` on this page [P, since the Home target `/en/contact` is the current page; OQ 8].
- States: hover/focus-visible/active as the shared hero buttons.

### 2.2 Offices + map (y 838-1388, white band)
Background: white; a faint dotted world map (light grey dots) at the right, x about 1440-1920, y about 1150-1560, decoration, `aria-hidden`, partly behind the map card.
Left column x 324-932:
- H2 "SAIGONTRANSERVICE" (navy `#2F439B`, bold about 40 px, y about 978).
- Entry 1: red-outlined/navy pin icon; label "MAIN OFFICE" (uppercase, letter-spaced, bold, small); address "45 Dinh Tien Hoang Street, Saigon Ward, Ho Chi Minh City".
- Entry 2: navy building icon; label "OPERATION OFFICE"; address "19 To Huu, Lakeview 1, An Khanh Ward, HCMC".
- Info card x 324-932, y 1188-1312: pale lavender `#F3F2FB`-like background, 8 px navy left border. Two columns:
  - Left: label "LICENSE/TAX" (grey caps), value "4102001961/GP-HCM", second line "VAT: 0302070998".
  - Right: label "DIRECT CONNECT" (grey caps), phone "(84) 028 38233 068" (navy, link), email "linhpham@saigontrans.com.vn" (dark, link).
Right column: map card x 996-1604, y 956-1356 (608x400):
- Image: static map picture (Google-style street map around Dinh Tien Hoang, red pin at "Toà Nhà Cmard 2", labels in Vietnamese, partly cropped). Content image of the location; give it `alt` "Map showing the Saigon Trans main office, Ho Chi Minh City" [P].
- Overlay chip top right (white, 8 px radius, shadow, x 1418-1588, y 972-1020): crosshair icon + "ACTIVE HUB: HCMC" (navy, caps, bold).
- Interactive: the whole card is a single `<button>` ("click to load the real map"). Default state = static image. After click = an iframe replaces the image (section 4). No third-party request before the click.
- States: hover = cursor pointer plus a visible hint overlay "Click to load map" [P, text not in design, OQ 6]; focus-visible ring.

### 2.3 Hours band (y 1388-1681)
- Full-width container x 324-1604 (1280), height 293, solid deep blue `#0227A8`-like (`#0228A9`).
- Decoration: large grey forklift photo at far left, x 0-280, y 1436-1799, washed grey, overlapping the band's left edge area and the white area below it; decoration, `alt=""`. It sits behind the band.
- Card 1 (x 372-600): red briefcase icon + "Business Hours" (white, semibold about 24 px); caption "Mon-Fri" (light grey-blue small); value "08:00 - 18:00" (white, bold about 32 px).
- Card 2 (x 698-930): red clipboard-check icon + "Customs Hours"; "Mon-Fri"; "07:30 - 17:00".
- Vertical divider line at x 1025, y 1436-1632 (thin, dark blue).
- Notice (x 1073-1500):
  - eyebrow "NOTICE" (red, caps, small, letter-spaced);
  - bold "Custom working hours:"
  - bold lead "Normally effective time for clearance formalities:" then normal line "Monday – Friday: 07:30 hour – 17:00hour"
  - bold lead "Customs offers on-duty" followed by normal "during week-end and holidays available up to pre-arrangement and depending on a" (the sentence ends here in the design, unfinished; see section 7).
- Decoration: translucent large clock icon (circle outline, hands) at top right of the notice, x 1466-1572, y 1420-1527; `aria-hidden`.
- No interactive elements.

### 2.4 Key Logistics Contacts (grey `#F8F8F8`, y 1799-2935)
- Eyebrow "Our Leadership" (red, italic, bold, underlined, centered, y about 1910).
- H2 "Key Logistics Contacts" (navy bold about 56 px, centered, y about 1974).
- Org chart. Cards are white with a soft shadow, centered text, no photos. Each card: role (small caps, grey-bold) / name (bold about 24 px, near black) / email link (blue `#0A2BC0`-like, with a small envelope icon only on the top card) / "Ext: NNN" (grey; phone icon only on the top card).
- Top card (General Director): x 782-1146 (364 wide), y 2084-2307; 4 px **red** top border; role "GENERAL DIRECTOR" (wraps to two lines "GENERAL" / "DIRECTOR"); name "Linh Pham"; envelope icon + "linhpham@saigontrans.com.vn"; phone icon + "Ext: 101".
- Connector: vertical line from the top card bottom (x 964, y 2307-2340), horizontal line y 2340 from x 468 to x 1460, four short vertical drops (x 468, 799, 1130, 1461) to the row-1 cards. Lines 2 px, light grey-blue `#C9CCE0`-like. Decoration.
- Row 1 (y 2376-2573), 4 cards, each 286 wide at x 325, 656, 987, 1318 (gap 45), 4 px **blue** top border, no icons:
  1. "CHIEF ACCOUNTANT" / "Tieu Dieu" / "tieudieu@saigontrans.com.vn" / "Ext: 302"
  2. "VICE DIRECTOR" / "Khoa Pham" / "khoapham@saigontrans.co..." (truncated by ellipsis in the design) / "Ext: 102"
  3. "IMPORT MANAGER" / "Trang Anh" / "tranganh@saigontrans.com.vn" / "Ext: 201"
  4. "IMPORT CHEMICAL" / "Nhu Quynh" / "quynhnhu@saigontrans.com..." (truncated) / "Ext: 205"
- Row 2 (y 2608-2806), 2 cards, same size, **no connector lines**, at the columns 1 and 3:
  - column 1 (x 325): "CONTROL DEBIT NOTE" / "Huong Nguyen" / "huongnguyen@saigontrans...." (truncated) / "Ext: 301"
  - column 3 (x 987): "EXPORT MANAGER" / "Truc Long" / "truclong@saigontrans.com.vn" / "Ext: 202"
- Interactive: email = `mailto:` link. "Ext: NNN" is plain text (no `tel:`, an extension alone is not dialable; see OQ 4). Cards themselves are not links and have no hover effect in the design [P: none].
- Visible states: truncated emails use CSS single-line ellipsis; the full address is in `href` and in `title`.

### 2.5 Operation Key Persons (white, y 2935-3506)
- H2 "Operation Key Persons" (navy bold about 56 px, **left aligned** at x 349, y about 2998; unlike the centered heading above).
- Two lavender panels (`#EEEBF7`-like), each with an 8 px blue left border, side by side: left x 348-948, right x 980-1580, both y 3178-3378 (600x200). Inside each panel a 2-column grid; each cell: group label (small grey caps) then entries (bold name, grey person line).
  - Left panel, column 1: label "AIRPORT TERMINALS"; "TCS Airport" / "Pham Trung Nghia"; "SCSC Airport" / "Le Van Hoang".
  - Left panel, column 2: label "SEA & LAND"; "Cat Lai Terminal" / "Ho Vu Khuong / Vo Dien Kim".
  - Right panel, column 1: label "WAREHOUSING"; "Bonded Warehouse TBS" / "Nguyen Van Ty".
  - Right panel, column 2: label "ECONOMIC ZONES"; "Tan Thuan EPZ" / "Doan Cong Danh".
- No icons, no links, no interaction. Persons have no phone or email in the design.

### 2.6 Request a Project Quote (y 3506-4407)
- Band background: full-bleed photo of trees, blue promo flags with partner names and trucks, covered with a strong blue overlay `#0F2A9B`-like; top edge at y 3506 (straight), bottom edge at y 4407 with a small shadow. Decoration (`alt=""`), CMS file `ContactPage.quote_bg`. Export-only artifacts: faint text in flags is part of the photo.
- Card x 348-1580 (1232 wide), y 3602-4310 (708 high), two halves.
- Left half (white, x 348-964, padding 49): form.
  - H2 "Request a Project Quote" (navy bold about 26 px, y about 3670).
  - Intro "Our architects will analyze your requirements and respond within 4 hours." (dark grey 15 px). Conflicts with a Decided item, see OQ 1.
  - Fields (underline style: no box, 1 px grey bottom border, label above in tiny grey caps, bold, letter-spaced). Two columns x 397-643 and x 668-915, row pitch 92:
    | Row | Left (label / placeholder) | Right (label / placeholder) |
    |---|---|---|
    | 1 (label y 3764) | "FIRST NAME" / "Enter first name" | "LAST NAME" / "Enter last name" |
    | 2 (y 3856) | "CORPORATE EMAIL" / "name@company.com" | "PHONE NUMBER" / "+1 (555) 000-0000" |
    | 3 (y 3948) | "SERVICE TYPE" / select showing "Select Logistics Service" (darker than placeholders) with a chevron-down at its right end | "ESTIMATED VOLUME" / "e.g. 50 containers/month" |
    | 4 (y 4040), full width x 397-915 | "PROJECT BRIEF" / multi-line field, placeholder "Describe your logistics challenges...", bottom border at y 4140 | |
  - Submit button x 397-915, y 4188-4245, blue gradient `#0F2BB0` to `#2F43C9`, soft blue drop shadow, centered label "INITIALIZE INQUIRY" (white, caps, letter-spaced, bold 13 px). No icon.
  - No asterisks, no honeypot visible, no consent text, no privacy line in the design.
- Right half (x 964-1580, y 3602-4310, 616x708): photo of a white truck with a blue container in front of a sky (content image of the fleet, `alt` from CMS), with a dark-blue gradient at the left/top. Overlay card (x 1012-1532, y 4113-4262, 520x149; frosted white 85 %, no radius): title "Kinetic Efficiency" (bold about 26 px) and text "Leveraging Vietnam's strategic position with precision logistics and real-time manifest tracking." (grey 15 px). CMS: `ContactPage.quote_photo`, texts in translations.
- Visible states: only the default state is drawn. Required states (not in design, derived from the Home form): field focus (blue bottom border), invalid (red border and message under field), submitting (button disabled, "label unchanged"), success (form replaced by a success message), error.

### 2.7 Partners & Clients (y 4407-4942), shared: partners
- Same eyebrow "Our Key", H2 "Partners & Clients", 7 logos in one row (same 7 logos as Home, y 4690-4785).
- Difference: background is **white** `#FFFFFF`; on Home it is grey `#F5F5F5`. Eyebrow at y 4542, H2 at y 4605. No "Latest News" section follows it; the CTA band comes next.

### 2.8 CTA band (y 4942-5304), shared: cta
Same content ("READY TO OPTIMIZE YOUR SUPPLY CHAIN?", "REQUEST A FREE QUOTE", "CONTACT SALES"). Differences: none visible. Behavior on this page: "REQUEST A FREE QUOTE" scrolls to `#project-quote` (the Contact form); "CONTACT SALES" points to `/en/contact` on Home, which here is the same page, so it also scrolls to `#project-quote` [P; OQ 8].

### 2.9 Footer (y 5304-5845), shared: footer
Same as Home (logo, about text, 4 link columns, newsletter, copyright bar "©Copyright 2025 STS All Rights Reserved", facebook and linkedin circles). No visible difference. Footer starts at y 5304 right under the CTA (CTA y 4942-5304, footer 5304-5779, bar 5779-5845).

## 3. Data model

Text that editors change goes through `lib/cms`; static UI strings (form labels, placeholders, button texts, validation and status messages, aria labels) go in `src/lib/i18n/messages/en.json` under `contact.*`. No literal in components. All collections follow the existing `Base` and `T()` helpers.

Reuse: `Partner` and `Partners & Clients` (shared), `Service` (to populate the Service type select), `Lead` and `LeadInput` (extended, see 3.5).

### 3.1 `ContactPage` (singleton, one published record per page)
```ts
const ContactPage = Base.extend({
  hero_image: File.nullable(),        // blurred truck [D image]
  quote_bg: File.nullable(),          // blue-tinted background of 2.6
  quote_photo: File.nullable(),       // truck photo right half of the form card
  map_image: File.nullable(),         // static map of 2.2
  map_embed_url: z.url().nullable(),  // real map, loaded only after click; value unknown, OQ 6
  map_open_url: z.url().nullable(),   // optional "open in maps" target, OQ 6
  forklift_image: File.nullable(),    // decoration 2.3
  translations: z.array(T({
    seo_title: z.string(),            // [P] "Contact Us | Saigon Trans"
    seo_description: z.string(),      // [P]
    hero_title: z.string(),           // [D] "CONTACT US"
    hero_subtitle: z.string(),        // [D] "We are here to support your logistics needs"
    map_chip: z.string(),             // [D] "ACTIVE HUB: HCMC"
    map_alt: z.string(),              // [P]
    leadership_eyebrow: z.string(),   // [D] "Our Leadership"
    leadership_title: z.string(),     // [D] "Key Logistics Contacts"
    operations_title: z.string(),     // [D] "Operation Key Persons"
    quote_title: z.string(),          // [D] "Request a Project Quote"
    quote_intro: z.string(),          // [D] "Our architects will analyze your requirements and respond within 4 hours." (OQ 1)
    quote_photo_title: z.string(),    // [D] "Kinetic Efficiency"
    quote_photo_text: z.string(),     // [D] "Leveraging Vietnam's strategic position with precision logistics and real-time manifest tracking."
    quote_photo_alt: z.string(),      // [P]
    notice_label: z.string(),         // [D] "NOTICE"
    notice_title: z.string(),         // [D] "Custom working hours:"
    notice_blocks: z.array(z.object({ lead: z.string(), text: z.string() })), // [D] see below
  })),
});
```
`notice_blocks` fixture [D]: `{lead:"Normally effective time for clearance formalities:", text:"Monday – Friday: 07:30 hour – 17:00hour"}`, `{lead:"Customs offers on-duty", text:"during week-end and holidays available up to pre-arrangement and depending on a"}` (verbatim, typos kept; OQ 3).

### 3.2 Company profile (singleton `CompanyProfile`, also a candidate to feed the shared header/footer contact data, which `docs/progress.md` lists as Directus-readiness work)
```ts
const CompanyProfile = Base.extend({
  legal_name: z.string(),            // [D] "SAIGONTRANSERVICE"
  license_tax: z.string(),           // [D] "4102001961/GP-HCM"
  vat: z.string(),                   // [D] "0302070998" (rendered "VAT: 0302070998")
  phone: z.string(),                 // [D] "(84) 028 38233 068"
  email: z.email(),                  // [D] "linhpham@saigontrans.com.vn"
});
```
Labels "LICENSE/TAX", "DIRECT CONNECT", "VAT:" are messages.

### 3.3 Offices: reuse `Office` with one optional extension
Existing: `phone`, `email`, `translations[{name,address,role}]`. Fit:
- fixture 1 [D]: `name:"Main Office"` (rendered uppercase as "MAIN OFFICE"), `address:"45 Dinh Tien Hoang Street, Saigon Ward, Ho Chi Minh City"`, `role:null`, `phone:null`, `email:null`, sort 1.
- fixture 2 [D]: `name:"Operation Office"`, `address:"19 To Huu, Lakeview 1, An Khanh Ward, HCMC"`, sort 2.
- Needed: the pin vs building icon. [P] add `icon: z.string().nullable().optional()` to `Office` (values `pin`, `building`). Without it, the build may map by `sort` (1 = pin, 2 = building); ask the user before touching the shared contract.
- Phone and email per office are not in the design; they stay null. The "DIRECT CONNECT" phone and email belong to `CompanyProfile`, not to an office.
`getOffices(locale)` already exists.

### 3.4 `OpeningHours` (new collection, 2 records)
```ts
const OpeningHours = Base.extend({
  icon: z.string().nullable(),        // 'briefcase' | 'clipboard-check'
  time_range: z.string(),             // [D] "08:00 - 18:00", "07:30 - 17:00"
  translations: z.array(T({ title: z.string(), days: z.string() })),
});
```
Fixtures [D]: `{title:"Business Hours", days:"Mon-Fri", time_range:"08:00 - 18:00", icon:"briefcase", sort:1}`, `{title:"Customs Hours", days:"Mon-Fri", time_range:"07:30 - 17:00", icon:"clipboard-check", sort:2}`. Time zone and holidays: unknown (OQ 5), nothing is invented.

### 3.5 `ContactPerson` (new collection, org-chart nodes, 7 records)
```ts
const ContactPerson = Base.extend({
  level: z.number().int().min(0).max(2),      // 0 = top card, 1 = connected row, 2 = unconnected row (design)
  column: z.number().int().min(1).max(4).nullable(), // grid column at >= 1024, null for level 0
  full_name: z.string(),                      // proper noun, not translated
  email: z.email().nullable(),
  extension: z.string().nullable(),           // "101" (rendered "Ext: 101")
  translations: z.array(T({ role: z.string() })),
});
```
Fixtures (order = `sort`; name, role, email, ext, level, column) [D unless noted]:
1. Linh Pham, "General Director", linhpham@saigontrans.com.vn, 101, level 0
2. Tieu Dieu, "Chief Accountant", tieudieu@saigontrans.com.vn, 302, level 1, col 1
3. Khoa Pham, "Vice Director", khoapham@saigontrans.com.vn **[P: design shows "khoapham@saigontrans.co..."; domain completed by the pattern of the other 5; OQ 2]**, 102, level 1, col 2
4. Trang Anh, "Import Manager", tranganh@saigontrans.com.vn, 201, level 1, col 3
5. Nhu Quynh, "Import Chemical", quynhnhu@saigontrans.com.vn **[P, truncated in design; OQ 2]**, 205, level 1, col 4
6. Huong Nguyen, "Control Debit Note", huongnguyen@saigontrans.com.vn **[P, truncated; OQ 2]**, 301, level 2, col 1
7. Truc Long, "Export Manager", truclong@saigontrans.com.vn, 202, level 2, col 3
Roles are stored in sentence case ("General Director") and uppercased by CSS. The extension numbers are shown as plain text. Who the level-2 people report to is not shown (OQ 7); hence `level` + `column`, not a `parent` field.
`getContactPersons(locale)`: published, sorted by `sort`.

### 3.6 `OperationGroup` and `OperationPoint` (new collections)
```ts
const OperationGroup = Base.extend({
  panel: z.number().int().min(1).max(2),   // 1 = left panel, 2 = right panel
  translations: z.array(T({ label: z.string() })),
});
const OperationPoint = Base.extend({
  group: z.uuid(),                         // OperationGroup.id
  location: z.string(),                    // proper noun, not translated
  persons: z.array(z.string()).min(1),     // rendered joined with " / "
});
```
Fixtures [D] (group label; panel; sort) : "AIRPORT TERMINALS"(1,1) ; "SEA & LAND"(1,2) ; "WAREHOUSING"(2,1) ; "ECONOMIC ZONES"(2,2). Labels stored as "Airport Terminals" etc. and uppercased by CSS [P]; exact stored case is free as long as the rendered text is uppercase.
Points [D]: AIRPORT TERMINALS: {TCS Airport, [Pham Trung Nghia]}, {SCSC Airport, [Le Van Hoang]}; SEA & LAND: {Cat Lai Terminal, [Ho Vu Khuong, Vo Dien Kim]}; WAREHOUSING: {Bonded Warehouse TBS, [Nguyen Van Ty]}; ECONOMIC ZONES: {Tan Thuan EPZ, [Doan Cong Danh]}.
`getOperationGroups(locale)` returns groups with their points nested, sorted by `sort`.

### 3.7 Lead mapping for this form
Existing `LeadInput`: first_name, last_name, company?, email, phone, country?, job_title?, message?, locale, website (honeypot).
| Design field | LeadInput field | Note |
|---|---|---|
| FIRST NAME | `first_name` | required |
| LAST NAME | `last_name` | required |
| CORPORATE EMAIL | `email` | required; the label says "corporate" but any valid email is accepted [P] |
| PHONE NUMBER | `phone` | required; same regex as Home |
| PROJECT BRIEF | `message` | existing optional field (max 4000). Home never renders it; this form does |
| SERVICE TYPE | **missing** | [P] add `service_type: z.string().trim().max(120).optional()`; value = `Service.slug`; the select options come from `getServices(locale)` (OQ 10) |
| ESTIMATED VOLUME | **missing** | [P] add `estimated_volume: z.string().trim().max(120).optional()`; free text |
| (not in this form) company, country, job_title | existing, optional | not rendered; stay undefined |
| honeypot | `website` | hidden, must be empty |
| locale | `locale` | `en` |
`Lead` (stored) gets the same two optional fields. `Lead.source_page` must be `/en/contact` for submissions from this page. [P] The action is bound per page (for example `submitQuote.bind(null, '/en/contact')`) and the server writes `source_page`; it is not taken from a client-supplied hidden field. The Home form keeps its own value. Adding fields and changing the shared contract needs user approval (guardrail), and the two new fields need contract tests.
Required set: first_name, last_name, email, phone [P, as Home]. Service type, estimated volume and project brief are optional [P]; the design has no asterisks.

## 4. Actions

| # | Element | Behavior |
|---|---|---|
| A1 | Header, footer, CTA, partners | as shared (Home). Header CONTACT item is active here. |
| A2 | Hero "Explore The Services" | navigates to `/en/services` |
| A3 | Hero "Contact Us" | in-page jump to `#project-quote`, moves focus to the form's first field (`first_name`), smooth scroll unless `prefers-reduced-motion` |
| A4 | Office addresses | plain text (no link) |
| A5 | "DIRECT CONNECT" phone | `<a href="tel:+842838233068">` [P, rule: strip spaces and parentheses, drop the national "0" after the country code 84, so "(84) 028 38233 068" gives `+842838233068`]; visible text stays "(84) 028 38233 068" |
| A6 | "DIRECT CONNECT" email | `<a href="mailto:linhpham@saigontrans.com.vn">` |
| A7 | Map card | one `<button type="button">`. Before click: only the static `map_image` is requested; no request to any map host (assert via network log). On click (or Enter/Space): the image is replaced by an `<iframe src=map_embed_url title="Map of the Saigon Trans main office" loading="lazy">`, the chip stays, the button disappears, focus moves to the iframe. Cannot be undone on that page view. If `map_embed_url` is null the card is a non-interactive static image. |
| A8 | Org-chart email | `<a href="mailto:<email>">`; visible text may be ellipsized, `href` and `title` carry the full address |
| A9 | "Ext: NNN" | plain text, not a link |
| A10 | Operation Key Persons | no interaction |
| A11 | Project quote form | fields in 2.6. Submit "INITIALIZE INQUIRY" calls the shared `submitQuote` action with `source_page=/en/contact`. Order: honeypot (filled: silent success, nothing stored, no email) -> validate -> rate limit (6th accepted-and-valid attempt from one IP in 10 minutes rejected, error under key `form`) -> `createLead` (stored first) -> `notify` (failure still success, `email_status=failed`) -> response. |
| A11a | Validation | invalid or empty required field: per-field message under that field only (`role="alert"` or `aria-describedby`, field gets `aria-invalid="true"`), focus moves to the first invalid field, nothing stored. Messages are `contact.*` message keys, English. |
| A11b | Submitting | button `disabled` and `aria-busy="true"` until the action returns; double click sends once |
| A11c | Success | form is replaced by a success block (`role="status"`, focus moved to it) with a message that states no response deadline; the form values are cleared; the block has no button to resubmit except a link/button "Send another request" [P] |
| A11d | Error (server error or rate limit) | form stays with the typed values, an error block (`role="alert"`) above the button, focus on it; the visitor can retry |
| A12 | Select | native `<select name="service_type">` (keyboard operable). First option is the placeholder "Select Logistics Service" with empty value (selected by default); then one option per published Service (label = service title). |
| A13 | CTA "REQUEST A FREE QUOTE" / "CONTACT SALES" | both scroll to `#project-quote` on this page [P, OQ 8] |
| A14 | Keyboard | tab order follows DOM order: header, hero buttons, map button, tel, mailto, org-chart emails, form fields, submit, shared blocks. Every interactive element shows a visible focus ring. |

## 5. Responsive behavior

Global rules: container max width 1280 px with side padding 24 px (>= 768) and 16 px (< 768). No horizontal page scroll from 320 to 1920 (`document.documentElement.scrollWidth <= window.innerWidth`). Decorations (dotted world map, forklift, clock) never create overflow (clipped inside their section, `overflow: clip`). Home mobile patterns: stacked footer, hamburger header with language selector, full-width cards, horizontal scroll-snap carousel with pagination dots for partners (shared).

| Section | 1920 (design) | 1280 | 1024 | 768 | 428 (and down to 320) |
|---|---|---|---|---|---|
| Header | as design | shared | shared (hamburger below 1024) | hamburger | hamburger + language selector like Home mobile |
| Hero | design | 75 px title scales fluidly (clamp), buttons in a row | same | same, title 56 px | title about 40 px, subtitle about 18 px, buttons keep the Home mobile arrangement (row, wrap if narrow); image `object-fit: cover` centered |
| Offices + map | 2 columns (text 608 / map 608), gap 64 | same, columns 50/50 | same 50/50, map height 360 | single column: text first, map below full width, height 360 | single column; map full width, height about 264; address text wraps; the info card keeps 2 columns down to 360, stacks to 1 column below 360 (license first, then direct connect) |
| Hours band | 3 blocks in a row (hours, hours, notice with divider) | same | hours blocks left (2 columns), notice moves under them full width with a top divider instead of the vertical one | same as 1024 | all stacked in one column; horizontal divider; the clock watermark shrinks to about 64 px |
| Key Logistics Contacts (org chart) | tree: top card, connector lines, 4 columns | same | 4 columns, cards fluid (email ellipsized) | 2 columns; connector lines removed; top card full width above; order as design reading order | **list**: one column, top card first (red top border kept), then the other six in reading order; no connector lines; cards full width; emails ellipsized, tap target >= 44 px high |
| Operation Key Persons | 2 panels side by side, 2 columns inside each | same | same, panels narrower | panels stacked, 2 columns inside each | panels stacked, groups stacked in 1 column inside each panel; H2 left aligned |
| Project quote | card 2 halves (form 616 / photo 616); band bg photo | same, fluid | same 50/50; fields stay 2 columns | card stacked: form on top, photo below (height 360, overlay card kept inside photo) | form card full width (like the Home mobile quote card); fields 2 columns while width >= 400, else 1 column; **photo and its overlay card are hidden** (decoration, same as Home mobile where the form has no photo); the band background stays |
| Partners & Clients | 7 logos in a row | same | same | 4 per row | shared carousel with dots (as Home mobile) |
| CTA band, footer | shared | shared | shared | shared | shared (stacked footer like Home mobile) |

At 428 the order of sections is unchanged. All text remains in the DOM at every width except the hidden photo overlay at < 768 (OQ 11).

## 6. Acceptance criteria

Test helpers: `@/lib/cms/testing` (`listLeads`, `resetLeads`, `setMailTransport`). Viewport widths: 1920, 1280, 1024, 768, 428, 320. Selectors: section ids from section 2; form fields by `name`.

CT-1 Given the dev/test server, When I GET `/en/contact`, Then status is 200, `<html lang="en">`, `document.title` equals "Contact Us | Saigon Trans", and a `<meta name="description">` is non-empty.
CT-2 Given `/en/contact`, When I count `h1`, Then exactly one exists and its text is "CONTACT US".
CT-3 Given `/en/contact` at 1920, When I read the section ids in DOM order, Then they are `#contact-hero, #offices, #hours, #leadership, #operations, #project-quote, #partners, #cta`, followed by the footer.
CT-4 Given `/en/contact`, When I look at the primary nav, Then the CONTACT item has `aria-current="page"` and HOME does not.
CT-5 Given the hero, When I read it, Then it contains the texts "CONTACT US" and "We are here to support your logistics needs", and the links "Explore The Services" (href `/en/services`) and "Contact Us" (href `#project-quote`).
CT-6 Given the hero, When I click "Contact Us", Then the URL hash is `#project-quote` and focus is on the `first_name` input.
CT-7 Given `#offices`, When I read it, Then it contains the headings/texts "SAIGONTRANSERVICE", "MAIN OFFICE", "45 Dinh Tien Hoang Street, Saigon Ward, Ho Chi Minh City", "OPERATION OFFICE", "19 To Huu, Lakeview 1, An Khanh Ward, HCMC", "LICENSE/TAX", "4102001961/GP-HCM", "VAT: 0302070998", "DIRECT CONNECT".
CT-8 Given `#offices`, When I read the DIRECT CONNECT links, Then there is an `a[href^="tel:"]` whose text is "(84) 028 38233 068" and an `a[href="mailto:linhpham@saigontrans.com.vn"]`.
CT-9 Given a fresh load, When I record network requests before any click, Then none go to a host other than the page origin (no map provider, no tracker), and the map card shows an `<img>` with non-empty `alt` and the text "ACTIVE HUB: HCMC".
CT-10 Given a fresh load, When I click the map button, Then an `iframe` appears inside `#offices` with `src` equal to the CMS `map_embed_url`, the `img` is gone, and no iframe existed before the click. (Skipped, with a stated reason, if `map_embed_url` is null in the fixture.)
CT-11 Given the map button, When I focus it with Tab and press Enter, Then the iframe loads as in CT-10.
CT-12 Given `#hours`, When I read it, Then it contains "Business Hours", "Customs Hours", two "Mon-Fri", "08:00 - 18:00", "07:30 - 17:00", "NOTICE", "Custom working hours:", "Normally effective time for clearance formalities:", "Monday – Friday: 07:30 hour – 17:00hour", "Customs offers on-duty".
CT-13 Given `#leadership`, When I read it, Then it shows "Our Leadership", "Key Logistics Contacts", and exactly 7 person cards.
CT-14 Given `#leadership`, When I read the 7 cards in DOM order, Then names are: Linh Pham, Tieu Dieu, Khoa Pham, Trang Anh, Nhu Quynh, Huong Nguyen, Truc Long, with roles uppercase-rendered "GENERAL DIRECTOR", "CHIEF ACCOUNTANT", "VICE DIRECTOR", "IMPORT MANAGER", "IMPORT CHEMICAL", "CONTROL DEBIT NOTE", "EXPORT MANAGER", and "Ext: 101", "Ext: 302", "Ext: 102", "Ext: 201", "Ext: 205", "Ext: 301", "Ext: 202".
CT-15 Given `#leadership`, When I read the email links, Then there are 7 `a[href^="mailto:"]`, each `href` is a full address ending `@saigontrans.com.vn` that equals its `title`, and the General Director link is `mailto:linhpham@saigontrans.com.vn`.
CT-16 Given `#leadership` at 1920, When I read card boxes, Then the General Director card is horizontally centered on the viewport (+-2 px), the 4 level-1 cards share one top, Huong Nguyen sits under the first column and Truc Long under the third (their left edges equal those of Tieu Dieu and Trang Anh respectively, +-2 px), and the cards of the second row have a top greater than the first row bottom.
CT-17 Given `#leadership` at 1920, When I query elements with `data-testid="org-connector"`, Then at least one exists and none has its bottom edge below the top of the first row of level-1 cards (no connector reaches the second row).
CT-18 Given `#leadership` at 428, When I read card boxes, Then all 7 cards have the same left edge and width (+-2 px), are vertically stacked in DOM order, and no `org-connector` element is visible.
CT-19 Given `#leadership` at 768, When I read card boxes, Then level-1 and level-2 cards form exactly 2 columns.
CT-20 Given `#operations`, When I read it, Then it contains the heading "Operation Key Persons", the 4 labels "AIRPORT TERMINALS", "SEA & LAND", "WAREHOUSING", "ECONOMIC ZONES", and the pairs: "TCS Airport"/"Pham Trung Nghia", "SCSC Airport"/"Le Van Hoang", "Cat Lai Terminal"/"Ho Vu Khuong / Vo Dien Kim", "Bonded Warehouse TBS"/"Nguyen Van Ty", "Tan Thuan EPZ"/"Doan Cong Danh".
CT-21 Given `#operations` at 1920, When I read panel boxes, Then there are 2 panels side by side (same top, different left); at 768 and 428 they are stacked (same left, different top).
CT-22 Given `#project-quote`, When I read it, Then it contains "Request a Project Quote", "Our architects will analyze your requirements and respond within 4 hours.", "Kinetic Efficiency", "Leveraging Vietnam's strategic position with precision logistics and real-time manifest tracking." and a button "INITIALIZE INQUIRY" (the last two texts are not required at 428, see CT-37).
CT-23 Given the form, When I list controls in DOM order, Then they are `first_name`, `last_name`, `email`, `phone`, `service_type` (select), `estimated_volume`, `message` (textarea), plus one hidden honeypot `website`; labels (case-insensitive) are "First name", "Last name", "Corporate email", "Phone number", "Service type", "Estimated volume", "Project brief"; placeholders are "Enter first name", "Enter last name", "name@company.com", "+1 (555) 000-0000", "e.g. 50 containers/month", "Describe your logistics challenges...".
CT-24 Given the form, When I read `service_type`, Then its first option reads "Select Logistics Service" with empty value, followed by one option per published Service from `lib/cms`, in `sort` order.
CT-25 Given the form has no extra fields, When I count visible inputs/selects/textareas, Then exactly 7 (no company, country, job title, checkbox).
CT-26 Given valid data in first_name, last_name, email, phone only, When I submit, Then a success block with `role="status"` is shown, the form is gone or cleared, `listLeads()` has exactly one new lead with `source_page === "/en/contact"`, `locale === "en"`, `email_status` in `pending|sent`, and the values typed.
CT-27 Given all fields filled including service_type (a service slug), estimated_volume "50 containers/month" and message "Test brief", When I submit, Then the stored lead contains `service_type`, `estimated_volume` and `message` with those values.
CT-28 Given an empty form, When I submit, Then errors appear for first_name, last_name, email and phone only, each field has `aria-invalid="true"`, the other 3 fields have no error, focus is on `first_name`, and `listLeads()` is unchanged.
CT-29 Given email `not-an-email`, When I submit with other fields valid, Then only the email error shows and nothing is stored.
CT-30 Given the honeypot `website` filled by script, When I submit valid data, Then the UI shows success, `listLeads()` is unchanged and the mail transport is not called.
CT-31 Given 5 valid submissions from one client within 10 minutes, When the 6th valid one is sent, Then it is rejected with an error block (`role="alert"`) and no lead is stored for it; invalid submissions did not count toward the limit.
CT-32 Given the mail transport throws, When I submit valid data, Then the success block is shown, the lead is stored with `email_status === "failed"`.
CT-33 Given a submit in flight, When I double-click "INITIALIZE INQUIRY", Then exactly one lead is stored and the button is disabled until completion.
CT-34 Given the success block text, When I read it, Then it contains no number of hours or days and no word "within".
CT-35 Given a submit from `/en` (Home form), When I read the lead, Then `source_page` is not `/en/contact` (the Contact binding does not leak to Home).
CT-36 Given `#partners`, When I read it at 1920, Then it shows "Our Key", "Partners & Clients", the same 7 logos as Home, and the computed background colour is rgb(255, 255, 255).
CT-37 Given `#project-quote` at 428, When I read it, Then the form card spans the container width (+-2 px), the truck photo and its overlay are not visible (`display: none`), and the form stays fully operable (CT-26 passes).
CT-38 Given `#hours` at 428, When I read boxes, Then the two hour blocks and the notice are stacked (same left edge).
CT-39 Given any of widths 1920, 1280, 1024, 768, 428, 320, When the page is loaded and scrolled to the bottom, Then `document.documentElement.scrollWidth <= window.innerWidth`.
CT-40 Given width 428, When I read the header, Then the hamburger button is visible and the language selector is present (as Home mobile).
CT-41 Given the keyboard only, When I press Tab from the top, Then focus reaches in order: nav, hero buttons, map button, tel link, mailto link, the 7 org-chart emails, the 7 form controls, the submit button; each focused element has a visible focus indicator (outline width > 0 or box-shadow not `none`).
CT-42 Given the repo, When I grep the contact page components, Then no text literal from sections 2-3 (for example "Key Logistics Contacts", "Linh Pham") appears in `src/components` or `src/app` files; they come from `lib/cms` or the messages file.
CT-43 Given the CMS interface, When I call `getContactPersons('en')`, `getOperationGroups('en')`, `getOpeningHours('en')`, `getContactPage('en')`, `getCompanyProfile('en')` and `getOffices('en')`, Then each result passes its Zod contract in `schema.ts`, contains only `status = published` and resolves translations with English fallback (`vi` request returns the same strings).
CT-44 Given `/en/contact` at 1920, When I take a full-page screenshot (after cropping the design export to the 1920 frame, x 4..1923) and diff it against `design/exports/contact/desktop-1920@1x.png`, Then the pixel difference is <= 3% (shared fidelity rule). The known intended deviations (active nav item, section 7 item 1) are listed in `docs/progress.md` and do not raise the threshold.

## 7. Design anomalies and open questions

Anomalies in the design (recorded, the build follows the stated resolution):
1. Header active tab is HOME on the Contact frame. Resolution: CONTACT is active (requirement "active item reflects the current page"). Log as a deviation.
2. Header container is 1224 wide (x 352-1576); Home's is 1292. The sections below use 1280 (x 324-1604) and the quote card 1232 (x 348-1580); three different widths. Resolution: header per its Home component; contact sections as measured.
3. The export is 1928 wide with a 4 px black strip at each side; the 1920 frame is x 4..1923. Crop before diffing.
4. Typos kept: "Malborne", "17:00hour", "07:30 hour – 17:00hour", "SAIGONTRANSERVICE" as heading, the notice sentence "and depending on a" that is cut off. Typos from Home ("Compnay name", etc.) do not appear here.
5. Three emails are truncated with "..." in the design, so full values are unknown (OQ 2).
6. "Corporate email" label vs the Lead `email` that accepts any address.
7. The page heading level pattern differs: "Key Logistics Contacts" is centered with an eyebrow, "Operation Key Persons" is left aligned without an eyebrow. Kept as designed.
8. Form uses underline-style inputs and a different label style than the Home quote form (boxed inputs). Kept as designed; the shared validation engine is reused, not the Home markup.
9. The top card has a red top border; the other cards blue. Kept (hierarchy cue).
10. Partners band is white here, grey on Home.

Open questions (do not invent; ask the user):
- **OQ 1** The form intro says "respond within 4 hours", while `requirements.md` has "[Decided] No response-time promise". The user's decision outranks the Figma. Default for the build: keep the text as design (it is a CMS/message string, so removing it is a one-line change), and log it; the user decides before launch.
- **OQ 2** Full email addresses for Khoa Pham, Nhu Quynh, Huong Nguyen. The fixture uses `@saigontrans.com.vn` by the pattern of the others; confirm.
- **OQ 3** What follows "depending on a" in the Customs notice (probably "case-by-case basis"); and whether "17:00hour" should be cleaned. Default: verbatim.
- **OQ 4** Should "Ext: NNN" be a link, and is a switchboard number for the extensions shown elsewhere? Default: plain text.
- **OQ 5** Time zone, holiday closures and whether Mon-Fri is shown in a different label for Vietnamese. Default: nothing added.
- **OQ 6** Real map: which provider (OpenStreetMap or Google), the embed URL and the coordinates of 45 Dinh Tien Hoang Street; also the licence of using a Google-style screenshot as the static image (the design image looks like a Google Maps capture; prefer an own render or an OSM-based image). Hover hint text "Click to load map" is not in the design: approve or drop.
- **OQ 7** Who do Huong Nguyen and Truc Long report to (no connector in the design)? Default: neutral `level 2`.
- **OQ 8** The hero "Contact Us" and the CTA "CONTACT SALES" point to `/en/contact`, which is this page. Default: scroll to `#project-quote`.
- **OQ 9** Original hero, forklift, flags/background and truck photos are not available (the export has them blurred, tinted or cropped). Needed from Figma, otherwise the build cuts them from the export (as on Home, see `design/reference/home.md`).
- **OQ 10** Option list for SERVICE TYPE: default is the published `Service` records (titles from `getServices`). Is an "Other" option wanted? The select has no option list in the design.
- **OQ 11** Hiding the "Kinetic Efficiency" photo and card below 768: accept, or show the photo under the form?
- **OQ 12** Approve adding `service_type` and `estimated_volume` to `LeadInput` and `Lead`, and the optional `icon` on `Office` (guardrail: "adding form fields"). Without approval, those two fields cannot be stored and CT-27 cannot pass.
- **OQ 13** Privacy: this form has no consent text; same open point as `requirements.md` Open question 1.
