---
id: SCR-018
title: Admin reports queue
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["SCR-017", "14-admin-console-design", "CMP"]
source_refs: ["FE-01", "API-ADM-01..04", "API-ADM-16..17", "FR-ADM-001", "FR-REP-010"]
---

# SCR-018 — Admin reports (`/admin/reports`)

## Purpose
Review flagged and pending reports, approve or remove them, and resolve flags — all without
losing queue position.

## Entry points / exits
Entry: `/admin` "Butuh perhatian", admin sidebar. Exits: detail drawer (stays in queue),
`/reports/[id]` for public view.

## Layout regions
1. Toolbar: status filter (default `PENDING_REVIEW`), flag filter, campus (admins), search,
   sort by age.
2. `AdminTable<ReportModeratorView>`: thumbnail (masked state shown), title, category,
   campus, flags count, age, status.
3. `ModerationDrawer` on row open: photos (masked/unmasked for staff per policy), full text,
   flags with reasons, hint answers (with warning), report history.
4. Drawer actions: Setujui (ADM-02) · Hapus + alasan (ADM-03) · Pulihkan (ADM-04, admin) ·
   resolve flags (ADM-17).

## Data
| Field | API | Notes |
|---|---|---|
| Queue | API-ADM-01 | cursor pagination; campus scoping server-side |
| Approve | API-ADM-02 | `CONFLICT_STATE` if already actioned |
| Remove | API-ADM-03 | reason required; notifies owner |
| Restore | API-ADM-04 | admin only |
| Flags | API-ADM-16/17 | resolve with action + note |

## Components
`AdminTable` (033) · `ModerationDrawer` (034) · `StatusBadge` (007) · `ConfirmDialog` (029) ·
`ToastProvider` (036).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| table skeleton | "Antrian kosong 🎉" | `ErrorState` + retry; action failure → toast with requestId | `/403` for USER | — |

## Copy keys
`admin.reports.title` · `admin.reports.filter.status` · `admin.reports.filter.flagged` ·
`admin.reports.approve` · `admin.reports.remove` · `admin.reports.remove.reason` ·
`admin.reports.restore` · `admin.reports.hintAnswers.warning` ("Jangan bagikan jawaban ini") ·
`admin.reports.flags.title`.

## Analytics
`admin_reports_viewed`, `admin_report_approved`, `admin_report_removed{reason}`,
`admin_flag_resolved{action}`.

## Accessibility
- Table rows are reachable and openable by keyboard; drawer traps focus and restores it.
- Removal requires a reason with an explicit error if empty.
- Hint answers are behind a "Tampilkan jawaban" disclosure (reduce accidental exposure).

## Test hooks
`admin-reports-table`, `admin-report-row-<id>`, `admin-report-approve`, `admin-report-remove`,
`admin-report-remove-reason`, `admin-report-restore`, `admin-flag-resolve`.

## Open questions
- `OPEN`: whether moderators may see unmasked sensitive photos by default or need a second confirm step (recommended: confirm step, audited).
