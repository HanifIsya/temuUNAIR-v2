---
id: TMU-DOC-016
title: Review and approve the accessibility and responsive/motion docs
status: DONE
lane: docs
slug: review-a11y-responsive
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [A11Y, RESPONSIVE, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-016 — Review and approve the accessibility and responsive/motion docs

## Goal

Review `docs/02-design/10-accessibility.md` and `11-responsive-and-motion.md` against their
Blueprint §4 rows, fix findings, and approve both documents.

## Context

- Files: `docs/02-design/10-accessibility.md`, `11-responsive-and-motion.md`.
- Blueprint §4 requires: A11Y — WCAG 2.2 AA plan, contrast table (yellow on white fails → accent
  only), focus, keyboard, screen-reader labels; RESPONSIVE — breakpoints, touch targets ≥44 px,
  reduced-motion rules.
- The contrast table must agree with `scripts/check-contrast.mjs`'s expectations and with
  `tokens.json`; the yellow-on-white rule is a known, documented constraint — keep it.

## Acceptance criteria

- [x] Each document contains every section its Blueprint §4 row requires.
- [x] The contrast table includes the documented yellow-on-white failure and its mitigation;
      touch-target ≥44 px and reduced-motion rules are present.
- [x] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [x] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/02-design/10-accessibility.md`
- `docs/02-design/11-responsive-and-motion.md`
- `docs/08-project/tasks/TMU-DOC-016.md`
- `docs/08-project/reviews/TMU-DOC-016.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-016-review-a11y-responsive` created from `main` (`e44990b`); status → `IN_PROGRESS`; deps `TMU-DOC-002` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit A11Y against Blueprint §4 (WCAG 2.2 AA, contrast table with yellow-on-white failure, focus rings, keyboard, screen-reader labels), bump status to approved; 2) Audit RESPONSIVE against Blueprint §4 (breakpoints, touch targets >= 44px, reduced-motion rules), bump status to approved; 3) Run pnpm gate; 4) Write review REV-TMU-DOC-016; 5) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | A11Y: verified WCAG 2.2 AA, contrast table, keyboard/screen-reader rules, status approved; RESPONSIVE: verified breakpoints, >= 44px touch targets, reduced motion rules, status approved; both updated bumped to 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-016.md`; A11Y + RESPONSIVE meet Blueprint §4 |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review/approval task; ACs are specification audit and accessibility standards checks recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-016.md`

## Blockers

(none)
