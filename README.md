# SG Trans website

Corporate logistics website (Saigon Trans). Next.js frontend first, Directus-shaped sample data, Directus CMS attached later.

## Folder map
| Path | What lives here |
|---|---|
| `docs/` | Memory Bank: `requirements.md`, `architecture.md`, `techContext.md`, `progress.md` (written by ck:kickoff) |
| `plans/reports/` | Research briefs and discovery notes (read-only history) |
| `design/exports/<page>/` | PNG exports from Figma, one folder per page, named `<device>-<width>@<scale>x.png` |
| `design/reference/` | Measured values read from Figma (tokens, spacing tables), one file per page |
| `src/` | Application code (created at build phase) |

## Design source
Figma file `gft0xcPOvoq9Hdz9qR0uG8`, page "SG Trans". Frames: Home (desktop 1920 + mobile 428), About Us, Contact, Our Service, Service Detail_Logistics, News, News Article.

## Run it
```bash
pnpm install            # first time (pnpm store lives outside the repo, see .npmrc)
pnpm dev                # http://localhost:3000  (/ redirects to /en)
pnpm typecheck && pnpm lint
pnpm test               # contract + guardrail tests (Vitest)
pnpm test:e2e           # Playwright, needs the dev/prod server on :3000
pnpm test:visual        # pixel diff of /en against design/exports/home/desktop-1920@1x.png
```
If Vitest says "Cannot find native binding", run `pnpm install --force` (an optional native dependency was dropped).

## Fidelity tools (`scripts/`)
`shot.mjs` full-page screenshot · `cmp.py` per-band diff · `side.py y0 y1 [x0 x1]` side-by-side · `bb.py x0 y0 x1 y1 [tol|white]` bounding-box deltas · `rects.mjs "<css>"` element rectangles · `extract_fixture_images.py` rebuilds the sample images from the Figma export.
