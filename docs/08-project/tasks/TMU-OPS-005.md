---
id: TMU-OPS-005
title: DB package skeleton with Drizzle and a real db check
status: IN_PROGRESS
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

- [x] `pnpm db:check` exits 0 against an empty pgvector Postgres and exits non-zero when a
      migration is syntactically broken (red evidence).
- [x] `pnpm db:generate` and `pnpm db:migrate` are implemented in the package and documented in
      `packages/db/README.md` (one paragraph). The local-dev doc is the `docs` lane, so a pointer
      there is opened as a separate `TMU-DOC-*` follow-up if the human wants it.
- [x] The initial migration creates only what M0 needs; domain tables arrive in TMU-DB-001..005.
- [x] No table, column or index is created that BE-05 does not specify.
- [x] `pnpm gate` green (the `db:check` step is skipped with a named notice when no
      `DATABASE_URL` is present, so the gate stays runnable on a bare clone).

## Files expected to change

- `packages/db/**` (package.json, drizzle.config.ts, src/, migrations/)
- `tests/db/**`

## Out of scope

- Domain schema for reports, claims, matches (M3, `TMU-DB-001..005`).
- Seed data beyond a no-op `seed` script (`docs/06-quality/05-seed-and-fixture-data.md`, M3).
- Root `package.json`/`scripts/**` edits.

## Notes on the setup-doc line

