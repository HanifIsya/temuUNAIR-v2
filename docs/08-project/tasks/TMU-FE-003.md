---
id: TMU-FE-003
title: Report wizard steps 1–2 — category/type choice + photos with upload hooks (SCR-004)
status: REVIEW
lane: fe
slug: fe-wizard-photos
milestone: M3
priority: P1
owner: frontend-dev
deps: [TMU-BE-004, TMU-FE-002]
refs: [FE-05, SCR-004, FR-REP-001, FR-REP-002, BE-10]
created: 2026-10-03
updated: 2026-10-05
---

# TMU-FE-003 — Report wizard steps 1–2 — category/type choice + photos with upload hooks (SCR-004)

## Goal

First half of the LOST/FOUND wizard per FE-05: step 1 type + category selection driven by
`API-META-01` (sensitive-category banner for items flagged `isSensitive`), step 2 photo
capture using the BE-10 handshake hook `useUpload` (presign → PUT → complete, per-file
retry, 8 MB/type errors surfaced via FE-11), draft autosave to `localStorage` keyed by
`REPORT-DRAFT` version. MSW-backed component tests against the generated handlers.

## Acceptance criteria

- [x] Shared Zod schemas from contracts (no duplicated rules); step transitions block on
  invalid photos — `features/report/schemas.ts` mirrors built from contract enums, locked
  to the real contract schemas by `contract-parity.test.ts` (sample-for-sample +
  parsed-output parity against `ReportCreate.pick(...)`/`CategoryMeta`; see D-1 for the
  TS5097 constraint). `canProceedStep1`/`canProceedStep2` gate the wizard: FOUND "next"
  stays blocked until ≥1 photo is `ready` and none are `inFlight`
  (`page.test.tsx`: "advances to photos … blocks FOUND next until a photo is ready").
- [x] Upload error states: `UPLOAD_INVALID_TYPE`, `UPLOAD_TOO_LARGE`, network offline —
  all with i18n strings — `use-upload.test.tsx` asserts both codes plus offline on a
  failed presign and a failed presigned PUT; `photo-uploader.test.tsx` asserts the UI
  maps them through `error.<code>` / `common.offline` (probed via mocked `t`);
  `error.UPLOAD_INVALID_TYPE`, `error.UPLOAD_TOO_LARGE`, `error.UPLOAD_LIMIT_REACHED`
  exist in both locales (i18n parity test green).
- [x] Draft survives reload; versioned key ignores stale shapes — `draft.test.ts` (8
  tests): save/load round-trip, version mismatch and malformed/old envelopes dropped
  without throwing, 24 h expiry; `page.test.tsx` restores a persisted draft on mount.
- [x] Red tests first; `pnpm gate` green — red: `Test Files 9 failed (9)` (all failing on
  the not-yet-written modules); green after implementation: 9 files / 63 tests, final
  FE-003-scoped suite 10 files / 66 tests; full gate tail below.

## Files expected to change

- `apps/web/src/app/(app)/report/**` (steps 1–2), `apps/web/src/features/report/**`, `apps/web/src/hooks/useUpload.ts`
- matching tests; i18n files
- `docs/08-project/tasks/TMU-FE-003.md`

## Files changed

- `apps/web/src/app/(app)/report/new/page.tsx` + test — server page reads `?type=lost|found`
- `apps/web/src/features/report/report-wizard.tsx` — client wizard: `react-hook-form` +
  `zodResolver(wizardFormSchema)`, steps 1–2 rendering, draft autosave, sensitive notice
- `apps/web/src/features/report/wizard-steps.ts` + test — LOST (5) / FOUND (7) step lists,
  `canProceedStep1/2`, `stepTitleKey`
- `apps/web/src/features/report/schemas.ts` — mirror schemas + TS5097 rationale (D-1)
- `apps/web/src/features/report/types.ts` — `ApiCategories`, `CategoryValue`,
  `ReportTypeValue`, `ReportCreateRequest` from `generated/types.ts`
- `apps/web/src/features/report/contract-parity.test.ts` — runtime parity lock vs the real
  contract schemas via the non-literal dynamic-import hatch (D-1)
- `apps/web/src/features/report/use-categories.ts` + test — `GET /api/v1/meta/categories`
  query (`metaKey("categories")`, staleTime 1 h, `categoryListSchema.parse`, D-2 cast)
- `apps/web/src/features/report/draft.ts` + test — versioned per-type localStorage draft
- `apps/web/src/components/report/wizard-shell.tsx` + test — step indicator, titles,
  current heading (FE-03)
- `apps/web/src/components/report/category-picker.tsx` + test — radioset of category
  options, legend/labelled options
- `apps/web/src/components/report/sensitive-notice.tsx` + test — `isSensitive` banner
- `apps/web/src/components/report/photo-uploader.tsx` + test — dropzone, per-file phases,
  retry/remove, `error.<code>` mapping (FE-11)
