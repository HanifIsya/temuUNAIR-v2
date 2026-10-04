---
id: TMU-FE-002
title: App shell — navigation, locale switcher, notification bell slot (SCR-003 frame)
status: DONE
lane: fe
slug: fe-app-shell
milestone: M3
priority: P1
owner: frontend-dev
deps: [TMU-FE-001]
refs: [FE-01, IA, SCR-003, FR-I18N-001, FR-AUTH-004]
created: 2026-10-03
updated: 2026-10-05
---

# TMU-FE-002 — App shell — navigation, locale switcher, notification bell slot (SCR-003 frame)

> **DoR history**: originally ref'd a nonexistent `FR-AUTH-006` → `BLOCKED` via BLK-005
> (2026-10-05); human decision (option 1) corrected the refs to `FR-I18N-001` +
> `FR-AUTH-004` and re-enabled the task. Observation: `07-acceptance-criteria.md` has no
> Gherkin block for the locale round-trip (`FR-I18N-001`) — docs-lane follow-up, tracked
> in the progress log; DoR #5 is met by the task ACs + IA nav rows + SCR-003 states.

## Goal

The authenticated layout: bottom nav (mobile-first) / header (desktop) for Home, Browse,
Report, My reports; role-gated admin entry hidden for non-moderators; locale switcher
(`id` default, `en`) persisting via `PATCH /me`; notification bell slot rendering the
unread-count chip from `API-NTF-04` (polling per FE-04) with the empty state. Route group
`(app)` in FE-01.

## Acceptance criteria

- [x] Nav renders the contract-typed items for each role; hidden admin entry asserted for
  user role — `nav-items.test.ts` (6 tests) builds `BOTTOM_NAV_ITEMS`/`TOP_NAV_ITEMS`/
  `AVATAR_MENU_ITEMS` with typed `UserRole` filters; `visibleNavItems` hides `admin`
  (`["MODERATOR","ADMIN"]`) for `USER` and shows it for `ADMIN`; component tests render
  both roles (`top-nav`, `app-shell`).
- [x] Locale switch round-trips the cookie + profile and re-renders without reload —
  `use-locale-switcher.test.tsx`: sets `NEXT_LOCALE=en`, sends contract-shaped
  `PATCH /api/v1/me { locale: "en" }` with CSRF header `X-Requested-With: temuunair`
  (asserted from the captured request), calls `router.refresh()` once (no reload), keeps
  the cookie when the write fails (offline), and no-ops on unchanged locale.
- [x] Bell slot shows `0` state offline-safe (FE-06 offline state), real count wired later
  in M6 — `notification-bell.test.tsx`: zero state (no chip, plural `=0` label), positive
  chip (`aria-hidden`, label carries count), `onOpen` activation, operable with
  `navigator.onLine = false`, zero axe violations; `AppShell`/`TopNav` pass `count={0}`.
- [x] Red tests first; `pnpm gate` green — red: `Test Files 10 failed (10)` (all
  module-resolution failures on the unwritten implementations); green: 10 files / 47
  tests; gate tail below.

## Files expected to change

- `apps/web/src/app/(app)/layout.tsx`, `apps/web/src/components/nav/**`, `apps/web/src/features/shell/**`
- matching tests; i18n files
- `docs/08-project/tasks/TMU-FE-002.md`

## Files changed

- `apps/web/src/app/(app)/layout.tsx` + test — server layout: `getAppUser()` guard →
  redirect or `<AppShell variant="app">`
- `apps/web/src/components/nav/app-shell.tsx` + test — skip link, desktop header
  (`hidden md:block`), `main#main`, footer, `BottomNav`
- `apps/web/src/components/nav/bottom-nav.tsx` + test — mobile (`md:hidden`): home,
  browse, report, claims, settings
- `apps/web/src/components/nav/top-nav.tsx` + test — desktop: IA row, LocaleSwitcher,
  `NotificationBell count={0}`, avatar menu
- `apps/web/src/components/nav/avatar-menu.tsx` — disclosure menu (tested via
  `app-shell`/`top-nav` tests)
- `apps/web/src/components/locale-switcher.tsx` + test — radiogroup `id`/`en`
- `apps/web/src/components/notification-bell.tsx` + test — chip slot
- `apps/web/src/features/shell/types.ts` — `Me`, `UserRole`, `Locale`
- `apps/web/src/features/shell/nav-items.ts` + test — typed nav items + `visibleNavItems`
- `apps/web/src/features/shell/server-user.ts` + test — `getAppUser()` (redirect branches)
- `apps/web/src/features/shell/guard.ts` + test — `APP_AUTH_MATCHER`, `authRedirect()`
- `apps/web/src/features/shell/use-locale-switcher.ts` + test — cookie + `PATCH /me` + refresh
- `apps/web/src/features/shell/msw-server.ts` — test-only MSW harness (D-12)
- `apps/web/src/middleware.ts` — compose auth redirect with the existing next-intl middleware
- `apps/web/src/i18n/messages/{id,en}.json` — `common.nav.*` (13 keys),
  `common.localeSwitcher.label/changed`
