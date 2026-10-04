---
id: TMU-DB-001
title: Core tables migration — users, Auth.js adapter, locations, drop_points
status: TODO
lane: db
slug: db-core-tables
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-CTR-007]
refs: [BE-05, ARCH-ERD, DEC-002]
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
