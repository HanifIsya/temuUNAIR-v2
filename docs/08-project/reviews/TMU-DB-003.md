---
id: REV-TMU-DB-003
task: TMU-DB-003
title: "Reports additions + matching tables — needs_reprocess, FTS trigger, features, matches"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-DB-003 — Review cycle 1

Diff reviewed: `main...HEAD` on branch `agent/db/TMU-DB-003-db-reports-additions-matching`.
Files reviewed: `packages/db/migrations/0004_reports_additions_matching.sql`,
`packages/db/migrations/meta/*`, `packages/db/src/schema.ts`,
`tests/db/reports-additions-matching.test.ts`, `tasks/TMU-DB-003.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
All domain additions and matching tables specified in BE-05 are landed in
`0004_reports_additions_matching.sql` and matched in `packages/db/src/schema.ts`:
- `needs_reprocess` boolean column added to `reports` with default false (BE-07)
- `reports_tsv_update()` plpgsql trigger function and `reports_tsv_trg` trigger on `reports`
  for automatic FTS maintenance
- `match_state` enum matching BE-05 ('SUGGESTED','DISMISSED','CLAIMED','INVALIDATED')
- `image_features` table with `vector(512)` embedding and cascade FK to `report_images`
- `report_features` table with `image_embedding vector(512)`, `clip_text_embedding vector(512)`,
  `sentence_embedding vector(384)`, `attributes jsonb default '{}'`, and 3 HNSW indexes using
  `vector_cosine_ops`
- `matches` table with unique constraint on `(lost_report_id, found_report_id)` and numeric(4,3) score

Red tests (`tests/db/reports-additions-matching.test.ts`) failed 6/6 before the migration and
pass 6/6 after, including an insert verification proving the FTS trigger populates `search_tsv`.
`drizzle-kit generate` reports zero drift. `pnpm db:check` passes with `db:check: ok`.
Full `pnpm gate:quick` exits 0 (157/157 unit tests passed).

## Acceptance Criteria Verification

- [x] Forward-only migration `0004_reports_additions_matching.sql` + rollback note in header.
- [x] FTS trigger function + trigger created and verified functional.
- [x] Drizzle schema mirrors BE-05; `pnpm db:check` reports `db:check: ok`.
- [x] Enums and tables created; 3 HNSW vector indexes created.
- [x] Red tests first: `tests/db/reports-additions-matching.test.ts` 6/6 failed on empty DB, 6/6 passed after migration.
- [x] `pnpm gate:quick` green.

## Verdict

**APPROVE.** Clean migration, correct Drizzle schema, red-first live test coverage. Ready to merge to `main`.
