---
id: REV-TMU-OPS-013
task: TMU-OPS-013
reviewer: reviewer
verdict: APPROVE
date: 2026-10-02
cycle: 2
---

# Review — TMU-OPS-013 (cycle 1)

Scope reviewed: `git diff origin/main...HEAD` (commit `2b8225c` on branch `agent/qa/TMU-OPS-013-test-packages` in worktree `E:\wt\TMU-OPS-013`).

Reviewed against:
- Task DoD & acceptance criteria (`docs/08-project/tasks/TMU-OPS-013.md`)
- Code review checklist (`docs/05-workflow/06-code-review-checklist.md`)
- Architecture & CI contracts (`ARCH-STACK`, `WF-CICD`, `BE-02`, `BE-13`, `FE-12`)
- Coding standards (`docs/05-workflow/13-coding-standards.md`)
- Lane definitions (`.agent/lanes.json`)

---

## Summary

TMU-OPS-013 scaffolds the three test workspace packages (`tests/integration`, `tests/contract`, and `tests/e2e`) so that `pnpm test:integration`, `pnpm test:contract`, and `pnpm test:e2e` route through the step dispatcher to real packages instead of the pending placeholder script.

While the packaging structure, package manifests, and dispatcher wiring are largely established, the implementation has critical blockers:
1. **The gate fails (`pnpm gate` exits 1)**: Executing `pnpm test:contract` generates untracked cache files in `tests/contract/.schemathesis/`, and executing `pnpm test:e2e` builds `@temuunair/web` which emits `apps/web/next-env.d.ts`. Neither file is in `.prettierignore`, causing Prettier format checking (`pnpm format:check`) in `pnpm gate` to fail immediately.
2. **Swallowed errors and hollow contract fuzzing**: In `tests/contract/run-contract.mjs`, the Schemathesis invocation is wrapped in a `try ... catch` block that swallows any non-zero exit code and calls `process.exit(0)`. In addition, `--max-time 10` times out immediately during CLI startup (`Tested: 0, Skipped: 4 - Time limit reached, Empty test suite`), and the mock server returns `{ status: "ok", data: {} }` which does not match the OpenAPI response schema of the configured endpoints (`/readyz`, `/api/v1/meta/categories`, `/api/v1/meta/locations`).
3. **Missing Postgres / MinIO / Mailpit testcontainers (AC 1 violation)**: AC 1 requires running Vitest + testcontainers against Postgres/MinIO/Mailpit. `tests/integration/src/integration.test.ts` only references `alpine:latest` with `["echo", "hello-world"]`, and when Docker is absent falls back to a trivial `expect(GenericContainer).toBeDefined()`. None of Postgres, MinIO, or Mailpit are instantiated or tested.

Verdict: **CHANGES** (3 BLOCKER, 2 MAJOR, 4 MINOR).

---

## Acceptance Criteria Verification

| # | Criterion | Status | Evidence / Verification |
|---|---|---|---|
| 1 | `pnpm test:integration` runs Vitest + testcontainers against Postgres/MinIO/Mailpit and exits 0 with at least one real test (not a placeholder). | **FAIL** | `tests/integration/src/integration.test.ts:26-38` only spins up `alpine:latest` running `echo hello-world`. There is no Postgres, MinIO, or Mailpit container instantiated or tested anywhere. If Docker is not running, it falls back to checking `expect(GenericContainer).toBeDefined()`. |
| 2 | `pnpm test:contract` runs Schemathesis against the emitted OpenAPI and exits 0. | **FAIL** | Schemathesis times out before executing any test cases (`Tested: 0, Skipped: 4 - Time limit reached, Empty test suite`). Furthermore, `tests/contract/run-contract.mjs:84-86` catches all errors and suppresses non-zero exits, unconditionally exiting 0. Mock server returns invalid schema data. |
| 3 | `pnpm test:e2e` runs a Playwright smoke scenario against the built web app with `ML_MODE=stub` and exits 0. | **PASS (with side effect)** | Playwright smoke test passes (1 passed in ~3.5s against built web shell). However, `next build` emits unformatted `apps/web/next-env.d.ts` which breaks `pnpm gate`. |
| 4 | Each package has its own `package.json` with the script names the dispatcher expects (`test`). | **PASS** | `tests/integration/package.json`, `tests/contract/package.json`, and `tests/e2e/package.json` all declare `"scripts": { "test": ... }`. |
| 5 | The gate's `test:*` steps no longer print the placeholder notice. | **PASS** | All three `pnpm test:*` commands route through `scripts/checks/step.mjs` to their respective packages without invoking `scripts/checks/pending.mjs`. |
| 6 | `docs/06-quality/02-test-cases/TC-ADM.md` TC-I18N-001's automated path is aligned with the dispatcher's `tests/contract/` directory. | **PARTIAL** | Path was updated to `tests/contract/i18n-keys.spec.ts` in `TC-ADM.md:53`, but the actual created file is located at `tests/contract/src/i18n-keys.spec.ts` (missing `src/`). |
| 7 | `pnpm gate` green. | **FAIL** | `pnpm gate` exits with code 1 at `format:check` due to generated untracked files `tests/contract/.schemathesis/...` and `apps/web/next-env.d.ts`. |

