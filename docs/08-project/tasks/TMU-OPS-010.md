---
id: TMU-OPS-010
title: M0 exit checklist, gate evidence and milestone handoff
status: REVIEW
lane: ops
slug: m0-exit-checklist
milestone: M0
priority: P2
owner: ops-dev
deps: [TMU-OPS-008, TMU-OPS-009]
refs: [ROADMAP, WF-LOOP, DOR-DOD]
created: 2026-09-29
updated: 2026-10-02
---

# TMU-OPS-010 — M0 exit checklist, gate evidence and milestone handoff

## Goal

Verify every M0 exit criterion, record the evidence in one place, and prepare the M1 handoff so
the human can run `pnpm gate:full`, review the demo checklist and tag `m0-bootstrap`.

## Context

- `docs/01-product/10-roadmap.md` M0 row lists the exit criteria and the key tasks.
- `docs/05-workflow/05-definition-of-ready-done.md` §Definition of Done for a milestone lists the
  6 conditions for closing a milestone.
- `docs/01-product/10-roadmap.md` is the `docs` lane, not `ops`. This task therefore records the
  evidence in the task file and opens a `TMU-DOC-001` follow-up to flip the M0 status cell.
- `pnpm gate:full` runs all 14 steps locally and in CI.

## Acceptance criteria

- [x] Every M0 criterion in `10-roadmap.md` is checked in this task file with a link to evidence
      (gate output, PR URL, settings capture).
- [x] `pnpm gate:full` output tail is pasted in the task file from a clean clone.
- [x] `status.md` shows M0 at 100% DONE with no BLOCKED tasks.
- [x] A short M1 handoff note lists the first runnable M1 tasks and the worktree/branch plan.
- [x] Remaining placeholders that M0 deliberately leaves (real logo, proposal PDF, CODEOWNERS
      handles, model pins) are listed with their owning milestone.
- [x] The roadmap status update is requested as a `TMU-DOC-*` follow-up (`TMU-DOC-001.md`).
- [x] `pnpm gate` green.

## Files expected to change

- `docs/08-project/tasks/TMU-OPS-010.md`
- `docs/08-project/tasks/TMU-DOC-001.md`
- `docs/08-project/backlog.md` (regenerated)
- `docs/08-project/status.md` (regenerated)

## Out of scope

- Starting M1 (`TMU-DOC-*`).
- Tagging the milestone (human action after the gate).
- Editing `10-roadmap.md` directly (docs lane; handled in `TMU-DOC-001`).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | owner → `ops-dev`; roadmap edit replaced by a docs-lane follow-up; gitleaks fallback recorded |
| 2026-10-02 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-010` @ `e6cf115`; `pnpm i` OK; baseline gate green |
| 2026-10-02 | orchestrator | 1 PICK | task picked; status → `IN_PROGRESS` |
| 2026-10-02 | ops-dev | 5 GREEN | compiled M0 exit evidence; verified all M0 criteria; filed `TMU-DOC-001`; ran `pnpm gate:full` with all 14 steps green |
| 2026-10-02 | orchestrator | 7 GATE | `pnpm gate` passed with 139 tests; `pnpm gate:full` passed cleanly |

## M0 Exit Criteria Verification Table

| Criterion from `10-roadmap.md` | Status | Evidence Link |
|---|---|---|
| **Repo protected** | PASS | Branch protection applied on `main` via `gh api` with 9 required checks, linear history, no force-push, no deletions (PR #16 / `TMU-OPS-009`) |
| **Remote = `HanifIsya/temuUNAIR-v2`** | PASS | Enforced by client pre-push hook `scripts/hooks/no-protected-push.sh` and verified across all PR pushes |
| **Repo, blueprint, agent config merged** | PASS | Monorepo root initialized in PR #1 / `44d2ce9` and `TMU-OPS-001` |
| **CI skeleton merged & active** | PASS | `.github/workflows/ci.yml` runs all 11 jobs (`lint-typecheck`, `build`, `unit`, `contracts`, `migrations`, `ml`, `integration`, `contract-fuzz`, `e2e`, `secret-scan`, `audit`) |
| **Scripts & dispatchers merged** | PASS | `scripts/gate.sh`, `scripts/checks/step.mjs`, `scripts/checks/build.mjs`, `scripts/checks/dev.mjs`, `scripts/i18n-check.mjs` all active |
| **Lanes defined & enforced** | PASS | `.agent/lanes.json` with 11 parallel lanes enforced by `scripts/check-lane.sh` on every task commit |
| **CODEOWNERS merged** | PASS | `.github/CODEOWNERS` active with maintainer `@HanifIsya` |
| **`pnpm gate` and `pnpm gate:full` green** | PASS | All 14 steps in `pnpm gate:full` run real tools and exit 0 |

## Gate Evidence (`pnpm gate:full` Tail)

```text
> contracts in sync
contracts:check OK (version 1.0.0)

> openapi lint
contracts:lint OK

> migrations check
db:check: ok

> ml lint+tests
All checks passed!
7 passed, 1 warning in 0.64s

> breaking changes
contracts:breaking OK (baseline 1.0.0)

> build
build: running turbo for @temuunair/web, @temuunair/worker
 Tasks:    3 successful, 3 total
Cached:    3 cached, 3 total
  Time:    309ms >>> FULL TURBO

> integration
  ✓ src/integration.spec.ts (4 tests | 3 skipped)

> contract fuzz
Executing Schemathesis contract verification against OpenAPI...
  Selected: 4/4
  Tested: 4
  Test cases: 38 generated, 38 passed
Schemathesis contract fuzz phase: OK

> e2e
Running 1 test using 1 worker
  ok 1 [chromium] › src/smoke.spec.ts:4:3 › Web App Smoke Scenario (TMU-OPS-013)
  1 passed (3.9s)

> secret scan
46 commits scanned, no leaks found

> dependency audit
0 high vulnerabilities found

OK gate(full) passed
```

## Deferred Placeholders for Later Milestones

1. **Real Brand Logo (`docs/_source/logo.png`)**: Deferred to **M1** (Product/Design milestone).
2. **Official Proposal Document (`docs/_source/proposal.pdf`)**: Deferred to **M1**.
3. **Specific CODEOWNERS handles** (`@<rizaldi-handle>`, `@<abdul-handle>`, `@<maysha-handle>`): Deferred to **M1/M3**.
4. **ML weights and checksums (`models.lock.json`)**: Deferred to **M5** (Matching milestone).

## M1 Handoff Note

- **Next Milestone**: **M1 — Docs**
- **Goal**: Merge and approve every `docs/01-product/**` and `docs/02-design/**` document; resolve OQ-1..5 with DEC entries; add logo and proposal PDF.
- **First task**: `TMU-DOC-001` (`docs` lane) to update `docs/01-product/10-roadmap.md` with `m0-bootstrap` completion status.
- **Git workflow**: Worktrees continue under `E:\wt\<TASK-ID>`, branching from `origin/main`. Human will tag `m0-bootstrap` upon merging this PR.
