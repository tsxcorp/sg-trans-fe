# Page spec: News (article list)

Source: `design/exports/news/desktop-1920@1x.png` (1920 x 5107). Mobile/tablet derived from `design/exports/home/mobile-428@1x.png`. Sibling spec: News Article (`design/exports/news-article/`). All y values are px in the 1920 export; x values are export px. Colors were sampled from the export.
Shared (not re-specified here): header, footer, CTA band "Ready to optimize your supply chain", quote form, Partners & Clients (NOT present on this page), copyright bar. Spec for those lives in `design/reference/home.md` / the Home page.

## 1. Route and purpose

- Route: `/en/news` (`/` -> `/en`; `/vi/news` deferred). Static page; query string drives filter/search/page (section 4).
- Purpose: browse all news articles; entry to article pages `/en/news/<slug>`.
- `<title>`: `News & Insights | Saigon Trans`. Meta description proposal: `Logistics industry news and insights from Saigon Trans: market outlooks, network updates, global supply analysis and sustainability.` (proposal, needs OK; both strings come from the message file, not components). `<html lang="en">`, canonical = `/en/news` (with `?page=N` for N>1; `q`, `category`, `tag` views: `<meta name="robots" content="noindex,follow">`).
- The export is a stack of 2 hero blocks (see anomaly A1). It is reproduced as drawn.

Page order (top to bottom), export bands: header+hero 1 (0-495) / white list area (496-2347) / hero 2 (2348-2843) / white "Industry Insights" + banners (2844-4239) / CTA (4240-4567) / footer (4568-5039) / copyright bar (5040-5106).

## 2. Sections

### 2.0 Shared: header (0-~145)
As Home header (white bar: logo, address, HOTLINE, Email, Booking; nav bar: HOME PAGES SERVICES ABOUT NEWS CONTACT, 4 social icons). Difference: the export draws HOME as the active tab (copied from Home). On this page the active tab MUST be NEWS (requirements: "active item reflects the current page"); this is a deliberate deviation, recorded in A2. The header sits over hero 1 (hero image starts at y=0, nav bar overlaps it).

