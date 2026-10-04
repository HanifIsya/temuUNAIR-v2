---
id: TMU-DB-001
title: Core tables migration — users, Auth.js adapter, locations, drop_points
status: DONE
lane: db
slug: db-core-tables
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-CTR-007, TMU-OPS-035]
refs: [BE-05, ARCH-ERD, DEC-002, BLK-001, BLK-002]
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

- [x] Forward-only migration `0002_*.sql` + rollback note; merged migration never edited after.
- [x] Drizzle schema mirrors BE-05 for these tables; `pnpm db:check` green (no drift).
- [x] Enums created as Postgres types per BE-05; email citext unique; least-privilege notes.
- [x] Red tests first (`tests/db/`): migration applies on empty DB; schema-drift detected.
- [x] `pnpm gate` green.

## Files expected to change

- `packages/db/migrations/0002_*.sql`, `packages/db/migrations/meta/*`
- `packages/db/src/schema.ts`
- `tests/db/*`
- `docs/08-project/tasks/TMU-DB-001.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | backend-dev | 1 PICK | branch `agent/db/TMU-DB-001-db-core-tables` created from `main` (`6d8040d`); dep `TMU-CTR-007` DONE; status → IN_PROGRESS |
| 2026-10-03 | backend-dev | 2 RED | `tests/db/migrations-core.test.ts` (5 live introspection tests) run against empty scratch DB → **5/5 fail** for the right reason (`users/accounts/sessions/verification_tokens/locations/drop_points` absent) |
| 2026-10-03 | backend-dev | 3 PLAN | 1) `packages/db/src/schema.ts`: `citext` via `customType` (drizzle-orm 0.45 has no built-in builder); users + BE-05 enums/CHECK/unique email; canonical Auth.js adapter (composite PKs, cascade user FKs) as the BE-05 rule-7 exception; `locations.parent_id` self-FK; `drop_points.hours jsonb`; 2) `pnpm db:generate` → tag rename `0002_dry_post`→`0002_core` in file+journal (snapshot idx-keyed, unchanged); 3) rollback note in SQL header; 4) fix introspection array_agg cast in the test; 5) re-run gate |
| 2026-10-03 | backend-dev | 5 GREEN (local) | `pnpm db:generate` → `0002_core.sql` + `meta/0002_snapshot.json`; re-run `migrations-core.test.ts` → **5/5 passed** (real pgvector scratch DB); `drizzle-kit generate` re-run → "No schema changes, nothing to migrate" (schema ↔ SQL ↔ snapshot consistent) |
| 2026-10-03 | backend-dev | BLOCKER | BLK-001 filed (Render allowlist); unblocked via Docker Desktop on E: + local pgvector. BLK-002 filed (drizzle-kit composite PK parameter drop in pushSchema); resolved via TMU-OPS-035 pnpm patch. |
| 2026-10-03 | backend-dev | 7 GATE | `pnpm gate:quick` → `OK gate(quick) passed`; `db:check: ok`; `migrations-core.test.ts` 5/5 passed; `check-live.test.ts` 3/3 passed |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 B, 0 M, 0 MINOR) → `docs/08-project/reviews/TMU-DB-001.md` |
| 2026-10-03 | backend-dev | 10 SHIP | task flipped to DONE; squash-merged to `main` |

## Evidence

- Red: `tests/db/migrations-core.test.ts` 5/5 FAIL against the pre-migration empty DB
   ("expected false to be true" — tables/enums/constraints absent), then 5/5 PASS after `0002_core.sql`.
- Green: `drizzle-kit generate` reports no further schema drift (`schema.ts` ↔ `0002_core.sql` ↔
  `meta/0002_snapshot.json` ↔ journal all consistent), and `pnpm db:check` → `db:check: ok`.
  `tests/db/migrations-core.test.ts` introspects the real local pgvector DB 5/5.
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** → `docs/08-project/reviews/TMU-DB-001.md`

## Blockers

- **BLK-001** — dev `DATABASE_URL` connection refused. **RESOLVED** via local pgvector.
- **BLK-002** — `db:check` gate step aborts inside `pushSchema`. **RESOLVED** via `TMU-OPS-035`.
