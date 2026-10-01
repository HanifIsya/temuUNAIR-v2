---
id: TMU-META-003
title: Record DEC-020 — any agent may merge at step 12
status: TODO
lane: meta
slug: record-dec-020
milestone: M0
priority: P1
owner: docs-keeper
deps: [TMU-OPS-016]
refs: [DEC-020, WF-LOOP]
created: 2026-09-30
updated: 2026-09-30
---

# TMU-META-003 — Record DEC-020 in the two decision tables

## Goal

Record the owner decision of 2026-09-30 — **any agent may merge at loop step 12; a human may
still merge; breaking/irreversible contract or migration PRs still stop for a human** — as
**DEC-020** in both decision tables, superseding DEC-019's orchestrator-only merge authority.

## Context

- The decision is implemented by TMU-OPS-016 (ops lane, `gh pr merge*: allow` globally + agent
  rules); the two decision tables are meta-lane files, so they are out of TMU-OPS-016's lane.
- `docs/08-project/decisions-log.md:39` and `docs/01-product/12-assumptions-and-decisions.md:36`
  hold the DEC-019 row to supersede. DEC-019's other half (no approval count on `main`) stands.

## Acceptance criteria

- [ ] DEC-020 row exists in `docs/08-project/decisions-log.md` and
      `docs/01-product/12-assumptions-and-decisions.md` with the agreed wording and status
      `accepted` (confirmer: Repo owner, recorded 2026-09-30).
- [ ] The DEC-019 row is marked superseded on the merge-authority half (or annotated), so the two
      tables do not contradict.
- [ ] `pnpm gate` green.
- [ ] Progress log and Evidence filled; task status `DONE` after merge.

## Files expected to change

- `docs/08-project/decisions-log.md`
- `docs/01-product/12-assumptions-and-decisions.md`
- `docs/08-project/tasks/TMU-META-003.md`

## Out of scope

- The ops-lane wording changes (TMU-OPS-016) and `docs/05-workflow/**`.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-30 | orchestrator | task filed | owner decision 2026-09-30; tables are meta lane |

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)

## Blockers

(none)
