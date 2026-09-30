---
id: TMU-META-001
title: Post-merge bookkeeping — OPS-001/OPS-011 DONE and DEC-019 tables
status: TODO
lane: meta
slug: post-merge-bookkeeping
milestone: M0
priority: P1
owner: docs-keeper
deps: [TMU-OPS-001, TMU-OPS-011]
refs: [WF-GIT, DEC-019]
created: 2026-09-30
updated: 2026-09-30
---

# TMU-META-001 — Post-merge bookkeeping: OPS-001/OPS-011 DONE and DEC-019 tables

## Goal

Close loop step 13 for TMU-OPS-001 and TMU-OPS-011 (mark `DONE`, regenerate the generated
indexes) and record DEC-019 in the two decision tables, which are `meta`-lane files and could
not be edited on the `ops` branch (the lane check enforced this).

## Context

- TMU-OPS-001 merged to `main` as `44d2ce9` (PR #1). Its task file still reads `REVIEW`.
- TMU-OPS-011 merges in the same PR series; its task file is `IN_PROGRESS` until this runs.
- The merge-gate rule itself (DEC-019) is already written into the ops-lane workflow docs
  (`AGENTS.md`, `02-agent-loop.md`, `01-git-workflow.md`) by TMU-OPS-011. Only the two decision
  tables remain.
- `docs/01-product/12-assumptions-and-decisions.md` and `docs/08-project/decisions-log.md` are
  `meta` lane (`.agent/lanes.json`).

## Acceptance criteria

- [ ] `docs/08-project/tasks/TMU-OPS-001.md` front-matter status is `DONE` with the merge commit
      and PR link in its Progress log.
- [ ] `docs/08-project/tasks/TMU-OPS-011.md` front-matter status is `DONE` with its PR link.
- [ ] DEC-019 row exists in both `docs/08-project/decisions-log.md` and
      `docs/01-product/12-assumptions-and-decisions.md`, matching the wording agreed with the
      repo owner: *orchestrator holds merge authority at loop step 12; a human may still merge;
      breaking/irreversible contract or migration PRs stop for a human*.
- [ ] `node scripts/backlog-index.mjs` regenerates `backlog.md`/`status.md` with M0 showing
      OPS-001 and OPS-011 `DONE`.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/08-project/tasks/TMU-OPS-001.md`, `docs/08-project/tasks/TMU-OPS-011.md`
- `docs/08-project/decisions-log.md`
- `docs/01-product/12-assumptions-and-decisions.md`
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated)

## Out of scope

- Traceability-matrix rows (no FR/API touched in M0).
- `docs/04-contracts/CHANGELOG.md` (no contract change).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-30 | orchestrator | task filed | created after the ops lane check rejected the meta-lane edits |
| | | | |

### Plan

1. Mark OPS-001 and OPS-011 `DONE` with PR/commit evidence.
2. Add the DEC-019 row to both decision tables.
3. Regenerate `backlog.md`/`status.md`.
4. `pnpm gate`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)