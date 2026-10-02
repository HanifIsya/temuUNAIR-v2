---
id: TMU-DOC-008
title: Review and approve the success-metrics and decisions docs
status: TODO
lane: docs
slug: review-metrics-decisions
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-003]
refs: [METRICS, DECISIONS, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-008 — Review and approve the success-metrics and decisions docs

## Goal

Review `docs/01-product/11-success-metrics.md` and `12-assumptions-and-decisions.md` against
their Blueprint §4 rows, fix findings, and approve both — the decisions doc must already carry
the OQ deferrals `TMU-DOC-003` added, which is why this task runs after it.

## Context

- Files: `docs/01-product/11-success-metrics.md`, `12-assumptions-and-decisions.md`.
- Blueprint §4 requires: METRICS — activation, report→match rate, time-to-return, precision@k,
  claim success rate, with instrumentation mapping; DECISIONS — the DEC table from Blueprint
  §1.3, kept current.
- `docs/08-project/decisions-log.md` is the project-level log, but it is **meta-lane-only** —
  a `lane: docs` branch fails `scripts/check-lane.sh` on it. Handoff: record any DEC-ID deltas
  in this task's Progress log; `TMU-META-005` (meta lane) syncs the log.
- This file sits in the meta lane's exception list (`docs/01-product/12-*.md`) but is equally
  reachable from the docs lane's `docs/01-product/**` glob — a docs branch may edit it.

## Acceptance criteria

- [ ] Both documents contain every section their Blueprint §4 row requires.
- [ ] The DEC table contains the `TMU-DOC-003` OQ deferral DECs with unique, contiguous IDs;
      handoff recorded: any resulting `decisions-log.md` deltas are listed in the Progress log
      for `TMU-META-005` to apply.
- [ ] Every metric row maps to an instrumentation source or names the gap.
- [ ] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [ ] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/01-product/11-success-metrics.md`
- `docs/01-product/12-assumptions-and-decisions.md`
- `docs/08-project/tasks/TMU-DOC-008.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
