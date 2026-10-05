---
id: TMU-FE-001
title: Login flow — landing → Google OAuth → callback, auth errors (SCR-001/002)
status: DONE
lane: fe
slug: fe-login-flow
milestone: M3
priority: P1
owner: frontend-dev
deps: [TMU-BE-002]
refs: [FE-01, FE-06, FE-11, SCR-001, SCR-002, FR-AUTH-001]
created: 2026-10-03
updated: 2026-10-05
---

# TMU-FE-001 — Login flow — landing → Google OAuth → callback, auth errors (SCR-001/002)

## Goal

Wire the unauthenticated entry path per FE-01: public landing CTAs (sign in, guest browse),
`/login` redirect to the Auth.js Google flow, `/auth/error` page mapping
`AUTH_DOMAIN_NOT_ALLOWED`/`ACCOUNT_SUSPENDED`/callback failures to i18n messages
(FE-11 code→message table), and session-aware header state. No data fetching inside
components — feature hook `useSession` only.

## Acceptance criteria

- [x] Component tests for every FE-06 state (loading, unauthenticated, domain-denied,
  suspended) — loading: header session skeleton + login-button spinner tests;
  unauthenticated: header sign-in state + login card render; domain-denied:
  `AuthErrorView` tests for `AUTH_DOMAIN_NOT_ALLOWED` **and** Auth.js `AccessDenied`;
  suspended: `AuthErrorView` suspended test (no action link); plus the `/login` offline
  row (inline network message test) and landing static page tests.
- [x] All strings via `id`/`en` messages files; `pnpm i18n:check` green —
  "i18n:check passed (84 keys per locale)"; no literal UI strings in JSX
  (brand renders `t("app.name")`).
- [x] A11y per FE-09 (focus on error page, keyboard path to sign-in, zero axe violations) —
  focus tests: login h1 and ErrorState heading focused on mount; keyboard tests: skip-link
  first stop → logo → sign-in (header), CTA first stop (landing), tab→Enter submits
  (login); 8 `axe(container)` tests, all `violations: []`.
- [x] Red tests first; `pnpm gate` green — red: 8 of 9 files failed with
  `Cannot find module`/`Failed to resolve import` for the 8 not-yet-written
  implementations (full output: `Test Files 8 failed | 1 passed (9)`); green after:
  9 files / 52 tests; final gate below.

## Files changed

- `apps/web/src/app/(public)/layout.tsx` + test — public shell (PublicHeader, skip link)
- `apps/web/src/app/(public)/page.tsx` + test — landing (replaces `app/page.tsx` +
  `app/page.test.tsx`, deleted; route `/` unchanged, now inside the route group per FE-01)
- `apps/web/src/app/(public)/login/page.tsx`, `login-form.tsx` + test
- `apps/web/src/app/(public)/auth/error/page.tsx`, `auth-error-view.tsx` + test
- `apps/web/src/components/error-state.tsx` + test (FE-03 CMP-027 — see O-1)
- `apps/web/src/components/header/public-header.tsx` + test
- `apps/web/src/features/auth/`: `auth-error.ts`, `next-path.ts`, `use-session.ts`,
  `providers.tsx` + tests for `auth-error` and `next-path`
- `apps/web/src/app/layout.tsx` (+ test mock) — wraps children in `AuthProvider`
- `apps/web/src/i18n/messages/{id,en}.json` — `auth.*` namespace + `common.signIn/home/skipToContent`
- `apps/web/src/styles/theme.css` — `--container-card: 400px` (SCR-002 max-400px card)
- `apps/web/package.json`, `pnpm-lock.yaml` — `@testing-library/user-event` devDep

## Decisions

