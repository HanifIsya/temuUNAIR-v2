---
id: TMU-DOC-017
title: Review and approve the state designs and notification templates
status: TODO
lane: docs
slug: review-states-templates
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [STATES, NOTIF-TEMPLATES, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
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

- [ ] Each document contains every section its Blueprint §4 row requires.
- [ ] Every `NotificationType` in BE-08 has an in-app and email template in both languages (or
      the gap is filed as a follow-up, ID in the Progress log); no type outside BE-08 is
      invented.
- [ ] Per-screen states align with the SCR spec state sections (mismatches filed, IDs logged).
- [ ] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/02-design/12-empty-error-loading-states.md`
- `docs/02-design/13-notification-and-email-templates.md`
- `docs/08-project/tasks/TMU-DOC-017.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
