---
id: REPORT-OUTLINE
title: Written report outline
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["COURSE-README", "PRD", "ARCH-OVERVIEW"]
source_refs: ["Blueprint §4.9"]
---

# Written report outline

Auto-derived from the docs; each section lists its source so the report is a *rendering*, not a
rewrite. Indonesian for submission; section titles below in both.

## Bab I — Pendahuluan (Introduction)

| Section | Source |
|---|---|
| 1.1 Latar belakang | `docs/01-product/01-PRD.md` §1 (problem), proposal PDF |
| 1.2 Rumusan masalah | PRD §2 goals (G1–G5) rephrased as questions |
| 1.3 Tujuan | PRD §2 table |
| 1.4 Manfaat | `02-vision-and-scope.md` (for users, campus, team) |
| 1.5 Batasan masalah | PRD §3 non-goals, `02-vision-and-scope.md` out-of-scope |
| 1.6 Sistematika penulisan | this outline |

## Bab II — Landasan teori dan analisis kebutuhan

| Section | Source |
|---|---|
| 2.1 Teori: lost-and-found, multimodal matching, CLIP/YOLO, NLP | `03-architecture/06-ml-service-design.md`, `05-matching-algorithm-spec.md` |
| 2.2 Teori: privasi data (UU PDP), keamanan | `03-architecture/15-privacy-and-data-retention.md` |
| 2.3 Analisis kebutuhan fungsional | `01-product/05-functional-requirements.md` |
| 2.4 Analisis kebutuhan non-fungsional | `01-product/06-non-functional-requirements.md` |
| 2.5 Persona dan user journey | `01-product/03-personas.md`, `02-design/05-user-flows.md` |
| 2.6 Kebutuhan perangkat | `03-architecture/02-tech-stack-and-versions.md` |

## Bab III — Perancangan sistem

| Section | Source |
|---|---|
| 3.1 Arsitektur sistem (C4) | `03-architecture/01-system-overview.md` |
| 3.2 Model data (ERD) | `03-architecture/03-data-model-erd.md`, `04-contracts/backend/BE-05-database-contract.md` |
| 3.3 State machine laporan/klaim/kecocokan | `03-architecture/04-state-machines.md` |
| 3.4 Desain algoritma pencocokan | `03-architecture/05-matching-algorithm-spec.md` |
| 3.5 Desain layanan ML | `03-architecture/06-ml-service-design.md` |
| 3.6 Desain API (kontrak backend) | `04-contracts/backend/BE-01..13` |
| 3.7 Desain antarmuka (route map, komponen, wireframe) | `04-contracts/frontend/FE-01..12`, `02-design/06-wireframes.md` |
| 3.8 Desain keamanan & privasi | `03-architecture/14-security-threat-model.md`, `15-privacy-and-data-retention.md` |
| 3.9 Keputusan desain (ADR) | `03-architecture/adr/*` |

## Bab IV — Implementasi

| Section | Source |
|---|---|
| 4.1 Lingkungan pengembangan | `07-ops/01-local-dev-setup.md` |
| 4.2 Struktur repositori | `docs/00-BLUEPRINT.md` §3 |
| 4.3 Implementasi backend (endpoint, job) | `apps/web/src/server`, `apps/worker`, task files |
| 4.4 Implementasi frontend | `apps/web/src`, task files |
| 4.5 Implementasi layanan ML | `services/ml` |
| 4.6 Alur kerja agen & kontrol kualitas | `05-workflow/02-agent-loop.md`, `06-code-review-checklist.md` |

## Bab V — Pengujian dan evaluasi

| Section | Source |
|---|---|
| 5.1 Strategi pengujian | `06-quality/01-test-strategy.md` |
| 5.2 Test case & hasil | `06-quality/02-test-cases/*`, CI runs |
| 5.3 E2E | `06-quality/03-e2e-scenarios.md` |
| 5.4 Evaluasi ML (Recall@k, MRR, presisi) | `06-quality/10-ml-eval-report-<date>.md` |
| 5.5 Performa | `06-quality/06-performance-budget.md` + measured results |
| 5.6 Aksesibilitas & keamanan | `06-quality/08-accessibility-audit.md`, `07-security-checklist.md` |
| 5.7 UAT | `06-quality/09-uat-plan.md` results |
| 5.8 Metrik keberhasilan | `01-product/11-success-metrics.md` with real numbers |

## Bab VI — Penutup

| Section | Source |
|---|---|
| 6.1 Kesimpulan (per goal G1–G5) | PRD §2 + results |
| 6.2 Keterbatasan | risk register open items, `OPEN` markers |
| 6.3 Saran / future work | `01-product/02-vision-and-scope.md` "Later", stretch tasks |

## Lampiran

| Appendix | Source |
|---|---|
| A. Kontrak API | generated OpenAPI + `BE-03` |
| B. Wireframe & desain | `02-design/*` |
| C. Riwayat kontribusi | task files + git log |
| D. Bukti pengujian | CI artifacts, coverage, eval reports |
| E. Demo script | `docs/09-course/demo-script.md` |

## Writing rules

1. Numbers in the report must match the repo (metrics, eval, coverage) — no hand-waved claims.
2. Every `OPEN` item is stated as a limitation, never silently omitted.
3. Screenshots come from the seeded demo data (no real data).
4. Keep the repo as the appendix: reference file paths instead of pasting everything.
