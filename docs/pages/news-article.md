# Page spec: News Article (template for every News record)

> Source: `design/exports/news-article/desktop-1920@1x.png` (1920x4148). Cross-checked with `design/exports/news/desktop-1920@1x.png` (the list page repeats the same featured article, sidebar and related block). Mobile/tablet are derived from the Home mobile patterns (428 frame). Slices: `design/reference/_work/spec-news-article-*.png`.
> Marking: **[D]** = value read from the design (fixture value allowed). **[List]** = read from the News list design. **[Derived]** = my derivation, not in the design. **[OQ]** = open question (section 7).
> Shared blocks are NOT re-specified: `shared: header`, `shared: footer`, `shared: cta`, `shared: partners`, `shared: quote form`. Only visible differences are noted.

## 1. Route and purpose

- Route: `/en/news/<slug>` (locale-prefixed; `/vi` later). Static page per published News record (`generateStaticParams` over published slugs; unknown slug, draft or archived record = `notFound()` -> shared 404 page, HTTP 404).
- Purpose: a reader opens one news item from the News list, Home news cards or related posts, reads it, and finds related items and a path to a quote.
- `<title>` = `<article title> | <site name from messages>`. `<meta name="description">` = article `excerpt` (fallback: first 160 chars of the first paragraph block, plain text). `og:title`, `og:description`, `og:image` (cover via `assetUrl`), `og:type=article`, `article:published_time` = `published_at`. `<link rel="canonical">` = `/en/news/<slug>`. `<html lang="en">`. Exactly one `<h1>`.
- Fixture article (the one in the design):
  - Title **[D]**, verbatim as displayed (the hero renders it in capitals): `IMPLEMENTING AI-DRIVEN PREDICTIVE ROUTING FOR TRANS-PACIFIC CORRIDORS`. The News list design shows the same title in title case: `Implementing AI-Driven Predictive Routing for Trans-Pacific Corridors` **[List]**. Store the title case form; the hero applies `text-transform: uppercase` (CSS), so visible text is uppercase. Tests compare case-insensitively on `h1`.
  - Slug **[Derived]**: `implementing-ai-driven-predictive-routing` (not in design; [OQ-1]).
  - `published_at` = `2024-05-15` **[List]** (list shows "MAY 15, 2024"; the article page itself shows no date). Category **[List]**: `Innovation`. Author: unknown [OQ-2].
- Note: the three posts in the "Industry Insights" block and on Home are different records (slugs `vietnam-logistics-digital-shift`, `logistics-turning-point`, `talent-shortage` already in `src/content/fixtures/news.json`). The fixture article is a 4th record and must be added to `news.json` with `sort` so it does not displace the Home "latest 3" unexpectedly (see section 3).

## 2. Sections, top to bottom (y in the 1920 export)

Page container: x 320-1599 (1280 wide) for all content below the hero. Page background white from y 495 to 3124; CTA and footer are shared.

### 2.1 Header (y 0-494, shared: header, includes hero background)
- shared: header (white bar with logo, address, hotline, email, Booking; nav bar with HOME PAGES SERVICES ABOUT NEWS CONTACT; social icons). Visible texts as in Home: `55 Main Street, 2nd block, Malborne, Australia`, `HOTLINE:`, `(028) 456 564 687`, `Email`, `needhelp@company.com`, `Booking`.
- Difference: the active nav tab drawn in the design is **HOME** (lighter blue tab). Anomaly A-1: the rule in requirements says the active item reflects the current page, so build **NEWS** active on this page; log in `docs/progress.md`.

### 2.2 Hero / page title (y 0-494, nav bar ends y 491)
- Purpose: page title banner. Full-bleed blue photo (stacked cargo boxes/containers, blue overlay, heavy blur), same family as the other inner-page heroes. Decoration (empty alt `""`), a single image shared with the other inner-page heroes (file id: reuse the inner-page hero asset; not article data).
- Texts [D]: H1 (two lines, centred, white, bold, uppercase, ~58 px cap height-ish): `IMPLEMENTING AI-DRIVEN PREDICTIVE ROUTING` / `FOR TRANS-PACIFIC CORRIDORS` (wraps naturally; content comes from the article title).
- Breadcrumb under the title (y ~365-375, white, small caps-style uppercase, letter-spaced, bullets between): `HOME` `•` `NEWS` `•` `NEWS DETAIL`. Link targets: HOME -> `/en`, NEWS -> `/en/news`; `NEWS DETAIL` is the current page (not a link, `aria-current="page"`). The last crumb literally reads `NEWS DETAIL`, not the article title (keep as design; messages key). Wrap in `<nav aria-label="Breadcrumb">` with `<ol>`.
- States: breadcrumb links hover = underline; focus-visible ring.

