---
id: TMU-OPS-010
title: M0 exit checklist, gate evidence and milestone handoff
status: TODO
lane: ops
slug: m0-exit-checklist
milestone: M0
priority: P2
owner: orchestrator
deps: [TMU-OPS-008, TMU-OPS-009]
refs: [ROADMAP, WF-LOOP, DOR-DOD]
created: 2026-09-29
updated: 2026-09-29
---

# TMU-OPS-010 — M0 exit checklist, gate evidence and milestone handoff

## Goal

Verify every M0 exit criterion, record the evidence in one place, and prepare the M1 handoff so
the human can run `pnpm gate:full`, review the demo checklist and tag `m0-bootstrap`.

## Context

- `docs/01-product/10-roadmap.md` M0 row lists the exit criteria and the key tasks.
- `docs/05-workflow/05-definition-of-ready-done.md` §Definition of Done for a milestone lists the
  6 conditions for closing a milestone.
- This is the only task in M0 that may update `10-roadmap.md` and the risk register.

## Acceptance criteria

- [ ] Every M0 criterion in `10-roadmap.md` is checked with a link to evidence (gate output,
      PR URL, settings capture).
- [ ] `pnpm gate:full` output tail is pasted in the task file from a clean clone.
- [ ] `status.md` shows M0 at 100% DONE with no BLOCKED tasks.
- [ ] A short M1 handoff note lists the first runnable M1 tasks and the worktree/branch plan.
- [ ] Remaining placeholders that M0 deliberately leaves (real logo, proposal PDF, CODEOWNERS
      handles, model pins) are listed with their owning milestone.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/01-product/10-roadmap.md` (M0 status only)
- `docs/01-product/09-risk-register.md` (only if an M0 risk changes)
- `docs/08-project/tasks/TMU-OPS-010.md`
- `docs/08-project/status.md` (regenerated)

## Out of scope

- Starting M1 (`TMU-DOC-*`).
- Tagging the milestone (human action after the gate).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| | | | |

### Plan

1. Walk the M0 criteria table and attach evidence to each row.
2. Run `pnpm gate:full` from a clean clone and paste the tail.
3. Regenerate `status.md` and confirm M0 is 100% DONE.
4. Write the M1 handoff note and the deferred-placeholder list.
5. `pnpm gate`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
