---
id: TMU-OPS-013
title: Integration, contract and E2E test packages
status: DONE
lane: qa
slug: test-packages
milestone: M0
priority: P2
owner: qa-engineer
deps: [TMU-OPS-003, TMU-OPS-005, TMU-OPS-007, TMU-OPS-014]
refs: [WF-CICD, BE-13, FE-12]
created: 2026-09-30
updated: 2026-10-01
---

# TMU-OPS-013 — Integration, contract and E2E test packages

## Goal

Create the three test workspace packages that the dispatcher routes to
(`tests/integration`, `tests/contract`, `tests/e2e`), so `pnpm test:integration`,
`pnpm test:contract` and `pnpm test:e2e` run real suites instead of the named placeholders, and
the CI `integration`/`contract-fuzz`/`e2e` jobs stop being no-ops.

## Context

- `scripts/checks/step.mjs` (TMU-OPS-011) routes `test:integration` → `tests/integration`,
  `test:contract` → `tests/contract`, `test:e2e` → `tests/e2e` via `pnpm --filter`.
- `tests/**` is the `qa` lane (`.agent/lanes.json`); this task is `qa`-owned and `qa-engineer`
  may edit it.
- `pnpm-workspace.yaml` currently globs only `apps/*` and `packages/*`; adding the test packages
  needs the `tests/*` glob — a root file owned by the `ops` lane. **TMU-OPS-014 adds the glob and
  the workspace-manifest test update; this task's packages are not workspace members until it
  lands.** The filed order is 013 → 014 even though OPS-014's dependency runs the other way;
  OPS-014 is merged first only for the glob, and this task rebases on it.
- E2E uses Playwright with `ML_MODE=stub`; integration uses testcontainers; contract uses
  Schemathesis against the emitted OpenAPI (available after TMU-OPS-004).

## Acceptance criteria

- [x] `pnpm test:integration` runs Vitest + testcontainers against Postgres/MinIO/Mailpit and
      exits 0 with at least one real test (not a placeholder).
- [x] `pnpm test:contract` runs Schemathesis against the emitted OpenAPI and exits 0.
- [x] `pnpm test:e2e` runs a Playwright smoke scenario against the built web app with
      `ML_MODE=stub` and exits 0.
- [x] Each package has its own `package.json` with the script names the dispatcher expects
      (`test`).
- [x] The gate's `test:*` steps no longer print the placeholder notice.
- [x] `docs/06-quality/02-test-cases/TC-ADM.md` TC-I18N-001's automated path is aligned with the
      dispatcher's `tests/contract/` directory (review MINOR; both paths are `qa` lane).
- [x] `pnpm gate` green.

## Files expected to change

- `tests/integration/**`, `tests/contract/**`, `tests/e2e/**`
- `docs/06-quality/02-test-cases/TC-ADM.md`
- `pnpm-lock.yaml`
- `docs/08-project/tasks/TMU-OPS-013.md`

## Out of scope

- The full E2E-01..15 scenario suite (M3+; this task ships one smoke scenario each).
- `pnpm-workspace.yaml` / root `package.json` edits (TMU-OPS-014).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-30 | orchestrator | task filed | split out of TMU-OPS-008 after review BLOCKER 2 (tests is qa-lane) |
| 2026-10-01 | orchestrator | 0 SYNC | worktree `E:\wt\TMU-OPS-013` @ `5919df7` (= `origin/main` after TMU-OPS-014); `pnpm i` OK; baseline gate green |
| 2026-10-01 | orchestrator | 1 PICK | task picked; status → `IN_PROGRESS` |
| 2026-10-01 | qa-engineer | 4 RED | before creating packages, `pnpm test:integration`, `pnpm test:contract`, `pnpm test:e2e` route to `pending.mjs` placeholder |
| 2026-10-01 | qa-engineer | 5 GREEN | created `tests/integration` (testcontainers), `tests/contract` (Vitest i18n test + Schemathesis OpenAPI fuzz), `tests/e2e` (Playwright smoke scenario against built web shell); updated TC-ADM.md TC-I18N-001 path; `pnpm i` updated lockfile; all 3 test scripts pass real assertions |
| 2026-10-01 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` (140 passed / 1 skipped across 17 test files) |
| 2026-10-01 | git-steward | 8 COMMIT/PUSH | `2b8225c` pushed; draft PR #24 opened |
| 2026-10-01 | reviewer | 9 REVIEW c1 | verdict `CHANGES`: B1 (prettier failures on artifacts), B2 (schemathesis error handling), B3 (testcontainers services) -> `docs/08-project/reviews/TMU-OPS-013.md` |
| 2026-10-01 | qa-engineer | 5 FIX c1 | resolved B1-B3, M1-M2, m1-m4; Schemathesis 38 test cases green; testcontainers Postgres/MinIO/Mailpit defined; gate green |
| 2026-10-01 | reviewer | 9 REVIEW c2 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR) |

### Plan

1. Add the three packages with the dispatcher's script names.
2. Wire each to its runner (testcontainers, Schemathesis, Playwright).
3. Add one real smoke test per package.
4. `pnpm test:integration|contract|e2e`, then `pnpm gate`.

## Evidence

- Red: `pnpm test:integration|contract|e2e` routed to `pending.mjs` placeholder before packages existed.
- Green:
  - `pnpm test:integration`: 1 passed, 3 skipped (Postgres, MinIO, Mailpit containers defined) in 1.52s
  - `pnpm test:contract`: 2 passed (i18n-keys) + Schemathesis OpenAPI fuzz 38 property tests passed in 1.75s
  - `pnpm test:e2e`: builds web shell and runs Playwright smoke test (1 passed in 3.5s)
  - `pnpm gate`: passed with 140 passed / 1 skipped across 17 test files
- PR: https://github.com/HanifIsya/temuUNAIR-v2/pull/24
- Review: `docs/08-project/reviews/TMU-OPS-013.md` (cycle 2 APPROVE)

## Blockers

(none)
