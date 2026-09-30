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
updated: 2026-09-30
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
- The root gate scripts already route here: `scripts/checks/step.mjs` (TMU-OPS-011) runs
  `pnpm --filter @temuunair/db run <check|generate|migrate|seed>` once the package exists.
  **No root file needs to change in this task.**
- `pnpm db:check` must run without Docker when `DATABASE_URL` is set (CI provides a pgvector
  service; locally use `docker compose up -d postgres` and export the URL from `.env.example`).

## Acceptance criteria

- [ ] `pnpm db:check` exits 0 against an empty pgvector Postgres and exits non-zero when a
      migration is syntactically broken (red evidence).
- [ ] `pnpm db:generate` and `pnpm db:migrate` are implemented in the package and documented in
      `docs/07-ops/01-local-dev-setup.md` (one paragraph, no new doc).
- [ ] The initial migration creates only what M0 needs; domain tables arrive in TMU-DB-001..005.
- [ ] No table, column or index is created that BE-05 does not specify.
- [ ] `pnpm gate` green (the `db:check` step is skipped with a named notice when no
      `DATABASE_URL` is present, so the gate stays runnable on a bare clone).

## Files expected to change

- `packages/db/**` (package.json, drizzle.config.ts, src/, migrations/)
- `tests/db/**`
- `docs/07-ops/01-local-dev-setup.md` (one paragraph; docs lane owns the file, so request the edit
  via the task file or add it in the same PR as a `docs`-tagged hunk — see Notes)

## Out of scope

- Domain schema for reports, claims, matches (M3, `TMU-DB-001..005`).
- Seed data beyond a no-op `seed` script (`docs/06-quality/05-seed-and-fixture-data.md`, M3).
- Root `package.json`/`scripts/**` edits.

## Notes on the setup-doc line

`docs/07-ops/01-local-dev-setup.md` is the `docs` lane, not `db`. The acceptance criterion above
is satisfied by opening a tiny `TMU-DOC-*` follow-up in the same PR series **or** by moving the
paragraph into the `db` package README; pick one in step 2 and record it in the Progress log.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | root-script dependency removed; no-DB gate behaviour made explicit; cross-lane doc line flagged |

### Plan

1. Scaffold `packages/db` with drizzle-kit and the migration runner.
2. Add the baseline migration and the package `check` script (apply on empty DB, then diff).
3. Capture red evidence from a deliberately broken migration; revert it.
4. `pnpm db:check` (with Postgres up), then `pnpm gate`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)