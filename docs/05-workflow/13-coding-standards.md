---
id: WF-STANDARDS
title: Coding standards
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-STACK", "WF-REVIEW"]
source_refs: ["Blueprint §4.6"]
---

# Coding standards

## TypeScript

| Rule | Detail |
|---|---|
| Strictness | `strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`; **no `any`** (use `unknown` + narrowing) |
| Imports | absolute aliases `@/…` for `apps/web/src`, `@temuunair/contracts`, `@temuunair/db`; no deep relative chains beyond two levels |
| Naming | `camelCase` values, `PascalCase` types/components, `SCREAMING_SNAKE_CASE` enums, `kebab-case` files for routes/components |
| Functions | small and pure where possible; services take explicit inputs, never `req` |
| Async | `async/await`; no floating promises (lint); errors are `Result`-like or thrown with typed codes |
| Validation | Zod at every boundary (route handler, job payload, form); parse, don't cast |
| Nullability | prefer `null` over `undefined` in API shapes; `undefined` only for optional params |
| Exports | named exports; default exports only for Next.js pages/layouts |

## Folder conventions (`apps/web/src`)

```
app/            routes (server components by default)
  (public)/ (app)/ (admin)/   route groups
  api/v1/...    thin route handlers
components/     presentational, contract-typed props
features/<area>/  hooks + feature logic (no JSX layouts)
hooks/          shared hooks
i18n/           next-intl setup + messages
lib/            api client, utils, analytics
server/         services, repositories, jobs, storage, notifications, config
styles/         theme tokens
```

Rules: route handlers never contain business logic; services never touch `req/res`;
repositories are the only place with SQL (Drizzle); mappers strip private fields.

## React

- Server components by default; `"use client"` only where interactivity requires it.
- No data fetching in components — feature hooks do it (`FE-03`, `FE-04`).
- Props typed from contracts; no prop drilling beyond two levels (use feature context).
- Effects are a last resort; prefer derived state and event handlers.
- Keys are stable ids, never array indices.

## Error handling

- API: throw typed domain errors; the handler maps them to `BE-04` codes; unexpected errors →
  `INTERNAL` + `requestId`.
- UI: map by code (`FE-11`); never show raw messages; never swallow errors silently.
- Jobs: classify retryable vs non-retryable (`BE-07`); log with `jobId`.

## Logging

- Structured only (`pino`); no `console.log` in app code (lint).
- Include `requestId`/`jobId`; never log PII (redaction list).
- Levels: `error` (needs attention), `warn` (degraded), `info` (lifecycle), `debug` (dev only).

## Python (services/ml)

- Ruff (lint + format); type hints on all public functions; pydantic models for every request
  and response (mirroring `BE-06`).
- No global mutable state; models loaded once at startup; deterministic eval mode.
- No logging of image bytes or text bodies.

## SQL and migrations

- `snake_case`; every table has `id`, `created_at`, `updated_at`.
- Forward-only migrations; never edit a merged one; rollback note required.
- Every new query gets an `EXPLAIN` review in the PR when it touches a large table.
- Indexes are justified in the PR description.

## Testing standards

- Test names describe behaviour (`rejects a FOUND report without an image`).
- Arrange–Act–Assert; no logic in tests; one concept per test.
- Fixtures synthetic; deterministic clocks; no sleeps.
- Contract tests for every endpoint; state tests for every transition.

## Commits, branches, PRs

See `01-git-workflow.md` and `07-commit-and-pr-conventions.md`. Never `--no-verify`; never
hand-edit generated files.

## Forbidden patterns (lint-enforced where possible)

| Pattern | Why |
|---|---|
| `any`, `@ts-ignore` | hides contract drift |
| raw `fetch("/api/v1/…")` | bypasses generated client |
| raw hex/px in components | breaks theming and tokens |
| `console.log` in app code | unstructured logs, PII risk |
| string literals for enums | drift from contracts |
| `useEffect` data fetching | duplicates TanStack Query |
| editing generated files | drift check fails |
