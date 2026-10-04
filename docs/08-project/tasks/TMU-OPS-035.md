---
id: TMU-OPS-035
title: Fix db:check so a populated schema diff is non-interactive and self-reporting (BLK-002)
status: TODO
lane: db
slug: db-check-noninteractive
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-OPS-005]
refs: [BE-05, BLK-002, TMU-OPS-005, NFR]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-OPS-035 — Fix `db:check` so a populated schema diff is non-interactive and self-reporting (BLK-002)

## Goal

`packages/db/src/check.ts` (TMU-OPS-005) drives its drift check through `drizzle-kit`'s
`pushSchema(...)`, whose `renderWithTask5` error path calls `process.exit(1)` (api.mjs:3439)
**before** `runCheck`'s try/catch can report anything. This stayed latent while
`packages/db/src/schema.ts` was the empty `export {}` stub; TMU-DB-001 is the first task to
populate it, and now the gate step hard-exits silently. Restore a gate step that (a) never
prompts for input, (b) prints a named `db:check: ok` / `db:check: failed: <reason>` /
`db:check: drift: …` verdict on stdout/stderr like before, and (c) keeps the frozen
`runCheck(options, deps)` interface, the two-thread worker split and the live-test 5 s path.

This is a **db-lane** change (lane follows files: `packages/db/**` + `tests/db/**`; `ops`
owns scripts/infra) and gates every subsequent task.

## Context / acceptance from BLK-002

- Options 1–3 in `docs/08-project/blockers/BLK-002.md`; recommended: use drizzle-kit's
  **non-interactive** primitives (`pgPushIntrospect` + the snapshot differ / `generateMigration`)
  or a plain-`pg.Client` `db.query` shim instead of the `drizzleInstance.execute` one that
  throws, and wrap so no code path can `process.exit(1)` without a printed reason.
- The migration itself is proven correct independently (`tests/db/migrations-core.test.ts`
  introspects the live DB 5/5; `drizzle-kit generate` reports no schema change; the `push`
  CLI reports no drift) — only `check.ts`'s programmatic path fails.

## Acceptance criteria

- [ ] RED test first in `tests/db/`: with a populated `schema.ts` (or a fixture module),
      `runCheck` returns 0 on no-drift and returns 1 with a `db:check: failed:`/`drift:` line
      it actually prints — never a silent exit. Fails against the current `check.ts`.
- [ ] `check.ts` rewritten to the non-interactive path (BLK-002 option); frozen interface,
      worker split and scratch-DB lifecycle preserved; `runCheck` never lets drizzle-kit's
      `process.exit` bypass its own error handling.
- [ ] `pnpm db:check` → `db:check: ok` against local pgvector with TMU-DB-001's schema applied.
- [ ] Existing `check-live` / `check-skip` / dispatcher / package tests still green (none weakened).
- [ ] `pnpm gate:quick` green with the populated schema (unblocks TMU-DB-001 and every lane).

## Files expected to change

- `packages/db/src/check.ts` (and `check-worker.ts` if the shim moves there)
- `tests/db/db-check-populated.test.ts` (new RED→GREEN test)
- `docs/08-project/tasks/TMU-OPS-035.md`
- `docs/08-project/reviews/TMU-OPS-035.md`
- `docs/08-project/blockers/BLK-002.md` (flip to resolved with the fix commit/PR)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | backend-dev | filed | Raised by `BLK-002` during TMU-DB-001 gate step 7 |

## Blockers

(none — this task IS the resolution path for BLK-002)
