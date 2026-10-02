---
id: TMU-DOC-020
title: M1 exit checklist, docs-approval evidence and M2 handoff
status: TODO
lane: docs
slug: m1-exit-checklist
milestone: M1
priority: P1
owner: orchestrator
deps: [TMU-DOC-019, TMU-META-005]
refs: [ROADMAP, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-020 — M1 exit checklist, docs-approval evidence and M2 handoff

## Goal

Prove the M1 exit criteria from the roadmap row are met, compile the evidence in this task file,
run the full gate, and hand M2 off cleanly — the mirror image of what `TMU-OPS-010` did for M0.

## Context

- Roadmap M1 row: every `docs/01-product/**` and `docs/02-design/**` doc merged and approved;
  PDF + logo added; OQ-1..OQ-5 answered or deferred with DEC; key tasks `TMU-DOC-001..020`
  (+ `TMU-OPS-033`); human gate "**Docs approved** — no code before this".
- `TMU-META-005` (meta lane) is a dependency: it applies the `TMU-DOC-003`/`008`/`019` handoffs
  to `decisions-log.md` and `traceability-matrix.md` — both meta-lane-only, unreachable from
  this task's docs branch — so the exit evidence can honestly claim the registers are current.
- Human gate: the tag `m1-docs` on `main` is applied by the human (milestone tagging rule) —
  this task records the gate as pending human, it does not tag.
- Known caveats to report honestly, not hide: `logo.png` may still be the placeholder
  (`TMU-DSG-001` unfiled); `docs/_source/README.md` verification of the extract is outstanding
  if not done; OQ-2..5 are deferred under DEC (that satisfies the exit clause).
- `pnpm gate:full` is the M-level evidence standard set by `TMU-OPS-010`; run it here too.

## Acceptance criteria

- [ ] Every document under `docs/01-product/**` and `docs/02-design/**` has `status: approved`,
      or an explicitly recorded exception (filed follow-up + DEC) named in the Exit Criteria
      Verification table below.
- [ ] `docs/_source/proposal.pdf` is tracked; `proposal-extract.md` exists; logo status recorded
      (placeholder caveat OK if the real logo is still with the human).
- [ ] OQ-1 answered; OQ-2..OQ-5 deferred with DEC entries — the PRD OQ table shows no
      unanswered row without a DEC.
- [ ] `pnpm gate:full` runs green; the tail is pasted into Evidence.
- [ ] `docs/08-project/status.md` shows `M1 — 100%` after `node scripts/backlog-index.mjs`
      re-runs with every M1 task `DONE`.
- [ ] M2 handoff note written: next runnable task is `TMU-CTR-006` (verify with
      `node scripts/next-task.mjs`).
- [ ] Human gate recorded as pending: tag `m1-docs` + "Docs approved" are human actions.

## Files expected to change

- `docs/08-project/tasks/TMU-DOC-020.md`
- `docs/08-project/backlog.md` (regenerated)
- `docs/08-project/status.md` (regenerated)

## M1 Exit Criteria Verification Table

| # | Criterion | Evidence | Status |
|---|---|---|---|
| 1 | Every `01-product/**` doc approved | (pending) | ☐ |
| 2 | Every `02-design/**` doc approved | (pending) | ☐ |
| 3 | PDF + logo added (`docs/_source/`) | (pending) | ☐ |
| 4 | OQ-1 answered; OQ-2..5 deferred with DEC | (pending) | ☐ |
| 5 | `pnpm gate:full` green | (pending) | ☐ |
| 6 | Roadmap M1 row matches filed tasks | (pending) | ☐ |
| 7 | Meta registers current (`TMU-META-005` DONE: decisions log + traceability matrix) | (pending) | ☐ |
| 8 | Human gate `m1-docs` / Docs approved | pending human | ☐ |

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Evidence

- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
