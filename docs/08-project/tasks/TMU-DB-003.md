---
id: TMU-DB-003
title: Reports additions + matching tables — needs_reprocess, FTS trigger, features, matches
status: DONE
lane: db
slug: db-reports-additions-matching
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-DB-002]
refs: [BE-05, BE-06, BE-07, MATCH-SPEC, DEC-002]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-DB-003 — Reports additions + matching tables — needs_reprocess, FTS trigger, features, matches

## Goal

Apply the reports-side domain additions exactly where BE-05 §"TMU-DB-003" places them
(relocated by `TMU-CTR-006`): `needs_reprocess` column (BE-07 dead-letter marker),
`reports_tsv_update()` and `reports_tsv_trg`. In the same self-contained migration, land
the matching tables from the BE-05 DDL block: `image_features`, `report_features`
(with the three HNSW indexes: img/txt/sent, `vector(512)`/`vector(384)` per DEC-002) and
`matches` (`UNIQUE (lost_report_id, found_report_id)`, `algo_version`, `components jsonb`).

## Acceptance criteria

- [x] Migration reproduces BE-05 §TMU-DB-003 statements verbatim + features/matches tables and HNSW indexes.
- [x] Drizzle schema carries `needsReprocess`, features, matches; `pnpm db:check` green.
- [x] Red tests: trigger refreshes `search_tsv`; HNSW index present; matches unique-pair constraint.
- [x] `pnpm gate` green.

## Files expected to change

- `packages/db/migrations/0004_reports_additions_matching.sql`, `packages/db/migrations/meta/*`
- `packages/db/src/schema.ts`
- `tests/db/reports-additions-matching.test.ts`
- `docs/08-project/tasks/TMU-DB-003.md`
- `docs/08-project/reviews/TMU-DB-003.md`
- `docs/08-project/backlog.md`, `docs/08-project/status.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | backend-dev | 1 PICK | branch `agent/db/TMU-DB-003-db-reports-additions-matching` created from `main`; dep `TMU-DB-002` DONE |
| 2026-10-03 | backend-dev | 2 RED | `tests/db/reports-additions-matching.test.ts` run against scratch DB → **6/6 fail** for the right reason (`needs_reprocess`, trigger, `image_features`, `report_features`, `matches` absent) |
| 2026-10-03 | backend-dev | 3 PLAN | 1) Add `needsReprocess` to `reports`, add `matchState` enum, `imageFeatures`, `reportFeatures` (with 3 HNSW indexes), and `matches` to `schema.ts`; 2) `pnpm db:generate` → `0004_reports_additions_matching.sql`; 3) Add `reports_tsv_update` function and `reports_tsv_trg` trigger; 4) re-run gate |
| 2026-10-03 | backend-dev | 5 GREEN | `tests/db/reports-additions-matching.test.ts` passes 6/6 (including FTS trigger insertion test); `pnpm db:check` → `db:check: ok`; all live tests pass |
| 2026-10-03 | backend-dev | 7 GATE | `pnpm gate:quick` → `OK gate(quick) passed` (157/157 unit tests passed) |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 B, 0 M, 0 MINOR) → `docs/08-project/reviews/TMU-DB-003.md` |
| 2026-10-03 | backend-dev | 10 SHIP | task flipped to DONE; squash-merged to `main` |

## Evidence

- Red: `tests/db/reports-additions-matching.test.ts` 6/6 FAIL against pre-migration DB, 6/6 PASS after migration
- Green: `drizzle-kit generate` reports zero drift; `pnpm db:check` → `db:check: ok`; all live tests pass
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** → `docs/08-project/reviews/TMU-DB-003.md`

## Blockers

(none)
