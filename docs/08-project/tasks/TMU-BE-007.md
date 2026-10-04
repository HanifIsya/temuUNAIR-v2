---
id: TMU-BE-007
title: report.process job + ML client (BE-07, BE-06) with needs_reprocess and ML_MODE=stub
status: TODO
lane: be
slug: be-report-process-job
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-006]
refs: [BE-07, BE-06, ARCH-JOBS, ARCH-ML, BE-05]
created: 2026-10-03
updated: 2026-10-03
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

- [ ] Handler idempotent (double-run exits early per BE-07 rules); retries/backoff match the contract.
- [ ] Stub mode produces schema-valid features; worker test asserts no image bytes/t bodies logged.
- [ ] Dead-letter flips `needs_reprocess` and keeps the report usable.
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/worker/src/jobs/report-process.ts`, `apps/web/src/server/jobs/*`, `apps/web/src/server/ml/client.ts`
- matching tests
- `docs/08-project/tasks/TMU-BE-007.md`
