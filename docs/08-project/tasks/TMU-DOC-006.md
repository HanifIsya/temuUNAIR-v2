---
id: TMU-DOC-006
title: Review and approve the acceptance-criteria and glossary docs
status: DONE
lane: docs
slug: review-ac-glossary-docs
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [AC, GLOSSARY, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-006 — Review and approve the acceptance-criteria and glossary docs

## Goal

Review `docs/01-product/07-acceptance-criteria.md` and `08-glossary.md` against their Blueprint
§4 rows, fix findings, and approve both documents.

## Context

- Files: `docs/01-product/07-acceptance-criteria.md`, `08-glossary.md`.
- Blueprint §4 requires: AC — Gherkin per FR including edge cases (duplicate reports, expired
  reports, blocked user, two claimants); GLOSSARY — Indonesian↔English: barang hilang/ditemukan,
  pelapor, civitas akademika, KTM, verifikasi, serah terima ….
- Cross-doc invariants: every FR group has at least the named edge cases covered; Gherkin
  keywords are well-formed (`Feature/Scenario/Given/When/Then`); glossary terms used elsewhere
  (US, COPY, SCR docs) appear with consistent translations.

## Acceptance criteria

- [x] Each document contains every section its Blueprint §4 row requires.
- [x] The four named edge cases (duplicate reports, expired reports, blocked user, two
      claimants) exist as Gherkin scenarios; scenarios parse as valid Gherkin structure.
- [x] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [x] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/01-product/07-acceptance-criteria.md`
- `docs/01-product/08-glossary.md`
- `docs/08-project/tasks/TMU-DOC-006.md`
- `docs/08-project/reviews/TMU-DOC-006.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-006-review-ac-glossary-docs` created from `main` (`65c1ba8`); status → `IN_PROGRESS`; deps `TMU-DOC-002` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit AC against Blueprint §4, verify all 4 named edge cases (duplicate, expired, blocked, two claimants), bump status to approved; 2) Audit GLOSSARY, verify all named terms (barang hilang/ditemukan, pelapor, civitas akademika, KTM, verifikasi, serah terima), refresh source_refs to extract, bump status to approved; 3) Run pnpm gate; 4) Write review REV-TMU-DOC-006; 5) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | AC: verified all 4 named edge cases and Gherkin structure, status approved; GLOSSARY: verified all vocabulary terms, refreshed source_refs to extract, status approved; both updated bumped to 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-006.md`; AC + GLOSSARY meet Blueprint §4 |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review/approval task; ACs are specification audit and edge-case verification checks recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-006.md`

## Blockers

(none)