### 2.3 Main grid (y 575-~2210): article column + sidebar
Two columns: article x 320-1183 (864 wide), sidebar x 1216-1599 (384 wide), gap 32. Top of both columns y 575. Sidebar is not sticky in the design.

#### 2.3.1 Cover image (y 575-903, x 320-1180)
- Shows: grey cartoon illustration of a man in shirt and tie on a dark radial-grey background (placeholder-style art). Approx 861x329, `object-fit: cover`. Content (article `cover`), alt = article title [Derived] (alt text field proposed in section 3).
- No overlay, no caption, no category badge, no date, no author row in the design (anomaly A-2). Cover bottom radius: none (square corners).
- Fixture file: the design asset is a placeholder illustration; reuse a cropped export from the design (same approach as home fixtures, id in `design/reference/_work/file-ids.json` convention). [OQ-3]

#### 2.3.2 Article body (y 956-2075; starts 53 px below the cover)
Rich text column, width 864. Block sequence in the design, verbatim:
1. **Lead paragraph** (y 956-1071, ~24 px, dark ink, 4 lines, larger than body): `Global trade is navigating its most significant transformation since the invention of the shipping container. As the world shifts towards hyper-connected supply chains, Saigontrans is at the forefront of this industrial revolution.`
2. **H2** (y 1103-1132, ~28 px bold, dark, display-style face (different from Inter; looks like Plus Jakarta/Outfit-type geometric sans [OQ-4])): `The Kinetic Architect Strategy`
3. **Paragraph** (y 1170-1261, ~16 px, grey `#4B5563`-ish, 4 lines, line pitch 26): `The modern logistician is no longer just a mover of goods, but an architect of data and movement. By leveraging predictive analytics and real-time tracking, we are creating a "Live Manifest" system that anticipates bottlenecks before they occur. This structural integrity allows our clients to scale their operations globally without the traditional friction of cross-border commerce.`
4. **Feature/stat block** (y 1300-1662, x 320-1183, ~864x362, dark charcoal `#2F2F37`-ish background, square corners):
   - Left: H3-style title `Real-Time Transit Efficiency` (white, ~28 px, display face); description (grey-lilac, ~15 px, 2 lines): `Our latest fleet of autonomous cargo carriers has improved delivery precision by 22% across the Trans-Pacific corridor.`
   - Two stat tiles (y ~1497-1577): tile 1 has a 4 px blue left bar, value `99.8%` (white bold ~26 px), label `ON-TIME RATE` (blue on dark blue tile: nearly illegible, anomaly A-3; the label was recovered by brightening the export, not visible at normal contrast); tile 2 has a 4 px light-cyan left bar, value `12k`, label `ACTIVE UNITS` (cyan).
   - Right: image ~266x266 at x ~902-1168, y ~1348-1614: dark teal futuristic holographic globe with a hand and a hexagon (content image `image`, alt `""` if purely decorative [OQ-5]).
   - This is a custom block type ("callout/feature"), not plain text. Numbers `99.8%`, `12k`, `22%` come from the design [D]; they are article content, but they are unverified claims: see OQ-6 (guardrail: never invent numbers; these are in the design, so allowed as fixture, flagged to the owner).
5. **H2** (y 1702-1731): `Sustainable Logistics: The New Standard`
6. **Paragraph** (y 1769-1837, 3 lines): `The future of logistics is green. We are heavily investing in hydrogen-powered line-haul vehicles and solarintegrated warehousing. Our goal is to achieve carbon neutrality by 2035, a commitment that is reshaping our entire fleet acquisition strategy.` (Design typo kept: `solarintegrated`.)
7. **Blockquote** (y 1872-1968): 6 px vertical bar at the left in brand blue `#0A24A8`-ish, 20 px left padding, text ~24 px semi-bold dark, 2 lines, straight double quotes included in the text: `"Sustainability is no longer a peripheral corporate social responsibility; it is the core engine of industrial longevity."` No attribution shown.
8. **Paragraph** (y 2007-2075, 3 lines): `Through asymmetrical growth strategies and precise execution, Saigontrans continues to define the kinetic movement of the global economy. As we look towards 2025, our focus remains on the structural resilience of our network and the technological empowerment of our partners.`
- Vertical rhythm: paragraphs ~24-40 px apart; headings ~40 px above, ~38 px below; media blocks 38 px above/below.

