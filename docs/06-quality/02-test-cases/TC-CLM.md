---
id: TC-CLM
title: Test cases — CLAIM, CHAT, HANDOVER
status: draft
owner: QA
updated: 2026-09-29
depends_on: ["AC", "BE-13"]
source_refs: ["FR-CLM-001..009", "FR-CHT-001..004", "FR-HND-001..003", "US-030..037"]
---

# TC-CLM — claims, chat, handover

## Challenge and submission

| TC | Case | Derives from | Automated path |
|---|---|---|---|
| TC-CLM-001 | `GET /reports/{id}/challenge` returns prompts only (no answers) | FR-CLM-001 | `tests/claims/challenge.spec.ts` |
| TC-CLM-002 | Owner calling the challenge on their own report → `SELF_CLAIM_NOT_ALLOWED` | FR-CLM-006 | same |
| TC-CLM-003 | Challenge on a non-FOUND or non-claimable report → `REPORT_NOT_CLAIMABLE` | FR-CLM-006 | same |
| TC-CLM-004 | Claim with valid answers → 201, chat thread created, finder notified | FR-CLM-001 | `tests/claims/create.spec.ts` |
| TC-CLM-005 | Second active claim by the same claimant → `CLAIM_ALREADY_ACTIVE` | FR-CLM-007 | same |
| TC-CLM-006 | Fourth claim of the day → `CLAIM_LIMIT_EXCEEDED` | FR-CLM-007 | `tests/claims/limits.spec.ts` |
| TC-CLM-007 | After 3 rejections on the same report → `CLAIM_LIMIT_EXCEEDED` | FR-CLM-008 | same |
| TC-CLM-008 | Claim answers are ≤200 chars; 1–3 answers required | FR-CLM-001 | `tests/claims/validation.spec.ts` |
| TC-CLM-009 | `Idempotency-Key` behaviour on claim create | BE-01 | `tests/claims/idempotency.spec.ts` |

## Decision and disputes

| TC | Case | Derives from | Automated path |
|---|---|---|---|
| TC-CLM-010 | Finder sees claimant answers next to expected answers; claimant sees only their own | FR-CLM-002 | `tests/claims/detail.spec.ts` |
| TC-CLM-011 | Approve → `APPROVED`, report `IN_VERIFICATION`, other SUBMITTED claims rejected with reason | FR-CLM-003 | `tests/claims/approve.spec.ts` |
| TC-CLM-012 | Approving a second claim on the same report → 409 (unique index) | FR-CLM-007 | same |
| TC-CLM-013 | Reject requires a reason; claimant notified | FR-CLM-003 | `tests/claims/reject.spec.ts` |
| TC-CLM-014 | Non-party cannot read or act on the claim | FR-CLM-002 | `tests/claims/access.spec.ts` |
| TC-CLM-015 | Dispute routes to the moderator queue and notifies campus moderators | FR-CLM-004 | `tests/claims/dispute.spec.ts` |
| TC-CLM-016 | Moderator resolves with a required note; audit row written | FR-ADM-002 | `tests/admin/disputes.spec.ts` |
| TC-CLM-017 | Claimant cancel → `CANCELLED`; report reverts per R5 | FR-CLM-005 | `tests/claims/cancel.spec.ts` |
| TC-CLM-018 | Finder cancelling an APPROVED claim requires a reason | FR-CLM-005 | same |

## Expiry and escalation

| TC | Case | Derives from | Automated path |
|---|---|---|---|
| TC-CLM-019 | 48 h reminder sent once (dedupe) | FR-CLM-009 | `tests/jobs/claim-sweep.spec.ts` |
| TC-CLM-020 | 72 h SUBMITTED → EXPIRED, report reverts | FR-CLM-009 | same |
| TC-CLM-021 | One-sided APPROVED confirmation > 72 h → DISPUTED (never auto-complete) | FR-CLM-009 | same |
| TC-CLM-022 | Sweep is idempotent (double run has no extra effect) | BE-07 | same |

## Chat

| TC | Case | Derives from | Automated path |
|---|---|---|---|
| TC-CHT-001 | Parties and moderators can read messages; others get 403 | FR-CHT-001 | `tests/chat/access.spec.ts` |
| TC-CHT-002 | Message ≤1000 chars; longer → 422 | FR-CHT-002 | `tests/chat/send.spec.ts` |
| TC-CHT-003 | Sending on a closed claim → 409 | FR-CHT-002 | same |
| TC-CHT-004 | Rate limit 20/min | FR-CHT-002 | `tests/chat/rate-limit.spec.ts` |
| TC-CHT-005 | Cursor pagination returns messages oldest→newest within pages | FR-CHT-003 | `tests/chat/pagination.spec.ts` |
| TC-CHT-006 | `messages/read` sets `read_at` up to the given message | FR-CHT-003 | `tests/chat/read.spec.ts` |
| TC-CHT-007 | Message notification dedupes per 15-minute window | FR-NTF-003 | `tests/notifications/message-dedupe.spec.ts` |

## Handover

| TC | Case | Derives from | Automated path |
|---|---|---|---|
| TC-HND-001 | Plan requires `place` and `at`; saving notifies the counterpart | FR-HND-001 | `tests/claims/handover-plan.spec.ts` |
| TC-HND-002 | One confirmation keeps the claim APPROVED with the timestamp set | FR-HND-002 | `tests/claims/handover-confirm.spec.ts` |
| TC-HND-003 | Both confirmations → COMPLETED; both reports RETURNED with `resolved_at`; other matches INVALIDATED | FR-HND-002 | same |
| TC-HND-004 | Handover actions only on APPROVED claims | FR-HND-001 | same |
| TC-HND-005 | Non-party cannot confirm | FR-HND-002 | `tests/claims/access.spec.ts` |
