---
id: BE-03
title: Endpoint catalog
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["BE-01", "BE-04", "BE-05"]
source_refs: ["Blueprint §5A.3, §5A.4"]
---

# BE-03 — Endpoint catalog

Auth legend: **U** any logged-in user · **O** owner of resource · **P** party to the claim ·
**M** moderator/admin (campus-scoped for moderators) · **A** admin only · **—** public.

All endpoints live under `/api/v1`. Errors are from `BE-04`. Schemas are from `BE-05`/Zod.

## System & meta

| ID | Method & path | Auth | Request → Response | Notable errors |
|---|---|---|---|---|
| API-SYS-01 | `GET /healthz` | — | → `{status:"ok"}` | — |
| API-SYS-02 | `GET /readyz` | — | → `{db,storage,ml}` each `ok\|degraded\|down` | — |
| API-META-01 | `GET /meta/categories` | U | → `CategoryMeta[]` (value, i18n key, isSensitive, hint prompt suggestions) | — |
| API-META-02 | `GET /meta/campuses` | U | → `CampusMeta[]` | — |
| API-META-03 | `GET /meta/locations?campus=` | U | → `LocationMeta[]` | `VALIDATION_FAILED` |
| API-META-04 | `GET /meta/drop-points?campus=` | U | → `DropPointMeta[]` | — |

Example `GET /meta/categories` (truncated):
```json
[
  { "value": "PHONE", "labelKey": "category.PHONE", "isSensitive": false,
    "hintPrompts": ["Apa warna casingnya?", "Ada stiker atau goresan khas?"] },
  { "value": "ID_CARD", "labelKey": "category.ID_CARD", "isSensitive": true,
    "hintPrompts": ["Nama depan di kartu?", "Ada tanda tangan di belakang?"] }
]
```

## Me & preferences

| ID | Method & path | Auth | Request → Response | Notable errors |
|---|---|---|---|---|
| API-ME-01 | `GET /me` | U | → `Me` | `AUTH_REQUIRED` |
| API-ME-02 | `PATCH /me` | U | `MeUpdate{displayName?,locale?}` → `Me` | `VALIDATION_FAILED` |
| API-ME-03 | `DELETE /me` | U | → `202 {scheduledAt}` | — |
| API-ME-04 | `GET /me/notification-preferences` | U | → `NotificationPrefs` | — |
| API-ME-05 | `PUT /me/notification-preferences` | U | `NotificationPrefs` → same | `VALIDATION_FAILED` |

Example `Me`:
```json
{ "id": "018f2c…", "displayName": "Budi S.", "email": "budi@student.unair.ac.id",
  "locale": "id", "role": "USER", "status": "ACTIVE", "createdAt": "2026-09-20T08:00:00+07:00" }
```

## Uploads

| ID | Method & path | Auth | Request → Response | Notable errors |
|---|---|---|---|---|
| API-UPL-01 | `POST /uploads` | U | `UploadInit{mime,sizeBytes,sha256?}` → `{uploadId,uploadUrl,expiresAt}` | `UPLOAD_INVALID_TYPE`, `UPLOAD_TOO_LARGE`, `RATE_LIMITED` |
| API-UPL-02 | `POST /uploads/{id}/complete` | O | → `UploadState` (server validates, strips EXIF, thumbnails, masks) | `UPLOAD_INVALID_TYPE` |
| API-UPL-03 | `GET /uploads/{id}` | O | → `UploadState{status:PENDING\|READY\|REJECTED, thumbUrl?}` | `NOT_FOUND` |

## Reports

| ID | Method & path | Auth | Request → Response | Notable errors |
|---|---|---|---|---|
| API-REP-01 | `POST /reports` | U | `ReportCreate` → `ReportOwnerView` (201) | `VALIDATION_FAILED`, `RATE_LIMITED`, `UPLOAD_LIMIT_REACHED` |
| API-REP-02 | `GET /reports` | U | `ReportQuery` → `Paged<ReportPublic>` | — |
| API-REP-03 | `GET /reports/mine` | U | `?type&status` → `Paged<ReportOwnerView>` | — |
| API-REP-04 | `GET /reports/{id}` | U | → `ReportPublic` \| `ReportOwnerView` \| `ReportModeratorView` | `NOT_FOUND` |
| API-REP-05 | `PATCH /reports/{id}` | O | `ReportUpdate` + `If-Match` → `ReportOwnerView` | `CONFLICT_STATE`, `FORBIDDEN` |
| API-REP-06 | `POST /reports/{id}/cancel` | O | `{reason?}` → `ReportOwnerView` | `CONFLICT_STATE` |
| API-REP-07 | `POST /reports/{id}/renew` | O | → `ReportOwnerView` | `CONFLICT_STATE` |
| API-REP-08 | `POST /reports/{id}/flag` | U | `{reason,note?}` → `204` | `RATE_LIMITED` |

