---
id: TMU-DOC-015
title: Review and approve the component inventory and content/microcopy docs
status: TODO
lane: docs
slug: review-components-copy
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [CMP, COPY, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
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

- [ ] Each document contains every section its Blueprint §4 row requires.
- [ ] Every `CMP-###` has variants and states; every copy item has `id` text and an `en` mirror
      (or an explicit, noted exception).
- [ ] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [ ] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/02-design/08-component-inventory.md`
- `docs/02-design/09-content-and-microcopy.md`
- `docs/08-project/tasks/TMU-DOC-015.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
