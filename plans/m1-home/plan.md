# Plan M1 — Home page (English), pixel-faithful

Spec: `docs/architecture.md`. Intent: `docs/requirements.md`. Every phase item traces to an entity or contract there.

| # | Phase | Output | Traces to | Done when |
|---|---|---|---|---|
| 1 | Scaffold | Next.js + TS strict + Tailwind + ESLint + Vitest + Playwright, folder layout | Folder layout | `pnpm dev`, `pnpm lint`, `pnpm test` run (empty) |
| 2 | Data layer | `lib/cms` (Zod schema, fixtures driver, `assetUrl`, `createLead`), `lib/i18n`, fixtures | Contracts, S2, S4 | contract tests green |
| 3 | Measure design | `design/reference/home.md` (tokens, spacing, fonts), Home mobile export, image assets exported | Invariant: values from Figma | tokens file + exports present |
| 4 | Desktop sections | Header, Hero, QuoteForm UI, StatsBand, Services, Partners, News, Cta, Footer at 1920 | S1 | visual diff ≤ 3% at 1920 |
| 5 | Mobile | Same sections at 428 | S1 | visual diff ≤ 3% at 428 |
| 6 | Quote form logic | `submitQuote` action, honeypot, rate limit, `notify` log | S3 | e2e form tests green |
| 7 | Fidelity loop | Compare, fix biggest diff areas, repeat | DoD | threshold met or deviation logged |
| 8 | Quality gate | tsc, lint, contract + e2e + visual, independent review | DoD | all green; review issues fixed |

## Rules for the loop (phases 4, 5, 7)
- Measure first (Figma right panel or PNG), then build, then diff. Never tune by eye.
- One section per iteration; commit-sized steps.
- Any difference that cannot be matched is logged in `docs/progress.md` under "Deviations from Figma".

## Risks
- Fonts in the design may not be freely available: read the font name in Figma, check availability, ask before substituting.
- Images in the design must be exported from Figma (permission already given; saved under `design/exports/`).
- 3% pixel threshold may be tight for photo-heavy areas: measure per section before judging.
