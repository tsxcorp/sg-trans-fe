# SG Trans — Working Rules

- Spec is source of truth: `docs/architecture.md`. Fix spec before code. Intent: `docs/requirements.md`.
- Guardrails (from `docs/requirements.md`):
  - Ask first on: any deviation from the Figma design, adding form fields, third-party scripts or external fonts, anything that sends data outside the project, installing Directus or touching a server, changing the locale URL scheme, privacy wording.
  - Never: commit secrets or `.env`, weaken or delete a test to pass, send real email from tests, hard-code content strings in components, load maps or trackers before consent, invent certifications, client names, addresses or numbers.
- Data goes through `src/lib/cms` only. Components never import fixtures or the Directus SDK.
- Design values come from Figma exact reads or `design/exports/`, never from eyeballing. Record measured values in `design/reference/<page>.md`.
- YAGNI, KISS, DRY. Real implementation only — no fakes or mocks-to-pass.
- Separate roles: code-writer ≠ test-writer ≠ reviewer.
- Update `docs/progress.md` at the end of each session.
- Conventions: TypeScript strict, ESLint clean, components in `src/components/<section>/`, one folder per page under `design/exports/`. Commit format: `type(scope): message`.
- Language with the user: Vietnamese. Code, comments and docs: English.

@AGENTS.md
