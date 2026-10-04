---
id: TMU-BE-004
title: Upload handshake (API-UPL-01..03) — presign, validation, complete
status: TODO
lane: be
slug: be-uploads
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-003]
refs: [BE-03, BE-10, API-UPL-01..03, ARCH-MEDIA]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-BE-004 — Upload handshake (API-UPL-01..03) — presign, validation, complete

## Goal

Implement the two-step presigned handshake per `BE-10`: `POST /uploads` (mime allowlist,
8 MB cap, per-user quota, unguessable `uploads/{uuid}` key, 5-min PUT URL, idempotency),
`POST /uploads/{id}/complete` (HEAD verify, magic-byte check via `sharp`, EXIF strip —
rejection if stripping fails, thumbnail, `READY`/`REJECTED` status) and
`GET /uploads/{id}` (owner only, `NOT_FOUND` otherwise).

## Acceptance criteria

- [ ] Contract tests for the three API-UPL ids incl. `UPLOAD_INVALID_TYPE`/`UPLOAD_TOO_LARGE`/`RATE_LIMITED` error shapes.
- [ ] Completing a non-owned upload is `NOT_FOUND`; double-complete is idempotent.
- [ ] EXIF GPS never persisted (privacy check on stored object).
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/api/v1/uploads/**`, `apps/web/src/server/storage/*`, `apps/web/src/server/services/uploads.ts`
- matching tests
- `docs/08-project/tasks/TMU-BE-004.md`
