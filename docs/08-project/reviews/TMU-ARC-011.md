---
id: REV-TMU-ARC-011
task: TMU-ARC-011
title: "Review and approve Notification Design (11-notification-design.md)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-ARC-011 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/arch/TMU-ARC-011-review-notification-design`.
Files reviewed: `docs/03-architecture/11-notification-design.md`, `tasks/TMU-ARC-011.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
`docs/03-architecture/11-notification-design.md` has been audited against Blueprint §4.4 and §5A.10.
It documents in-app vs email routing, deduplication keys (`dedupe_key`), batching strategies
(15-minute chat windows and 07:00 WIB daily digests for POSSIBLE matches), user preferences with
granular muting, strict payload hygiene, and retry/dead-letter failure handling. Front-matter status
is advanced to `approved`.

## Blueprint §4.4 Specification Audit

| Requirement | Section | Status | Verification Detail |
|---|---|---|---|
| Channels | §Channels | PASS | In-app (30s poll), Email (immediate / digest), Digest (07:00 WIB), Phase-2 SSE. |
| Notification flow | §Flow | PASS | Flowchart LR: Domain event → row creation with dedupe_key → enqueue notify.send → channel routing. |
| Deduplication & batching | §Dedupe and batching | PASS | Key formats (`claim:{id}:decision`, `msg:{claimId}:{window}`, etc.), 15m chat batching, daily digest window. |
| User preferences | §Preferences | PASS | `email_enabled`, `muted_types[]`, and recipient locale handling per `/me/settings`. |
| Payload hygiene | §Payload discipline | PASS | Payload carries IDs, titles, and bands only; never emails, hint answers, or embeddings. |
| Failure handling | §Failure handling | PASS | 5 retries (1m → 1h) then dead-letter; bounced address logging. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

## Acceptance Criteria Verification

- [x] **AC 1 (Channels & Routing Documented):** In-app vs email routing, dedupe key generation, and daily digest windows documented.
- [x] **AC 2 (Approval Status):** Front-matter `status: approved` and `updated: 2026-10-03` set.
- [x] **AC 3 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
