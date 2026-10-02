# About Us (desktop 1920) — measured values

Source: `design/exports/about-us/desktop-1920@1x.png` (1920x6182, no x offset). Full-page difference (`scripts/cmp.py`): 2.83 %, equal height. Playwright visual test: 1.67 %.

## Colours
navy `#2F439B` (headings), brand `#2740CD` (intro View Services, Read More), nav `#3851DD` (hero button), red `#DE2627` (eyebrows, outline icons), badge/circle red `#DF1118`, core-value icon orange `#FB461B`, capabilities band `#F5F6FF`, vision band `#212F93`, TEAMWORK card `#0F1F8C`, value-card border `#E3E3E3` (2 px), values band: gradient `#F4F7FF` (y 3025) to white (~4700), partners on white.

## Vertical bands (y, px)
Hero 0-799 · intro 800-1621 · capabilities 1622-2345 (cards 299x261 at x 326/649/972/1295, y 1711/1996, gap 24) · vision/mission 2346-3024 (card x 322-1598, y 2490-2880, divider x 843) · core values 3025-~4700 (rows y 3255-3643 / 3664-4009 / 4030-4279 / 4300-4656, columns x 322-949 and 970-1597) · partners ~4700-5276 · CTA 5277-5640 · footer 5641-6182.

## Measured text sizes (differ from the spec's "~" values)
H1 75 px, subtitle 32 px, intro H2 56.5 px, body 20/30, capability title 24.7, detail 16; vision/mission title 39 px, text 23.8/38; core-value title 39 px, body 18.2/32 (SOT col 1: 15/29); badge "25+" 48 px, label 15.3, rating 22 px. Intro circle is 160 px at x 1444-1604, y 888-1048 (photo x 1070-1550, y 932-1488); badge x 1016-1275, y 1358-1524; red dot 90 px at x 1460, y 1297.

## Known differences
1. Images are cut from the export (`src/content/fixtures/pages/about/extract_images.py`): hero (text/header inpainted), intro photo, forklift, dotted world map (transparent PNG), vision background (card area inpainted, already navy-tinted so no overlay is added), TEAMWORK card photo (text inpainted). Replace with Figma originals (spec Q9).
2. Outline icons (warehouse, box-in-hand) are hand-drawn approximations.
3. Header: the design marks HOME active (spec A1); the page marks ABOUT, so the nav bar differs by design (about 0.3 % of the page). PAGES shows a caret, as on Home.
4. Capability card 6 is drawn in its hover state in the design; here hover only (shadow + 4 px navy bottom bar).
5. The shared Cta wrapper paints `#F5F5F5` in the top rounded corners (design: white).
6. Shared Footer/CTA differ from the export by about 0.6 % of the page, as on Home (Inter vs design font metrics).
7. "Read More" goes to `#core-values` on this page (spec Q5 open).
