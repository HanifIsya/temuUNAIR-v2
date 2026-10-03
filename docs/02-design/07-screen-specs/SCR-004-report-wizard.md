---
id: SCR-004
title: Report wizard
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["FLOWS", "FE-05", "CMP"]
source_refs: ["FE-01", "FE-05", "API-META-*", "API-UPL-*", "API-REP-01", "API-SRC-01", "FR-REP-001..009"]
---

# SCR-004 — Report wizard (`/reports/new?type=lost|found`)

## Purpose
Create a LOST or FOUND report in under 60 seconds with as few fields as possible.

## Entry points / exits
Entry: home CTAs, "Lapor" bottom-nav action sheet, `/me/reports` empty state.
Exits: success screen → `/reports/[id]`; cancel → back with leave-guard if a draft exists.

## Layout regions
1. `WizardShell` header: back/cancel, step indicator ("Langkah 3/5"), draft-saved hint.
2. Step body (one `<h1>` per step).
3. Footer actions: "Kembali" / "Lanjut" (or "Kirim" on review).

## Steps
| # | LOST | FOUND |
|---|---|---|
| 1 | Kategori (`CategoryPicker`) | Kategori |
| 2 | Foto opsional (`PhotoUploader`) | Foto wajib ≥1 |
| 3 | Detail: judul, deskripsi, warna, merek | same |
| 4 | Lokasi & waktu (`LocationPicker`, `DateTimeRangePicker`) | same |
| 5 | Tinjau & kirim (+ duplicate preview) | Penitipan (`CustodyPicker`) |
| 6 | — | Pertanyaan verifikasi (`VerificationHintsEditor`) |
| 7 | — | Tinjau & kirim |

## Data
| Step | API | Notes |
|---|---|---|
| 1 | API-META-01 | categories + sensitive flags + hint suggestions |
| 4 | API-META-02/03/04 | campuses, locations, drop points |
| 2 | API-UPL-01..03 | presigned upload; poll status READY |
| 5 (LOST) | API-SRC-01 | "sudah ada yang menemukan?" preview (optional, skippable) |
| submit | API-REP-01 | `Idempotency-Key` per attempt; on 422 map `details.fields[]` |

## Components
`WizardShell` (009) · `CategoryPicker` (010) · `PhotoUploader` (011) · `LocationPicker` (013) ·
`DateTimeRangePicker` (014) · `VerificationHintsEditor` (015) · `SensitiveNotice` (016) ·
`ConfirmDialog` (029).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| meta skeletons on step 1; upload progress states idle→uploading %→processing→ready/rejected | n/a (form) | inline field errors + form alert with requestId; upload retry | 403 if suspended → `/403` | draft kept in `localStorage`; submit disabled with banner |

## Copy keys
`report.wizard.step.category.title` · `report.wizard.step.photos.title` ·
`report.wizard.step.details.title` · `report.wizard.step.where.title` ·
`report.wizard.step.custody.title` · `report.wizard.step.hints.title` ·
`report.wizard.step.review.title` · `report.wizard.success` ("Kami akan memberi tahu jika ada
kecocokan") · `report.wizard.duplicate.hint` · `report.wizard.hints.warning` ("Jangan tampilkan
jawaban di foto").

## Analytics
`report_wizard_started{type}`, `report_wizard_step_completed{type,step}`, `report_submitted{type,
category,imageCount,campus}`, `report_wizard_abandoned{type,step}`.

## Accessibility
- Focus moves to each step heading; `aria-current="step"` on the stepper.
- Photo upload is a keyboard-operable button (not drop-zone only); errors announced.
- Character counters linked via `aria-describedby`; no colour-only validation.

## Test hooks
`wizard-next`, `wizard-back`, `wizard-step-heading`, `category-option-<CATEGORY>`,
`photo-uploader-input`, `hints-add`, `hints-prompt-<n>`, `hints-answer-<n>`, `report-submit`.

## Open questions
- `OPEN`: should the LOST duplicate preview be blocking when a >0.75 band exists? (Current: advisory only.)
