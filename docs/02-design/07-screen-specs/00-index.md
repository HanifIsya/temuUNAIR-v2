---
id: SCR-INDEX
title: Screen specs index
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["WIREFRAMES", "IA", "FE-01"]
source_refs: ["Blueprint §5B.1"]
---

# Screen specs

Per-screen specifications live in `07-screen-specs/SCR-###-<slug>.md`. Each spec contains:
purpose, entry points, layout regions, data (API IDs), components (CMP IDs), all states
(loading/empty/error/forbidden/offline), copy keys, analytics events, and a11y notes.

| ID | Screen | Route | Access | Spec file | Status |
|---|---|---|---|---|---|
| SCR-001 | Landing | `/` | public | `SCR-001-landing.md` | draft |
| SCR-002 | Login + auth error | `/login`, `/auth/error` | public | `SCR-002-login.md` | draft |
| SCR-003 | Home dashboard | `/home` | U | `SCR-003-home.md` | draft |
| SCR-004 | Report wizard | `/reports/new` | U | `SCR-004-report-wizard.md` | draft |
| SCR-005 | Browse + search | `/reports` | U | `SCR-005-browse.md` | draft |
| SCR-006 | Report detail | `/reports/[id]` | U | `SCR-006-report-detail.md` | draft |
| SCR-007 | Report edit | `/reports/[id]/edit` | O | `SCR-007-report-edit.md` | draft |
| SCR-008 | Matches | `/reports/[id]/matches` | O | `SCR-008-matches.md` | draft |
| SCR-009 | My reports | `/me/reports` | U | `SCR-009-my-reports.md` | draft |
| SCR-010 | Claims list | `/claims` | U | `SCR-010-claims-list.md` | draft |
| SCR-011 | Claim challenge form | `/claims/new` | U | `SCR-011-claim-new.md` | draft |
| SCR-012 | Claim room | `/claims/[id]` | P | `SCR-012-claim-room.md` | draft |
| SCR-013 | Notifications | `/notifications` | U | `SCR-013-notifications.md` | draft |
| SCR-014 | Settings | `/me/settings` | U | `SCR-014-settings.md` | draft |
| SCR-015 | Help & safety | `/help`, `/help/safety` | public | `SCR-015-help.md` | draft |
| SCR-016 | Legal pages | `/privacy`, `/terms` | public | `SCR-016-legal.md` | draft |
| SCR-017 | Admin dashboard | `/admin` | M | `SCR-017-admin-dashboard.md` | draft |
| SCR-018 | Admin reports queue | `/admin/reports` | M | `SCR-018-admin-reports.md` | draft |
| SCR-019 | Admin claims/disputes | `/admin/claims` | M | `SCR-019-admin-claims.md` | draft |
| SCR-020 | Admin users | `/admin/users` | A | `SCR-020-admin-users.md` | draft |
| SCR-021 | Admin places | `/admin/places` | A | `SCR-021-admin-places.md` | draft |
| SCR-022 | Admin audit log | `/admin/audit` | A | `SCR-022-admin-audit.md` | draft |
| SCR-023 | Error pages | `/403`, `/404`, `/500`, `/offline` | public | `SCR-023-error-pages.md` | draft |

Each spec file uses the shared template below. Specs are written by the spec-writer in M1;
until a spec exists, its status stays `draft` and the screen may not be implemented (P1).

## Spec template

```markdown
---
id: SCR-###
title: <Screen name>
status: draft
owner: SW
updated: YYYY-MM-DD
depends_on: [FE-01, CMP]
source_refs: [API-IDs, FR-IDs]
---

# SCR-### — <Screen name>

## Purpose
## Entry points / exit points
## Layout regions (mobile, desktop)
## Data
| Field | API | Query key | Notes |
## Components used
| CMP | Variant | Notes |
## States
| Loading | Empty | Error | Forbidden/not found | Offline |
## Copy keys
| Key | id | en |
## Analytics events
## Accessibility notes
## Test hooks (data-testid)
## Open questions
```
