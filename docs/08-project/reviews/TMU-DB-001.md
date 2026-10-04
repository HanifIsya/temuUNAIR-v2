---
id: REV-TMU-DB-001
task: TMU-DB-001
title: "Core tables migration — users, Auth.js adapter, locations, drop_points"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-DB-001 — Review cycle 1

Diff reviewed: `main...HEAD` on branch `agent/db/TMU-DB-001-db-core-tables`.
Files reviewed: `packages/db/migrations/0002_core.sql`, `packages/db/migrations/meta/*`,
`packages/db/src/schema.ts`, `tests/db/migrations-core.test.ts`, `tasks/TMU-DB-001.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
All core domain tables specified in BE-05 are landed in `0002_core.sql` and matched
in `packages/db/src/schema.ts`: `users` (with `user_role` and `campus` enums, `citext`
email unique, `status` check constraint), the canonical Auth.js adapter tables
(`accounts`, `sessions`, `verification_tokens` as BE-05 rule 7 exceptions), `locations`
(with self-referencing `parent_id` FK), and `drop_points` (with `hours` JSONB and
`location_id` FK).

Red tests (`tests/db/migrations-core.test.ts`) failed 5/5 before the migration and pass
5/5 after against a real pgvector database. `drizzle-kit generate` reports zero schema
drift. `pnpm db:check` passes with `db:check: ok` against local pgvector.
Full `pnpm gate:quick` exits 0 (145/145 unit tests passed).

## Acceptance Criteria Verification

- [x] Forward-only migration `0002_core.sql` + rollback note in header.
- [x] Drizzle schema mirrors BE-05; `pnpm db:check` reports `db:check: ok`.
- [x] Enums `user_role` and `campus` created; `email` typed `citext` unique; `status` check constraint enforced.
- [x] Red tests first: `tests/db/migrations-core.test.ts` 5/5 failed on empty DB, 5/5 passed after migration.
- [x] `pnpm gate:quick` green.

## Verdict

**APPROVE.** Clean migration, correct Drizzle schema, red-first live test coverage. Ready to merge to `main`.
