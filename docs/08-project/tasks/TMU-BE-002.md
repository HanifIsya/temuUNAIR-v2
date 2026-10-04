---
id: TMU-BE-002
title: Auth — Auth.js + Google OAuth, domain allowlist, DB sessions (BE-09, DEC-001/021)
status: TODO
lane: be
slug: be-auth
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-001]
refs: [BE-09, FR-AUTH-001..003, DEC-001, DEC-021]
created: 2026-10-03
updated: 2026-10-03
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

- [ ] Contract tests per BE-13: authn on every non-public route; hidden resources → `NOT_FOUND` not `FORBIDDEN`.
- [ ] Domain rejection creates no user row; session cookie flags asserted; logout destroys row.
- [ ] Magic link active only when `NODE_ENV=development` and still domain-checked.
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/server/auth/*` (config, callbacks, allowlist, session helpers)
- `apps/web/src/app/api/auth/[...nextauth]/route.ts` (Auth.js v5 handler)
- matching `**/*.test.ts`
- `docs/08-project/tasks/TMU-BE-002.md`

Out-of-lane handoffs (declare, do not edit here): `apps/web/src/lib/auth.ts` client
helper + `apps/web/src/middleware.ts` `/login?next=` redirect belong to `TMU-FE-001`
(fe lane owns `lib/**` and `middleware.ts`); `.env.example` is ops lane — if BE-11 adds
a key, file the edit as an ops follow-up.
