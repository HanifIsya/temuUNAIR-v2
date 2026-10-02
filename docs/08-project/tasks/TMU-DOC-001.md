---
id: TMU-DOC-001
title: M0 exit roadmap update and M1 documentation milestone kickoff
status: TODO
lane: docs
slug: m0-exit-roadmap-update
milestone: M1
priority: P1
owner: spec-writer
deps: [TMU-OPS-010]
refs: [ROADMAP, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-001 — M0 exit roadmap update and M1 documentation milestone kickoff

## Goal

Update `docs/01-product/10-roadmap.md` to reflect that milestone M0 (Bootstrap) is complete,
update the M0 and M9 task ranges in the roadmap, and start the M1 documentation authoring phase.

## Context

- `TMU-OPS-010` closed M0 exit criteria and verified `pnpm gate:full`.
- `10-roadmap.md` is in the `docs` lane, so updating its table is handled by this task.

## Acceptance criteria

- [ ] `docs/01-product/10-roadmap.md` reflects M0 as complete / tagged `m0-bootstrap`.
- [ ] Task range for M0 (`TMU-OPS-001..021`) and M9 reservations are updated.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/01-product/10-roadmap.md`
- `docs/08-project/tasks/TMU-DOC-001.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | task filed | M0 milestone exit follow-up for roadmap status update |

## Blockers

(none)
