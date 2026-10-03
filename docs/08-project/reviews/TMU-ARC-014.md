---
id: REV-TMU-ARC-014
task: TMU-ARC-014
title: "Review and approve Security Threat Model and Privacy (14-security-threat-model.md, 15-privacy-and-data-retention.md)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-ARC-014 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/sec/TMU-ARC-014-review-security-privacy-arch`.
Files reviewed: `docs/03-architecture/14-security-threat-model.md`, `15-privacy-and-data-retention.md`, `tasks/TMU-ARC-014.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
Both `14-security-threat-model.md` and `15-privacy-and-data-retention.md` have been audited against
Blueprint §4.4 and §9. The STRIDE threat model covers all six trust boundaries (TB-1..6) and seven
product-specific abuse cases (A1..A7). The privacy and data retention architecture operationalizes
UU PDP (Law 27/2022) with a data inventory, data minimisation rules, 7-day cool-off deletion lifecycle,
and pino structured log redaction. Front-matter status is advanced to `approved` on both documents.

## Blueprint §4.4 Specification Audit

| Requirement | Section | Status | Verification Detail |
|---|---|---|---|
| STRIDE per trust boundary | §TB-1..TB-6 | PASS | Explicit threat and mitigation matrices for TB-1 (browser), TB-2 (storage), TB-3 (ML), TB-4 (DB), TB-5 (admin), TB-6 (email). |
| Abuse cases | §Abuse cases | PASS | 7 specific abuse vectors (fraud, sensitive item doxxing, scraping, harassment, enumeration, matching poison, moderator leaks). |
| Data inventory & retention | §Data inventory | PASS | 10 data categories with legal basis, retention periods, and deletion mechanisms. |
| Minimisation rules | §Minimisation rules | PASS | 6 strict rules (no phone/NIM collection, first name + initial public display, server-side embeddings, pino redaction). |
| Deletion flows | §Deletion flows | PASS | Account deletion cool-off (7 days), soft cancel, moderator removal, and retention sweeps. |
| Log redaction | §Log redaction | PASS | Pino redaction path list covering cookies, tokens, emails, hint answers, bodies, and passwords. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03` on both documents. |

## Acceptance Criteria Verification

- [x] **AC 1 (STRIDE & Privacy Documented):** STRIDE analysis across all trust boundaries and UU PDP data retention rules documented.
- [x] **AC 2 (Approval Status):** Front-matter `status: approved` and `updated: 2026-10-03` set on both docs.
- [x] **AC 3 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
