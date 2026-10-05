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

- `apps/web/src/app/(app)/reports/**` (steps 1–2), `apps/web/src/features/report/**`, `apps/web/src/hooks/useUpload.ts`
- matching tests; i18n files
- `docs/08-project/tasks/TMU-FE-003.md`

## Files changed

- `apps/web/src/app/(app)/reports/new/page.tsx` + test — server page reads `?type=lost|found`
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
- `apps/web/src/components/report/photo-uploader.tsx` + test — button-triggered file
  picker, per-file phases, retry/remove, `error.<code>` mapping (FE-11)
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
- `apps/web/src/app/api/v1/{meta/{campuses,categories,drop-points,locations},uploads/[id]/complete}/route.ts`
  — import-depth off-by-one fixed (CI build/e2e); be-lane files touched under the
  human-authorized lane exception recorded in `blockers/BLK-006.md`
- `apps/web/src/app/api/auth/[...nextauth]/route.ts` — dispatch `NextAuth()`'s `{handlers}`
  by `request.method` instead of calling the non-callable result (next-auth β29; type error
  + runtime `TypeError` on `/api/auth/*`); sixth be-lane file, second human-authorized
  one-file lane exception in the same blocker
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
| O-4 | `API-UPL-02` allows `status: PENDING` but `use-upload.ts` maps every non-`READY` complete response to `phase:"rejected"`, and the FE contract has no PENDING state (review n-1 — latent only: today's server completes synchronously). Needs a `TMU-CTR-*` (drop `PENDING` from the complete response, or specify an FE poll per BE-10). |
| O-5 | `BE-10` defines `rejectionReason` and FE-03/FE-06 promise `rejected(reason)`, but the server omits it and the client discards it — two-sided gap (review n-2). Follow-up: BE/`TMU-CTR-*` then FE-004 wiring; users currently see only the generic rejection string. |
| O-6 | FE-03 prop/event drift vs the implementation (review n-8): `WizardShell.onSaveDraft` (draft saves from `report-wizard` instead), `PhotoUploader.onError` (absent) + `value: UploadState[]` vs local `PhotoEntry[]`, `CategoryPicker` as "icon grid" vs text grid. Behaviour covered; shapes need an FE-03 `TMU-CTR-*` decision (FE-004 is the natural point). |

## Deferrals (out of scope, tracked above)

Wizard steps 3–5 + review/submit (TMU-FE-004) ✗ real report submission from the wizard ✗
analytics (FE-10, not in refs) ✗ contract exports map / error-response declarations
(O-1, O-2 → `TMU-CTR-*`) ✗ FE-11 `RATE_LIMITED` toast with `Retry-After` countdown —
no `ToastProvider` exists yet; inline `error.RATE_LIMITED` is shown (review n-3) → FE-004 ✗
FE-05 #5 / FE-01:55 leave-guard confirm dialog on draft exit (review n-4; draft autosaves
on step change, so no data loss) → FE-004 ✗ PENDING-complete mapping (O-4) ✗
`rejectionReason` plumbing (O-5) ✗ FE-03 prop/event shapes (O-6) ✗ hand-written MSW
success/error shapes in meta tests — prefer the generated `mswHandlers` pattern used by
the upload tests (review n-6; mitigated today by the parity lock) → FE-004 ✗ systemic
≥44 px touch targets beyond this wizard's buttons (review n-7; wizard controls fixed,
FE-002's identical `py-2` buttons need a design/token pass) ✗.

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
| 2026-10-05 | reviewer | 8 review cycle 1 | `REQUEST_CHANGES` (`reviews/TMU-FE-003.md`): **B-1** route `/report/new` vs FE-01 `/reports/new`, **M-1** four FE-09 component rows, minors n-1…n-9; parallel security review `PASS` (`reviews/TMU-FE-003-security.md`). |
| 2026-10-05 | frontend-dev | 9 B-1 fix | `git mv app/(app)/report → reports` (renames the page to the contract path — also brings it under the middleware `APP_AUTH_MATCHER` `/reports` gate); task-file paths L50/L56 + TMU-FE-003 in TMU-FE-004 corrected. CI `build`/`e2e` additionally failed on an import off-by-one in 5 be-lane `route.ts` files (`../../server` vs `../../../server`) — human **authorized a lane exception** (question answered in session); recorded in `blockers/BLK-006.md`, the 5 explicit paths added to `.agent/lanes.json` fe, imports fixed; scanner `broken: 0`, `check-lane.sh` green. |
| 2026-10-05 | frontend-dev | 10 M-1 + n-5 + n-7 fix | Tests first: updated/added 17 assertions (radios, roles, `aria-describedby`, touch targets, step-3 hint) → red **`17 failed / 44 passed`** (all failing on the old implementation) → implemented FE-09 rows: `WizardShell` step count `role="status"`; `CategoryPicker` native radio group in `fieldset` (arrow-key walk + `checked` announced, replaces `aria-pressed` buttons); `PhotoUploader` real `<button>` → file picker, status span `role="status"` (progress announced), rejection reason `aria-describedby`-linked, `min-h-11` controls; `SensitiveNotice` `role="note"`; steps ≥3 disabled Next now hints `report.wizard.step.pending` (n-5); wizard back/next + category retry ≥44 px (n-7) → focused green **9 files / 61 tests** (incl. 4 axe runs). |
| 2026-10-05 | frontend-dev | 11 CI build/e2e green | After B-1's import fix, CI typecheck reached a pre-existing defect in `app/api/auth/[...nextauth]/route.ts:46` (`handler(request)` vs next-auth β29's non-callable result — type error + runtime `TypeError` on `/api/auth/*`; masked because `origin/main` carries no api routes). Human answered **"Authorize this one-file fix"** → second lane exception recorded in BLK-006, 6th path added to the fe lane, `{handlers}` dispatch by `request.method`. Local `pnpm build` red → green; full gate green; CI run `37261127595`: **build pass, e2e pass**, all required checks green (`audit` red = advisory `continue-on-error`, pre-existing per security M-6); PR merge state BLOCKED → UNSTABLE. |
| 2026-10-05 | reviewer | 12 review cycle 2 | **APPROVE** (`reviews/TMU-FE-003.md`, cycle 2 of 2): every cycle-1 finding RESOLVED (B-1 + M-1a..d verified with file:line, n-1…n-9 dispositioned), DoD 12/12, no BLOCKER/MAJOR. Four new MINORs filed per DoD: **n-10** + **n-13** → TMU-FE-004 (inherited-findings section), **n-11** → new task TMU-BE-009, **n-12** (task-file bookkeeping) fixed in this step. Reviewer reran the FE-003 suite (10 files / 69 green) and CI on head via the check-runs API (all required jobs green). |

