---
id: OPS-MONITORING
title: Monitoring and alerts
status: draft
owner: OR
updated: 2026-09-29
depends_on: ["OBSERVABILITY", "PERF-BUDGET"]
source_refs: ["NFR-082", "Blueprint §4.8"]
---

# Monitoring and alerts

## Health checks

| Check | Endpoint | Expected | Frequency |
|---|---|---|---|
| Liveness | `GET /healthz` | `{"status":"ok"}` | 1 min |
| Readiness | `GET /readyz` | `db:ok`, `storage:ok`, `ml:ok|degraded` | 1 min |
| ML health | `GET /health`, `/ready` (internal) | models loaded | 1 min |

## Dashboards

| Dashboard | Panels |
|---|---|
| Service health | request rate, 5xx %, p95 latency, readyz states |
| Queue health | depth per queue, failures, job duration p95 |
| Matching | matches by band, `report.process` duration, ML latency, dead letters |
| Product | reports/day, claims/day, returns/day, expiry sweep counts |
| Security | auth failures, rate-limit hits, domain-rejection count |

Implementation depends on hosting (DEC-011): Grafana/Prometheus if self-hosted, or hosted APM.
Until then: log queries + the `/admin` stats page + a simple uptime check.

## Alert thresholds (starting points)

| Alert | Condition | Severity | Action |
|---|---|---|---|
| API 5xx spike | > 2% for 10 min | high | check logs, rollback if a deploy preceded |
| API latency | p95 > 1 s for 10 min | medium | check DB and queue depth |
| Queue depth | > 100 for 15 min | medium | scale worker concurrency / investigate |
| Job dead-letter | any `report.process` dead-letter | high | inspect ML/storage; reports stuck `needs_reprocess` |
| ML latency | `analyze-image` p95 > 3 s | medium | check CPU, batching, model warm-up |
| ML down | `/ready` failing for 5 min | medium | matching degrades gracefully; investigate |
| Expiry sweep missed | no sweep log by 03:00 WIB | high | cron/pg-boss issue; run manually |
| Disk usage | > 80% | high | prune logs/backups, expand volume |
| Auth failures | > 50/min sustained | medium | possible credential stuffing; check IP limits |
| Backup failure | job failed twice | high | investigate before next window |

Every alert links to a runbook section (`02-deployment-runbook.md`, `05-incident-response.md`).

## Log queries (examples)

```sql
-- slowest endpoints today (if logs are in Postgres/ClickHouse)
SELECT route, percentile_cont(0.95) WITHIN GROUP (ORDER BY duration_ms) AS p95
FROM request_logs WHERE time > now() - interval '1 day' GROUP BY route ORDER BY p95 DESC LIMIT 20;
```

```bash
# dead letters in the last hour
grep '"queue":"report.process"' logs/worker.log | grep '"outcome":"dead-letter"' | wc -l
```

## Product-level checks (weekly)

| Check | Query | Expected |
|---|---|---|
| Reports stuck in PENDING_REVIEW > 48 h | reports + flags | 0 or explained |
| `needs_reprocess` count | reports | 0 or explained |
| Deletion requests honoured | `account.delete` logs | 100% within cool-off + 1 day |
| Notification dedupe | duplicate `dedupe_key` count | 0 |

## Uptime and on-call

- Uptime check from an external service (or a cron with `curl`) hits `/healthz` every minute.
- On-call paging is out of scope for coursework; alerts go to a shared channel/email.
- Human-gated deploys reduce the need for 24/7 response.