#### 2.3.3 Article footer: divider and article tags (y 2143-2206)
- 1 px light-grey divider y 2143, x 320-1183.
- Tag chips (y 2176-2206, 30 high, x 320-432, 444-561, 573-707, 720-846; 12 px gaps), lilac `#EEEDF7` background, uppercase ~11 px bold dark-grey text, square corners. Texts [D]: `FUTURE TECH`, `SUPPLY CHAIN`, `GREEN LOGISTICS`, `SUSTAINABILITY`. Chips are links (hover: background brand blue, white text; focus ring).
- Below the tags there is ~215 px of empty space before the next section (y 2207-2420). In the design there is NO author box, NO date, NO share buttons, NO previous/next, NO comments list or form (A-2). See section 4 for what is added/deferred.

#### 2.3.4 Sidebar (x 1216-1599, y 575-1580), 4 widgets, vertical gap ~50 px
Widget titles are small caps-like (11 px, bold, letter-spacing, dark navy) with a short 32 px blue rule at the right end of the title row.
1. **Search Insights** (y 575-730, lilac `#EEEDF7` panel, padding 32): title `SEARCH INSIGHTS`; white input (y 646-698, x 1248-1568) with placeholder `Search articles...` and a blue magnifier icon at its right. Interaction: submits a GET form to `/en/news?q=<term>` (search happens on the list page; see section 4). Empty submit goes to `/en/news`.
2. **Categories** (title y 782-791): title `CATEGORIES`; 4 rows (pitch 57 px, 1 px bottom border each, y 831-1038): name left, count badge right (lilac pill, 2 digits zero padded). Rows [D]: `Global Supply` `12`; `Innovation` `08`; `Network Updates` `24`; `Sustainability` `05`. Each row is a link to `/en/news?category=<category slug>`. Count = number of published articles in the category (derived, not hard-coded) [OQ-7].
3. **Promo card "Annual Logistics White Paper 2024"** (y 1087-1420, x 1216-1599, brand-blue gradient `#0224A6` -> `#18138A`, padding 32, square corners): outline document icon (white, y ~1115-1145); title, white bold ~24 px, 3 lines: `Annual Logistics` / `White` / `Paper 2024`; text (light blue ~14 px, 2 lines): `Download our comprehensive 60-page report on the future of multi-modal freight technology.`; white button (y 1337-1383, full width of card padding) with blue uppercase bold text `DOWNLOAD PDF` and a download icon. The file does not exist [OQ-8]: until a PDF is supplied the widget is hidden (data driven: only rendered if a `promo` record with a file exists).
4. **Trending Tags** (title y 1471-1480): title `TRENDING TAGS`; chips (30 high, same style as 2.3.3) in two rows (y 1509-1539 and 1549-1580): row 1 `FREIGHT` `BLOCKCHAIN` `ASIA-PACIFIC`; row 2 `GREEN-LOGISTICS` `WAREHOUSING`. Links to `/en/news?tag=<tag slug>`.
- Same sidebar appears on the News list page (list design): build as one shared `NewsSidebar` component.
- Anomaly A-4: tags in the article (FUTURE TECH...) differ from trending tags (FREIGHT...): different data sets; both are tag records (trending = most used, derived).

