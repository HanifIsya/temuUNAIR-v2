---
id: TMU-OPS-017
title: Fix the e2e CI job guard and Playwright install path
status: TODO
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

### Plan

1. Repoint the guard to `tests/e2e/package.json` and update the skip notice.
2. Install Playwright via `pnpm --filter @temuunair/e2e-tests exec`.
3. Update the scaffold test assertion; `pnpm gate`.
4. CI check on a branch with `apps/web` present and `tests/e2e` absent (skip must be green).

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
