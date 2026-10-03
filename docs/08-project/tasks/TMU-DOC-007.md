---
id: TMU-DOC-007
title: Review and approve the risk register and roadmap
status: DONE
lane: docs
slug: review-risks-roadmap
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [RISKS, ROADMAP, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-007 — Review and approve the risk register and roadmap

## Goal

Review `docs/01-product/09-risk-register.md` and `10-roadmap.md` against their Blueprint §4
rows, fix findings, make the roadmap's M1 row tell the truth about filed task IDs, and approve
both documents.

## Context

- Files: `docs/01-product/09-risk-register.md`, `10-roadmap.md`.
- Blueprint §4 requires: RISKS — `RISK-###` covering fraud/false claims, PII leak,
  false-positive matches, cold start, YOLO class gap, AGPL, CPU latency, SSO availability,
  moderator workload, each with likelihood, impact, mitigation, owner; ROADMAP — milestones
  M0–M9 with dates and release slices.
- Roadmap M1 row currently promises key tasks `TMU-DOC-001..020` without listing the enabler
  `TMU-OPS-033` (filed by TMU-META-004). M0 row and M8/M9 reservations were reconciled by
  `TMU-DOC-001`; this task aligns the M1 cell with the actual filed M1 tasks.
- Risk scores ≥ 15 must carry actions (roadmap standing rule 3).

## Acceptance criteria

- [x] Both documents contain every section their Blueprint §4 row requires.
- [x] Every risk row has likelihood, impact, mitigation and owner; any score ≥ 15 names an
      action or follow-up.
- [x] The roadmap M1 key-tasks cell lists the actual filed M1 task IDs (including
      `TMU-OPS-033`); no row of the roadmap table assigns one ID range to two milestones.
- [x] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [x] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/01-product/09-risk-register.md`
- `docs/01-product/10-roadmap.md`
- `docs/08-project/tasks/TMU-DOC-007.md`
- `docs/08-project/reviews/TMU-DOC-007.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-007-review-risks-roadmap` created from `main` (`5d06d0f`); status → `IN_PROGRESS`; deps `TMU-DOC-002` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit RISKS against Blueprint §4, ensure all score >= 15 risks (RISK-001, 002, 003, 004, 012) have concrete owner actions documented, update RISK-015 for committed PDF and tracked placeholder logo, bump status to approved; 2) Audit ROADMAP, update M1 key tasks to TMU-DOC-001..020, TMU-OPS-033, bump status to approved; 3) Run pnpm gate; 4) Write review REV-TMU-DOC-007; 5) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | RISKS: added active actions table for all score >= 15 risks, updated RISK-015 to mitigated, status approved; ROADMAP: updated M1 key tasks to include TMU-OPS-033 and committed PDF exit note, status approved; both updated bumped to 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-007.md`; all score >= 15 actions specified, M1 tasks aligned |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review/approval task; ACs are risk coverage and roadmap integrity checks recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-007.md`

## Blockers

(none)
