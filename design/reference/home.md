# Home (desktop 1920) — measured values

Source: `design/exports/home/desktop-1920@1x.png` (1920x5208), measured with `design/reference/_work/m.py` and `scripts/bb.py`.

## Colours
| Token | Value | Used for |
|---|---|---|
| navy | `#2F439B` | headings, nav bar, body accents, stats text |
| brand | `#2740CD` | quote card header, buttons |
| nav (active tab) | `#3851DD` | active HOME tab |
| red | `#DE2627` | eyebrows, icons, red CTA, "Sign up" |
| red-dark | `#CD2727` | news "Read more" (active) |
| page | `#F5F5F5` | grey body |
| ink | `#404040` | header address |
| muted | `#6E6E6E` | news sub text |
| line | `#E5E5E5` | input borders |
| CTA gradient | `#2980F6` → `#053FB2` | CTA band |
| footer gradient | `#1328A0` → `#153EA6` | footer |
| bottom bar | `#98C2F9`, social circles `#1E40EA` | copyright bar |

## Vertical bands (y, px)
Hero + header 0–880 · white (quote card 721–1345 overlaps) 881–1488 · stats photo band 1489–1921 (cards overflow to 2053) · grey 1922–4302 · CTA 4303–4666 (top radius ≈ 64) · footer 4667–5141 · copyright bar 5142–5207.

## Key sizes
- Header: container x 314–1605 (1292 wide). White bar 72 high, nav bar 56 high (bottom radius ≈ 16). Nav item padding 34 px, HOME tab x 368–481.
- Hero title: Inter bold ≈ 75 px, subtitle ≈ 31 px, buttons at y 535.
- Quote card: x 370–1549 (1180 wide), y 721–1345, radius 24. Header 109 high. Form column x 394–925; inputs 50 high, pitch 65, radius 8, border `#E5E5E5`. Button 65 high. Photo 580x509 at the right.
- Stats: cards 212x263 at x 382 + 236·i, circle 110 px; number ≈ 45 px bold, label ≈ 18 px / 36 line.
- Services: cards 454x469, gap 24, x from 16. Headings ≈ 56–58 px bold.
- News: cards 380 wide, gap 20, equal height (≈ 559), padding 16, image 348x278, title 22 px / 36 line.
- Footer: columns at x 673 / 984 / 1181 / 1435; about text x 371, width ≈ 285, line 24.

## Known differences from the design (deliberate or unavoidable)
1. **Images are cut from the export, not the originals.** Hero, stats band and service cards are inpainted so text can be live HTML (small smears may remain). The Warehousing card has no visible photo in the export: a placeholder gradient is used. Replace with originals exported from Figma / uploaded to Directus.
2. **Icons are close approximations** (hand-drawn SVG), not the Figma icon set.
3. **Hover states shown by default in the design**: service card 3 ("Warehousing") and news card 1 are drawn in their hover state. They are the default-active card here (`data-active`), and hovering another card switches the highlight.
4. **Design typos kept**: "Compnay name", "Freight Fowarding", "we will be send you an offer", "Malborne".
5. **Font**: Inter variable (v4, optical size fixed). Design widths differ by ≈ 1–3% in places, so some sizes are fitted per element (e.g. 57–58 px for 56 px headings, 75 px hero title).
6. The design shows the hint "Please enter your request here…" but has no message input: no textarea is rendered (open question 6).
7. Mobile (428px) and the six other pages are not built yet.
