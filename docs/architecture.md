# Architecture / Spec

> Source of truth. Derived from `docs/requirements.md`. Fix this file before changing code.

## System boundaries
- **Inside:** Next.js app (pages, components, `lib/cms`, quote-form server action, fixtures, tests).
- **Outside (later):** Directus (content + leads), email provider, hosting (servers A/B). In M1 these are simulated by fixtures, a JSONL file and a log line.
- **Never inside M1:** analytics, maps API, CRM, tracking, auth.

## Folder layout
```
sg-trans/
├── docs/                         requirements, architecture, techContext, progress
├── design/exports/<page>/        Figma PNGs     design/reference/<page>.md   measured values
├── plans/                        plan.md + phase files, reports/
├── src/
│   ├── app/[locale]/             routes (en only in M1): page.tsx = Home
│   ├── app/api|actions/          quote form server action
│   ├── components/<section>/     Header, Hero, QuoteForm, StatsBand, Services, Partners, News, Cta, Footer
│   ├── lib/cms/                  index.ts (interface), fixtures.ts (M1), directus.ts (M3), assetUrl.ts, schema.ts (Zod)
│   ├── lib/i18n/                 locales.ts, messages/en.json
│   ├── content/fixtures/*.json   services, news, stats, partners, offices
│   └── styles/tokens.css         design tokens read from Figma
├── public/fixtures/              images referenced by file id
├── tests/                        contract/, e2e/, visual/
└── .data/                        leads.jsonl (git-ignored)
```

## Core entities (see Zod in requirements.md)
Service, News, Stat, Partner, Office, Lead — each with `id`, `status`, `sort`, `date_created`, translated text in `translations[]`.

## Contracts

### `lib/cms` (the only data door)
| Function | Input | Output | Rules |
|---|---|---|---|
| `getStats(locale)` | locale | `Stat[]` | only `status=published`, sorted by `sort`, label in locale with `en` fallback |
| `getServices(locale)` | locale | `Service[]` | same |
| `getPartners()` | — | `Partner[]` | same |
| `getLatestNews(locale, n)` | locale, n≥1 | `News[]` | published, newest first, at most n |
| `getOffices(locale)` | locale | `Office[]` | published |
| `createLead(input)` | `LeadInput` | `Lead` | validates, stores, sets `email_status=pending` |
| `assetUrl(fileId)` | uuid | string URL | M1 → `/fixtures/<id>.<ext>`; M3 → Directus `/assets/<id>` |

Any function returns `[]`/`null` for missing data and never throws on a missing translation.

### Quote form (server action `submitQuote`)
- Input: `LeadInput` (requirements.md). Output: `{ ok: true } | { ok: false, errors: Record<field,string> }`.
- Order: honeypot check first (`website` filled → return `ok:true` silently, store nothing) → validate → rate limit (5 accepted per IP per 10 min, the 6th is rejected; only validated submissions count; IP from `x-forwarded-for`, only trustworthy behind a proxy that sets it) → `createLead` → `notify(lead)` → return. Rate-limit error is returned under the key `form`.
- M1 storage: `NODE_ENV=test` keeps leads in memory; otherwise one JSON file per lead in `.data/leads/`. `@/lib/cms/testing` (test-only) exposes `listLeads()`, `resetLeads()`, `setMailTransport(fn)` so tests can observe stored leads and email results.
- `notify` failure: set `email_status=failed`, log, still return `ok:true`.

## Key flows
1. **Render Home:** `[locale]/page.tsx` → `getStats/getServices/getPartners/getLatestNews` → sections → HTML. Pages are static; revalidated by Directus webhook in M3.
2. **Submit quote:** form → `submitQuote` → validate → anti-spam → store lead → notify → success state.
3. **Add Vietnamese (later):** enable `vi` in `locales.ts`, add `messages/vi.json`, fill `translations[]` with `languages_code: 'vi'`. No component changes.
4. **Attach Directus (M3):** implement `directus.ts` with the same interface, switch by `CMS_DRIVER=directus`.

## Invariants / rules
- Components never read fixtures or the Directus SDK directly.
- No text literal in components; text comes from `translations[]` or the message file.
- A Lead is stored before any email is attempted.
- Draft and archived records never reach a public page.
- Every deviation from the Figma design is logged in `docs/progress.md`.
- Home visual diff ≤ 3% at 1920px and at 428px (proposed threshold).

## Traceability (requirement → spec)
| Requirement | Where in this spec |
|---|---|
| S1 faithful Home | Folder layout (components, tokens), Invariants, tests/visual |
| S2 language-ready | `lib/i18n`, `translations[]`, flow 3 |
| S3 quote request | Quote form contract, `createLead`, flow 2 |
| S4 editable by manager | Fixtures mirror Directus, `lib/cms`, flow 4 |
