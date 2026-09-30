---
id: TMU-OPS-012
title: Web Docker image and real docker-build CI job
status: TODO
lane: ops
slug: web-docker-image
milestone: M0
priority: P2
owner: ops-dev
deps: [TMU-OPS-003]
refs: [ARCH-STACK, WF-CICD, DEC-011]
created: 2026-09-30
updated: 2026-09-30
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

- [ ] `docker build -f infra/docker/web.Dockerfile .` succeeds locally and in CI.
- [ ] The image runs `pnpm --filter @temuunair/web build` and starts the production server
      (`pnpm --filter @temuunair/web start`), using the repo's pnpm/Node pins (no floating tags).
- [ ] `.dockerignore` (root or `infra/docker/`) keeps `node_modules`, `.next`, `.git`, `docs`,
      `services` and env files out of the context.
- [ ] The `docker-build` job's skip branch is removed (the file now exists); CI is green on `main`.
- [ ] `pnpm gate` green.

## Files expected to change

- `infra/docker/web.Dockerfile`, `infra/docker/.dockerignore` (or root `.dockerignore`)
- `.github/workflows/ci.yml` (remove the now-dead skip branch)

## Out of scope

- The ML service image (M5) and the compose `ml` service block.
- Publishing the image to a registry (M9 deployment).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-30 | orchestrator | task filed | split out of TMU-OPS-003 after review BLOCKER 1 (infra is ops-lane) |
| | | | |

### Plan

1. Add the multi-stage Dockerfile pinned to the repo's Node/pnpm versions.
2. Add the dockerignore; build locally.
3. Remove the CI skip branch; verify the job builds.
4. `pnpm gate`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
