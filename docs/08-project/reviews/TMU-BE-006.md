---
id: TMU-BE-006
reviewer: reviewer
verdict: APPROVE
cycle: 1
date: 2026-10-04
---

# Review — TMU-BE-006

## Checklist

| # | Check | Result |
|---|---|---|
| 1 | Red tests existed first and failed for the right reason (`Cannot find module './report-queue'`, `Tests no tests`, 2 files) | PASS |
| 2 | All new/updated tests pass (48 new: 44 handler + 4 queue); full `pnpm gate` green after three fix rounds documented in the Progress log | PASS |
| 3 | Contract tests for every touched API: `expectMatchesContract` on API-REP-01 (create), API-REP-02 (default + paginated page), API-REP-04 (owner + moderator views) | PASS |
| 4 | Auth/RBAC: 401 on all three routes unauthenticated, 403 CSRF on POST, moderator view campus-scoped (KAMPUS_A in / KAMPUS_B out) + admin allowed, owner-only fields (`version`, `hintPrompts`, `expiresAt`, `matchCount`, `activeClaimId`) absent from the public view; state visibility covered (6 hidden statuses, REMOVED 404 for others, PENDING_REVIEW readable) | PASS |
| 5 | Privacy: hint answers encrypted at rest (AES-256-GCM, round-trip asserted, plaintext never in the DB or response); sensitive reports served to others with generalized title/description, `url: null` and masked-thumb only (original key never presigned); `reporterEmail`/`reporterId`/`flagCount` only in the moderator view; no geo/lat anywhere; fixtures synthetic (scratch DB + TMU-DB-005 seeds) | PASS |
| 6 | i18n: no new UI strings; error codes map to existing `error.<code>` keys | PASS (n/a) |
| 7 | A11y: no UI components touched | PASS (n/a) |
| 8 | Docs: task file DONE + Progress log with red/green/gate evidence, decisions, contract observations; this review | PASS |
| 9 | Generated files in sync (`contracts:check OK 1.1.0`); contract untouched (observations filed instead) | PASS |
| 10 | Reviewer verdict APPROVE, fresh context, cycle 1 | PASS |
| 11 | Security: `Idempotency-Key` required (422), body-hash conflict → 409; rate limits dual-window inside idempotency (replays don't consume quota) with `Retry-After`; all SQL through Drizzle with bound params; image attach verifies uploader + READY + unlinked; UUID shape guard on `GET /reports/{id}`; enqueue failure cannot fail or duplicate the create | PASS |
| 12 | Work in lane (`be` globs: `apps/web/src/server/**`, `apps/web/src/app/api/**`, `**/*.test.ts`; docs under `_common` `08-project/tasks|reviews`); lane check green in gate | PASS |

## Notes

- **View selection is one code path**: `getReportView` computes `owner`/`moderator`
  (ADMIN global, MODERATOR campus-scoped), maps public once, then upgrades to owner or
  moderator shape — masking decisions live solely in `report-mapper.ts`, so browse and
  detail can't drift apart (both suites assert the same masking behaviour).
- **Cross-field order is testable**: zod → 409 image quota → rate limits → type/custody/
  hint rules → time window → DB existence → attach validation → transaction. Each branch
  of the TC-REP matrix has its own test asserting the exact `fields[].path`.
- **Two red-run follow-ups were test bugs, not product bugs** and were fixed without
  touching any assertion: a regenerated `occurredAt.from` broke "same body" byte equality,
  and a random non-taxonomy `?category=` marker was (correctly) rejected by enum
  validation. Both are documented in the task Progress log.
- **`parseReportConfig`** was added rather than widening the test env: handlers still
  never read `process.env`; the narrow parse reuses the exact Zod rules from BE-11
  (`FIELD_ENCRYPTION_KEY` base64-32B, `REPORT_TTL_DAYS` default 90), while the full boot
  env is validated by `parseConfig` via `getDb()` at startup.
- **Contract observations** (REP-04 has no geo even for privileged views, unspecified
  generalization strings, no `ReportQuery` schema, REP-01 errors omit
  `IDEMPOTENCY_CONFLICT`) are recorded for a future `TMU-CTR-*` — no contract file was
  touched.

## Verdict

**APPROVE** — all acceptance criteria met, gate green (347 tests), privacy and RBAC
assertions in place, no BLOCKER/MAJOR findings.
