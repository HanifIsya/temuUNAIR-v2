---
id: TMU-DOC-011
title: Review and approve the design foundations (principles, brand, tokens)
status: TODO
lane: docs
slug: review-design-foundations
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [DESIGN-PRINCIPLES, BRAND, TOKENS, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-011 — Review and approve the design foundations (principles, brand, tokens)

## Goal

Review `docs/02-design/01-design-principles.md`, `02-brand-and-logo.md`, `03-design-tokens.md`
and `tokens.json` against their Blueprint §4 rows, fix findings, and approve them — with the
placeholder-logo caveat stated, not hidden.

## Context

- Files: `docs/02-design/01-design-principles.md`, `02-brand-and-logo.md`,
  `03-design-tokens.md`, `tokens.json`.
- Blueprint §4 requires: PRINCIPLES — trust, speed-to-report (<60 s), privacy-first,
  mobile-first, friendly to campus users; BRAND — logo usage, philosophy (magnifier, pin, bag,
  blue=trust, yellow=hope), clear-space, misuse, tagline "Lost Today, Found Together"; TOKENS —
  colors sampled from `logo.png`, typography, spacing, radius, shadow, z-index, breakpoints,
  motion, light/dark.
- `docs/_source/README.md` rule 3: the tracked `logo.png` is a **placeholder**; token values
  derived from it are placeholders and must not be treated as brand truth. Sampling the real
  logo is `TMU-DSG-001` (unfiled, blocked on the human supplying the real logo) — record the
  caveat, do not fake real colours and do not block approval on it.
- `tokens.json` and the tokens doc must stay mutually consistent (same values, same names).

## Acceptance criteria

- [ ] Each document contains every section its Blueprint §4 row requires; `tokens.json` parses
      and its values match `03-design-tokens.md`.
- [ ] The placeholder-logo caveat appears wherever colours are claimed (docs + tokens), pointing
      at `docs/_source/README.md`; no placeholder value is presented as brand truth.
- [ ] Findings fixed here or filed as follow-up task files (IDs in the Progress log; the real
      logo palette belongs to a `TMU-DSG-*` follow-up, not this task).
- [ ] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/02-design/01-design-principles.md`
- `docs/02-design/02-brand-and-logo.md`
- `docs/02-design/03-design-tokens.md`
- `docs/02-design/tokens.json`
- `docs/08-project/tasks/TMU-DOC-011.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
