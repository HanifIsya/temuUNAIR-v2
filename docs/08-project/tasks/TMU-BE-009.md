---
id: TMU-BE-009
title: Test GET/POST dispatch in the next-auth catch-all route (TMU-FE-003 n-11)
status: TODO
lane: be
slug: be-nextauth-dispatch-test
milestone: M3
priority: P3
owner: backend-dev
deps: [TMU-BE-002]
refs: [BE-09, BE-13, TMU-FE-003]
created: 2026-10-05
updated: 2026-10-05
---

# TMU-BE-009 — Test GET/POST dispatch in the next-auth catch-all route

## Goal

Give `apps/web/src/app/api/auth/[...nextauth]/route.ts` the test it never had (review
n-11 of TMU-FE-003, cycle 2 MINOR). The route was repaired under a human-authorized
one-file lane exception (`blockers/BLK-006.md`): `NextAuth()` in next-auth
`5.0.0-beta.29` returns a plain object, so the handler must destructure `{ handlers }`
and dispatch `handlers.POST`/`handlers.GET` by `request.method`. Nothing today asserts
that dispatch — grep finds zero test references to the route — so a regression (e.g.
calling the result object again) would only surface as a CI type error or a runtime
`TypeError` on every `/api/auth/*` request.

## Context

- Finding source: `docs/08-project/reviews/TMU-FE-003.md` § New findings, n-11
  (rated MINOR: both the defect and the missing test predate that diff, and a test under
  `app/api/**` needs a be-lane file — which is why it was filed as this task rather than
  added in the FE task).
- Route shape after the fix: `const { handlers } = NextAuth(...)`; wrapper takes a
  `NextRequest`; `request.method === "POST" ? handlers.POST(request) : handlers.GET(request)`.
- Auth/session contract: `docs/04-contracts/backend/BE-09-auth-session-contract.md`.

## Acceptance criteria

- [ ] Red test first: invoking the exported route handlers with a POST and a GET request
  reaches `handlers.POST` / `handlers.GET` respectively (mock or spy on the next-auth
  result; assert method-based dispatch, not just that the route exists).
- [ ] Unknown/unexpected method handling matches the implementation's intent (document
  whichever behaviour is asserted).
- [ ] Contract tests / `pnpm gate` green; no behaviour change beyond what `BLK-006.md`
  authorized.

## Files expected to change

- `apps/web/src/app/api/auth/[...nextauth]/route.test.ts` (or the repo's established
  route-test location — check how other `app/api` routes are tested before choosing)
- matching fixtures/mocks
- `docs/08-project/tasks/TMU-BE-009.md`

## Progress log

| Date | Actor | Step | Notes |
|---|---|---|---|
| 2026-10-05 | frontend-dev | 0 filed | Created from TMU-FE-003 review cycle 2 finding n-11 (APPROVE, four MINORs filed per DoD). Not started. |
