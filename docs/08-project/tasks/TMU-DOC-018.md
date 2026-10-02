---
id: TMU-DOC-018
title: Review and approve the admin-console design and onboarding docs
status: TODO
lane: docs
slug: review-admin-onboarding
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [ADMIN-DESIGN, ONBOARDING, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-018 — Review and approve the admin-console design and onboarding docs

## Goal

Review `docs/02-design/14-admin-console-design.md` and `15-onboarding-and-help.md` against their
Blueprint §4 rows, fix findings, and approve both documents.

## Context

- Files: `docs/02-design/14-admin-console-design.md`, `15-onboarding-and-help.md`.
- Blueprint §4 requires: ADMIN-DESIGN — moderation queue, dispute view, stats,
  locations/drop-points CRUD; ONBOARDING — first-run tour, FAQ, "how to safely hand over an
  item" guide.
- Admin screens pair with SCR-017..022; onboarding/help pairs with SCR-015. Keep those
  cross-references intact — `TMU-DOC-019` verifies them globally.
- Drop-points content defers to OQ-3 (DEFERRED by DEC, due M3 seeds) — do not invent campus
  drop-point lists (write-doc rule 6).

## Acceptance criteria

- [ ] Each document contains every section its Blueprint §4 row requires.
- [ ] Drop-point/operating-hours unknowns stay OQ-3-linked (no invented campus facts).
- [ ] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [ ] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/02-design/14-admin-console-design.md`
- `docs/02-design/15-onboarding-and-help.md`
- `docs/08-project/tasks/TMU-DOC-018.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
