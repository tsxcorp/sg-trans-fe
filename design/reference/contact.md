# Contact (desktop 1920): measured values

Source: `design/exports/contact/desktop-1920@1x.png` (1928x5845). **The export has a 4 px black strip on each side: the 1920 frame is x 4..1923.** Frame x = export x - 4; y is the same. All values below are frame coordinates.

Comparison (`scripts/cmp.py` reads the export without the offset, so it is not used): crop the export to `design/reference/_work/contact-frame.png` (`im.crop((4, 0, 1924, h))`), then `design/reference/_work/{cmp_c,bb_c,side_c,rows_c}.py` (copies of the shared scripts pointing at the cropped frame; `c.sh shot|cmp|side|bb|rows`). `scripts/` is untouched.

## Colours
| Token | Value | Used for |
|---|---|---|
| navy | `#2F439B` | headings, office phone |
| deep blue | `#0224A6` | hours band, card top borders (rows), panel left borders, card emails |
| red | `#DE2627` | eyebrow, top-card border, notice label, hours icons |
| ink | `#1A1B23` | names, values, small labels |
| text | `#444654` | addresses, ext, person lines |
| muted | `#757685` | caps labels |
| caption | `#94A3B8` | "Mon-Fri", form labels |
| placeholder | `#6B7280` | form placeholders |
| field line / divider | `#E2E8F0` / `#334155` | form underline / hours divider |
| info card / panels | `#F4F2FD` / `#EEEDF7` | lavender blocks |
| grey section | `#F8F8F8` | Key Logistics Contacts |
| clock watermark | `#1B3AAF` (stroke 12) | hours band |
| connector | about `#CCCCDB`..`#D2D2DF` (1.5-2 px) | org chart lines |

## Vertical bands
Hero 0-838 · offices 838-1388 · hours 1388-1799 (band 1388-1681, forklift 1436-1799) · leadership 1799-2935 · operations 2935-3506 · quote band 3506-4407 (card 3602-4310) · partners 4407-4942 · CTA 4942-5304 (362 high) · footer 5304-5845. Page height 5845 (equal to the design).

## Key measurements
- Container 1280 at x 320..1600; quote card and Operation panels 1232 at x 344..1576.
- Hero: title cap top 275 (75 px bold), subtitle cap top 393 (31 px), primary button 759..1029 x 514..577 (271x64), icon square 27x28.
- Offices: H2 cap 963-991; entries label/address rows 1028/1054 and 1096/1122; info card 320..928 x 1188..1312, 8 px left border; map 992..1600 x 956..1356; chip 1414..1584 x 972..1020, 12 px bold caps.
- Hours: band 320..1600 x 1388..1681 `#0224A6`; cards at x 368 and 694; divider x 1020 (1 px, y 1436-1632); notice x 1069; clock 108 px at x 1460, y 1420.
- Leadership: eyebrow 20 px italic underlined; H2 56 px; top card 778..1142 x 2086..2307 (5 px red top border); connectors 2 px (vertical 959-960, horizontal y 2340-2341, drops at the column centres); row 1 cards 286 wide at x 321, 652, 983, 1314, tops 2376 (3 px blue border), height 197; row 2 top 2608.
- Operations: H2 56 px, left x 345; panels 600x200 at x 344 and 976, y 3178; columns at +40 and +304 from the panel edge.
- Quote: band `#0F2A9B`-like photo; card 344..1576 x 3602..4310; form column x 393..910 (fields 246, gap 25, pitch 92, underline 1 px at 3824/3916/4008/4140); button 393..910 x 4189..4244 gradient `#0224A6` to about `#2A42BD` with a soft blue shadow; photo half 960..1576; overlay card 1008..1528 x 4113..4262 (frosted white about 80 %).
- Partners white band, eyebrow y 4534, H2 4581, logos 4693-4783 (same 7 logos as Home).

## Images (all cut from the export by `src/content/fixtures/pages/contact/extract_images.py`)
| File | Source region (frame) | Notes |
|---|---|---|
| hero | 0..838, full width | header, title, subtitle, buttons inpainted; the navy overlay is baked in (no CSS overlay) |
| map | 992..1600 x 956..1356 | the hub chip is inpainted (live HTML); a Google-style capture, licence open (spec OQ 6) |
| world-dots | 1400..1920 x 880..1580 | card area painted white (the map card covers it) |
| forklift | 0..284 x 1436..1799 | washed grey on white |
| quote-bg | full width x 3506..4407 | card area filled by a heavy blur (the card hides it) |
| quote-photo | 960..1576 x 3602..4310 | dark-blue gradient baked in; overlay card inpainted (live HTML) |
Original photos are not available: replace with the Figma exports when they exist.

## Result
Full-page difference at 1920: 1.94 % (threshold 3 %), page height equal (5845). Biggest remaining areas: the shared header (design header is 1224 wide with HOME active, the shared one is 1292 wide with CONTACT active) and the shared footer (the Contact design draws a different footer variant, see below).

## Known differences
1. **Header**: shared component. Design draws HOME active (design error) and a 1224 px wide container; the build marks CONTACT active and uses the shared 1292 px header.
2. **Footer**: the Contact frame shows a footer variant that differs from Home's (vertical gradient to a lighter blue at the bottom, newsletter row at other positions, checkbox beside the consent line). The shared footer (matched to Home) is used.
3. **Fonts**: Inter only. The geometric display font of the design (H2 SAIGONTRANSERVICE, hours titles and times, Kinetic Efficiency, person names) is replaced by Inter with fitted size and tracking (H2 36 px with -0.03 em tracking, times 29 px with -0.04 em).
4. **Intro sentence of the form** is neutral ("Tell us about your project and our team will review it and get in touch.", messages file): the design's "respond within 4 hours" is not shown (build guide decision 2).
5. **Map**: static image linking to a maps search for the main office address in a new tab (`map_open_url`, built from the address in the design, sample); no iframe, no third-party request. `map_embed_url` is null.
6. **Icons** are hand-drawn approximations; the dotted map and forklift are raster cut-outs.
7. Truncated emails (Khoa Pham, Nhu Quynh, Huong Nguyen) are completed by the pattern `@saigontrans.com.vn` (sample; spec OQ 2). Design typos kept ("17:00hour", "depending on a", "SAIGONTRANSERVICE").
8. The CTA band is a local copy (`ContactCta`) of the shared one: both buttons jump to the quote form; it also matches this frame's slightly different sizes (25 px / 20 px labels, 4 px corners, 362 px high).
9. Below 480 px the form fields stack in one column (the select label "Select Logistics Service" is clipped in two columns at 428); the spec said 400.
