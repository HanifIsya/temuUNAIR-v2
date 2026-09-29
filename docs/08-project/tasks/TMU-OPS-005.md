---
id: TMU-OPS-005
title: DB package skeleton with Drizzle and a real db check
status: TODO
lane: db
slug: db-package-skeleton
milestone: M0
priority: P1
owner: backend-dev
deps: [TMU-OPS-002]
refs: [ARCH-STACK, BE-05, DEC-002]
created: 2026-09-29
updated: 2026-09-29
---

# TMU-OPS-005 — DB package skeleton with Drizzle and a real `db:check`

## Goal

Create `packages/db` with Drizzle ORM + drizzle-kit, a forward-only `migrations/` convention,
and a `check` script that applies migrations to an empty pgvector database so `pnpm db:check`
verifies the schema instead of printing a placeholder.

## Context

- `docs/04-contracts/backend/BE-05-database-contract.md` — DDL, constraints, indexes, migration rules.
- `docs/05-workflow/13-coding-standards.md` — `snake_case`, every table has `id`, `created_at`,
  `updated_at`; forward-only migrations; never edit a merged migration.
- `docs/03-architecture/02-tech-stack-and-versions.md`: Drizzle ORM, PostgreSQL 16 + pgvector.
- `scripts/gate.sh` runs `db:check`; CI job `migrations` runs it against a pgvector service.

## Acceptance criteria

- [ ] `pnpm db:check` exits 0 against an empty pgvector Postgres (docker compose) and exits
      non-zero when a migration is syntactically broken (red evidence).
- [ ] `pnpm db:generate` and `pnpm db:migrate` are defined and documented.
- [ ] The initial migration creates only what M0 needs; domain tables arrive in TMU-DB-001..005.
- [ ] No table, column or index is created that BE-05 does not specify.
- [ ] `pnpm gate` green.

## Files expected to change

- `packages/db/**` (package.json, drizzle.config.ts, src/, migrations/)
- `tests/db/**`

## Out of scope

- Domain schema for reports, claims, matches (M3, `TMU-DB-001..005`).
- Seed data (`docs/06-quality/05-seed-and-fixture-data.md`, M3).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| | | | |

### Plan

1. Scaffold `packages/db` with drizzle-kit and the migration runner.
2. Add the baseline migration and the `check` script (apply on empty DB, then diff).
3. Capture red evidence from a deliberately broken migration; revert it.
4. `pnpm db:check`, then `pnpm gate`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
