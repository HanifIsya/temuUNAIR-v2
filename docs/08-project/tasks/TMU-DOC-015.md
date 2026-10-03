---
id: TMU-DOC-015
title: Review and approve the component inventory and content/microcopy docs
status: DONE
lane: docs
slug: review-components-copy
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [CMP, COPY, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-015 — Review and approve the component inventory and content/microcopy docs

## Goal

Review `docs/02-design/08-component-inventory.md` and `09-content-and-microcopy.md` against
their Blueprint §4 rows, fix findings, and approve both documents.

## Context

- Files: `docs/02-design/08-component-inventory.md`, `09-content-and-microcopy.md`.
- Blueprint §4 requires: CMP — `CMP-###` list with variants and states (source for FE-03 §5B.3);
  COPY — all `id-ID` strings, tone, error messages, safety tips, empty states, with an English
  mirror.
- Copy rules: user-facing copy is Bahasa Indonesia with an English mirror (write-doc rule 5);
  error copy aligns with `docs/04-contracts/backend/BE-04-error-catalog.md` codes where it cites
  them; copy keys follow the `FE-08` naming convention where one is defined.
- Cross-links: screen specs cite CMP IDs (checked in `TMU-DOC-014`); this task owns the
  inventory side of that pairing.

## Acceptance criteria

- [x] Each document contains every section its Blueprint §4 row requires.
- [x] Every `CMP-###` has variants and states; every copy item has `id` text and an `en` mirror
      (or an explicit, noted exception).
- [x] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [x] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/02-design/08-component-inventory.md`
- `docs/02-design/09-content-and-microcopy.md`
- `docs/08-project/tasks/TMU-DOC-015.md`
- `docs/08-project/reviews/TMU-DOC-015.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-015-review-components-copy` created from `main` (`d60f129`); status → `IN_PROGRESS`; deps `TMU-DOC-002` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit CMP against Blueprint §4 (all CMP-### IDs, props, emits, variants, states, rules), bump status to approved; 2) Audit COPY against Blueprint §4 (voice principles, global strings, wizard, browse, matches, claims, notifications, BE-04 error messages, safety, empty states with id/en pairs), bump status to approved; 3) Run pnpm gate; 4) Write review REV-TMU-DOC-015; 5) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | CMP: verified all components, variants, states and rules, status approved; COPY: verified voice principles, id/en message pairs across all categories and BE-04 error codes, status approved; both updated bumped to 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-015.md`; CMP + COPY meet Blueprint §4 |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review/approval task; ACs are component specification and copy completeness checks recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-015.md`

## Blockers

(none)
