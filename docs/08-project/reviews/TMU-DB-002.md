---
id: REV-TMU-DB-002
task: TMU-DB-002
title: "Reports base migration — reports, report_images, verification_hints"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-DB-002 — Review cycle 1

Diff reviewed: `main...HEAD` on branch `agent/db/TMU-DB-002-db-reports-base`.
Files reviewed: `packages/db/migrations/0003_reports.sql`, `packages/db/migrations/meta/*`,
`packages/db/src/schema.ts`, `tests/db/reports-base.test.ts`, `tasks/TMU-DB-002.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
All reports base domain tables specified in BE-05 are landed in `0003_reports.sql` and matched
in `packages/db/src/schema.ts`:
- `report_type` and `report_status` PostgreSQL enums matching BE-05
- `reports` table with all base columns, `CHECK ((type = 'FOUND') = (custody IS NOT NULL))`
  and `CHECK (custody IN ('HELD_BY_FINDER', 'AT_DROP_POINT'))`
- `reports_browse_idx`, `reports_reporter_idx`, `reports_tsv_idx` GIN, `reports_expiry_idx` partial index
- `report_images` with cascade FK to `reports` and status check
- `verification_hints` with cascade FK to `reports` and `bytea` answer_enc
- `needs_reprocess` and FTS trigger are correctly deferred to `TMU-DB-003` per BE-05

Red tests (`tests/db/reports-base.test.ts`) failed 6/6 before the migration and pass 6/6 after
against a real pgvector database. `drizzle-kit generate` reports zero schema drift.
`pnpm db:check` passes with `db:check: ok` against local pgvector.

## Acceptance Criteria Verification

- [x] Forward-only migration `0003_reports.sql` + rollback note in header.
- [x] Drizzle schema mirrors BE-05; `pnpm db:check` reports `db:check: ok`.
- [x] Enums `report_type` and `report_status` created; FOUND-custody CHECK constraint enforced.
- [x] Red tests first: `tests/db/reports-base.test.ts` 6/6 failed on empty DB, 6/6 passed after migration.
- [x] `needs_reprocess` and FTS trigger omitted (deferred to TMU-DB-003 per BE-05).

## Verdict

**APPROVE.** Ready to merge to `main`.
