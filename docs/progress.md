# Progress Log

## 2026-10-02
- Done: ck:kickoff Phase 0 (greenfield check) and Phase 1 (ck:ba, `--fast`: 1 researcher, 3 question rounds). Folder structure created. Figma Home desktop exported to `design/exports/home/desktop-1920@1x.png` (1920x5208). `docs/requirements.md` approved with edits. Phase 2 drafts: `techContext.md`, `architecture.md`, `CLAUDE.md`.
- Next: user approves `architecture.md`. Then Phase 3 (`ck:plan`), Phase 4 (spec-blind tests), then build Home.
- Decisions:
  - English first, Vietnamese later (changes the earlier "both at launch" decision) — user chose to ship the frontend first.
  - Publish by Directus `status`, no approval step.
  - Stats, email, logos: sample values; real values before launch.
  - Directus licence: user states under both thresholds; text to be re-checked before install.
- Spec changes: none yet (first draft).
- Deviations from Figma: none yet.
- Environment notes: Figma MCP out of quota (Starter plan, 20 calls/month). Reading exact values through the logged-in browser pane works; copy-to-clipboard is blocked.

## 2026-10-02 (build start)
- Spec corrections (found while reading the design again): the Figma form has NO message input. Requirements fixed: required = first name, last name, email, phone; `message` optional and not rendered. Order in `submitQuote` changed to honeypot → validate → rate limit. Added test-only hook `@/lib/cms/testing`.
- Tooling: pnpm store moved out of the repo (`~/.local/share/pnpm-sg-trans`, via `.npmrc`) because it made the secrets guardrail test scan third-party packages. Vitest config is `vitest.config.mts` (Vitest 5 needs ESM).
- Design typos kept as-is for fidelity ("Compnay name", "Freight Fowarding", "we will be send you an offer"). Listed here so they can be fixed in Figma and code together.
- Spec change: News contract gained optional `author` and `comments_count` (the design's news card shows author and "Comments (03)").

## 2026-10-02 (Home desktop built)
- Done: scaffold (Next 16, Tailwind 4, Vitest 5, Playwright), Zod contracts, `lib/cms` + fixtures (Directus-shaped), `submitQuote` (honeypot → validate → rate limit → store → notify), locale routing (`/en`, proxy redirect), all 9 Home sections at 1920px. Fidelity tooling: `scripts/shot.mjs`, `scripts/cmp.py`, `scripts/side.py`, `scripts/bb.py`, `scripts/rects.mjs`.
- Result: full-page pixel difference vs `desktop-1920@1x.png` went 38.3% → 2.95% (tool metric: >25 per channel). Page height matches (5208).
- Contract tests: 186 passing (`pnpm test`). Visual and e2e: see next entry.
- Next: phase 5 (mobile 428px, needs the Home mobile export), more polish on header/hero/stats/news/footer text, e2e + quality gate.
- Deviations from Figma: see `design/reference/home.md` ("Known differences").
- Spec change: stats `as_of` stays in the data contract but is not rendered (design has no date).

## 2026-10-02 (quality gate, Home desktop)
- `pnpm typecheck` clean, `pnpm lint` clean, `pnpm test` 186/186.
- Playwright: 13 passed, 1 failed ("no horizontal scroll at 428px": mobile layout not built), 1 skipped (428px visual diff, waits for mobile).
- Visual diff at 1920px: 2.148% of pixels (limit 3%). Exported `design/exports/home/mobile-428@1x.png` (428x4021) for the next phase.
- Roles: tests written by a separate subagent from `requirements.md` only; code by me; review by a third subagent (report pending at time of writing).
- Next: apply review findings, then phase 5 (mobile 428px).

## 2026-10-02 (independent review applied)
- Reviewer (separate subagent, read-only) found 0 critical, 4 high. Fixed: (1) service/news cards were unreachable by keyboard → panels stay in the DOM, stretched link per card, highlight moves on hover/focus; (2) rate limit used the forgeable first `x-forwarded-for` entry → last entry, loose shared bucket for unknown clients, pruning and size cap; (3) React 19 reset the form after a validation error → submitted values are echoed back and kept; (4) server error strings were hard-coded → loaded from `messages/<locale>.json` (`quote.errors`).
- Also fixed: storage failures no longer crash the action and never fail the visitor after the lead is saved; `LEADS_DIR` env + file modes 0600/0700 and no wipe of the default folder; trim + phone format in the schema; field-level translation fallback; scheduled news hidden; one `<main>`, skip link, localized metadata, aria-labels from messages; `Object.hasOwn` for icon names; server-action body limit 100kb; no provider error text in logs.
- Gate after fixes: typecheck clean, lint clean, 186/186 contract tests, e2e 13 pass / 1 fail (428px scroll, mobile not built), visual 1920px 2.16% (limit 3%).
- Deferred on purpose (not blocking M1): honeypot is named `website` as the spec and tests require (browser autofill could fill it: revisit with a time-to-submit check); newsletter form in the footer is a visual placeholder (no handler); nav/footer links are `#`; Directus-readiness items (revalidation tags, ids of images hard-coded in components, header/footer contact data from the Office collection, single source for locales); proxy uses 307 (switch to 308 when stable); set `serverActions.allowedOrigins` when the real domain is known.

## 2026-10-02 (M1b responsive shell, M2 kickoff)
- Done by the lead: responsive Home (phones < 768 follow the mobile design structurally, tablets derived, >= 1280 = the 1920 design in fixed-width centered containers; 1920 diff stays 2.15%, no horizontal scroll at 14 widths); header with hamburger menu, PAGES dropdown, language switcher, route-aware active item; footer with tabs on phones and a working newsletter sign-up (server action, subscriber store, honeypot, rate limit); shared `Carousel`, `PageShell`, 404 page, Privacy Policy and Terms pages (draft text, needs counsel review); Lead extended with `service_type`, `estimated_volume`; exports of all 7 Figma pages in `design/exports/`.
- Process: 6 spec writers (read-only) produced `docs/pages/<page>.md`; `docs/pages/_build-guide.md` fixes ownership and the default decisions; 5 test authors (spec-blind) and 4 builders (about, contact, services, news) work in parallel; the lead reviews and merges.
- Design inconsistencies found: the mobile Home frame has other numbers (35+ warehouses, 853+ engineers, 55+ countries, 40+ services), other service names and no CTA band compared to desktop; every inner page draws HOME as the active tab; the News frame stacks two heroes; forms on Contact/Services promise a 4-hour reply (not shown, earlier decision).

## 2026-10-02 (all pages built, reviewed, gate)
- Done: About Us, Contact, Our Service, Service Detail, News, News Article built from `docs/pages/*.md` by separate builders, each with its own spec-blind tests. Every page is responsive (phones < 768, tablets, >= 1280 = the 1920 design); no horizontal scroll at the 14 checked widths.
- Fidelity at 1920 (limit 3%): Home 2.15, About 1.67, Contact 1.35, Services 1.93, Service Detail 2.77, News 1.67, News Article 2.04.
- Gate: typecheck clean, lint clean, Vitest 397/397, `pnpm build` OK (all routes prerender), Playwright 418 passed / 1 skipped (428px Home pixel diff: the mobile frame differs from desktop, no pixel gate by decision).
- Independent review (read-only): 0 critical/high, 17 medium/low. Fixed: `source` field allow-list (`Object.hasOwn`), email max 254, rate limiter evicts oldest keys instead of clearing all counters, submitted values echoed on every rejection path (validation, rate limit, storage), `metadataBase` from `SITE_URL`, mobile menu closes on any link click and when the viewport reaches xl.
- Still open from the review (low): atomic duplicate check in the subscriber store, https-only `z.url`, href allow-list review in `rich.ts`, carousel dots 44 px target, footer tab a11y labels, LanguageSwitcher ARIA, brand strings via messages, 307 vs 308 for `?page=999`.
- Design inconsistencies kept as drawn: desktop vs mobile Home numbers/service names, HOME active tab on inner pages (route-aware instead), double hero on News, "respond within 4 hours" copy not shown.
- Not built: Vietnamese, Directus, deployment, real email, real social links, share/comments/prev-next on articles (not in the design).