Example `POST /reports` (LOST):
```json
{
  "type": "LOST", "category": "BAG", "title": "Tas ransel biru", 
  "description": "Tas ransel biru tua, ada gantungan kunci kuning.", 
  "colors": ["Biru"], "brand": "Eiger", "imageIds": ["018f2d…"],
  "location": { "campus": "KAMPUS_B", "locationId": "018f30…", "note": "Dekat lift" },
  "occurredAt": { "from": "2026-09-28T07:30:00+07:00", "to": "2026-09-28T12:00:00+07:00" }
}
```
Response `201` (owner view, excerpt): `{ "id": "…", "status": "OPEN", "version": 1,
"matchCount": 0, "hintPrompts": [], "expiresAt": "2026-12-27T…" }`

**Visibility rules for `GET /reports` and `/search`** (service-layer enforced, tested): default
returns only `OPEN`/`MATCHED` reports of the *opposite* type of the caller's active intent
(`?type=` overrides); never returns the caller's own reports; hides `PENDING_REVIEW/REMOVED/
CANCELLED/EXPIRED/RETURNED`; masks sensitive photos and generalizes title/description for
sensitive categories.

## Search

| ID | Method & path | Auth | Request → Response | Notable errors |
|---|---|---|---|---|
| API-SRC-01 | `POST /search` | U | `SearchRequest{q?,imageUploadId?,filters}` → `Paged<SearchHit>` (hit = `ReportPublic` + `band?` + `reasons`) | `VALIDATION_FAILED` (neither q nor image) |

## Matches

| ID | Method & path | Auth | Request → Response | Notable errors |
|---|---|---|---|---|
| API-MAT-01 | `GET /reports/{id}/matches` | O | → `MatchView[]` (sorted by score desc) | `FORBIDDEN` |
| API-MAT-02 | `POST /matches/{id}/dismiss` | P | → `MatchView` | `CONFLICT_STATE` |
| API-MAT-03 | `POST /matches/{id}/invite` | finder | → `204` | `RATE_LIMITED` |
| API-MAT-04 | `POST /reports/{id}/rematch` | O | → `202` (enqueue `report.match`) | `RATE_LIMITED` (1/10 min) |

Example `MatchView`:
```json
{
  "id": "018f40…", "state": "SUGGESTED", "band": "STRONG",
  "score": 0.81,
  "reasons": [
    { "code": "IMAGE_SIMILAR", "labelKey": "match.reason.IMAGE_SIMILAR" },
    { "code": "SAME_BUILDING", "labelKey": "match.reason.SAME_BUILDING" }
  ],
  "other": { "id": "018f41…", "title": "Tas ransel biru tua", "...": "…" },
  "createdAt": "2026-09-29T09:00:00+07:00"
}
```
> `score` is present only for staff/eval contexts; user-facing responses must omit it
> (`MatchViewUser` in the registry) — the mapper strips it. Contract tests assert this.

## Claims

| ID | Method & path | Auth | Request → Response | Notable errors |
|---|---|---|---|---|
| API-CLM-01 | `GET /reports/{id}/challenge` | U (not owner) | → `Challenge{items:[{hintId,prompt}]}` | `REPORT_NOT_CLAIMABLE`, `SELF_CLAIM_NOT_ALLOWED` |
| API-CLM-02 | `POST /claims` | U | `ClaimCreate` → `ClaimView` (201) | `CLAIM_ALREADY_ACTIVE`, `CLAIM_LIMIT_EXCEEDED`, `REPORT_NOT_CLAIMABLE` |
| API-CLM-03 | `GET /claims?role=claimant\|finder&status=` | U | → `Paged<ClaimView>` | — |
| API-CLM-04 | `GET /claims/{id}` | P,M | → `ClaimView` (finder/moderator see expected answers) | `FORBIDDEN` |
| API-CLM-05 | `POST /claims/{id}/approve` | finder,M | `{note?}` → `ClaimView` | `CONFLICT_STATE` |
| API-CLM-06 | `POST /claims/{id}/reject` | finder,M | `{reason}` → `ClaimView` | `CONFLICT_STATE` |
| API-CLM-07 | `PUT /claims/{id}/handover-plan` | P | `{place,at,note?}` → `ClaimView` | `CONFLICT_STATE` |
| API-CLM-08 | `POST /claims/{id}/confirm-handover` | P | → `ClaimView` (COMPLETED when both confirmed) | `CONFLICT_STATE` |
| API-CLM-09 | `POST /claims/{id}/cancel` | claimant | → `ClaimView` | `CONFLICT_STATE` |
| API-CLM-10 | `POST /claims/{id}/dispute` | P | `{reason}` → `ClaimView` | `CONFLICT_STATE` |

Example `POST /claims`:
```json
{ "foundReportId": "018f41…", "lostReportId": "018f2c…",
  "answers": [{ "hintId": "018f50…", "answer": "Biru tua" }],
  "note": "Ada gantungan kunci kuning di resleting depan." }
