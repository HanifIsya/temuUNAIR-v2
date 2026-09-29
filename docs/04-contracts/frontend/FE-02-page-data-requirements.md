---
id: FE-02
title: Page data requirements
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["FE-01", "FE-04", "BE-03"]
source_refs: ["Blueprint §5B.2"]
---

# FE-02 — Page data requirements

For every route in `FE-01`: the APIs it calls, request params, query keys, `staleTime`, whether
the first paint uses server-fetched data, and the fields required to render. Mocks (MSW) must
match these shapes exactly (`FE-12`).

## Global

| Key | API | staleTime | Notes |
|---|---|---|---|
| `['me']` | API-ME-01 | 5 min | server-guarded layout; invalidated on `PATCH /me` |
| `['meta', name, params]` | API-META-01..04 | 1 h | categories, campuses, locations, drop points |
| `['notifications','unread']` | API-NTF-04 | 0 (poll 30 s) | paused when tab hidden |

## `/home`

| Data | API | Query key | staleTime | SSR? |
|---|---|---|---|---|
| Me | ME-01 | `['me']` | 5 min | yes (layout) |
| Active reports (max 3) | REP-03 `?status=OPEN,MATCHED` | `['reports','mine',{status:'active'}]` | 30 s | no |
| Unread count | NTF-04 | `['notifications','unread']` | 0 | no |
| Top matches of first active report | MAT-01 | `['matches',reportId]` | 30 s | no |

Required fields: `Me.displayName`, `ReportOwnerView.{id,title,status,campus,occurredFrom,images[0].thumbUrl}`,
`MatchView.{id,band,reasons,other.title,other.images[0].thumbUrl}`, `{count}`.

## `/reports`

| Data | API | Query key | staleTime | SSR? |
|---|---|---|---|---|
| List | REP-02 | `['reports','list',filters]` | 30 s | no |
| Search | SRC-01 | `['reports','search',{q,imageUploadId,filters}]` | 30 s | no |
| Meta | META-01..03 | `['meta',…]` | 1 h | no |

Required fields: `Paged<ReportPublic>`; filters parsed from URL; `page.nextCursor` for infinite
load.

## `/reports/[id]`

| Data | API | Query key | staleTime | SSR? |
|---|---|---|---|---|
| Report | REP-04 | `['reports','detail',id]` | 30 s | **yes** (first paint) |
| Challenge (on claim CTA) | CLM-01 | `['challenge',id]` | 0 | no |

Required fields: everything in `ReportPublic`/`ReportOwnerView`/`ReportModeratorView` per role;
owner view adds `version`, `matchCount`, `hintPrompts`, `activeClaimId`, `geo`.

## `/reports/new`

| Data | API | Query key | staleTime | SSR? |
|---|---|---|---|---|
| Categories | META-01 | `['meta','categories']` | 1 h | no |
| Campuses/locations/drop points | META-02..04 | `['meta',…,{campus}]` | 1 h | no |
| Duplicate hint (LOST step 5) | SRC-01 | `['reports','search',{q:title,type:'FOUND'}]` | 0 | no |

Uploads use UPL-01..03 with no query cache (component state); the draft lives in
`localStorage` (`FE-04`).

## `/reports/[id]/matches`

| Data | API | Query key | staleTime | SSR? |
|---|---|---|---|---|
| Matches | MAT-01 | `['matches',reportId]` | 30 s | no |

Required fields: `MatchView.{id,state,band,reasons,other.*}`; score is **not** required and must
not be rendered.

## `/claims` and `/claims/[id]`

| Data | API | Query key | staleTime | SSR? |
|---|---|---|---|---|
| Claims list | CLM-03 `?role&status` | `['claims','list',params]` | 30 s | no |
| Claim detail | CLM-04 | `['claims','detail',id]` | 0 (poll 15 s) | no |
| Messages | CHT-01 | `['messages',claimId]` | 0 (poll 5 s) | no |

Required fields: `ClaimView` as in `BE-03`; `answers[].expectedAnswer` is present only for the
finder/moderator view — the mapper omits it for claimants (UI must not assume it exists).

## `/me/reports`, `/notifications`, `/me/settings`

| Page | Data | Query key | staleTime |
|---|---|---|---|
| `/me/reports` | REP-03 | `['reports','mine',filters]` | 30 s |
| `/notifications` | NTF-01 | `['notifications','list',filters]` | 30 s |
| `/me/settings` | ME-01, ME-04 | `['me']`, `['me','notification-preferences']` | 5 min |

## Admin pages

| Page | Data | Query key | staleTime |
|---|---|---|---|
| `/admin` | ADM-11 + queue previews | `['admin','stats',range,campus]`, `['admin','reports',…]`, `['admin','claims',…]` | 30 s |
| `/admin/reports` | ADM-01, ADM-16 | `['admin','reports',filters]`, `['admin','flags',filters]` | 30 s |
| `/admin/claims` | ADM-05 | `['admin','claims',filters]` | 30 s |
| `/admin/users` | ADM-07 | `['admin','users',filters]` | 30 s |
| `/admin/places` | ADM-12, ADM-13 | `['admin','locations',{campus}]`, `['admin','drop-points',{campus}]` | 5 min |
| `/admin/audit` | ADM-14 | `['admin','audit',filters]` | 60 s |

## Rules

1. No page fetches data outside the query keys listed here; new keys are added to `FE-04`.
2. SSR is used only where stated (`/reports/[id]`, layout `me`); everything else is CSR for
   simplicity and cache reuse.
3. Required-fields lists are the contract for MSW fixtures and for loading-state skeletons.
4. Private fields (`expectedAnswer`, `geo`, `hintPrompts`) are rendered only in the roles the
   backend returns them to; the UI never fabricates them.
