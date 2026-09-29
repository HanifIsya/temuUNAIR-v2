---
id: SCR-022
title: Admin audit log
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["SCR-018", "14-admin-console-design", "CMP"]
source_refs: ["FE-01", "API-ADM-14", "FR-ADM-005", "NFR-024", "NFR-081"]
---

# SCR-022 — Admin audit log (`/admin/audit`)

## Purpose
A read-only, append-only record of privileged actions for accountability (UU PDP) and incident
investigation.

## Entry points / exits
Entry: admin sidebar, dashboard "Aktivitas terbaru". Exits: linked entities (report, claim, user).

## Layout regions
1. Toolbar: date range, actor search, action filter, entity type filter.
2. `AdminTable<AuditLog>`: timestamp (WIB), actor (display name + role), action, entity type +
   id (short), before/after diff preview, request id.
3. Row drawer: full before/after JSON (redacted of secrets), IP hash, request id, copy button.

## Data
| Field | API | Notes |
|---|---|---|
| List | API-ADM-14 | admin only; paginated |
| Filters | — | `action`, `entityType`, `actorId`, `from`, `to` |

Redaction rules: hint answers, emails of third parties, embeddings and secrets never appear;
`ip_hash` shown as a hash, never the raw IP.

## Components
`AdminTable` (033) · `ToastProvider` (036) · JSON diff viewer (local component).

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| table skeleton | "Tidak ada aktivitas pada rentang ini" | `ErrorState` + retry | `/403` for moderators (admin-only) | — |

## Copy keys
`admin.audit.title` · `admin.audit.filter.action` · `admin.audit.filter.entity` ·
`admin.audit.filter.actor` · `admin.audit.before` ("Sebelum") · `admin.audit.after` ("Sesudah") ·
`admin.audit.requestId` · `admin.audit.empty`.

## Analytics
`admin_audit_viewed`, `admin_audit_row_opened`.

## Accessibility
- JSON diff is presented as a labelled definition list alternative for screen readers.
- Timestamps include full date + time in WIB with an accessible label.

## Test hooks
`admin-audit-table`, `admin-audit-row-<id>`, `admin-audit-filter-action`,
`admin-audit-filter-entity`, `admin-audit-diff`.

## Open questions
- `OPEN`: audit retention duration (currently 12 months in `15-privacy-and-data-retention.md`) — legal confirmation needed.
