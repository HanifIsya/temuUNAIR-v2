---
id: TMU-BE-008
title: Ops hardening — idempotency + rate-limit middleware (BE-01, BE-12)
status: DONE
lane: be
slug: be-ops-hardening
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-007]
refs: [BE-01, BE-12, BE-13, NFR]
created: 2026-10-03
updated: 2026-10-05
---

# TMU-BE-008 — Ops hardening — idempotency + rate-limit middleware (BE-01, BE-12)

## Goal

Close the M2-exit handoff items in the API surface: `Idempotency-Key` + fingerprint
middleware per BE-01 (replay-safe mutations — create-report today, claim mutations when
they land), and `BE-12` per-endpoint rate limiters returning `RATE_LIMITED` with
`Retry-After`, wired across the implemented routes.

Scope note: the Schemathesis/`run-contract.mjs` half of the original goal moved to the
qa-lane follow-up **TMU-QA-001** (BLK-003 split — `tests/contract/**` is qa-owned).

## Acceptance criteria

- [x] Replay of a stored idempotent success returns the original payload; conflicting fingerprint → 409.
- [x] Rate-limit middleware returns 429 + `Retry-After` per BE-12 tiers; limiter keyed per contract.
- [x] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/server/middleware/*`, `apps/web/src/app/api/v1/**` (wiring only, no behaviour change)
- matching tests
- `docs/08-project/tasks/TMU-BE-008.md`

## Actual files changed

- `apps/web/src/server/middleware/idempotency.ts` (new) — `readJsonBody` (422
  `VALIDATION_FAILED` + `fields: []` on non-JSON), `requireIdempotencyKey` (missing header →
  422 with `fields: [{path: "Idempotency-Key", key: "error.VALIDATION_FAILED.Idempotency-Key"}]`),
  `fingerprint` (sha256 of the raw body text), `withIdempotency` (delegates to the existing
  `getIdempotencyStore().run` — 24 h replay, 409 `IDEMPOTENCY_CONFLICT` on differing hash,
  failed attempts not stored).
- `apps/web/src/server/middleware/rate-limit.ts` (new) — `RateTier`, module-level
  `endpointLimiter`, `withRateLimit(rates, subject, fn)` (checks every tier before running),
  `ipSubjectFor` (HMAC-SHA256 of the IP with `AUTH_SECRET`, `null` when unset),
  `enforceGlobalIpRate` / `enforceAuthIpRate` (skip when disabled / no `x-forwarded-for` /
  no secret), `rateLimited()` logs `logger.warn({ scope })` — scope only, never the address.
- `apps/web/src/server/middleware/idempotency.test.ts` (new, 11 tests) + `rate-limit.test.ts`
  (new, 11 tests) — unit coverage per BE-13 #8/#9 (replay, 409, subject isolation, failed
  attempt not stored; tier throw + scope in details + logging spy; HMAC hashing; disabled
  skip; global/auth IP enforcement incl. exhausted-tier 429).
- `apps/web/src/server/rate-limit.ts` — added `GLOBAL_IP_RATE` (`global.ip`, 300/min),
  `AUTH_IP_RATE` (`auth.ip`, 20/min), `getGlobalIpLimiter()`, `getAuthIpLimiter()`;
  `UPLOAD_INIT_RATE` gained `scope: "uploads:init"` (the string the service already keyed on);
  removed now-unused `getReportLimiter()`/`getUploadLimiter()` singletons.
- `apps/web/src/server/handlers/dispatch.ts` — `enforceGlobalIpRate(request)` as the first
  statement inside the try (before auth), so every `/api/v1/**` route gets the 300/min IP
  tier and the existing catch maps it to 429 + `Retry-After`.
- `apps/web/src/server/handlers/reports.ts` — POST now composes
  `readJsonBody → requireIdempotencyKey → withIdempotency(scope "POST /api/v1/reports")
  → withRateLimit(REPORT_CREATE_RATES, userId) → createReport`; `limiter` /
  `isRateLimitEnabled` dropped from the service deps.
- `apps/web/src/server/handlers/uploads.ts` — same composition for `POST /uploads`
  (zod parse still before the key check), scope `"POST /api/v1/uploads"`, rate tier
  `[UPLOAD_INIT_RATE]`; `limiter` dropped from all three deps objects.
- `apps/web/src/server/services/reports.ts` / `services/uploads.ts` — the in-service rate
  blocks removed (now middleware's job); `CreateReportDeps` lost `limiter`/`isRateLimitEnabled`,
  `UploadDeps` lost `limiter`.
- `apps/web/src/app/api/auth/[...nextauth]/route.ts` — GET/POST wrapped in
  `withAuthRateLimit`, which runs `enforceAuthIpRate` and maps a thrown `RATE_LIMITED` to the
  BE-01 envelope with `Retry-After` (the route sits outside `dispatch`, so without this a
  429 would surface as a 500).
- `apps/web/src/server/handlers/reports.test.ts` — one new test: exhausting the
  `global.ip` tier returns 429 + `Retry-After` with no auth needed (uses the `forwardedFor`
  option added to the local `createRequest` helper).
- Note: no `apps/web/src/app/api/v1/**` route file changed — wiring happens in the handlers
  the route files re-export (the expected-files note said "wiring only").
- `docs/08-project/tasks/TMU-BE-008.md` (this file), `docs/08-project/reviews/TMU-BE-008.md`.

## Progress log

- 2026-10-04 — DoR check #6 failed: AC "run-contract.mjs boots the real app" needed
  `tests/contract/run-contract.mjs`, a **qa-lane** file → stopped, filed **BLK-003**
  (task was briefly marked BLOCKED). Resolution (both options executed on human
  instruction): split — this task trimmed to the be-lane half, `TMU-QA-001` filed for
  the contract-runner half; plus an ops lane-map change granting `be` access to
  `tests/contract/**` for future tasks (TMU-OPS-036, `41e3982`). Status back to TODO;
  ready to start.
- 2026-10-04 — picked via `next-task --lane be` on branch
  `agent/be/TMU-BE-008-be-ops-hardening`; research: BE-01 idempotency section, BE-12 table
  + rules, BE-13 #8/#9, current dispatch/handlers/services/rate-limit/auth-route/tests.
- 2026-10-05 — **red evidence** (`$env:TEMP\be008-red.txt`): the two new middleware test
  files + the extended reports suite were written first;
  `pnpm exec vitest run apps/web/src/server/middleware apps/web/src/server/handlers/reports.test.ts`
  → `Test Files 3 failed (3)` / `Tests no tests` with
  `Cannot find module './idempotency' | './rate-limit' | '../middleware/rate-limit'`
  (implementation modules absent — failing for the right reason).
- 2026-10-05 — green: middleware + wiring written. First run 2 failures in
  `idempotency.test.ts` — **test bug**: tests shared one `opts.key`, so later tests
  replayed earlier tests' stored entries against the module-level store → switched to
  per-test unique keys (`freshOpts()` with `randomBytes`), assertions unchanged.
  Re-run: middleware + both handler suites `4 passed (4)` / `89 passed (89)`.
- 2026-10-05 — full server suite: `Test Files 19 passed (19)` / `Tests 202 passed (202)`;
  grep confirms no stale `getReportLimiter`/`getUploadLimiter`/`limiter:` deps anywhere.
- 2026-10-05 — auth route hardening: `enforceAuthIpRate` throws `DomainError`, but the
  NextAuth route sits outside `dispatch`'s catch → wrapper now maps the error to the BE-01
  envelope + `Retry-After` exactly like `dispatch` does (otherwise a 429 became a 500).
- 2026-10-05 — `pnpm format` + `pnpm gate` → `OK gate(quick) passed` (lane, format, lint,
  typecheck, i18n, **46 files / 416 unit tests** — 393 → 416, +23 new, contracts:check
  OK 1.1.0, contracts:lint OK, db:check: ok, ML ruff + 7/7).

## Decisions and interpretations (not specified by the docs)

1. **Composition order: idempotency (outer) → rate limit (inner).** A replayed response
   must not consume rate quota (it was stored under the old in-service ordering too), and
   a request rejected by the limiter must not be stored as a "replayed" success.
2. **Rate checks moved from the services to the middleware**, so a client that is already
   over quota now gets 429 *before* 422/415 validation on the same request (previously
   `createReport` checked after `parseReportCreate`, `initUpload` after mime/size checks).
   Throttle-first is cheaper under abuse; neither contract states the ordering.
3. **IP subject = HMAC-SHA256(ip, `AUTH_SECRET`)**, and enforcement is *skipped* when
   `AUTH_SECRET` is unset (unit tests) — BE-12 says "ipHash" without specifying a method;
   no new env var was added (BE-11's closed list). The HMAC key is never logged.
4. **Auth tier wired only at `/api/auth/[...nextauth]`** — the only auth surface that
   exists; the global 300/min tier is not double-applied there because 20 < 300 subsumes it.
5. **Global 300/min runs in `dispatch` before auth**, covering every `/api/v1/**` route
   (all v1 routes already require a session; the subject is still the IP hash per BE-12
   rule 1, so unauthenticated probing is limited too).
6. **`getReportLimiter`/`getUploadLimiter` removed** — the middleware owns its own
   module-level `endpointLimiter`; keeping two unused singletons would invite drift.
7. **Missing `Idempotency-Key` field error unified** to
   `{path: "Idempotency-Key", key: "error.VALIDATION_FAILED.Idempotency-Key"}` for both
   endpoints (the uploads handler previously emitted `path` only).
8. **No idempotency on `POST /uploads/{id}/complete`** — BE-01's rule names the literal
   `POST /uploads`; revisit when the claims endpoints land (BE-01 also lists `POST /claims`,
   which does not exist yet).
9. **429 logging carries `scope` only** (never IP, user id, or key) per BE-12 rule 4 and
   the project privacy rule; details on the error body are `{scope, retryAfterSeconds}`.

## Contract observations (for a future `TMU-CTR-*`, not changed here)

1. BE-12 says the counters are "Postgres-backed (DEC-013)", but the implementation is
   in-memory per process — a restart or multiple instances lose/fragment counters
   (`createRateLimiter` has no persistence). Needs a contract decision.
2. BE-12's "Auth endpoints (IP)" tier does not enumerate the paths; only
   `/api/auth/[...nextauth]` exists today — future auth routes must opt in.
3. BE-12 does not specify the `ipHash` method (HMAC-SHA256 + `AUTH_SECRET` chosen,
   decision 3).
4. Neither BE-01 nor BE-12 states whether rate limiting runs before or after request
   validation (decision 2).
5. BE-01 lists `POST /claims` as idempotent but no claim routes exist yet.

## Definition of Done

See `docs/05-workflow/05-definition-of-ready-done.md`. Evidence: red/green/gate commands
in the Progress log above; review verdict in
`docs/08-project/reviews/TMU-BE-008.md`.