- `apps/web/package.json`, `pnpm-lock.yaml` — `msw` devDep
- `docs/08-project/{backlog.md,status.md}` — regenerated

## Decisions

| # | Decision |
|---|---|
| D-1 | `middleware.ts` **composes** the existing next-intl middleware instead of replacing it — `authRedirect(request) ?? intlMiddleware(request)`; `config.matcher` untouched (`["/((?!api\|_next\|.*\\..*).*)"]`) so locale negotiation/`NEXT_LOCALE` keep working. |
| D-2 | Middleware gate checks **cookie presence only** (`parseSessionToken`); the authoritative check lives in the `(app)` layout via `getAppUser()` — `AUTH_REQUIRED` → `/login`, `ACCOUNT_SUSPENDED` → `/auth/error?error=ACCOUNT_SUSPENDED`, anything else rethrown (typed, not swallowed). |
| D-3 | `getAppUser()` builds a synthetic `Request` from `cookies().getAll()` (Next cookie → `Cookie` header) so it reuses the read-only `server/auth/request-user` mapper without services touching `req`; `moderatorCampus` narrowed with `Campus.safeParse` (Zod at the boundary). |
| D-4 | Responsive split: mobile = `BottomNav` (`md:hidden`); desktop = `TopNav` (`hidden md:block`) = IA row + LocaleSwitcher + bell + avatar menu. LocaleSwitcher sits in the desktop header although the IA nav rows don't list it — the task requires the switcher in the SCR-003 frame. |
| D-5 | Avatar menu = disclosure pattern: trigger with `aria-expanded`, always-rendered `hidden` menu `id="avatar-menu"`, Escape closes + refocuses trigger, outside `pointerdown` closes. `sign-out` is a `button` → `signOut({ callbackUrl: "/" })`; `admin` → `/admin` gated by `roles: ["MODERATOR","ADMIN"]`; `profile` and `settings` both → `/me/settings` (see O-3). |
| D-6 | `NotificationBell` is desktop-only and the shell passes `count={0}` — real counts + `API-NTF-04` polling arrive in M6 (FE-04). Zero-state `aria-label` uses ICU plural (`=0 {0 unread}`); badge is `aria-hidden` (the label carries the count). Renders and activates offline (FE-06). |
| D-7 | `aria-current="page"` only on an exact `usePathname()` match; nav entries are plain `next/link` (Lapor → `/reports/new`). |
| D-8 | `AppShell` props per FE-03 CMP-001: `user: Me` + `variant: "app" | "public" | "admin"` (layout passes `"app"`); skip-link testid `app-shell-skip-link` → `main#main`; AppShell stays a server component (no `"use client"`), client pieces are children. |
| D-9 | Locale round-trip (FR-I18N-001): write `NEXT_LOCALE` first (instant preview), then best-effort `PATCH /api/v1/me` with the CSRF header, then `router.refresh()` — never a full reload; a failed write (offline) keeps the cookie preview. |
| D-10 | ICU param in `common.localeSwitcher.changed` named `{language}`, not `{locale}` — next-intl treats `locale` as a reserved message argument (conflicts with formatting context). |
| D-11 | `msw@2.15.0` added to `apps/web` devDeps — it was only transitive via `packages/contracts` before; importing it from `apps/web` tests needs the direct dependency (`_common` lockfile). |
| D-12 | Test harness `features/shell/msw-server.ts` (test-only, imported **first** in `use-locale-switcher.test.tsx`): (a) patches `globalThis.Request` to resolve relative `"/…"` URLs (undici's `Request` throws on them in jsdom; browsers resolve), (b) `setupServer(...mswHandlers)` with `onUnhandledRequest: "error"`, listens at module import and captures `request:start` events. openapi-fetch@0.17 captures `globalThis.fetch` at `createClient()` (client-module eval) and calls `new Request(url)` per request — both orderings are handled. MSW 2.15's event name is `request:start` (not `request`) with a `RequestEvent` payload. |
| D-13 | Layout tests mock `getAppUser` for both branches (render + redirect); `getAppUser`'s own redirect logic is unit-tested in `server-user.test.ts` — no live server needed. |
| D-14 | Analytics (`locale_changed`, FE-10) deferred — `lib/analytics` doesn't exist yet and FE-10 is not in this task's refs. |

## Contract observations

| # | Observation |
|---|---|
| O-1 | `Me` still has no root export from `@temuunair/contracts` (FE-001 O-2) — consumed as `components["schemas"]["API-ME-01Response"]` (deep type import; reliable after TMU-CTR-009). FE-03's `Me` example remains aspirational → a `TMU-CTR-*` task would add the root export. |
| O-2 | `FR-I18N-001` has no Gherkin block in `docs/02-design/07-acceptance-criteria.md` (DoR note) — docs-lane follow-up; behaviour verified by the hook tests instead. |
| O-3 | Avatar menu `profile` and `settings` both point at `/me/settings` — the IA has no separate profile route. Needs an IA/SCR decision (profile page vs. settings anchor). |
| O-4 | Mobile has no notification bell and no avatar menu (bell/admin unreachable on small screens) — SCR-003 doesn't specify a mobile equivalent; follow-up with design before M6 polling ships. |
| O-5 | `scripts/i18n-check.mjs` still implements only parity + `error.*`/`notification.*` checks (no unused-key or literal-string scans, FE-08) — restates FE-001 O-3 for ops-lane. |

## Deferrals (out of scope, tracked above)

Notification count wiring + polling (M6) ✗ mobile bell/avatar menu (O-4) ✗ analytics
(D-14) ✗ root `Me` export (O-1 → `TMU-CTR-*`) ✗ `07-acceptance-criteria.md` Gherkin for
`FR-I18N-001` (O-2 — docs lane).

## Progress log

| Date | Actor | Step | Notes |
|---|---|---|---|
| 2026-10-03 | frontend-dev | 0 DoR | Task file created (TODO). |
| 2026-10-05 | reviewer | unblock | DoR failed on dangling `FR-AUTH-006` → **BLK-005** (`5acc14e`); human decision (option 1) corrected refs to `FR-I18N-001` + `FR-AUTH-004` and re-enabled (`3e09cbb`). |
| 2026-10-05 | frontend-dev | 1 DoR research | DoR 8/8: deps (FE-001) DONE; FE-01/03/04/06/09/12, IA, SCR-003 merged; lane globs cover every target file (`app/(app)/**`, `components/**`, `features/**`, `i18n/**`, `middleware.ts` + `_common`); contract `API-ME-01/02` types available post CTR-009; no conflicting open PRs; DoR #8 — component/hook tests need no secrets. |
| 2026-10-05 | frontend-dev | 2 tests (RED) | 10 test files written; `vitest run` → **`Test Files 10 failed (10)`** — every file failed at import (`Failed to resolve import … Does the file exist?`) for the 10 unwritten modules (incl. `msw` itself until the devDep landed). |
| 2026-10-05 | frontend-dev | 3 deps | `msw@2.15.0` added to `apps/web` devDeps (D-11); `pnpm i` updated `pnpm-lock.yaml` (lane: `_common`). |
| 2026-10-05 | frontend-dev | 4 GREEN | All implementation files written. Harness debugging: (a) MSW 2.15 emits `request:start`, (b) openapi-fetch@0.17's `new Request("/api/v1/me")` throws in jsdom → `features/shell/msw-server.ts` Request patch + listen-at-import (D-12), (c) probe/param fixes (`{locale}` → `{language}`, `accountSettings`/`app.name` probes). Final green: **10 files / 47 tests**. |
| 2026-10-05 | frontend-dev | 5 GATE | Lint: unused `userEvent` import in `bottom-nav.test.tsx` → removed (attempt 1). Tests step then failed 11 live-DB files because the gate inherited the session's **Render** `DATABASE_URL` (`temuunair_dev_user`…, where role `temuunair` doesn't exist → `role "temuunair" does not exist` + `57P01 terminating connection due to administrator command`) instead of the User-scope **local Docker** URL all prior green gates used → re-ran with `$env:DATABASE_URL = [Environment]::GetEnvironmentVariable('DATABASE_URL','User')`: **`OK gate(quick) passed`** — 63 files / 511 tests, contracts 1.1.0, db ok; `i18n:check passed (99 keys per locale)`; `backlog:build` regenerated (98 tasks). |
| 2026-10-05 | frontend-dev | 6 i18n | New keys in both locales: `common.nav.*` (13) + `common.localeSwitcher.label/changed` (2) → 99 keys/locale; parity via existing `messages.test.ts`. |
| 2026-10-05 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** → `docs/08-project/reviews/TMU-FE-002.md` |
| 2026-10-05 | frontend-dev | 10 SHIP | task flipped to DONE; squash-merged to `main`. |

