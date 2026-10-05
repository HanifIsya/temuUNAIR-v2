---
id: METRICS
title: Success metrics and instrumentation
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["PRD", "FR", "FE-10", "ADM-11"]
source_refs: ["proposal.pdf §B Tujuan 1–5 (via docs/_source/proposal-extract.md)", "Blueprint §5B.9, §5B.10"]
---

# Success metrics

Targets are provisional for a course-scale deployment; final numbers are set at M1 after
`proposal-extract.md` lands and at M5 after the first eval report.

## North-star

**Median time-to-return** — days from a FOUND report's creation to the claim's `COMPLETED`
state. Lower is better; target **≤ 7 days** for matched items.

## Metric table

| ID | Metric | Definition | Target | Instrumentation | Goal |
|---|---|---|---|---|---|
| MET-001 | Activation | % of new users who create ≥1 report within 24 h of first login | ≥ 40% | `report_submitted` ÷ new sessions | G1 |
| MET-002 | Report→match rate | % of OPEN LOST reports receiving ≥1 match (any band) within 72 h | ≥ 50% | matches table + `report_submitted` | G2 |
| MET-003 | Precision@5 | Share of top-5 suggestions a human evaluator marks correct on the eval set | ≥ 0.7 | `/eval-matching` report | G2 |
| MET-004 | Match→claim rate | % of STRONG matches that produce a claim | ≥ 30% | matches + claims | G2, G3 |
| MET-005 | Claim success rate | APPROVED ÷ SUBMITTED claims | ≥ 50% | claims table | G3 |
| MET-006 | Two-sided completion | % of COMPLETED claims with both confirmations | 100% (by design) | claims table constraint | G3 |
| MET-007 | Time-to-return | Median days FOUND created → claim COMPLETED | ≤ 7 days | claims + reports timestamps | G3 |
| MET-008 | Moderation SLA | Median hours from flag/PENDING_REVIEW to decision | ≤ 48 h | audit_logs + reports | G4 |
| MET-009 | Dispute rate | DISPUTED ÷ claims with a decision | ≤ 10% | claims table | G3, G4 |
| MET-010 | Sensitive-item safety | % of sensitive reports with masked photos and generalized text at read time | 100% (by design) | contract tests + audit | G5 |
| MET-011 | Privacy requests honoured | % of `DELETE /me` requests anonymized within cool-off + 1 day | 100% | `account.delete` job logs | G5 |
| MET-012 | Report abandonment | % of reports EXPIRED without any match or claim | ≤ 60% (first semester) | reports table | G1 |

## Instrumentation map

Client events (`FE-10`, no PII): `report_wizard_started`, `report_wizard_step_completed`,
`report_submitted`, `search_performed`, `match_viewed`, `match_dismissed`, `claim_started`,
`claim_submitted`, `claim_decision`, `handover_confirmed`, `report_returned{daysOpen}`,
`notification_opened`, `error_shown{code}`.

Server sources: `reports`, `matches`, `claims`, `audit_logs`, job run logs (`jobId`,
`durationMs`), `GET /admin/stats` (`API-ADM-11`).

## Reporting cadence

- **Weekly** during M4–M8: `status.md` + a metrics snapshot in the course report draft.
- **Per release:** `09-course/report-outline.md` §Evaluasi pulls the latest numbers.
- **Per eval change:** MET-003 always from the dated `10-ml-eval-report-<date>.md`.
