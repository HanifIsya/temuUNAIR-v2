---
id: TMU-OPS-007
title: Worker package skeleton with pg-boss bootstrap
status: REVIEW
lane: be
slug: worker-skeleton
milestone: M0
priority: P2
owner: backend-dev
deps: [TMU-OPS-002]
refs: [ARCH-STACK, BE-07, DEC-013]
created: 2026-09-29
updated: 2026-10-01
---

# TMU-OPS-007 — Worker package skeleton with pg-boss bootstrap

## Goal

Stand up `apps/worker` as a runnable pg-boss consumer process with typed queue registration and
graceful shutdown, so `pnpm dev:worker` works and M5 job tasks add handlers instead of plumbing.

## Context

- `docs/04-contracts/backend/BE-07-job-and-event-contract.md` — queues, payloads, retries, idempotency.
- `docs/03-architecture/08-async-jobs-and-queues.md` — queue topology.
- DEC-013: pg-boss on Postgres, separate worker, no Redis.
- `scripts/checks/dev.mjs` already delegates `pnpm dev:worker` once `apps/worker/package.json`
  exists; `scripts/checks/build.mjs` likewise for `pnpm build`. **No root file needs to change.**

## Acceptance criteria

- [x] `pnpm --filter @temuunair/worker build` succeeds.
- [x] `pnpm dev:worker` starts, connects to Postgres from `DATABASE_URL`, registers no-op
      handlers for the queues declared in BE-07, and exits cleanly on SIGTERM/SIGINT.
- [x] A unit test asserts the queue registry matches the BE-07 queue list exactly (no extras).
- [x] Job payloads are parsed with the contract schema, never cast.
- [x] `pnpm gate` green.

## Files expected to change

- `apps/worker/**` (package.json, tsconfig.json, src/)
- `apps/worker/src/**/*.test.ts`
- `pnpm-lock.yaml`

## Out of scope

- Real handlers (matching, notifications, sweeps) — M5/M6 tasks.
- Scheduled/cron registration beyond declaring the queues.
- Root `package.json`/`scripts/**` edits.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | owner → `backend-dev` (lane `be` matches); root-script dependency removed |
| 2026-10-01 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-007`, branch `agent/be/TMU-OPS-007-worker-skeleton` @ `5c04133`; `pnpm i` OK; baseline gate green |
| 2026-10-01 | orchestrator | 1 PICK | task picked; status → `IN_PROGRESS` |
| 2026-10-01 | orchestrator | 2 READ | BE-07 queues, ARCH-JOBS, `scripts/checks/dev.mjs`, `scripts/checks/build.mjs` |
| 2026-10-01 | backend-dev | 4 RED | `apps/worker/src/registry.test.ts` written; `pnpm test:unit apps/worker` failed as expected: `Cannot find module './registry.js'` |
| 2026-10-01 | backend-dev | 5 GREEN | implemented `apps/worker/package.json`, `tsconfig.json`, `src/registry.ts`, `src/worker.ts`, `src/index.ts`, `src/worker.test.ts`; `pnpm test:unit apps/worker` passed 11/11 |
| 2026-10-01 | backend-dev | 6 REFACTOR | formatting clean via `prettier`; verified `pnpm --filter @temuunair/worker build` (`tsc -p tsconfig.json`) and `pnpm build` via turbo |
| 2026-10-01 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` (138 tests passed across 16 test files) |
| 2026-10-01 | git-steward | 8 COMMIT/PUSH | `dfcaf45` pushed; draft PR #15 opened |
| 2026-10-01 | reviewer | 9 REVIEW c1 | verdict `CHANGES`: M1 (algoVersion string), M2 (empty sweep nulls), M3 (worker test callback coverage) -> `docs/08-project/reviews/TMU-OPS-007.md` |
| 2026-10-01 | backend-dev | 5 FIX c1 | resolved M1, M2, M3, m1, m2; unit tests 139 passed |
| 2026-10-01 | reviewer | 9 REVIEW c2 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR) |

### Plan

1. Scaffold `apps/worker` against the shared config presets.
2. Add the pg-boss bootstrap with the BE-07 queue registry and shutdown handling.
3. Add the registry-vs-contract test.
4. `pnpm gate`.

## Evidence

- Red: `pnpm test:unit apps/worker` before implementation failed with `Cannot find module './registry.js'` (exit 1).
- Green: `pnpm test:unit apps/worker` passed 12/12 tests (registry 7, worker 5); `pnpm --filter @temuunair/worker build` emits clean JS to `dist/`; `pnpm gate` passed with 139 tests.
- PR: https://github.com/HanifIsya/temuUNAIR-v2/pull/15
- Review: `docs/08-project/reviews/TMU-OPS-007.md` (cycle 2 APPROVE)

## Blockers

(none)
