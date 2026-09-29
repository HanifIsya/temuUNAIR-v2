---
id: ADMIN-DESIGN
title: Admin console design
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["SCR-017..022", "CMP", "TOKENS"]
source_refs: ["Blueprint §4.3", "FR-ADM-001..009"]
---

# Admin console design

Desktop-first (≥ 1024 px) but usable from 768 px. Same tokens and components as the app; no
separate design language.

## Layout

```
┌──────────┬───────────────────────────────────────────────┐
│ [logo]   │  Topbar: page title · campus badge · user menu │
│ Ringkasan│───────────────────────────────────────────────│
│ Laporan  │                                               │
│ Klaim    │                 Content                       │
│ Pengguna │                                               │
│ Lokasi   │                                               │
│ Audit    │                                               │
└──────────┴───────────────────────────────────────────────┘
```

- Sidebar collapses to icons at 768–1023 px; below 768 px it becomes a drawer (admins on
  phones can still triage).
- The campus badge is always visible for moderators (`MODERATOR` is campus-scoped) and reads
  "Semua kampus" for admins.

## Screens

| Screen | Route | Purpose | Spec |
|---|---|---|---|
| Dashboard | `/admin` | queue health + attention list | `SCR-017` |
| Reports queue | `/admin/reports` | verify/remove/restore, flags | `SCR-018` |
| Claims & disputes | `/admin/claims` | resolve with note | `SCR-019` |
| Users | `/admin/users` | suspend, role changes | `SCR-020` |
| Places | `/admin/places` | locations + drop points CRUD | `SCR-021` |
| Audit log | `/admin/audit` | read-only accountability | `SCR-022` |

## Queue design rules

1. **Age first.** The queue defaults to oldest-first so nothing rots; an age badge turns warn
   after 24 h and danger after 48 h.
2. **Act in place.** `ModerationDrawer` (reports) and detail panel (claims) keep the row in
   context; closing returns focus to the row.
3. **Reasons required.** Removal and dispute decisions demand a reason; the UI states clearly
   that it is shown to the affected user.
4. **Two-step exposure.** Sensitive photos and hint answers sit behind explicit "Tampilkan"
   disclosures with a warning; every reveal is audit-logged.
5. **No destructive defaults.** Remove/suspend are never the primary (blue) button.
6. **Bulk actions** are out of scope for MVP (one decision at a time keeps the audit trail
   meaningful).

## Stats shown on the dashboard

| Stat | Source | Notes |
|---|---|---|
| Laporan aktif | reports (OPEN/MATCHED) | campus-scoped |
| Menunggu tinjauan | reports (PENDING_REVIEW) | links to queue |
| Klaim menunggu | claims (SUBMITTED) | oldest age shown |
| Sengketa | claims (DISPUTED) | highest priority |
| Barang kembali | reports (RETURNED) in range | success metric |
| Rata-rata waktu kembali | claims completed − found created | MET-007 |

## RBAC in the UI (mirrors, never replaces, server checks)

| UI element | USER | MODERATOR | ADMIN |
|---|---|---|---|
| `/admin` access | ✗ | ✓ (own campus) | ✓ |
| Approve/remove report | ✗ | ✓ own campus | ✓ |
| Restore removed report | ✗ | ✗ | ✓ |
| Resolve dispute | ✗ | ✓ own campus | ✓ |
| Users screen | ✗ | ✗ | ✓ |
| Places CRUD | ✗ | ✗ | ✓ |
| Audit log | ✗ | ✗ | ✓ |
| Reindex matching | ✗ | ✗ | ✓ |

Server-side checks are authoritative; the UI hides what the role cannot do to avoid dead ends.

## Accessibility and safety

- Tables: caption, `<th scope="col">`, sort buttons announce direction.
- Drawers trap focus, ESC closes, focus returns to the row.
- Confirmation dialogs name the entity and state the consequence.
- Redaction: audit diff views never render hint answers or third-party emails.
- Timeouts: a stale action returns `409 CONFLICT_STATE` → toast + refetch, never a silent no-op.

## Open questions

- `OPEN`: whether moderators need a "view as public" toggle (recommended yes, `SCR-006`).
- `OPEN`: SLA reminders in-app for items older than 48 h (notification vs dashboard badge only).
