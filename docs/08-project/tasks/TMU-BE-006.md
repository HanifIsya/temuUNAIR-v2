---
id: TMU-BE-006
title: Report create/read (API-REP-01/02/04) with visibility and masking mappers
status: DONE
lane: be
slug: be-report-create-read
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-004, TMU-BE-005]
refs: [BE-03, BE-05, ARCH-STATES, API-REP-01, API-REP-02, API-REP-04, FR-REP]
created: 2026-10-03
updated: 2026-10-04
---

# TMU-BE-006 — Report create/read (API-REP-01/02/04) with visibility and masking mappers

## Goal

The walking-skeleton report path: `POST /reports` (`ReportCreate` Zod cross-field rules —
FOUND requires ≥1 READY image + custody + ≥1 hint / ≥2 sensitive; LOST forbids
custody/hints; 180-day window), enqueue `report.process`; `GET /reports` (opposite-type
default, visibility exclusions, browse filters, keyset pagination, ≤50) and
`GET /reports/{id}` returning the correct view shape (public / owner / moderator) with
sensitive masking applied **in the mapper** — `isSensitive` items never leak original URLs,
geo or raw description.

## Acceptance criteria

- [x] `expectMatchesContract` for the three API-REP ids; authn + ownership asserted per BE-13.
      → `handlers/reports.test.ts`: contract parses for REP-01 (create), REP-02 (browse page,
      twice: default + first pagination page), REP-04 (owner view + moderator view); 401
      `AUTH_REQUIRED` on all three routes unauthenticated; 403 `FORBIDDEN` on POST without
      CSRF; moderator access asserted campus-scoped (KAMPUS_A yes / KAMPUS_B no) + admin.
- [x] Cross-field validation matrix as tests (TC-REP set); enqueue verified on create.
      → 21 POST tests: no-image/no-custody/no-hints (TC-REP-002/003, FR-REP-001), sensitive
      1-vs-2 hints (TC-REP-004), LOST forbids custody/hints (TC-REP-005), LOST w/o images
      (TC-REP-006), future `occurredAt.from` (TC-REP-007), 180-day window + FOUND older
      accepted (TC-REP-008), bounds (TC-REP-009), >5 images → 409 `UPLOAD_LIMIT_REACHED`
      (TC-REP-011), foreign/PENDING/linked uploads (TC-REP-010), custody×drop-point
      matrix (FR-REP-004), unknown locationId/campus/category enums, >3 hints
      (FR-REP-005), `to < from`, title/description bounds; idempotency replay (no second
      enqueue) + 409 `IDEMPOTENCY_CONFLICT` (TC-REP-013/014); enqueue called with the
      created id, encrypted-at-rest hint answer round-trips through
      `decryptFieldAnswer`, enqueue failure still 201; 4th create/hour → 429 with
      `Retry-After` (BE-12 3/hour + 10/day).
- [x] Hidden statuses and non-party own-reports excluded from browse; masked for others.
      → browse tests: default = opposite-type contract page (no `version` on items),
      all 6 non-browsable statuses hidden, own reports excluded, `?type=` overrides the
      default and the intent switch (FR-SRC-001), 422 on bad type/campus/category/limit/
      cursor/dateFrom, campus+category+date-window+custody filters, keyset cursor
      pagination (2+1 pages, `hasMore`, opaque cursor), sensitive title/description/
      original URL masked with `_masked.jpg` thumb for others (FR-REP-009); detail:
      owner raw text + original URL, REMOVED → 404 for others but 200 for owner,
      PENDING_REVIEW readable by link.
- [x] Red tests first; `pnpm gate` green.
      → red: `Test Files 2 failed (2)` / `Tests no tests` / `Cannot find module './report-queue'`;
      green: `48 passed (48)`; `OK gate(quick) passed` (347 unit tests, contracts 1.1.0,
      db:check ok, ML 7/7).

## Files expected to change

- `apps/web/src/app/api/v1/reports/**/route.ts`, `apps/web/src/server/services/reports.ts`, repositories, mappers
- matching tests
- `docs/08-project/tasks/TMU-BE-006.md`

