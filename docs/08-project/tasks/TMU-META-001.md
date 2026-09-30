---
id: TMU-META-001
title: Post-merge bookkeeping — OPS-001/OPS-011 DONE and DEC-019 tables
status: IN_PROGRESS
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

- [x] `docs/08-project/tasks/TMU-OPS-001.md` front-matter status is `DONE` with the merge commit
      and PR link in its Progress log.
- [x] `docs/08-project/tasks/TMU-OPS-011.md` front-matter status is `DONE` with its PR link.
- [x] `docs/08-project/tasks/TMU-OPS-015.md` front-matter status is `DONE` with its PR link
      (merged in the same series; not in the original criterion list).
- [x] DEC-019 row exists in both `docs/08-project/decisions-log.md` and
      `docs/01-product/12-assumptions-and-decisions.md`, matching the wording agreed with the
      repo owner: *orchestrator holds merge authority at loop step 12; a human may still merge;
      breaking/irreversible contract or migration PRs stop for a human*.
- [x] `node scripts/backlog-index.mjs` regenerates `backlog.md`/`status.md` with M0 showing
      OPS-001 and OPS-011 `DONE`.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/08-project/tasks/TMU-OPS-001.md`, `docs/08-project/tasks/TMU-OPS-011.md`,
  `docs/08-project/tasks/TMU-OPS-015.md` (merged in the same series)
- `docs/08-project/decisions-log.md`
- `docs/01-product/12-assumptions-and-decisions.md`
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated)
- `docs/08-project/reviews/TMU-META-001.md`

## Out of scope

- Traceability-matrix rows (no FR/API touched in M0).
- `docs/04-contracts/CHANGELOG.md` (no contract change).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-30 | orchestrator | task filed | created after the ops lane check rejected the meta-lane edits |
| 2026-09-30 | docs-keeper | 0 SYNC | worktree `E:\wt\TMU-META-001` fast-forwarded to `origin/main` @ `b7137d3`; OPS-001 merged `44d2ce9` (PR #1), OPS-011 merged `c066330` (PR #2), OPS-015 merged `b7137d3` (PR #3) |
| 2026-09-30 | docs-keeper | 4 RED | probe → 4 checks fail: DEC-019 missing in both tables; OPS-001/OPS-011 status `REVIEW` |
| 2026-09-30 | docs-keeper | 5 GREEN | statuses `DONE`, DEC-019 rows added, indexes regenerated (see Evidence) |
| 2026-09-30 | reviewer | 9 REVIEW c1 | verdict **APPROVE** — 0 BLOCKER/MAJOR, 6 MINOR (bookkeeping hygiene) → `docs/08-project/reviews/TMU-META-001.md` |
| 2026-09-30 | docs-keeper | 9 REVIEW c1 fix | all 6 MINORs fixed in this PR: stale PR evidence (OPS-001/015), criteria ticked (OPS-001/011/015), front-matter dates bumped, META-001 file list + red-evidence command |

### Plan

1. Mark OPS-001 and OPS-011 `DONE` with PR/commit evidence.
2. Add the DEC-019 row to both decision tables.
3. Regenerate `backlog.md`/`status.md`.
4. `pnpm gate`.

## Evidence

- Red: one-liner over the four checks →
  `node -e "const fs=require('fs');const dl=fs.readFileSync('docs/08-project/decisions-log.md','utf8');const dt=fs.readFileSync('docs/01-product/12-assumptions-and-decisions.md','utf8');const o1=fs.readFileSync('docs/08-project/tasks/TMU-OPS-001.md','utf8');const o11=fs.readFileSync('docs/08-project/tasks/TMU-OPS-011.md','utf8');const c=[['DEC-019 decisions-log',/DEC-019/.test(dl)],['DEC-019 12-assumptions',/DEC-019/.test(dt)],['OPS-001 DONE',/^status: DONE$/m.test(o1)],['OPS-011 DONE',/^status: DONE$/m.test(o11)]];let f=0;for(const[n,ok]of c){console.log((ok?'PASS':'FAIL')+' '+n);if(!ok)f++;}process.exit(f?1:0)"`
  → 4 fail: `DEC-019 decisions-log` FAIL, `DEC-019 12-assumptions` FAIL, `OPS-001 DONE` FAIL,
  `OPS-011 DONE` FAIL (exit 1).
- Green: same probe after the edits → all 4 PASS; `node scripts/backlog-index.mjs` →
  `Wrote backlog.md (16 tasks) and status.md`, M0 `DONE: 3` (OPS-001, OPS-011, OPS-015);
  `pnpm gate` → `OK gate(quick) passed` (26/26 unit).
- PR: (pending)
- Review: (pending)

## Blockers

(none)