## Evidence

- **Red** (before implementation): `Test Files 9 failed (9)` — all nine failing while
  resolving the not-yet-written modules (`reports/new/page` (renamed in review cycle 1,
  B-1), `wizard-shell`,
  `category-picker`, `photo-uploader`, `sensitive-notice`, `use-categories`, `draft`,
  `wizard-steps`, `use-upload`).
- **Green** (after implementation): `Test Files 9 passed (9)` / `Tests 63 passed (63)` for
  those nine files; FE-003-scoped suite `10 files / 66 tests` once
  `contract-parity.test.ts` was added (review cycle 1 counted 10 files / 66 tests).
- **Review-cycle-1 red** (FE-09 fixes): `Test Files 5 failed | 4 passed (9)`,
  `Tests 17 failed | 44 passed (61)` — every failure an M-1/n-5/n-7 requirement
  (radios, `role="status"`/`role="note"`, `aria-describedby`, `min-h-11`, step-3 hint)
  against the old implementation; **green**: focused `9 files / 61 tests` (the path
  filter omits `hooks/use-upload.test.tsx`) — full FE-003-scoped suite is
  `10 files / 69 tests` (photo-uploader 14 → 17).
- **Gate tail** (post-cycle-1 fixes, local-Docker `DATABASE_URL` per D-7):
  `Test Files 73 passed (73)` → `Tests 580 passed (580)` →
  `contracts:check OK (version 1.1.0)` → `contracts:lint OK` → `db:check: ok` → ML
  `All checks passed!` / `7 passed` → `OK gate(quick) passed` (re-verified green after the
  next-auth fix in step 11; one intermediate run lost a single `config-presets` ESLint test
  to load-flake, green in isolation and on the full re-run).
- **i18n**: `i18n:check passed (147 keys per locale)` (+48 vs the 99 baseline).
- **A11y**: 4 `axe(container)` runs (wizard-shell, category-picker, photo-uploader,
  sensitive-notice) — all green (FE-09), plus behavioural coverage of the rows axe cannot
  check: `role="status"` step count + progress, radio-group arrow-key navigation with
  selection, `role="note"`, `aria-describedby` reason link, `min-h-11` touch targets.
- **Contract**: `API-META-01` exercised through the generated client + MSW (success parse
  and failure envelope); BE-10 handshake (`presign → PUT → complete → READY`) asserted
  with captured requests in `use-upload.test.tsx`; `API-REP-01Request` types the draft
  shape; mirrors locked by `contract-parity.test.ts` against
  `ReportCreate.pick(...)`/`CategoryMeta`.
- **Review**: cycle 1 `REQUEST_CHANGES` → cycle 2 **`APPROVE`** (2 of 2 cycles used) in
  `docs/08-project/reviews/TMU-FE-003.md` — B-1 + M-1 + n-1…n-9 all RESOLVED with file:line
  evidence, DoD 12/12; security PASS `docs/08-project/reviews/TMU-FE-003-security.md`.
  Cycle-2 MINORs filed: n-10/n-13 → TMU-FE-004, n-11 → TMU-BE-009, n-12 fixed above.
- **PR**: [#46](https://github.com/HanifIsya/temuUNAIR-v2/pull/46) (draft,
  `agent/fe/TMU-FE-003-fe-wizard-photos`).
- **CI** (run `37261127595`, head `379a907`): build ✓, e2e ✓, unit ✓, lint-typecheck ✓,
  contracts ✓, integration ✓, migrations ✓, contract-fuzz ✓, ml ✓, secret-scan ✓;
  `audit` red = advisory `continue-on-error` (pre-existing next-auth/next-intl advisories,
  security M-6 → ops follow-up). Two authorized be-lane fixes recorded in `BLK-006.md`.
