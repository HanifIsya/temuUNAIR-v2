---
id: TMU-DOC-007
title: Review and approve the risk register and roadmap
status: TODO
lane: docs
slug: review-risks-roadmap
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-002]
refs: [RISKS, ROADMAP, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-007 — Review and approve the risk register and roadmap

## Goal

Review `docs/01-product/09-risk-register.md` and `10-roadmap.md` against their Blueprint §4
rows, fix findings, make the roadmap's M1 row tell the truth about filed task IDs, and approve
both documents.

## Context

- Files: `docs/01-product/09-risk-register.md`, `10-roadmap.md`.
- Blueprint §4 requires: RISKS — `RISK-###` covering fraud/false claims, PII leak,
  false-positive matches, cold start, YOLO class gap, AGPL, CPU latency, SSO availability,
  moderator workload, each with likelihood, impact, mitigation, owner; ROADMAP — milestones
  M0–M9 with dates and release slices.
- Roadmap M1 row currently promises key tasks `TMU-DOC-001..020` without listing the enabler
  `TMU-OPS-033` (filed by TMU-META-004). M0 row and M8/M9 reservations were reconciled by
  `TMU-DOC-001`; this task aligns the M1 cell with the actual filed M1 tasks.
- Risk scores ≥ 15 must carry actions (roadmap standing rule 3).

## Acceptance criteria

- [ ] Both documents contain every section their Blueprint §4 row requires.
- [ ] Every risk row has likelihood, impact, mitigation and owner; any score ≥ 15 names an
      action or follow-up.
- [ ] The roadmap M1 key-tasks cell lists the actual filed M1 task IDs (including
      `TMU-OPS-033`); no row of the roadmap table assigns one ID range to two milestones.
- [ ] Findings fixed here or filed as follow-up task files (IDs in the Progress log).
- [ ] Front-matter `status` `approved` (or `review` + filed follow-up) with `updated:` bumped.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/01-product/09-risk-register.md`
- `docs/01-product/10-roadmap.md`
- `docs/08-project/tasks/TMU-DOC-007.md` (+ any follow-up task files)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
