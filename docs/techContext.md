# Tech Context

## Stack (M1)
- Runtime: Node 20.18 (on this machine), pnpm 10.
- Framework: Next.js (App Router, TypeScript strict). Version: latest stable at scaffold time, pinned in `package.json`.
- Styling: Tailwind CSS with design tokens as CSS variables (colours, spacing, radii, type scale read from Figma). Tailwind chosen because the design is a fixed grid of utility-sized blocks and tokens map 1:1.
- Validation: Zod (shared by form, `lib/cms` contracts and tests).
- Tests: Vitest (contract + unit), Playwright (screenshot diff vs `design/exports/`, form flow, keyboard focus).
- Lint: ESLint + `tsc --noEmit`.
- Data in M1: JSON fixtures in `src/content/fixtures/`, read only through `src/lib/cms`.
- Leads in M1: appended to `.data/leads.jsonl` (git-ignored) through `lib/cms.createLead()`. Notification email in M1 is written to the log, not sent.
- Later (M3): Directus (self-hosted, Docker is available locally), `@directus/sdk`, Postgres.

## Constraints
- Fidelity: ≤ 3% pixel difference to the exported Figma frame at 1920px (Home); same method at 428px.
- Values come from Figma exact reads (right panel via the logged-in browser) or the exported PNG. Figma MCP is out of quota on the free plan (20 calls/month).
- No third-party scripts, fonts from external hosts, analytics or trackers (decision: none).
- Images: `next/image`, files served from `public/fixtures/` in M1; Directus assets later through `assetUrl(id)`.
- Servers A and B are unknown, so nothing deploys in M1.

## Decisions (with reason)
- Next.js App Router, `[locale]` segment with only `en` enabled — Vietnamese becomes content work later, not a restructure.
- All text from `translations[]` + a message file for UI labels — no hard-coded strings in components (requirement S2).
- `lib/cms` is the only door to data (fixtures now, Directus SDK later) — components never import fixtures or the SDK.
- Fixtures mirror Directus shape: `id`, `status`, `sort`, `date_created`, `translations[]`, images as file UUID — so attaching Directus does not change components.
- Publishing by `status` field (`published` / `draft` / `archived`), no approval flow — user decision; set up in Directus later.
- Lead stored first, then notify — so a failed email never loses a lead.
- Playwright screenshot diff as the fidelity oracle — objective, repeatable.
- Tailwind v4-style tokens as CSS variables — one place to change colours/spacing after reading Figma.
