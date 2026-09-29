---
id: SCR-012
title: Claim room
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["SCR-010", "CMP", "FE-04"]
source_refs: ["FE-01", "API-CLM-04..10", "API-CHT-01..04", "FR-CLM-002..009", "FR-CHT-001..004", "FR-HND-001..003"]
---

# SCR-012 — Claim room (`/claims/[id]`)

## Purpose
The single workspace where a claim is decided, discussed and completed: status, answer
comparison, chat and handover — for both parties (and moderators read-only where applicable).

## Entry points / exits
Entry: claims list, notifications, chat deep links.
Exits: none (terminal states stay viewable); links to the two reports.

## Layout regions (mobile, stacked)
1. Header: claim id short, counterpart display name, `StatusStepper` (Diajukan → Disetujui →
   Serah terima → Selesai) with `ClaimTimeline` for history.
2. **AnswerCompare** — finder/moderator: claimant answers next to expected answers; claimant:
   their own answers only (no expected answers).
3. Finder decision panel (when `SUBMITTED`): Approve / Reject (reason required) / Dispute.
4. **ChatThread** + **ChatComposer** (disabled when claim closed).
5. **HandoverPanel**: plan (place, at, note), suggested drop points, two confirmation buttons.
6. Party actions: Dispute, Cancel (claimant; finder for APPROVED with reason).

## Data
| Field | API | Query key | Notes |
|---|---|---|---|
| Claim | API-CLM-04 | `['claims','detail',id]` | poll 15 s while open |
| Messages | API-CHT-01 | `['messages',claimId]` | poll 5 s; append optimistically on send |
| Send | API-CHT-02 | — | rollback on error |
| Read | API-CHT-04 | — | fire on room open and on scroll |
| Decision | API-CLM-05/06 | — | invalidate claim + reports |
| Handover | API-CLM-07/08 | — | two-sided confirmation |
| Dispute/Cancel | API-CLM-10/09 | — | reason required |

## Components
`StatusStepper` (008) · `AnswerCompare` (021) · `ClaimTimeline` (022) · `ChatThread` (023) ·
`ChatComposer` (024) · `HandoverPanel` (025) · `DropPointCard` (032) · `SafetyTipBanner` (031) ·
`ConfirmDialog` (029).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| room skeleton | "Belum ada pesan" + tips | `ErrorState`; message send failure → inline retry | `/403` or `NOT_FOUND` | composer disabled, banner "kamu sedang offline"; polling resumes |

## Copy keys
`claim.room.answers.title` · `claim.room.answers.expected` ("Jawaban yang diharapkan") ·
`claim.room.answers.claimant` ("Jawaban pengklaim") · `claim.room.approve` ·
`claim.room.reject` · `claim.room.reject.reason` · `claim.room.dispute` ·
`claim.room.handover.plan` · `claim.room.handover.confirm` ·
`claim.room.handover.waitingOther` ("Menunggu konfirmasi pihak lain") ·
`claim.room.closed` ("Klaim sudah selesai") · `claim.room.safety` ("Bertemu di area kampus yang ramai").

## Analytics
`claim_room_viewed{role}` · `claim_decision{decision}` · `handover_confirmed` ·
`message_sent` · `dispute_opened`.

## Accessibility
- `ChatThread` uses `aria-live="polite"` for new messages; day separators are headings.
- Decision buttons are in a labelled group; rejection reason field is required and linked.
- Handover confirmation shows two explicit states ("kamu" vs "pihak lain") not colour alone.

## Test hooks
`claim-room-stepper`, `claim-approve-button`, `claim-reject-button`, `claim-reject-reason`,
`chat-thread`, `chat-composer-input`, `chat-send-button`, `handover-plan-edit`,
`handover-confirm-button`, `claim-dispute-button`, `claim-cancel-button`.

## Open questions
- `OPEN`: whether the finder may edit hints after a claim exists (current: no).
- `OPEN`: whether chat is locked read-only after COMPLETED or stays open 7 days (retention).