`docs/07-ops/01-local-dev-setup.md` is the `docs` lane, not `db`. The criterion above therefore
documents the scripts in `packages/db/README.md` (in-lane); the local-dev doc pointer is an
optional `TMU-DOC-*` follow-up, not a requirement of this task.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | root-script dependency removed; no-DB gate behaviour made explicit; cross-lane doc line flagged |
| 2026-10-01 | orchestrator | 0 SYNC | fresh worktree `E:\wt\TMU-OPS-005`, branch `agent/db/TMU-OPS-005-db-package-skeleton` at `origin/main` b9d6ba6; `pnpm i` ok |
| 2026-10-01 | orchestrator | 2 READ | BE-05 (DDL + migration rules), ARCH-STACK (Drizzle + PG16/pgvector), WF-STANDARDS, step.mjs routes, CI `migrations` job |
| 2026-10-01 | orchestrator | 3 PLAN | plan below; Docker absent on this host → empty pgvector PG16 on Render used as the empty-DB target (CI uses the pgvector service); probes: programmatic `migrate` + `pushSchema` diff verified |
| 2026-10-01 | orchestrator | env note | `DATABASE_URL` for local evidence: Render `temuunair-dev` (PG 16.15, pgvector 0.8.0, citext 1.6, empty). Never committed |
| 2026-10-01 | qa-engineer | 4 RED | `tests/db/{dispatcher,package,check-skip,check-live}.test.ts`; `pnpm exec vitest run tests/db` → **2 failed files | 1 passed | 1 skipped; 7 failed | 2 passed | 3 skipped**. The 7 failures: 6 in `package.test.ts` (ENOENT on `packages/db/package.json`, `migrations/`, `0001_init.sql`, `migrations/meta/_journal.json`, `README.md`) + 1 in `check-skip.test.ts` (placeholder `check` script printed no named skip notice). The 2 passes are dispatcher regression guards on the pre-existing `scripts/checks/step.mjs`. The 3 skipped are `check-live.test.ts` (`skipIf(!DATABASE_URL)`) — **`runCheck` was never imported in this run**, so no failure can be attributed to that module |
| 2026-10-01 | backend-dev | 5 GREEN | implemented `packages/db/**` (package.json, tsconfig, drizzle.config, src/{schema,migrate,seed,check,check-worker}, migrations/0001_init + meta, README) + `tests/db/**`; `vitest run tests/db` → **12 passed | 3 skipped** with `DATABASE_URL`, **9 passed | 3 skipped** without |
| 2026-10-01 | orchestrator | 5 GREEN verify | `pnpm db:check` → exit 0 / `db:check: ok` (4.8 s); `db:generate` → exit 0 "No schema changes" (meta unchanged); `db:migrate` → exit 0 `migrate: ok`; `seed` → exit 0 no-op; `eslint` 0, `tsc -p packages/db` 0, `prettier --check` clean, `check-lane.sh` 0 |
| 2026-10-01 | orchestrator | 5 GREEN live | `vitest run tests/db --testTimeout 60000` with `DATABASE_URL` → **3/3 runs all 12 passed**. `--testTimeout` is a CLI flag, so **no frozen test file was edited**; the 5000 ms vitest default is sized for CI's localhost pgvector service, while local evidence runs against the remote Render instance (~4.5-5.0 s/run). Broken-migration case covered by `check-live.test.ts` #2 (passes) |
| 2026-10-01 | orchestrator | 7 GATE | `pnpm gate` → **`OK gate(quick) passed`**, exit 0 (`test:unit` 45 passed, 3 skipped). One run hit a transient 5000 ms timeout in the ops-lane `scripts/checks/config-presets.test.mjs` under parallel load; passed 3/3 in isolation and on re-run (3018 ms) — unrelated to this diff |
| 2026-10-01 | git-steward | 8 COMMIT/PUSH | commit `6572380` (18 files: `packages/db` 13, `tests/db` 4, task file, `pnpm-lock.yaml`); draft PR **#12**; no `--no-verify` |
| 2026-10-01 | reviewer | 9 REVIEW (cycle 1) | **REQUEST CHANGES** → `docs/08-project/reviews/TMU-OPS-005.md`. 0 BLOCKER / 3 MAJOR / 10 MINOR. Verified green: BE-05 extensions-only migration, lane, frozen tests untouched, 0 secret hits, gate re-run |
| 2026-10-01 | orchestrator | 10 FIX (M1-M3) | **M1** `check.ts`: `new URL()` moved out of the reject path into an explicit catch that returns 1 with a fixed message (a rejection would dump the URL, credentials included, to stderr). **M2** `connectionTimeoutMillis: 10_000` on all three connections + `withDeadline(60_000)` around the whole check so a stalled endpoint can never wedge the gate/CI. **M3** RED evidence corrected — `runCheck` was never imported in the RED run (`check-live` skipped), so that failure was impossible; 6 ENOENT + 1 skip-notice = 7 |
| 2026-10-01 | orchestrator | 10 FIX (M2 follow-up) | First live run after M2 hung: `withDeadline` did **not** cover the `finally` block, so `await inbox.next()` waiting on the worker stayed unbounded and `runCheck` never returned. Cleanup now runs under `withDeadline(FINISH_MS = 10_000)` before `worker.terminate()`, so `runCheck` always returns within the deadline. Verified no connection exhaustion (7/100 connections, 0 lock waits); purged 5 `tmu_check_*` scratch databases left by the aborted runs |
| 2026-10-01 | orchestrator | 10 FIX verify | M1 regression: malformed `DATABASE_URL` → exit **1** with `db:check: failed: DATABASE_URL is not a valid URL`, credential string absent from output. Live suite **3/3 runs green, 12/12 tests each**, 0 leftover scratch DBs. `pnpm db:check` exit 0 (5.4 s). `eslint` 0, `tsc -p packages/db` 0, `prettier --check` clean, `check-lane.sh` 0, **`pnpm gate` → `OK gate(quick) passed`** |
| 2026-10-01 | orchestrator | 10 FIX (docs) | MINOR `m1` filed as a contract task (BE-05:126 vs extensions-only `0001_init`); MINOR `m2`-`m10` filed as a db follow-up task; backlog index regenerated. Gate initially failed because `owner:` on a task file must be an agent name, not the doc-style `AR` — corrected to `architect` |
| 2026-10-01 | reviewer | 9 REVIEW (cycle 2) | **REQUEST CHANGES** -> `docs/08-project/reviews/TMU-OPS-005.md` cycle-2 section. Cycle-1 MAJORs **all verified fixed** (M1 URL leak, M2 timeouts, M3 RED evidence). 0 BLOCKER / 2 new MAJOR / 8 new MINOR. Both MAJORs came from IDs I invented for the follow-up files: **C2-M1** `TMU-CTR-001` is reserved by `docs/01-product/10-roadmap.md:21` (`TMU-CTR-001..005`, M2 contracts) and named in `CHANGELOG.md:16`, `BE-02-openapi.md:20`, `TMU-OPS-004.md:35`; **C2-M2** `TMU-OPS-016` is already claimed by open PR #8 (`agent/ops/TMU-OPS-016-merge-push-permissions`), with `017`-`020` also taken across worktrees |
| 2026-10-01 | orchestrator | 10 FIX (C2-M1/C2-M2) | Renumbered `TMU-CTR-001` -> **`TMU-CTR-006`** (first ID outside the roadmap's reserved M2 block; milestone set to M2) and `TMU-OPS-016` -> **`TMU-OPS-021`** (016-020 all taken); both files carry an ID-note explaining the choice; stale references updated; backlog regenerated |

### Plan

1. `packages/db/package.json` (`@temuunair/db`): `check`, `generate`, `migrate`, `seed` scripts; deps `drizzle-orm`, `drizzle-kit`, `pg`, `tsx`.
2. `packages/db/src/schema.ts` — M0 baseline only: extensions + schema placeholder, no BE-05 tables (those are TMU-DB-001..005, M3).
3. `packages/db/src/migrate.ts` — programmatic forward-only runner (drizzle `migrate`) over `DATABASE_URL`.
4. `packages/db/migrations/0001_init.sql` — baseline: `CREATE EXTENSION IF NOT EXISTS vector/citext` only (M0 needs), plus rollback note.
5. `packages/db/src/check.ts` — `db:check`: skip with a named notice when `DATABASE_URL` unset; else create a scratch DB, apply migrations, `pushSchema` diff → fail non-zero on drift, drop scratch.
6. `packages/db/src/seed.ts` — no-op guarded seed (prints "nothing to seed at M0").
7. `packages/db/drizzle.config.ts` + `README.md` (one paragraph: generate/migrate/check).
8. `tests/db/**` — Vitest: check-skip behaviour, script wiring, migration/journal shape, schema-drift red case.
9. RED: tests fail first (package absent) → GREEN: implement → `pnpm db:check` (Render DB) exit 0 → broken-migration red evidence.
10. `pnpm gate` green (no-DB path prints the named skip), then commit/push/PR/review.

## Evidence

- Red: `pnpm exec vitest run tests/db` before implementation → **7 failed | 2 passed | 3 skipped**:
  6 ENOENT failures in `package.test.ts` (manifest, migration dir, `0001_init.sql`, journal,
  README) + 1 in `check-skip.test.ts` (no named skip notice). The 2 passes are pre-existing
  dispatcher guards. The 3 `check-live` tests were **skipped** (`skipIf(!DATABASE_URL)`), so the
  `runCheck` import never executed — no RED failure is attributable to that module. Detail in the
  Progress log `4 RED` row.
- Green: `pnpm exec vitest run tests/db` after implementation → **9 passed | 3 skipped** without
  `DATABASE_URL`; with it, `vitest run tests/db --testTimeout 60000` → **3/3 runs, 12 passed**.
  Acceptance: `pnpm db:check` exit 0 / `db:check: ok`; `db:generate` exit 0, no migration drift;
  `db:migrate` exit 0; `seed` exit 0 (no-op); `eslint` 0, `tsc -p packages/db` 0, `prettier --check`
  clean, `check-lane.sh` 0; `pnpm gate` → `OK gate(quick) passed` (exit 0).
- PR: [#12](https://github.com/HanifIsya/temuUNAIR-v2/pull/12) (draft), commit `6572380`.
  CI run `36810827530` — **10/10 checks pass**, incl. `migrations` (`pnpm db:check` against the
  pgvector service) and `unit`. `docker-build` skipped (path-filtered).
- Review cycle 1: **REQUEST CHANGES** — `docs/08-project/reviews/TMU-OPS-005.md`. 0 BLOCKER,
  3 MAJOR (M1 URL-parse could reject and leak credentials to stderr; M2 no connect/deadline
  timeouts; M3 RED evidence named an impossible failure), 10 MINOR. Fixes applied in this cycle.

## Blockers

(none)