| # | Decision |
|---|---|
| D-1 | SCR-002's `login.*` copy keys folded into **`auth.login.*`**: FE-08's namespace list has no top-level `login`, and the scheme `<area>.<screen>.<element>` maps area=auth, screen=login (`auth.login.title`, …). `auth.error.*` already matched. |
| D-2 | Landing ships **one** login CTA path (header "Masuk" + hero CTA). The FE-01 "guest browse" CTA is deferred — SCR-001 specifies a single CTA with no guest-browse copy/testid (see O-4). |
| D-3 | Landing regions 4–6 (how-it-works steps, safety note/footer) deferred: `landing.steps` copy is absent from the content doc, footer/help links belong to FE-005 (help/legal routes). Hero + 3 value cards ship (all copy exists). |
| D-4 | Header state comes only from the feature hook `useSessionStatus()` (wraps `next-auth/react` `useSession`); components never fetch (FE-04). States: loading skeleton → signed-out `header-login-button` (`/login`) → signed-in `header-home-link` (`/home`); no bottom nav when signed out (SCR-001 CMP-001). |
| D-5 | `resolveAuthError` maps Auth.js's **`AccessDenied`** callback code to the domain variant — per BE-09 the `signIn` callback returns `false` only for domain rejection, so it is the only `signIn=false` source. |
| D-6 | Suspended state: title `auth.error.suspended.title` + body reuses required key `error.ACCOUNT_SUSPENDED`; **no action link** (FE-11: account suspended → all actions disabled, contact admin). |
| D-7 | Open-redirect guard `safeInternalNext`: accepts only paths starting with a single `/` (rejects `//…`, `/\…`, absolute URLs, `javascript:`, bare paths); applied in `LoginForm` at `signIn` time (client-side until a middleware guard exists — O-5). Unit-tested in `next-path.test.ts`. |
| D-8 | Login loading: button `disabled` + `aria-busy` + spinner while `signIn` is in flight; `signIn` rejection → inline `auth.login.network` (`role="alert"`, linked to the button via `aria-describedby`, SCR-002 a11y note). With Auth.js `redirect:true`, failures either throw (caught) or redirect to the error page. |
| D-9 | Focus per FE-09/SCR-002: login h1 and `ErrorState` heading get `tabIndex={-1}` and focus on mount; `/auth/error` uses `headingLevel={1}` so each page has exactly one h1. |
| D-10 | `ErrorState` prop shape `{ titleKey, descKey, headingLevel?, action?, onRetry?, requestId?, messageTestId? }` (string keys — FE-08 rule 4: API values are keys, not sentences). Deviates from FE-03 CMP-027 (O-1). |
| D-11 | Added `--container-card: 400px` to `@theme` for SCR-002's "card centered (max 400 px)" — avoids an arbitrary `max-w-[400px]` (FE-07). |
| D-12 | `@testing-library/user-event` added to `apps/web` devDeps (keyboard-path AC; lockfile `_common`). |
| D-13 | Dev magic-link form (SCR-002 region 3) **not implemented** — no server-side provider exists; filed as `BLK-004` (be lane). |
| D-14 | Analytics (`landing_login_clicked`, `login_started`, …) deferred — FE-10 is not in this task's refs and `lib/analytics` does not exist yet. |

## Contract observations

| # | Observation |
|---|---|
| O-1 | FE-03 CMP-027 types `ErrorState(error: ApiError, onRetry)` but **no `ApiError` type exists** in `packages/contracts` (or anywhere). Implemented the string-key props of D-10; FE-03 needs a `TMU-CTR-*` correction. |
| O-2 | FE-03 CMP-001 describes an `AppShell` `user: Me` variant; `Me` is likewise absent from contracts. `PublicHeader` uses session status only — revisit at FE-003 (app shell). |
| O-3 | FE-08 §CI promises unused-key scan and literal-UI-string scan from `scripts/i18n-check.mjs`; the script implements only parity + `error.*` + `notification.*` checks. Keys here satisfy the promised behaviour manually (no literals in JSX); ops-lane follow-up to implement the scans. |
| O-4 | FE-01 lists a landing "guest browse" CTA and a guest `/browse` route; SCR-001 (approved) has a single login CTA and no `/browse` copy/testid. Needs an SCR update or a CTA spec before that button can be built. |
| O-5 | FE-01's middleware auth-guard (signed-out → `/login?next=…`) is not in this task's expected files and there are no `(app)` routes to guard yet. `next` is preserved from query param through `signIn` (validated by `safeInternalNext`) and will be honoured by the guard when it lands. |
| O-6 | Auth.js has no `pages: { signIn, error }` config and no magic-link provider although TMU-BE-002 is DONE — domain rejections currently hit Auth.js's raw default error page (SCR-002 violation) → **`BLK-004`** (be lane, needs human routing decision). |
| O-7 | Old `app/page.tsx` stub (h1 = app name) was replaced by `app/(public)/page.tsx` (SCR-001 landing) per FE-01 route groups — same route, new location. |

