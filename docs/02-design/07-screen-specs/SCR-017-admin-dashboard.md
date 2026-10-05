---
id: SCR-017
title: Admin dashboard
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["IA", "14-admin-console-design", "CMP"]
source_refs: ["FE-01", "API-ADM-11", "FR-ADM-006"]
---

# SCR-017 — Admin dashboard (`/admin`)

## Purpose
A one-glance health check for moderators and admins: queue sizes, recent activity, key metrics.

## Entry points / exits
Entry: `/admin` (role-guarded layout), avatar menu "Admin". Exits: queue screens, claims,
places, audit.

## Layout regions
1. Header: role badge, campus scope (for moderators), date-range picker.
2. `StatCard` grid: Laporan aktif · Menunggu tinjauan · Klaim menunggu · Sengketa ·
   Laporan dikembalikan (range) · Rata-rata waktu kembali.
3. "Butuh perhatian" list: oldest pending items, oldest disputes with age badges.
4. Recent audit activity (admin only, last 10 rows, link to full log).

## Data
| Field | API | Query key | Notes |
|---|---|---|---|
| Stats | API-ADM-11 `?from&to&campus` | `['admin','stats',range,campus]` | campus auto-applied for moderators |
| Queue previews | API-ADM-01, ADM-05 | `['admin','reports',…]`, `['admin','claims',…]` | first page only |
| Audit preview | API-ADM-14 | `['admin','audit',{limit:10}]` | admin only |

## Components
`StatCard` (035) · `AdminTable` (033) · `EmptyState`/`ErrorState` (027) · `Skeletons` (028).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| stat skeletons | "Antrian kosong 🎉" | `ErrorState` + retry per section | `/403` for non-staff | — |

## Copy keys
`admin.dashboard.title` · `admin.stat.activeReports` · `admin.stat.pendingReview` ·
`admin.stat.pendingClaims` · `admin.stat.disputes` · `admin.stat.returned` ·
`admin.stat.avgReturnDays` · `admin.attention.title` ("Butuh perhatian") ·
`admin.queueEmpty` ("Antrian kosong 🎉").

## Analytics
`admin_dashboard_viewed{role}`.

## Accessibility
- Stats are a definition list, not colour-coded cards only; deltas include sign + text.
- Tables are keyboard navigable with row actions reachable via Enter.

## Test hooks
`admin-stat-<metric>`, `admin-attention-list`, `admin-audit-preview`.

## Open questions
- `OPEN`: which metrics are meaningful before launch (avoid vanity dashboards).
