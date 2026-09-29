---
id: BE-07
title: Job and event contract
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-JOBS", "BE-05"]
source_refs: ["Blueprint §5A.7", "DEC-013"]
---

# BE-07 — Job and event contract

Queueing: pg-boss on the same Postgres (ADR-0005). Payloads are Zod-validated at both enqueue
and consume time. All handlers are idempotent (safe to run twice) and log `jobId`, entity id and
`durationMs`.

## Queues

| Queue | Payload schema | Trigger | Behaviour | Retry |
|---|---|---|---|---|
| `report.process` | `{ reportId: Uuid }` | R1 create; PATCH changing text/images | wait for images READY → ML (`analyze-image` per image, `embed-text`, `extract-attributes`) → write features → enqueue `report.match` | 3×, exp 30 s base → dead-letter + `reports.needs_reprocess = true` |
| `report.match` | `{ reportId: Uuid, reason: "process"\|"rematch"\|"renew"\|"reindex" }` | after process, rematch, renew | candidate retrieval + scoring (`MATCH-SPEC`) → upsert matches → R2 transition → enqueue `notify.send` | 3× |
| `notify.send` | `{ notificationId: Uuid }` | any notification | email if enabled; dedupe by `dedupe_key`; digest batching | 5×, 1 min → 1 h |
| `report.expire-sweep` | `{}` (cron `0 2 * * *` Asia/Jakarta) | schedule | R8 + day-76 warnings | — |
| `claim.expire-sweep` | `{}` (cron `*/30 * * * *`) | schedule | C8, C9, 48 h reminders | — |
| `media.cleanup` | `{}` (cron daily 03:30 WIB) | schedule | delete unattached uploads > 24 h, rejected images, orphan objects | — |
| `account.delete` | `{ userId: Uuid }` | `DELETE /me` after 7-day cool-off | anonymize user, remove images, keep audit stubs | 3× |
| `matching.reindex` | `{ scope: "all"\|"campus"\|"report", campus?, reportId?, algoVersion }` | admin | recompute features/matches for the new `algo_version` | — |

## Retry and dead-letter policy

| Outcome | Class | Action |
|---|---|---|
| `429`, `5xx`, timeout, connection reset | retryable | exponential backoff (base 30 s for process/match; 1 min for notify) |
| `400`, `401`, `404`, `415`, `422` | non-retryable | log once, mark entity where applicable, no retry |
| Attempts exhausted | dead-letter | log + alert; `report.process` sets `needs_reprocess`; admin sees it in `/admin/reports` filter |

## Idempotency rules

1. `report.process` exits early when `report_features.model_versions` already match the current
   model versions and the report has not changed since `processed_at`.
2. `report.match` upserts on `(lost_report_id, found_report_id)`; recomputing never duplicates.
3. `notify.send` is a no-op if `notifications.emailed_at` is set or the dedupe key already sent.
4. Sweeps are state-guarded (`WHERE status = … AND expires_at < now()`) so double runs are safe.
5. `account.delete` re-checks `users.status` before anonymizing.
6. `matching.reindex` writes `algo_version` and is resumable in chunks.

## Ordering and singleton keys

| Queue | Singleton key | Effect |
|---|---|---|
| `report.process` | `reportId` | one in-flight process per report |
| `report.match` | `reportId` | one in-flight match run per report |
| `account.delete` | `userId` | one deletion per user |
| `matching.reindex` | `scope` | one reindex at a time |

## Scheduled jobs (cron, WIB)

| Queue | Schedule | What it does |
|---|---|---|
| `report.expire-sweep` | `0 2 * * *` | R8 expiry + day-76 warning notifications + match invalidation |
| `claim.expire-sweep` | `*/30 * * * *` | C8 expiry (72 h), C9 escalation (one-sided 72 h), 48 h reminders |
| `media.cleanup` | `30 3 * * *` | orphan uploads, rejected images, expired notification rows (6 months), old messages per retention |
| `account.delete` | on demand | scheduled after cool-off |

## Event emissions (internal)

Domain events are **not** a separate bus in MVP: they are function calls inside services that
create notification rows and enqueue jobs. The names below are the canonical event names used in
code and analytics:

| Event | Emitted when | Consumers |
|---|---|---|
| `report.created` | R1 | enqueue `report.process`; analytics |
| `report.processed` | features written | enqueue `report.match` |
| `match.suggested` | R2 | notification (`MATCH_SUGGESTED`) |
| `claim.submitted` | C1 | notification, chat thread |
| `claim.approved` / `claim.rejected` | C2/C3 | notifications, report transitions |
| `claim.completed` | C6 | report transitions, notifications |
| `claim.disputed` | C4 | moderator notification |
| `report.returned` | R6 | notifications |
| `report.expired` / `report.expiring` | R8/sweep | notifications |

## Testing requirements

- Unit: handler logic with faked repositories/ML.
- Integration (testcontainers): enqueue → run → assert DB state; run twice to prove idempotency.
- Contract: payload schemas exported from `packages/contracts` and validated in tests.
- E2E: `ML_MODE=stub` keeps timing deterministic; sweeps are triggered via an admin/test-only
  endpoint in test mode only (`OPEN`: a `POST /admin/jobs/{queue}/run` test hook — must be
  disabled in production).
