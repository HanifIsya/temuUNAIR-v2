---
id: TMU-DOC-009
title: Review the legal/privacy drafts and record the human legal-review requirement
status: TODO
lane: docs
slug: review-legal-privacy-drafts
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [LEGAL, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
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

- [ ] The document contains every section its Blueprint §4 row requires (privacy notice, terms,
      community guidelines, UU PDP mapping).
- [ ] Structure findings are fixed here or filed as follow-up task files (IDs in the Progress
      log).
- [ ] The human legal-review requirement is explicitly recorded: either the doc carries
      `status: approved` with the sign-off already present in the source material, or it carries
      `status: review` plus a DEC/follow-up naming the human reviewer and blocking condition —
      never a silent agent-side approval.
- [ ] `updated:` bumped; no new unsourced legal citation introduced.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/01-product/13-legal-privacy-drafts.md`
- possibly `docs/01-product/12-assumptions-and-decisions.md` (deferral DEC)
- `docs/08-project/tasks/TMU-DOC-009.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
