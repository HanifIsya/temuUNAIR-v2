---
id: FE-01
title: Frontend route map
status: draft
owner: AR+SW
updated: 2026-09-29
depends_on: ["IA", "BE-03", "FE-02"]
source_refs: ["Blueprint §5B.1"]
---

# FE-01 — Route map (Next.js App Router)

Route groups: `(public)` landing/help/legal, `(app)` authenticated shell, `(admin)` staff shell.
`middleware.ts` redirects unauthenticated users to `/login?next=…`; role guards live in the
layouts and **mirror** — never replace — server RBAC.

| Path | Page / purpose | Access | API IDs used | Rendering |
|---|---|---|---|---|
| `/` | Landing: value proposition, "Masuk dengan akun UNAIR" | public | — | static |
| `/login`, `/auth/error` | Sign-in, domain-not-allowed message | public | Auth.js | static |
| `/home` | Dashboard: two CTAs, my active reports, latest matches, unread count | U | ME-01, REP-03, NTF-04 | CSR under server-guarded layout |
| `/reports/new?type=lost\|found` | Report wizard | U | META-01..04, UPL-01..03, REP-01, SRC-01 (duplicate hint) | CSR |
| `/reports` | Browse + search (text/image), filters in URL | U | REP-02, SRC-01, META-* | CSR, URL state |
| `/reports/[id]` | Report detail (public/owner/moderator variants), claim entry | U | REP-04, CLM-01, REP-08 | SSR data + CSR actions |
| `/reports/[id]/edit` | Edit while `OPEN`/`MATCHED` | O | REP-04, REP-05, UPL-* | CSR |
| `/reports/[id]/matches` | Ranked match suggestions with reasons | O | MAT-01..04 | CSR |
| `/me/reports` | My reports by status; cancel/renew | U | REP-03, REP-06, REP-07 | CSR |
| `/claims` | My claims (claimant) + incoming (finder) tabs | U | CLM-03 | CSR |
| `/claims/new?reportId=` | Challenge form (answer hidden-detail prompts) | U | CLM-01, CLM-02 | CSR |
| `/claims/[id]` | Claim room: stepper, answer comparison, chat, handover | P | CLM-04..10, CHT-01..04 | CSR + polling/SSE |
| `/notifications` | Notification list | U | NTF-01..03 | CSR |
| `/me/settings` | Profile, language, notification prefs, delete account | U | ME-01..05 | CSR |
| `/help`, `/help/safety`, `/privacy`, `/terms` | FAQ, safe-handover tips, drop points, legal | public | META-04 | static |
| `/admin` | Stats dashboard | M | ADM-11 | CSR |
| `/admin/reports` | Moderation queue + flags | M | ADM-01..04, 16, 17 | CSR |
| `/admin/claims` | Disputed claims | M | ADM-05, 06 | CSR |
| `/admin/users` | User management | A | ADM-07..10 | CSR |
| `/admin/places` | Locations + drop points CRUD | A | ADM-12, 13 | CSR |
| `/admin/audit` | Audit log viewer | A | ADM-14 | CSR |
| `/403`, `/404`, `/500`, `/offline` | Error pages | public | — | static |

## Layouts and guards

| Layout | Applies to | Guard |
|---|---|---|
| `app/(public)/layout.tsx` | landing, help, legal, login | none |
| `app/(app)/layout.tsx` | home, reports, claims, notifications, settings | session required; renders `AppShell` |
| `app/(admin)/layout.tsx` | all `/admin/*` | `MODERATOR`/`ADMIN`; moderators see only their campus |
| `app/api/**` | route handlers | per-handler `requireUser()`/`requireRole()` |

## Navigation rules

1. Mobile: bottom nav on `(app)` (Beranda · Cari · Lapor · Klaim · Akun).
2. Desktop: top nav + avatar menu; admin gets a sidebar.
3. `/reports/new` is a wizard with a leave-guard when a draft exists.
4. Every route has a unique `data-testid`-stable landmark for E2E (`main` region id `main`).

## URL state

- Filters/search live in query params (shareable, back-button friendly).
- `/reports?type=` overrides the default opposite-type behaviour.
- Unknown query params are ignored (not errors); invalid enum values fall back to defaults and
  are logged client-side only.

## Redirects

| From | To | When |
|---|---|---|
| `/` (signed in) | `/home` | optional; landing remains reachable |
| unauthenticated app route | `/login?next=<path>` | middleware; `next` validated to internal paths |
| `/admin/*` as USER | `/403` | layout guard |
| unknown id in `/reports/[id]` | `/404` | `notFound()` (also for hidden resources) |
