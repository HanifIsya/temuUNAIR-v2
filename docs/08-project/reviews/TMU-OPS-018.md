---
id: REV-TMU-OPS-018
task: TMU-OPS-018
reviewer: reviewer
verdict: APPROVE
date: 2026-10-02
cycle: 1
---

# Review — TMU-OPS-018

Branch `agent/ops/TMU-OPS-018-shared-configs-apps-web` @ `272c8bf` (1 commit on `origin/main` @ `8bdd600`), diff reviewed directly against `origin/main`.

## Summary

This task resolves local build and tooling friction introduced with `apps/web`:
1. `next-env.d.ts` generated during Next.js builds is safely ignored by Git, Prettier, and ESLint without polluting git status or failing format/lint gates.
2. Root Vitest configuration sets `esbuild: { jsx: "automatic" }` so that `.tsx` files render correctly in Vitest without requiring per-file `@jsxRuntime automatic` pragmas.
3. Test files under `apps/web/src` are now typechecked as part of `pnpm gate` via a dedicated root `tsconfig.test.json` wired into `package.json#scripts.typecheck` alongside `@types/jest-axe`.

The changes are clean, strictly within the `ops` lane and `_common` scope, leave existing test suites intact and fully passing, and satisfy all acceptance criteria.

## Findings

### BLOCKER
- none.

### MAJOR
- none.

### MINOR
- **F1 — `apps/worker` test files remain excluded from typechecking (out of scope for this task, noted for future coverage).** `apps/worker/tsconfig.json:9` excludes `src/**/*.test.ts`, and `tsconfig.test.json` only targets `apps/web/src/**/*.test.{ts,tsx}`. Like `apps/web` tests prior to this task, worker tests are not covered by `pnpm typecheck`. Because TMU-OPS-018 is specifically scoped to `apps/web` awareness, this does not block this task, but `tsconfig.test.json` could be expanded to include worker tests in a subsequent ops task.

## Acceptance Criteria Verification

| # | Acceptance Criteria | Result | Evidence |
|---|---|---|---|
| 1 | `next-env.d.ts` is ignored in `.gitignore` and `.prettierignore`, and `**/next-env.d.ts` is added to the `ignores` list in `packages/config/eslint.config.mjs` | **PASS** | `.gitignore:7`, `.prettierignore:12`, `packages/config/eslint.config.mjs:12` |
| 2 | After `pnpm --filter @temuunair/web build` on a fresh worktree, `pnpm gate` is green without deleting or reformatting anything | **PASS** | `next build` executed during full build producing `apps/web/next-env.d.ts`; `pnpm gate` succeeded cleanly with all steps passing and `git status` clean |
| 3 | Root `vitest.config.ts` sets `esbuild: { jsx: "automatic" }` so a `.tsx` file without a pragma renders correctly in a component test; `pnpm gate` stays green with the existing pragma-bearing files untouched | **PASS** | `vitest.config.ts:5-7` adds `esbuild: { jsx: "automatic" }`; `apps/web/src/app/*.test.tsx` untouched; all 139 unit tests pass |
| 4 | Test files under `apps/web/src` are typechecked by `pnpm gate` | **PASS** | `tsconfig.test.json` added with path aliases, DOM libs, JSX support, including `apps/web/src/**/*.test.{ts,tsx}`; wired to `package.json` `typecheck` script; `@types/jest-axe` added to root `devDependencies` |
| 5 | `pnpm gate` green | **PASS** | `pnpm gate` (quick) exits 0 with 16 test files / 139 tests passed, 0 lint/format/typecheck errors |

## DoD Checklist

| # | Item | Result | Notes |
|---|---|---|---|
| 1 | Red tests first, failed for right reason | **PASS** | Task records red reproduction: untracked CRLF `next-env.d.ts` breaking prettier and eslint |
| 2 | Tests pass; `pnpm gate` green | **PASS** | 139 tests pass; `OK gate(quick) passed` |
| 3 | Contract tests pass for every touched `API-*` | **N/A** | No API endpoints touched |
| 4 | Auth/RBAC asserted; state transitions covered | **N/A** | Config/tooling task only |
| 5 | Privacy: no secrets, PII, or leaked private fields | **PASS** | No sensitive data touched; `.gitignore` rules intact |
| 6 | i18n keys added for both `id` and `en` | **PASS** | `i18n:check` passed (70 keys per locale) |
| 7 | A11y: component states + zero axe violations | **N/A** | No UI components added or changed |
| 8 | Docs updated: task status, progress log, evidence | **PASS** | `docs/08-project/tasks/TMU-OPS-018.md` updated to `REVIEW` with all AC checked and progress logged |
| 9 | Generated files in sync, no hand edits | **PASS** | No contracts or generated files modified; `contracts:check` green |
| 10 | Reviewer verdict in `docs/08-project/reviews/<ID>.md` | **PASS** | This file |
| 11 | Security review done for sensitive tasks | **N/A** | Tooling configuration task |
| 12 | PR ready, CI green | **PENDING** | PR pending merge cycle |
| — | Lane compliance (`.agent/lanes.json`) | **PASS** | All changed files in `ops` lane or `_common`; `scripts/check-lane.sh` passed |

## Checks Run

- `git diff origin/main...HEAD --stat` verified in `E:\wt\TMU-OPS-018`:
  - `.gitignore | 1 +`
  - `.prettierignore | 1 +`
  - `docs/08-project/tasks/TMU-OPS-018.md | 26 ++++++++++++++++----------`
  - `package.json | 3 ++-`
  - `packages/config/eslint.config.mjs | 1 +`
  - `pnpm-lock.yaml | Bin 191276 -> 199211 bytes`
  - `tsconfig.test.json | 13 +++++++++++++`
  - `vitest.config.ts | 3 +++`
  - Total 8 files: all within `ops` lane or `_common`.
- `pnpm gate` in `E:\wt\TMU-OPS-018` with `apps/web/next-env.d.ts` present on disk:
  - Lane check: OK
  - Format: OK
  - Lint: OK
  - Typecheck: OK (`tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.test.json`)
  - i18n keys: OK (70 keys per locale)
  - Unit tests: OK (16 files, 139 passed)
  - Contracts in sync: OK (version 1.0.0)
  - OpenAPI lint: OK
  - Migrations check: OK
  - ML lint + tests: OK (7 passed)
  - Overall: `OK gate(quick) passed`
- `pnpm test:unit` in `E:\wt\TMU-OPS-018`: 16 test files / 139 passed.

## Notes for the human

The implementation cleanly addresses all requirements and fixes the blindspot identified in REV-TMU-OPS-003 finding F5. No blockers or major issues were found.

## Verdict

**APPROVE**
