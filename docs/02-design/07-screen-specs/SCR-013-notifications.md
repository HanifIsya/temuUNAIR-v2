---
id: SCR-013
title: Notifications
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["IA", "FE-02", "CMP"]
source_refs: ["FE-01", "API-NTF-01..04", "BE-08", "FR-NTF-001..007"]
---

# SCR-013 — Notifications (`/notifications`)

## Purpose
A single chronological feed of everything the user needs to act on, with deep links and
read state.

## Entry points / exits
Entry: bell icon, avatar menu, email links (via deep link then sign-in).
Exits: deep links per notification type (`IA` §deep-link table).

## Layout regions
1. Header: title + "Tandai semua dibaca".
2. Filter chips by type family: Kecocokan · Klaim · Pesan · Laporan · Sistem.
3. List of `NotificationItem`s: icon by type, title, body preview, relative time, unread dot.
4. "Muat lebih banyak" button.

## Data
| Field | API | Query key | Notes |
|---|---|---|---|
| List | API-NTF-01 | `['notifications','list',filters]` | cursor pagination |
| Mark one | API-NTF-02 | — | optimistic |
| Mark all | API-NTF-03 | — | optimistic |
| Unread count | API-NTF-04 | `['notifications','unread']` | poll 30 s (bell), paused hidden |

## Components
`NotificationItem` (026) · `NotificationBell` (002) · `EmptyState`/`ErrorState` (027) ·
`Skeletons` (028).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| list skeleton ×5 | "Belum ada notifikasi" | `ErrorState` + retry | — | cached list + banner; mark-read disabled |

## Copy keys
`notifications.title` · `notifications.markAll` · `notifications.empty` ·
`notification.MATCH_SUGGESTED.title` ("Ada kecocokan untuk laporanmu") ·
`notification.CLAIM_SUBMITTED.title` ("Seseorang mengklaim barang temuanmu") ·
`notification.CLAIM_APPROVED.title` ("Klaim kamu disetujui") ·
`notification.MESSAGE_RECEIVED.title` ("Pesan baru") ·
`notification.REPORT_EXPIRING.title` ("Laporanmu akan kedaluwarsa") + per-type body keys.

## Analytics
`notification_opened{type}`, `notifications_mark_all_read`.

## Accessibility
- Feed is a list with `aria-label`; unread indicated by text + dot, never colour only.
- Relative timestamps have an accessible absolute value (`title` attribute or sr-only text).

## Test hooks
`notifications-list`, `notification-item-<id>`, `notification-mark-read-<id>`,
`notifications-mark-all`.

## Open questions
- `OPEN`: whether POSSIBLE-band match notifications should appear here or only in the daily email digest (see BE-08).
