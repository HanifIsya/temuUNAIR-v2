---
id: REV-TMU-ARC-012
task: TMU-ARC-012
title: "Review and approve Chat Design (12-chat-design.md)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-ARC-012 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/arch/TMU-ARC-012-review-chat-design`.
Files reviewed: `docs/03-architecture/12-chat-design.md`, `tasks/TMU-ARC-012.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
`docs/03-architecture/12-chat-design.md` has been audited against Blueprint §4.4 and §5A.3.
It specifies the in-app claim-scoped chat architecture: participant access rules, message constraints
(≤ 1000 plain text characters, 20 msg/min rate limits), MVP cursor-based 5s polling with background tab pause,
Phase-2 SSE upgrade path (`API-CHT-03`), message indexing, and retention guidelines. Front-matter status
is advanced to `approved`.

## Blueprint §4.4 Specification Audit

| Requirement | Section | Status | Verification Detail |
|---|---|---|---|
| Scope & access | §Scope and access | PASS | One thread per claim, party-restricted access, 1000 char cap, 20 msg/min rate limit, closed claim lock. |
| Transport & upgrade | §Transport | PASS | MVP 5s cursor polling with automatic tab visibility pause; Phase-2 SSE without component prop breaking changes. |
| Message lifecycle | §Message lifecycle | PASS | Sequence diagram: Sender → API → DB message insert → deduplicated notification creation → recipient fetch & read receipt. |
| Data & indexing | §Data and indexing | PASS | Composite index `(claim_id, created_at DESC)` for cursor pagination. |
| Moderation & safety | §Moderation and safety | PASS | Moderator read access during disputes, safety banner, and PII avoidance guidance. |
| Failure handling | §Failure modes | PASS | Optimistic send failure indicators, connection reconnect banners, and double-send prevention. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

## Acceptance Criteria Verification

- [x] **AC 1 (Chat Thread Scoping & Lifecycle):** Chat thread scoping to claims, polling intervals, rate limits, and phase-2 SSE upgrade paths documented.
- [x] **AC 2 (Approval Status):** Front-matter `status: approved` and `updated: 2026-10-03` set.
- [x] **AC 3 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
