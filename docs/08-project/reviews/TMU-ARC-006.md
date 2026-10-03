---
id: REV-TMU-ARC-006
task: TMU-ARC-006
title: "Review and approve ML Service Design (06-ml-service-design.md)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-ARC-006 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/arch/TMU-ARC-006-review-ml-service-design`.
Files reviewed: `docs/03-architecture/06-ml-service-design.md`, `tasks/TMU-ARC-006.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
`docs/03-architecture/06-ml-service-design.md` has been audited against Blueprint §4.4 and §5A.8.
The ML service architecture is thoroughly specified: FastAPI stateless endpoints, CPU-only ViT-B/32 and
YOLO-n models, `models.lock.json` checksum-based registry, warm-up boot procedure, and strict SSRF and
zero-retention privacy guards. Front-matter status is advanced to `approved`.

## Blueprint §4.4 Specification Audit

| Requirement | Section | Status | Verification Detail |
|---|---|---|---|
| Endpoints | §Endpoints | PASS | 5 endpoints matching `BE-06`: `/health`, `/ready`, `/v1/models`, `/v1/analyze-image`, `/v1/embed-text`, `/v1/extract-attributes`. |
| Models & Preprocessing | §Models and preprocessing | PASS | YOLO-n crop helper (AGPL noted per DEC-016), ViT-B/32 512-d embeddings, multilingual sentence encoder, rule-based lexicon extractor. |
| Model registry & startup | §Model registry and startup | PASS | `models.lock.json` checksum verification on boot, warm-up dummy pass, and error handling. |
| Performance budget (CPU) | §Performance budget | PASS | P95 budgets (analyze-image ≤ 3s, embed-text ≤ 400ms, extract-attributes ≤ 50ms) and ≤ 2 GB RSS memory cap. |
| Safety & privacy | §Safety and privacy | PASS | Presigned URL allowlist against SSRF, in-memory decoding without persistence, determinism, and bearer token auth. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

## Acceptance Criteria Verification

- [x] **AC 1 (CPU Budgets & Warm-up):** CPU-only ViT-B/32 and YOLO-n resource budgets and warm-up procedures are documented.
- [x] **AC 2 (Approval Status):** Front-matter `status: approved` and `updated: 2026-10-03` set.
- [x] **AC 3 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
