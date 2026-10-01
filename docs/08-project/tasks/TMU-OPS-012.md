---
id: TMU-OPS-012
title: Web Docker image and real docker-build CI job
status: REVIEW
lane: ops
slug: web-docker-image
milestone: M0
priority: P2
owner: ops-dev
deps: [TMU-OPS-003]
refs: [ARCH-STACK, WF-CICD, DEC-011]
created: 2026-09-30
updated: 2026-10-01
---

# TMU-OPS-012 — Web Docker image and real `docker-build` CI job

## Goal

Ship `infra/docker/web.Dockerfile` so the `docker-build` CI job (presence-guarded in TMU-OPS-011)
builds the real web image on `main`, and the compose stack can grow a web service later without a
CI gap.

## Context

- `docs/05-workflow/08-ci-cd.md`: `docker-build` "builds web image — catches Dockerfile drift",
  runs on `main` only.
- `infra/**` is the `ops` lane (`.agent/lanes.json`); the web app itself is TMU-OPS-003.
- The guard added in TMU-OPS-011 (`.github/workflows/ci.yml`) skips with a named notice while
  `infra/docker/web.Dockerfile` is absent; this task makes the skip branch dead.

## Acceptance criteria

- [x] `docker build -f infra/docker/web.Dockerfile .` succeeds locally and in CI.
- [x] The image runs `pnpm --filter @temuunair/web build` and starts the production server
      (`pnpm --filter @temuunair/web start`), using the repo's pnpm/Node pins (no floating tags).
- [x] `.dockerignore` (root or `infra/docker/`) keeps `node_modules`, `.next`, `.git`, `docs`,
      `services` and env files out of the context.
- [x] The `docker-build` job's skip branch is removed (the file now exists); CI is green on `main`.
- [x] `pnpm gate` green.

## Files expected to change

- `infra/docker/web.Dockerfile`, `infra/docker/.dockerignore` (or root `.dockerignore`)
- `.github/workflows/ci.yml` (remove the now-dead skip branch)
- `.agent/lanes.json`
- `scripts/checks/scaffold.test.mjs`
- `docs/08-project/tasks/TMU-OPS-012.md`

## Out of scope

- The ML service image (M5) and the compose `ml` service block.
- Publishing the image to a registry (M9 deployment).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-30 | orchestrator | task filed | split out of TMU-OPS-003 after review BLOCKER 1 (infra is ops-lane) |
| 2026-10-01 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-012` @ `0f674fc`; `pnpm i` OK; baseline gate green |
| 2026-10-01 | orchestrator | 1 PICK | task picked; status → `IN_PROGRESS` |
| 2026-10-01 | ops-dev | 4 RED | updated `scripts/checks/scaffold.test.mjs` to assert `infra/docker/web.Dockerfile` exists and CI skip branch removed; test failed with `AssertionError: expected false to be true` |
| 2026-10-01 | ops-dev | 5 GREEN | implemented `infra/docker/web.Dockerfile` (multi-stage, Node 24.12.0-bookworm-slim, pnpm 10.34.6), `.dockerignore` and `infra/docker/.dockerignore`; removed skip branch in `.github/workflows/ci.yml`; updated `scaffold.test.mjs` and `.agent/lanes.json` |
| 2026-10-01 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` (139 tests passed across 16 test files) |
| 2026-10-01 | git-steward | 8 COMMIT/PUSH | commit `5d0f458` pushed; draft PR #22 opened |
| 2026-10-01 | reviewer | 9 REVIEW c1 | verdict `CHANGES`: BLOCKER (Corepack cache permission under non-root user), MAJOR (prune devDependencies), MINORs -> `docs/08-project/reviews/TMU-OPS-012.md` |
| 2026-10-01 | ops-dev | 5 FIX c1 | switched to global `npm install -g pnpm@10.34.6`; added `pnpm prune --prod` in builder; created `nextjs` home directory; gate green |
| 2026-10-01 | reviewer | 9 REVIEW c2 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR) |

### Plan

1. Add the multi-stage Dockerfile pinned to the repo's Node/pnpm versions.
2. Add the dockerignore; build locally.
3. Remove the CI skip branch; verify the job builds.
4. `pnpm gate`.

## Evidence

- Red: `pnpm vitest run scripts/checks/scaffold.test.mjs` failed before implementation: `AssertionError: expected false to be true` on `existsSync("infra/docker/web.Dockerfile")`.
- Green: `pnpm vitest run scripts/checks/scaffold.test.mjs` passed 30/30; `pnpm gate` passed with 139 unit tests across 16 test files.
- PR: https://github.com/HanifIsya/temuUNAIR-v2/pull/22
- Review: `docs/08-project/reviews/TMU-OPS-012.md` (cycle 1 CHANGES -> cycle 2 pending)

## Blockers

(none)
