---
id: TMU-OPS-017
title: Fix the e2e CI job guard and Playwright install path
status: IN_PROGRESS
lane: ops
slug: e2e-ci-guard-fix
milestone: M0
priority: P1
owner: ops-dev
deps: []
refs: [WF-CICD, TMU-OPS-011, TMU-OPS-013]
created: 2026-10-01
updated: 2026-10-01
---

# TMU-OPS-017 — Fix the `e2e` CI job guard and Playwright install path

## Goal

Make the `e2e` CI job correct once `apps/web/package.json` exists: it must stay skipped until the
E2E scenarios package (`tests/e2e`, TMU-OPS-013) exists, and install Playwright through the
package that owns the dependency instead of the workspace root.

## Context

- `.github/workflows/ci.yml` guards the `e2e` job on `[ -f apps/web/package.json ]` and installs
  with `pnpm exec playwright install --with-deps chromium` at the repo root.
- Once TMU-OPS-003 lands `apps/web/package.json`, the guard flips on and the job runs — but the
  root workspace does not depend on `playwright`, so `pnpm exec playwright` fails
  (`ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`). Spike-proven on 2026-10-01.
- The job also has no scenarios to run until TMU-OPS-013 ships `tests/e2e` (its `test:e2e`
  dispatcher exits 0 meanwhile).
- `scripts/checks/scaffold.test.mjs:50-55` asserts the old guard string, so it must be updated in
  lockstep.

## Acceptance criteria

- [ ] The `e2e` job guard checks the E2E package (e.g. `tests/e2e/package.json`), not
      `apps/web/package.json`; the skip notice names TMU-OPS-013.
- [ ] The install step runs through the owning package
      (`pnpm --filter @temuunair/e2e-tests exec playwright install --with-deps chromium`) and only
      after TMU-OPS-013 exists.
- [ ] `scripts/checks/scaffold.test.mjs` asserts the new guard (and still asserts the ML skip).
- [ ] On a branch where `apps/web` exists but `tests/e2e` does not, CI `e2e` skips green.
- [ ] `pnpm gate` green.

## Files expected to change

- `.github/workflows/ci.yml` (`e2e` job)
- `scripts/checks/scaffold.test.mjs` (guard assertion)

## Out of scope

- The `tests/e2e` package itself (TMU-OPS-013).
- `docker-build` and other jobs (TMU-OPS-011/012).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-01 | orchestrator | task filed | split out of TMU-OPS-003 during 0 SYNC (CI prerequisite: web shell flips the old guard on) |
| 2026-10-01 | orchestrator | 3/5 | reproduced: `pnpm exec playwright install` at root → `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "playwright" not found` (exit 1); `tests/e2e` absent |
| 2026-10-01 | ops-dev | 4 RED | `scaffold.test.mjs` assertion repointed to `tests/e2e/package.json` first → `1 failed (26)`: `AssertionError … to contain 'tests/e2e/package.json'` (ci.yml still on old guard) |
| 2026-10-01 | ops-dev | 5 GREEN | `ci.yml` e2e job: guard → `tests/e2e/package.json`, Playwright via `pnpm --filter @temuunair/e2e-tests exec …`, skip echo names TMU-OPS-013, comment rewritten; `scaffold.test.mjs` 26/26; `pnpm gate` → `OK gate(quick) passed` (36 tests); diff = exactly 2 files (13+/8−) |
| 2026-10-01 | git-steward | 8 COMMIT/PUSH | `47976c3` `ci(e2e): guard the e2e job on tests/e2e and install Playwright in its package` pushed to `agent/ops/TMU-OPS-017-e2e-guard`; **`gh pr create` denied by session permissions** (`gh pr*` allowlist) → PR must be opened by a human from https://github.com/HanifIsya/temuUNAIR-v2/pull/new/agent/ops/TMU-OPS-017-e2e-guard |
| 2026-10-01 | reviewer | 9 REVIEW cycle 1 | **APPROVE** — all 5 ACs verified; MINOR 1 (stale doc command) filed as TMU-OPS-019, MINOR 2 (red evidence claimed-not-re-executed) noted; full document in `docs/08-project/reviews/TMU-OPS-017.md` |

### Notes

- **Cross-branch task file (REV cycle-2 N3):** this task file lives on the `fe` branch
  (`agent/fe/TMU-OPS-003-web-app-shell`, `_common` lane) and rides with PR #10; the fix commit
  `47976c3` lives on the ops branch. Do **not** add a second copy of this file to the ops PR —
  the rows above are the single record; they land on `main` when #10 merges (which must happen
  after this task's PR merges, so #10's CI can go green).

### Plan

1. Repoint the guard to `tests/e2e/package.json` and update the skip notice.
2. Install Playwright via `pnpm --filter @temuunair/e2e-tests exec`.
3. Update the scaffold test assertion; `pnpm gate`.
4. CI check on a branch with `apps/web` present and `tests/e2e` absent (skip must be green).

## Evidence

- Red: 2026-10-01 — assertion-first: after repointing the scaffold assertion to
  `tests/e2e/package.json`, `pnpm -s vitest run scripts/checks/scaffold.test.mjs` →
  `1 failed (26)` with `AssertionError: expected '# CI (Blueprint §7.10)…' to contain
  'tests/e2e/package.json'` (ci.yml untouched). Root reproduction earlier that day:
  `pnpm exec playwright install --with-deps chromium` → `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL
  Command "playwright" not found`, exit 1.
- Green: 2026-10-01 — `scaffold.test.mjs` 26/26; `pnpm gate` → `OK gate(quick) passed`
  (36 tests); `git diff --stat` = `.github/workflows/ci.yml | 14 ++++++------`,
  `scripts/checks/scaffold.test.mjs | 7 +++++--` (2 files, 13+/8−).
- PR: (pending)
- Review: (pending)

## Blockers

(none)
