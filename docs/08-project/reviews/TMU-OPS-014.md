---
id: REV-TMU-OPS-014
task: TMU-OPS-014
reviewer: reviewer
verdict: APPROVE
date: 2026-10-01
cycle: 1
---

# Review — TMU-OPS-014 (cycle 1)

Scope reviewed: `git diff origin/main...HEAD` (commit `87666fc` on branch `agent/ops/TMU-OPS-014-test-workspace-glob` in worktree `E:\wt\TMU-OPS-014`).

Reviewed against:
- Task DoD & acceptance criteria (`docs/08-project/tasks/TMU-OPS-014.md`)
- Code review checklist (`docs/05-workflow/06-code-review-checklist.md`)
- Architecture & CI contracts (`ARCH-STACK`, `WF-CICD`, `BE-13`, `FE-12`)
- Lane definitions (`.agent/lanes.json`)

---

## Summary

TMU-OPS-014 adds `"tests/*"` to `pnpm-workspace.yaml` and updates `scripts/checks/scaffold.test.mjs` to assert that `apps/*`, `packages/*`, and `tests/*` are the configured workspace globs. This allows upcoming test packages from TMU-OPS-013 (`tests/integration`, `tests/contract`, `tests/e2e`) to be recognized as first-class workspace packages by `pnpm`.

The quick gate (`pnpm gate`) and full gate steps pass cleanly (139 unit tests across 16 test files, contracts sync, OpenAPI lint, live database migration check against pgvector, ML lint/pytest). The step dispatcher (`scripts/checks/step.mjs`) handles `pnpm test:integration`, `pnpm test:contract`, and `pnpm test:e2e` smoothly via the pending step placeholder without triggering any missing filter errors. All touched files are within the `ops` lane or `_common` definitions.

Verdict: **APPROVE** (0 BLOCKER, 0 MAJOR, 3 MINOR).

---

## Acceptance Criteria Verification

| # | Criterion | Status | Evidence / Verification |
|---|---|---|---|
| 1 | `pnpm-workspace.yaml` lists `apps/*`, `packages/*` and `tests/*`. | **PASS** | `pnpm-workspace.yaml:2-5` specifies `apps/*`, `packages/*`, and `tests/*`. |
| 2 | `scripts/checks/scaffold.test.mjs` asserts the new glob list. | **PASS** | `scripts/checks/scaffold.test.mjs:213-217` asserts `globs` deep equals `["apps/*", "packages/*", "tests/*"]`. Verified passing via Vitest. |
| 3 | `pnpm install --frozen-lockfile` links the `tests/*` packages (lockfile updated). | **PASS (with note)** | CI and local runs pass with `--frozen-lockfile`. No test packages exist under `tests/*` yet (TMU-OPS-013 is out of scope and qa-lane); therefore `pnpm-lock.yaml` requires no changes and was not modified in this branch. Importers will be added when TMU-OPS-013 packages land. (See minor finding m1). |
| 4 | `pnpm test:integration`, `pnpm test:contract`, `pnpm test:e2e` resolve through the dispatcher without a `pnpm --filter` "no project found" error. | **PASS** | All three commands run cleanly via `scripts/checks/step.mjs` and route to `scripts/checks/pending.mjs`, exiting 0 with informative placeholder notices. |
| 5 | `pnpm gate` green. | **PASS** | Verified independently in `E:\wt\TMU-OPS-014`: `pnpm gate` passed with all 139 unit tests across 16 test files green, format check, lint, typecheck, i18n check, contracts check/lint, db check, and ml check (`OK gate(quick) passed`). |

---

## Checks Run

1. **`git status` / `git diff origin/main...HEAD`** in `E:\wt\TMU-OPS-014`:
   - Working tree clean; branch `agent/ops/TMU-OPS-014-test-workspace-glob` is at commit `87666fc`.
   - 10 files modified (+39, -32).
2. **`pnpm gate` (quick)** in `E:\wt\TMU-OPS-014`:
   - Lane check: **passed** (all changed files match `ops` or `_common`).
   - Format check: **passed** (Prettier).
   - Lint: **passed** (ESLint).
   - Typecheck: **passed** (TypeScript).
   - `i18n:check`: **passed** (70 keys per locale).
   - Vitest unit suite: **passed** (139 unit tests across 16 test files).
   - Contracts sync (`contracts:check`): **passed** (version 1.0.0).
   - OpenAPI lint (`contracts:lint`): **passed**.
   - Migrations check (`db:check`): **passed** (live pgvector verification).
   - ML lint & tests (Ruff + Pytest): **passed** (7 passed).
