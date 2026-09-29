---
id: BE-09
title: Auth and session contract
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["ARCH-AUTH", "BE-01", "BE-04"]
source_refs: ["Blueprint §5A.11", "DEC-001", "DEC-006"]
---

# BE-09 — Auth and session contract

## Provider and session

| Aspect | Contract |
|---|---|
| Provider | Auth.js (NextAuth v5), Google OAuth (ADR-0006) |
| Domain allowlist | after callback, emails whose domain ∉ `AUTH_ALLOWED_DOMAINS` → `403 AUTH_DOMAIN_NOT_ALLOWED`, no user row |
| Dev fallback | email magic link, `NODE_ENV=development` only, still domain-checked |
| Session storage | database sessions (`sessions` table), 30 days sliding |
| Cookie | `__Secure-temuunair.session` — `httpOnly`, `Secure` (prod), `SameSite=Lax`, `Path=/` |
| CSRF | `SameSite=Lax` + same-origin `Origin` check + `X-Requested-With: temuunair` on all mutations |
| Logout | `POST /api/auth/signout` destroys the session row and clears the cookie |
| Suspension | `users.status = SUSPENDED` → every API returns `ACCOUNT_SUSPENDED` |
| Deletion | `DELETE /me` → `202`; 7-day cool-off; re-login cancels it |

## Session shape (server-side)

```ts
type SessionUser = {
  id: string;            // users.id
  email: string;         // never returned to other users
  displayName: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  moderatorCampus: Campus | null;
  locale: "id" | "en";
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
};
```

`GET /me` returns the public subset (no `moderatorCampus` for non-staff callers; role always
present so the UI can render admin entry points).

## RBAC matrix (authoritative)

| Action | USER | Owner | Party (claim) | MODERATOR | ADMIN |
|---|---|---|---|---|---|
| Create report / claim / message | ✔ | | | ✔ | ✔ |
| View public report | ✔ | ✔ | ✔ | ✔ | ✔ |
| Edit/cancel/renew report | | ✔ | | | ✔ |
| View hint prompts | | ✔ | ✔ | ✔ | ✔ |
| View hint **answers** | | ✔ (finder only) | finder | ✔ (own campus) | ✔ |
| Approve/reject claim | | | finder | ✔ (own campus) | ✔ |
| Moderation queue, flags, disputes | | | | ✔ (own campus) | ✔ |
| Manage users, locations, drop points, reindex | | | | | ✔ |
| Audit logs | | | | | ✔ |

## Enforcement rules

1. Every non-public handler calls `requireUser()`; role/ownership checks happen in services, not
   only in middleware or the UI.
2. Hidden resources return `NOT_FOUND`, not `FORBIDDEN` (existence must not leak).
3. Campus-scoped queries append `AND campus = $moderatorCampus` for moderators.
4. Self-demotion is rejected (`FORBIDDEN`).
5. Failed domain checks are logged with a **hashed** email for abuse detection.
6. Auth endpoints are rate-limited to 20/min/IP (`BE-12`).

## Endpoint ↔ auth mapping

| Group | Auth |
|---|---|
| `API-SYS-*`, `GET /healthz`, `/readyz` | public |
| `API-META-*`, `API-REP-02/04`, `API-SRC-01`, `API-NTF-*`, `API-ME-*`, `API-UPL-*`, `API-CHT-*` | any logged-in user (with resource checks) |
| `API-REP-03/05/06/07`, `API-MAT-01/04` | owner |
| `API-MAT-02/03`, `API-CLM-04..10`, `API-CHT-*` | party (claim) |
| `API-ADM-01..03/05/06/11/16/17` | moderator or admin (campus-scoped) |
| `API-ADM-04/07..10/12..15` | admin |

## Testing requirements

- Auth: 401 without a session; 403 for suspended; domain rejection creates no user row.
- RBAC: table-driven tests per role × endpoint group; campus-scoping tests.
- Cookie flags asserted in integration tests (httpOnly, SameSite, Secure in prod config).
- CSRF: mutation without `X-Requested-With`/Origin is rejected (403).
- Self-demotion guard test.