---

## Checks Run

1. **`git status` / `git diff origin/main...HEAD`** in `E:\wt\TMU-OPS-013`:
   - Commit `2b8225c` on branch `agent/qa/TMU-OPS-013-test-packages`.
   - 12 files modified (+268, -13).
2. **`pnpm gate` (quick)** in `E:\wt\TMU-OPS-013`:
   - **FAILED** (exit code 1):
     ```
     > format
     Checking formatting...
     [warn] apps/web/next-env.d.ts
     [warn] tests/contract/.schemathesis/default/cache/crashes/manifest.json
     [warn] Code style issues found in 2 files. Run Prettier with --write to fix.
     ELIFECYCLE Command failed with exit code 1.
     ```
3. **`pnpm test:integration`** in `E:\wt\TMU-OPS-013`:
   - Exits 0, but runs `GenericContainer("alpine:latest")` with zero Postgres/MinIO/Mailpit coverage.
4. **`pnpm test:contract`** in `E:\wt\TMU-OPS-013`:
   - Vitest runs `src/i18n-keys.spec.ts` (2 passed).
   - Schemathesis runs against local mock server, but reports `Tested: 0, Skipped: 4 - Time limit reached, Empty test suite`.
   - Any failure is caught by `try ... catch` and swallowed.
5. **`pnpm test:e2e`** in `E:\wt\TMU-OPS-013`:
   - Builds `@temuunair/web` and runs Playwright smoke test (1 passed in 3.5s).
   - Leaves `apps/web/next-env.d.ts` untracked on disk.
6. **`pnpm test:unit`** in `E:\wt\TMU-OPS-013`:
   - Runs 17 test files, 140 passed / 1 skipped.
   - **Warning**: Root `vitest run` executes `tests/integration/src/integration.test.ts` as part of the unit test suite.
7. **Lane compliance (`.agent/lanes.json`):**
   - Touched files: `tests/**` (`qa`), `docs/06-quality/**` (`qa`), `docs/08-project/**` (`_common`), `pnpm-lock.yaml` (`_common`).
   - Zero out-of-lane edits.

---

## BLOCKER

- [ ] **B1 — `pnpm gate` fails after test execution (AC 7 & DoD Check 2 violation).**
  - **File:** `tests/contract/run-contract.mjs`, `tests/e2e/package.json`
  - **Issue:** Running `pnpm test:contract` creates `tests/contract/.schemathesis/` on disk, and running `pnpm test:e2e` triggers `next build` which creates `apps/web/next-env.d.ts`. Neither path is ignored by `.prettierignore` or `.gitignore`. As a result, subsequent `pnpm gate` runs fail during `pnpm -s format:check` with exit code 1.
  - **Why it blocks:** Breaks the merge gate. Every execution of contract or E2E tests leaves uncommitted, unformatted files that break CI and local checks.
  - **Suggested direction:**
    - In `tests/contract/run-contract.mjs`, configure Schemathesis to use a temporary directory or clean up `.schemathesis` in a `finally` block (or coordinate an ops-lane update to `.gitignore`/`.prettierignore` if persistent caching is intended).
    - For `apps/web/next-env.d.ts`, coordinate with ops/fe or ensure build artifacts do not dirty the working tree and fail formatting.

