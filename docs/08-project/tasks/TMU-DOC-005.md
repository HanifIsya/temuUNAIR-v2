---
id: TMU-DOC-005
title: Review and approve the requirements docs (US, FR, NFR)
status: DONE
lane: docs
slug: review-requirements-docs
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [US, FR, NFR, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-005 — Review and approve the requirements docs (US, FR, NFR)

## Goal

Review `docs/01-product/04-user-stories.md`, `05-functional-requirements.md` and
`06-non-functional-requirements.md` against their Blueprint §4 rows, fix findings, and approve
the three documents.

## Context

- Files: `docs/01-product/04-user-stories.md`, `05-functional-requirements.md`,
  `06-non-functional-requirements.md`.
- Blueprint §4 requires: US — `US-###` "As a … I want … so that …" entries linked to FRs with
  priority; FR — `FR-<MOD>-###` for AUTH, REP, SRC, MAT, CLM, CHT, HND, NTF, MGT, ADM, I18N;
  NFR — performance, availability, security, privacy, accessibility, i18n, browser/device
  support, retention, scale numbers.
- Cross-doc invariants this group owns: every US links to at least one FR; every FR carries a
  MoSCoW priority; the FR module set matches the eleven modules above; NFR numbering is
  contiguous (`NFR-###`).
- `TMU-DOC-019` re-checks cross-references globally; this task owns the within-group defects.

## Acceptance criteria

- [x] Each of the three documents contains every section its Blueprint §4 row requires.
- [x] US↔FR links resolve (no US points at a missing FR, no orphan FR that no US/story map);
      MoSCoW priorities present on every FR.
- [x] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [x] Front-matter `status` `approved` (or `review` + filed follow-up naming the blocker) with
      `updated:` bumped.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/01-product/04-user-stories.md`
- `docs/01-product/05-functional-requirements.md`
- `docs/01-product/06-non-functional-requirements.md`
- `docs/08-project/tasks/TMU-DOC-005.md`
- `docs/08-project/reviews/TMU-DOC-005.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-005-review-requirements-docs` created from `main` (`5d12176`); status → `IN_PROGRESS`; deps `TMU-DOC-002` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit US against Blueprint §4, map unmapped FRs (FR-REP-011, FR-SRC-005..006, FR-MAT-006..007, FR-CLM-006..009, FR-CHT-003..004, FR-HND-003, FR-NTF-003/005/007, FR-MGT-002, FR-ADM-007..009, FR-I18N-003) into existing or added stories (US-044, US-045, US-057), refresh source_refs to proposal §C.2 via extract, bump status to approved; 2) Audit FR, refresh source_refs to proposal §C.2 via extract, verify all 59 FRs have MoSCoW priorities, bump status to approved; 3) Audit NFR, update stale TBD note to concrete budget guidance, verify all 9 categories, bump status to approved; 4) Run pnpm gate; 5) Review cycle + review file; 6) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | US: added US-044, US-045, US-057, mapped all 59 FRs to at least one US, source_refs refreshed to §C.2 via extract, status approved; FR: source_refs refreshed to §C.2 via extract, all 59 FRs verified with MoSCoW priorities, status approved; NFR: stale TBD note removed, all 9 sections verified with concrete budgets, status approved; all three updated bumped to 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-005.md`; 59/59 FRs bidirectional mapped, zero orphans |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review/approval task; ACs are bidirectional link completeness and specification audit checks recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-005.md`

## Blockers

(none)
