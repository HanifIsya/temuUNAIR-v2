---
id: TMU-DB-001
title: Core tables migration — users, Auth.js adapter, locations, drop_points
status: BLOCKED
lane: db
slug: db-core-tables
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-CTR-007]
refs: [BE-05, ARCH-ERD, DEC-002, BLK-001]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-DB-001 — Core tables migration — users, Auth.js adapter, locations, drop_points

## Goal

Land the first domain migration `0002_core.sql` after the extensions-only `0001_init`:
`users` (with role/status/moderator_campus enums per BE-05), the Auth.js adapter tables
(`accounts`, `sessions`, `verification_tokens`), `locations` (self-referencing place tree)
and `drop_points` (hours jsonb, contact_note). Update `packages/db/src/schema.ts` to match.

## Acceptance criteria

- [ ] Forward-only migration `0002_*.sql` + rollback note; merged migration never edited after.
- [ ] Drizzle schema mirrors BE-05 for these tables; `pnpm db:check` green (no drift).
- [ ] Enums created as Postgres types per BE-05; email citext unique; least-privilege notes.
- [ ] Red tests first (`tests/db/`): migration applies on empty DB; schema-drift detected.
- [ ] `pnpm gate` green.

## Files expected to change

- `packages/db/migrations/0002_*.sql`, `packages/db/migrations/meta/*`
- `packages/db/src/schema.ts`
- `tests/db/*`
- `docs/08-project/tasks/TMU-DB-001.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | backend-dev | 1 PICK | branch `agent/db/TMU-DB-001-db-core-tables` created from `main` (`6d8040d`); dep `TMU-CTR-007` DONE; status → IN_PROGRESS→BLOCKED |
| 2026-10-03 | backend-dev | 2 RED | `tests/db/migrations-core.test.ts` (5 live introspection tests) run against empty scratch DB → **5/5 fail** for the right reason (`users/accounts/sessions/verification_tokens/locations/drop_points` absent) |
| 2026-10-03 | backend-dev | 3 PLAN | 1) `packages/db/src/schema.ts`: `citext` via `customType` (drizzle-orm 0.45 has no built-in builder); users + BE-05 enums/CHECK/unique email; canonical Auth.js adapter (composite PKs, cascade user FKs) as the BE-05 rule-7 exception; `locations.parent_id` self-FK; `drop_points.hours jsonb`; 2) `pnpm db:generate` → tag rename `0002_dry_post`→`0002_core` in file+journal (snapshot idx-keyed, unchanged); 3) rollback note in SQL header; 4) fix introspection array_agg cast in the test; 5) re-run gate |
| 2026-10-03 | backend-dev | 5 GREEN (local) | `pnpm db:generate` → `0002_core.sql` + `meta/0002_snapshot.json`; re-run `migrations-core.test.ts` → **5/5 passed** (real pgvector scratch DB); `drizzle-kit generate` re-run → "No schema changes, nothing to migrate" (schema ↔ SQL ↔ snapshot consistent) |
| 2026-10-03 | backend-dev | 7 GATE | `pnpm gate:quick` fails ONLY at `db:check` with `db:check: failed: Connection terminated unexpectedly`. Same signature on a bare `pg.Client.connect()` — reproduced ×3+ after 60 s and 90 s waits. Cause: dev machine's public IP changed to `182.6.74.166`; Render `temuunair-dev` allowlist is `103.164.231.241/32` only (Render dashboard: instance `available`, `not_suspended`). No local Docker Postgres fallback available. All other gate steps (lint, typecheck, i18n, unit incl. this new test when DB up, contracts, ml) pass. |
| 2026-10-03 | backend-dev | BLOCKER | **BLK-001** filed (`docs/08-project/blockers/BLK-001.md`, class `ENV_FAILURE`/`LOOP_STUCK`, `blocking: all`); status → **BLOCKED**. Correct code + red/green tests preserved on the branch for re-gate on restore. |

## Evidence

- Red: `tests/db/migrations-core.test.ts` 5/5 FAIL against the pre-migration empty DB
   ("expected false to be true" — tables/enums/constraints absent), then 5/5 PASS after `0002_core.sql`.
- Green: `drizzle-kit generate` reports no further schema drift (`schema.ts` ↔ `0002_core.sql` ↔
  `meta/0002_snapshot.json` ↔ journal all consistent), and the `drizzle-kit push --force` CLI
  reports "No changes detected" against the migrated DB. `tests/db/migrations-core.test.ts`
  introspects the real local pgvector DB 5/5. The migration work is done and correct.
- Blocked-by: **BLK-002** — `pnpm gate` still fails at the `migrations check` step, but the fault
  is `packages/db/src/check.ts`'s drift harness (`drizzle-kit pushSchema` silently `process.exit`s
  the first time `schema.ts` is populated — it was the empty `export {}` stub through M0/M2, so
  this path was never exercised), NOT this task's schema/migration. Resolution owned by
  `TMU-OPS-035`.

## Blockers

- **BLK-001** — dev `DATABASE_URL` connection refused (Render IP allowlist mismatch). **RESOLVED**
  2026-10-03: Docker Desktop installed (E:), local pgvector running via `infra/docker-compose.yml`,
  `DATABASE_URL` repointed to `localhost:5432`.
- **BLK-002** — `db:check` gate step aborts inside `pushSchema` for a populated schema.
  `blocking: all`; fixed by `TMU-OPS-035` (ops lane). Until it lands, no task's `pnpm gate`
  can pass. TMU-DB-001's own artefacts need no change from that fix.
