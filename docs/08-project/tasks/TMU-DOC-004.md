---
id: TMU-DOC-004
title: Review and approve the M1 core product docs (PRD, VISION, PERSONAS)
status: TODO
lane: docs
slug: review-core-product-docs
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-003]
refs: [PRD, VISION, PERSONAS, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-004 — Review and approve the M1 core product docs (PRD, VISION, PERSONAS)

## Goal

Review `docs/01-product/01-PRD.md`, `02-vision-and-scope.md` and `03-personas.md` against their
Blueprint §4 rows, fix findings, and advance each document's front-matter `status` to `approved`
so M1's "every doc approved" gate can be met.

## Context

- Files: `docs/01-product/01-PRD.md`, `02-vision-and-scope.md`, `03-personas.md`.
- Blueprint §4 requires: PRD — problem, goals G1–G5 (PDF §B), non-goals, personas, scope by
  release, features F1–F4 with MoSCoW, success metrics, assumptions, dependencies, risks, open
  questions; VISION — vision, in/out of scope, campuses covered, release slicing; PERSONAS —
  `P-LOSER`, `P-FINDER`, `P-ADMIN`, jobs-to-be-done, pains, devices, usage context.
- Runs after `TMU-DOC-003` because the PRD owns the OQ table that task resolves.
- Deps of approval: the docs currently sit at `status: draft` with `OPEN QUESTION` markers; an
  `OPEN QUESTION` that M1 can answer must not survive this task.

## Acceptance criteria

- [ ] Each of the three documents contains every section its Blueprint §4 row requires (missing
      sections added, or a follow-up task filed with the ID recorded in the Progress log).
- [ ] Findings are fixed here or filed as task files; nothing is silently dropped.
- [ ] Each document's front-matter `status` is `approved` (or `review` with a filed follow-up
      naming exactly what blocks approval), with `updated:` bumped.
- [ ] No M1-answerable `OPEN QUESTION` remains in the three documents; OQ-2..5 stay open only
      under their `TMU-DOC-003` DECs.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/01-product/01-PRD.md`
- `docs/01-product/02-vision-and-scope.md`
- `docs/01-product/03-personas.md`
- `docs/08-project/tasks/TMU-DOC-004.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