- `apps/web/src/hooks/use-upload.ts` + test — BE-10 handshake (presign → PUT → complete),
  client mirrors of MIME/8 MB/5-photo limits, offline + failure phases, `rehydrate`
- `apps/web/src/lib/api/client.ts` — single access point re-exporting the generated
  client + `ApiQueryError` (status for retry policy)
- `apps/web/src/lib/api/keys.ts` — FE-04 query-key helpers (`metaKey`)
- `apps/web/src/lib/api/provider.tsx` — `QueryClientProvider` with FE-04 retry policy
- `apps/web/src/app/layout.tsx` — mounts `ApiProvider` inside `AuthProvider`
- `apps/web/src/i18n/messages/{id,en}.json` — +48 keys each: `report.wizard.*` (26),
  `category.*` (19), `sensitive.notice.*` (3)
- `apps/web/package.json`, `pnpm-lock.yaml` — `react-hook-form`, `@hookform/resolvers`,
  `@tanstack/react-query` direct deps (D-3)
- `docs/08-project/{backlog.md,status.md}` — regenerated

## Decisions

| # | Decision |
|---|---|
| D-1 | **Contract access = local mirrors + runtime parity lock.** `packages/contracts/package.json` has no `exports`/`main`, and every module under `packages/contracts/src` imports siblings with `.ts` specifiers — a static import of `@temuunair/contracts/src/common` fails the root `tsc` with **TS5097** (no `allowImportingTsExtensions`; root tsconfig is ops-lane, out of scope). So: (a) Zod mirrors in `features/report/schemas.ts` built from contract **enums** (enums stay single-source), (b) types imported from `@temuunair/contracts/generated/types` (`generated/types.ts` has no relative `.ts` imports — statically safe; FE-002 `server-user.ts` precedent), (c) `contract-parity.test.ts` loads the real contract schemas at runtime through the **non-literal dynamic-import escape hatch** (TMU-BE-003 precedent: tsc skips it, vitest/vite-node executes it) and asserts mirror ⇔ `ReportCreate.pick(...)`/`CategoryMeta` parity sample-for-sample including parsed outputs (TMU-BE-005 "local mirror + parity test" precedent). Proper fix tracked as O-2. |
| D-2 | `API-META-01` declares `errors: []` in the route registry, so openapi-fetch types the error branch as `never`; `use-categories.ts` widens **only that branch** with a local `FailureEnvelope` cast — the runtime envelope is real (MSW failure test asserts a non-2xx surfaces the code). Contract observation O-1 filed for a `TMU-CTR-*` to declare the error responses. |
| D-3 | `react-hook-form@^7.89`, `@hookform/resolvers@^5.9.1` (FE-05: `zodResolver(wizardFormSchema)`) and `@tanstack/react-query@^5.104` added as **direct** `apps/web` deps — they were not in that workspace's `package.json` before (`pnpm-lock.yaml`, lane `_common`). |
| D-4 | `lib/api/*` is the app's single API access point (FE-04): `client.ts` re-exports the generated contract client + `ApiQueryError`, `keys.ts` centralises query keys, `provider.tsx` supplies the `QueryClient` whose retry policy retries only network/5xx (2×) and never 4xx — mounted once in the root layout. |
| D-5 | Draft key is **per report type** (`tu.draft.report.lost` / `.found`) inside a versioned envelope (`DRAFT_VERSION = 1`, 24 h max age) — the goal's `REPORT-DRAFT` label became namespaced per-type keys so LOST/FOUND drafts never clobber each other; stale versions/shapes are dropped by `draftDataSchema` (tested). |
| D-6 | The shell renders all 7 step titles up front (FE-03 `WizardStepItem`) while steps 3–7 render `report.wizard.step.pending` copy — FE-004 fills them in; LOST skips `custody`/`hints`. |
| D-7 | Live-DB gate suites must run against the **local Docker** Postgres (`postgresql://temuunair:temuunair@localhost:5432/temuunair`): the session-scoped `DATABASE_URL` points at a remote Render instance whose scratch-DB handling failed with `57P01 terminating connection` in 4 suites — same failure mode and remedy as FE-002 step 5. |

## Contract observations

| # | Observation |
|---|---|
| O-1 | `API-META-01` (and likely other GETs) declare `errors: []` in the registry → generated client types non-2xx as `never` while the runtime returns the standard error envelope. Needs a `TMU-CTR-*` to declare the actual error responses (401/403/422/500 …). |
| O-2 | FE-05 says schemas are "imported from `@temuunair/contracts`", but the package exposes no `exports`/`main` and its `src/*` deep paths trip TS5097 under the root configs. Follow-up: `TMU-CTR-*`/`TMU-OPS-*` to add an `exports` map (plus, if needed, `allowImportingTsExtensions` in the ops-lane tsconfigs) so frontend code can statically import shared schemas; until then D-1 + parity test hold the line. |
| O-3 | No root exports for `ReportCreate`/`CategoryMeta` names (same as FE-002 O-1 for `Me`) — consumed via `components["schemas"][...]` and `.pick(...)`. |