## Actual files changed

- `apps/web/src/server/services/field-crypto.ts` — AES-256-GCM `encryptFieldAnswer` /
  `decryptFieldAnswer` (`iv(12) || tag(16) || ciphertext`, base64 32-byte key check).
- `apps/web/src/server/services/report-queue.ts` — `report.process` pg-boss wrapper
  (`singletonKey=reportId`, `retryLimit: 3`, `expireInSeconds: 30`, queue policy
  `standard`, memoized `ensure()`; structural `ReportBossLike` for fakes).
- `apps/web/src/server/services/report-mapper.ts` — pure mappers:
  `buildReportImages` (non-privileged sensitive → `url: null`, presigned `masked_key`
  thumb, `isMasked: true`; never presigns the original), `mapReportPublic`
  (generalizes sensitive title/description, drops null optionals), `mapReportOwner`,
  `mapReportModerator`.
- `apps/web/src/server/services/reports.ts` — `reportCreateSchema` + cross-field rules,
  `parseBrowseQuery` (zod over `URLSearchParams`, 1..50 limit default 20, opaque base64url
  keyset cursor), `createReport` (zod → 409 >5 images → rate limits inside idempotency →
  cross-field → DB lookups → transaction insert → non-fatal enqueue → owner view),
  `listReports` (default type = opposite of active intent, else FOUND), `getReportView`
  (owner / moderator-scope / public selection, REMOVED → 404 for non-privileged),
  status constants `BROWSE_VISIBLE_STATUSES` / `ACTIVE_INTENT_STATUSES`.
- `apps/web/src/server/repositories/reports.ts` — `PgReportsRepository`: intent lookup,
  browse query with row-value keyset comparison `(created_at, id) < (?, ?)`, detail join
  for `locationName`/`dropPointName`, hint prompts, match/claim/flag counts, attachable
  upload validation, transactional `createReport` (report + encrypted hints + image
  attachment with positions).
- `apps/web/src/server/handlers/reports.ts` — `POST` (JSON body, required
  `Idempotency-Key` → 422 path `Idempotency-Key`, body hash, idempotency store run,
  201), `GET_LIST`, `GET_BY_ID` via the shared `dispatch`.
- Routes: `app/api/v1/reports/route.ts` (POST+GET), `app/api/v1/reports/[id]/route.ts` (GET).
- `apps/web/src/server/config.ts` — added `parseReportConfig()` (Zod `pick` of
  `FIELD_ENCRYPTION_KEY` + `REPORT_TTL_DAYS`); handlers still never read `process.env`.
- `apps/web/src/server/rate-limit.ts` — `REPORT_CREATE_RATES` (3/hour + 10/day) and
  `getReportLimiter()` singleton (BE-12).
- `apps/web/src/server/handlers/dispatch.ts` — `DispatchInput` now carries `role` +
  `moderatorCampus` (needed for REP-04 view selection; additive, existing callers ignore).
- Tests: `apps/web/src/server/handlers/reports.test.ts` (44 live tests, scratch DB + M3
  seeds), `apps/web/src/server/services/report-queue.test.ts` (4 tests, structural fake).

## Progress log

- 2026-10-04 — **picked** via `next-task.mjs`; DoR checked: deps DONE (TMU-BE-004 `ff10b2e`,
  TMU-BE-005 `405d74c`), contract entries merged (v1.1.0), AC present, lane covers every file.
- 2026-10-04 — research: DDL `0003_reports.sql` (CHECK `(type='FOUND') = (custody IS NOT
  NULL)`), BE-03 view rules (public/owner/moderator, REP-02 visibility + intent default),
  BE-12 dual limits, BE-01 idempotency, FR-REP-001..010 Gherkin, TC-REP matrix. Design
  decisions logged below.
- 2026-10-04 — **red evidence**: `pnpm exec vitest run apps/web/src/server/handlers/reports.test.ts
  apps/web/src/server/services/report-queue.test.ts` → `Test Files 2 failed (2)` /
  `Tests no tests` / `Cannot find module './report-queue'`.
