---
id: FE-04
title: State and data fetching
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["FE-02", "FE-03", "BE-01"]
source_refs: ["Blueprint §5B.4"]
---

# FE-04 — State and data fetching

## Principles

- **Server state:** TanStack Query (cache, retries, polling).
- **UI state:** local component state; a small store only for the wizard draft.
- **API access:** only via `apps/web/src/lib/api` (wrapper around the generated `openapi-fetch`
  client). No raw `fetch("/api/v1/...")` elsewhere — ESLint rule
  `no-restricted-globals`/custom `temuunair/no-raw-api-fetch`.

## Query keys

```
['me']
['me','notification-preferences']
['meta', name, params]           // name: categories|campuses|locations|drop-points
['reports','list', filters]
['reports','search', { q, imageUploadId, filters }]
['reports','detail', id]
['reports','mine', filters]
['matches', reportId]
['challenge', reportId]
['claims','list', params]
['claims','detail', id]
['messages', claimId]
['notifications','list', filters]
['notifications','unread']
['admin','stats', range, campus]
['admin','reports', filters]
['admin','claims', filters]
['admin','users', filters]
['admin','locations', { campus }]
['admin','drop-points', { campus }]
['admin','audit', filters]
```

Keys are built by helpers in `lib/api/keys.ts`; never inline arrays in components.

## Invalidation matrix

| Mutation | Invalidate |
|---|---|
| create/update/cancel/renew report | `reports.mine`, `reports.detail(id)`, `matches(id)` |
| dismiss match / invite | `matches(reportId)`, `notifications.unread` |
| create claim | `claims.list`, `reports.detail(foundId)`, `challenge(foundId)` |
| approve/reject/cancel/dispute/handover/confirm | `claims.detail(id)`, `claims.list`, `reports.detail(*)`, `reports.mine` |
| send message | append optimistically to `messages(claimId)`; roll back on error |
| mark read / read-all | `notifications.*` (optimistic) |
| admin actions | the relevant admin list + `reports.detail(id)` |
| update profile / prefs | `me`, `me.notification-preferences` |
| locale change | `me` + re-render messages |

## Polling

| Query | Interval | Paused when |
|---|---|---|
| `notifications.unread` | 30 s | tab hidden |
| `messages(claimId)` | 5 s | claim room closed, tab hidden, offline |
| `claims.detail(id)` | 15 s | tab hidden |
| `admin` lists | none (manual refresh button) | — |

SSE (`API-CHT-03`) replaces message polling in a later task without changing components
(`ADR-0010`).

## Optimistic updates

Allowed **only** for: mark-read, match dismiss, chat send. Everything else (create, approve,
confirm) waits for the server — trust matters more than speed on money/ownership-like actions.

| Optimistic action | Rollback trigger | UX on failure |
|---|---|---|
| mark read | non-2xx | revert dot, toast |
| dismiss match | non-2xx | restore card, toast |
| send message | non-2xx | bubble marked "gagal" with retry |

## Error mapping (global)

| Response | Behaviour |
|---|---|
| `401` | redirect `/login?next=` |
| `403` | `/403` (or inline forbidden state in drawers) |
| `404` | `notFound()` on pages; toast in mutations |
| `409 CONFLICT_STATE` | refetch + toast "Data sudah berubah" |
| `429` | toast with `Retry-After` seconds |
| `5xx` | `ErrorState` with `requestId` |

## Stale times

| Data | staleTime | gcTime |
|---|---|---|
| Lists | 30 s | 5 min |
| Meta | 1 h | 24 h |
| Claim room | 0 | 5 min |
| Me | 5 min | 30 min |
| Admin | 30 s (audit 60 s) | 5 min |

## Wizard draft

- Stored in `localStorage` under `tu.draft.report.<type>` — **only** uploadIds and text fields,
  never files or signed URLs.
- Autosave on step change; cleared on successful submit; "buang draft" action in the leave-guard
  dialog.
- A draft older than 24 h is discarded silently on load (stale uploadIds expire anyway).

## Retries

- Queries: 2 retries with exponential backoff for network/5xx only; never for 4xx.
- Mutations: no automatic retry (except the idempotent report/claim submits where the same
  `Idempotency-Key` is reused on manual retry).
- Offline: queries pause; mutations queue is **not** used in MVP (explicitly disabled).

## Testing

- MSW handlers generated from contracts; tests never hand-write response shapes.
- Each hook has a test asserting its query key and invalidation behaviour (mutation → cache
  assertions).
