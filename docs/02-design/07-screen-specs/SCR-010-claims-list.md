---
id: SCR-010
title: Claims list
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["IA", "FE-02", "CMP"]
source_refs: ["FE-01", "API-CLM-03", "FR-CLM-001..009"]
---

# SCR-010 — Claims (`/claims`)

## Purpose
Two perspectives in one screen: claims I made (as claimant) and claims on my found items
(as finder). Each row leads to the claim room.

## Entry points / exits
Entry: bottom nav "Klaim", notifications, home.
Exits: `/claims/[id]`, `/reports/[id]`.

## Layout regions
1. Segmented control: "Klaim saya" (claimant) · "Klaim masuk" (finder).
2. Status filter chips: Menunggu · Disetujui · Selesai · Ditolak/Sengketa.
3. List of `ClaimCard`s: item thumbnail, counterpart display name, status badge, last activity,
   unread message dot.
4. Empty state per tab with guidance.

## Data
| Field | API | Query key | Notes |
|---|---|---|---|
| List | API-CLM-03 `?role=claimant|finder&status=` | `['claims','list',params]` | cursor pagination |
| Unread dot | API-CHT-01 | `['messages',claimId]` | count from list payload or per-room poll |

## Components
`ClaimCard` (020) · `StatusBadge` (007) · `EmptyState`/`ErrorState` (027) · `Skeletons` (028).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| card skeletons | "Belum ada klaim" + link to browse | `ErrorState` + retry | — | cached + banner |

## Copy keys
`claims.tabs.mine` ("Klaim saya") · `claims.tabs.incoming` ("Klaim masuk") ·
`claims.empty.mine` · `claims.empty.incoming` · `claims.filter.pending` etc.

## Analytics
`claims_list_viewed{role,tab}`.

## Accessibility
- Segmented control is a tablist; filters use `aria-pressed`.
- Unread indicator has a text alternative ("pesan baru").

## Test hooks
`claims-tab-mine`, `claims-tab-incoming`, `claim-card-<id>`, `claim-status-filter-<status>`.

## Open questions
- `OPEN`: whether to show expired claims by default or hide behind a filter.
