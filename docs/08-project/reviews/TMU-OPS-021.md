---
id: REV-TMU-OPS-021
task: TMU-OPS-021
reviewer: reviewer
verdict: APPROVE
date: 2026-10-02
cycle: 1
---

# TMU-OPS-021 — Review cycle 1

Diff reviewed: `origin/main...HEAD` in worktree `E:\wt\TMU-OPS-021` (commit `0253b70` — `fix(db): document CREATEDB and resolve migrationsDir relative to package`).
Branch: `agent/db/TMU-OPS-021-tmu-ops-005-review-minors`.
Changed files: 3 files (+50/−24):
- `packages/db/src/check.ts`
- `packages/db/README.md`
- `docs/08-project/tasks/TMU-OPS-021.md`

Working tree is clean at review time.

**Verdict: `APPROVE`** — 0 BLOCKER, 0 MAJOR, 3 MINOR (non-blocking). All four acceptance criteria are verified, lane boundaries are respected, and `pnpm gate` passes cleanly.

## Summary

The task resolves the MINOR findings carried over from the `TMU-OPS-005` cycle-1 review (`docs/08-project/reviews/TMU-OPS-005.md`) and cycle-3 confirmation review:
1. `m7` (`CREATEDB` requirement) is clearly documented in `packages/db/README.md:3`.
2. `m9` (`runCheck` default `migrationsDir`) is made package-relative in `packages/db/src/check.ts:125` via `resolve(fileURLToPath(import.meta.url), "../../migrations")`.
3. All other findings (`m1`–`m6`, `m8`, `m10`, `n11`) have clear dispositions and rationales recorded in `TMU-OPS-021.md`, and rows belonging to other lanes (`ops`, `qa`, `contracts`, `docs`) were transferred or deferred rather than edited from the `db` lane.
4. `TMU-CTR-006` exists and is referenced in `TMU-OPS-021.md`.
5. Gate is green with 139 passing unit tests and live `db:check: ok`.

## Acceptance criteria

| # | AC | Verdict | Evidence |
|---|---|---|---|
| 1 | Every row above is either done or explicitly declined with a reason recorded in this file | **Verified** | `TMU-OPS-021.md:38-50` table lists all 11 findings (`m1`–`m10`, `n11`) with unambiguous dispositions and rationale. |
| 2 | `TMU-CTR-006` exists and is referenced here (done at filing time) | **Verified** | `docs/08-project/tasks/TMU-CTR-006.md` exists, is well-formed (`owner: architect`, `milestone: M2`, `lane: contracts`), and is referenced at `TMU-OPS-021.md:40,55`. |
| 3 | Rows assigned to `ops`/`qa` are transferred to a task in that lane rather than worked from the `db` lane (lane rules, `.agent/lanes.json`) | **Verified** | No files under `scripts/**`, `.github/**`, `tests/**`, or root configs were touched. All modifications are in `packages/db/**` (`db` lane) or `docs/08-project/tasks/**` (`_common`). |
| 4 | `pnpm gate` green | **Verified by reviewer** | Executed `pnpm gate` in `E:\wt\TMU-OPS-021`: 16 test files passed, 139 tests passed, `db:check: ok`, ML lint+tests passed, exit code 0. |

## Detailed Checklist

### 0. Scope and lane
- **Scope:** Diff is strictly limited to the task scope (documenting `CREATEDB`, fixing default `migrationsDir`, updating task finding dispositions).
- **Lane compliance:** All touched files match `db` or `_common` in `.agent/lanes.json`.
- **Commit format:** Commit `0253b70` follows Conventional Commits (`fix(db): document CREATEDB and resolve migrationsDir relative to package`) with required `Task: TMU-OPS-021`, `Refs: BE-05`, and `Agent: backend-dev` trailers.

### 1. Contract fidelity
- **BE-05:** `0001_init.sql` and schema remain intact.
- **Contract tests:** No HTTP endpoints (`API-*`) were introduced or touched.

### 2. Correctness
- In `packages/db/src/check.ts:124-126`, `migrationsDir` defaults to `resolve(fileURLToPath(import.meta.url), "../../migrations")`. From `packages/db/src/check.ts`, going up two directories resolves to `packages/db/`, appending `migrations` correctly resolves to `<workspace-root>/packages/db/migrations` regardless of the process working directory.
- This was exercised and verified during `pnpm gate` via `scripts/checks/step.mjs db:check` and `tests/db/check-live.test.ts`.

### 3. Security and privacy
- No credentials, secrets, or connection strings logged.
- Secret scan matches 0 occurrences of private credentials.

### 4. Tests
- No tests were weakened, skipped, or deleted.
- All 139 tests across 16 test files pass in `pnpm gate`.

## BLOCKER

*(none)*

## MAJOR

*(none)*

## MINOR

- [ ] **m1** — `packages/db/src/check.ts:125` — No explicit unit test was added in `tests/db/` to assert that calling `runCheck` without `migrationsDir` programmatically from an arbitrary cwd defaults to `<workspace-root>/packages/db/migrations`. While `pnpm gate` exercises this via `step.mjs db:check`, an isolated test in `tests/db/package.test.ts` or `tests/db/check-skip.test.ts` would provide explicit regression protection for programmatic callers.
- [ ] **m2** — `docs/08-project/tasks/TMU-OPS-021.md:46` — The finding disposition for `m7` addresses `packages/db/README.md`, but omits mentioning that documenting the `CREATEDB` requirement in `BE-11` (contracts lane) and `.env.example` (ops lane) is deferred to future contract/ops tasks.
- [ ] **m3** — `packages/db/README.md:4` — An extra trailing blank line was added at line 4 of `README.md`. While Prettier passes due to `.prettierignore`, files should consistently end with a single newline.

## Checks run

- In worktree `E:\wt\TMU-OPS-021`:
  - `git status`: working tree clean, on branch `agent/db/TMU-OPS-021-tmu-ops-005-review-minors`.
  - `git log origin/main...HEAD --oneline`: 1 commit (`0253b70`).
  - `git diff origin/main...HEAD`: verified full diff across all 3 files.
  - `pnpm gate`: passed cleanly (`OK gate(quick) passed`).
    - Lane check: passed.
    - Format (prettier): passed.
    - Lint: passed.
    - Typecheck: passed.
    - i18n keys: passed (70 keys per locale).
    - Unit tests: 139 passed (16 test files), including `tests/db/check-live.test.ts` (3 tests passed against live DB).
    - Contracts check: OK (version 1.0.0).
    - OpenAPI lint: OK.
    - Migrations check: `db:check: ok`.
    - ML lint+tests: 7 passed.

## Notes for the human

- The branch is in a ready state.
- Acceptance criteria are fully met without violating any lane boundary.
- Once merged, the orchestrator/docs-keeper can update the status dashboard and mark `TMU-OPS-021` as `DONE`.
