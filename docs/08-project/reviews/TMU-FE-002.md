---
id: TMU-FE-002
reviewer: reviewer
verdict: APPROVE
cycle: 1
date: 2026-10-05
---

# Review — TMU-FE-002

## Checklist

| # | Check | Result |
|---|---|---|
| 1 | Red evidence: 10/10 files failed first for the right reason (`Failed to resolve import … Does the file exist?` on the 10 unwritten modules); log in the task file | PASS |
| 2 | New/updated tests pass; full `pnpm gate` green (63 files / 511 tests; contracts 1.1.0; db ok) | PASS |
| 3 | Contract tests: `API-ME-02` asserted via the generated client + `mswHandlers` (captured PATCH body `{ locale: "en" }`, CSRF header present); `API-ME-01` types drive `Me`; no endpoint changed (UI-only task) | PASS |
| 4 | Auth/RBAC + state transitions: middleware cookie-gate + layout `getAppUser` branches (`AUTH_REQUIRED` → `/login`, `ACCOUNT_SUSPENDED` → `/auth/error?error=…`, else rethrow) unit-tested; admin nav item role-filtered (`USER` hidden, `MODERATOR`/`ADMIN` shown) | PASS |
| 5 | Privacy: no hint answers, emails, embeddings or sensitive URLs in code, tests or logs; fixture user is synthetic (`budi@example.test`); raw image URLs untouched | PASS |
| 6 | i18n: 15 new keys in **both** `id` and `en` (`common.nav.*`, `common.localeSwitcher.*`); `pnpm i18n:check` green (99 keys); no literal UI strings in JSX (labels via `t()`/message keys) | PASS |
| 7 | A11y: 6 axe runs (app-shell, bottom-nav, top-nav ×2, locale-switcher, notification-bell) — `violations: []`; disclosure menu keyboard path (Escape + refocus), `aria-current` exact-match, `aria-expanded`, `aria-hidden` badge | PASS |
| 8 | Docs updated: task file DONE with decisions/observations/deferrals, this review, backlog regenerated (`backlog:build`, 98 tasks) | PASS |
| 9 | Generated files in sync (`contracts:check OK 1.1.0`); `pnpm-lock.yaml` updated by `pnpm i` only | PASS |
| 10 | Reviewer verdict APPROVE, fresh context, cycle 1 | PASS |
| 11 | Security review: middleware only gates cookie presence — documented (D-2) with the authoritative check in the server layout; CSRF header on the `PATCH /me` mutation asserted in tests; no secrets in code | PASS |
| 12 | Lane: all files inside fe globs (`app/(app)/**`, `components/**`, `features/**`, `i18n/**`, `middleware.ts`, `apps/web/package.json`) + `_common` (lockfile, docs); lane check green in gate | PASS |

## Notes

- **Findings on cycle 1: none blocking.** Two gate-step fixes were ordinary
  first-green work: an unused `userEvent` import (lint) and the MSW harness discovery
  sequence — no assertion weakened, no product behaviour papered over.
- **Environment note (recorded, not a defect)**: the first tests-step failure was
  self-inflicted env drift — the gate ran with the session-inherited Render
  `DATABASE_URL` (where role `temuunair` doesn't exist) instead of the User-scope
  local-Docker URL every prior green gate used. Re-running with the documented env
  produced a fully green gate; no code changed between the two runs.
- **Test-harness rigour**: `features/shell/msw-server.ts` is test-only, imported first
  by design (D-12) with the openapi-fetch/MSW ordering documented in the file and the
  test. `onUnhandledRequest: "error"` means any un-mocked call fails loudly.
- **Contract gaps recorded, not absorbed**: root `Me` export (O-1 → `TMU-CTR-*`),
  missing `FR-I18N-001` Gherkin (O-2 → docs lane), avatar-menu duplicate route (O-3 →
  IA/SCR decision), mobile bell/avatar gap (O-4 → design), i18n scan gaps (O-5 → ops).
- **Deferrals are honest**: bell count/polling (M6), analytics, and mobile shell extras
  are explicitly out of scope and tracked in the task file.

## Verdict

**APPROVE** — all four acceptance criteria met with evidence, gate fully green, a11y
and privacy checks pass, contract behaviour asserted, deferrals explicit and filed.
Unblocks FE-003 and FE-005.
