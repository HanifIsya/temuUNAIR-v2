---
id: BE-08
title: Notification contract
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-NOTIF", "NOTIF-TEMPLATES"]
source_refs: ["Blueprint §5A.10"]
---

# BE-08 — Notification contract

Canonical `NotificationType` list with recipients, payloads, channels and dedupe keys. Copy for
each type (id/en) lives in `docs/02-design/13-notification-and-email-templates.md`; i18n keys
follow `notification.<TYPE>.title|body`.

| `NotificationType` | Recipient | Payload | Channels | Dedupe key |
|---|---|---|---|---|
| `MATCH_SUGGESTED` | report owner | `{reportId, matchId, band}` | in-app (+email STRONG) | `match:{matchId}` |
| `MATCH_INVITE` | LOST owner | `{foundReportId}` | in-app, email | `invite:{matchId}` |
| `CLAIM_SUBMITTED` | finder | `{claimId, foundReportId}` | in-app, email | `claim:{id}:submitted` |
| `CLAIM_APPROVED` / `CLAIM_REJECTED` | claimant | `{claimId, reason?}` | in-app, email | `claim:{id}:decision` |
| `CLAIM_REMINDER` | finder | `{claimId}` (48 h) | in-app, email | `claim:{id}:reminder` |
| `MESSAGE_RECEIVED` | counterpart | `{claimId, messageId}` | in-app (email digest if unread 15 min) | `msg:{claimId}:{window}` |
| `HANDOVER_PLANNED` / `HANDOVER_CONFIRMED` | counterpart | `{claimId}` | in-app, email | `claim:{id}:handover:{n}` |
| `REPORT_RETURNED` | both | `{reportId}` | in-app, email | `report:{id}:returned` |
| `REPORT_EXPIRING` / `REPORT_EXPIRED` | owner | `{reportId, expiresAt}` | in-app, email | `report:{id}:expiring` |
| `REPORT_REMOVED` / `REPORT_APPROVED` | owner | `{reportId, reason?}` | in-app, email | `report:{id}:mod:{n}` |
| `ADMIN_DISPUTE` | moderators (campus) | `{claimId}` | in-app | `dispute:{claimId}` |

## Payload discipline

1. Payloads carry **ids, titles and band only** — never hint answers, other users' emails,
   exact geo, or embeddings.
2. `reason` values are short machine strings the UI maps to i18n keys, not free text.
3. `{n}` in dedupe keys is a counter for repeatable notices (e.g. second removal), so the same
   event type can legitimately notify more than once.
4. `{window}` for messages is the 15-minute bucket timestamp (`Math.floor(now/15min)`).

## Channel rules

| Type | In-app | Email | Notes |
|---|---|---|---|
| `MATCH_SUGGESTED` | ✔ | STRONG only (immediate); POSSIBLE in 07:00 WIB digest | digest dedupe `digest:{date}` |
| `MATCH_INVITE` | ✔ | ✔ | |
| `CLAIM_SUBMITTED` | ✔ | ✔ | |
| `CLAIM_APPROVED`/`REJECTED` | ✔ | ✔ | cannot be muted (decision record) |
| `CLAIM_REMINDER` | ✔ | ✔ | 48 h after submission |
| `MESSAGE_RECEIVED` | ✔ | only if unread after 15 min | one email per window |
| `HANDOVER_*` | ✔ | ✔ | |
| `REPORT_RETURNED` | ✔ | ✔ | celebration tone |
| `REPORT_EXPIRING`/`EXPIRED` | ✔ | ✔ | day 76 and expiry day |
| `REPORT_REMOVED`/`APPROVED` | ✔ | ✔ | includes reason for removal |
| `ADMIN_DISPUTE` | ✔ | ✗ | staff queue only |

## Preferences interaction

- `notification_prefs.email_enabled=false` → no email for any type.
- `notification_prefs.muted_types[]` → no email for those types; in-app rows are still created
  except for purely informational types the user muted (currently only `MESSAGE_RECEIVED` may be
  muted in-app — `OPEN`: finalize the exact in-app mute semantics with UX).
- Decision notifications (`CLAIM_APPROVED`/`CLAIM_REJECTED`) ignore mutes for email — they are
  transactional.

## API surface

| API | Purpose |
|---|---|
| `API-NTF-01` | paginated feed, newest first |
| `API-NTF-02` | mark one read |
| `API-NTF-03` | mark all read |
| `API-NTF-04` | unread count (polled every 30 s by the bell) |

`Notification` shape: `{ id, type, payload, readAt, createdAt }` (`BE-05`).

## Testing

- Unit: dedupe collisions produce one row; channel selection honours prefs.
- Integration: event → row → `notify.send` → email in Mailpit with asserted payload fields.
- Contract: payload schemas per type exported from `packages/contracts` and validated.
- E2E-08: bell count updates after a chat message; feed opens the right deep link.
