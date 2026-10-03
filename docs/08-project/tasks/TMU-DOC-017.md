---
id: TMU-DOC-017
title: Review and approve the state designs and notification templates
status: DONE
lane: docs
slug: review-states-templates
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [STATES, NOTIF-TEMPLATES, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-017 — Review and approve the state designs and notification templates

## Goal

Review `docs/02-design/12-empty-error-loading-states.md` and
`13-notification-and-email-templates.md` against their Blueprint §4 rows, fix findings, and
approve both documents.

## Context

- Files: `docs/02-design/12-empty-error-loading-states.md`,
  `13-notification-and-email-templates.md`.
- Blueprint §4 requires: STATES — per-screen state designs (empty/error/loading/offline per
  FE-06); NOTIF-TEMPLATES — every `NotificationType` with in-app + email copy, id/en.
- Notification types are contract-governed (`docs/04-contracts/backend/BE-08-notification-
  contract.md`); the template set must cover exactly the types BE-08 defines — gaps are
  follow-ups, not invented types (contract-first rule).
- Copy is id-ID with en mirror (write-doc rule 5).

## Acceptance criteria

- [x] Each document contains every section its Blueprint §4 row requires.
- [x] Every `NotificationType` in BE-08 has an in-app and email template in both languages (or
      the gap is filed as a follow-up, ID in the Progress log); no type outside BE-08 is
      invented.
- [x] Per-screen states align with the SCR spec state sections (mismatches filed, IDs logged).
- [x] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/02-design/12-empty-error-loading-states.md`
- `docs/02-design/13-notification-and-email-templates.md`
- `docs/08-project/tasks/TMU-DOC-017.md`
- `docs/08-project/reviews/TMU-DOC-017.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-017-review-states-templates` created from `main` (`f37cf58`); status → `IN_PROGRESS`; deps `TMU-DOC-002` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit STATES against Blueprint §4 (loading, empty, error, forbidden/not found, offline per page and component), bump status to approved; 2) Audit NOTIF-TEMPLATES against Blueprint §4 and BE-08 (all 15 NotificationType variants with in-app + email copy in id/en), bump status to approved; 3) Run pnpm gate; 4) Write review REV-TMU-DOC-017; 5) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | STATES: verified all loading/empty/error/offline states per page and component, status approved; NOTIF-TEMPLATES: verified all 15 BE-08 notification types with id/en in-app and email copy, status approved; both updated bumped to 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-017.md`; STATES + NOTIF-TEMPLATES meet Blueprint §4 |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review/approval task; ACs are specification audit and notification contract alignment checks recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-017.md`

## Blockers

(none)
