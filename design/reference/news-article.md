# News article (desktop 1920): measured values

Source: `design/exports/news-article/desktop-1920@1x.png` (1920x4148).

## Values
- Grid: article 864 (cover 861x329 at y 575), sidebar 384, gap 32. Body starts y 956.
- Lead 24/32 weight 500 #1A1B23; H2 30/36 bold (design uses a geometric display face, replaced by Inter, tracking -0.2); paragraph 16/26 #444654; quote bar 8 px #0224A6, text 24/32 semibold, left padding 32.
- Feature block x 320-1184, y 1300-1662: padding 48/16, title 24/30, text 14/20 #94A3B8, stat tiles 80 high (bar 4 px #0224A6 / #64C2FE), image 266x266.
- Tags: divider y 2143, chips 30 high at y 2176. Industry Insights eyebrow y ~2422, cards 2566-3124, CTA at 3243.
- Related cards use `related_image` crops (the article frame crops the photos slightly differently from the list frame).

## Known differences
1. Shared header/CTA/footer differ from this export (see news.md): ~1.6% of the page.
2. Stat label ON-TIME RATE is #8AA0FF instead of the design's illegible #0224A6.
3. The white-paper card is rendered as a disabled button (no PDF) instead of hidden (build-guide decision 5).
4. Category counts computed; H2 and feature title use Inter instead of the display font.
Measured: 3.30% differing pixels (scripts/cmp.py), equal height 4148; the tests/visual metric reports 2.04%.
