---
id: REV-TMU-DOC-017
task: TMU-DOC-017
title: "Review and approve the state designs and notification templates"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-DOC-017 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/docs/TMU-DOC-017-review-states-templates`.
Files reviewed: `12-empty-error-loading-states.md`, `13-notification-and-email-templates.md`, `tasks/TMU-DOC-017.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
Both `12-empty-error-loading-states.md` and `13-notification-and-email-templates.md` have been audited
against their Blueprint §4 specifications, verified for alignment with `FE-06` and `BE-08` contracts,
and advanced to `status: approved`. The state designs exhaustively cover loading, empty, error,
forbidden/not-found, and offline states across all application views. The notification templates
cover all 15 notification types defined in `BE-08` with dual-language (`id` and `en`) copy for both
in-app and email channels.

## Blueprint §4 Specification Audit

### 1. `docs/02-design/12-empty-error-loading-states.md`

Blueprint §4 requirements: *Per-screen state designs (empty/error/loading/offline per FE-06)*

| Area | Status | Verification Detail |
|---|---|---|
| Shared patterns | PASS | Skeletons (300 ms delay), actionable empty states with CTAs, plain language `ErrorState` with copyable `requestId`, silent 404 for hidden items, and offline banner with mutation locking. |
| Page matrix | PASS | Complete state matrix covering `/home`, `/reports`, `/reports/[id]`, `/reports/new`, `/reports/[id]/matches`, `/claims`, `/claims/[id]`, `/notifications`, `/me/reports`, `/me/settings`, and `/admin/*`. |
| Component states | PASS | Specific state requirements for `PhotoUploader`, `ChatThread`, `HandoverPanel`, `StatusStepper`, `MatchCard`, and `AdminTable`. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

### 2. `docs/02-design/13-notification-and-email-templates.md`

Blueprint §4 requirements: *Every `NotificationType` with in-app + email copy, id/en*

| NotificationType | In-App (`id`/`en`) | Email (`id`/`en`) | Status |
|---|---|---|---|
| `MATCH_SUGGESTED` | Yes | Yes (STRONG immediate / POSSIBLE digest) | PASS |
| `MATCH_INVITE` | Yes | Yes | PASS |
| `CLAIM_SUBMITTED` | Yes | Yes | PASS |
| `CLAIM_APPROVED` | Yes | Yes | PASS |
| `CLAIM_REJECTED` | Yes | Yes | PASS |
| `CLAIM_REMINDER` | Yes | Yes | PASS |
| `MESSAGE_RECEIVED` | Yes | Yes (15-min unread digest) | PASS |
| `HANDOVER_PLANNED` | Yes | Yes | PASS |
| `HANDOVER_CONFIRMED` | Yes | Yes | PASS |
| `REPORT_RETURNED` | Yes | Yes | PASS |
| `REPORT_EXPIRING` | Yes | Yes | PASS |
| `REPORT_EXPIRED` | Yes | Yes | PASS |
| `REPORT_REMOVED` | Yes | Yes | PASS |
| `REPORT_APPROVED` | Yes | Yes | PASS |
| `ADMIN_DISPUTE` | Yes | In-app only (per `BE-08` staff rule) | PASS |
| Contract fidelity | all | Covers exactly the 15 types in `BE-08`; 0 invented types. | PASS |
| Front-matter | header | `status: approved`, `updated: 2026-10-03`. | PASS |

## Acceptance Criteria Verification

- [x] **AC 1 (Section Completeness):** All required sections per Blueprint §4 are present in both documents.
- [x] **AC 2 (NotificationType Coverage):** All 15 `BE-08` notification types are fully templated in `id` and `en` without inventing types outside `BE-08`.
- [x] **AC 3 (State Alignment):** Per-screen states align directly with screen specs and `FE-06`.
- [x] **AC 4 (Approval Status):** Front-matter `status: approved` and `updated: 2026-10-03` set on both docs.
- [x] **AC 5 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
