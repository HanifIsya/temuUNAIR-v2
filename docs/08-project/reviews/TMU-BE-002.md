---
id: TMU-BE-002
reviewer: reviewer
verdict: APPROVE
cycle: 1
date: 2026-10-04
---

# Review — TMU-BE-002

## Checklist

| # | Check | Result |
|---|---|---|
| 1 | Red tests existed first and failed for the right reason (19× ERR_MODULE_NOT_FOUND) | PASS |
| 2 | All 20 tests pass; full `pnpm gate` green (202/202 unit, 27 files) | PASS |
| 3 | Domain rejection creates no user row — `signIn` callback returns `false` before adapter insert (allowlist unit tests) | PASS |
| 4 | `__Secure-temuunair.session` cookie: httpOnly, SameSite=Lax, Path=/ asserted | PASS |
| 5 | Session strategy = `database`, maxAge = 30 days (2 592 000 s) asserted | PASS |
| 6 | `SUSPENDED`/`DELETED` → 403 ACCOUNT_SUSPENDED; no session → 401 AUTH_REQUIRED; ACTIVE → null | PASS |
| 7 | Hashed email logging (FNV-1a) deterministic — BE-09 rule 5, no raw email in logs | PASS |
| 8 | Empty allowlist rejects everything (fail-closed) | PASS |
| 9 | Case-insensitive domain matching | PASS |
| 10 | Google provider configured via `buildAuthOptions(input)` (no env reads in tests) | PASS |
| 11 | Route handler at `app/api/auth/[...nextauth]/route.ts` (Auth.js v5 GET/POST) | PASS |
| 12 | Contracts in sync (v1.1.0); db:check ok; ML 7/7 | PASS |

## Notes

- `config.test.ts` exercises `buildAuthOptions(input)` with explicit inputs rather than
  the lazy `authOptions` proxy — keeps tests free of DB pool creation. The proxy remains
  for the route handler.
- Out-of-lane handoffs (`lib/auth.ts`, `middleware.ts`) correctly deferred to
  `TMU-FE-001`; documented in the task file.
- CSRF double-check (same-origin + `X-Requested-With`) and magic-link dev-only fallback
  are delegated to Auth.js internals configured here; contract tests for wire-level
  behaviour (curl-level 403, cookie destroy on logout) belong to BE-13 integration tests
  in a later BE task.
- `@types/pg` added to silence TS7016; `@temuunair/db/src/schema` deep import used
  because the db package has no `exports` map (no in-lane alternative without a db-lane
  handoff).

## Verdict

**APPROVE** — all acceptance criteria met, gate green, no findings.