## Deferrals (out of scope, tracked above)

SCR-001 regions 4–6 (D-3) · guest-browse CTA (O-4) · dev magic-link form (D-13/BLK-004) ·
analytics (D-14) · middleware auth-guard (O-5) · `docs/02-design/09-content-and-microcopy.md`
sync for the new `auth.*` keys — **docs lane**, follow-up (FE-08 rule 5).

## Progress log

| Date | Actor | Step | Notes |
|---|---|---|---|
| 2026-10-03 | frontend-dev | 0 DoR | Task file created (TODO). |
| 2026-10-05 | frontend-dev | 1 DoR/DoR research | DoR 8/8: deps (BE-002) DONE; SCR-001/002, FE-01/03/04/06/08/09/11/12 merged; lane globs cover every target file; no conflicting PRs; DoR#8 secrets — component tests need no OAuth secrets (`.env.example` documents `AUTH_GOOGLE_*` for runtime). |
| 2026-10-05 | backend-dev | unblock | DoR research showed root Vitest could not resolve `@/*` (WF-STANDARDS-mandated) → filed and completed **TMU-OPS-037** (ops lane) first; merged to `main` as `7c0e620`. |
| 2026-10-05 | frontend-dev | 2 tests (RED) | 9 test files written; `vitest run` → `Test Files 8 failed | 1 passed (9)` — every failure `Cannot find module './…'` / `Failed to resolve import` for the 8 unwritten implementations (`layout.test` was pre-wired with the SessionProvider mock and passed by design). |
| 2026-10-05 | frontend-dev | 4 GREEN | Implemented all files; first green run: 10 test failures — (a) `next/link` test mock dropped `data-testid` props, (b) login probe messages lacked `app.name`, (c) error-state action test omitted its `action` prop. Fixed → **9 files / 52 tests pass**; no MISSING_MESSAGE noise. |
| 2026-10-05 | frontend-dev | 5 GATE | `pnpm i18n:check` → `passed (84 keys per locale)`; typecheck found 2× TS2339 (`disabled` on `HTMLElement`) → typed as `HTMLButtonElement`; `pnpm gate` → `OK gate(quick) passed` — **53 files / 462 tests**, contracts 1.1.0, db ok. |
| 2026-10-05 | frontend-dev | 6 BLOCKER | **BLK-004** filed (Auth.js `pages` + magic-link gap, be lane; D-13/O-6). |
| 2026-10-05 | frontend-dev | 7 i18n | New keys in both locales: `auth.login.*` (6), `auth.error.*` (5 leaves), `common.signIn/home/skipToContent`; parity via existing `messages.test.ts`. |
| 2026-10-05 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** → `docs/08-project/reviews/TMU-FE-001.md` |
| 2026-10-05 | frontend-dev | 10 SHIP | task flipped to DONE; squash-merged to `main`. |

## Evidence

- **Red** (before implementation): `Test Files 8 failed | 1 passed (9)` — failures:
  `Cannot find module './auth-error' | './next-path'`, `Failed to resolve import
  './error-state' | './public-header' | './layout' | './page' | './login-form' |
  './auth-error-view'`.
- **Green** (after implementation): `Test Files 9 passed (9)`, `Tests 52 passed (52)`.
- **Gate tail**: `Test Files 53 passed (53)` · `Tests 462 passed (462)` ·
  `contracts:check OK (version 1.1.0)` · `db:check: ok` · `OK gate(quick) passed`.
- **i18n**: `i18n:check passed (84 keys per locale)`.
- **A11y**: 8 axe runs across ErrorState/PublicHeader/PublicLayout/landing/ LoginForm /
  AuthErrorView → `violations: []` (component tests).
- **Review**: cycle 1 **`APPROVE`** → `docs/08-project/reviews/TMU-FE-001.md`.
- **Unblocking task**: TMU-OPS-037 (vitest `@/*`), merged `7c0e620`.
- **PR**: (local merge per environment rules).
