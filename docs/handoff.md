# Handoff (read this first in a new session)

Project: SG Trans website. Folder: `/Users/pix/Documents/Mine/Draft/sg-trans`. Conversation language with the user: Vietnamese; code/docs in English.

## Read in this order
1. `CLAUDE.md` (rules, guardrails), `AGENTS.md` (this Next.js 16 differs from older docs: read `node_modules/next/dist/docs/01-app` before using a Next API).
2. `docs/requirements.md` (intent, milestones, actions), `docs/architecture.md` (spec), `docs/techContext.md`, `docs/progress.md` (what is done, decisions, deferred items).
3. `design/reference/home.md` (measured values, known differences), `design/exports/` (Figma PNGs).

## Roles (do not mix)
- Code writer = you. Tests = a separate subagent writing from `requirements.md` only (never from the code). Review = a third read-only subagent. Do not edit tests to make them pass; ask the test author.

## How to verify
`pnpm typecheck && pnpm lint && pnpm test` (Vitest), `pnpm test:e2e` and `pnpm test:visual` (Playwright, server on :3000 via `pnpm dev`). Fidelity tools in `scripts/` (see README). If Vitest says "Cannot find native binding": `CI=true pnpm install --force --config.confirmModulesPurge=false`.

## Figma access
MCP is out of quota (Starter plan). Read exact values and export PNGs through the logged-in browser pane (Claude Browser tools). Export: select the frame, Export section "+" then "Export <name>"; the PNG lands in `~/Downloads`, move it into `design/exports/<page>/`.

## Status board (update as you go)
See "Milestones" in `docs/requirements.md` and the latest entry of `docs/progress.md`.
