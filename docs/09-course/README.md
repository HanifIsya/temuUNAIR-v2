---
id: COURSE-README
title: Course deliverables mapping
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["PRD", "ROADMAP", "METRICS"]
source_refs: ["proposal.pdf (pending extract)", "Blueprint §4.9"]
---

# Course deliverables mapping

Maps the course requirements (report Bab I–III, presentation, demo) to repo artifacts. Course:
**Inovasi Sistem Informasi dan Teknologi I1, S1 Sistem Informasi, Universitas Airlangga** —
Kelompok 3.

| Deliverable | Repo source |
|---|---|
| Bab I — Pendahuluan (latar belakang, rumusan masalah, tujuan) | `docs/01-product/01-PRD.md` §1–2, `02-vision-and-scope.md`, `docs/_source/proposal.pdf` |
| Bab II — Landasan teori & analisis kebutuhan | `docs/01-product/03-personas.md`, `04-user-stories.md`, `05-functional-requirements.md`, `06-non-functional-requirements.md`, `docs/02-design/*` |
| Bab III — Perancangan sistem | `docs/03-architecture/*` (C4, ERD, state machines, ML design), `docs/04-contracts/*` (API + FE contracts), `docs/02-design/06-wireframes.md` |
| Bab IV — Implementasi | `apps/web`, `apps/worker`, `services/ml` (once built), commit history, `docs/05-workflow/*` |
| Bab V — Pengujian & evaluasi | `docs/06-quality/*` (test strategy, cases, E2E, perf budget, a11y audit, ML eval), `docs/06-quality/09-uat-plan.md` results |
| Presentasi | `docs/09-course/demo-script.md` + `docs/09-course/report-outline.md` |
| Demo aplikasi | `docs/09-course/demo-script.md` (8 steps following the PDF "Cara Kerja") |
| Lampiran kontribusi anggota | `docs/08-project/tasks/*` (owners per task), CODEOWNERS, git log |

## Member roles (from the PDF, per blueprint §1.2)

| Member | Role in the build | Lanes |
|---|---|---|
| Rizaldi | Product / Fitur 1 (reporting) | docs, fe (report UI) |
| Hanif | API / communication | be, ops |
| Abdul | DB / management / visual | db, fe (visual) |
| Maysha | AI/ML | ml |

Replace with real names/handles in `.github/CODEOWNERS` before M3.

## Grading-friendly evidence to keep current

1. **Traceability**: `docs/08-project/traceability-matrix.md` (goal → story → FR → screen → API →
   test) — shows requirement coverage.
2. **Test evidence**: `docs/06-quality/02-test-cases/*`, E2E list, ML eval reports, coverage in
   `status.md`.
3. **Process evidence**: task files with red/green evidence, review files, decisions log, risk
   register updates.
4. **Demo evidence**: seeded demo script + screenshots/recording references.
5. **Contribution evidence**: task owners + commit trailers (`Task:`, `Agent:`).

## Repo hygiene for submission

- Tag the submission commit (`m9-launch` / `v0.1.0`).
- Ensure `pnpm gate:full` is green on the tagged commit.
- Freeze `docs/` (no drafts pending) or clearly mark what is future work.
