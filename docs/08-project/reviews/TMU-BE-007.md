---
id: TMU-BE-007
reviewer: reviewer
verdict: APPROVE
cycle: 1
date: 2026-10-04
---

# Review — TMU-BE-007

## Checklist

| # | Check | Result |
|---|---|---|
| 1 | Red tests existed first and failed for the right reason (`Cannot find module './config.js' \| './logging.js' \| './storage.js' \| './client.js' \| '../ml/client.js'`, 2-arg registration, missing `retryBackoff/retryDelay` — 8 files failed, 3 failed / 13 passed) | PASS |
| 2 | All new/updated tests pass: 46 new (ml 13, handler 19, live-DB 4, config 6, logging 3, storage 1, worker 5, web queue 4 — 3 of the worker/web ones rewritten/moved); full `pnpm gate` green (44 files / 393 tests, 347 → 393) | PASS |
| 3 | Contract tests: `report.process`/`report.match` are pg-boss jobs, not HTTP endpoints — payload schemas validated with Zod before every handler/runner call (`parseJobPayload`), queue options match BE-07 retry table (`retryLimit:3, retryDelay:30, retryBackoff:true, expireInSeconds:30`) | PASS |
| 4 | State transitions covered by live-DB tests: process writes features + enqueues match; double-run early-exits without reprocessing; `needs_reprocess` reprocesses after text change; dead-letter sets `needs_reprocess=true` and keeps `status='OPEN'` (report usable) | PASS |
| 5 | Privacy: `scrubMessage` strips URLs, pg `{"…"}` arrays and `[num,…]` vector payloads and caps at 300 chars; unit test asserts embeddings/URLs never appear in log output; `WORKER_REDACTION_PATHS` covers flat + nested email/token/text/title/description/answer/imageUrl; no image bytes or raw responses logged; fixtures synthetic | PASS |
| 6 | i18n: no UI strings; no new `error.<code>` keys (worker logs only) | PASS (n/a) |
| 7 | A11y: no UI components touched | PASS (n/a) |
| 8 | Docs: task file DONE with red/green/gate evidence, 12 decisions, 6 contract observations; this review | PASS |
| 9 | Generated files in sync (`contracts:check OK 1.1.0`); contract untouched (observations filed) | PASS |
| 10 | Reviewer verdict APPROVE, fresh context, cycle 1 | PASS |
| 11 | Security: bearer auth + 8 s `AbortSignal.timeout` on every ML call; `redirect:"error"` + allowlisted storage origins checked **before** any network I/O (even in stub); `ML_MODE=stub` forbidden in production (`assertProdConfig` in `start()`); presign TTL fixed at 300 s; SQL parameterized; `needs_reprocess` update never touches `updated_at`; non-retryable ML errors never enter an infinite retry loop | PASS |
| 12 | Work in lane: `apps/worker/**`, `apps/web/src/server/**`, `**/*.test.ts`, `pnpm-lock.yaml`, `08-project/tasks\|reviews` — all within `be`/`_common` globs; no migration, no contract, no generated file hand-edited; lane check green in gate | PASS |

## Notes

- **Dead-letter is metadata-driven** (`includeMetadata: true`, `retryCount + 1 >=
  retryLimit`) rather than pg-boss's `deadLetter` option — avoids a 9th queue that would
  contradict BE-07's exact-8 registry. Final attempt logs `outcome:"dead-letter"` **and**
  marks the entity before rethrowing, so the job still lands in `failed`.
- **Two failure classes stay distinct**: non-retryable ML errors (4xx/schema/allowlist)
  mark + log + complete with no retry; retryable ones (429/408/5xx/timeout/network,
  pending images, mid-run change, match-enqueue failure) throw `JobFailure` so pg-boss
  applies the 30 s exponential backoff.
- **Idempotency verified live** (scratch DB): the second run short-circuits on
  `model_versions` match + `updated_at <= processed_at`, re-enqueues `report.match`
  (healing a missed match without duplicating feature writes), and clears a stale
  `needs_reprocess`.
- **Two live-test failures were test/tooling bugs, not product bugs**: `seedReport()`
  called without its options default (TypeError reading `category`), and node-pg quoting
  JS arrays so pgvector rejected `"{"…"}"` — fixed in the seed helper and `vectorParam`
  respectively; assertions were never weakened.
- **Embedding leak found and fixed during red→green**: the pg vector error echoed the
  full embedding into `handleFailure`'s message → `scrubMessage` extended (URL, `{"…"}`,
  `[num,…]`, 300-char cap) with a dedicated unit test — privacy contract holds at the
  logging boundary, not just the return path.
- **Web enqueue moved** `services/report-queue.ts` → `jobs/report-process.ts` per the
  ARCH system-overview, gaining the contract's missing `retryDelay`/`retryBackoff`
  (the moved test's new assertion was red for the right reason before the fix).
- **Contract observations** (payload schemas not in `packages/contracts`, no
  ml-openapi generator, clear-on-success unspecified, unindexed
  `report_images.report_id`, singleton-key prose conflict, modelVersions/lockfile
  alignment) recorded in the task file for a future `TMU-CTR-*` — no contract file
  touched.

## Verdict

**APPROVE** — all acceptance criteria met, gate green (393 tests, +46), idempotency and
dead-letter behaviour proven on a live scratch DB, privacy assertions in place, no
BLOCKER/MAJOR findings.
