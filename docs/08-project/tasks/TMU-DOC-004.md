---
id: TMU-DOC-004
title: Review and approve the M1 core product docs (PRD, VISION, PERSONAS)
status: DONE
lane: docs
slug: review-core-product-docs
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-003]
refs: [PRD, VISION, PERSONAS, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-004 — Review and approve the M1 core product docs (PRD, VISION, PERSONAS)

## Goal

Review `docs/01-product/01-PRD.md`, `02-vision-and-scope.md` and `03-personas.md` against their
Blueprint §4 rows, fix findings, and advance each document's front-matter `status` to `approved`
so M1's "every doc approved" gate can be met.

## Context

- Files: `docs/01-product/01-PRD.md`, `02-vision-and-scope.md`, `03-personas.md`.
- Blueprint §4 requires: PRD — problem, goals G1–G5 (PDF §B), non-goals, personas, scope by
  release, features F1–F4 with MoSCoW, success metrics, assumptions, dependencies, risks, open
  questions; VISION — vision, in/out of scope, campuses covered, release slicing; PERSONAS —
  `P-LOSER`, `P-FINDER`, `P-ADMIN`, jobs-to-be-done, pains, devices, usage context.
- Runs after `TMU-DOC-003` because the PRD owns the OQ table that task resolves.
- Deps of approval: the docs currently sit at `status: draft` with `OPEN QUESTION` markers; an
  `OPEN QUESTION` that M1 can answer must not survive this task.

## Acceptance criteria

- [x] Each of the three documents contains every section its Blueprint §4 row requires (missing
      sections added, or a follow-up task filed with the ID recorded in the Progress log).
- [x] Findings are fixed here or filed as task files; nothing is silently dropped.
- [x] Each document's front-matter `status` is `approved` (or `review` with a filed follow-up
      naming exactly what blocks approval), with `updated:` bumped.
- [x] No M1-answerable `OPEN QUESTION` remains in the three documents; OQ-2..5 stay open only
      under their `TMU-DOC-003` DECs.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/01-product/01-PRD.md`
- `docs/01-product/02-vision-and-scope.md`
- `docs/01-product/03-personas.md`
- `docs/08-project/tasks/TMU-DOC-004.md`
- `docs/08-project/reviews/TMU-DOC-004.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-004-review-core-product-docs` created from `origin/main` (`fcbc9b8`); status → `IN_PROGRESS`; deps `TMU-DOC-003` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit PRD against Blueprint §4, bump status to approved, update draft note to source note, update dependency row 4; 2) Audit VISION, add explicit `## Campuses covered` section, refresh source_refs to extract, bump status to approved; 3) Audit PERSONAS, correct source_refs to proposal §E via extract, cite §E/§C.2, add explicit Devices row to P-LOSER/P-FINDER/P-ADMIN, bump status to approved; 4) Run pnpm gate; 5) Review cycles + review file; 6) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | PRD: status approved, source note, dependency row 4 updated for committed PDF and placeholder logo; VISION: status approved, `## Campuses covered` table added, source_refs refreshed to extract; PERSONAS: status approved, source_refs corrected to proposal §E via extract + §C.2, explicit Devices rows added to P-LOSER/P-FINDER/P-ADMIN; all three updated bumped to 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-004.md`; Blueprint §4 audit 100% complete for PRD, VISION, PERSONAS |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation-only review/approval task (no application behaviour); ACs are artifact and specification audit checks recorded in the Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (pending human push / PR creation per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-004.md`

## Blockers

(none)
