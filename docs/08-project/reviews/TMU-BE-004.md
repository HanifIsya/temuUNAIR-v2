---
id: TMU-BE-004
reviewer: reviewer
verdict: APPROVE
cycle: 1
date: 2026-10-04
---

# Review — TMU-BE-004

## Checklist

| # | Check | Result |
|---|---|---|
| 1 | Red tests existed first and failed for the right reason (3× `Cannot find module './uploads' \| './idempotency' \| './rate-limit'`, `Tests no tests`) | PASS |
| 2 | All new/updated tests pass; full `pnpm gate` green (287/287 unit, 35 files) | PASS |
| 3 | Contract tests for every touched API: `expectMatchesContract` on API-UPL-01, API-UPL-02, API-UPL-03 (live scratch-DB suite) incl. `UPLOAD_INVALID_TYPE`/`UPLOAD_TOO_LARGE`/`RATE_LIMITED` error shapes | PASS |
| 4 | Auth/RBAC: 401 unauth init, CSRF 403 (init + complete), owner-only complete/state → 404 `NOT_FOUND` for a foreign upload (row unchanged), malformed id → 404 | PASS |
| 5 | Privacy: EXIF GPS injected via `sharp.withExif({IFD3…})` never persists — stored original and thumb both assert `metadata().exif === undefined`; keys are server-generated UUIDs, no user filenames | PASS |
| 6 | i18n: no new UI strings; `UPLOAD_INVALID_TYPE`/`UPLOAD_TOO_LARGE`/`UPLOAD_LIMIT_REACHED` keys already exist in `id`/`en` | PASS (n/a) |
| 7 | A11y: no UI components touched | PASS (n/a) |
| 8 | Docs: task file status DONE + Progress log with red/green/gate evidence + contract observations; this review | PASS |
| 9 | Generated files in sync (`contracts:check OK 1.1.0`); contract untouched | PASS |
| 10 | Reviewer verdict APPROVE, fresh context, cycle 1 | PASS |
| 11 | Security: presigned PUT scoped to fresh UUID key + exact content-type (signature-bound), complete re-verifies HEAD/size/magic-bytes/sha256 server-side, private bucket + signed GET, 30/h per-user rate limit with `Retry-After`, BE-01 idempotency replay/conflict, no secrets or object bytes logged | PASS |
| 12 | Work in lane (`be` lane globs only: `apps/web/src/server/**`, `apps/web/src/app/api/**`, `apps/web/package.json`, `**/*.test.ts` + `_common` lockfile/docs); lane check green in gate | PASS |

## Notes

- **No migration needed**: `report_images.report_id` is nullable, so pre-report uploads are
  rows with `report_id = NULL` — exactly what ARCH-MEDIA prescribes ("Status … on
  `report_images.status`"). The db lane was not touched.
- **Processing pipeline** (`completeUpload`): HEAD verify (content-type + 8 MB) → sha256
  (when declared) → magic bytes per allowed MIME (incl. HEIC `ftyp` brands) → sharp decode →
  shortest-side ≥ 320 else `200 REJECTED` → `.rotate()` + sRGB JPEG q82 (EXIF dropped by
  default, orientation applied to pixels per DEC-010/ADR-0008) → 480 px q75 thumb →
  `markReady`. Every failure path persists `REJECTED` (or keeps `PENDING` when the object
  simply does not exist yet, so a late PUT can still complete).
- **Double-complete** short-circuits on `status !== "PENDING"` → same state, zero storage
  writes (asserted via `storage.put` call count).
- **Dispatch refactor**: the shared wrapper moved from `handlers/me.ts` to
  `handlers/dispatch.ts` (re-exported, `me-preferences.ts` untouched) because a second
  consumer appeared; it also gained the BE-01 `Retry-After` header for `RATE_LIMITED`.
  Behaviour of the merged ME endpoints is unchanged (their suite still passes).
- **In-memory stores** (idempotency 24 h, rate-limit fixed window) are single-instance by
  design — no tables exist in BE-05; recorded in the task file rather than smuggled into a
  migration.
- **Contract observations** (registry error arrays vs BE-01, BE-10/examples vs the Zod
  `UploadState`, no `size_bytes` column, no 413 on UPL-02) recorded in the task file for a
  `TMU-CTR-*` follow-up; the merged Zod schemas were treated as law.
- Live suite runs against a scratch database (`tmu_be004_*`, migrated via
  `packages/db/migrations`, dropped `WITH (FORCE)`); must be executed from the repo root
  because `migrationsFolder` is cwd-relative.

## Verdict

**APPROVE** — all acceptance criteria met, gate green, no BLOCKER/MAJOR findings.
