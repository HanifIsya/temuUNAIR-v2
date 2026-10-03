---
id: TMU-DOC-008
title: Review and approve the success-metrics and decisions docs
status: DONE
lane: docs
slug: review-metrics-decisions
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-003]
refs: [METRICS, DECISIONS, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
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

- [x] Both documents contain every section their Blueprint §4 row requires.
- [x] The DEC table contains the `TMU-DOC-003` OQ deferral DECs with unique, contiguous IDs;
      handoff recorded: any resulting `decisions-log.md` deltas are listed in the Progress log
      for `TMU-META-005` to apply.
- [x] Every metric row maps to an instrumentation source or names the gap.
- [x] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [x] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/01-product/11-success-metrics.md`
- `docs/01-product/12-assumptions-and-decisions.md`
- `docs/08-project/tasks/TMU-DOC-008.md`
- `docs/08-project/reviews/TMU-DOC-008.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-008-review-metrics-decisions` created from `main` (`12be636`); status → `IN_PROGRESS`; deps `TMU-DOC-003` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit METRICS against Blueprint §4, verify all 5 headline metrics + instrumentation map, refresh source_refs to proposal §B Tujuan 1-5 via extract, bump status to approved; 2) Audit DECISIONS, verify DEC-001..024 contiguity and status, confirm TMU-DOC-003 handoff stands, bump status to approved; 3) Run pnpm gate; 4) Write review REV-TMU-DOC-008; 5) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | METRICS: verified 5 headline + 7 supporting metrics, mapped instrumentation, refreshed source_refs to extract, status approved; DECISIONS: verified DEC-001..024 contiguity, confirmed existing TMU-META-005 handoff stands with no new deltas, status approved; both updated bumped to 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-008.md`; METRICS + DECISIONS meet Blueprint §4 |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review/approval task; ACs are specification audit and metric instrumentation checks recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-008.md`

## Blockers

(none)
