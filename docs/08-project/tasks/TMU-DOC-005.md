---
id: TMU-DOC-005
title: Review and approve the requirements docs (US, FR, NFR)
status: TODO
lane: docs
slug: review-requirements-docs
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [US, FR, NFR, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-005 — Review and approve the requirements docs (US, FR, NFR)

## Goal

Review `docs/01-product/04-user-stories.md`, `05-functional-requirements.md` and
`06-non-functional-requirements.md` against their Blueprint §4 rows, fix findings, and approve
the three documents.

## Context

- Files: `docs/01-product/04-user-stories.md`, `05-functional-requirements.md`,
  `06-non-functional-requirements.md`.
- Blueprint §4 requires: US — `US-###` "As a … I want … so that …" entries linked to FRs with
  priority; FR — `FR-<MOD>-###` for AUTH, REP, SRC, MAT, CLM, CHT, HND, NTF, MGT, ADM, I18N;
  NFR — performance, availability, security, privacy, accessibility, i18n, browser/device
  support, retention, scale numbers.
- Cross-doc invariants this group owns: every US links to at least one FR; every FR carries a
  MoSCoW priority; the FR module set matches the eleven modules above; NFR numbering is
  contiguous (`NFR-###`).
- `TMU-DOC-019` re-checks cross-references globally; this task owns the within-group defects.

## Acceptance criteria

- [ ] Each of the three documents contains every section its Blueprint §4 row requires.
- [ ] US↔FR links resolve (no US points at a missing FR, no orphan FR that no US/story map);
      MoSCoW priorities present on every FR.
- [ ] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [ ] Front-matter `status` `approved` (or `review` + filed follow-up naming the blocker) with
      `updated:` bumped.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/01-product/04-user-stories.md`
- `docs/01-product/05-functional-requirements.md`
- `docs/01-product/06-non-functional-requirements.md`
- `docs/08-project/tasks/TMU-DOC-005.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
