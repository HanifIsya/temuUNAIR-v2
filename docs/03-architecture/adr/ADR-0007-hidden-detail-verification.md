---
id: ADR-0007
title: Hidden-detail challenge for ownership verification
status: accepted
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-STATES", "THREAT-MODEL"]
source_refs: ["DEC-004", "Blueprint §1.3"]
---

# ADR-0007 — Hidden-detail challenge for ownership verification

## Context

"Verify ownership" has no mechanism in the PDF. The platform must let a finder decide whether a
claimant is the real owner without exposing private details publicly and without requiring
meetings before any screening.

## Options

1. **No verification** — first claim wins. Invites fraud; rejected.
2. **Public Q&A** ("sebutkan ciri-cirinya") — leaks details that enable fraud; rejected.
3. **Hidden-detail challenge** — the finder writes 1–3 private prompts + answers; a claimant
   answers; the finder (or a moderator) compares and decides. Answers never shown publicly.
4. **Proof uploads** (receipts, photos) — heavy, encourages collecting more PII, and is hard to
   adjudicate; could be a later enhancement inside chat.

## Decision

Option 3. `verification_hints` store prompts plus AES-GCM-encrypted answers
(`FIELD_ENCRYPTION_KEY`). Sensitive categories require ≥2 hints. Disputes go to moderators who
can see both answers and the chat history.

## Consequences

- The finder must be able to write good questions: the wizard suggests prompts per category and
  warns "jangan tulis jawaban di foto/deskripsi".
- Claimants can attempt at most 3 claims/day and are blocked after 3 rejections on the same
  report; the challenge is a soft gate, not a hard proof.
- Moderators become the trust backstop; disputes are first-class (`API-ADM-05/06`).
- Answers are secret at rest and in transit to non-owners; leaking them is a blocker-severity
  review finding.
- Hint answers are not searchable, not embedded, and never sent in notifications.
