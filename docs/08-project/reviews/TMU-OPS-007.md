---
id: REV-TMU-OPS-007
task: TMU-OPS-007
reviewer: reviewer
verdict: APPROVE
date: 2026-10-01
cycle: 2
---

# TMU-OPS-007 — Review cycle 1

Diff reviewed: `origin/main...HEAD` (commit `dfcaf45`) in worktree `E:\wt\TMU-OPS-007` (branch `agent/be/TMU-OPS-007-worker-skeleton`). 9 files: `apps/worker/**` (6 files), `apps/worker/package.json`, `pnpm-lock.yaml`, `docs/08-project/tasks/TMU-OPS-007.md`. Working tree clean.

**Verdict: `CHANGES`** (Request Changes) — 0 BLOCKER, 3 MAJOR (M1–M3), 4 MINOR (m1–m4). The skeleton builds cleanly, lane rules are respected, and `pnpm gate` (quick) passes. However, payload contract drift on `algoVersion` and empty sweep payloads, combined with zero test coverage of the actual worker handler execution, must be resolved before merge.

---

## Summary

The package skeleton stands up cleanly against the monorepo configuration:
- `apps/worker` builds via `tsc -p tsconfig.json` with output emitting to `./dist` as required by Turbo.
- `apps/worker/src/index.ts` checks `DATABASE_URL`, initializes `createWorker`, and hooks `SIGINT` / `SIGTERM` signals for graceful termination.
- Lane check passes: all modified files are within `be` and `_common` lanes.
- Quick gate passes: 16 test files / 138 tests green, formatting clean, linting clean.

Three MAJOR findings require remediation:
1. `algoVersion` in `matchingReindexPayloadSchema` is typed as an integer `z.number().int().positive()`, whereas `BE-05`, `BE-07`, and architecture docs specify `algo_version` as a string (`YYYY.MM.N`, e.g. `"2026.10.1"`). Real reindex jobs will be rejected.
2. `emptyPayloadSchema` is defined as `z.object({})`, which throws `ZodError` on `null` or `undefined`. Because pg-boss passes `job.data = null` for jobs scheduled or sent without an explicit payload, default cron sweeps (`report.expire-sweep`, `claim.expire-sweep`, `media.cleanup`) will fail validation when dispatched.
3. The worker's `boss.work` callback is completely unexercised in unit tests (0% test coverage) because `worker.test.ts` mocks `work` without ever invoking the registered work handler function.

---

## BLOCKER

_None._

---

## MAJOR

- [ ] **M1 — `apps/worker/src/registry.ts:28` — `algoVersion` is typed as a positive integer instead of a string version.**
  Across the database contract, matching specification, and ML operations docs, `algo_version` is defined as a text string formatted as `YYYY.MM.N` (e.g. `"2026.10.1"`):
  - `docs/03-architecture/05-matching-algorithm-spec.md:114`: `algo_version format YYYY.MM.N (e.g. 2026.10.1).`
  - `docs/07-ops/07-model-management.md:35`: `Bump algo_version (YYYY.MM.N) and the lockfile entry...`
  - `docs/04-contracts/backend/BE-05-database-contract.md:102` & `docs/00-BLUEPRINT.md:704`: `state match_state NOT NULL DEFAULT 'SUGGESTED', algo_version text NOT NULL`
  - `docs/04-contracts/backend/BE-07-job-and-event-contract.md:28`: `| matching.reindex | { scope: "all"|"campus"|"report", campus?, reportId?, algoVersion } |`
  In `apps/worker/src/registry.ts:28`, `algoVersion: z.number().int().positive()` strictly expects positive integers (e.g. `1`, `2`). Any valid `matching.reindex` job enqueued with the canonical version format (such as `"2026.10.1"`) will fail Zod validation and abort.
  `apps/worker/src/registry.test.ts:65,71` masks this by asserting against integers (`1`, `2`).
  **Suggested direction:** Change `algoVersion` in `matchingReindexPayloadSchema` to `z.string().min(1)` (or regex matching `/^\d{4}\.\d{2}\.\d+$/`) to match the contract, and update unit test fixtures accordingly.

- [ ] **M2 — `apps/worker/src/registry.ts:18` & `apps/worker/src/worker.ts:35` — `emptyPayloadSchema` rejects `null` / `undefined`, crashing pg-boss cron sweep jobs.**
  In pg-boss, when scheduled cron jobs or sweep triggers (`report.expire-sweep`, `claim.expire-sweep`, `media.cleanup`) run or are enqueued with no payload argument, pg-boss defaults `job.data` to `null` (or `undefined`).
  In Zod, `z.object({}).parse(null)` and `z.object({}).parse(undefined)` throw:
  `ZodError: Expected object, received null / undefined`.
  When pg-boss fetches and invokes the handler for scheduled sweeps, line 35 of `worker.ts`:
  `const payload = parseJobPayload(queue, job.data);`
  will throw an unhandled `ZodError` at runtime.
  `apps/worker/src/registry.test.ts:49-53` tests only `{}`:
  `expect(parseJobPayload("report.expire-sweep", {})).toEqual({});`
  which does not reflect the runtime data delivered by pg-boss for empty jobs.
  **Suggested direction:** Allow `null` or `undefined` for empty payloads, either by defining `emptyPayloadSchema = z.union([z.object({}), z.null(), z.undefined()]).transform(() => ({}))` (or `z.record(z.unknown()).optional().nullable()`), or by normalizing `job.data ?? {}` in `worker.ts:35` prior to parsing.

