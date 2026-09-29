---
id: ADR-0005
title: pg-boss on PostgreSQL instead of Redis
status: accepted
owner: AR
updated: 2026-09-29
depends_on: ["ADR-0003", "ARCH-JOBS"]
source_refs: ["DEC-013", "Blueprint §5A.7"]
---

# ADR-0005 — pg-boss on PostgreSQL instead of Redis

## Context

Matching, notifications, expiry sweeps, media cleanup and account deletion need reliable
background processing with retries and scheduling. The team already runs PostgreSQL.

## Options

1. **Redis + BullMQ** — mature, fast, but adds a service to run, secure, back up and monitor
   (and Redis persistence semantics to reason about).
2. **pg-boss on PostgreSQL** — transactional enqueue with the business write (same DB
   transaction), durable, cron support, retries and dead-letter, no extra service.
3. **In-process cron in the web app** — no durability, breaks on multi-instance, rejected.

## Decision

Option 2. `apps/worker` runs pg-boss consumers; the web app only enqueues. Queues, retries and
payloads are specified in `BE-07`.

## Consequences

- Enqueue-in-transaction: a report row and its `report.process` job commit together — no lost
  jobs, no ghost jobs.
- One datastore to operate and back up; `pgboss` schema is owned by the library.
- Throughput is bounded by Postgres, which is far above campus-scale needs (NFR-070).
- Long jobs hold DB connections: keep jobs short, use concurrency caps, and avoid long
  transactions (noted in review checklist).
- If throughput ever demands it, migrating to Redis/BullMQ is contained inside `apps/worker`
  handlers; payload contracts stay the same.
