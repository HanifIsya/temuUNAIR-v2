---
id: TMU-DOC-010
title: Review and approve the operations-model and user-research docs
status: DONE
lane: docs
slug: review-ops-research-docs
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [OPS-MODEL, RESEARCH, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-010 — Review and approve the operations-model and user-research docs

## Goal

Review `docs/01-product/14-operations-model.md` and `15-user-research-plan.md` against their
Blueprint §4 rows, fix findings, and approve both documents.

## Context

- Files: `docs/01-product/14-operations-model.md`, `15-user-research-plan.md`.
- Blueprint §4 requires: OPS-MODEL — who physically runs lost-and-found (security posts?), SLAs,
  drop points, moderator per campus, escalation; RESEARCH — interview/survey script, usability
  test plan.
- Open items that belong to other milestones (OQ-3 drop points/hours) stay open under their
  `TMU-DOC-003` DECs — do not invent campus operations facts (write-doc rule 6).

## Acceptance criteria

- [x] Each document contains every section its Blueprint §4 row requires.
- [x] No UNAIR operations fact is invented: unknowns remain `OPEN QUESTION` or OQ-linked.
- [x] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [x] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/01-product/14-operations-model.md`
- `docs/01-product/15-user-research-plan.md`
- `docs/08-project/tasks/TMU-DOC-010.md`
- `docs/08-project/reviews/TMU-DOC-010.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-010-review-ops-research-docs` created from `main` (`8225414`); status → `IN_PROGRESS`; deps `TMU-DOC-002` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit OPS-MODEL against Blueprint §4 (physical operations, SLAs, drop points, campus moderators, escalation path, preserve OQ-3 link without inventing facts), bump status to approved; 2) Audit RESEARCH against Blueprint §4 (screener, interview script, usability test tasks T1-T8, metrics), bump status to approved; 3) Run pnpm gate; 4) Write review REV-TMU-DOC-010; 5) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | OPS-MODEL: verified physical roles, SLAs, drop points, escalation, status approved; RESEARCH: verified screener, 7-question script, T1-T8 usability test plan, status approved; both updated bumped to 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-010.md`; OPS-MODEL + RESEARCH meet Blueprint §4 |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review/approval task; ACs are specification audit and operations fidelity checks recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-010.md`

## Blockers

(none)
