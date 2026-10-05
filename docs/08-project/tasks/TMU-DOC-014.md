---
id: TMU-DOC-014
title: Review and approve the screen specs (SCR-001..023)
status: DONE
lane: docs
slug: review-screen-specs
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [SCR-INDEX, CMP, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-014 — Review and approve the screen specs (SCR-001..023)

## Goal

Review every file in `docs/02-design/07-screen-specs/` (`00-index.md` plus SCR-001..023) against
the Blueprint §4 row for screen specs, fix findings, and approve the set.

## Context

- Files: `docs/02-design/07-screen-specs/00-index.md` and
  `SCR-001-landing.md` … `SCR-023-error-pages.md` (24 files total).
- Blueprint §4 requires per screen: purpose, entry points, layout regions, data (API IDs),
  components (CMP IDs), states, copy keys, analytics events, a11y notes.
- These specs are the contract-ish input for FE-02/FE-03 later; API IDs must be plausible
  against `docs/04-contracts/backend/BE-03-endpoint-catalog.md` (they may name endpoints that
  only arrive in M3+ — that is fine, they must simply not invent IDs BE-03 forbids).
- The index must list exactly the files present.

## Acceptance criteria

- [x] Every screen spec contains the nine Blueprint-required sections (purpose, entry points,
      layout regions, data, components, states, copy keys, analytics events, a11y notes).
- [x] `00-index.md` lists exactly the SCR files on disk; SCR IDs are contiguous 001..023.
- [x] Referenced CMP IDs exist in `docs/02-design/08-component-inventory.md` (or the mismatch is
      filed as a follow-up task, cross-noted for `TMU-DOC-015`/`TMU-DOC-019`).
- [x] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [x] Front-matter `status` `approved` for the index and every spec (or `review` + filed
      follow-up), with `updated:` bumped.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/02-design/07-screen-specs/*.md`
- `docs/08-project/tasks/TMU-DOC-014.md`
- `docs/08-project/reviews/TMU-DOC-014.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-014-review-screen-specs` created from `main` (`51613d0`); status → `IN_PROGRESS`; deps `TMU-DOC-002` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit all 23 SCR specs against 9 required sections; 2) Verify 00-index.md lists all 23 files and CMP IDs match CMP inventory; 3) Bump status to approved and updated to 2026-10-03 across all 24 files; 4) Run pnpm gate; 5) Write review REV-TMU-DOC-014; 6) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | Verified all 23 SCR specs contain the 9 Blueprint sections; verified 0 missing CMP IDs; bumped front-matter status to approved on 00-index.md and SCR-001..023 with updated 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-014.md`; 24/24 files approved, 0 orphan CMPs |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review/approval task; ACs are section completeness and component registry verification checks recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-014.md`

## Blockers

(none)