### 2.4 Related posts: "Industry Insights" (y ~2420-3124, x 320-1599)
Same block as Home latest news (`shared: news cards`, reuse the Home component).
- Eyebrow (red italic bold ~24 px, y ~2410-2435): `Latest Briefings`.
- H2 (navy `#2F439B`, bold ~58 px, y 2465-2504): `Industry Insights`. Red 128x2 rule at the right end of the heading row (x ~1472-1599, y ~2500).
- 3 cards (x 320-731, 752-1163... pitch ~432; each ~412x~558 incl. 1 px border `#E5E5E5`, padding 16, y 2566-3124): image 381x~285 (rounded 8), title navy bold 22 px / 34 line (3 lines), meta row (red user-circle icon + author, red comment-bubble icon + `Comments (03)`, grey 15 px), `Read More` + chevron. Card 1 is drawn in its hover state (white with shadow, `Read More` red `#CD2727`); cards 2 and 3 default (grey `Read More`). Same note as Home known difference 3.
- Texts [D], same as Home: `Vietnam’s Logistics Industry: From Traditional Supply Chains to a Full-Scale Digital Shift` / `Quang Ng` / `Comments (03)`; `Vietnam Logistics at the Turning Point: Great Opportunities Amid Growing Pressures` / `KD Duong` / `Comments (03)`; `Talent Shortage: The Biggest Bottleneck in Vietnam’s Logistics Growth` / `Henry Tran` / `Comments (03)`. `Read More` each.
- Images: event photos (anniversary stage; group of staff in white shirts; staff in cyan shirts on a lot): content (article covers), same files as Home.
- Data: the 3 newest published articles excluding the current one [Derived rule; design shows same 3 as Home].
- Below the cards ~120 px of light grey `#F9F9F9` (y 3132-3244) before the CTA; treat as section bottom padding with the same off-white as Home (A-5: on Home the grey band is `#F5F5F5`).

### 2.5 CTA band (y 3243-3606) - shared: cta
Texts [D] `READY TO OPTIMIZE YOUR SUPPLY CHAIN?`, `Get a tailored quote for your international shipping needs today from our expert logistics consultants.`, buttons `REQUEST A FREE QUOTE`, `CONTACT SALES`. No difference from Home. "Request a free quote" target: shared (quote form lives on Home/Contact; not on this page, see 2.7).

### 2.6 Footer (y 3607-4147) - shared: footer
Footer 3607-4081, copyright bar 4082-4147. No visible difference from Home.

### 2.7 Not present in the design (confirmed absent)
Partners & Clients block, quote form, comments list, comment form, author box, share buttons, previous/next, reading time, date line. Do not add visible UI for these in M2 unless the owner approves (guardrail: deviation = ask first). Section 4 lists the minimum functional mapping.

## 3. Data model

Additions to `src/lib/cms/schema.ts` (Zod, same style). Existing `News` fields stay; fixture article uses them.

```ts
// extend News
const ArticleBlock = z.discriminatedUnion('type', [
  z.object({ type: z.literal('lead'),       text: z.string() }),                       // plain text, no markup
  z.object({ type: z.literal('heading'),    level: z.union([z.literal(2), z.literal(3)]), text: z.string() }),
  z.object({ type: z.literal('paragraph'),  text: z.string() }),                       // inline marks via spans, see below
  z.object({ type: z.literal('quote'),      text: z.string(), cite: z.string().nullable().optional() }),
  z.object({ type: z.literal('image'),      file: File, alt: z.string(), caption: z.string().nullable().optional() }),
  z.object({ type: z.literal('list'),       ordered: z.boolean(), items: z.array(z.string()) }),
  z.object({ type: z.literal('feature'),    title: z.string(), text: z.string(), image: File.nullable(),
            stats: z.array(z.object({ value: z.string(), label: z.string() })).max(4) }),   // "Real-Time Transit Efficiency" block
]);
// inline marks inside text strings: allowed subset only: **bold**, *italic*, [label](https://... or /path). Parsed by our own parser into React nodes; no HTML ever injected.

const News = Base.extend({
  slug: z.string(),
  cover: File.nullable(),
  cover_alt: z.string().nullable().optional(),            // new
  published_at: z.iso.datetime({ offset: true }),
  author: z.string().nullable().optional(),
  comments_count: z.number().int().nonnegative().nullable().optional(),
  category: z.uuid().nullable().optional(),               // new: -> NewsCategory.id
  tags: z.array(z.uuid()).optional(),                     // new: -> NewsTag.id (M2M junction in Directus)
  translations: z.array(T({
    title: z.string(), excerpt: z.string(),
    body: z.array(ArticleBlock),                          // CHANGED from z.string(): see recommendation
  })),
});
const NewsCategory = Base.extend({ slug: z.string(), translations: z.array(T({ name: z.string() })) });
const NewsTag      = Base.extend({ slug: z.string(), translations: z.array(T({ name: z.string() })) });
const Promo = Base.extend({ file: File.nullable(), icon: z.string().nullable(),
  translations: z.array(T({ title: z.string(), text: z.string(), button_label: z.string() })) });  // sidebar white-paper card
```

