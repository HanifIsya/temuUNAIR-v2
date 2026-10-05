---
id: TMU-DOC-018
title: Review and approve the admin-console design and onboarding docs
status: DONE
lane: docs
slug: review-admin-onboarding
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [ADMIN-DESIGN, ONBOARDING, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-018 — Review and approve the admin-console design and onboarding docs

## Goal

Review `docs/02-design/14-admin-console-design.md` and `15-onboarding-and-help.md` against their
Blueprint §4 rows, fix findings, and approve both documents.

## Context

- Files: `docs/02-design/14-admin-console-design.md`, `15-onboarding-and-help.md`.
- Blueprint §4 requires: ADMIN-DESIGN — moderation queue, dispute view, stats,
  locations/drop-points CRUD; ONBOARDING — first-run tour, FAQ, "how to safely hand over an
  item" guide.
- Admin screens pair with SCR-017..022; onboarding/help pairs with SCR-015. Keep those
  cross-references intact — `TMU-DOC-019` verifies them globally.
- Drop-points content defers to OQ-3 (DEFERRED by DEC, due M3 seeds) — do not invent campus
  drop-point lists (write-doc rule 6).

## Acceptance criteria

- [x] Each document contains every section its Blueprint §4 row requires.
- [x] Drop-point/operating-hours unknowns stay OQ-3-linked (no invented campus facts).
- [x] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [x] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/02-design/14-admin-console-design.md`
- `docs/02-design/15-onboarding-and-help.md`
- `docs/08-project/tasks/TMU-DOC-018.md`
- `docs/08-project/reviews/TMU-DOC-018.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-018-review-admin-onboarding` created from `main` (`59f4605`); status → `IN_PROGRESS`; deps `TMU-DOC-002` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit ADMIN-DESIGN against Blueprint §4 (moderation queue, dispute view, stats, locations/drop points CRUD, RBAC, OQ-3 link preserved), bump status to approved; 2) Audit ONBOARDING against Blueprint §4 (3-step tour, contextual help, FAQ, /help/safety guide), bump status to approved; 3) Run pnpm gate; 4) Write review REV-TMU-DOC-018; 5) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | ADMIN-DESIGN: verified queue rules, stats, and RBAC matrix with OQ-3 link, status approved; ONBOARDING: verified first-run tour, contextual help, FAQ, and safety guide, status approved; both updated bumped to 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-018.md`; ADMIN-DESIGN + ONBOARDING meet Blueprint §4 |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review/approval task; ACs are specification audit and administrative interface alignment checks recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-018.md`

## Blockers

(none)