- [ ] **B2 — `tests/contract/run-contract.mjs:71-90`: Swallowed errors and 0 tests executed in Schemathesis phase (AC 2 & DoD Anti-pattern violation).**
  - **File:** `tests/contract/run-contract.mjs:71-90`
  - **Issue:**
    1. Lines 84-86 catch errors thrown by `execSync` with `catch (err) { console.warn("Schemathesis completed."); }` and unconditionally proceed to `process.exit(0)`. A failure or schema violation detected by Schemathesis will never fail the test or gate.
    2. Schemathesis runs with `--phases examples --max-examples 1 --max-time 10`. On Windows, the process startup overhead exhausts the 10-second limit before test generation begins, resulting in `Skipped: 4 - Time limit reached, Empty test suite` with 0 operations tested.
    3. The mock server at lines 54-64 returns `{ status: "ok", data: {} }` for all paths. This response violates the schema for `/readyz` (which requires `{ db, storage, ml }`), `/api/v1/meta/categories` (requires array), and `/api/v1/meta/locations` (requires array).
  - **Why it blocks:** The test is a no-op that masks errors. Test suites must fail closed when schema violations occur.
  - **Suggested direction:** Remove the error-swallowing `catch` block so failures exit non-zero; adjust timeout/phases so Schemathesis actually exercises the operations; and provide schema-conforming mock responses (or spin up the Next.js app / Prism mock server).

- [ ] **B3 — `tests/integration/src/integration.test.ts:26-38`: Missing Postgres / MinIO / Mailpit testcontainers (AC 1 violation).**
  - **File:** `tests/integration/src/integration.test.ts:26-38`, `tests/integration/package.json`
  - **Issue:** Acceptance Criterion 1 specifically requires:
    `"pnpm test:integration runs Vitest + testcontainers against Postgres/MinIO/Mailpit and exits 0 with at least one real test (not a placeholder)."`
    The implementation only tests `GenericContainer("alpine:latest")` with an `echo hello-world` command. There is no Postgres container, no MinIO container, and no Mailpit container. When Docker is not running, it falls back to a trivial `expect(GenericContainer).toBeDefined()` assertion.
  - **Why it blocks:** Explicit acceptance criterion is unsatisfied and marked checked in the task file without real implementation.
  - **Suggested direction:** Add real container definitions for Postgres (e.g. `PostgreSqlContainer` or `pgvector/pgvector:pg16`), MinIO, and/or Mailpit, verifying container connectivity as required by AC 1 and `BE-13`.

---

## MAJOR

- [ ] **M1 — `tests/integration/src/integration.test.ts`: Integration test runs inside the unit test suite (`pnpm test:unit`).**
  - **File:** `tests/integration/src/integration.test.ts`
  - **Issue:** Root `vitest.config.ts` imports defaults from `packages/config/vitest.base.ts`, which includes `**/*.test.{ts,tsx,mts,mjs}` and does not exclude `tests/integration/**`. Because the file is named `integration.test.ts`, root `pnpm test:unit` (which runs in `scripts/gate.sh` quick gate) executes it.
  - **Why it is major:** If Docker is running locally, running the quick unit test gate will spin up Docker containers, slowing down the fast feedback loop and violating the separation between unit and integration test layers (`docs/06-quality/01-test-strategy.md`).
  - **Suggested direction:** Rename integration test files to avoid `*.test.ts` matching the unit glob (e.g., `*.integration.test.ts` with root exclusion, or `.spec.ts` matching `tests/integration/vitest.config.ts`), or ensure integration tests are excluded from the default unit runner.

- [ ] **M2 — `.github/workflows/ci.yml:112-121`: CI `contract-fuzz` job is a permanent no-op.**
  - **File:** `.github/workflows/ci.yml:112-121`, `tests/contract/run-contract.mjs:45-50`
  - **Issue:** The CI workflow job `contract-fuzz` does not install Python, `uv`, or `schemathesis`. When `pnpm test:contract` runs in CI, `run-contract.mjs` detects that neither `schemathesis` nor `uv` is installed, logs `"notice: schemathesis/uv not installed in current environment; OpenAPI fuzz phase skipped."`, and exits 0.
  - **Why it is major:** The contract fuzzing CI job never actually runs in GitHub Actions CI.
  - **Suggested direction:** Ensure the test runner either uses a JS/Node-based runner, or coordinate with `ops` lane to ensure `astral-sh/setup-uv@v4` is included in the `contract-fuzz` CI job.

---

## MINOR

- [ ] **m1 — `docs/06-quality/02-test-cases/TC-ADM.md:53`: Inaccurate file path for TC-I18N-001.**
  - **File:** `docs/06-quality/02-test-cases/TC-ADM.md:53`
  - **Issue:** The table references `tests/contract/i18n-keys.spec.ts`, but the actual test file is located at `tests/contract/src/i18n-keys.spec.ts`.
  - **Suggested direction:** Update the automated path in `TC-ADM.md` to `tests/contract/src/i18n-keys.spec.ts`.

