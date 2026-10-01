---
id: TMU-OPS-021
title: Review follow-ups from TMU-OPS-005 cycle 1 (MINOR findings)
status: TODO
lane: db
slug: tmu-ops-005-review-minors
milestone: M0
priority: P3
owner: backend-dev
deps: [TMU-OPS-005]
refs: [BE-05]
created: 2026-10-01
updated: 2026-10-01
---

# TMU-OPS-021 — Review follow-ups from TMU-OPS-005 cycle 1 (MINOR findings)

> ID note: filed as `TMU-OPS-021`, not `TMU-OPS-016`. `TMU-OPS-016` is already claimed by
> `agent/ops/TMU-OPS-016-merge-push-permissions` (open PR #8), `TMU-OPS-017` by the e2e-guard
> worktree, and `TMU-OPS-018..020` by task files in the TMU-OPS-003 worktree.

## Goal

Carry the ten MINOR findings of the `TMU-OPS-005` cycle-1 review
(`docs/08-project/reviews/TMU-OPS-005.md`) so they are filed rather than silently ignored, per
`docs/05-workflow/05-definition-of-ready-done.md` (MINOR may become a follow-up, but must be
filed). Each row names the lane that should eventually pull it — this task is the placeholder
until then.

## Context

The cycle-1 review returned **0 BLOCKER / 3 MAJOR / 10 MINOR**. The three MAJORs (URL-parse
leak, missing timeouts, inaccurate RED evidence) were fixed inside `TMU-OPS-005` itself. These
MINORs were deliberately left out of that PR to keep the diff small.

## Findings

| # | Finding | Lane that should pull it |
|---|---|---|
| m1 | `BE-05:126` still says the "additions" go into `0001_init.sql`, which conflicts with the extensions-only baseline | **filed separately as `TMU-CTR-006`** (contract change, cannot be done from a feature lane) |
| m2 | Root `tsconfig.json` never type-checks `packages/db` or `tests/db` in CI — `packages/db` only type-checks because this task ran `tsc -p packages/db` by hand | ops |
| m3 | `packages/db/README.md` and `migrations/0001_init.sql` shipped without a final newline (fixed in-cycle, listed for completeness) | db |
| m4 | `tests/db/package.test.ts` asserts script *existence* only, not that they resolve to a runnable command | db |
| m5 | `tests/db/check-live.test.ts` asserts only `!== 0` for the broken-migration and drift cases; it does not pin the exit code to `1` | qa |
| m6 | The live `db:check` tests never run in CI — the `unit` job sets no `DATABASE_URL`, so only the `migrations` job exercises the real check | ops |
| m7 | The need for `CREATEDB` on the `DATABASE_URL` role (a throwaway scratch database is created and dropped per run) is undocumented | db |
| m8 | Task-file Evidence still said `PR: (pending)` (fixed in-cycle) | db |
| m9 | `runCheck`'s `migrationsDir` default is cwd-relative on an exported function, which is surprising for a non-CLI caller | db |
| m10 | The extensions-only assertion in `package.test.ts` is a deny-list (`CREATE TYPE/SCHEMA/...` would pass); it should be an allow-list of exactly the two `CREATE EXTENSION` statements | qa |
| n11 | `docs/01-product/10-roadmap.md:28` lists `TMU-OPS-017..022` under M9, so `TMU-OPS-021` sits in a nominal reservation even though `017..020` are already M0 tasks; the roadmap's M0 (`:19`) and M9 rows are stale relative to the real M0 set | docs (or fold into `TMU-OPS-010`) |

## Acceptance criteria

- [ ] Every row above is either done or explicitly declined with a reason recorded in this file.
- [ ] `TMU-CTR-006` exists and is referenced here (done at filing time).
- [ ] Rows assigned to `ops`/`qa` are transferred to a task in that lane rather than worked from
      the `db` lane (lane rules, `.agent/lanes.json`).
- [ ] `pnpm gate` green.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-01 | orchestrator | filed | MINOR `m2`-`m10` of the TMU-OPS-005 cycle-1 review; `m1` filed as a separate contract task, `m3`/`m8` already fixed in-cycle |
| 2026-10-01 | orchestrator | renumbered | Cycle-2 review found `TMU-OPS-016` already claimed by open PR #8 → renumbered to `TMU-OPS-021` (C2-M2) |
| 2026-10-01 | orchestrator | extended | Cycle-3 confirmation review returned **APPROVE** and added one non-blocking MINOR (`n11`, stale roadmap `TMU-OPS-017..022` M9 reservation) — added to the findings table |

## Blockers

(none)
