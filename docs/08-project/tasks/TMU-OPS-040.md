---
id: TMU-OPS-040
title: "Docker build: set CI=true for pnpm prune non-interactive execution"
status: DONE
lane: ops
slug: docker-prune-ci
milestone: M3
priority: P1
owner: ops-dev
deps: [TMU-OPS-038]
refs: [WF-CICD, TMU-OPS-012, TMU-OPS-038]
created: 2026-10-05
updated: 2026-10-05
---

# TMU-OPS-040 — Docker build: set CI=true for pnpm prune

## Goal

Following TMU-OPS-038, the `docker-build` job progressed past dependency installation
and Next.js production compilation, but failed at stage 3 (`builder` step 5/5) on:
```
ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY Aborted removal of modules directory due to no TTY
If you are running pnpm in CI, set the CI environment variable to "true", or set "confirmModulesPurge" to "false".
```
In pnpm v10, `pnpm prune --prod` prompts for interactive confirmation before removing
directories unless running under a CI environment or with `confirmModulesPurge=false`.

Set `ENV CI=true` in `infra/docker/web.Dockerfile` so `pnpm prune --prod` executes
non-interactively without failing on no-TTY environments.

## Acceptance criteria

- [x] `infra/docker/web.Dockerfile` sets `ENV CI=true` for non-interactive pnpm operations.
- [x] `pnpm gate` (quick) green on the branch.
- [x] PR CI green.
- [x] Post-merge main push CI: `docker-build` job passes.
- [x] Task file updated, backlog/status regenerated, review recorded.

## Files expected to change

- `infra/docker/web.Dockerfile`
- `docs/08-project/tasks/TMU-OPS-040.md`
- `docs/08-project/reviews/TMU-OPS-040.md`
- `docs/08-project/backlog.md`, `docs/08-project/status.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-05 | ops-dev | 0 SYNC | main push run `37280048214` (on `dbf804c`): `secret-scan` passed; `docker-build` failed at `RUN pnpm prune --prod` with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` |
| 2026-10-05 | ops-dev | 1 PICK | branch `agent/ops/TMU-OPS-040-docker-prune-ci` from `origin/main` (`dbf804c`) |
| 2026-10-05 | ops-dev | 5 GREEN | `infra/docker/web.Dockerfile`: added `ENV CI=true` in `base` stage to enable non-interactive pnpm prune |
| 2026-10-05 | ops-dev | 7 GATE | `pnpm gate` (quick) → `OK gate(quick) passed`, exit 0 |
| 2026-10-05 | ops-dev | 8 COMMIT/PUSH | committed `b449702` and pushed to `origin/agent/ops/TMU-OPS-040-docker-prune-ci` |
| 2026-10-05 | ops-dev | 9 REVIEW | adversarial reviewer cycle 1: **APPROVE** (0 B / 0 M / 1 MINOR closed); recorded in `docs/08-project/reviews/TMU-OPS-040.md` |
| 2026-10-05 | ops-dev | 10 SHIP | draft PR [#48](https://github.com/HanifIsya/temuUNAIR-v2/pull/48) created, marked ready for review |
| 2026-10-05 | ops-dev | 11 CI | 10 required jobs pass (`build`, `contract-fuzz`, `contracts`, `e2e`, `integration`, `lint-typecheck`, `migrations`, `ml`, `secret-scan`, `unit`), `docker-build` skips on PR, `audit` advisory fail |
| 2026-10-05 | ops-dev | 12 MERGE | PR #48 squash-merged to `origin/main` (step 12 MERGE GATE per DEC-020) |
| 2026-10-05 | ops-dev | 13 POST-MERGE | task flipped to DONE; backlog/status regenerated; main branch synced |

## Definition of Done

See `docs/05-workflow/05-definition-of-ready-done.md`.
