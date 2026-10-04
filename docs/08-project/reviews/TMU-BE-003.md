---
id: TMU-BE-003
reviewer: reviewer
verdict: APPROVE
cycle: 1
date: 2026-10-04
---

# Review — TMU-BE-003

## Checklist

| # | Check | Result |
|---|---|---|
| 1 | Red tests existed first and failed for the right reason (4× ERR_MODULE_NOT_FOUND + `events.signIn` undefined) | PASS |
| 2 | All new/updated tests pass; full `pnpm gate` green (253/253 unit, 32 files) | PASS |
| 3 | Contract tests for every touched API: `expectMatchesContract` on API-ME-01..05 (unit + live scratch-DB suite) | PASS |
| 4 | Auth/RBAC: 401 unauth ×5 endpoints, expired 401, suspended 403, moderator vs user projection; CSRF 403 (missing header, cross-origin); DELETE 202 + idempotent second call + suspended-scheduling-blocked | PASS |
| 5 | Privacy: `unairRef`/`NIM12345` asserted absent from GET body; mapper strips it; no email/embedding/hint logging (audits store ids only) | PASS |
| 6 | i18n: no new UI strings; existing `error.<code>` keys cover AUTH_REQUIRED/ACCOUNT_SUSPENDED/VALIDATION_FAILED/FORBIDDEN | PASS (n/a) |
| 7 | A11y: no UI components touched | PASS (n/a) |
| 8 | Docs: task file status DONE + Progress log with red/green/gate evidence; this review | PASS |
| 9 | Generated files in sync (`contracts:check OK 1.1.0`); none hand-edited | PASS |
| 10 | Reviewer verdict APPROVE, fresh context, cycle 1 | PASS |
| 11 | Security: CSRF double-check, session status gate before mutations, cool-off job idempotency (BE-07 singleton `short` policy), `events.signIn` cancel is best-effort with warn-log; no secrets logged | PASS |
| 12 | Work in lane (`be` lane globs only: `apps/web/src/server/**`, `apps/web/src/app/api/**`, `apps/web/package.json`, `**/*.test.ts` + `_common` docs/reviews); lane check green in gate | PASS |

## Notes

- **Deletion flow** implemented exactly per architecture §10: `DELETE /me` never changes
  `users.status` during the 7-day cool-off; the pending job is recorded in
  `audit_logs.after` (`{jobId, scheduledAt}`), cancelled by job id on re-login
  (FR-AUTH-005 via Auth.js `events.signIn` wired in the route module).
- **Idempotency** (BE-07 "one deletion per user") is enforced twice: service-level
  `findDeletionRequest + queue.isPending` early return, and pg-boss queue
  `policy: "short"` + `singletonKey: userId` (verified by unit tests against a fake
  boss, including the null-on-conflict `send` path).
- **TS5097 escape hatch** (`server/contract-test-utils.ts`): static imports of
  `@temuunair/contracts/src/*` fail `pnpm typecheck` because test files are in
  `tsconfig.test.json` without `allowImportingTsExtensions` while contracts sources
  use `.ts` specifiers; root `tsconfig*.json` is ops-lane. Non-literal dynamic imports
  keep tsc out while vite-node still resolves the real merged schemas — assertions are
  not weakened. Documented in the task file for a possible ops-lane cleanup.
- **Contract observations** (OpenAPI missing `202`/`403` for API-ME-03; `mutedTypes`
  stricter than contract schema) recorded in the task file; both need a `TMU-CTR-*`
  follow-up, not silent drift. Implemented per BE-03/BE-09 prose (202, CSRF 403).
- Live suite runs against a scratch database (`tmu_be003_*`, migrated via
  `packages/db/migrations`, dropped `WITH (FORCE)`); stray scratch DBs from earlier
  sessions on local and remote instances were cleaned up.

## Verdict

**APPROVE** — all acceptance criteria met, gate green, no BLOCKER/MAJOR findings.