## Deferrals (out of scope, tracked above)

Wizard steps 3–5 + review/submit (TMU-FE-004) ✗ real report submission from the wizard ✗
analytics (FE-10, not in refs) ✗ contract exports map / error-response declarations
(O-1, O-2 → `TMU-CTR-*`) ✗.

## Progress log

| Date | Actor | Step | Notes |
|---|---|---|---|
| 2026-10-03 | frontend-dev | 0 DoR | Task file created (TODO). |
| 2026-10-05 | frontend-dev | 1 DoR research | DoR 8/8: deps TMU-BE-004 + TMU-FE-002 DONE; FE-05/SCR-004/FR-REP-001/002/BE-10 merged; lane globs cover every target (`app/(app)/**`, `components/**`, `features/**`, `hooks/**`, `lib/**`, `i18n/**`, `package.json` + `_common` lockfile); `API-META-01`/`API-REP-01`/`API-UPL-*` types available post-CTR; no conflicting open PRs; DoR #8 — component/hook tests need no secrets. |
| 2026-10-05 | frontend-dev | 2 RED | 9 test files written first (page, wizard-shell, category-picker, photo-uploader, sensitive-notice, use-categories, draft, wizard-steps, use-upload); `vitest run` → **`Test Files 9 failed (9)`** — every file failed resolving the not-yet-written modules. |
| 2026-10-05 | frontend-dev | 3 GREEN | Implementation written; focused green **9 files / 63 tests**; deps added per D-3 (`pnpm i`, lockfile lane `_common`). |
| 2026-10-05 | frontend-dev | 4 typecheck fix | `pnpm typecheck` red with 16 errors: enum-as-type misuse (TS2749/TS6133 — `Category`/`ReportType` are Zod values, types come from `generated/types.ts`), **TS5097** on the contract deep import, `never`-narrowing in `use-categories`, fixture/prop drift in two component tests. Fixed per D-1/D-2 (parity test added → 10 files / 66 tests); `pnpm typecheck` green. |
| 2026-10-05 | frontend-dev | 5 i18n | +48 keys per locale: `report.wizard.*` (26), `category.*` (19), `sensitive.notice.*` (3) — both `id` + `en`; `i18n:check passed (147 keys per locale)`. |
| 2026-10-05 | frontend-dev | 6 GATE | Format + lint green. Full gate first failed at the live-DB step: session-scoped Render `DATABASE_URL` → 4 suites `57P01 terminating connection` (D-7) → re-ran with the local Docker URL: **`OK gate(quick) passed`** — lane/format/lint/typecheck/i18n, **73 files / 577 tests**, `contracts:check OK (1.1.0)`, `contracts:lint OK`, `db:check: ok`, ML `All checks passed!` + `7 passed`. |
| 2026-10-05 | frontend-dev | 7 handoff | Task file updated, status → `REVIEW`, backlog/status regenerated, gate green; handing to `@reviewer`. |

## Evidence

- **Red** (before implementation): `Test Files 9 failed (9)` — all nine failing while
  resolving the not-yet-written modules (`report/new/page`, `wizard-shell`,
  `category-picker`, `photo-uploader`, `sensitive-notice`, `use-categories`, `draft`,
  `wizard-steps`, `use-upload`).
- **Green** (after implementation): `Test Files 9 passed (9)`, `Tests 66 passed (66)`
  FE-003-scoped (10 files incl. `contract-parity.test.ts`).
- **Gate tail**: `Test Files 73 passed (73)` → `Tests 577 passed (577)` →
  `contracts:check OK (version 1.1.0)` → `contracts:lint OK` → `db:check: ok` → ML
  `All checks passed!` / `7 passed` → `OK gate(quick) passed` (local-Docker
  `DATABASE_URL`, D-7).
- **i18n**: `i18n:check passed (147 keys per locale)` (+48 vs the 99 baseline).
- **A11y**: 4 `axe(container)` runs (wizard-shell, category-picker, photo-uploader,
  sensitive-notice) — all green in the gate run (FE-09).
- **Contract**: `API-META-01` exercised through the generated client + MSW (success parse
  and failure envelope); BE-10 handshake (`presign → PUT → complete → READY`) asserted
  with captured requests in `use-upload.test.tsx`; `API-REP-01Request` types the draft
  shape; mirrors locked by `contract-parity.test.ts` against
  `ReportCreate.pick(...)`/`CategoryMeta`.
- **Review**: pending → `docs/08-project/reviews/TMU-FE-003.md`.
- **PR**: pending (open-pr skill).
