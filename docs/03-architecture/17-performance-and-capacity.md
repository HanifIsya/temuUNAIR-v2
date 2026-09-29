---
id: PERFORMANCE
title: Performance and capacity
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["NFR", "ARCH-ML", "ARCH-JOBS"]
source_refs: ["NFR-001..006, NFR-070..072", "DEC-011"]
---

# Performance and capacity

## Budgets

| Layer | Metric | Budget | Measured by |
|---|---|---|---|
| API reads | p95 server time | ≤ 300 ms | CI perf test (M8), logs |
| API writes | p95 server time (excl. queued work) | ≤ 500 ms | logs |
| Page LCP | mobile 4G, key routes | ≤ 2.5 s | Lighthouse CI (M8) |
| JS bundle | gzip per route | ≤ 250 kB | build output check |
| ML `analyze-image` | p95 | ≤ 3 s | ML histogram |
| ML `embed-text` | p95 (≤20 texts) | ≤ 400 ms | ML histogram |
| Match scoring | per pair | ≤ 50 ms | worker logs |
| Image search | p95 incl. cached embedding | ≤ 800 ms | logs |
| DB queries | p95 | ≤ 100 ms | pg_stat_statements |

## Expected load (coursework scale)

| Dimension | Assumption | Peak factor |
|---|---|---|
| Registered users | 5,000 | 1.5× |
| Active reports | 2,000 (OPEN/MATCHED) | 1.5× |
| New reports/day | 50 | 3× at semester start |
| Concurrent users | 20 | 50 |
| Matches computed/day | ≤ 2,000 candidate evaluations | 5× |
| Images/day | 150 | 3× |
| ML calls/day | ~600 (process + text) | 3× |

## Capacity plan

| Component | Sizing | Notes |
|---|---|---|
| Web | 1 vCPU / 1 GB (dev), 2 vCPU / 2 GB (staging) | stateless, scale horizontally |
| Worker | 2 vCPU / 2 GB | concurrency 2 process + 4 match |
| ML | 2 vCPU / 2 GB, CPU-only | torch threads capped; batch where possible |
| Postgres | 2 vCPU / 4 GB / 20 GB SSD | pgvector + pg-boss in the same instance |
| Storage | 50 GB | originals + thumb + masked |
| Bandwidth | campus-scale | images dominate |

## Strategies

1. **Async everything expensive:** matching, notifications, cleanup run in the worker; the UI
   never waits for ML.
2. **Cache:** meta endpoints 1 h stale; lists 30 s; TanStack Query dedupes requests.
3. **Indexes:** browse composite, GIN FTS, HNSW vectors; `EXPLAIN` review for every new query in
   review.
4. **Pagination everywhere:** max 50; matches capped at top 10.
5. **Image discipline:** 480 px thumbnails in lists; originals only on detail; lazy loading.
6. **Batch ML text calls:** one `embed-text` request per report, not per field.
7. **Worker back-pressure:** pg-boss concurrency bounded; queue depth alerting.

## Degradation modes

| Condition | Behaviour |
|---|---|
| ML down | reports save; `needs_reprocess`; text-only browse works; `readyz.ml=down` |
| DB slow | queue depth grows; UI shows skeletons; retries with backoff |
| Storage slow | upload handshake fails fast with 503; no partial records |
| High load | rate limits protect writes; POSSIBLE notifications defer to digest |

## Verification plan

| When | What |
|---|---|
| M3 | Baseline smoke numbers on seeded data |
| M5 | Match job timing with 200 synthetic reports |
| M8 | Lighthouse + API perf tests in CI (`gate:full` optional job) |
| M9 | Load check with k6 (optional) against staging |

Any budget miss becomes a task with a target date; budgets are not silently relaxed (they live
in this doc and `docs/06-quality/06-performance-budget.md`).
