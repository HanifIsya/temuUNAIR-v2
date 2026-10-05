---
id: SCR-009
title: My reports
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["IA", "FE-02", "CMP"]
source_refs: ["FE-01", "API-REP-03", "API-REP-06", "API-REP-07", "FR-MGT-001"]
---

# SCR-009 — My reports (`/me/reports`)

## Purpose
One place to track every report the user created: active, matched, returned, expired, cancelled.

## Entry points / exits
Entry: avatar menu, home "Lihat semua", expiry notifications.
Exits: detail, matches, renew/cancel actions, new report.

## Layout regions
1. Header + "Buat laporan" button.
2. Status tabs: Aktif · Ada kecocokan · Selesai · Kedaluwarsa · Dibatalkan.
3. `ReportGrid` list of `ReportCard variant="mine"` with status badges and quick actions.
4. Per-card menu: Lihat · Edit (if allowed) · Periksa kecocokan · Perpanjang (EXPIRED) ·
   Batalkan (with confirm + optional reason).

## Data
| Field | API | Query key | Notes |
|---|---|---|---|
| List | API-REP-03 `?type&status` | `['reports','mine',filters]` | cursor pagination |
| Cancel | API-REP-06 | — | confirm dialog; `409` if approved claim |
| Renew | API-REP-07 | — | only within grace window |

## Components
`ReportCard` (004) · `ReportGrid` (005) · `StatusBadge` (007) · `ConfirmDialog` (029) ·
`EmptyState`/`ErrorState` (027) · `Skeletons` (028).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| list skeleton | "Belum ada laporan" + CTA | `ErrorState` + retry | — | cached + banner; mutations disabled |

## Copy keys
`myreports.tabs.active` · `myreports.tabs.matched` · `myreports.tabs.done` ·
`myreports.tabs.expired` · `myreports.tabs.cancelled` · `myreports.cancel.confirm` ·
`myreports.renew` ("Perpanjang 90 hari") · `myreports.empty`.

## Analytics
`my_reports_viewed{tab}`, `report_cancelled`, `report_renewed`.

## Accessibility
- Tabs are a proper tablist with keyboard arrow navigation; the panel is announced.
- Status never colour-only; cancelled/expired use muted styling plus text.

## Test hooks
`my-reports-tab-<status>`, `my-report-card-<id>`, `report-cancel-button`, `report-renew-button`.

## Open questions
- `OPEN`: whether cancelled reports remain visible forever or are hidden after 30 days.
