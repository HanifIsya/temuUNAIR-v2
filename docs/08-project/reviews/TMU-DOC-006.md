---
id: REV-TMU-DOC-006
task: TMU-DOC-006
title: "Review and approve the acceptance-criteria and glossary docs"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-DOC-006 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/docs/TMU-DOC-006-review-ac-glossary-docs`.
Files reviewed: `07-acceptance-criteria.md`, `08-glossary.md`, `tasks/TMU-DOC-006.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
Both `07-acceptance-criteria.md` and `08-glossary.md` have been audited against their Blueprint §4
specifications, verified for semantic completeness, and advanced to `status: approved`. The four
mandatory edge cases in acceptance criteria are explicitly documented in valid Gherkin syntax, and
the glossary contains all required core terminology with consistent Indonesian↔English pairs.

## Blueprint §4 Specification Audit

### 1. `docs/01-product/07-acceptance-criteria.md`

Blueprint §4 requirements: *Gherkin per FR including edge cases (duplicate reports, expired reports, blocked user, two claimants)*

| Requirement | Section | Status | Verification Detail |
|---|---|---|---|
| Gherkin syntax | all | PASS | Proper Gherkin keywords (`Scenario`, `Given`, `When`, `Then`, `And`) across all scenarios. |
| Duplicate reports edge case | §REPORT | PASS | Explicit scenario `Scenario: Reporter is warned about a possible duplicate` for same-category/campus found reports. |
| Expired reports edge case | §REPORT & §CLAIM | PASS | `Scenario: Renew inside the grace window` (grace period renew), `Scenario: Unanswered claim expires` (72h timeout), `Scenario: One-sided confirmation never auto-completes` (72h escalation to DISPUTED). |
| Blocked user edge case | §AUTH & §CLAIM | PASS | `Scenario: Suspended user is blocked everywhere` (403 ACCOUNT_SUSPENDED), `Scenario: Three rejections block the claimant` (429 CLAIM_LIMIT_EXCEEDED). |
| Two claimants edge case | §CLAIM | PASS | `Scenario: Approval locks the claim`: `Given two SUBMITTED claims on one found report`, `When the finder approves claim 1`, `Then claim 1 is APPROVED, claim 2 is REJECTED with reason "already approved"`. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

### 2. `docs/01-product/08-glossary.md`

Blueprint §4 requirements: *Indonesian↔English: barang hilang/ditemukan, pelapor, civitas akademika, KTM, verifikasi, serah terima …*

| Term | English Equivalent | Status | Verification Detail |
|---|---|---|---|
| Barang hilang | Lost item | PASS | Defined in core vocabulary table. |
| Barang ditemukan | Found item | PASS | Defined in core vocabulary table. |
| Pelapor | Reporter | PASS | Defined in core vocabulary table. |
| Penemu | Finder | PASS | Defined in core vocabulary table. |
| Pemilik | Owner / claimant | PASS | Defined in core vocabulary table. |
| Civitas akademika | Campus community | PASS | Defined in core vocabulary table. |
| KTM | Student ID card | PASS | Defined with sensitive category tag (`ID_CARD`, DEC-014). |
| Verifikasi | Verification | PASS | Defined in core vocabulary table. |
| Serah terima | Handover | PASS | Defined with two-sided confirmation note. |
| Status vocabularies | Report & Claim | PASS | Complete mappings for `ReportStatus` (8 codes) and `ClaimStatus` (7 codes) with UI strings. |
| Naming rules | Code vs UI | PASS | Explicit rules for identifiers, UI strings, and enum casings. |
| Source refs | header | PASS | Refreshed from `(pending extract)` to `proposal.pdf (via docs/_source/proposal-extract.md)`. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

## Acceptance Criteria Verification

- [x] **AC 1 (Section Completeness):** All required sections per Blueprint §4 are present in both documents.
- [x] **AC 2 (Four Named Edge Cases):** Duplicate reports, expired reports, blocked user, and two claimants exist as valid Gherkin scenarios.
- [x] **AC 3 (Findings Fixed):** Stale source reference refreshed, statuses advanced.
- [x] **AC 4 (Approval Status):** Front-matter `status: approved` and `updated: 2026-10-03` set on both docs.
- [x] **AC 5 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
