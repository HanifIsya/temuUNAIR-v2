---
id: SCR-020
title: Admin users
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["SCR-018", "14-admin-console-design", "CMP"]
source_refs: ["FE-01", "API-ADM-07..10", "FR-ADM-003", "FR-ADM-005"]
---

# SCR-020 — Admin users (`/admin/users`)

## Purpose
Find accounts, review their state, suspend/unsuspend and manage roles — with every action audited.

## Entry points / exits
Entry: admin sidebar; user links from reports/claims drawers. Exits: linked reports and claims.

## Layout regions
1. Toolbar: search by name/email (admin only), role filter, status filter.
2. `AdminTable<AdminUser>`: display name, email, role badge, status, campus (moderators),
   last login, report/claim counts.
3. Row drawer: recent activity summary (reports, claims, flags), suspend/unsuspend with reason,
   role change with confirmation.

## Data
| Field | API | Notes |
|---|---|---|
| List | API-ADM-07 | admin only; email visible only here |
| Suspend | API-ADM-08 | reason required; user blocked everywhere (`ACCOUNT_SUSPENDED`) |
| Unsuspend | API-ADM-09 | |
| Role | API-ADM-10 | cannot demote self (`FORBIDDEN`) |

## Components
`AdminTable` (033) · `ConfirmDialog` (029) · `StatusBadge` (007) · `ToastProvider` (036).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| table skeleton | "Tidak ada pengguna" (search miss) | `ErrorState` + retry | `/403` for moderators (admin-only page) | — |

## Copy keys
`admin.users.title` · `admin.users.search` · `admin.users.role` · `admin.users.status` ·
`admin.users.suspend` · `admin.users.suspend.reason` · `admin.users.unsuspend` ·
`admin.users.role.change` · `admin.users.selfDemoteError` ("Kamu tidak bisa menurunkan peranmu sendiri").

## Analytics
`admin_users_viewed`, `admin_user_suspended`, `admin_user_unsuspended`, `admin_user_role_changed{role}`.

## Accessibility
- Search results announced as a live count; table rows keyboard reachable.
- Suspend confirmation names the user and states the consequence in plain language.

## Test hooks
`admin-users-table`, `admin-user-row-<id>`, `admin-user-suspend`, `admin-user-suspend-reason`,
`admin-user-unsuspend`, `admin-user-role-select`.

## Open questions
- `OPEN`: whether moderators should be able to view (not edit) users in their campus (recommended yes for context).