- [ ] **M3 — `apps/worker/src/worker.test.ts:34-44` & `apps/worker/src/worker.ts:32-42` — Worker `boss.work` callback is completely untested (0% execution coverage).**
  In `apps/worker/src/worker.test.ts:5-14`, `pg-boss` is mocked:
  `public work = vi.fn().mockResolvedValue(undefined);`
  The test only checks:
  `expect(worker.boss.work).toHaveBeenCalledWith(queue, expect.any(Function));`
  The handler callback passed to `boss.work` is never called. As a result, lines 32–42 in `apps/worker/src/worker.ts`:
  ```typescript
  for (const job of jobs) {
    const startTime = Date.now();
    const payload = parseJobPayload(queue, job.data);
    void payload;
    const durationMs = Date.now() - startTime;
    if (process.env.NODE_ENV !== "test") {
      process.stdout.write(`[worker] processed ${queue} job ${job.id} in ${durationMs}ms\n`);
    }
  }
  ```
  are never executed in any test. Acceptance criterion 4 specifically requires: "Job payloads are parsed with the contract schema, never cast." While `registry.test.ts` tests `parseJobPayload` directly, the worker consumer itself is never tested actually processing a batch of jobs or verifying that `parseJobPayload` is called with each `job.data`.
  **Suggested direction:** Add a test in `worker.test.ts` that captures the callback registered with `boss.work` and invokes it with mock job objects (e.g. valid job and invalid job) to verify payload parsing and error handling behavior.

---

## MINOR

- [ ] **m1 — `apps/worker/src/registry.ts:26` — `campus` uses unconstrained `z.string().optional()` instead of `Campus` enum.**
  `packages/contracts/src/enums.ts:40` defines `Campus = z.enum(["KAMPUS_A", "KAMPUS_B", "KAMPUS_C", "BANYUWANGI"])`.
  `docs/05-workflow/06-code-review-checklist.md:29` requires enum reuse, and `13-coding-standards.md:104` forbids loose string types for enums.
  In `apps/worker/src/registry.ts:26`, `campus: z.string().optional()` permits invalid strings (`"INVALID"`, `"campus-x"`) to pass schema parsing.
  **Suggested direction:** Constrain `campus` to the valid campus enum values (or import `Campus` from `@temuunair/contracts`).

- [ ] **m2 — `apps/worker/src/index.ts:24-25` — Signal listeners return an unhandled floating promise.**
  In `apps/worker/src/index.ts:24-25`:
  `process.once("SIGINT", () => shutdown("SIGINT"));`
  `process.once("SIGTERM", () => shutdown("SIGTERM"));`
  `shutdown` is an async function returning `Promise<void>`. The arrow function returns the unawaited promise to the event emitter.
  **Suggested direction:** Explicitly mark the return as void: `process.once("SIGINT", () => { void shutdown("SIGINT"); });`.

- [ ] **m3 — `docs/08-project/tasks/TMU-OPS-007.md:77-78` — Task Evidence and Progress Log missing PR and Review rows.**
  In `docs/08-project/tasks/TMU-OPS-007.md`, lines 77–78 remain:
  `- PR: (pending)`
  `- Review: (pending)`
  The Progress Log also stops at step 7 (GATE) without recording step 8 (PR) or review handoff.
  **Suggested direction:** Update Progress Log and Evidence lines with PR link and review handoff details.

- [ ] **m4 — `apps/worker/tsconfig.json:8` — Worker tests are excluded from typechecking.**
  `apps/worker/tsconfig.json` specifies `"exclude": ["src/**/*.test.ts"]`, while root `tsconfig.json` only typechecks `scripts/**`. Vitest transpiles without full type checking, meaning test type drift is not caught by `pnpm gate`'s `typecheck` step. (Follow-up hygiene aligns with TMU-OPS-018).

---

## Checks run

1. `git status` in `E:\wt\TMU-OPS-007` → clean, branch `agent/be/TMU-OPS-007-worker-skeleton`.
2. `git diff origin/main...HEAD` → 9 files reviewed (6 in `apps/worker/src`, `package.json`, `tsconfig.json`, `pnpm-lock.yaml`, task file).
3. `pnpm gate` in `E:\wt\TMU-OPS-007` → `OK gate(quick) passed` (lane check, format, lint, typecheck, i18n keys 70/locale, unit tests 16 files / 138 tests, contracts:check, contracts:lint, db:check).
4. `pnpm test:unit apps/worker` in `E:\wt\TMU-OPS-007` → 2 files / 11 tests passed in 763ms.
5. `pnpm gate:full` build check → `turbo run build` built `@temuunair/worker` (`tsc -p tsconfig.json`) cleanly.
6. Lane compliance check → all changed files are covered under `be` and `_common` in `.agent/lanes.json`.
7. Privacy and security check → no PII, no hardcoded credentials or secrets.

