# Our Service (desktop 1920) — measured values

Source: `design/exports/our-service/desktop-1920@1x.png` (1928x7558). The export has a 4 px black stripe on each side: the frame is x 4..1923. For comparison it is cropped to x 4..1923 (`design/reference/_work/sv/os-full.png`; `scripts/cmp.py` cannot do the offset, `design/reference/_work/cmp2.py <render> <design>` can). Render with `PAGE=our-service DEVICE=desktop-1920 node scripts/shot.mjs /en/services`.

## Result
Full-page difference (differing pixels, RGB-sum > 75): 2.7%, equal height 7558. `tests/visual/services.spec.ts` (pixelmatch 0.1): 1.93%.

## Vertical bands (y, px, cropped frame)
Hero 0–519 · intro 519–1231 (white) · group 1 tiles 1231–2503 (`#F5F8FE`) · group 2 cards 2503–3377 (`#F8F8F8`) · group 3 photo grid 3377–4529 (white) · group 4 cards + lifecycle 4529–5218 (`#F8FAFC`) · quote 5218–6120 (`#102BA1` photo) · partners 6120–6654 · CTA 6654–7017 · footer 7017–7558. The shared CTA is 364 px high (design 363): the partners wrapper is 533 px so the total height is exact.

## Colours
navy `#2F439B` (headings), red `#DE2627`, grey text `#6E6E6E`, card title blue `#0224A6`, label navy `#0E2087`, text `#1A1B23`, tracker dashes `#F5E3E3` → `#DE3A3A`, orange `#FF6B00` (active/final step), quote button gradient `#0425A6` → `#2940BB`.

## Font sizes (Inter, fitted by text width; the design copy uses a geometric sans in places)
H2 of groups 55.6 · intro paragraph 16 / line 29 · stats number 37, label 15.6 · tile title 39 bold (line 59) · tile hover title 22.4 · freight card title 18.2 / summary 13 · tracker kicker 13, label 12 · warehousing title 24 / summary 13.7 · View Facilities 28 · ecommerce card title 20 / summary 13 · lifecycle title 24.9, row 15.8 · quote H3 25, subtitle 13.7, label 10 tracked, placeholder 13.9, button 12 tracked · caption title 23.7.

## Layout notes
- Tile grid x 32..1888, 3 + 2 cards (6-column grid, spans 2/2/2/3/3), card 469 high. Default card = icon (box in hand) + 39 px title bottom-left (inset 60 px); hover/active = white panel (blue 4 px bar, red title, summary, divider, Read More). Highlight by default: tile 2 (`data-active`).
- Freight header: eyebrow, H2 left, lead text right (text-right, width 560). Cards 405 x 207 at x 320 / 758 / 1195. Tracker 1184 wide, six columns, squares 80 x 75.
- Warehousing grid: 1 px `#F1F5F9` frame, cells 639 x 341 (+ 1 px line), photo with the blue gradient baked in.
- Ecommerce: cards 294 x 129 (2 x 2, gap 17), lifecycle box 605 x 277 with a 1 px `#0224A6` border.
- Quote card x 344..1576, y 5314..6022; fields pitch 92, label to underline 68.

## Known differences
1. Images are cut from the export (listed in `src/content/fixtures/pages/services/file-ids.json`, produced by `extract_images.py`). Text on photos is inpainted (hero, tiles, photo cells, quote photo): small smears remain under live text. Replace with Figma originals.
2. Icons are lucide approximations (the design has a detailed brain-gear and box-hand icon).
3. Header: SERVICES is active (design draws HOME); the shared header differs from the design in the PAGES chevron, social icons and logo.
4. Fonts: Inter instead of the geometric sans in groups 2–4 and the quote card.
5. The quote subtitle is neutral (no "respond within 4 hours"): "Our architects will analyze your requirements and get back to you soon."
6. The photo of the tiles is the same for all tiles of a row (as in the design); tiles 1–3 use the 618 px crop, tiles 4–5 the 928 px crop.
7. The design shows the Explore hover only on the Home pattern; "Explore The Services" is an in-page anchor to the first group (hash + focus on its H2).
