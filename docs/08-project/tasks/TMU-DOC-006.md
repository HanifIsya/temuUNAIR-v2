---
id: TMU-DOC-006
title: Review and approve the acceptance-criteria and glossary docs
status: TODO
lane: docs
slug: review-ac-glossary-docs
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [AC, GLOSSARY, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
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

- [ ] Each document contains every section its Blueprint §4 row requires.
- [ ] The four named edge cases (duplicate reports, expired reports, blocked user, two
      claimants) exist as Gherkin scenarios; scenarios parse as valid Gherkin structure.
- [ ] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [ ] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/01-product/07-acceptance-criteria.md`
- `docs/01-product/08-glossary.md`
- `docs/08-project/tasks/TMU-DOC-006.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
