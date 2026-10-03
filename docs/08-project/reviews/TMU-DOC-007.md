---
id: REV-TMU-DOC-007
task: TMU-DOC-007
title: "Review and approve the risk register and roadmap"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-DOC-007 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/docs/TMU-DOC-007-review-risks-roadmap`.
Files reviewed: `09-risk-register.md`, `10-roadmap.md`, `tasks/TMU-DOC-007.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
Both `09-risk-register.md` and `10-roadmap.md` have been audited against their Blueprint §4 rows,
verified for consistency with filed backlog tasks, and approved. High-severity risks (score ≥ 15)
carry concrete owner actions and milestone mappings. The roadmap's M1 row accurately reflects the
full set of filed M1 tasks (including the `TMU-OPS-033` enabler).

## Blueprint §4 Specification Audit

### 1. `docs/01-product/09-risk-register.md`

Blueprint §4 requirements: *`RISK-###` covering fraud/false claims, PII leak, false-positive matches, cold start, YOLO class gap, AGPL, CPU latency, SSO availability, moderator workload, each with likelihood, impact, mitigation, owner*

| Requirement | Section | Status | Verification Detail |
|---|---|---|---|
| Required risks covered | table | PASS | RISK-001 (false-positives), RISK-002 (PII leak), RISK-003 (fraud/false claims), RISK-004 (cold start), RISK-005 (YOLO class gap), RISK-006 (AGPL), RISK-007 (CPU latency), RISK-008 (SSO availability), RISK-009 (moderator workload) all present with L, I, Score, Mitigation, Owner. |
| Additional risks | table | PASS | RISK-010 (abuse/scraping), RISK-011 (drift/reindex), RISK-012 (legal/privacy), RISK-013 (scope creep), RISK-014 (agent loop damage), RISK-015 (source PDF/logo intake). |
| High-severity actions | §Active actions | PASS | Explicit action table for all risks with score ≥ 15: RISK-001 (16, ML), RISK-002 (15, SR), RISK-003 (16, AR), RISK-004 (15, OR), RISK-012 (15, SR). |
| Source status update | RISK-015 | PASS | Updated to reflect `proposal.pdf` committed (`TMU-DOC-002`) and placeholder `logo.png` tracked with `TMU-DSG-001` scheduled. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

### 2. `docs/01-product/10-roadmap.md`

Blueprint §4 requirements: *Milestones M0–M9 with dates and release slices*

| Requirement | Section | Status | Verification Detail |
|---|---|---|---|
| Milestone table | M0–M9 | PASS | Complete M0–M9 table detailing Name, Goal/exit criteria, Key tasks, and Human gate. |
| M1 alignment | row M1 | PASS | Aligned with actual filed tasks: `TMU-DOC-001..020, TMU-OPS-033`. Exit criteria reflects committed PDF and tracked placeholder logo. |
| Non-overlapping ranges | table | PASS | No task range collisions across milestones. |
| Release slicing | §Release slicing | PASS | MVP (M0–M8), v1 (M9+), and Later cleanly categorized. |
| Dependency graph | §Dependency graph | PASS | Mermaid pipeline tracing M0 through M9. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

## Acceptance Criteria Verification

- [x] **AC 1 (Section Completeness):** All required sections per Blueprint §4 are present in both documents.
- [x] **AC 2 (Risk Actions):** Every risk has L, I, mitigation, owner; all scores ≥ 15 have documented owner actions and milestones.
- [x] **AC 3 (Roadmap Alignment):** M1 key-tasks cell lists actual filed task IDs (`TMU-DOC-001..020, TMU-OPS-033`) without overlapping ranges.
- [x] **AC 4 (Approval Status):** Front-matter `status: approved` and `updated: 2026-10-03` set on both docs.
- [x] **AC 5 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
