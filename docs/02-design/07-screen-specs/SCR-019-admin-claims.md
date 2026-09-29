---
id: SCR-019
title: Admin claims and disputes
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["SCR-018", "14-admin-console-design", "CMP"]
source_refs: ["FE-01", "API-ADM-05..06", "FR-ADM-002", "FR-CLM-004"]
---

# SCR-019 — Admin claims (`/admin/claims`)

## Purpose
Resolve disputed claims fairly with full context: both sides' answers, chat history and reports.

## Entry points / exits
Entry: `/admin` attention list, admin sidebar, `ADMIN_DISPUTE` notification. Exits: linked
reports; decision closes the row in place.

## Layout regions
1. Toolbar: status filter (default `DISPUTED`), campus (admins), age sort.
2. `AdminTable<ClaimView>`: item thumbnail, claimant vs finder display names, status, opened
   date, last activity, dispute reason preview.
3. Detail panel (drawer or split view): `AnswerCompare` with both answers, chat transcript
   (read-only), handover plan state, dispute reason, prior decisions.
4. Decision form: Approve / Reject + **required note** (ADM-06), with a reminder that the note
   is visible to parties and audited.

## Data
| Field | API | Notes |
|---|---|---|
| Queue | API-ADM-05 | campus scoping |
| Detail | API-CLM-04 | moderator view includes expected answers |
| Resolve | API-ADM-06 | `decision`, `note`; `CONFLICT_STATE` if already resolved |
| Chat | API-CHT-01 | read-only transcript |

## Components
`AdminTable` (033) · `AnswerCompare` (021) · `ClaimTimeline` (022) · `ConfirmDialog` (029) ·
`ToastProvider` (036).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| table skeleton | "Tidak ada sengketa" | `ErrorState` + retry | `/403` for USER | — |

## Copy keys
`admin.claims.title` · `admin.claims.filter.disputed` · `admin.claims.resolve.approve` ·
`admin.claims.resolve.reject` · `admin.claims.resolve.note` ("Catatan keputusan (wajib)") ·
`admin.claims.resolve.noteHint` ("Catatan ini terlihat oleh kedua pihak dan tercatat di audit") ·
`admin.claims.transcript.title`.

## Analytics
`admin_claims_viewed`, `admin_claim_resolved{decision}`.

## Accessibility
- Answer comparison pairs are announced as a list; expected vs claimant labels are explicit.
- Required note error announced; focus moves to the field.

## Test hooks
`admin-claims-table`, `admin-claim-row-<id>`, `admin-claim-approve`, `admin-claim-reject`,
`admin-claim-note`, `admin-claim-resolve-submit`.

## Open questions
- `OPEN`: whether moderators can also approve/reject non-disputed claims directly (current: only disputes + finder-side actions).