**Body format recommendation: structured blocks (JSON array), not HTML.** Reasons: (1) XSS safety: no `dangerouslySetInnerHTML`; React escapes every string, links are validated by our parser (only `https:`, `mailto:`, `tel:` or `/` paths; `rel="noopener noreferrer"` on external). With HTML we would need a sanitizer (extra dependency, config risk, bypasses). (2) The design contains a non-standard block (the dark feature/stat block) that needs structure and responsive layout, not freeform HTML. (3) Locale-safe and testable: a Zod contract validates every record. Directus mapping: a JSON field with a block editor or a Directus "Blocks" repeater (`M2A`) in M3; migration cost is a transform, not a sanitiser. Trade-off: editors lose free formatting; accepted (YAGNI). Existing fixtures have `body: ""` (string): change them to `[]` and update the contract test. Related: `getNewsBySlug(locale, slug)`, `getRelatedNews(locale, slug, n)`, `getNewsCategories(locale)` (with counts), `getNewsTags(locale)`, `getPromo(locale)` added to `lib/cms`; same rules (published only, locale fallback to `en`, null/[] when missing, never throw).

Fixture values taken from the design (all **[D]** unless marked):
- News (new record, `status: published`): `slug` [Derived]; title/H1 [D]; `published_at` `2024-05-15T08:00:00.000Z` [List]; `author`: null [OQ-2]; `comments_count`: null (not shown) ; `category` = Innovation [List]; `tags` = `Future Tech`, `Supply Chain`, `Green Logistics`, `Sustainability` [D]; `cover_alt` [Derived: title]; `excerpt`: text of the lead paragraph [Derived, OQ-9]; `body` = the 8 blocks of 2.3.2 in order (block 4 = `feature` with stats `99.8%`/`ON-TIME RATE` and `12k`/`ACTIVE UNITS`; `quote` without `cite`).
- NewsCategory: `Global Supply`, `Innovation`, `Network Updates`, `Sustainability`. The displayed counts `12`, `08`, `24`, `05` are **not** fixture data; counts are computed from records. With only 4 fixture news records the page would show tiny counts, which differs from the design [OQ-7]; to keep the 1920 diff <= 3% (the numbers are small glyphs) the fixture MAY include a `count_override` only in the fixture-driver, never in the contract. Recommendation: accept the difference and compute counts.
- NewsTag trending: `Freight`, `Blockchain`, `Asia-Pacific`, `Green-Logistics`, `Warehousing` [D]; slugs [Derived].
- Promo: title `Annual Logistics White Paper 2024`, text `Download our comprehensive 60-page report on the future of multi-modal freight technology.`, button `Download PDF`; `file`: null [OQ-8].

### Comments
The design has no comment form and no comment list; the only comment reference is the `Comments (03)` counter on cards. Recommendation: **defer comments to a later milestone** (not M2). `comments_count` stays a plain number editable in the CMS (existing field), rendered only on cards as in the design; the article page shows no count (the design has none). Reason: a public comment form needs moderation, spam control, privacy wording and storage, none requested, and the guardrails require asking before adding fields/UI not in the design. If the owner wants it: store as `Comment` (id, news, name, email, body, status `pending|published|rejected`, date_created), honeypot and rate-limit like the quote form, moderation in Directus, and `comments_count` computed. See OQ-10.

## 4. Actions

| # | Element | Behavior |
|---|---|---|
| 1 | Header/footer/CTA | shared. NEWS tab is active (A-1). `REQUEST A FREE QUOTE` -> `/en#quote` (shared quote form on Home); `CONTACT SALES` -> `/en/contact`. |
| 2 | Breadcrumb HOME / NEWS | `/en`, `/en/news`. `NEWS DETAIL` not a link. |
| 3 | Cover image | not clickable. |
| 4 | Inline links in body | internal `/...` same tab; external `https:` new tab with `rel="noopener noreferrer"`; others stripped. (None in the fixture.) |
| 5 | Article tag chip | `/en/news?tag=<tag slug>`; keyboard focusable link. |
| 6 | Sidebar search | `<form method="get" action="/en/news">` with `<input name="q" type="search" aria-label="Search articles">` and a submit button (the magnifier icon, `aria-label="Search"`). Enter or click submits to `/en/news?q=<encoded term>`; empty -> `/en/news`. Term trimmed, max 80 chars. Works without JS. |
| 7 | Sidebar category row | `/en/news?category=<category slug>`. |
| 8 | Sidebar trending tag | `/en/news?tag=<tag slug>`. |
| 9 | `DOWNLOAD PDF` | If Promo.file exists: link to `assetUrl(file)` with `download`, opens/downloads the PDF; else the whole widget is not rendered. Never `#`. |
| 10 | Related card (whole card, title, `Read More`) | `/en/news/<slug>`; hover = highlighted state (shadow, red Read More), focus-visible ring on the link. |
| 11 | Share buttons | **Not in the design: not rendered in M2** (guardrail). If the owner approves (OQ-11), exact patterns, all `target="_blank" rel="noopener noreferrer"`, `<canonical>` = absolute URL of `/en/news/<slug>`, text = title, both URL-encoded: Facebook `https://www.facebook.com/sharer/sharer.php?u=<url>`; X `https://twitter.com/intent/tweet?url=<url>&text=<title>`; LinkedIn `https://www.linkedin.com/sharing/share-offsite/?url=<url>`; Copy link = `navigator.clipboard.writeText(<url>)` with a visible "Link copied" status (`role="status"`). Static links, no third-party scripts. |
| 12 | Previous / next article | **Not in the design: not rendered in M2** (OQ-11). If approved: ordered by `published_at`; previous = next older published, next = next newer; hidden at the ends. |
| 13 | Comment form | none (deferred, section 3). |
| 14 | Unknown slug | 404 page. |

