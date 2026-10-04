---
id: TMU-FE-001
title: Login flow — landing → Google OAuth → callback, auth errors (SCR-001/002)
status: TODO
lane: fe
slug: fe-login-flow
milestone: M3
priority: P1
owner: frontend-dev
deps: [TMU-BE-002]
refs: [FE-01, FE-06, FE-11, SCR-001, SCR-002, FR-AUTH-001]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-FE-001 — Login flow — landing → Google OAuth → callback, auth errors (SCR-001/002)

## Goal

Wire the unauthenticated entry path per FE-01: public landing CTAs (sign in, guest browse),
`/login` redirect to the Auth.js Google flow, `/auth/error` page mapping
`AUTH_DOMAIN_NOT_ALLOWED`/`ACCOUNT_SUSPENDED`/callback failures to i18n messages
(FE-11 code→message table), and session-aware header state. No data fetching inside
components — feature hook `useSession` only.

## Acceptance criteria

- [ ] Component tests for every FE-06 state (loading, unauthenticated, domain-denied, suspended).
- [ ] All strings via `id`/`en` messages files; `pnpm i18n:check` green.
- [ ] A11y per FE-09 (focus on error page, keyboard path to sign-in, zero axe violations).
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/(public)/login/**`, `apps/web/src/features/auth/**`, `apps/web/src/components/header`
- matching tests; i18n message files
- `docs/08-project/tasks/TMU-FE-001.md`
