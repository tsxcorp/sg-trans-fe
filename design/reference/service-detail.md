# Service Detail (desktop 1920) — measured values

Source: `design/exports/service-detail/desktop-1920@1x.png` (1920x5478). Render with `PAGE=service-detail DEVICE=desktop-1920 node scripts/shot.mjs /en/services/logistic-service`, compare with `design/reference/_work/cmp2.py`.

## Result
Full-page difference (RGB-sum > 75): 3.45% (header and footer account for 0.8%: shared blocks, they differ from this design frame); `tests/visual/services.spec.ts` (pixelmatch 0.1): 2.77%. Equal height 5478 (the Why section is 882 px so the 364 px shared CTA ends where the design's 362 px band ends).

## Vertical bands (y)
Hero 0–495 · intro 495–1567 · process 1567–2185 · expertise 2185–3120 (`#021150`) · features 3120–3691 (`#F1F5F9`) · why 3691–4575 · CTA 4575–4937 · footer 4937–5478.

## Colours
navy `#2F439B`, blue `#0224A6` (tiles, Need Help card, links), dark navy `#0A1A6B` (IMPORT FLOW, card labels), border `#E2E8F0`, text `#475569`, active red `#E11D1D`, orange `#FF5B0A`, band `#021150`.

## Sizes (Inter, fitted by width)
H1 50 (centered at x 960), subtitle 14 uppercase, tracking 1.3 px, centered at x 890 (the design centres it left of the title) · intro H2 56 / 67, paragraph 18 / 29.3 (first line indented 5 px as in the design) · KEY HIGHLIGHTS 21.4 tracked · Related title 17.8, rows 14.2 · Need Help title 19.8, text 14.4, phone 17.8 · IMPORT FLOW 52, subtitle 19.6 · card label 18 · expertise H2 58.8 / 77, text 22 / 37, number 36, label 15.8 · card title 30 · features H2 55.5, card title 19.8, text 15.9 · why H2 55.4, text 17.9, benefit title 16, text 13.8.

## Layout notes
- Container 1292 (x 314..1605): main column x 352 (848 wide), sidebar x 1248 (320). Key Highlights box 352..1200 x 954..1448, tiles 64 x 64 (2 px `#0224A6` border, 4th filled), illustration bottom-aligned inside the box.
- Process cards 239 / 237 / 240 / 230 wide at x 315 / 668 / 1005 / 1367 (the design is unequal: reproduced from xl), 190 high, connectors with a dot 17 px before the next card.
- Expertise: from 2xl (>= 1536) side by side (left column 430, cards 341 / 339 / 339, gap 17); below 2xl the text is on top and the cards in a row of 3 (carousel below 768). Cards are CMS images (3D art on the glass card, badge and title removed) with live badge, icon, title and rule scaled with container query units.
- Why: collage columns x 320 / 628 (292 wide), photos 292, 390, 389, 293 high, offsets 3787 / 3819, gaps 16 / 15.

## Known differences
1. Images cut from the export (hero, illustration, 3 expertise cards, 4 photos, map, forklift): see `file-ids.json`.
2. Icons: lucide approximations (the process icons are bold filled two-colour art in the design).
3. Fonts: Inter instead of the geometric display font used for headings in the export.
4. The shared header (SERVICES active, PAGES chevron, social icons) and footer (the design footer of this frame has links 5 px lower and a different newsletter box position) differ from the export.
5. The 4 existing services other than `logistic-service`, and every child card, use the same template with default sample blocks (`detail-default.json`, texts marked "Sample text"; no numeric claims).
