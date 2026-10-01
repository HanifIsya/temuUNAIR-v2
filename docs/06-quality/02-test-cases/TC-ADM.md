---
id: TC-ADM
title: Test cases — ADMIN, NOTIFICATION, I18N
status: draft
owner: QA
updated: 2026-09-29
depends_on: ["AC", "BE-13"]
source_refs: ["FR-ADM-001..009", "FR-NTF-001..007", "FR-I18N-001..003"]
---

# TC-ADM — admin, notifications, i18n

## Moderation

| TC | Case | Derives from | Automated path |
|---|---|---|---|
| TC-ADM-001 | Moderator queue lists PENDING_REVIEW + flagged reports (campus-scoped) | FR-ADM-001 | `tests/admin/reports-queue.spec.ts` |
| TC-ADM-002 | Approve → OPEN; owner notified | FR-ADM-001 | `tests/admin/reports-actions.spec.ts` |
| TC-ADM-003 | Remove requires a reason; status REMOVED; owner notified with reason | FR-ADM-001 | same |
| TC-ADM-004 | Restore is admin-only; REMOVED → OPEN; audit written | FR-ADM-001 | same |
| TC-ADM-005 | Moderator cannot act outside their campus → FORBIDDEN | FR-ADM-007 | `tests/admin/scoping.spec.ts` |
| TC-ADM-006 | Flag resolve with action + note | FR-ADM-009 | `tests/admin/flags.spec.ts` |
| TC-ADM-007 | Dispute resolution requires a note; audit row with before/after | FR-ADM-002 | `tests/admin/disputes.spec.ts` |
| TC-ADM-008 | Suspend/unsuspend user; suspended user blocked everywhere | FR-ADM-003 | `tests/admin/users.spec.ts` |
| TC-ADM-009 | Role change; self-demotion → FORBIDDEN | FR-ADM-003 | same |
| TC-ADM-010 | Locations/drop-points CRUD validates input; deactivation hides from pickers | FR-ADM-004 | `tests/admin/places.spec.ts` |
| TC-ADM-011 | Audit log lists privileged actions; redaction holds (no hint answers/emails) | FR-ADM-005 | `tests/admin/audit.spec.ts` |
| TC-ADM-012 | Stats respect date range and campus scoping | FR-ADM-006 | `tests/admin/stats.spec.ts` |
| TC-ADM-013 | Reindex is admin-only and rate-limited; enqueues one job | FR-ADM-008 | `tests/admin/reindex.spec.ts` |
| TC-ADM-014 | Every privileged mutation writes exactly one audit row | NFR-024 | `tests/admin/audit.spec.ts` |

## Notifications

| TC | Case | Derives from | Automated path |
|---|---|---|---|
| TC-NTF-001 | `MATCH_SUGGESTED` created for the owner; STRONG emails immediately | FR-NTF-001 | `tests/notifications/match.spec.ts` |
| TC-NTF-002 | POSSIBLE matches batched into the 07:00 digest (one email) | FR-NTF-001 | `tests/notifications/digest.spec.ts` |
| TC-NTF-003 | `CLAIM_SUBMITTED` notifies the finder; 48 h reminder deduped | FR-NTF-002 | `tests/notifications/claim.spec.ts` |
| TC-NTF-004 | Message email only if unread after 15 min; one per window | FR-NTF-003 | `tests/notifications/message-dedupe.spec.ts` |
| TC-NTF-005 | Expiring (day 76) and expired notifications created once | FR-NTF-004 | `tests/jobs/report-sweep.spec.ts` |
| TC-NTF-006 | Duplicate dedupe key creates no second row | FR-NTF-005 | `tests/notifications/dedupe.spec.ts` |
| TC-NTF-007 | `email_enabled=false` stops email but keeps in-app | FR-NTF-006 | `tests/notifications/prefs.spec.ts` |
| TC-NTF-008 | Muted types suppress email | FR-NTF-006 | same |
| TC-NTF-009 | Decision emails ignore mutes (transactional) | BE-08 | same |
| TC-NTF-010 | Unread count, mark-one, mark-all work and are idempotent | FR-NTF-007 | `tests/notifications/read.spec.ts` |
| TC-NTF-011 | Payloads never contain hint answers, emails of others, geo or embeddings | privacy | `tests/notifications/payload.spec.ts` |
| TC-NTF-012 | Notification rows older than 6 months are purged by cleanup | retention | `tests/jobs/cleanup.spec.ts` |

## i18n

| TC | Case | Derives from | Automated path |
|---|---|---|---|
| TC-I18N-001 | API returns `labelKey`/`error.code`, never translated strings | FR-I18N-003 | `tests/contract/i18n-keys.spec.ts` |
| TC-I18N-002 | `id.json` and `en.json` have identical key sets | NFR-052 | `scripts/i18n-check.mjs` in gate |
| TC-I18N-003 | Every `BE-04` code has `error.<code>` in both locales | NFR-052 | same |
| TC-I18N-004 | Every `BE-08` type has title/body keys in both locales | NFR-052 | same |
| TC-I18N-005 | Dates/times render in Asia/Jakarta | FR-I18N-002 | `tests/ui/datetime.spec.tsx` |
| TC-I18N-006 | Locale switch persists via `PATCH /me` | FR-I18N-001 | E2E-15 |
| TC-I18N-007 | ICU placeholders match between locales | NFR-052 | `scripts/i18n-check.mjs` |

## System

| TC | Case | Derives from | Automated path |
|---|---|---|---|
| TC-SYS-001 | `/healthz` returns ok | NFR-012 | `tests/system/health.spec.ts` |
| TC-SYS-002 | `/readyz` reports db/storage/ml states; ml=down does not fail the app | NFR-012 | same |
| TC-SYS-003 | `X-Request-Id` present on every response and echoed in errors | BE-01 | `tests/system/request-id.spec.ts` |
| TC-SYS-004 | `INTERNAL` errors never include stack traces | BE-04 | `tests/system/errors.spec.ts` |
| TC-SYS-005 | Rate limit `Retry-After` header present on 429 | BE-12 | `tests/system/rate-limit.spec.ts` |
