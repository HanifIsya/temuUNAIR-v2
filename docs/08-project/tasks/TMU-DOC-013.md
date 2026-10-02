---
id: TMU-DOC-013
title: Review and approve wireframes
status: TODO
lane: docs
slug: review-wireframes
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [WIREFRAMES, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-013 — Review and approve wireframes

## Goal

Review `docs/02-design/06-wireframes.md` against its Blueprint §4 row, fix findings, and approve
it.

## Context

- File: `docs/02-design/06-wireframes.md`.
- Blueprint §4 requires: ASCII/Mermaid wireframes per screen, mobile and desktop.
- Every screen defined in `docs/02-design/07-screen-specs/` (SCR-001..023) should have a
  corresponding wireframe view; the gap list becomes follow-up work if anything is missing.

## Acceptance criteria

- [ ] The document contains every section its Blueprint §4 row requires.
- [ ] Every SCR-### has a wireframe view (mobile and desktop), or the missing ones are filed as
      follow-up task files (IDs in the Progress log).
- [ ] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/02-design/06-wireframes.md`
- `docs/08-project/tasks/TMU-DOC-013.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
