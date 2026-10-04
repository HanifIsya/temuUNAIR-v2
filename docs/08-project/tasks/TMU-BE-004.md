---
id: TMU-BE-004
title: Upload handshake (API-UPL-01..03) — presign, validation, complete
status: DONE
lane: be
slug: be-uploads
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-003]
refs: [BE-03, BE-10, API-UPL-01..03, ARCH-MEDIA]
created: 2026-10-03
updated: 2026-10-04
---

# TMU-BE-004 — Upload handshake (API-UPL-01..03) — presign, validation, complete

## Goal

Implement the two-step presigned handshake per `BE-10`: `POST /uploads` (mime allowlist,
8 MB cap, per-user quota, unguessable `uploads/{uuid}` key, 5-min PUT URL, idempotency),
`POST /uploads/{id}/complete` (HEAD verify, magic-byte check via `sharp`, EXIF strip —
rejection if stripping fails, thumbnail, `READY`/`REJECTED` status) and
`GET /uploads/{id}` (owner only, `NOT_FOUND` otherwise).

## Acceptance criteria

- [x] Contract tests for the three API-UPL ids incl. `UPLOAD_INVALID_TYPE`/`UPLOAD_TOO_LARGE`/`RATE_LIMITED` error shapes.
      → `apps/web/src/server/handlers/uploads.test.ts`: `expectMatchesContract("API-UPL-01"|…-02|…-03)`; error tests
      415/413/429 (`RATE_LIMITED` + `Retry-After`), 422 missing `Idempotency-Key`, 409 `IDEMPOTENCY_CONFLICT`.
- [x] Completing a non-owned upload is `NOT_FOUND`; double-complete is idempotent.
      → "hides a foreign upload with 404" (row stays `PENDING`), "is idempotent once the upload is READY"
      (no second processing pass), malformed id and never-uploaded object → `NOT_FOUND`.
- [x] EXIF GPS never persisted (privacy check on stored object).
      → fixture injected with `withExif({ IFD3: GPS… })`; after complete, `sharp(stored).metadata().exif`
      is `undefined` on both original and thumb.
- [x] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/api/v1/uploads/**`, `apps/web/src/server/storage/*`, `apps/web/src/server/services/uploads.ts`
- matching tests
- `docs/08-project/tasks/TMU-BE-004.md`

## Actual files changed

- `apps/web/src/server/storage/index.ts` — `StorageClient` + lazy S3 implementation
  (presign PUT/GET via `@aws-sdk/s3-request-presigner`, `head`/`get`/`put`/`delete`,
  404 → `null`).
- `apps/web/src/server/services/uploads.ts` — `initUpload` / `completeUpload` / `getUploadState`,
  `magicMatchesMime`, limits (`ALLOWED_UPLOAD_MIME`, `MAX_UPLOAD_BYTES = 8 MB`,
  `PRESIGN_TTL_SECONDS = 300`, `MIN_SHORTEST_SIDE = 320`, `THUMB_MAX_SIDE = 480`).
- `apps/web/src/server/repositories/uploads.ts` — `PgUploadsRepository` on `report_images`
  (`report_id` stays `NULL` until a report attaches the image; no migration needed).
- `apps/web/src/server/handlers/uploads.ts` — `POST` (init), `COMPLETE`, `GET_BY_ID`.
- `apps/web/src/server/handlers/dispatch.ts` — shared wrapper moved out of `handlers/me.ts`
  (re-exported there; adds `Retry-After` on `RATE_LIMITED`, BE-01).
- `apps/web/src/server/idempotency.ts` + test — BE-01 key/body-hash replay, 24 h window.
- `apps/web/src/server/rate-limit.ts` + test — BE-12 fixed-window counters,
  `UPLOAD_INIT_RATE = 30/hour`, `RATE_LIMIT_ENABLED` kill-switch.
- Routes: `app/api/v1/uploads/route.ts`, `app/api/v1/uploads/[id]/route.ts`,
  `app/api/v1/uploads/[id]/complete/route.ts` (thin re-exports).
- `apps/web/package.json` + `pnpm-lock.yaml` — added `sharp`, `@aws-sdk/client-s3`,
  `@aws-sdk/s3-request-presigner`.
- Tests: `handlers/uploads.test.ts` (22 live), `idempotency.test.ts` (5),
  `rate-limit.test.ts` (7).

## Progress log

- 2026-10-04 — **picked** via `next-task.mjs`; DoR checked: deps DONE (TMU-BE-003 merged),
  contract entries merged (v1.1.0), AC present, lane covers every file, MinIO dev creds in
  `.env.example`.
- 2026-10-04 — research: `report_images.report_id` is nullable → doubles as the upload-state
  store (ARCH-MEDIA: "Status … on `report_images.status`"), so no db-lane change was needed.
  Contract `UploadState.thumbUrl` is `nullable().optional()` → PENDING returns `null` per
  BE-01 "absent optional values are null".
- 2026-10-04 — **red evidence**: `pnpm --filter web exec vitest run src/server/handlers/uploads.test.ts
  src/server/idempotency.test.ts src/server/rate-limit.test.ts` →
  `Test Files 3 failed (3)` / `Tests no tests` with
  `Cannot find module './uploads' | './idempotency' | './rate-limit'` (production modules absent).
- 2026-10-04 — green: `pnpm exec vitest run apps/web/src/server/handlers/uploads.test.ts
  apps/web/src/server/idempotency.test.ts apps/web/src/server/rate-limit.test.ts` →
  `Test Files 3 passed (3)` / `Tests 34 passed (34)`.
  (Note: live DB tests must run from the repo root — `migrationsFolder: "packages/db/migrations"`
  resolves against cwd.)
- 2026-10-04 — `pnpm gate` → `OK gate(quick) passed`: `Test Files 35 passed`, `Tests 287 passed`,
  `contracts:check OK (version 1.1.0)`, `contracts:lint OK`, `db:check: ok`, ML `7 passed`.

## Contract observations (for a future `TMU-CTR-*`, not changed here)

1. Registry `API-UPL-01.errors` omits `VALIDATION_FAILED` (missing `Idempotency-Key`) and
   `IDEMPOTENCY_CONFLICT`, both required by BE-01; `API-UPL-02` behaves analogously.
2. BE-10's `UploadState` prose example (`url`, `masked`, `rejectionReason`) and
   `examples.ts` UPL-02 (`uploadUrl`, `expiresAt`) do not match the merged Zod `UploadState`
   (`id/status/mime?/sizeBytes?/thumbUrl?/maskedUrl?/createdAt?`) — the Zod schema was treated as law.
3. `UploadState.sizeBytes` is optional and `report_images` has no size column → omitted.
4. S3 presigned PUT cannot bind `Content-Length` range (POST policy feature) → size is enforced
   at init (413) and re-checked at complete via HEAD; oversize at complete returns
   `200 REJECTED` because registry UPL-02 declares no 413.
5. Idempotency and rate-limit stores are in-memory (no tables in BE-05) → single-instance
   limitation, documented here.
6. `_masked.jpg` is not produced at complete time: sensitivity is only known when a report
   attaches the image (worker task, out of scope).

## Definition of Done

See `docs/05-workflow/05-definition-of-ready-done.md`. Evidence: red/green commands + gate
tail above; review verdict in `docs/08-project/reviews/TMU-BE-004.md`.
