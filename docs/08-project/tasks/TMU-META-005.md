---
id: TMU-META-005
title: Sync meta-lane registers after M1 doc reviews (decisions log, traceability matrix)
status: TODO
lane: meta
slug: sync-meta-registers-m1
milestone: M1
priority: P1
owner: docs-keeper
deps: [TMU-DOC-003, TMU-DOC-008, TMU-DOC-019]
refs: [DECISIONS, TRACEABILITY, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-META-005 — Sync meta-lane registers after M1 doc reviews (decisions log, traceability matrix)

> Filed during `TMU-META-004` review cycle 1 (finding 3): three `lane: docs` tasks
> (`TMU-DOC-003`, `TMU-DOC-008`, `TMU-DOC-019`) need updates in `docs/08-project/**` files that
> only the meta lane may edit — `scripts/check-lane.sh` fails a docs branch on them. Those tasks
> record handoffs in their Progress logs; this task applies them.

## Goal

Apply the meta-lane half of the M1 document work: write the new OQ-deferral DEC entries into
`docs/08-project/decisions-log.md` (handoff from `TMU-DOC-003`/`TMU-DOC-008`) and update
`docs/08-project/traceability-matrix.md` so it has no orphan or missing rows for the filed M1
tasks (handoff from `TMU-DOC-019`) — both files sit under `docs/08-project/**`, which only the
meta lane owns.

## Context

- `_common` in `.agent/lanes.json` covers only `docs/08-project/{tasks,reviews,blockers}/**`,
  `backlog.md`, `status.md` — the decisions log and traceability matrix are **not** in it, so a
  `lane: docs` branch fails the lane check when it touches them (same class as the DEC-019 rows
  moved to `TMU-META-001` in the TMU-OPS-011 review).
- Inputs are the handoff rows the source tasks write into their own Progress logs:
  `TMU-DOC-003` (new DEC IDs + summaries for the OQ-2..5 deferrals) and `TMU-DOC-019` (matrix
  rows missing/with real backlog IDs).
- `TMU-DOC-020` (M1 exit) depends on this task, so the exit checklist cannot pass while the
  meta registers are stale.
- `docs-keeper` is the owner whose agent role is exactly this: update task status, backlog
  index, traceability matrix and logs after work lands.

## Acceptance criteria

- [ ] Every DEC entry added by `TMU-DOC-003`/`TMU-DOC-008` (as listed in their Progress logs)
      appears in `docs/08-project/decisions-log.md` with matching IDs; the log's existing
      format/order conventions are preserved.
- [ ] `docs/08-project/traceability-matrix.md` has no orphan row and lists the M1 filed tasks
      (per `TMU-DOC-019`'s handoff): Tasks column entries all match real backlog IDs.
- [ ] This branch's content edits are limited to the two registers (`decisions-log.md`,
      `traceability-matrix.md`); every changed path — including regenerated `_common` indexes —
      is reachable from the meta lane, so `bash scripts/check-lane.sh` passes.
- [ ] `node scripts/backlog-index.mjs` regenerated if statuses changed.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/08-project/decisions-log.md`
- `docs/08-project/traceability-matrix.md`
- `docs/08-project/tasks/TMU-META-005.md`
- `docs/08-project/backlog.md` / `status.md` (regenerated, `_common`, only if statuses change)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 review cycle 1, finding 3 (lane conflicts in DOC-003/008/019) |

## Blockers

(none)