- 2026-10-04 — green (1st run after writing impl): `26 failed | 22 passed` — root cause of
  every POST 500: `parseConfig(process.env)` demands the full boot env (AUTH_*, S3_*,
  SMTP_URL…) which tests never set. Fixed by adding `parseReportConfig()` (narrow Zod
  `pick`, reuses the same rules) instead of widening test env.
- 2026-10-04 — 2 remaining failures were **test bugs**, not product bugs: (a) the replay
  test built the body twice and `isoDaysAgo()` embeds `Date.now()`, so "same key+body"
  was never byte-identical → 409; fixed by reusing one body object. (b) the own-reports
  test used a random `OWN…` marker as `?category=`, which the (correctly) enum-validated
  category filter rejects → 422; fixed by using the valid `OTHER` category. Assertions
  unchanged.
- 2026-10-04 — green: same command → `Test Files 2 passed (2)` / `Tests 48 passed (48)`.
- 2026-10-04 — first `pnpm gate` failed lint (3 unused symbols → exported the two status
  constants and used them in the repository, dropped an unused type import); second gate
  failed typecheck: real `StorageClient.presignGet(key, expiresInSeconds)` arity and
  pg-boss `Queue.policy` union (mirrored the `QueuePolicy` pattern from
  `deletion-queue.ts`); third gate failed on literal widening of `QUEUE_POLICY` inside an
  object literal (annotated `options`).
- 2026-10-04 — `pnpm format` + `pnpm gate` → `OK gate(quick) passed` (format, lint,
  typecheck, i18n, 347 unit tests incl. 48 new, contracts:check OK 1.1.0,
  contracts:lint OK, db:check: ok, ML 7/7).

## Decisions and interpretations (not specified by the docs)

1. **Intent fallback**: no active report → browse defaults to `FOUND` (AC FR-SRC-001
   plain user sees found items); `FOUND` intent → `LOST`; explicit `?type=` always wins.
2. **Active intent** = the caller's latest report with status `OPEN | MATCHED |
   IN_VERIFICATION`.
3. **Sensitive generalization** algorithm is unspecified in FE/BE docs → constant
   Indonesian strings in the mapper: title `"Barang sensitif"`, description
   `"Deskripsi disamarkan untuk melindungi privasi pelapor."` (masked thumb comes from the
   async `masked_key` job; until then a sensitive report shows no original URL at all).
4. **PENDING_REVIEW detail stays readable** by link (browse-only exclusion; matches the
   status-matrix test); **REMOVED → 404** for non-owner/non-privileged.
5. **Rate check runs inside the idempotency `run`** so replays don't consume quota;
   gated by `isRateLimitEnabled()` per call (test toggles the env).
6. **Enqueue is post-commit and non-fatal**: a `report.process` failure logs `warn` and
   the create still returns 201 (no duplicate report; sweep/reprocess handles the miss).
7. **`flagCount`** counts `flags.status = 'OPEN'` only (actionable moderation queue).
8. **`hintPrompts`** ordered by prompt ascending — `verification_hints` has no
   created_at/position column to order by.
9. **`q`/`sort` browse params deliberately not implemented** — absent from FR-SRC-002
   (the only browse filter source); adding them needs a contract/FR update first.

## Contract observations (for a future `TMU-CTR-*`, not changed here)

1. `API-REP-04` response (via `TC-REP-023`) has no `geo`/`lat` fields even for owner/
   moderator views — `lat`/`lng` columns exist; FE location display must rely on
   `campus`/`locationName` only.
2. The sensitive-title/description generalization algorithm is not specified anywhere in
   `docs/` — implemented as documented constants above.
3. `ReportQuery` is not a registered schema: REP-02 query params (type, campus[],
   category[], dateFrom/dateTo, custody, limit, cursor) are typed only by this
   implementation + BE-03 prose.
4. Registry `API-REP-01.errors` omits `IDEMPOTENCY_CONFLICT` (409) even though BE-01
   requires the header and defines the conflict.

## Definition of Done

See `docs/05-workflow/05-definition-of-ready-done.md`. Evidence: red/green commands + gate
tail above; review verdict in `docs/08-project/reviews/TMU-BE-006.md`.
