---
id: BE-12
title: Rate limits and quotas
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["BE-01", "BE-04"]
source_refs: ["Blueprint §5A.13"]
---

# BE-12 — Rate limits and quotas

Per authenticated user unless stated. Enforced in `apps/web/src/server/rate-limit.ts` using a
Postgres-backed counter (no Redis, DEC-013). Responses use `429 RATE_LIMITED` with a
`Retry-After` header (seconds).

| Scope | Limit | Window | Notes |
|---|---|---|---|
| `POST /uploads` | 30 | hour | per user |
| `POST /reports` | 10 / day **and** 3 / hour | both | per user |
| `POST /search` | 30 | minute | per user |
| `POST /claims` | 3 | day | plus ≤1 active per report (DB) |
| `POST /claims/{id}/messages` | 20 | minute | per user |
| `POST /reports/{id}/rematch` | 1 | 10 minutes | per report |
| `POST /reports/{id}/flag` | 10 | day | per user |
| `POST /notifications/read-all` | 10 | hour | per user |
| `POST /admin/matching/reindex` | 1 | hour | admin |
| Any endpoint (IP) | 300 | minute | unauthenticated + authenticated |
| Auth endpoints (IP) | 20 | minute | login/callback/magic link |

## Quotas (state-based, not time-based)

| Quota | Rule | Error |
|---|---|---|
| Active claim per claimant per found report | 1 | `CLAIM_ALREADY_ACTIVE` |
| Approved claim per found report | 1 | `CONFLICT_STATE` on the second approval |
| Rejections before a claimant is blocked on a report | 3 | `CLAIM_LIMIT_EXCEEDED` |
| Images per report | 5 | `UPLOAD_LIMIT_REACHED` |
| Match suggestions stored per report | top 10 | silent cap |

## Behaviour

1. Counters are keyed `(scope, subject)` where subject is `userId` or `ipHash`.
2. `Retry-After` = seconds until the window frees; the UI shows a toast with that value.
3. Rate limits are disabled only when `RATE_LIMIT_ENABLED=false` (unit tests); E2E runs with
   limits enabled but generous test credentials.
4. Limit hits are logged with the scope (never the raw IP) and counted in metrics
   (`OBSERVABILITY`).
5. Changing any number here is a contract change (`TMU-CTR-*`) and updates `FE-11` copy if the
   user-visible behaviour changes.
