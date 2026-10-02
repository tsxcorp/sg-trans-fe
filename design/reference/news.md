# News list (desktop 1920): measured values

Source: `design/exports/news/desktop-1920@1x.png` (1920x5107). Measured with scripts/bb.py, side.py, cmp.py.

## Bands (y)
Hero 1 0-495 · list area 495-2348 · hero 2 2348-2843 · Industry Insights 2843-4203 (cards 3122-3680, banners 3728-4083) · CTA 4203-4567 (364) · footer to 5107. (docs/pages/news.md says CTA 4240: wrong, measured 4203.)

## Values
- Hero titles: Inter bold 48/48 uppercase, tracking 1.07 px (caps y 254 hero 1, 2626 hero 2); breadcrumb 12 px, tracking 2.5 px, bullet gaps differ per separator (17/34 then 32/17 px).
- Grid: container 1280 at x 320; main 768, gap 128, sidebar 384 (2xl). Content starts y 596.
- Featured: cover 768x329, meta y 957, title 36/40 tracking -0.9, excerpt 16/26, divider y 1235. Rows: thumb 245, pitch 310 (gap 64), title 24/30, excerpt 14/23.
- Sidebar: search panel 596-752, categories header y 808 (rule 2 px #8091D2), rows 57 (text 4 px below centre), white paper 1108-1441 (title 24/30, text 14/22), tags header rule 1 px #0224A6, chips 32 high.
- Insights cards 413 wide (413/414/413, x 320/753/1187), image 382x277 r6, title 22/34 tracking 0.17, card min height 558. Banners 624x355, titles 30/36.

## Known differences
1. Header/CTA/footer are the shared (Home) components; the inner-page export draws a narrower header (bar x 348-1570) and different CTA text metrics: about 1.4% of the page.
2. Images are cuts from the export (hero backgrounds inpainted): `src/content/fixtures/pages/news/extract_images.py`. Home articles get list/related crops through `home-overlays.json`.
3. Category counts are computed (01/02/01/01), pagination shows 01 02 (6 archive articles), PREVIOUS disabled on page 1, active nav = NEWS.
4. White-paper title wraps "Annual Logistics / White Paper / 2024" (design breaks after "White"; the CMS text cannot carry the break).
5. Banner decoration shapes are CSS approximations; card comment icon is hand drawn.
6. Card 2 wrap "Full-/Scale" is forced by a 2.8 px right padding to match the design wrap.
Measured: 2.69% differing pixels (scripts/cmp.py), equal height 5107.
