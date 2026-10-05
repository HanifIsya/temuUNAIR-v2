---
id: TMU-BE-008
reviewer: reviewer
verdict: APPROVE
cycle: 1
date: 2026-10-05
---

# Review — TMU-BE-008

## Checklist

| # | Check | Result |
|---|---|---|
| 1 | Red tests existed first and failed for the right reason (`Cannot find module './idempotency' \| './rate-limit' \| '../middleware/rate-limit'` — 3 files failed, "Tests no tests" before the middleware existed; output kept in `$env:TEMP\be008-red.txt`) | PASS |
| 2 | All new/updated tests pass: middleware 22 (idempotency 11, rate-limit 11), reports suite +1 (global-IP 429), full server suite 19 files / 202 tests; `pnpm gate` green (46 files / 416 tests, 393 → 416, +23) | PASS |
| 3 | Contract tests: reports/uploads suites (contract-shaped replay, 409 `IDEMPOTENCY_CONFLICT`, missing-key 422, 429 + `Retry-After`, envelope/requestId) all green; `contracts:check OK 1.1.0`; contract untouched (5 observations filed) | PASS |
| 4 | Auth/RBAC: `enforceGlobalIpRate` runs before auth inside the existing try/catch, so failures map through the unchanged envelope; CSRF assertion untouched; state coverage = replay, conflicting fingerprint, quota exhaustion, disabled-mode bypass, per-subject isolation | PASS |
| 5 | Privacy: rate-limit logs carry `scope` only (never IP/subject/key — unit-tested with a logging spy); IP subjects are HMAC-SHA256 and never logged or returned; error body exposes `{scope, retryAfterSeconds}` only; fixtures synthetic | PASS |
| 6 | i18n: no UI strings; `RATE_LIMITED` / `IDEMPOTENCY_CONFLICT` keys already exist (no new `error.<code>`) | PASS (n/a) |
| 7 | A11y: no UI components touched | PASS (n/a) |
| 8 | Docs: task file DONE with red/green/gate evidence, 9 decisions, 5 contract observations; this review; backlog regenerated | PASS |
| 9 | Generated files in sync (`contracts:check OK 1.1.0`); no generated file hand-edited | PASS |
| 10 | Reviewer verdict APPROVE, fresh context, cycle 1 | PASS |
| 11 | Security: idempotent replay is keyed by `(scope, subject, key)` so users cannot replay each other's responses; failed attempts never stored; auth-tier 429 mapped to the BE-01 envelope (no raw 500/stack); HMAC secret taken from `AUTH_SECRET`, skipped when unset; no secret/IP in logs; SQL untouched | PASS |
| 12 | Work in lane: `apps/web/src/server/**`, `apps/web/src/app/api/**`, `**/*.test.ts`, `08-project/tasks\|reviews` — all within `be`/`_common` globs; no migration, no contract file; lane check green in gate | PASS |

## Notes

- **Composition is idempotency → rate limit**: replays return the stored response without
  consuming quota, and 429-rejected requests are never recorded as replays — preserving the
  ordering the old in-service checks had.
- **Ordering shift (decision 2)**: rate checks moved out of the services, so an
  over-quota client now gets 429 before 422/415 on the same request. Neither contract
  specifies the order; recorded as a decision.
- **Two new failures during green were test bugs, not product bugs**: shared idempotency
  keys let later tests replay earlier tests' stored entries (fixed with per-test unique
  keys), and the `fill()` helper used a throwaway scope instead of the tier's real scope
  (fixed to take the rate). No assertion was weakened in either case.
- **Auth route envelope gap caught in review**: `enforceAuthIpRate` throws `DomainError`,
  but the NextAuth route sits outside `dispatch` — the wrapper now mirrors dispatch's
  429 + `Retry-After` mapping, otherwise quota hits on login would have been 500s.
- **IP tiers** (global 300/min in `dispatch`, auth 20/min at the NextAuth route) key on
  HMAC-SHA256 with `AUTH_SECRET` and silently skip when the secret or `x-forwarded-for`
  is absent — unit tests toggle `RATE_LIMIT_ENABLED` exactly as the pre-existing suite does.
- **Contract observations** (in-memory counters vs BE-12's "Postgres-backed", auth path
  enumeration, unspecified `ipHash` method, check-vs-validation order, `POST /claims`
  listed but nonexistent) recorded in the task file for a future `TMU-CTR-*` — no contract
  file touched.

## Verdict

**APPROVE** — all acceptance criteria met, gate green (416 tests, +23), replay/409/429
behaviour proven at both unit and route level, privacy logging asserted, no
BLOCKER/MAJOR findings.
