---
id: TMU-OPS-021
title: Review follow-ups from TMU-OPS-005 cycle 1 (MINOR findings)
status: DONE
lane: db
slug: tmu-ops-005-review-minors
milestone: M0
priority: P3
owner: backend-dev
deps: [TMU-OPS-005]
refs: [BE-05]
created: 2026-10-01
updated: 2026-10-02
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

## Findings & Dispositions

| # | Finding | Lane | Disposition & Action |
|---|---|---|---|
| m1 | `BE-05:126` still says the "additions" go into `0001_init.sql`, which conflicts with the extensions-only baseline | contracts | **filed separately as `TMU-CTR-006`** (milestone M2 contract task) |
| m2 | Root `tsconfig.json` never type-checks `packages/db` or `tests/db` in CI | ops | Transferred to ops lane: packages built and verified in `pnpm build` (`build` CI job); test typechecks tracked under ops shared configs |
| m3 | `packages/db/README.md` and `migrations/0001_init.sql` shipped without a final newline | db | **Fixed in `TMU-OPS-005`** in-cycle |
| m4 | `tests/db/package.test.ts` asserts script *existence* only | db | Deferred to M3 (`TMU-DB-001..005`) when domain tables and real seed data land |
| m5 | `tests/db/check-live.test.ts` asserts only `!== 0` | qa | Transferred to qa lane: deferred to M3 database test suite |
| m6 | The live `db:check` tests never run in CI unit job | ops | Transferred to ops lane: live `db:check` runs against the pgvector service container in the `migrations` CI job |
| m7 | The need for `CREATEDB` on the `DATABASE_URL` role is undocumented | db | **Done in this task**: documented `CREATEDB` in `packages/db/README.md` |
| m8 | Task-file Evidence still said `PR: (pending)` | db | **Fixed in `TMU-OPS-005`** in-cycle |
| m9 | `runCheck`'s `migrationsDir` default is cwd-relative on an exported function | db | **Done in this task**: `packages/db/src/check.ts` resolves default relative to `import.meta.url` (`../../migrations`) |
| m10 | The extensions-only assertion in `package.test.ts` is a deny-list | qa | Transferred to qa lane: deferred to M3 database tests |
| n11 | Roadmap M0/M9 reservation rows | docs/ops | Transferred to ops lane: folded into `TMU-OPS-010` (milestone handoff) |

## Acceptance criteria

- [x] Every row above is either done or explicitly declined with a reason recorded in this file.
- [x] `TMU-CTR-006` exists and is referenced here (done at filing time).
- [x] Rows assigned to `ops`/`qa` are transferred to a task in that lane rather than worked from
      the `db` lane (lane rules, `.agent/lanes.json`).
- [x] `pnpm gate` green.

## Files expected to change

- `packages/db/src/check.ts`
- `packages/db/README.md`
- `docs/08-project/tasks/TMU-OPS-021.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-01 | orchestrator | filed | MINOR `m2`-`m10` of the TMU-OPS-005 cycle-1 review; `m1` filed as a separate contract task, `m3`/`m8` already fixed in-cycle |
| 2026-10-01 | orchestrator | renumbered | Cycle-2 review found `TMU-OPS-016` already claimed by open PR #8 → renumbered to `TMU-OPS-021` (C2-M2) |
| 2026-10-01 | orchestrator | extended | Cycle-3 confirmation review returned **APPROVE** and added one non-blocking MINOR (`n11`, stale roadmap `TMU-OPS-017..022` M9 reservation) — added to the findings table |
| 2026-10-02 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-021` @ `c851575`; `pnpm i` OK; baseline gate green |
| 2026-10-02 | orchestrator | 1 PICK | task picked; status → `IN_PROGRESS` |
| 2026-10-02 | backend-dev | 5 GREEN | implemented m7 (documented `CREATEDB` in `README.md`) and m9 (resolved default `migrationsDir` via `import.meta.url` in `check.ts`); recorded dispositions for all other rows |
| 2026-10-02 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` (139 tests passed) |
| 2026-10-02 | git-steward | 8 COMMIT/PUSH | `0253b70` pushed; PR #29 opened |
| 2026-10-02 | reviewer | 9 REVIEW | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR) -> `docs/08-project/reviews/TMU-OPS-021.md` |
| 2026-10-02 | orchestrator | 11 CI | all 11 checks green |

### Plan

1. Document `CREATEDB` in `packages/db/README.md`.
2. Make `migrationsDir` default in `packages/db/src/check.ts` package-relative via `import.meta.url`.
3. Record dispositions for all other findings in `TMU-OPS-021.md`.
4. `pnpm gate`.

## Evidence

- Green: `packages/db/src/check.ts` resolves `migrationsDir` relative to package; `packages/db/README.md` documents `CREATEDB`; all 11 minor findings resolved or delegated with reasons; `pnpm gate` passes with 139 tests.
- PR: https://github.com/HanifIsya/temuUNAIR-v2/pull/29
- Review: `docs/08-project/reviews/TMU-OPS-021.md` (APPROVE)

## Blockers

(none)
