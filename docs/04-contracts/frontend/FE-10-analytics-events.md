---
id: FE-10
title: Analytics events
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["METRICS", "FE-04"]
source_refs: ["Blueprint §5B.9", "NFR-030"]
---

# FE-10 — Analytics events

Typed stub `track(event, props)` in `apps/web/src/lib/analytics.ts`. The provider is decided
later (M8); until then events are logged to the console in dev and dropped in production.

**No PII, no free text, no identifiers that point to a person.** IDs of the user are never sent;
entity ids only as coarse buckets when needed (e.g. result position bucket).

| Event | Properties | Fired when |
|---|---|---|
| `landing_viewed` | — | landing renders |
| `landing_login_clicked` | — | login CTA click |
| `login_started` | — | OAuth redirect begins |
| `login_failed` | `reason: domain\|oauth\|network` | auth error page shows |
| `home_viewed` | — | home renders |
| `home_cta_clicked` | `type: lost\|found` | CTA click |
| `report_wizard_started` | `type` | wizard step 1 opens |
| `report_wizard_step_completed` | `type, step` | "Lanjut" succeeds |
| `report_wizard_abandoned` | `type, step` | leave-guard confirmed discard |
| `report_submitted` | `type, category, imageCount, campus` | 201 from `API-REP-01` |
| `report_edited` | `changedFields: string[]` | successful PATCH |
| `report_cancelled` | — | cancel succeeds |
| `report_renewed` | — | renew succeeds |
| `report_viewed` | `type, category, sensitive` | detail renders |
| `report_flagged` | `reason` | flag succeeds |
| `search_performed` | `mode: text\|image\|browse, resultCount` | search/browse resolves |
| `search_filter_changed` | `filter` | filter applied |
| `search_result_opened` | `position: 1-5\|6-10\|11+` | result click |
| `match_viewed` | `band` | match card opened |
| `match_dismissed` | `band` | dismiss succeeds |
| `match_invited` | — | invite succeeds |
| `rematch_requested` | — | rematch requested |
| `claim_started` | — | claim CTA click |
| `claim_submitted` | — | 201 from `API-CLM-02` |
| `claim_submit_failed` | `code` | claim error |
| `claim_room_viewed` | `role: claimant\|finder` | claim room renders |
| `claim_decision` | `decision: approve\|reject` | decision succeeds |
| `dispute_opened` | — | dispute succeeds |
| `message_sent` | — | message 201 |
| `handover_confirmed` | — | confirmation succeeds |
| `report_returned` | `daysOpen: 0-2\|3-7\|8-30\|30+` | claim reaches COMPLETED |
| `notification_opened` | `type` | notification click |
| `notifications_mark_all_read` | — | mark-all succeeds |
| `locale_changed` | `locale` | locale switch |
| `notification_prefs_changed` | — | prefs saved |
| `account_deletion_requested` | — | delete requested |
| `error_shown` | `code` | error state rendered |
| `admin_dashboard_viewed` | `role` | admin dashboard renders |
| `admin_report_approved` / `admin_report_removed` | `reason?` | moderation action |
| `admin_claim_resolved` | `decision` | dispute resolved |
| `admin_user_suspended` / `admin_user_role_changed` | `role?` | user admin action |
| `admin_places_viewed` | — | places screen |
| `admin_audit_viewed` | — | audit screen |

## Rules

1. Property values are enums/buckets only — never titles, descriptions, names, emails or ids.
2. Events fire after the server confirms success (except `*_started`/`*_clicked`).
3. `track` is typed: adding an event requires updating this table and the TypeScript union in
   the same PR.
4. No third-party scripts in MVP; the provider decision (M8) must respect UU PDP (no ad-tech).
5. Analytics failures never block UX (fire-and-forget, errors swallowed and logged locally).

## Testing

- Unit test for `track`: unknown events fail type-check; no PII keys allowed (lint list).
- E2E asserts key events are emitted via a test-only collector (`window.__events`).
