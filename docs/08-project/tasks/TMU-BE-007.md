---
id: TMU-BE-007
title: report.process job + ML client (BE-07, BE-06) with needs_reprocess and ML_MODE=stub
status: DONE
lane: be
slug: be-report-process-job
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-006]
refs: [BE-07, BE-06, ARCH-JOBS, ARCH-ML, BE-05]
created: 2026-10-03
updated: 2026-10-04
---

# TMU-BE-007 — report.process job + ML client (BE-07, BE-06) with needs_reprocess and ML_MODE=stub

## Goal

Register the `report.process` pg-boss queue handler in `apps/worker`: wait for READY
images → call the ML service (`analyze-image`, `embed-text`) through a typed client
(bearer token, 8 s timeout, allowlisted storage host only) → write `image_features` /
`report_features` → enqueue `report.match`. Dead-letter behaviour sets
`reports.needs_reprocess = true` after retry exhaustion; `ML_MODE=stub` returns
deterministic vectors so tests and E2E never need models.

## Acceptance criteria

- [x] Handler idempotent (double-run exits early per BE-07 rules); retries/backoff match the contract.
- [x] Stub mode produces schema-valid features; worker test asserts no image bytes/text bodies logged.
- [x] Dead-letter flips `needs_reprocess` and keeps the report usable.
- [x] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/worker/src/jobs/report-process.ts`, `apps/web/src/server/jobs/*`, `apps/web/src/server/ml/client.ts`
- matching tests
- `docs/08-project/tasks/TMU-BE-007.md`

## Actual files changed

- `apps/worker/src/ml/client.ts` — typed ML client per BE-06: `ImageAnalysis` /
  `EmbedTextResponse` / `Attributes` Zod schemas mirroring `ml-openapi.json`,
  `MlCallError{code,status,retryable}` classification (429/408/5xx/timeout/network
  retryable; 400/401/404/413/415/422 + malformed/schema-invalid 200 non-retryable;
  non-allowlisted image URL → `ML_URL_NOT_ALLOWED` checked before any network call,
  even in stub mode), bearer auth, `redirect: "error"`, `AbortSignal.timeout(8000)`,
  `ML_MODE=stub` deterministic L2-normalised xorshift vectors (512/384) with zero
  network, `GET /v1/models` → `{name: version}` map for idempotency checks.
- `apps/worker/src/config.ts` — `parseWorkerConfig` (BE-11 defaults: ML_MODE=stub,
  `http://localhost:8000`, `dev-ml-token`, MinIO dev storage) + `allowedStorageOrigins`
  derived from `S3_ENDPOINT`/`S3_PUBLIC_BASE_URL`; `assertProdConfig` throws when
  `NODE_ENV=production && ML_MODE=stub` (BE-11 rule 5); memoized `getWorkerConfig`.
- `apps/worker/src/logging.ts` — pino logger with `WORKER_REDACTION_PATHS` (flat +
  `*.x` forms — verified empirically that pino `*.x` only matches nested fields),
  `scrubMessage` strips URLs, `{"…"}` pg arrays and `[num,…]` vector payloads and caps
  at 300 chars (privacy: embeddings/URLs never reach logs or pg-boss error rows).
- `apps/worker/src/storage.ts` — `createPresignGet` (S3Client + presigner,
  `IMAGE_PRESIGN_TTL_SECONDS = 300`, ARCH-ML 5 min).
- `apps/worker/src/jobs/report-process.ts` — `runReportProcess` / `createReportProcessHandler` /
  `JobFailure(kind,reason,code)` / `ProcessJob` / `ReportRow` / `ImageRow` / deps + store
  interfaces / `imageFeatureWriteSchema` / `reportFeatureWriteSchema`; flow: payload parse →
  load report (`not-found` swallowed) → PENDING images → retryable `images-pending` →
  early-exit on `model_versions` match + `updatedAt <= processedAt` (clears stale
  `needs_reprocess`, enqueues match) → sequential ML per READY image → `embedText`
  (`"title. description"`, locale `id`) + `extractAttributes` → schema-validated upserts →
  re-read (changed → retryable `report-changed-during-processing`) → clear flag → enqueue
  `report.match` → `processed`. Failure handling: non-retryable ML → mark + log `non-retryable`
  + complete without retry; retryable → log `retry` (or `dead-letter` + mark on final
  attempt) and throw `JobFailure` for pg-boss backoff.
- `apps/worker/src/jobs/report-process-store.ts` — raw-SQL store over a pg Pool
  (`ON CONFLICT` upserts; `needs_reprocess` updates never touch `updated_at`; vectors
  bound as JSON `[...]` strings — node-pg quotes JS-array elements which pgvector
  rejects).
- `apps/worker/src/jobs/report-match-queue.ts` — worker-side `report.match` enqueue:
  creates the queue on demand (queue FK), `{reportId, reason:"process"}` with
  `{singletonKey, retryLimit:3, retryDelay:30, retryBackoff:true, expireInSeconds:30}`.
- `apps/worker/src/worker.ts` — `report.process` registered with
  `{ includeMetadata: true }` (dead-letter detection reads `retryCount`/`retryLimit`),
  payload validation before the runner, lazy memoized runner (config → pool → store →
  ML client → presign → match queue) injectable via `WorkerOptions.reportProcess`;
  `getWorkerConfig()` guard in `start()`; other 7 queues keep their no-op handlers.
- `apps/web/src/server/jobs/report-process.ts` + test — **moved** from
  `services/report-queue.ts` (ARCH system-overview `src/server/jobs/enqueue`); send
  options gained the contract-mandated `retryDelay: 30, retryBackoff: true`
  (BE-07 base 30 s). Import sites updated: `handlers/reports.ts`, `handlers/reports.test.ts`
  (`vi.mock` path).
- `apps/worker/package.json` + `pnpm-lock.yaml` — deps `@aws-sdk/client-s3`,
  `@aws-sdk/s3-request-presigner`, `pg`, `pg-boss`, `pino`, `zod`; devDeps
  `@types/pg`, `drizzle-orm` (live-test migration runner only).
- Tests: `apps/worker/src/ml/client.test.ts` (13), `jobs/report-process.test.ts` (19),
  `jobs/report-process.db.test.ts` (4 live, scratch DB), `config.test.ts` (6),
  `logging.test.ts` (3), `storage.test.ts` (1), `worker.test.ts` (5, updated for the
  3-arg registration + injectable runner), `apps/web/src/server/jobs/report-process.test.ts`
  (4, moved + backoff assertion).

## Progress log

- 2026-10-04 — **picked** via `next-task.mjs`; DoR checked: dep TMU-BE-006 DONE (`97f8ae3`),
  contract v1.1.0 merged, AC present, lane covers every file touched; `.agent/STOP` absent.
- 2026-10-04 — research: BE-07 row 21 + retry table + idempotency rules, BE-06 endpoints/
  status codes + full `ml-openapi.json`, ARCH-JOBS (sequential ML, 8 s timeout, dead-letter
  flag), BE-11 env rows + rule 5, pg-boss 10.4.2 `types.d.ts`/`plans.js` (retry_count vs
  retry_limit ⇒ total attempts = retryLimit; `retryBackoff` formula; `deadLetter` = separate
  queue → not used), schema DDL `image_features`/`report_features`, worker/web current state.
- 2026-10-04 — deps installed (`pnpm install`), web enqueue module moved to
  `server/jobs/report-process.ts`, red assertions written.
- 2026-10-04 — **red evidence**: `pnpm exec vitest run apps/worker/src apps/web/src/server/jobs`
  → `Test Files 8 failed | 1 passed (9)` / `Tests 3 failed | 13 passed (16)`:
  `Cannot find module './config.js' | './logging.js' | './storage.js' | './client.js' |
  '../ml/client.js'` (implementation modules absent); `worker.test.ts` 2 failures
  (registration still 2-arg, no injectable runner); web queue test
  `expected … retryBackoff: true, retryDelay: 30` missing from `send` options. Every
  failure for the right reason (missing impl / contract gap).
- 2026-10-04 — green: impl written; unit suites pass first run
  (`config 6, storage 1, ml 13, logging 3, web queue 4, worker 5` = 32; handler suite 19).
- 2026-10-04 — live DB test round 1: `TypeError: Cannot read properties of undefined
  (reading 'category')` — **test bug**: `seedReport()` called without args → added `= {}`
  default (assertions untouched).
- 2026-10-04 — live DB test round 2: `invalid input syntax for type vector: "{"-0.027…"}"`
  — node-pg quotes JS-array elements, which pgvector rejects → store now binds vectors as
  JSON `[...]` strings (`vectorParam`). Round 3: all 4 live tests green
  (`report-process.db.test.ts 4 tests, 719 ms`).
- 2026-10-04 — privacy hardening: the pg vector error had echoed the full embedding into
  the message that `handleFailure` logs → `scrubMessage` now removes URLs, `{"…"}` arrays
  and `[num,…]` payloads and caps length; new `scrubMessage` unit test asserts both.
- 2026-10-04 — `pnpm --filter @temuunair/worker build` failed twice: `MatchBossLike`
  needed the proven `QueuePolicy` union (mirrored web's `ReportBossLike`), and
  `connectionString` narrowing didn't reach the closure (introduced `dbUrl`). Re-run →
  clean. One-off `tsc` over worker `src/**` (temp config): 1 unused type import removed →
  exit 0.
- 2026-10-04 — full verification: `pnpm exec vitest run apps/worker/src apps/web/src/server`
  → `Test Files 25 passed (25)` / `Tests 237 passed (237)`.
- 2026-10-04 — `pnpm format` + `pnpm gate` → `OK gate(quick) passed` (lane, format, lint,
  typecheck, i18n, **44 files / 393 unit tests** — 347 → 393, +46 new, contracts:check
  OK 1.1.0, contracts:lint OK, db:check: ok, ML ruff + 7/7).

## Decisions and interpretations (not specified by the docs)

1. **ML client lives in the worker** (`apps/worker/src/ml/client.ts`) — BE-06 §92 says
   "the worker's generated client"; there is no web consumer (no `/readyz` route exists
   and API routes are out of lane), so `apps/web/src/server/ml/client.ts` from the
   expected-files list was deliberately **not** created.
2. **Hand-written Zod mirrors of `ml-openapi.json`** — the repo has no schema generator
   and the file is a PLACEHOLDER until TMU-ML-001; the client is validated against it by
   test fixtures copied from the spec.
3. **Dead-letter detection reads job metadata** (`includeMetadata: true`,
   `retryCount + 1 >= retryLimit`) instead of pg-boss's `deadLetter` option, which would
   add a 9th queue and break the registry's exact-8-queues test.
4. **Non-retryable ML errors** mark `needs_reprocess`, log `outcome:"non-retryable"` once
   and **complete the job** (BE-07 "log once, mark entity, no retry"); they never become
   dead-letters.
5. **`report.match` enqueue failure is retryable** (throws `JobFailure`), and the
   early-exit path re-enqueues too — retries heal a missed match through pg-boss
   singleton dedupe without duplicating work.
6. **`needs_reprocess` is cleared** on successful processing and on early-exit when the
   features are current (BE-07 only specifies setting it; clear makes the admin flag mean
   "still needs processing").
7. **Mid-run change detection** re-reads the report after the feature writes and compares
   `updated_at` with the pre-processing load; a change throws
   `report-changed-during-processing` (retryable) *before* clearing the flag — the retry
   overwrites features idempotently.
8. **`processed_at` = `clock_timestamp()`** (DB clock, µs) sampled at processing start —
   a JS `Date` (ms) compared against a Postgres `updated_at` (µs) would flake the
   early-exit check when both land in the same millisecond.
9. **Feature choices**: embed text = `title + ". " + description`, locale `"id"` fixed;
   `imageEmbedding` = first READY analysis with `quality.usable !== false` else the first
   else `null`; `categoryScores` = `{[category]: score}` map from `categoryGuess`;
   `image_features.model_versions` from the analysis, `report_features.model_versions` =
   analysis ∪ embed-text (Attributes has no versions).
10. **Worker persistence is raw SQL over a pg Pool** — the worker cannot import
    `apps/web` repositories (`rootDir: ./src`, no path aliases) and importing
    `@temuunair/db` sources would drag them into the worker build; `drizzle-orm` remains
    only as the live test's migration runner (devDep).
11. **Runner built lazily on first job** (memoized) so `createWorker()`/`start()` in unit
    tests need no env or DB; `assertProdConfig` runs eagerly in `start()`.
12. **Singleton key = raw `reportId`** (BE-07 table + the already-merged BE-006 web
    behaviour), though ARCH-JOBS prose writes `report.process:<reportId>`.

## Contract observations (for a future `TMU-CTR-*`, not changed here)

1. BE-07 "Testing" says job payload schemas are exported from `packages/contracts`, but
   `report.process`/`report.match` payloads live in `apps/worker/src/registry.ts`
   (contracts lane — not editable from a feature task).
2. BE-06 §92 requires the worker's client to "type-check against ml-openapi.json" — no
   generator tooling exists and the file is an explicit PLACEHOLDER until TMU-ML-001;
   the hand-written schemas are the interim.
3. BE-07 does not specify clearing `needs_reprocess` on success, or what happens when the
   `report.match` enqueue fails (implemented per decisions 5–6 above).
4. `report_images.report_id` FK has no index in `0003_reports.sql` — `loadImages`
   seq-scans (fine at current scale); an index migration would be needed before large
   data — `packages/db/**` is out of lane for this task.
5. ARCH-JOBS singleton-key prose (`report.process:<id>`) conflicts with BE-07's table
   (`reportId`); the contract won.
6. Real-mode early-exit depends on response `modelVersions` keys matching the
   lockfile model names — alignment is the ML service's responsibility; a mismatch only
   disables early-exit (reprocessing, never incorrectness).

## Definition of Done

See `docs/05-workflow/05-definition-of-ready-done.md`. Evidence: red/green/gate commands
in the Progress log above; review verdict in
`docs/08-project/reviews/TMU-BE-007.md`.
