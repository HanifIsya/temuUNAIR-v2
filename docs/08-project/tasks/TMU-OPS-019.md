---
id: TMU-OPS-019
title: Correct the Playwright install command in the e2e docs
status: DONE
lane: qa
slug: e2e-docs-playwright-command
milestone: M0
priority: P3
owner: qa-engineer
deps: [TMU-OPS-017]
refs: [WF-CICD, TMU-OPS-013]
created: 2026-10-01
updated: 2026-10-02
---

# TMU-OPS-019 — Correct the Playwright install command in the e2e docs

## Goal

One-line doc correction so contributors run the Playwright install through the package that
owns the dependency, matching the CI behaviour introduced by TMU-OPS-017.

## Context

- `docs/06-quality/03-e2e-scenarios.md:46` still instructs root-level
  `pnpm exec playwright install --with-deps chromium`.
- The workspace root has no `playwright` dependency, so that command fails with
  `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL` (reproduced during TMU-OPS-017's RED step).
- CI now installs with `pnpm --filter @temuunair/e2e-tests exec playwright install
  --with-deps chromium` (commit `47976c3`).
- Filed from REV-TMU-OPS-017 MINOR 1 (docs/qa lane — correctly not touched by the ops task).

## Acceptance criteria

- [x] The install instruction in `docs/06-quality/03-e2e-scenarios.md` uses
      `pnpm --filter @temuunair/e2e-tests exec playwright install --with-deps chromium`.
- [x] No other stale root-level `pnpm exec playwright` instructions remain in `docs/`.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/06-quality/03-e2e-scenarios.md`
- `docs/08-project/tasks/TMU-OPS-019.md`

## Out of scope

- The e2e scenarios themselves (TMU-OPS-013), CI (TMU-OPS-017).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-01 | orchestrator | task filed | REV-TMU-OPS-017 MINOR 1 |
| 2026-10-02 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-019` @ `fd55448`; `pnpm i` OK; baseline gate green |
| 2026-10-02 | orchestrator | 1 PICK | task picked; status → `IN_PROGRESS` |
| 2026-10-02 | qa-engineer | 5 GREEN | updated `docs/06-quality/03-e2e-scenarios.md:46` to `pnpm --filter @temuunair/e2e-tests exec playwright install --with-deps chromium`; grep confirmed 0 remaining stale instructions in `docs/` |
| 2026-10-02 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` (139 tests passed) |
| 2026-10-02 | git-steward | 8 COMMIT/PUSH | `26acc83` pushed; PR #28 opened |
| 2026-10-02 | reviewer | 9 REVIEW | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) -> `docs/08-project/reviews/TMU-OPS-019.md` |
| 2026-10-02 | orchestrator | 11 CI | all 11 checks green |

### Plan

1. Correct the install command in `docs/06-quality/03-e2e-scenarios.md`.
2. Grep for any remaining root `pnpm exec playwright` instructions in `docs/`.
3. `pnpm gate`.

## Evidence

- Red: `docs/06-quality/03-e2e-scenarios.md:46` had `pnpm exec playwright install --with-deps chromium`.
- Green: Updated to `pnpm --filter @temuunair/e2e-tests exec playwright install --with-deps chromium`; `pnpm gate` passed with 139 tests.
- PR: https://github.com/HanifIsya/temuUNAIR-v2/pull/28
- Review: `docs/08-project/reviews/TMU-OPS-019.md` (APPROVE)

## Blockers

(none)
