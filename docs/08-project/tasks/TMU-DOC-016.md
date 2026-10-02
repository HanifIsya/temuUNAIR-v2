---
id: TMU-DOC-016
title: Review and approve the accessibility and responsive/motion docs
status: TODO
lane: docs
slug: review-a11y-responsive
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [A11Y, RESPONSIVE, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-016 — Review and approve the accessibility and responsive/motion docs

## Goal

Review `docs/02-design/10-accessibility.md` and `11-responsive-and-motion.md` against their
Blueprint §4 rows, fix findings, and approve both documents.

## Context

- Files: `docs/02-design/10-accessibility.md`, `11-responsive-and-motion.md`.
- Blueprint §4 requires: A11Y — WCAG 2.2 AA plan, contrast table (yellow on white fails → accent
  only), focus, keyboard, screen-reader labels; RESPONSIVE — breakpoints, touch targets ≥44 px,
  reduced-motion rules.
- The contrast table must agree with `scripts/check-contrast.mjs`'s expectations and with
  `tokens.json`; the yellow-on-white rule is a known, documented constraint — keep it.

## Acceptance criteria

- [ ] Each document contains every section its Blueprint §4 row requires.
- [ ] The contrast table includes the documented yellow-on-white failure and its mitigation;
      touch-target ≥44 px and reduced-motion rules are present.
- [ ] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [ ] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/02-design/10-accessibility.md`
- `docs/02-design/11-responsive-and-motion.md`
- `docs/08-project/tasks/TMU-DOC-016.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
