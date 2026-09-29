---
id: PRIVACY-RETENTION
title: Privacy and data retention
status: draft
owner: SR
updated: 2026-09-29
depends_on: ["THREAT-MODEL", "LEGAL", "DEC-017", "DEC-014"]
source_refs: ["NFR-030..035", "UU PDP Law 27/2022"]
---

# Privacy and data retention

Design constraint: **UU PDP (Law No. 27/2022)** — purpose limitation, data minimisation,
storage limitation, security, accountability (DEC-017). Legal drafts:
`docs/01-product/13-legal-privacy-drafts.md` (human review required before launch).

## Data inventory and retention

| Data | Purpose | Classification | Retention | Deletion mechanism |
|---|---|---|---|---|
| Account: name, email, locale | identity, notifications | PII | account life + 7-day cool-off | `account.delete` anonymizes |
| `unair_ref` (optional) | dispute resolution only | PII (high) | account life | anonymized with account |
| Report text/photos | matching, discovery | user content (may contain PII) | `REPORT_TTL_DAYS` + grace, then content purged with the report | report removal / account deletion |
| Verification hints (answer_enc) | ownership proof | secret | until report removal | cascade delete + key rotation note |
| Claims + answers | verification record | private comms | claim life + 12 months for disputes, then purged | `OPEN`: confirm with legal |
| Chat messages | coordination | private comms | claim life; purge job after retention | account deletion anonymizes sender |
| Notifications | service messages | internal | 6 months | cleanup job |
| Audit logs | accountability | pseudonymous (ip_hash) | 12 months | append-only; purge job for expiry |
| Feature embeddings | matching | derived | until report removal | cascade |
| Server logs | ops/security | hashed/anonymized | 30 days | log rotation; no bodies |

## Minimisation rules (enforced in code review)

1. Never collect phone numbers, national IDs, or `unair_ref` unless needed; `unair_ref` stays
   nullable and unexposed.
2. Public views show first name + initial only (`display_name` mapping).
3. Exact geo (`lat`/`lng`) is owner/moderator-only and hidden for sensitive categories.
4. Embeddings and scores never leave the server.
5. Logs redact: emails, hint answers, message bodies, image URLs, tokens (pino redact list).
6. Fixtures and seeds use synthetic people; never real UNAIR data.

## Deletion flows

| Trigger | Flow |
|---|---|
| User deletes account (`DELETE /me`) | `202`; 7-day cool-off (re-login cancels); then `account.delete`: anonymize user, delete images + objects, keep claim history with anonymized name, keep audit stubs |
| Owner cancels a report | soft: `CANCELLED`; images retained until report purge; content not shown |
| Moderator removes a report | `REMOVED`; public hidden; owner notified; content retained for audit, purged per retention |
| Report expiry | `EXPIRED`; content retained for the grace window, then purged by the retention job |
| Legal/police request | human process: DPO review → targeted export → logged (`OPEN`: procedure) |

## Log redaction (pino)

```ts
redact: {
  paths: ["req.headers.cookie", "req.headers.authorization", "*.email", "*.answer",
          "*.answer_enc", "*.body", "*.imageUrl", "*.token", "*.password"],
  censor: "[redacted]",
}
```

## Transparency

- `/privacy` publishes this inventory in plain Indonesian (draft in `13-legal-privacy-drafts.md`).
- Moderators see a reminder that their actions are audited.
- Users can see what data exists about them via owner views (`/me/reports`, `/claims`, `/me/settings`).

## Compliance checks

| Check | Where | Cadence |
|---|---|---|
| No PII in logs | security checklist + sampled log review | per release |
| Retention jobs running | monitoring (sweep counts) | monthly |
| Deletion requests honoured | `account.delete` logs | per request |
| Legal review of notice/terms | human gate | before launch (L-3) |
| Hosting/transfer review | ADR + legal | before production (L-4) |

## Open items

| # | Item | Owner |
|---|---|---|
| P-1 | Confirm chat/claims retention numbers with legal | Legal/DPO |
| P-2 | Decide whether "download my data" ships in MVP (access right) | AR + Legal |
| P-3 | Approve the log redaction list in a security review | SR |
| P-4 | Data-processing agreement with hosting provider once chosen | Advisor |