3. **Dispatcher checks:**
   - `pnpm test:integration` → exits 0 via `pending.mjs test:integration`.
   - `pnpm test:contract` → exits 0 via `pending.mjs test:contract`.
   - `pnpm test:e2e` → exits 0 via `pending.mjs test:e2e`.
4. **Lane compliance (`.agent/lanes.json`):**
   - Modified paths:
     - `pnpm-workspace.yaml` (`ops`)
     - `scripts/checks/scaffold.test.mjs` (`ops`)
     - `docs/08-project/backlog.md` (`_common`)
     - `docs/08-project/status.md` (`_common`)
     - `docs/08-project/tasks/TMU-META-003.md` (`_common`)
     - `docs/08-project/tasks/TMU-OPS-007.md` (`_common`)
     - `docs/08-project/tasks/TMU-OPS-009.md` (`_common`)
     - `docs/08-project/tasks/TMU-OPS-012.md` (`_common`)
     - `docs/08-project/tasks/TMU-OPS-013.md` (`_common`)
     - `docs/08-project/tasks/TMU-OPS-014.md` (`_common`)
   - Zero out-of-lane edits.
5. **Commit conventions:**
   - Commit `87666fc` follows Conventional Commits format with `Task: TMU-OPS-014`, `Refs: WF-CICD, ARCH-STACK`, and `Agent: ops-dev` trailers.

---

## BLOCKER

_None._

---

## MAJOR

_None._

---

## MINOR

- [ ] **m1 — `docs/08-project/tasks/TMU-OPS-014.md:35,44` — Lockfile not updated and test packages not yet linked (AC 3 discrepancy).**
  - **Issue:** Acceptance Criterion 3 is checked (`- [x] pnpm install --frozen-lockfile links the tests/* packages (lockfile updated)`), but `pnpm-lock.yaml` was removed from "Files expected to change" and was not modified in the commit.
  - **Context:** Because TMU-OPS-013 has not landed yet, `tests/*` does not contain any subpackages with `package.json` manifests (`tests/db` only contains test files). Consequently, `pnpm install` does not discover any packages to link, and `pnpm-lock.yaml` remains identical.
  - **Remediation note:** This is technically correct behavior given that test packages are out of scope for this task and owned by `qa` in TMU-OPS-013. The task file should note that actual linking and lockfile importer additions will occur when TMU-OPS-013 adds the packages.

- [ ] **m2 — `docs/08-project/backlog.md`, `status.md`, `tasks/TMU-META-003.md`, `tasks/TMU-OPS-007.md`, `tasks/TMU-OPS-009.md`, `tasks/TMU-OPS-012.md` — Bundled post-merge bookkeeping for unrelated merged tasks.**
  - **Issue:** The commit bundles post-merge status updates (`TODO`/`REVIEW` → `DONE`) for four previously merged tasks (TMU-META-003, TMU-OPS-007, TMU-OPS-009, TMU-OPS-012) and regenerates `status.md`.
  - **Context:** While all files are in `_common` and these tasks are indeed merged on `main`, bundling retrospective status updates for unrelated tasks slightly blurs task boundaries (AGENTS.md rule 7: "Minimal diffs. One task per branch."). Realigning dependencies between TMU-OPS-013 and TMU-OPS-014 was necessary, but sweeping post-merge task status updates are better handled by dedicated meta tasks.

- [ ] **m3 — `docs/08-project/tasks/TMU-OPS-014.md:67-68` — Evidence section missing PR reference.**
  - **Issue:** The Evidence section in `TMU-OPS-014.md` still lists `- PR: (pending)` and `- Review: (pending)`.
  - **Remediation:** Update `TMU-OPS-014.md` with the PR link and this review file reference during loop finalization.

---

## Notes for the human

- The change is minimal, focused, and unblocks TMU-OPS-013 by establishing the workspace glob so that subsequent test packages will be recognized as pnpm workspace members.
- All gates, linting, typechecks, and tests are green.
- Verdict is **APPROVE**.
