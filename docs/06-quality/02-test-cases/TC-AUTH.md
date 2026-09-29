---
id: TC-AUTH
title: Test cases — AUTH
status: draft
owner: QA
updated: 2026-09-29
depends_on: ["AC", "BE-13"]
source_refs: ["FR-AUTH-001..005", "US-001..004"]
---

# TC-AUTH — authentication and account

| TC | Case | Derives from | Automated path |
|---|---|---|---|
| TC-AUTH-001 | Allowed-domain Google login creates a session and `GET /me` returns the user | FR-AUTH-001 | `tests/auth/login.spec.ts` |
| TC-AUTH-002 | Disallowed domain → `403 AUTH_DOMAIN_NOT_ALLOWED`, no user row | FR-AUTH-002 | `tests/auth/domain.spec.ts` |
| TC-AUTH-003 | Suspended user gets `403 ACCOUNT_SUSPENDED` on every endpoint | FR-AUTH-003 | `tests/auth/suspended.spec.ts` (table-driven over groups) |
| TC-AUTH-004 | `PATCH /me` updates display name and locale; invalid locale → 422 | FR-AUTH-004 | `tests/me/update.spec.ts` |
| TC-AUTH-005 | `GET/PUT /me/notification-preferences` round-trips; unknown types → 422 | FR-AUTH-004 | `tests/me/prefs.spec.ts` |
| TC-AUTH-006 | `DELETE /me` returns 202 and schedules deletion | FR-AUTH-005 | `tests/me/delete.spec.ts` |
| TC-AUTH-007 | Re-login within the 7-day cool-off cancels deletion | FR-AUTH-005 | `tests/me/delete.spec.ts` |
| TC-AUTH-008 | `account.delete` anonymizes the user, removes images, keeps audit stubs | FR-AUTH-005 | `tests/jobs/account-delete.spec.ts` |
| TC-AUTH-009 | Unauthenticated request to an app route redirects to `/login?next=` | FR-AUTH-001 | `tests/auth/guard.spec.ts` |
| TC-AUTH-010 | `next` param is validated to internal paths (no open redirect) | security | `tests/auth/guard.spec.ts` |
| TC-AUTH-011 | Session cookie flags: httpOnly, SameSite=Lax, Secure in prod config | NFR-026 | `tests/auth/cookie.spec.ts` |
| TC-AUTH-012 | Mutation without `X-Requested-With`/Origin is rejected | NFR-026 | `tests/auth/csrf.spec.ts` |
| TC-AUTH-013 | Auth endpoints rate-limited to 20/min/IP | BE-12 | `tests/auth/rate-limit.spec.ts` |
| TC-AUTH-014 | Failed domain checks log a hashed email only | privacy | `tests/auth/logging.spec.ts` |

## Gherkin anchors

- FR-AUTH-002 (allowed/denied), FR-AUTH-003 (suspended), FR-AUTH-005 (deletion) in
  `docs/01-product/07-acceptance-criteria.md`.
