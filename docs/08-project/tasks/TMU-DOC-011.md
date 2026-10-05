---
id: TMU-DOC-011
title: Review and approve the design foundations (principles, brand, tokens)
status: DONE
lane: docs
slug: review-design-foundations
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [DESIGN-PRINCIPLES, BRAND, TOKENS, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
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

- [x] Each document contains every section its Blueprint §4 row requires; `tokens.json` parses
      and its values match `03-design-tokens.md`.
- [x] The placeholder-logo caveat appears wherever colours are claimed (docs + tokens), pointing
      at `docs/_source/README.md`; no placeholder value is presented as brand truth.
- [x] Findings fixed here or filed as follow-up task files (IDs in the Progress log; the real
      logo palette belongs to a `TMU-DSG-*` follow-up, not this task).
- [x] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/02-design/01-design-principles.md`
- `docs/02-design/02-brand-and-logo.md`
- `docs/02-design/03-design-tokens.md`
- `docs/02-design/tokens.json`
- `docs/08-project/tasks/TMU-DOC-011.md`
- `docs/08-project/reviews/TMU-DOC-011.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-011-review-design-foundations` created from `main` (`54eb7a4`); status → `IN_PROGRESS`; deps `TMU-DOC-002` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit PRINCIPLES against Blueprint §4, bump status to approved; 2) Audit BRAND, update placeholder-logo caveat pointing to SRC-README and TMU-DSG-001, refresh source_refs to proposal §C.1 via extract and logo.png (placeholder), bump status to approved; 3) Audit TOKENS and tokens.json, verify exact matching values and placeholder caveat, refresh source_refs, bump status to approved; 4) Run pnpm gate; 5) Write review REV-TMU-DOC-011; 6) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | PRINCIPLES: verified 5 principles, status approved; BRAND: updated placeholder caveat to SRC-README/TMU-DSG-001, refreshed source_refs to §C.1 via extract + logo.png placeholder, status approved; TOKENS: verified tokens.json matches tokens doc, placeholder caveat intact, status approved; all updated bumped to 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-011.md`; design foundations meet Blueprint §4 |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review/approval task; ACs are specification audit and token consistency checks recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-011.md`

## Blockers

(none)
