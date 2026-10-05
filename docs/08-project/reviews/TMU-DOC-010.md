---
id: REV-TMU-DOC-010
task: TMU-DOC-010
title: "Review and approve the operations-model and user-research docs"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-DOC-010 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/docs/TMU-DOC-010-review-ops-research-docs`.
Files reviewed: `14-operations-model.md`, `15-user-research-plan.md`, `tasks/TMU-DOC-010.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
Both `14-operations-model.md` and `15-user-research-plan.md` have been audited against their Blueprint
§4 rows, verified for operational realism without inventing unconfirmed campus operations facts,
and advanced to `status: approved`. The operations model clearly delineates roles, SLAs, drop
points, and escalation paths, while the research plan defines concrete discovery and usability
protocols.

## Blueprint §4 Specification Audit

### 1. `docs/01-product/14-operations-model.md`

Blueprint §4 requirements: *Who physically runs lost-and-found (security posts?), SLAs, drop points, moderator per campus, escalation*

| Requirement | Section | Status | Verification Detail |
|---|---|---|---|
| Physical operations | §1 | PASS | Defines Campus moderators (staff/volunteers), Service admin (team/IT), and Drop-point keepers (security post staff receiving/storing items). |
| Drop points | §2 | PASS | Specifies definition, admin management (`/admin/places`), stored schema (name, campus, hours, note, active flag), public privacy boundary, and synthetic "contoh" fallback (DEC-005). |
| SLAs | §3 | PASS | Quantified targets: Report verification ≤ 48 h (MET-008), Dispute resolution ≤ 5 working days, Flag triage ≤ 24 h, Privacy deletion ≤ 3 working days (7-day cool-off execution). |
| Escalation path | §4 | PASS | Clear Mermaid flow (User → Moderator → Admin → DPO/Legal / Incident Response) with specific handling for fraud, PII exposure, and physical safety. |
| Moderator per campus | §1, §4, §5 | PASS | Campus-scoped moderation (`moderator_campus`); onboarding checklist covering tools, sensitive item rules, and audit log monitoring. |
| Fact fidelity | §6 | PASS | Open questions (drop-point list O-1 = OQ-3 / DEC-022, staffing O-2, mailbox O-3, high-value policy O-4) tracked without fabricating UNAIR operational facts. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

### 2. `docs/01-product/15-user-research-plan.md`

Blueprint §4 requirements: *Interview/survey script, usability test plan*

| Requirement | Section | Status | Verification Detail |
|---|---|---|---|
| Discovery interviews | §1 | PASS | Screener criteria (5–8 participants, loser/finder mix), 7-item semi-structured interview script, and mapped outputs. |
| Usability test plan | §2 | PASS | 8 structured think-aloud tasks (T1–T8) spanning reporting, search, matching, claims, handover, and i18n, with measurable success criteria and SUS target ≥ 68. |
| Ethics & data privacy | §3 | PASS | Informed consent, no audio/video committed to repo, anonymized notes, synthetic test items only. |
| Cadence & owners | §4 | PASS | Timeline from M3/M4 discovery through M9 UAT. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

## Acceptance Criteria Verification

- [x] **AC 1 (Section Completeness):** All required sections per Blueprint §4 are present in both documents.
- [x] **AC 2 (Operational Fidelity):** No unconfirmed UNAIR operations facts invented; open items remain linked to their DEC/OQ deferrals.
- [x] **AC 3 (Findings Fixed):** Both documents verified and clean.
- [x] **AC 4 (Approval Status):** Front-matter `status: approved` and `updated: 2026-10-03` set on both docs.
- [x] **AC 5 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