```

## Chat

| ID | Method & path | Auth | Request → Response | Notable errors |
|---|---|---|---|---|
| API-CHT-01 | `GET /claims/{id}/messages` | P,M | cursor → `Paged<Message>` | `FORBIDDEN` |
| API-CHT-02 | `POST /claims/{id}/messages` | P | `{body}` → `Message` | `RATE_LIMITED`, `CONFLICT_STATE` (claim closed) |
| API-CHT-03 | `GET /claims/{id}/stream` | P | SSE `message`, `claim.updated` (phase 2) | — |
| API-CHT-04 | `POST /claims/{id}/messages/read` | P | `{upToMessageId}` → `204` | — |

## Notifications

| ID | Method & path | Auth | Request → Response | Notable errors |
|---|---|---|---|---|
| API-NTF-01 | `GET /notifications` | U | cursor → `Paged<Notification>` | — |
| API-NTF-02 | `POST /notifications/{id}/read` | O | → `204` | — |
| API-NTF-03 | `POST /notifications/read-all` | U | → `204` | — |
| API-NTF-04 | `GET /notifications/unread-count` | U | → `{count}` | — |

## Admin

| ID | Method & path | Auth | Request → Response | Notable errors |
|---|---|---|---|---|
| API-ADM-01 | `GET /admin/reports` | M | filters → `Paged<ReportModeratorView>` | — |
| API-ADM-02 | `POST /admin/reports/{id}/approve` | M | → `ReportModeratorView` | `CONFLICT_STATE` |
| API-ADM-03 | `POST /admin/reports/{id}/remove` | M | `{reason}` → `ReportModeratorView` | `CONFLICT_STATE` |
| API-ADM-04 | `POST /admin/reports/{id}/restore` | A | → `ReportModeratorView` | `CONFLICT_STATE` |
| API-ADM-05 | `GET /admin/claims?status=` | M | → `Paged<ClaimView>` | — |
| API-ADM-06 | `POST /admin/claims/{id}/resolve` | M | `{decision:APPROVE\|REJECT,note}` → `ClaimView` | `CONFLICT_STATE` |
| API-ADM-07 | `GET /admin/users` | A | `?q&role&status` → `Paged<AdminUser>` | — |
| API-ADM-08 | `POST /admin/users/{id}/suspend` | A | `{reason}` → `AdminUser` | — |
| API-ADM-09 | `POST /admin/users/{id}/unsuspend` | A | → `AdminUser` | — |
| API-ADM-10 | `PATCH /admin/users/{id}/role` | A | `{role}` → `AdminUser` | `FORBIDDEN` (cannot demote self) |
| API-ADM-11 | `GET /admin/stats?from&to&campus` | M | → `AdminStats` | — |
| API-ADM-12 | `GET/POST/PATCH /admin/locations[/{id}]` | A | `LocationUpsert` | `VALIDATION_FAILED` |
| API-ADM-13 | `GET/POST/PATCH /admin/drop-points[/{id}]` | A | `DropPointUpsert` | — |
| API-ADM-14 | `GET /admin/audit-logs` | A | filters → `Paged<AuditLog>` | — |
| API-ADM-15 | `POST /admin/matching/reindex` | A | `{scope}` → `202` | `RATE_LIMITED` |
| API-ADM-16 | `GET /admin/flags` | M | → `Paged<Flag>` | — |
| API-ADM-17 | `POST /admin/flags/{id}/resolve` | M | `{action,note}` → `Flag` | — |

Example `GET /admin/stats`:
```json
{ "from": "2026-09-01", "to": "2026-09-30", "campus": null,
  "activeReports": 412, "pendingReview": 7, "pendingClaims": 3, "disputes": 1,
  "returned": 58, "avgReturnDays": 5.4 }
```
