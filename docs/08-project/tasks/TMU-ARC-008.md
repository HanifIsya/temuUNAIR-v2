---
id: TMU-ARC-008
title: Review and approve Async Jobs and Queues (08-async-jobs-and-queues.md)
status: TODO
lane: arch
slug: review-async-jobs-queues
milestone: M2
priority: P2
owner: architect
deps: [TMU-DOC-020]
refs: [ARCH-JOBS, BLUEPRINT]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-ARC-008 — Review and approve Async Jobs and Queues (08-async-jobs-and-queues.md)

## Goal

Review `docs/03-architecture/08-async-jobs-and-queues.md` against Blueprint §4.4 (queues, retries,
idempotency, dead-letter, cron jobs, pg-boss), fix findings, and advance status to `approved`.

## Acceptance criteria

- [ ] All pg-boss queues, job payloads, backoff policies, and dead-letter handling are documented.
- [ ] Front-matter `status` is `approved`, with `updated:` bumped.
- [ ] `pnpm gate:quick` green.