All interactive elements: hover, `:focus-visible` ring and active states; reachable by keyboard in DOM order (breadcrumb, article tags, sidebar widgets, related cards); touch targets >= 44 px on mobile.

## 5. Responsive behavior

Layout rules: no horizontal page scroll at any width from 320 up (`overflow-x` must not be needed; images and the feature block are fluid, long words wrap). Side gutter 16 px below 1024. Header/footer/CTA/hero follow the shared Home behavior (hamburger menu below 1024 with language selector, stacked footer).

| Section | 1920 (design) | 1280 | 1024 | 768 | 428 (and down to 320) |
|---|---|---|---|---|---|
| Hero | full-bleed, H1 2 lines uppercase, breadcrumb below | same, H1 scales down proportionally | same | H1 smaller, wraps to 3 lines max | H1 as Home mobile hero title scale, centred, wraps to as many lines as needed; breadcrumb wraps, stays centred |
| Main grid | container 1280, 2 columns 864 / 384, gap 32 | container fills viewport minus gutters (>= 32); columns 2fr / 1fr, gap 32 | same 2 columns, gap 24, sidebar min 300 | **single column**: article first, sidebar below the article (below tags), sidebar widgets in one column full width | single column, sidebar below, widgets full width |
| Cover | 861x329 | fluid, aspect ratio kept | fluid | full width | full width, aspect ratio kept (min height 180) |
| Body | 864 text column | fluid | fluid | full width, font sizes unchanged | full width; lead 20 px, H2 24 px, body 16 px (min); quote text 20 px |
| Feature block | text left, image right, stats row | same | same, image shrinks | image moves under the text, stats row stays | one column: title, text, stats (two tiles side by side, wrap if < 360), image full width |
| Article tags | one row | one row | one row | wraps | wraps, gap 8 |
| Sidebar | 4 widgets stacked | same | same, narrower | in a 2-column grid? NO: keep one column; search first | one column, order: Search, Categories, Promo, Trending Tags |
| Related "Industry Insights" | 3 cards in a row | 3 cards | 3 cards, smaller | 2-column grid (as Home news), third card wraps below | **horizontal scroll-snap carousel** with pagination dots (Home mobile pattern for news; scroll is inside the carousel only, not the page) |
| CTA / footer | shared | shared | shared | shared | shared (stacked footer) |

Home mobile pattern note: the Home mobile frame uses a news 2-column card grid on the news block; the task brief also lists carousels with dots for card sets. Use the same component and behavior as Home at each width so the article page never diverges (if Home mobile shows a 2-column grid at 428, use it here too, and keep the carousel only where Home does). Dots: one per page, `aria-label` "Go to slide N", current has `aria-current="true"`.

## 6. Acceptance criteria

Shared rule: full-page pixel difference of `/en/news/<fixture slug>` at 1920 vs `design/exports/news-article/desktop-1920@1x.png` <= 3%. [Note: the sidebar category counts, article author-less cards, the NEWS-active tab and any promo-hidden state change small areas; counted inside the 3%.]

