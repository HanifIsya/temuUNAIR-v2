---
id: OPS-ADMIN
title: Admin operations guide
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["ADMIN-DESIGN", "OPS-MODEL", "SCR-017..022"]
source_refs: ["Blueprint §4.8", "DEC-006"]
---

# Admin operations guide

For moderators and admins running the service day to day. Screens: `SCR-017`..`SCR-022`.

## Daily routine (10–15 minutes)

1. Open `/admin` — check "Butuh perhatian" (oldest pending items, disputes).
2. Clear the moderation queue at `/admin/reports`:
   - **Setujui** when the report is genuine → `OPEN`.
   - **Hapus** with a reason when it violates guidelines → `REMOVED` (owner notified).
   - Restore (admin only) if a removal was a mistake.
3. Review disputes at `/admin/claims`: read both answers + chat, decide with a **note**.
4. Skim `/admin/flags` for resolved/unresolved items.
5. Once a week: skim `/admin/audit` for anomalies (unexpected role changes, mass removals).

## Moderating reports

| Situation | Action | Notes |
|---|---|---|
| Report looks genuine but unverified | Setujui | Visible in browse/search |
| Spam / duplicate / inappropriate | Hapus + reason | Reason shown to the owner |
| Sensitive item (KTM/ATM) | Check masking; if unmasked data is visible publicly, remove or ask for edit | Never share hint answers |
| Privacy complaint | Remove pending investigation; record in the audit trail | SEV-1 if PII leaked broadly |
| Two flags from distinct users | The system auto-hides to PENDING_REVIEW; decide promptly (≤ 48 h) | |

## Resolving disputes

1. Read the claim room: `AnswerCompare` (both answers) + chat transcript + both reports.
2. Look for: consistency with the item description, knowledge only the owner would have, chat
   behaviour, prior claim history.
3. Decide: **Setujui** (continue to handover) or **Tolak** (with a clear note).
4. The note is visible to both parties and stored in the audit log — write it neutrally.
5. If fraud is suspected, suspend the account (`/admin/users`) and note the reason.

## Managing users

| Action | When | Notes |
|---|---|---|
| Suspend | Fraud, harassment, repeated spam | Reason required; user sees `ACCOUNT_SUSPENDED` |
| Unsuspend | Appeal accepted | |
| Role change | Grant moderator for a campus | You cannot demote yourself |
| User search | Investigating a specific report/claim | Emails visible only to admins |

## Managing places (`/admin/places`)

- Keep locations current each semester; deactivate rather than delete (history stays intact).
- Drop points: name, campus, linked location, hours, contact note. Use the "contoh" label until
  stakeholders confirm the real list (O-1).
- Preview the public card before saving.

## Campus scoping

- Moderators only see and act on their own campus. If a case spans campuses, an admin handles it.
- The campus badge in the top bar always shows the current scope.

## Sensitive-data rules (non-negotiable)

1. Never share hint answers outside the console; never screenshot them.
2. Never download unmasked sensitive photos; view them in the console only, when necessary.
3. Reasons and notes are public to the parties — write facts, not opinions.
4. All your actions are audited; assume they will be reviewed.

## Escalation

| Case | Escalate to |
|---|---|
| Suspected PII breach | Admin + incident process (`05-incident-response.md`) |
| Legal request (police, campus) | DPO/legal contact (`OPEN`) |
| Feature request / bug | GitHub issue with the `needs-human` label |
| Drop-point change | Admin (places CRUD) |

## Weekly/monthly tasks

| Cadence | Task |
|---|---|
| Weekly | Clear queues; review audit anomalies; check stuck `needs_reprocess` reports |
| Monthly | Review drop-point accuracy; review stats for the course report |
| Per semester | Refresh location list; review moderator coverage |