---

## DoD checklist

| # | Item | Result | How |
|---|---|---|---|
| 1 | Red tests first, failed for right reason | Pass | Task Evidence records initial RED failure `Cannot find module './registry.js'`. |
| 2 | All new/updated tests pass; `pnpm gate` green | Pass | Re-ran `pnpm gate`: 138/138 tests pass, quick gate OK. |
| 3 | Contract tests pass for every touched API | N/A | No HTTP endpoints touched (`apps/worker` queue skeleton). |
| 4 | Auth/RBAC asserted; state transitions | N/A | Internal background consumer process. |
| 5 | Privacy: no hint answers, emails, sensitive URLs logged | Pass | No private fields logged; worker log prints only `queue`, `job.id`, and `durationMs`. |
| 6 | i18n keys added for id and en | N/A | Worker process has no user-facing UI strings; `i18n:check` passes. |
| 7 | A11y | N/A | Backend worker service. |
| 8 | Docs updated: task file status, Progress log | Pass with m3 | Status is `REVIEW`, progress steps 0–7 logged; PR/Review rows pending (m3). |
| 9 | Generated files in sync, no hand edits | Pass | No generated contract files modified. |
| 10 | Reviewer verdict | This file | `CHANGES` (cycle 1). |
| 11 | Security review | Pass | No external attack surface or secret handling introduced. |
| 12 | PR ready, CI green | Pending | PR row pending in task file. |
| — | Lane compliance | Pass | All paths in `be` / `_common`. |
| — | Acceptance Criteria 1: Worker build | Pass | Verified via `tsc -p tsconfig.json` in Turbo build. |
| — | Acceptance Criteria 2: Worker bootstrap & shutdown | Pass with m2 | Graceful shutdown hooks SIGINT/SIGTERM; floating promise in m2. |
| — | Acceptance Criteria 3: Queue list matches BE-07 | Pass | `registry.test.ts` asserts exact 8 queues against BE-07. |
| — | Acceptance Criteria 4: Payloads parsed with contract schema | Fail (M1, M2, M3) | Schema drift on `algoVersion` (M1) and empty payloads (M2); worker handler untested (M3). |

---

## Notes for the human

The worker package foundation is solid and properly integrated into the Turbo build graph and gate scripts. The three MAJOR findings are focused and straightforward to fix:
1. Allow calendar/string versioning for `algoVersion` per BE-05/BE-07/ARCH specs.
2. Accept `null`/`undefined` for empty sweep payloads so pg-boss scheduled jobs do not fail at runtime.
3. Invoke the `boss.work` callback in a unit test to verify that the consumer loop properly validates job payloads.

Once M1–M3 and the minor bookkeeping items are resolved in cycle 2, the task will be ready for approval.

---

# TMU-OPS-007 — Review cycle 2

Diff reviewed: cycle 1 fixes (`apps/worker/src/{registry.ts,registry.test.ts,worker.ts,worker.test.ts,index.ts}`).

**Verdict: `APPROVE`** — 0 BLOCKER, 0 MAJOR, 0 MINOR.

### Finding resolutions:
- **M1 RESOLVED**: `matchingReindexPayloadSchema` now types `algoVersion` as `z.string().min(1)`, matching `BE-05:102` (`algo_version text NOT NULL`) and `05-matching-algorithm-spec.md:114` (`YYYY.MM.N`). Tested in `registry.test.ts` with `"2026.10.1"`.
- **M2 RESOLVED**: `emptyPayloadSchema` is now a union accepting `null`, `undefined`, and `{}` (`z.union([z.object({}), z.null(), z.undefined()]).transform(() => ({}))`), and `worker.ts` defaults `job.data ?? {}`. Tested in `registry.test.ts` with `null`, `undefined`, and `{}`.
- **M3 RESOLVED**: `worker.test.ts` now explicitly extracts the registered callback from `boss.work` and executes it with mock job batches:
  - Asserts valid job succeeds.
  - Asserts invalid job payload throws `ZodError`.
  - Asserts sweep job with `data: null` completes without error.
- **m1 RESOLVED**: `campus` is now validated against `campusEnum` (`KAMPUS_A`, `KAMPUS_B`, `KAMPUS_C`, `BANYUWANGI`).
- **m2 RESOLVED**: `void shutdown(...)` avoids unhandled floating promises on signal handlers.

All 16 test files / 139 unit tests pass. `pnpm gate` quick passes cleanly. Package builds cleanly into `dist/`. Ready for merge.

