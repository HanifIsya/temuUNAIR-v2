---
id: TMU-OPS-019
title: Correct the Playwright install command in the e2e docs
status: TODO
lane: qa
slug: e2e-docs-playwright-command
milestone: M0
priority: P3
owner: qa-engineer
deps: [TMU-OPS-017]
refs: [WF-CICD, TMU-OPS-013]
created: 2026-10-01
updated: 2026-10-01
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

- [ ] The install instruction in `docs/06-quality/03-e2e-scenarios.md` uses
      `pnpm --filter @temuunair/e2e-tests exec playwright install --with-deps chromium`.
- [ ] No other stale root-level `pnpm exec playwright` instructions remain in `docs/`.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/06-quality/03-e2e-scenarios.md`

## Out of scope

- The e2e scenarios themselves (TMU-OPS-013), CI (TMU-OPS-017).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-01 | orchestrator | task filed | REV-TMU-OPS-017 MINOR 1 |

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
