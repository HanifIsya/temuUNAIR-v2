---
id: BE-01
title: API conventions
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["CONTRACTS-README", "BE-04"]
source_refs: ["Blueprint §5A.1"]
---

# BE-01 — API conventions

| Topic | Rule |
|---|---|
| Base path | `/api/v1`; JSON UTF-8; `camelCase` in API, `snake_case` in DB |
| IDs | UUIDv7 strings (time-sortable) |
| Time | ISO-8601 with offset in API and DB (`timestamptz`); UI renders `Asia/Jakarta` (WIB) |
| Auth | Session cookie (`httpOnly`, `Secure`, `SameSite=Lax`). Mutations additionally require a same-origin `Origin` check and header `X-Requested-With: temuunair` |
| Pagination | Cursor: `?limit=20&cursor=<opaque>` → `{ data: T[], page: { nextCursor: string \| null, hasMore: boolean } }`; `limit` max 50 |
| Errors | `{ error: { code, message, details?, requestId } }`, `code` from `BE-04`; header `X-Request-Id` on every response |
| Idempotency | `Idempotency-Key` header required on `POST /reports`, `POST /claims`, `POST /uploads`; same key + same body within 24 h returns the original response; same key + different body → `IDEMPOTENCY_CONFLICT` |
| Concurrency | Mutable resources carry `version`; `PATCH` requires `If-Match: <version>` → `409 CONFLICT_STATE` on mismatch |
| Filtering | Query params named after fields; multi-value via repeated params (`?category=PHONE&category=LAPTOP_TABLET`) |
| Sorting | `sort=-createdAt` (prefix `-` = desc); allow-listed fields only |
| Privacy | Never return: hint answers (except to the finder/admin), other users' emails, exact geo of sensitive items, embeddings, internal scores except `band`+`reasons` |
| Rate limits | `BE-12` |
| Uploads | Two-step presigned upload (`API-UPL-*`); ≤5 images/report; ≤8 MB each; `image/jpeg`, `image/png`, `image/webp`, `image/heic` (converted to JPEG server-side) |
| Soft delete | Reports are never hard-deleted by users (cancel/expire/remove); account deletion anonymizes (privacy doc) |

## Response envelopes

### Success (single resource)
```json
{ "id": "018f2c…", "title": "Tas ransel biru", "...": "…" }
```

### Success (list)
```json
{
  "data": [ { "id": "018f2c…" } ],
  "page": { "nextCursor": "eyJjcmVhdGVkQXQiOi…", "hasMore": true }
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid request body",
    "details": { "fields": [ { "path": "title", "key": "error.VALIDATION_FAILED.title" } ] },
    "requestId": "req_01J8…"
  }
}
```

## Headers

| Header | Direction | Notes |
|---|---|---|
| `X-Request-Id` | response (always) | echo client value or generate; shown in `ErrorState` |
| `X-Requested-With: temuunair` | request (mutations) | CSRF companion to the Origin check |
| `Idempotency-Key` | request (3 POSTs) | UUID; 24 h window |
| `If-Match` | request (`PATCH /reports/{id}`) | integer `version` |
| `Retry-After` | response (429) | seconds |
| `Deprecation` | response | on deprecated endpoints; listed in `CHANGELOG.md` |

## Naming and shape rules

1. JSON fields `camelCase`; DB columns `snake_case`; no abbreviations except `id`, `geo`.
2. Enums are `SCREAMING_SNAKE_CASE` strings, exactly as in `BE-05`/Zod.
3. Absent optional values are `null` (never omitted for declared keys) — easier for generated
   clients and MSW fixtures.
4. Timestamps always carry an offset (`2026-09-29T10:15:00+07:00`).
5. Numbers that are scores are never returned to non-staff; use `band` + `reasons`.
6. Unknown fields in requests are stripped by Zod (`.strip()`), never rejected silently into
   a 500.
7. All request bodies are validated by contract schemas before reaching services.

## Versioning and deprecation

- Path versioning `/api/v1`; breaking changes need `/api/v2` or an explicit migration plan + ADR.
- Deprecated endpoints keep working ≥ 1 milestone, return a `Deprecation` header, and are listed
  in `CHANGELOG.md`.
- Additive optional fields are minor and can ship in a feature PR **only** via a `TMU-CTR-*`
  contract change (never in place).