### 2.1 Hero 1 (0-495)
- Purpose: page banner (drawn with the article-detail banner).
- Background: dark blue (#0F2E82 at left edge) photo of stacked shipping boxes/port, blue-tinted, full-bleed 1920x495, decoration (same image family as the Home hero; reuse the hero image asset used by Home/news-article). `alt=""`.
- Title (centered, white, bold, uppercase, 2 lines, ~58 px, y~245-345): `IMPLEMENTING AI-DRIVEN PREDICTIVE ROUTING FOR TRANS-PACIFIC CORRIDORS`. Data-bound: the title of the featured article (`is_featured`), uppercased by CSS, not hard-coded. If no featured article exists hero 1 is not rendered (header then sits over hero 2? see A1; default: render hero 2 only with header over it).
- Breadcrumb (y~370, ~14 px, white 85%, letter-spaced, uppercase, bullets between): `HOME` • `NEWS` • `NEWS DETAIL`. HOME -> `/en`, NEWS -> `/en/news`, NEWS DETAIL is plain text (current). Bullet separators are decoration.
- Heading semantics: the hero 1 title is NOT a heading element (it duplicates the featured card title); the only `h1` is in hero 2.

### 2.2 Main column + sidebar (496-2347), container x 320-1600 (1280 wide), top padding 100 (content starts y=596)
Two columns: main x 320-1088 (768), gap 128, sidebar x 1216-1600 (384).

#### 2.2.1 Featured article card (main, y 596-1195, +divider at 1235)
- Cover image: x 320-1088, y 596-925 (768x329, object-fit cover). Shows a grayscale cartoon man in white shirt and tie on dark grey radial background. Content image (article cover), `alt` = article title.
- Category badge overlaid top-left of the image: x 320-440, y 596-628, bg `#790008`, white bold uppercase 12 px tracked text: `INNOVATION`.
- Meta line (y~957): `MAY 15, 2024` (bold, uppercase, #444654, 13 px) + 40 px grey horizontal rule + `INSIGHTS` (bold uppercase, #444654). Date is the article date; `INSIGHTS` has no data source (A3).
- Title (y~1000-1060): `Implementing AI-Driven Predictive Routing for Trans-Pacific Corridors` bold ~36/40 px, `#1A1B23`, 2 lines, links to the article.
- Excerpt (y 1085-1145, 3 lines, 17/26 px, #444654): `Saigontrans announces the full integration of artificial intelligence across its Pacific shipping routes, aiming to reduce transit times by up to 18% while optimizing fuel consumption for a greener fleet. This landmark shift represents a new era in precision logistics management.`
- Link: `READ FULL ARTICLE` + right arrow icon, bold uppercase 13 px tracked, `#0224A6`, y~1178.
- Divider: 1 px `#E7E5EE`, x 320-1088, y 1235.
- Interactive: cover, title and the link all go to `/en/news/<slug>`; one focus stop (title link) with the cover/link marked `tabindex=-1 aria-hidden`, OR the link text alone is the stop: pick one accessible link per card (title). Hover: title -> `#0224A6`, arrow shifts 4 px. Focus-visible ring on the link.

#### 2.2.2 Article rows (main, 3 rows, y 1284-2148)
Each row: thumbnail left x 320-565 (245x245 square, cover crop), text right x 597-1088 (width 491). Row pitch 310 (gap 65 between 245 thumbs). Row text block (top-aligned to thumbnail):
1. Category label: bold uppercase 12 px `#790008`, tight tracking (red-dark text, no badge).
2. Title: bold 26/30 px `#1A1B23`, max 2 lines.
3. Date: `Month D, YYYY` 13 px `#444654`.
4. Excerpt: 15/23 px `#444654`, 2 lines.
5. Link `CONTINUE` + small chevron, bold uppercase 13 px `#0224A6`.

Rows, verbatim:
| # | y | Thumbnail (content image) | Category | Title | Date | Excerpt |
|---|---|---|---|---|---|---|
| 1 | 1284-1529 | dark navy network of glowing nodes, text "NETWORK" in thumb (baked in image) | `NETWORK EXPANSION` | `Opening Our New Strategic Hub in Singapore` | `April 28, 2024` | `The new 50,000 sq ft facility will serve as our primary gateway for ASEAN distributions, featuring state-of-the-art cold storage capabilities.` |
| 2 | 1594-1839 | cyan glowing globe on dark teal | `GLOBAL SUPPLY` | `Quarterly Market Outlook: Navigating Supply Volatility` | `April 12, 2024` | `Our analysts dive into current market trends affecting global freight rates and providing strategic advice for H2 2024 planning.` |
| 3 | 1904-2148 | white cat-shaped lock icon on black radial | `INNOVATION` | `Blockchain for Transparent Bill of Lading` | `March 30, 2024` | `Reducing paperwork and increasing security through our new distributed ledger pilot program for international shipments.` |
Interactive: thumbnail, title, CONTINUE -> `/en/news/<slug>`. Hover: title `#0224A6`, thumbnail slight zoom (scale 1.03, overflow hidden), chevron nudges. Category label is a link to `?category=<slug>` (only if it matches a category; otherwise plain text; A4). No row is drawn in a hover/active state.

#### 2.2.3 Pagination (y~2256, main column)
Row spanning x 320-1088: left `PREVIOUS` with left arrow icon (x 320-420); center numbers `01` `02` `03` `...` `08` (x 643-800; `01` is current: bold `#0224A6`; others regular `#444654` 16 px; `...` is non-interactive); right `NEXT` with right arrow (x 1023-1088). Labels bold uppercase 12 px tracked `#444654`. Two-digit zero padding of numbers (01..08). The design shows 8 pages (A5). White area ends at 2347 (bottom padding ~90).
States: current page `aria-current="page"`; PREVIOUS disabled on page 1 and NEXT disabled on last page: `aria-disabled="true"`, not links, opacity 40% (the design shows both at full strength on page 1: deviation recorded in A6); hover on page numbers/prev/next -> `#0224A6`.

#### 2.2.4 Sidebar: Search Insights panel (y 596-752)
Panel x 1216-1600, bg `#EEEDF7`, padding 32. Header row: `SEARCH INSIGHTS` (bold uppercase 12 px tracked, `#1A1B23`) + 32 px blue (`#6B7FD7`-ish light blue) rule at right (decoration). White input box x 1248-1568, y 668-720 (52 high): placeholder `Search articles...` (grey 15 px) and a blue (`#0224A6`) magnifier icon at right (button, type submit, `aria-label="Search"`). Focus: 2 px `#0224A6` ring. Rendered as `<form role="search" method="get" action="/en/news">`.

#### 2.2.5 Sidebar: Categories (y 807-1060)
Header: `CATEGORIES` + 32 px blue rule at right (y 807). Four rows, pitch 57 (y 864, 921, 978, 1035), each with 1 px bottom border `#E7E5EE` (row spans full 384): name left 15 px `#1A1B23` and count chip right (bg `#EEEDF7`, bold 12 px `#444654`, min-width 32, height 24, 2-digit zero-padded):
`Global Supply` 12 / `Innovation` 08 / `Network Updates` 24 / `Sustainability` 05.
Rows are links to `/en/news?category=<slug>`. Hover: name `#0224A6`. Active (current filter): name bold `#0224A6`, chip bg `#0224A6` text white, `aria-current="true"` (new state, not in design).

#### 2.2.6 Sidebar: White paper card (y 1108-1441)
Card x 1216-1600 (384x333), bg `#0224A6` with subtle darker gradient to bottom-right (to ~`#1A1F8E`), no radius. Content (padding 32): document icon (outline file with lines, light blue `#8FA0E8`, 32 px, y~1140); title `Annual Logistics White Paper 2024` bold white 26/30 px, wraps as 3 lines in the design: `Annual Logistics` / `White` / `Paper 2024` (the line break after "White" is a design artifact, reproduce with natural wrap at width ~190 px or `<br>`s; A7); description `Download our comprehensive 60-page report on the future of multi-modal freight technology.` (15/23 px, `#B9C4F5`); white button x 1248-1568, y 1357-1405 (48 high, no radius): `DOWNLOAD PDF` bold uppercase 12 px `#0224A6` + download icon. Button: see Actions 4.9 (no PDF is provided, A8).

#### 2.2.7 Sidebar: Trending Tags (y 1497-1601)
Header `TRENDING TAGS` + 32 px dark/navy rule at right (colour `#0224A6` hairline... drawn dark, not light-blue like the other two headers; A9). Chips (bg `#EEEDF7`, height 32, padding 16, bold 12 px uppercase `#444654`, gap 8), flow-wrapped: row 1 `FREIGHT` `BLOCKCHAIN` `ASIA-PACIFIC` (y 1530-1562), row 2 `GREEN-LOGISTICS` `WAREHOUSING` (y 1570-1602). Each chip is a link to `/en/news?tag=<slug>`. Hover: bg `#0224A6`, text white. Active tag: same as hover, `aria-current="true"`.
The sidebar is `position: sticky`: no (design static; do not add).

### 2.3 Hero 2 (2348-2843)
- Background: shipping containers (blue and purple-grey stacks) under cloudy dusk sky, left side blue-purple gradient overlay, full-bleed 1920x495, decoration, `alt=""`. Different image from hero 1. Contains partial crane/person elements at the bottom-left (baked in).
- `h1` (centered, white, bold uppercase ~58 px, y~2880): `NEWS & INSIGHTS`.
- Breadcrumb (y~2943): `HOME` • `NEWS`. HOME -> `/en`, NEWS plain text (current page).
- No header over this hero (header only at top).

### 2.4 Industry Insights (2844-3300 headings, cards to 3680; banners to 4083; white to 4239)
Container x 320-1600, section top padding ~130.
- Eyebrow (y~2978): `Latest Briefings` red `#DE2627`, italic semi-bold ~22 px, underlined (same eyebrow style as Home).
- `h2` (y~3040, left): `Industry Insights` bold ~56 px navy `#2F439B`.
- Red rule at right: x 1472-1600, y 3057, 2 px `#A4000F` (decoration).
- Card row (y 3122-3680): 3 cards, x 320-733 / 754-1166 / 1187-1600 (413 wide, gap 20), border 1 px `#E5E5E5`, bg white, padding 16, height 558 (equal). Same component as Home news cards (cover 382x277, radius 6; title 22/34 px bold navy, 3 lines; meta row: user icon (red circle outline) + author, comment-bubble icon (red) + `Comments (03)` in light grey; `Read More` + chevron). Card 1 is drawn in hover state (shadow, `Read More` red `#CD2727`); cards 2-3 default (`Read More` grey). Default-active card 1 as on Home.
Cards (verbatim):
1. cover: anniversary stage photo with red star backdrop and "SAIGONTRANSERVICES 20th ANNIVERSARY On time delivery with trust" | title `Vietnam’s Logistics Industry: From Traditional Supply Chains to a Full-Scale Digital Shift` | `Quang Ng` | `Comments (03)` | `Read More`
2. cover: group photo of staff in white shirts in a gold-ceiling hall | `Vietnam Logistics at the Turning Point: Great Opportunities Amid Growing Pressures` | `KD Duong` | `Comments (03)` | `Read More`
3. cover: group photo of staff in cyan shirts outdoors | `Talent Shortage: The Biggest Bottleneck in Vietnam’s Logistics Growth` | `Henry Tran` | `Comments (03)` | `Read More`
These 3 = the 3 newest published articles (`getLatestNews(locale, 3)`), identical data to Home. Card and `Read More` -> `/en/news/<slug>`. Shown on every view of the page (not affected by q/category/tag/page).

### 2.5 Promo banners (3728-4083)
Two blocks, height 355, x 320-944 (624) and 976-1600 (624), gap 32, no radius.
- Left (bg `#0224A6`; faint lighter blue building/skyline glyph shape clipped at top right, decoration): eyebrow `ANNUAL REPORT` (bold 11 px, tracking 0.3em, white 85%, y~3785); title `2025 FINANCIAL PERFORMANCE HIGHLIGHTS` (3 lines, white bold uppercase ~34/36 px); text `Exceptional growth metrics and strategic roadmap for the coming fiscal year.` (15/21 px, `#8091D2`); link `VIEW REPORT` (white bold uppercase 12 px, 2 px white underline).
- Right (bg `#111A23`; grey `#3F4650` rounded-corner tilted device/truck-rear shape clipped bottom right, decoration): eyebrow `WHITE PAPER` (same style, tinted pink/red-white), title `THE FUTURE OF AUTONOMOUS TRUCKING` (3 lines, white), text `Download our latest technical analysis on autonomous freight integration in urban environments.` (15/20 px grey `#9AA0A8`, 3 lines), link `DOWNLOAD PDF` (white bold uppercase 12 px with 2 px red `#DE2627` underline).
Interactive: the 2 links (Actions 4.10). Text blocks sit at slightly different y in the two banners (left eyebrow y~3785, right ~3775): reproduce as drawn.

### 2.6 Shared: CTA band (4240-4567), footer (4568-5039), copyright bar (5040-5106)
As Home (`READY TO OPTIMIZE YOUR SUPPLY CHAIN?` ... top radius 64, REQUEST A FREE QUOTE / CONTACT SALES). Identical to Home; no differences. Partners & Clients is not on this page. The quote form is not on this page ("Booking" and "Request a free quote" go to the quote form on Home or Contact per requirements).

## 3. Data model

### 3.1 Existing `News` (src/lib/cms/schema.ts) extended
```ts
export const NewsCategory = Base.extend({
  slug: z.string(),
  in_sidebar: z.boolean(),            // listed in the Categories widget
  translations: z.array(T({ name: z.string() })),
});

export const NewsTag = Base.extend({
  slug: z.string(),
  trending: z.boolean(),              // listed in Trending Tags
  translations: z.array(T({ name: z.string() })),
});

// News gets (additive, all optional so existing fixtures stay valid):
//   category: z.uuid().nullable().optional()        // -> NewsCategory.id
//   tags: z.array(z.uuid()).default([])             // -> NewsTag.id[] (Directus M2M flattened)
//   is_featured: z.boolean().default(false)
//   label: nothing (see A3)
// existing: slug, cover, published_at, author, comments_count, translations{title,excerpt,body}

export const Resource = Base.extend({   // promo cards: sidebar white paper + 2 banners
  slot: z.enum(['sidebar', 'banner_left', 'banner_right']),
  file: File.nullable(),                // PDF; null = not available yet
  translations: z.array(T({
    eyebrow: z.string().nullable(),     // "ANNUAL REPORT" / "WHITE PAPER" / null for sidebar
    title: z.string(), description: z.string(), cta_label: z.string(),
  })),
});
export type NewsCategoryT, NewsTagT, ResourceT = z.infer<...>;
```
No read-time field: not shown anywhere in the list or in the news-article design.

`lib/cms` additions (components never import fixtures):
- `getNewsPage(locale, { page, pageSize, q, category, tag }) -> { items: Resolved<News & {categoryName, categorySlug}>[], total, page, pageCount, featured: ... | null }`.
- `getNewsCategories(locale) -> (NewsCategory & { count })[]` (only `in_sidebar`, sorted by `sort`; count = published articles in it, computed, not stored).
- `getNewsTags(locale) -> NewsTag[]` (only `trending`).
- `getResources(locale) -> Resolved<Resource>[]`.
- `getFeaturedNews(locale)`, `getLatestNews(locale, 3)` (exists).
Selection rules: published only; sort `is_featured` desc is NOT applied to rows: order by `published_at` desc. Default view (no q/category/tag) EXCLUDES the 3 articles returned by `getLatestNews(locale,3)` (they are the Industry Insights teaser) so that page 1 = design; when q, category or tag is set the search covers ALL published articles. pageSize = 4 (page 1 default view: featured card + 3 rows; every other page and every filtered view: 4 rows, no featured card, no hero-1 change). Featured = newest `is_featured` article among the default-view set; if none, page 1 shows rows only.
Search: case- and diacritic-insensitive substring over translated `title` + `excerpt` (body is not searched). Dates rendered `en-US` `Month D, YYYY` in `Asia/Ho_Chi_Minh`; featured meta uppercased by CSS.
Comments count zero-padded 2 digits (`Comments (03)`), count 100+ prints as is.

### 3.2 Values taken from the design (fixtures)
Categories (sidebar): Global Supply 12, Innovation 08, Network Updates 24, Sustainability 05 (design counts are static drawings; real counts are computed, A5). Extra category seen on a row: Network Expansion (`in_sidebar:false`). Slugs proposed: `global-supply`, `innovation`, `network-updates`, `sustainability`, `network-expansion`.
Tags (trending): FREIGHT, BLOCKCHAIN, ASIA-PACIFIC, GREEN-LOGISTICS, WAREHOUSING (slugs `freight`, `blockchain`, `asia-pacific`, `green-logistics`, `warehousing`; names stored as typed, shown uppercase by CSS). Article-detail tags (FUTURE TECH, SUPPLY CHAIN, GREEN LOGISTICS, SUSTAINABILITY) belong to that page's spec; `green-logistics` is the only overlap candidate.
New articles seen in the list (4; slugs are PROPOSED, authors/comments/tags unknown = `null`/`[]`):
| slug (proposed) | published_at | category | featured | title | excerpt |
|---|---|---|---|---|---|
| `implementing-ai-driven-predictive-routing` | 2024-05-15 | Innovation | yes | `Implementing AI-Driven Predictive Routing for Trans-Pacific Corridors` | `Saigontrans announces the full integration of artificial intelligence across its Pacific shipping routes, aiming to reduce transit times by up to 18% while optimizing fuel consumption for a greener fleet. This landmark shift represents a new era in precision logistics management.` |
| `opening-new-strategic-hub-singapore` | 2024-04-28 | Network Expansion | no | `Opening Our New Strategic Hub in Singapore` | `The new 50,000 sq ft facility will serve as our primary gateway for ASEAN distributions, featuring state-of-the-art cold storage capabilities.` |
| `quarterly-market-outlook-supply-volatility` | 2024-04-12 | Global Supply | no | `Quarterly Market Outlook: Navigating Supply Volatility` | `Our analysts dive into current market trends affecting global freight rates and providing strategic advice for H2 2024 planning.` |
| `blockchain-transparent-bill-of-lading` | 2024-03-30 | Innovation | no | `Blockchain for Transparent Bill of Lading` | `Reducing paperwork and increasing security through our new distributed ledger pilot program for international shipments.` |
Times of day (08:00Z) are sample values like the existing fixtures. Covers: 4 new `files.json` entries cut from the export (featured 768x329 grey cartoon; 3 square thumbs 245x245), replace by originals later.
Existing 3 articles (`news.json`, Industry Insights): `Vietnam’s Logistics Industry: From Traditional Supply Chains to a Full-Scale Digital Shift` (Quang Ng, 3 comments, 2025-09-12), `Vietnam Logistics at the Turning Point: Great Opportunities Amid Growing Pressures` (KD Duong, 3, 2025-09-05), `Talent Shortage: The Biggest Bottleneck in Vietnam’s Logistics Growth` (Henry Tran, 3, 2025-08-28). Their dates/comments are existing sample values; the design shows no dates for them. They have no category or tags.
Resources (3): sidebar `Annual Logistics White Paper 2024` / description / `DOWNLOAD PDF`; banner_left eyebrow `ANNUAL REPORT`, title `2025 FINANCIAL PERFORMANCE HIGHLIGHTS`, `VIEW REPORT`; banner_right eyebrow `WHITE PAPER`, title `THE FUTURE OF AUTONOMOUS TRUCKING`, `DOWNLOAD PDF`; texts as in 2.5/2.2.6, `file: null`.
Fixture count to reproduce the design: 7 articles (4 new + the 3 existing), 5 categories, 5 tags, 3 resources. This yields 1 archive page (4 items), so pagination renders only `01` (A5). Recommended for pagination tests (needs user OK, they are invented content): +6 clearly marked sample articles dated before 2024-03-30 (page 2 = 2 items; pages `01 02`). Reproducing "01 02 03 ... 08" literally needs 29-32 archive articles: not recommended.

## 4. Actions

4.1 Card/title/thumbnail/READ FULL ARTICLE/CONTINUE/Read More -> `/en/news/<slug>` (same tab, `next/link`).
4.2 Search: submit (Enter or magnifier) navigates GET `/en/news?q=<trimmed text>` (page param dropped; category/tag are cleared: search is global). Empty or whitespace-only q -> `/en/news` (no param). q max 100 chars (trim). No live-as-you-type filtering (no JS needed). Input is prefilled with the current `q`.
4.3 Category: link -> `/en/news?category=<slug>`; clears q, tag and page. Unknown slug -> treated as no results (empty state, HTTP 200). Row label of an article links to its category if it exists in `NewsCategory` (any `in_sidebar`).
4.4 Tag: link -> `/en/news?tag=<slug>`; clears q, category, page. Unknown slug -> empty state.
Only one of q / category / tag is active at a time (last one wins; if several are present in a hand-typed URL the priority is q > category > tag).
4.5 Pagination: links `/en/news?page=N` (keeps q/category/tag). Page 1 omits `page`. `page` not an integer >= 1 -> treated as 1; `page` > last page -> redirect (308) to the last page. Ellipsis rule: show first, last, current, current±1; `...` for any gap of 2+; if current is 1 or last, show 3 consecutive numbers at that edge (design: 01 02 03 ... 08). Total <= 5 pages: show all. PREVIOUS/NEXT = page-1 / page+1.
4.6 Sorting: none exposed; fixed `published_at` desc.
4.7 Result status: visually hidden `role="status"` text `N articles` updates with the view (new string, A10).
4.8 Empty state (new, not in design, A10): when a filtered view has 0 results the main column shows, in place of featured/rows/pagination, text `No articles found.` (h2-less paragraph, 17 px `#444654`) and a link `Clear filters` -> `/en/news`. Sidebar, hero, Industry Insights and the rest stay. With a `q` the text is `No articles found for "<q>".` (q escaped).
4.9 White paper `DOWNLOAD PDF`: if `Resource.file` is set it is an `<a href=assetUrl download>` opening/downloading the PDF; if null (current fixtures) it is rendered as a non-link `<button type="button" aria-disabled="true">` with no action and no `#` href (A8).
4.10 Banner links `VIEW REPORT` / `DOWNLOAD PDF`: same rule as 4.9 (file set -> link in new tab `rel=noopener` for view, download for PDF; null -> disabled button).
4.11 Header/footer/CTA: as shared spec; breadcrumb HOME -> `/en`, NEWS -> `/en/news`.
Keyboard: all links/buttons reachable in DOM order: header, breadcrumb, featured, rows, pagination, search, categories, tag chips, white paper, hero 2 breadcrumb, Industry Insights cards, banners (DOM order main-before-sidebar at >=1024; see 5 for <1024). Hover/focus-visible/active states for every interactive element.

## 5. Responsive (breakpoints 1920 / 1280 / 1024 / 768 / 428; 320 minimum)
Global: container max 1280 centered, side padding 40 (>=1024), 24 (768), 16 (<=428); the page never scrolls horizontally from 320 up (only carousels scroll internally). Hero heights scale (hero 1: min 280 at 428; hero 2: min 240), titles `clamp` (58 px at 1920 -> 28 px at 428, 2-line wrap allowed, `overflow-wrap:anywhere` as safety).
| Section | 1920 (design) | 1280 | 1024 | 768 | 428 (and 320) |
|---|---|---|---|---|---|
| Header | shared | shared | shared; hamburger menu below 1024 | hamburger | hamburger + language selector (Home mobile) |
| Hero 1 + 2 | as drawn | same | same | title 40 px | title ~28 px, breadcrumb 12 px, no clipping |
| Main + sidebar | 2 cols 768 / 384 gap 128 | 2 cols, main fluid, sidebar 340, gap 64 | 2 cols, sidebar 300, gap 40 | 1 col; order: search panel, featured, rows, pagination, categories, white paper, tags | same as 768 |
| Featured card | cover 768x329 | cover aspect 7:3 (fluid) | same | full width, aspect 7:3 | full width, aspect 16:10, badge stays top-left, title 26 px |
| Article rows | thumb 245 + text | thumb 220 | thumb 180 | thumb 200 left, text right | stacked: image full width (aspect 16:9) above text; excerpt not clamped |
| Pagination | prev / numbers / next one row | same | same | same | numbers centered on row 1 (wrap allowed), PREVIOUS left / NEXT right on row 2; touch targets >= 44 px |
| Sidebar widgets | stacked 384 | stacked 340 | stacked 300 | full width stacked; white-paper title may wrap in 2 lines | full width stacked, tag chips wrap |
| Industry Insights | 3 cards 413 | 3 cards fluid | 3 cards fluid | 2-col grid, horizontal scroll-snap carousel with pagination dots (Home mobile pattern) | 2-col (2 visible) scroll-snap carousel + dots, as Home mobile news |
| Banners | 2 side by side | 2 side by side | 2 side by side (text sizes scale) | stacked, full width | stacked, full width, padding 24, decoration shapes clipped inside |
| CTA / footer | shared | shared | shared | shared | shared (stacked footer per Home mobile) |
Rule for dots: one dot per scroll position, active dot red `#DE2627`, others light red (Home pattern); keyboard: arrow keys/Tab scroll cards into view; dots are buttons (`aria-label="Go to slide N"`).

## 6. Acceptance criteria (Playwright; fixtures = 7 articles + recommended 6 sample articles for NW-17..)
Shared fidelity rule: full-page pixel difference vs `design/exports/news/desktop-1920@1x.png` <= 3% at 1920 (known accepted differences: pagination digits, category counts, header active tab, hero 1 mapping).
NW-1. Given a browser, When `/en/news` is opened, Then HTTP 200, `<html lang="en">`, `<title>` is `News & Insights | Saigon Trans` and exactly one `h1` with text `NEWS & INSIGHTS` exists.
NW-2. Given `/en/news` at 1920, When the page loads, Then the vertical order of landmarks is: header, hero 1, featured card, 3 article rows, pagination, hero 2, Industry Insights, 2 banners, CTA, footer, and Partners & Clients and the quote form are absent.
NW-3. Given `/en/news`, When it loads, Then hero 1 shows the text `IMPLEMENTING AI-DRIVEN PREDICTIVE ROUTING FOR TRANS-PACIFIC CORRIDORS` (case-insensitive match of the featured title) and a breadcrumb `HOME`, `NEWS`, `NEWS DETAIL`, and hero 1 contains no heading element.
NW-4. Given `/en/news`, When it loads, Then the header NEWS item has `aria-current="page"` and HOME does not.
NW-5. Given the default view, When it loads, Then the featured card shows badge `INNOVATION`, meta `MAY 15, 2024` (case-insensitive) and `INSIGHTS`, the title `Implementing AI-Driven Predictive Routing for Trans-Pacific Corridors`, the verbatim excerpt of 3.2 and a link `READ FULL ARTICLE`.
NW-6. Given the default view, When it loads, Then the 3 rows show, in order, `Opening Our New Strategic Hub in Singapore` (`NETWORK EXPANSION`, `April 28, 2024`), `Quarterly Market Outlook: Navigating Supply Volatility` (`GLOBAL SUPPLY`, `April 12, 2024`), `Blockchain for Transparent Bill of Lading` (`INNOVATION`, `March 30, 2024`), each with a `CONTINUE` link.
NW-7. Given the default view, When it loads, Then none of the 3 Industry Insights titles appears among the featured/rows titles and exactly 4 articles are listed.
NW-8. Given the featured card, When its title link is clicked, Then the URL becomes `/en/news/implementing-ai-driven-predictive-routing`; and for each row, clicking its title, thumbnail and `CONTINUE` navigates to `/en/news/<that row's slug>`.
NW-9. Given every article image on the page, When inspected, Then each content image has non-empty `alt` and loaded (naturalWidth > 0); hero backgrounds have empty alt or are CSS backgrounds.
NW-10. Given the sidebar, When it loads, Then it contains, in order: `SEARCH INSIGHTS` with an input of placeholder `Search articles...`, `CATEGORIES` with rows `Global Supply`, `Innovation`, `Network Updates`, `Sustainability` each followed by a 2-digit count, the white paper card titled `Annual Logistics White Paper 2024`, `TRENDING TAGS` with chips `FREIGHT`, `BLOCKCHAIN`, `ASIA-PACIFIC`, `GREEN-LOGISTICS`, `WAREHOUSING` (case-insensitive).
NW-11. Given category counts, When compared with fixtures, Then each count equals the number of published fixture articles in that category (computed, not hard-coded).
NW-12. Given the search box, When `blockchain` is typed and Enter is pressed, Then the URL is `/en/news?q=blockchain` and exactly the article `Blockchain for Transparent Bill of Lading` is listed, no featured card, no pagination beyond `01`.
NW-13. Given the search box, When `BLOCKCHAIN` (upper case) or `  blockchain  ` is submitted, Then the same result is shown and the URL contains `q=blockchain` (trimmed; case preserved is acceptable only if results equal).
NW-14. Given the search box, When a text matching nothing (`zzzz`) is submitted, Then the main column shows `No articles found for "zzzz".` and a `Clear filters` link, the sidebar and Industry Insights remain, and no article card or pagination is shown.
NW-15. Given the empty state, When `Clear filters` is clicked, Then the URL is `/en/news` and the default view is shown.
NW-16. Given the search box, When it is submitted empty or with spaces only, Then the URL is `/en/news` (no `q`).
NW-17. Given the default view, When category `Innovation` is clicked, Then the URL is `/en/news?category=innovation`, the list contains exactly the published Innovation articles (including any in the Industry Insights set), the featured card is absent, the `Innovation` row has `aria-current="true"` and Industry Insights is still shown unchanged.
NW-18. Given a tag chip `FREIGHT`, When clicked, Then the URL is `/en/news?tag=freight` and the chip has `aria-current="true"`; if no article has that tag the empty state is shown.
NW-19. Given `/en/news?category=nope`, When opened, Then HTTP 200 and the empty state is shown.
NW-20. Given `/en/news?q=a&category=innovation`, When opened, Then the `q` filter is applied and the category filter is ignored.
NW-21. Given N archive articles <= 4, When the page loads, Then pagination shows only `01` as current and both PREVIOUS and NEXT have `aria-disabled="true"` and are not links.
NW-22. Given > 4 archive articles (sample set), When the page loads, Then pagination shows `01 02` and NEXT links to `/en/news?page=2`.
NW-23. Given page 2, When NEXT is clicked on the last page, Then nothing happens (aria-disabled); PREVIOUS links to `/en/news` (no `page` param) and page 2 shows no featured card and no more than 4 rows.
NW-24. Given `/en/news?page=0`, `?page=abc`, `?page=-3`, When opened, Then the page 1 default view is shown (HTTP 200).
NW-25. Given `/en/news?page=999`, When opened, Then the browser is redirected to the last page.
NW-26. Given an active filter and more than one result page, When a pagination link is followed, Then its href keeps the same `q`, `category` or `tag`.
NW-27. Given pagination with 8 pages (unit test of the page-list function), When current is 1 the labels are `01 02 03 ... 08`; current 4 gives `01 ... 03 04 05 ... 08`; current 8 gives `01 ... 06 07 08`; total 5 shows all five.
NW-28. Given Industry Insights, When loaded, Then 3 cards with the verbatim titles, authors `Quang Ng`, `KD Duong`, `Henry Tran`, text `Comments (03)` and a `Read More` link each, ordered as in section 2.4, and each card link goes to `/en/news/<slug>`.
NW-29. Given the Industry Insights heading, When loaded, Then eyebrow `Latest Briefings` and `h2` `Industry Insights` are visible.
NW-30. Given the banners, When loaded, Then the left shows `ANNUAL REPORT`, `2025 FINANCIAL PERFORMANCE HIGHLIGHTS`, the verbatim text and `VIEW REPORT`; the right shows `WHITE PAPER`, `THE FUTURE OF AUTONOMOUS TRUCKING`, the verbatim text and `DOWNLOAD PDF`.
NW-31. Given a Resource without file (current fixtures), When its CTA is inspected, Then no element in the page has `href="#"`, the CTA is a `button[aria-disabled="true"]` and clicking it does not change the URL or open a request.
NW-32. Given the whole page, When all `a[href]` are collected, Then none is `#`, empty or `javascript:`, and every internal link resolves to HTTP 200 (excluding `/en/news/<slug>` of fixtures without body, which must render the article page).
NW-33. Given all text on the page, When searched in the DOM, Then it comes from fixtures or the message file: changing a fixture title changes the page (no hard-coded titles in components); the verbatim design typos are preserved.
NW-34. Given keyboard only, When Tab is pressed from the top, Then focus visits all links/buttons listed in section 4 and each shows a visible focus ring; the search form submits with Enter.
NW-35. Given widths 1280 and 1024, When loaded, Then document `scrollWidth <= innerWidth` and the sidebar is to the right of the main column.
NW-36. Given width 768, When loaded, Then the sidebar is below the main column (its Y-start >= bottom of pagination) except that the search panel is above the featured card, and Industry Insights is a scroll-snap carousel with dots.
NW-37. Given width 428 and 320, When loaded, Then `scrollWidth <= innerWidth`, article rows are stacked (image above text), the header shows a hamburger, the footer is stacked, and the Industry Insights carousel scrolls horizontally inside its own container only.
NW-38. Given width 428, When the hamburger is toggled, Then the menu opens, Esc closes it and focus returns to the toggle (shared behavior).
NW-39. Given width 1920, When the full page is captured, Then pixel difference vs `design/exports/news/desktop-1920@1x.png` is <= 3%.
NW-40. Given the page, When requests are inspected, Then no third-party host is contacted and the search sends no data outside `/en/news`.

## 7. Design anomalies and open questions
A1. The export contains two banners: hero 1 (article-detail title + breadcrumb `HOME • NEWS • NEWS DETAIL`, header on top) and hero 2 (`NEWS & INSIGHTS`, `HOME • NEWS`), with the article list between them. Hero 1 + list + sidebar look pasted from the article-detail frame (same sidebar, same hero). Reproduced as drawn (user guardrail: ask before deviating). Question: keep both, or keep only hero 2 on top (header over it) and move the list after it? If only hero 2: NW-2, NW-3 change.
A2. Active nav tab drawn as HOME; spec uses NEWS (requirements). Confirm.
A3. Featured meta shows `INSIGHTS` while the image badge shows `INNOVATION`; no data source for `INSIGHTS` (a section name? a content type?). Proposed: static label from the message file. Confirm, or drop one.
A4. Row category `NETWORK EXPANSION` is not in the sidebar list (`Network Updates`). Modelled as 5 categories with `in_sidebar`. Is it a typo for `Network Updates`?
A5. Sidebar counts (12/08/24/05 = 49 articles) and pagination `08` imply ~49 articles; only 7 fixtures exist. Counts are computed so they will differ from the drawing (accepted for the 3% diff). Pagination `01 02 03 ... 08` is not reproducible with real data. Add 6 sample articles for tests? 
A6. Pagination in the design shows PREVIOUS at full strength on page 1; we disable it.
A7. White paper title wraps `Annual Logistics / White / Paper 2024` (odd break). Reproduced.
A8. No PDF/report files are given; the 3 download/view CTAs have no target. Provided as disabled until files are supplied. Alternative needing OK: link them to `/en/contact`.
A9. `TRENDING TAGS` header rule is dark, the other two sidebar headers have a light-blue rule.
A10. Empty state, result status text, active filter states, disabled pagination are not in the design (needed behavior); strings added to the message file need approval.
A11. Trending tags have no known article associations; filtering by them will normally return the empty state until tags are assigned in the CMS. Do the article-detail tags map to the same tag set?
A12. Authors and comment counts are not shown on list rows/featured card; unknown for the 4 new articles (null).
A13. Hero 1 title bound to the featured article (design shows its title in caps). OK? And what is shown if no article is featured?
A14. Default-view exclusion of the 3 newest articles (they appear in Industry Insights) is a rule invented to make page 1 match the design; alternative is re-dating existing fixtures. Confirm.
A15. Images are cut from the export, not originals (hero 1 box photo, hero 2 containers, covers, thumbnails); originals needed.
A16. Dates for the 4 new articles are from the design; their year (2024) is older than the existing three (2025), which is why they fall after them in the archive.
