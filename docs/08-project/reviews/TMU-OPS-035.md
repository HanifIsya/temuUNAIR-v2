---
id: REV-TMU-OPS-035
task: TMU-OPS-035
title: "Fix db:check so a populated schema diff is non-interactive and self-reporting (BLK-002)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-OPS-035 — Review cycle 1

Diff reviewed: `main...HEAD` on branch `agent/ops/TMU-OPS-035-db-check-noninteractive`.
Files reviewed: `package.json`, `pnpm-lock.yaml`, `patches/drizzle-kit@0.31.11.patch`,
`.agent/lanes.json`, `docs/08-project/blockers/BLK-002.md`, `tasks/TMU-OPS-035.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
`BLK-002` is resolved at the root cause via official `pnpm patch` of `drizzle-kit@0.31.11`.
The investigation identified that inside `drizzle-kit/api.js` line 75275, `pushSchema` created
an internal `db.query = async (query, params) => drizzleInstance.execute(sql.raw(query))` shim
that accepted `(query, params)` but dropped `params` when calling `sql.raw(query)`.
When introspecting tables with composite primary keys (`accounts`, `verification_tokens`),
`fromDatabase` executed an unparameterized query with `$1::regnamespace` and `$2`, which Postgres
failed with `error: there is no parameter $1` (code 42P02), causing `renderWithTask5`'s catch
to invoke `process.exit(1)`.

The patch interpolates `$1..$n` parameters into the query string when present, allowing
composite primary key introspection to complete cleanly without errors or prompts.
`pnpm db:check` passes with `db:check: ok`; `tests/db/check-live.test.ts` passes 3/3;
full `pnpm gate:quick` exits 0. `packages/db` source code remains completely unmodified.

## Acceptance Criteria Verification

- [x] Root cause diagnosed: `drizzle-kit/api.js` line 75275 dropped `params` on composite PK introspection queries (`SELECT conname ... WHERE connamespace = $1::regnamespace AND pg_class.relname = $2`).
- [x] Fixed via `pnpm patch drizzle-kit@0.31.11` (`patches/drizzle-kit@0.31.11.patch`) committing into `package.json` and `pnpm-lock.yaml`.
- [x] `.agent/lanes.json` updated with `"patches/**"` under `ops` lane.
- [x] `pnpm db:check` → `db:check: ok` against local pgvector.
- [x] `tests/db/check-live.test.ts` 3/3 passed; full `pnpm gate:quick` green.
- [x] `BLK-002` marked resolved.

## Verdict

**APPROVE.** Clean patch committed to repository package configuration; resolves BLK-002 and unblocks TMU-DB-001 and all downstream M3 database tasks.
