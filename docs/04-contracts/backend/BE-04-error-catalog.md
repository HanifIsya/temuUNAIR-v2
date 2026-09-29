---
id: BE-04
title: Error catalog
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["BE-01", "COPY"]
source_refs: ["Blueprint §5A.14", "FE-11"]
---

# BE-04 — Error catalog

Every API error uses the envelope from `BE-01`. `code` is stable; `message` is
developer-oriented English; the UI shows `error.<code>` from i18n (`FE-11`).

| Code | HTTP | Meaning | User-facing key |
|---|---|---|---|
| `AUTH_REQUIRED` | 401 | No/expired session | `error.AUTH_REQUIRED` |
| `AUTH_DOMAIN_NOT_ALLOWED` | 403 | Email domain not in allowlist | `error.AUTH_DOMAIN_NOT_ALLOWED` |
| `ACCOUNT_SUSPENDED` | 403 | User suspended | `error.ACCOUNT_SUSPENDED` |
| `FORBIDDEN` | 403 | Role/ownership check failed | `error.FORBIDDEN` |
| `NOT_FOUND` | 404 | Missing **or** not visible (never leak existence) | `error.NOT_FOUND` |
| `VALIDATION_FAILED` | 422 | `details.fields[]` with path + i18n key | `error.VALIDATION_FAILED` |
| `CONFLICT_STATE` | 409 | Invalid state transition or stale `If-Match` | `error.CONFLICT_STATE` |
| `IDEMPOTENCY_CONFLICT` | 409 | Same key, different body | `error.IDEMPOTENCY_CONFLICT` |
| `CLAIM_ALREADY_ACTIVE` | 409 | Claimant already has an active claim on this report | `error.CLAIM_ALREADY_ACTIVE` |
| `CLAIM_LIMIT_EXCEEDED` | 429 | Daily claim quota or 3 rejections reached | `error.CLAIM_LIMIT_EXCEEDED` |
| `REPORT_NOT_CLAIMABLE` | 409 | Report not FOUND/OPEN/MATCHED | `error.REPORT_NOT_CLAIMABLE` |
| `SELF_CLAIM_NOT_ALLOWED` | 403 | Claiming own report | `error.SELF_CLAIM_NOT_ALLOWED` |
| `UPLOAD_INVALID_TYPE` | 415 | MIME not allowed / magic bytes mismatch | `error.UPLOAD_INVALID_TYPE` |
| `UPLOAD_TOO_LARGE` | 413 | > 8 MB | `error.UPLOAD_TOO_LARGE` |
| `UPLOAD_LIMIT_REACHED` | 409 | > 5 images on a report | `error.UPLOAD_LIMIT_REACHED` |
| `RATE_LIMITED` | 429 | `Retry-After` header set | `error.RATE_LIMITED` |
| `ML_UNAVAILABLE` | 503 | Internal only; report stays `needs_reprocess` | `error.ML_UNAVAILABLE` |
| `INTERNAL` | 500 | Unexpected; `requestId` shown to user | `error.INTERNAL` |

## Validation details shape

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid request body",
    "details": {
      "fields": [
        { "path": "title", "key": "error.field.title.required" },
        { "path": "occurredAt.from", "key": "error.field.occurredAt.future" }
      ]
    },
    "requestId": "req_01J8…"
  }
}
```

- `path` uses dot notation into the request body (`answers.0.answer`).
- `key` is an i18n key the UI resolves; unknown paths are shown in a form-level alert.

## Rules

1. Hidden resources return `NOT_FOUND`, never `FORBIDDEN` (existence must not leak).
2. `429` always carries `Retry-After` in seconds; the UI shows a countdown toast.
3. `409 CONFLICT_STATE` tells the client to refetch; the UI shows "Data sudah berubah. Muat
   ulang ya." and re-requests.
4. `INTERNAL` never includes stack traces; `requestId` is the only debug handle returned.
5. Adding a code requires: this table, `BE-01` registry, `error.<code>` in both locales, and a
   `FE-11` mapping row — all in the same contract PR.
6. ML service uses the same envelope (internal only); the worker maps `ML_UNAVAILABLE` to
   `needs_reprocess` rather than surfacing 5xx to users.
