---
id: TMU-DOC-014
title: Review and approve the screen specs (SCR-001..023)
status: TODO
lane: docs
slug: review-screen-specs
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [SCR-INDEX, CMP, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-014 — Review and approve the screen specs (SCR-001..023)

## Goal

Review every file in `docs/02-design/07-screen-specs/` (`00-index.md` plus SCR-001..023) against
the Blueprint §4 row for screen specs, fix findings, and approve the set.

## Context

- Files: `docs/02-design/07-screen-specs/00-index.md` and
  `SCR-001-landing.md` … `SCR-023-error-pages.md` (24 files total).
- Blueprint §4 requires per screen: purpose, entry points, layout regions, data (API IDs),
  components (CMP IDs), states, copy keys, analytics events, a11y notes.
- These specs are the contract-ish input for FE-02/FE-03 later; API IDs must be plausible
  against `docs/04-contracts/backend/BE-03-endpoint-catalog.md` (they may name endpoints that
  only arrive in M3+ — that is fine, they must simply not invent IDs BE-03 forbids).
- The index must list exactly the files present.

## Acceptance criteria

- [ ] Every screen spec contains the nine Blueprint-required sections (purpose, entry points,
      layout regions, data, components, states, copy keys, analytics events, a11y notes).
- [ ] `00-index.md` lists exactly the SCR files on disk; SCR IDs are contiguous 001..023.
- [ ] Referenced CMP IDs exist in `docs/02-design/08-component-inventory.md` (or the mismatch is
      filed as a follow-up task, cross-noted for `TMU-DOC-015`/`TMU-DOC-019`).
- [ ] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [ ] Front-matter `status` `approved` for the index and every spec (or `review` + filed
      follow-up), with `updated:` bumped.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/02-design/07-screen-specs/*.md`
- `docs/08-project/tasks/TMU-DOC-014.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