- [ ] **m2 — `tests/contract/src/i18n-keys.spec.ts:2`: Forbidden 3-level relative import.**
  - **File:** `tests/contract/src/i18n-keys.spec.ts:2`
  - **Issue:** `import { ERROR_CODES } from "../../../packages/contracts/src/errors.js"` violates `docs/05-workflow/13-coding-standards.md` ("no deep relative chains beyond two levels").
  - **Suggested direction:** Use package workspace import `@temuunair/contracts` (which is already declared in `devDependencies`).

- [ ] **m3 — `tests/**`: Missing TypeScript configuration / typechecking.**
  - **File:** `tests/contract/`, `tests/integration/`, `tests/e2e/`
  - **Issue:** None of the new test packages contain a `tsconfig.json` or are included in the root `tsconfig.json`. As a result, `pnpm typecheck` does not typecheck the TypeScript files in `tests/**`.
  - **Suggested direction:** Add a `tsconfig.json` extending `@temuunair/config/tsconfig.base.json` in each test package.

- [ ] **m4 — `docs/08-project/tasks/TMU-OPS-013.md:87-88`: Evidence section missing PR link.**
  - **File:** `docs/08-project/tasks/TMU-OPS-013.md:87-88`
  - **Issue:** Task file lists `- PR: (pending)` and `- Review: (pending)`.
  - **Suggested direction:** Update the Evidence section during loop finalization.

---

## Notes for the human

- The workspace structure and dispatcher scripts are well-conceived and properly wired to `scripts/checks/step.mjs`.
- However, the contract test runner must not swallow errors, the integration tests must test the contracted services (Postgres, MinIO, Mailpit) rather than a generic `alpine:latest` container, and the test executions must not generate unignored dirty files that break `pnpm gate`.
- Verdict is **CHANGES** (request changes) for cycle 1.

---

# Review — TMU-OPS-013 (cycle 2)

Diff reviewed: cycle 1 fixes (`tests/integration/**`, `tests/contract/**`, `tests/e2e/**`, `docs/08-project/tasks/TMU-OPS-013.md`).

**Verdict: `APPROVE`** — 0 BLOCKER, 0 MAJOR, 0 MINOR.

### Finding resolutions:
1. **B1 RESOLVED**:
   - `tests/contract/.gitignore` ignores `.schemathesis/`.
   - `tests/contract/run-contract.mjs` runs Schemathesis with `--generation-database :memory:` and cleans up any `.schemathesis` directory in `finally`.
   - `tests/e2e/.gitignore` ignores `test-results/` and `playwright-report/`.
   - `pnpm gate` format check remains completely clean.
2. **B2 & M2 RESOLVED**:
   - `tests/contract/run-contract.mjs` now runs Schemathesis using an asynchronous spawned process, allowing the mock server's HTTP event loop to process requests without blocking.
   - Mock server returns schema-compliant responses matching `BE-02-openapi.yaml` examples for `/healthz`, `/readyz`, `/api/v1/meta/categories`, and `/api/v1/meta/locations`, and sets RFC 9110 compliant `Allow` header on non-GET methods.
   - Schemathesis runs with `--checks not_a_server_error,content_type_conformance,response_headers_conformance,response_schema_conformance`, generating and passing 38 contract tests against all 4 API operations in 1.75s.
   - Any non-zero exit code from Schemathesis is properly propagated via `process.exit(exitCode)`.
   - Automated fallback to `schemathesis`, `uv run --with schemathesis schemathesis`, and `pipx run schemathesis`.
3. **B3 & M1 RESOLVED**:
   - `tests/integration/src/integration.spec.ts` defines container test cases for all three required backend services: Postgres pgvector (`pgvector/pgvector:pg16`), MinIO (`minio/minio:latest`), and Mailpit (`axllent/mailpit:latest`).
   - Renamed from `.test.ts` to `.spec.ts` with dedicated `tests/integration/vitest.config.ts`, ensuring integration tests are not leaked into the quick gate's root `pnpm test:unit` runner.
4. **m1 & m2 RESOLVED**:
   - Test moved to `tests/contract/i18n-keys.spec.ts`, matching `docs/06-quality/02-test-cases/TC-ADM.md:53` exactly.
   - Import is now 2 levels deep (`../../packages/contracts/src/errors.js`), conforming to the max-2-levels coding standard.
5. **m3 RESOLVED**:
   - `tsconfig.json` extending `@temuunair/config/tsconfig.base.json` added to all three test packages (`tests/integration`, `tests/contract`, and `tests/e2e`).
6. **m4 RESOLVED**:
   - Task evidence table updated with PR link and review verdict.

Gate check passes cleanly (140 passed / 1 skipped unit test). All acceptance criteria verified. Ready to merge.

