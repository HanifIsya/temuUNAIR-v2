---
id: REV-TMU-ARC-005
task: TMU-ARC-005
title: "Review and approve Matching Algorithm Spec (05-matching-algorithm-spec.md)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-ARC-005 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/arch/TMU-ARC-005-review-matching-algorithm-spec`.
Files reviewed: `docs/03-architecture/05-matching-algorithm-spec.md`, `tasks/TMU-ARC-005.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
`docs/03-architecture/05-matching-algorithm-spec.md` has been audited against Blueprint §4.4 and §5A.9.
The document fully specifies the 6-stage matching pipeline (hard filters, candidate retrieval using
pgvector HNSW indexes, 6 signal scoring functions, weights and renormalization, band thresholds,
and explainability mechanisms). Front-matter status is advanced to `approved`.

## Blueprint §4.4 Specification Audit

| Requirement | Section | Status | Verification Detail |
|---|---|---|---|
| Pipeline overview | §Pipeline | PASS | Mermaid flowchart LR detailing process → features → match → filters → retrieval → score → persist → notify. |
| Hard filters | §1 Hard filters | PASS | SQL hard filters across report types, owner uniqueness, compatibility groups G-A..E, and time windows. |
| Candidate retrieval | §2 Candidate retrieval | PASS | Union of top-50 from image HNSW, text HNSW, and sentence HNSW indexes (capped ≤ 100). |
| Signal scoring | §3 Signals | PASS | 6 mathematical definitions: S_ii, S_ti, S_tt, S_attr, S_loc, S_time mapped to [0,1]. |
| Weights & normalization | §4 Weights | PASS | Weighted sum with image-less fallback renormalization. |
| Bands & explainability | §5, §6 | PASS | STRONG (≥ 0.75) and POSSIBLE (≥ 0.55) bands, top-10 persistence, and explainable reason keys. |
| Sensitive rules | §7 | PASS | Prohibits raw score exposure; enforces strict masking for sensitive categories. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

## Acceptance Criteria Verification

- [x] **AC 1 (Algorithm Specification Complete):** Scoring weights, thresholds (STRONG/POSSIBLE), and explanation logic are documented.
- [x] **AC 2 (Approval Status):** Front-matter `status: approved` and `updated: 2026-10-03` set.
- [x] **AC 3 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
