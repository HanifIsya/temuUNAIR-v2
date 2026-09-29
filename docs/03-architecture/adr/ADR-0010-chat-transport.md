---
id: ADR-0010
title: Polling-first chat transport with an SSE upgrade path
status: accepted
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-CHAT"]
source_refs: ["DEC-009", "Blueprint §5A.3 API-CHT-03"]
---

# ADR-0010 — Polling-first chat transport with an SSE upgrade path

## Context

Claim chat must feel responsive but runs on a course-scale deployment with no Redis and no
dedicated realtime service. The blueprint specifies polling first, SSE later.

## Options

1. **WebSocket service** — best realtime, but needs sticky sessions or a pub/sub layer (Redis),
   which DEC-013 excludes; heavy for MVP.
2. **Server-Sent Events (SSE)** — one-way push over HTTP, works with the Next.js runtime, but
   adds connection management and a fallback path anyway.
3. **Polling** — simplest; cursor-based `GET /claims/{id}/messages` every 5 s while the room is
   open; pauses when the tab is hidden.

## Decision

Option 3 for MVP, with the API surface (`API-CHT-03 GET /claims/{id}/stream`) reserved so the
upgrade to SSE (option 2) requires **no component changes**: `ChatThread` receives the same
props whether messages arrive by poll or push.

## Consequences

- Zero extra infrastructure; works behind any proxy; deterministic in E2E tests.
- Message latency up to ~5 s in the claim room; acceptable for campus handover coordination.
- The client polling layer must dedupe by message id and stop polling when hidden or offline.
- Notification bell polling (30 s) and claim detail polling (15 s) follow the same pattern.
- When SSE lands, polling remains the fallback if the stream fails; a feature flag decides the
  transport per environment.
- If multi-instance web replicas arrive before SSE, polling needs no coordination — another
  reason it is the safe first choice.