- NA-1: Given the fixture slug, When I open `/en/news/<slug>`, Then status is 200, `<html lang="en">`, exactly one `h1` whose text equals the article title case-insensitively, and `document.title` contains the title.
- NA-2: Given an unknown slug, When I open `/en/news/does-not-exist`, Then the response status is 404 and the 404 page is shown.
- NA-3: Given a News record with `status` draft or archived, When I open its slug, Then the response is 404.
- NA-4: Given the page, When read, Then `<meta name="description">` equals the article excerpt and `og:image` points to the cover asset URL.
- NA-5: Given viewport 1920, When the page loads, Then the main sections appear in this DOM/visual order: header, hero with breadcrumb, article (cover, body, tags), sidebar (right of the article), "Industry Insights", CTA, footer; and no Partners block and no quote form exist.
- NA-6: Given the breadcrumb, When I read it, Then it shows `HOME`, `NEWS`, `NEWS DETAIL` in this order; HOME links to `/en`, NEWS to `/en/news`; the last item has `aria-current="page"` and is not a link.
- NA-7: Given the header, When the page loads, Then the NEWS nav item is the active one (`aria-current="page"` or the active class) and HOME is not.
- NA-8: Given the fixture article, When I read the body, Then it contains in order: a lead paragraph starting `Global trade is navigating`; H2 `The Kinetic Architect Strategy`; a paragraph starting `The modern logistician`; the feature block titled `Real-Time Transit Efficiency` with stat values `99.8%` and `12k` and labels `ON-TIME RATE` and `ACTIVE UNITS`; H2 `Sustainable Logistics: The New Standard`; a paragraph starting `The future of logistics is green`; a blockquote starting `"Sustainability is no longer`; a paragraph starting `Through asymmetrical growth`.
- NA-9: Given the body HTML, When inspected, Then headings are `h2`, the quote is a `blockquote`, and the page source contains no `dangerouslySetInnerHTML`-injected markup: a fixture block with text `<script>alert(1)</script>` renders as literal text and no script executes.
- NA-10: Given a body link with `javascript:` URL in a test record, When rendered, Then no `<a>` with that href exists.
- NA-11: Given the article tags, When I read them, Then they are `FUTURE TECH`, `SUPPLY CHAIN`, `GREEN LOGISTICS`, `SUSTAINABILITY` (rendered uppercase) in that order; When I click `SUPPLY CHAIN`, Then the URL becomes `/en/news?tag=supply-chain` (slug per fixture).
- NA-12: Given the sidebar, When I read it, Then widget titles are `SEARCH INSIGHTS`, `CATEGORIES`, `TRENDING TAGS` and the promo title is `Annual Logistics White Paper 2024`, in vertical order Search, Categories, Promo, Trending Tags (promo present only when its file exists; see NA-16).
- NA-13: Given the search input (placeholder `Search articles...`), When I type `routing` and press Enter, Then the URL becomes `/en/news?q=routing`; When I submit it empty, Then the URL is `/en/news`.
- NA-14: Given the categories widget, When I read it, Then it lists `Global Supply`, `Innovation`, `Network Updates`, `Sustainability` with a numeric count each equal to the number of published articles in that category, zero padded to 2 digits; When I click `Innovation`, Then the URL is `/en/news?category=innovation`.
- NA-15: Given the trending tags, When I read them, Then they are `FREIGHT`, `BLOCKCHAIN`, `ASIA-PACIFIC`, `GREEN-LOGISTICS`, `WAREHOUSING`; When I click `FREIGHT`, Then the URL is `/en/news?tag=freight`.
- NA-16: Given the promo has no file, When the page loads, Then the DOWNLOAD PDF button and the promo card are absent; Given it has a file, Then the button is a link with `href` equal to the asset URL and the `download` attribute.
- NA-17: Given "Industry Insights", When the page loads, Then it shows eyebrow `Latest Briefings`, heading `Industry Insights` and exactly 3 cards, none of them the current article, newest first, each with image, title, author, `Comments (NN)` and `Read More`.
- NA-18: Given a related card, When I click its title or `Read More`, Then the URL becomes `/en/news/<that slug>` and its article page renders.
- NA-19: Given the CTA, When I click `CONTACT SALES`, Then the URL is `/en/contact`; When I click `REQUEST A FREE QUOTE`, Then the quote form on the Home page is shown (`/en#quote`).
- NA-20: Given the whole page, When I list all `a[href]`, Then none has href `#` or empty.
- NA-21: Given keyboard only, When I press Tab from the top, Then focus visits breadcrumb links, article tag links, the search input and button, category links, trending tag links and related card links in order, each with a visible focus ring.
- NA-22: Given widths 1280 and 1024, When the page loads, Then the sidebar is to the right of the article (its left edge > the article's right edge) and `document.documentElement.scrollWidth <= innerWidth`.
- NA-23: Given widths 768 and 428, When the page loads, Then the sidebar is below the article (sidebar top >= article bottom) and `scrollWidth <= innerWidth`.
- NA-24: Given width 320, When the page loads, Then `scrollWidth <= innerWidth` and the feature block, tags and cards stay inside the viewport.
- NA-25: Given width 428, When "Industry Insights" is visible, Then the related cards follow the same layout as the Home news block at 428 (same component), and swiping or scrolling inside the block does not scroll the page horizontally.
- NA-26: Given width 428, When I open the hamburger, Then the shared mobile menu opens (Esc closes it) and the page body does not scroll while it is open.
- NA-27: Given the page, When rendered, Then no element for share buttons, previous/next, comment list or comment form exists (until OQ-11 / OQ-10 are approved).
- NA-28: Given the contract tests, When `lib/cms` returns the fixture article, Then it parses with the extended `News` Zod schema (blocks array, `category`, `tags`) and all existing news fixtures still parse.
- NA-29: Given a locale `vi` request for a record with only `en` translations, When read, Then it falls back to `en` and does not throw.
- NA-30: Given viewport 1920, When the full page is captured, Then the full-page pixel difference vs the export is <= 3%.

## 7. Design anomalies and open questions

Anomalies
- A-1: Header shows HOME as the active tab on an inner page; rule says current page. Build NEWS active.
- A-2: No date, author, category, share, previous/next or comments on the article page; the list page shows date and category (`MAY 15, 2024`, `INNOVATION`). These are data for the list only; page stays as designed.
- A-3: Stat label `ON-TIME RATE` is blue on a blue tile, contrast far below WCAG AA (requirement: no AA failures). Proposal: keep the design color for the diff but expose the text accessibly; or ask owner to lighten it.
- A-4: Stat labels read at normal contrast only for `ACTIVE UNITS`.
- A-5: The thin grey band after the related cards differs from the page white and from Home's `#F5F5F5`.
- A-6: The hero title in the design is the same on the News list page (copy-paste) and the list page shows two hero banners; irrelevant here.
- A-7: Typos kept: `solarintegrated`, `Malborne`.
- A-8: Three different text styles: Inter body, a geometric display face for H2 and feature title (not in Home tokens).
- A-9: Blockquote and lead use straight quotes (`"`), not typographic.

Open questions (each with a recommendation)
- OQ-1: Slug of the design article? Recommend `implementing-ai-driven-predictive-routing`.
- OQ-2: Author and comment count of this article (list shows none)? Recommend null/hidden; ask the owner.
- OQ-3: Cover is a placeholder cartoon; real cover? Recommend using the design crop as fixture and replacing later.
- OQ-4: Display font for H2/feature title (looks like Plus Jakarta Sans/Outfit)? Guardrail: no external fonts without asking. Recommend self-hosted Inter with weight 600, log as deviation, or ask for the font name from Figma.
- OQ-5: Is the globe image in the feature block decorative? Recommend `alt=""`.
- OQ-6: Numbers in the feature block (`99.8%`, `12k`, `22%`, `60-page`, carbon neutrality 2035) are in the design but unverified marketing claims. Recommend the owner confirms before launch.
- OQ-7: Category counts `12/08/24/05` in the design vs real computed counts (fixtures have few articles). Recommend computed.
- OQ-8: Is there a real "Annual Logistics White Paper 2024" PDF? Recommend hide until supplied.
- OQ-9: Excerpt / meta description for this article is not in the design. Recommend the lead paragraph as excerpt.
- OQ-10: Comments: recommend defer (section 3). Needs owner decision.
- OQ-11: Share links, copy link and previous/next are required by `docs/requirements.md` "if the design shows it"; the design does NOT show them. Recommend not rendering them in M2 (no design deviation); owner may approve adding them (patterns in section 4).
- OQ-12: Tag/category/search targets point to `/en/news?...`; the News list spec must support `q`, `category`, `tag` (and pagination `page`). Needs to be reflected in `docs/pages/news.md`.
- OQ-13: Which hero image is used on inner pages (shared asset)? Need the file id from the Contact/News hero spec.
