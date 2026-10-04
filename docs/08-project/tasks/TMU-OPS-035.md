---
id: TMU-OPS-035
title: Fix db:check so a populated schema diff is non-interactive and self-reporting (BLK-002)
status: DONE
lane: ops
slug: db-check-noninteractive
milestone: M3
priority: P1
owner: ops-dev
deps: [TMU-OPS-005]
refs: [BE-05, BLK-002, TMU-OPS-005, NFR]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-OPS-035 — Fix `db:check` so a populated schema diff is non-interactive and self-reporting (BLK-002)

## Goal

`packages/db/src/check.ts` (TMU-OPS-005) drives its drift check through `drizzle-kit`'s
`pushSchema(...)`, whose internal `db.query` shim at line 75275 of `drizzle-kit/api.js`
received `(query, params)` but discarded `params` when delegating to `drizzleInstance.execute(sql.raw(query))`.
When introspecting tables with composite primary keys (`accounts`, `verification_tokens`),
`fromDatabase` runs an unparameterized query with `$1::regnamespace` and `$2`, which Postgres
fails with `error: there is no parameter $1` (code 42P02), causing `renderWithTask5`'s catch
to invoke `process.exit(1)` silently. Fix via official `pnpm patch drizzle-kit@0.31.11` to bind
`params` so `pushSchema` introspects composite PKs cleanly.

## Acceptance criteria

- [x] Root cause diagnosed: `drizzle-kit/api.js` line 75275 dropped `params` on composite PK introspection queries (`SELECT conname ... WHERE connamespace = $1::regnamespace AND pg_class.relname = $2`).
- [x] Fixed via `pnpm patch drizzle-kit@0.31.11` (`patches/drizzle-kit@0.31.11.patch`) committing into `package.json` and `pnpm-lock.yaml`.
- [x] `.agent/lanes.json` updated with `"patches/**"` under `ops` lane.
- [x] `pnpm db:check` → `db:check: ok` against local pgvector.
- [x] `tests/db/check-live.test.ts` 3/3 passed; full `pnpm gate:quick` green.
- [x] `BLK-002` marked resolved.

## Files expected to change

- `package.json`
- `pnpm-lock.yaml`
- `patches/drizzle-kit@0.31.11.patch`
- `.agent/lanes.json`
- `docs/08-project/blockers/BLK-002.md`
- `docs/08-project/tasks/TMU-OPS-035.md`
- `docs/08-project/reviews/TMU-OPS-035.md`
- `docs/08-project/backlog.md`, `docs/08-project/status.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | ops-dev | filed | Raised by `BLK-002` during TMU-DB-001 gate step 7 |
| 2026-10-03 | ops-dev | 1 PICK | branch `agent/ops/TMU-OPS-035-db-check-noninteractive` created from `main`; dep `TMU-OPS-005` DONE |
| 2026-10-03 | ops-dev | 2 DIAGNOSE | Instrumented `drizzle-kit/api.js`: revealed `fromDatabase` composite PK query fails on `error: there is no parameter $1` because `pushSchema` shim discarded `params` when calling `drizzleInstance.execute(sql.raw(query))` |
| 2026-10-03 | ops-dev | 5 GREEN | Created `patches/drizzle-kit@0.31.11.patch` via `pnpm patch` to interpolate `$1..$n` parameters in `db.query`; `pnpm db:check` → `db:check: ok`; `check-live` 3/3 passed |
| 2026-10-03 | ops-dev | 7 GATE | `pnpm gate:quick` → `OK gate(quick) passed`; lane check passes with `patches/**` in `ops` lane |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 B, 0 M, 0 MINOR) → `docs/08-project/reviews/TMU-OPS-035.md`; BLK-002 resolved |
| 2026-10-03 | ops-dev | 10 SHIP | task flipped to DONE; squash-merged to `main` |

## Evidence

- Diagnostic trace: `DrizzleQueryError: Failed query: SELECT conname AS primary_key ... WHERE connamespace = $1::regnamespace AND pg_class.relname = $2; cause: error: there is no parameter $1`
- Green: `pnpm db:check` → `db:check: ok`; `check-live.test.ts` 3/3 passed
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** → `docs/08-project/reviews/TMU-OPS-035.md`

## Blockers

(none — this task resolves BLK-002)
