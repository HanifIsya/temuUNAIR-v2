---
id: TMU-DOC-010
title: Review and approve the operations-model and user-research docs
status: TODO
lane: docs
slug: review-ops-research-docs
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [OPS-MODEL, RESEARCH, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-010 — Review and approve the operations-model and user-research docs

## Goal

Review `docs/01-product/14-operations-model.md` and `15-user-research-plan.md` against their
Blueprint §4 rows, fix findings, and approve both documents.

## Context

- Files: `docs/01-product/14-operations-model.md`, `15-user-research-plan.md`.
- Blueprint §4 requires: OPS-MODEL — who physically runs lost-and-found (security posts?), SLAs,
  drop points, moderator per campus, escalation; RESEARCH — interview/survey script, usability
  test plan.
- Open items that belong to other milestones (OQ-3 drop points/hours) stay open under their
  `TMU-DOC-003` DECs — do not invent campus operations facts (write-doc rule 6).

## Acceptance criteria

- [ ] Each document contains every section its Blueprint §4 row requires.
- [ ] No UNAIR operations fact is invented: unknowns remain `OPEN QUESTION` or OQ-linked.
- [ ] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [ ] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/01-product/14-operations-model.md`
- `docs/01-product/15-user-research-plan.md`
- `docs/08-project/tasks/TMU-DOC-010.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
