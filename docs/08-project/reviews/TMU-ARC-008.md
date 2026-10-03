---
id: REV-TMU-ARC-008
task: TMU-ARC-008
title: "Review and approve Async Jobs and Queues (08-async-jobs-and-queues.md)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-03
cycle: 1
---

# TMU-ARC-008 — Review cycle 1

Diff reviewed: `origin/main...HEAD` on branch `agent/arch/TMU-ARC-008-review-async-jobs-queues`.
Files reviewed: `docs/03-architecture/08-async-jobs-and-queues.md`, `tasks/TMU-ARC-008.md`.

## Summary

**APPROVE — cycle 1 of 1.** 0 BLOCKER / 0 MAJOR / 0 MINOR.
`docs/03-architecture/08-async-jobs-and-queues.md` has been audited against Blueprint §4.4 and §5A.7.
All 8 pg-boss background queues (`report.process`, `report.match`, `notify.send`, `report.expire-sweep`,
`claim.expire-sweep`, `media.cleanup`, `account.delete`, and `matching.reindex`) are specified with payloads,
idempotency rules, retry policies, dead-letter `needs_reprocess` handling, WIB scheduling, and queue metrics.
Front-matter status is advanced to `approved`.

## Blueprint §4.4 Specification Audit

| Requirement | Section | Status | Verification Detail |
|---|---|---|---|
| Queues & payloads | §Queues | PASS | 8 queues defined with explicit payloads, triggers, retry policies, and dead-letter escalations. |
| Idempotency rules | §Idempotency rules | PASS | 6 concrete idempotency rules covering DB constraints, version matching, and logging. |
| Failure handling | §Failure handling | PASS | Flowchart LR classifying retryable vs non-retryable errors and dead-letter `needs_reprocess` flags. |
| Concurrency & ordering | §Ordering and concurrency | PASS | Singleton keys (`report.process:<id>`), worker concurrency limits, and 8s ML sequential timeouts. |
| Scheduling & time zones | §Scheduling and time zones | PASS | `Asia/Jakarta` (WIB) time zone pinned for cron sweeps and 07:00 WIB daily digests. |
| Observability | §Observability | PASS | Alerts for queue depth (> 100 for 15 min), non-zero dead-letters, and duration anomalies. |
| Front-matter | header | PASS | `status: approved`, `updated: 2026-10-03`. |

## Acceptance Criteria Verification

- [x] **AC 1 (Queues & Dead-letter Documented):** All pg-boss queues, payloads, backoff, and dead-letter handling documented.
- [x] **AC 2 (Approval Status):** Front-matter `status: approved` and `updated: 2026-10-03` set.
- [x] **AC 3 (Gate Check):** `pnpm gate:quick` exits 0 with all checks green.
