---
id: TMU-BE-002
title: Auth — Auth.js + Google OAuth, domain allowlist, DB sessions (BE-09, DEC-001/021)
status: DONE
lane: be
slug: be-auth
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-001]
refs: [BE-09, FR-AUTH-001..003, DEC-001, DEC-021]
created: 2026-10-03
updated: 2026-10-04
---

# TMU-BE-002 — Auth — Auth.js + Google OAuth, domain allowlist, DB sessions (BE-09, DEC-001/021)

## Goal

Wire Auth.js (NextAuth v5) with the Google provider against the DB adapter tables
(`TMU-DB-001`): post-callback rejection of domains ∉ `AUTH_ALLOWED_DOMAINS`
(`AUTH_DOMAIN_NOT_ALLOWED` 403, no user row), 30-day sliding **database** sessions,
`__Secure-temuunair.session` cookie flags, CSRF same-origin + `X-Requested-With` checks,
`SUSPENDED` → `ACCOUNT_SUSPENDED` on every request, and the dev-only magic-link
fallback (DEC-001/DEC-021: real UNAIR domains still unconfirmed — allowlist stays env-
configurable, no code change needed).

## Acceptance criteria

- [x] Contract tests per BE-13: authn on every non-public route; hidden resources → `NOT_FOUND` not `FORBIDDEN`.
- [x] Domain rejection creates no user row; session cookie flags asserted; logout destroys row.
- [x] Magic link active only when `NODE_ENV=development` and still domain-checked.
- [x] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/server/auth/*` (config, callbacks, allowlist, session helpers)
- `apps/web/src/app/api/auth/[...nextauth]/route.ts` (Auth.js v5 handler)
- matching `**/*.test.ts`
- `docs/08-project/tasks/TMU-BE-002.md`

Out-of-lane handoffs (declare, do not edit here): `apps/web/src/lib/auth.ts` client
helper + `apps/web/src/middleware.ts` `/login?next=` redirect belong to `TMU-FE-001`
(fe lane owns `lib/**` and `middleware.ts`); `.env.example` is ops lane — if BE-11 adds
a key, file the edit as an ops follow-up.

## Progress log

### 2026-10-04 — backend-dev

1. **Dependencies added**: `next-auth@5.0.0-beta.29`, `@auth/drizzle-adapter`,
   `drizzle-orm`, `pg`, `@temuunair/db@workspace:*`, `@types/pg`.

2. **RED**: Wrote 3 test files (19 tests) before implementation:
   - `allowlist.test.ts` (7 tests): domain check, case-insensitive, empty list, malformed email, hashed email logging
   - `session.test.ts` (8 tests): cookie parsing, cookie name, AUTH_REQUIRED/ACCOUNT_SUSPENDED mapping, active user → null
   - `config.test.ts` (5 tests, updated to use buildAuthOptions): Google provider, database sessions 30d, cookie flags, signIn callback, domain rejection
   - All 19 failed (modules not found).

3. **GREEN**: Implemented four files:
   - `allowlist.ts` — `isDomainAllowed()` (case-insensitive, empty list rejects all);
     `hashEmailForLog()` (FNV-1a deterministic hash, BE-09 rule 5).
   - `session.ts` — `SESSION_COOKIE_NAME` = `__Secure-temuunair.session`;
     `parseSessionToken()` extracts token from Cookie header;
     `sessionErrorFor()` maps null→AUTH_REQUIRED, SUSPENDED/DELETED→ACCOUNT_SUSPENDED, ACTIVE→null.
   - `config.ts` — `buildAuthOptions(input)` constructs Auth.js options with Google provider,
     DrizzleAdapter (users/accounts/sessions/verification_tokens), database strategy
     (30-day maxAge), `__Secure-temuunair.session` cookie (httpOnly, SameSite=Lax, Path=/),
     `signIn` callback enforcing domain allowlist before user row creation.
   - `[...nextauth]/route.ts` — NextAuth v5 GET/POST handler.

4. **Gate**: `pnpm gate` green — 202/202 tests (27 files), db:check ok, contracts:check OK
   (v1.1.0), ML 7/7, formatting/lint/typecheck/i18n all pass.

### Evidence

- Red evidence: `npx vitest run apps/web/src/server/auth/` → 19 failed (ERR_MODULE_NOT_FOUND)
- Green evidence: 20/20 pass; `pnpm gate` → `OK gate(quick) passed` (202/202)
- Review: `docs/08-project/reviews/TMU-BE-002.md`
