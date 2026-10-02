---
id: TMU-DOC-019
title: M1 cross-document consistency and traceability pass
status: TODO
lane: docs
slug: m1-consistency-traceability
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-003, TMU-DOC-004, TMU-DOC-005, TMU-DOC-006, TMU-DOC-007, TMU-DOC-008, TMU-DOC-009, TMU-DOC-010, TMU-DOC-011, TMU-DOC-012, TMU-DOC-013, TMU-DOC-014, TMU-DOC-015, TMU-DOC-016, TMU-DOC-017, TMU-DOC-018]
refs: [BLUEPRINT, TRACEABILITY]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-019 — M1 cross-document consistency and traceability pass

## Goal

After every per-group review task has landed, sweep the whole of `docs/01-product/**` and
`docs/02-design/**` as one system: cross-references resolve, IDs are unique, statuses and
`updated:` fields tell the truth, and the traceability matrix has no orphan rows — so
`TMU-DOC-020` can compile the M1 exit evidence from a consistent tree.

## Context

- Runs after `TMU-DOC-003..018` (its deps); group tasks own within-group defects, this task
  owns **between-group** defects.
- Checked surfaces: `TMU-*`/`US-###`/`FR-*`/`SCR-###`/`CMP-###`/`DEC-###`/`RISK-###`/`OQ-#`
  references across product and design docs; `tokens.json` ↔ `03-design-tokens.md`; SCR index ↔
  files on disk; front-matter `status`/`updated:` on every doc; the traceability matrix
  (`docs/08-project/traceability-matrix.md`) Tasks column vs the actual backlog. The matrix is
  **meta-lane-only** — a `lane: docs` branch fails `scripts/check-lane.sh` on it, so this task
  only *checks* it and hands the row fixes to `TMU-META-005` via its Progress log.
- `_source/README.md` status table should reflect the M1 intake performed by `TMU-DOC-002`
  (reachable after `TMU-OPS-033` widens the docs lane to `docs/_source/**`).

## Acceptance criteria

- [ ] Every cross-reference between `docs/01-product/**` and `docs/02-design/**` resolves to an
      existing ID/anchor; the broken-reference list produced by the sweep is empty or filed as
      follow-up task files (IDs in the Progress log).
- [ ] Every document in both trees has `status: approved` or `review` with a filed follow-up
      naming its blocker; `updated:` is consistent with the review that last touched it.
- [ ] Handoff recorded: matrix rows that are missing or reference non-existent backlog IDs are
      listed in this task's Progress log for `TMU-META-005`, which owns
      `docs/08-project/traceability-matrix.md`.
- [ ] `docs/_source/README.md` table matches what `TMU-DOC-002` actually committed.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/01-product/**` and `docs/02-design/**` (as the sweep finds defects)
- `docs/_source/README.md` (if stale)
- `docs/08-project/tasks/TMU-DOC-019.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
