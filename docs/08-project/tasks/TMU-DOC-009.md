---
id: TMU-DOC-009
title: Review the legal/privacy drafts and record the human legal-review requirement
status: DONE
lane: docs
slug: review-legal-privacy-drafts
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [LEGAL, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-009 — Review the legal/privacy drafts and record the human legal-review requirement

## Goal

Review `docs/01-product/13-legal-privacy-drafts.md` against its Blueprint §4 row and bring it to
`review`/`approved` state **without pretending a human legal review happened**: this task
verifies structure, completeness and internal consistency; the human legal sign-off is recorded
as an explicit, tracked requirement.

## Context

- File: `docs/01-product/13-legal-privacy-drafts.md`.
- Blueprint §4 requires: privacy notice, terms, community guidelines, UU PDP mapping — and flags
  **needs human legal review**. The document may not be marked `approved` on agent authority
  alone if its own front-matter or content conditions approval on that review.
- Roadmap M1 exit says "answered or deferred with DEC" for OQs; the same spirit applies here:
  if the legal sign-off cannot happen inside this task, record the deferral as a DEC (or a filed
  follow-up task) so the open item is visible at the M1 gate (`TMU-DOC-020` re-checks it).
- Never invent legal claims (write-doc rule 6): no new statutory citations beyond those already
  sourced; UU PDP mapping stays citation-backed.

## Acceptance criteria

- [x] The document contains every section its Blueprint §4 row requires (privacy notice, terms,
      community guidelines, UU PDP mapping).
- [x] Structure findings are fixed here or filed as follow-up task files (IDs in the Progress
      log).
- [x] The human legal-review requirement is explicitly recorded: either the doc carries
      `status: approved` with the sign-off already present in the source material, or it carries
      `status: review` plus a DEC/follow-up naming the human reviewer and blocking condition —
      never a silent agent-side approval.
- [x] `updated:` bumped; no new unsourced legal citation introduced.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/01-product/13-legal-privacy-drafts.md`
- `docs/01-product/12-assumptions-and-decisions.md` (deferral DEC-025)
- `docs/08-project/tasks/TMU-DOC-009.md`
- `docs/08-project/reviews/TMU-DOC-009.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-009-review-legal-privacy-drafts` created from `main` (`18ecf00`); status → `IN_PROGRESS`; deps `TMU-DOC-002` DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Audit LEGAL against Blueprint §4 for privacy notice, terms, community guidelines, and UU PDP mapping; 2) Advance front-matter status to `review` with explicit DEC-025 note (deferring formal human legal sign-off to UNAIR legal / DPO before launch); 3) Record DEC-025 in `12-assumptions-and-decisions.md` and log handoff for TMU-META-005; 4) Run pnpm gate; 5) Write review REV-TMU-DOC-009; 6) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | LEGAL: verified privacy notice, terms, guidelines, UU PDP mapping, front-matter status set to `review` with DEC-025 note; DECISIONS: recorded DEC-025 deferring formal human legal sign-off to UNAIR legal / DPO at M8/M9; both updated bumped to 2026-10-03 |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | orchestrator | handoff | for `TMU-META-005` (meta lane owns `docs/08-project/decisions-log.md`) — add row: **DEC-025** defer formal human legal review of `13-legal-privacy-drafts.md` to UNAIR legal / DPO, due M8/M9 before production launch per DEC-017 and RISK-012 |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-009.md`; structure complete, status `review` with DEC-025 deferral |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review task; ACs are structure verification and human legal review deferral tracking recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-009.md`

## Blockers

(none)
