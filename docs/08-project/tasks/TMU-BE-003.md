---
id: TMU-BE-003
title: ME + preferences handlers (API-ME-01..05)
status: TODO
lane: be
slug: be-me
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-002]
refs: [BE-03, API-ME-01..05, FR-AUTH-004, FR-AUTH-005, FR-NTF-006]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-BE-003 — ME + preferences handlers (API-ME-01..05)

## Goal

Thin route handlers + services for `GET/PATCH/DELETE /me` and
`GET/PUT /me/notification-preferences`: `Me` projection (role, status, moderatorCampus),
locale/displayName update with Zod validation, 7-day deletion cool-off scheduling
(`account.delete` job via pg-boss, re-login cancels), prefs read/write. Mappers strip
private fields (`unair_ref`, hint answers, emails of others).

## Acceptance criteria

- [ ] `expectMatchesContract` for all five API-ME ids; authn asserted per BE-13.
- [ ] `DELETE /me` returns 202 + `scheduledAt`; second delete while suspended is idempotent-safe.
- [ ] `PATCH /me` rejects bad locale/`VALIDATION_FAILED`; prefs PUT round-trips.
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/api/v1/me/**/route.ts`, `apps/web/src/server/services/me.ts`, repositories
- matching tests
- `docs/08-project/tasks/TMU-BE-003.md`
