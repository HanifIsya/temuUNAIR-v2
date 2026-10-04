---
id: TMU-DB-003
title: Reports additions + matching tables — needs_reprocess, FTS trigger, features, matches
status: TODO
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

- [ ] Migration reproduces BE-05 §TMU-DB-003 statements verbatim + features/matches tables and HNSW indexes.
- [ ] Drizzle schema carries `needsReprocess`, features, matches; `pnpm db:check` green.
- [ ] Red tests: trigger refreshes `search_tsv`; HNSW index present; matches unique-pair constraint.
- [ ] `pnpm gate` green.

## Files expected to change

- `packages/db/migrations/0004_reports_additions_matching.sql`, meta snapshot
- `packages/db/src/schema.ts`
- `tests/db/*`
- `docs/08-project/tasks/TMU-DB-003.md`
