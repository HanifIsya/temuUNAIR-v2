---
id: OBSERVABILITY
title: Observability
status: approved
owner: AR
updated: 2026-10-03
depends_on: ["ARCH-OVERVIEW", "ARCH-JOBS", "NFR"]
source_refs: ["NFR-081, NFR-082", "Blueprint §5A.7"]
---

# Observability

Goals: answer "is it healthy?", "what broke for this user?", "is matching working?" — without
ever logging PII.

## Structured logs

- Library: `pino`; JSON in production, pretty in dev.
- Required fields: `time`, `level`, `service` (`web`|`worker`|`ml`), `requestId` or `jobId`,
  `route`/`queue`, `durationMs`, `status`/`outcome`.
- Never logged: emails, hint answers, message bodies, image URLs, tokens, cookies (redaction
  list in `15-privacy-and-data-retention.md`).
- Request correlation: `X-Request-Id` accepted or generated at the edge, echoed on every
  response and included in error envelopes (`requestId`).

## Metrics

| Metric | Type | Source | Alert |
|---|---|---|---|
| `http_requests_total{route,status}` | counter | web middleware | 5xx rate > 2% for 10 min |
| `http_request_duration_ms{route}` | histogram | web middleware | p95 > 1 s for 10 min |
| `queue_depth{queue}` | gauge | pg-boss tables | > 100 for 15 min |
| `job_duration_ms{queue}` | histogram | worker | `report.process` p95 > 30 s |
| `job_failures_total{queue}` | counter | worker | any dead-letter |
| `ml_requests_total{endpoint,status}` | counter | ML service | 5xx rate > 5% |
| `ml_request_duration_ms{endpoint}` | histogram | ML service | `analyze-image` p95 > 3 s |
| `matches_created_total{band}` | counter | worker | sudden drop vs 7-day average |
| `reports_status_total{status}` | gauge | DB view | expiry sweep not running |
| `db_pool_in_use` | gauge | web/worker | saturation |

Implementation: a thin metrics module (prom-client) exposed at `/metrics` on an internal port
(not public); the ML service uses `prometheus-fastapi-instrumentator`.

## Traces

- Optional in MVP; if enabled, OpenTelemetry with sampling 10%, spans for HTTP handlers, jobs
  and ML calls. Never attach payloads to spans.
- `OPEN`: decide by M8 whether tracing is worth the operational cost at campus scale.

## Health endpoints

| Endpoint | Checks |
|---|---|
| `GET /healthz` | process alive → `{status:"ok"}` |
| `GET /readyz` | `db`, `storage`, `ml` each `ok|degraded|down` (see `API-SYS-02`) |
| ML `GET /health`, `/ready` | models loaded per `BE-06` |

`readyz` is what deploy scripts and uptime checks poll; `ml=down` does not fail readiness of the
web app (graceful degradation, NFR-012).

## Audit log (product-level observability)

- `audit_logs` records privileged mutations: actor, action, entity, before/after (redacted),
  ip_hash, request_id, timestamp. Append-only.
- Admin viewer at `/admin/audit` (`SCR-022`).

## Dashboards (target)

| Dashboard | Panels |
|---|---|
| Service health | request rate, 5xx %, p95 latency, readyz states |
| Queue health | depth per queue, failures, job duration p95 |
| Matching | matches by band, process duration, ML latency, dead letters |
| Product | reports/day, claims/day, returns/day, expiry sweep counts |
| Security | auth failures, rate-limit hits, domain-rejection count |

`OPEN`: hosting choice (DEC-011) determines whether dashboards are Grafana, a hosted APM, or
simple log-based panels. Until then, a `/admin` stats page plus log queries suffice.

## Alerting

- MVP: email/Slack to the team for the alert table above; thresholds are starting points and get
  tuned after M8 load checks.
- Every alert links to a runbook section (`docs/07-ops/04-monitoring-and-alerts.md`).
- Paging (on-call) is out of scope for coursework; human-gated deploys reduce the need.

## Log retention

- Application logs: 30 days (rotated).
- Audit logs: 12 months (DB).
- No log contains PII by construction; a sampled review is part of the security checklist.
