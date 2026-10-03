---
id: SCR-007
title: Report edit
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["SCR-004", "FE-05"]
source_refs: ["FE-01", "API-REP-04", "API-REP-05", "API-UPL-*", "FR-REP-007"]
---

# SCR-007 — Report edit (`/reports/[id]/edit`)

## Purpose
Let the owner fix or enrich a report while it is `OPEN`/`MATCHED`, without losing its history.

## Entry points / exits
Entry: owner menu on detail, "Edit" on `/me/reports` rows. Exit: back to detail on save; cancel
returns without changes.

## Layout regions
Single scrollable form mirroring wizard steps (not stepped): photos, details, location & time,
custody (FOUND), hints (FOUND). Footer: sticky "Simpan perubahan" + "Batal".

## Data
| Field | API | Notes |
|---|---|---|
| Load | API-REP-04 | owner view incl. `version`, `hintPrompts`, `geo` |
| Save | API-REP-05 | `If-Match: version`; text/image change re-enqueues `report.process` |
| Images | API-UPL-* | add/remove; ≤5 total |

## Components
`PhotoUploader` (011) · `LocationPicker` (013) · `DateTimeRangePicker` (014) ·
`VerificationHintsEditor` (015) · `SensitiveNotice` (016) · `ConfirmDialog` (029).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| form skeleton | — | field errors; `409 CONFLICT_STATE` → refetch + toast "laporan berubah, muat ulang" | `/403` or `NOT_FOUND` | save disabled + banner; unsaved-changes guard |

## Copy keys
`report.edit.title` · `report.edit.save` · `report.edit.conflict` ("Laporan berubah di tab lain.
Muat ulang untuk melihat versi terbaru.") · `report.edit.requeue` ("Kami akan memeriksa ulang
kecocokan setelah perubahan disimpan.").

## Analytics
`report_edit_started`, `report_edited{changedFields}` (field names only).

## Accessibility
Same rules as the wizard: labels, `aria-describedby` errors, focus to first error on failed
submit, no colour-only signals.

## Test hooks
`report-edit-form`, `report-edit-save`, `report-edit-cancel`, `report-edit-conflict-banner`.

## Open questions
- `OPEN`: whether hint answers may be changed after a claim exists (recommended: no — only prompts before first claim).
