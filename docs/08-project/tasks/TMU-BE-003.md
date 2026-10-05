---
id: TMU-BE-003
title: ME + preferences handlers (API-ME-01..05)
status: DONE
lane: be
slug: be-me
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-002]
refs: [BE-03, API-ME-01..05, FR-AUTH-004, FR-AUTH-005, FR-NTF-006]
created: 2026-10-03
updated: 2026-10-04
---

# TMU-BE-003 — ME + preferences handlers (API-ME-01..05)

## Goal

Thin route handlers + services for `GET/PATCH/DELETE /me` and
`GET/PUT /me/notification-preferences`: `Me` projection (role, status, moderatorCampus),
locale/displayName update with Zod validation, 7-day deletion cool-off scheduling
(`account.delete` job via pg-boss, re-login cancels), prefs read/write. Mappers strip
private fields (`unair_ref`, hint answers, emails of others).

## Acceptance criteria

- [x] `expectMatchesContract` for all five API-ME ids; authn asserted per BE-13.
      — API-ME-01..05 asserted in both unit (`services/me.test.ts`) and live
      (`handlers/me.test.ts`) suites via `loadContractApi()` (see note 2);
      401/403 auth matrix asserted for every endpoint (5× 401 unauth, expired 401,
      suspended 403, CSRF 403×2).
- [x] `DELETE /me` returns 202 + `scheduledAt`; second delete while suspended is idempotent-safe.
      — live tests: first DELETE → 202 + `schedule(runAt=now+7d)` + audit
      `user.deletion.requested {jobId, scheduledAt}`; second DELETE → same
      `scheduledAt`, `schedule` called once, one audit row; suspended DELETE → 403
      `ACCOUNT_SUSPENDED` with zero scheduling.
- [x] `PATCH /me` rejects bad locale/`VALIDATION_FAILED`; prefs PUT round-trips.
      — 422 with `details.fields[0].path = "locale"` / `"mutedTypes.0"`; prefs
      GET-defaults → PUT → DB row → GET round-trip asserted.
- [x] Red tests first; `pnpm gate` green.

## Files changed

- `apps/web/src/app/api/v1/me/route.ts`, `.../me/notification-preferences/route.ts` (re-exports)
- `apps/web/src/server/handlers/{me,me-preferences}.ts` (dispatch wrapper: X-Request-Id →
  requireSessionUser → CSRF for mutations → BE-01 envelope)
- `apps/web/src/server/services/{me,deletion-queue}.ts` (+ tests)
- `apps/web/src/server/repositories/me.ts` (Drizzle: sessions⋈users, prefs upsert, audit, deletion lookup)
- `apps/web/src/server/auth/{request-user,csrf}.ts` (+ tests), `auth/config.ts` (extras.onSignIn)
- `apps/web/src/server/{db,validation,contract-test-utils}.ts`
- `apps/web/src/app/api/auth/[...nextauth]/route.ts` (onSignIn → cancelPendingDeletion, best-effort)
- `apps/web/package.json` (+ `@temuunair/contracts`, `pg-boss`), `pnpm-lock.yaml`

## Progress log

- **2026-10-04 red evidence** — branch `agent/be/TMU-BE-003-be-me`.
  `npx vitest run apps/web/src/server` → `Test Files 5 failed | 6 passed (11)`,
  `Tests 2 failed | 34 passed (36)`: four suites failed `ERR_MODULE_NOT_FOUND`
  (`./me`, `./request-user`, `./deletion-queue`, handlers), `config-signin.test.ts`
  failed `expected undefined to be defined` (`opts.events.signIn` absent). All failures
  were missing-implementation failures, i.e. red for the right reason.
- **2026-10-04 green evidence** — same command after implementation:
  `Test Files 11 passed`, `Tests 85 passed (85)` (20 of them live-scratch-DB handler
  tests). One test-only fix along the way: SQL alias `display_name AS "displayName"`.
- **2026-10-04 gate** — `pnpm gate` (quick, `DATABASE_URL` = local Docker):
  `OK gate(quick) passed` — lane check, format, lint, typecheck, i18n,
  `Test Files 32 passed | Tests 253 passed`, `contracts:check OK (version 1.1.0)`,
  `contracts:lint OK`, `db:check: ok`, ML `7 passed`.

## Notes for reviewers

1. **Contract observations (contract-lane follow-up, not fixed here):** the generated
   OpenAPI (`BE-02`) declares only `"200"` as success for API-ME-03 and declares no
   `403` responses, while BE-03/BE-09/AC mandate `202 + {scheduledAt}` and CSRF
   failures with `FORBIDDEN`. Implemented per BE-03/BE-09 (202 + 403); recommend a
   `TMU-CTR-*` follow-up to regenerate the OpenAPI response sets.
2. **`expectMatchesContract` loading:** test files under `apps/web/src` are typechecked
   by `tsconfig.test.json`, which does not enable `allowImportingTsExtensions`, and
   every module in `packages/contracts/src` imports siblings with explicit `.ts`
   specifiers → a static import fails `pnpm typecheck` with TS5097 (root
   `tsconfig*.json` is ops-lane, not editable here). `server/contract-test-utils.ts`
   therefore loads `testing`/`registry` through non-literal dynamic imports (tsc skips
   them; vite-node resolves them at runtime), so assertions still run against the real
   merged schemas. If ops later opts into `allowImportingTsExtensions` for tests, this
   helper can be deleted.
3. **`mutedTypes` is stricter than the contract schema** (contract: `z.array(z.string())`;
   service: `z.array(z.enum(NotificationType))` → 422 `VALIDATION_FAILED`, which the
   contract does declare for API-ME-05). Mirrors BE-08's known notification types.
4. **Deletion state** lives in `audit_logs` (`user.deletion.requested.after.jobId`) —
   there is no dedicated column; cancel stores `user.deletion.cancelled`. pg-boss
   dedupe uses queue `policy: "short"` + `singletonKey: userId` (BE-07 one-per-user);
   cancel is by job id (pg-boss has no find-by-key).
5. **Re-login cancels** via Auth.js `events.signIn` → `cancelPendingDeletion`
   (best-effort, `logger.warn` on failure) — wired in the route module so
   `auth/config.ts` stays free of db/queue imports.
6. **Environment:** the session-level `DATABASE_URL` points at a remote Render
   instance; live tests must run with the local Docker URL
   (`postgresql://temuunair:temuunair@localhost:5432/temuunair`). Stray `tmu_*`
   scratch databases on both instances were cleaned up during this task.