## Evidence

- **Red** (before implementation): `Test Files 10 failed (10)` — all failures
  `Failed to resolve import './…' … Does the file exist?` for the not-yet-written
  modules (`nav-items`, `server-user`, `guard`, `use-locale-switcher`, `app-shell`,
  `bottom-nav`, `top-nav`, `locale-switcher`, `notification-bell`, `(app)/layout`).
- **Green** (after implementation): `Test Files 10 passed (10)`, `Tests 47 passed (47)`.
- **Gate tail**: `Test Files 63 passed (63)` → `Tests 511 passed (511)` →
  `contracts:check OK (version 1.1.0)` → `db:check: ok` → `OK gate(quick) passed`
  (run with the User-scope local-Docker `DATABASE_URL`; see progress-log step 5).
- **i18n**: `i18n:check passed (99 keys per locale)` (84 baseline + 15 new).
- **A11y**: 6 `axe(container)` runs (app-shell, bottom-nav, top-nav ×2,
  locale-switcher, notification-bell) — all `violations: []`.
- **Contract**: `API-ME-02` exercised through the generated client + `mswHandlers`
  (contract-derived) — request captured with body `{ locale: "en" }` and CSRF header;
  `API-ME-01` type drives `Me`.
- **Review**: cycle 1 **`APPROVE`** → `docs/08-project/reviews/TMU-FE-002.md`.
- **PR**: (local merge per environment rules).
