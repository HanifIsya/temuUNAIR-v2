---
id: TMU-OPS-007
title: Worker package skeleton with pg-boss bootstrap
status: TODO
lane: be
slug: worker-skeleton
milestone: M0
priority: P2
owner: backend-dev
deps: [TMU-OPS-002]
refs: [ARCH-STACK, BE-07, DEC-013]
created: 2026-09-29
updated: 2026-09-30
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

- [ ] `pnpm --filter @temuunair/worker build` succeeds.
- [ ] `pnpm dev:worker` starts, connects to Postgres from `DATABASE_URL`, registers no-op
      handlers for the queues declared in BE-07, and exits cleanly on SIGTERM/SIGINT.
- [ ] A unit test asserts the queue registry matches the BE-07 queue list exactly (no extras).
- [ ] Job payloads are parsed with the contract schema, never cast.
- [ ] `pnpm gate` green.

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

### Plan

1. Scaffold `apps/worker` against the shared config presets.
2. Add the pg-boss bootstrap with the BE-07 queue registry and shutdown handling.
3. Add the registry-vs-contract test.
4. `pnpm gate`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
