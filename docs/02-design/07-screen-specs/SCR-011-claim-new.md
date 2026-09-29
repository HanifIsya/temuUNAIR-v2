---
id: SCR-011
title: Claim challenge form
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["SCR-006", "FE-05", "CMP"]
source_refs: ["FE-01", "API-CLM-01", "API-CLM-02", "FR-CLM-001", "FR-CLM-006..008", "DEC-004"]
---

# SCR-011 — Claim challenge (`/claims/new?reportId=`)

## Purpose
Let a claimant prove ownership by answering the finder's hidden-detail questions — without ever
seeing the answers.

## Entry points / exits
Entry: "Ini barang saya" on report detail, match card claim action.
Exits: claim room `/claims/[id]` on success; back to detail on cancel.

## Layout regions
1. Header: item thumbnail + title; reminder of what is being claimed.
2. Question list: one input per hint (`ChallengeForm`), prompt text visible, answers hidden.
3. Optional note to the finder (≤500 chars).
4. Remaining daily attempts indicator.
5. Submit button + safety note ("Jawaban tidak ditampilkan ke publik").

## Data
| Field | API | Notes |
|---|---|---|
| Prompts | API-CLM-01 | returns `items:[{hintId,prompt}]` only; 403 on own report |
| Submit | API-CLM-02 | `Idempotency-Key`; errors: `CLAIM_ALREADY_ACTIVE`, `CLAIM_LIMIT_EXCEEDED`, `REPORT_NOT_CLAIMABLE`, `SELF_CLAIM_NOT_ALLOWED` |

## Components
`ChallengeForm` (019) · `SafetyTipBanner` (031) · `ErrorState` (027).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| form skeleton | n/a | inline validation; quota errors show remaining attempts | own report → 403 message; non-claimable → 409 message with link back | submit disabled + banner |

## Copy keys
`claim.new.title` ("Buktikan ini barang kamu") · `claim.new.answer.label` ·
`claim.new.note.label` ("Catatan untuk penemu (opsional)") ·
`claim.new.submit` ("Kirim klaim") · `claim.new.attempts` ("Sisa percobaan hari ini: {n}") ·
`claim.new.selfError` ("Kamu tidak bisa mengklaim laporan sendiri").

## Analytics
`claim_started`, `claim_submitted`, `claim_submit_failed{code}` (code only).

## Accessibility
- Each input has a visible label using the prompt text; helper text explains secrecy.
- Errors announced; submit focus moves to the first invalid field.

## Test hooks
`challenge-form`, `challenge-answer-<hintId>`, `challenge-note`, `claim-submit-button`,
`claim-attempts-indicator`.

## Open questions
- `OPEN`: whether partial answers (fewer than all hints) should be allowed when >1 hint exists (current: min 1, max 3).
