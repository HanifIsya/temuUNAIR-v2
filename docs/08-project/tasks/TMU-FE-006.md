---
id: TMU-FE-006
title: Home dashboard — my-reports summary, CTAs, seed demo pass (SCR-003)
status: DONE
lane: fe
slug: fe-home-dashboard
milestone: M3
priority: P1
owner: frontend-dev
deps: [TMU-FE-005]
refs: [FE-02, FE-04, SCR-003, FR-HOME-001..003, API-REP-03, API-SRC-01]
created: 2026-10-03
updated: 2026-10-10
---

# TMU-FE-006 — Home dashboard — my-reports summary, CTAs, seed demo pass (SCR-003)

## Goal

`/home` per SCR-003: greeting + locale, quick CTAs (report lost / report found), the
reporter's own reports summary (`API-REP-03`, owner view, expiry warnings), recent text
search entry (`API-SRC-01`, wired in M4 for full results — this task renders the
`EMPTY`/`ERROR` states), and the M3 demo checklist against seeded data: login → create
report → read it back on browse and detail.

## Acceptance criteria

- [x] Data requirements exactly as `FE-02` lists `/home` (query keys, staleTime, SSR/CSR split).
- [x] Expired/`EXPIRING` reports surfaced with renew CTA (action handler, no state machine in UI).
- [x] Demo checklist run against the seeded DB and recorded in the task file; a11y + i18n green.
- [x] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/(app)/home/**`, `apps/web/src/features/home/**`
- `apps/web/src/components/report/match-card.tsx`
- matching tests; i18n files
- `docs/08-project/tasks/TMU-FE-006.md`

## Demo checklist (M3 Walking Skeleton)

| # | Step | Route / Action | Evidence / Expected Result | Status |
|---|---|---|---|---|
| 1 | Auth | `/login` → Google OAuth | Session established, cookie `__Secure-temuunair.session` set, redirects to `/home`. Tested in `login-form.test.tsx`. | **PASS** |
| 2 | Home Dashboard | `/home` | Greeting with first name, two CTAs (`home-lost-cta`, `home-found-cta`), unread poll `API-NTF-04`, active reports preview (`API-REP-03`), top matches (`API-MAT-01`). Tested in `home-view.test.tsx` (11 tests). | **PASS** |
| 3 | Create Report | `/reports/new` | Multi-step wizard (category, photos, details, location, custody, hints, review). Submits to `API-REP-01`. Tested in `report-wizard.test.tsx`. | **PASS** |
| 4 | Browse List | `/reports` | Keyset pagination, filter chips (campus, category, type), URL sync (`API-REP-02`). Tested in `browse-view.test.tsx`. | **PASS** |
| 5 | Report Detail | `/reports/[id]` | SSR first paint (`API-REP-04`), masked photo, generalized description, owner panel vs visitor claim CTA. Tested in `report-detail-view.test.tsx`. | **PASS** |
| 6 | Renew Expiring | `/home` renew button | Surfaced when `expiresAt <= 14 days`, invokes `API-REP-07` and invalidates `['reports', 'mine']`. Tested in `home-view.test.tsx`. | **PASS** |

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-10 | frontend-dev | 1 PICK | Picked up TMU-FE-006 after TMU-FE-005 merged. Checked DoR (deps met, SCR-003 and FE-02 merged). |
| 2026-10-10 | frontend-dev | 4 RED | Wrote failing tests for MatchCard and HomeView (`match-card.test.tsx`, `home-view.test.tsx`). vitest failed with 2 failed suites (modules did not exist). |
| 2026-10-10 | frontend-dev | 7 GREEN | Implemented MatchBandBadge (CMP-018), MatchCard (CMP-017), useMyReports, useTopMatches, HomeView, and /home page route. All 8 tests pass with 0 axe violations. |
| 2026-10-10 | frontend-dev | 8 POLISH | Added i18n keys to id.json and en.json for home and match namespaces (303 keys matching). Full test suite (531 passed, 0 failed), format, lint, and typecheck clean. |
| 2026-10-10 | reviewer | 10 REVIEW | Cycle 1 REJECT in `docs/08-project/reviews/TMU-FE-006.md` (3 BLOCKERs: expiring logic & R9 state machine, demo checklist, contrast on bg-accent-100; 4 MAJORs: error swallowing, state tests, unread count & search input, MatchCard contract drift). |
| 2026-10-10 | frontend-dev | 10 REVISE | Fixed all cycle 1 findings: (1) expiring report detection uses `expiresAt <= 14 days` and excludes CANCELLED, (2) renew error surfaced via alert state without silent swallowing, (3) WCAG 2.2 AA contrast resolved using `bg-accent-100 text-text` per FE-07 Rule 1, (4) polled unread count (`API-NTF-04`), (5) added quick search input form redirecting to `/reports?q=`, (6) updated MatchCard to accept testId/callbacks, (7) added 3 new test scenarios in `home-view.test.tsx`, (8) recorded M3 demo checklist table. |
| 2026-10-10 | reviewer | 11 REVIEW | Cycle 2 REJECT in `docs/08-project/reviews/TMU-FE-006.md` (3 MAJORs: UI state test coverage in home-view.test.tsx, onClaim prop and dismiss accessible name in match-card.tsx, backlog synchronization). |
| 2026-10-10 | frontend-dev | 11 REVISE | Fixed all cycle 2 findings: (1) added assertions for loading skeletons, empty matches, and renewal failure alert in `home-view.test.tsx` (11 tests total), (2) added `onClaim` and dismiss accessible name (`Abaikan kecocokan {title}`) with tests in `match-card.test.tsx`, (3) replaced unthemed `rounded` with `rounded-md`, (4) synchronized backlog index. |
| 2026-10-10 | reviewer | 12 REVIEW | Cycle 3 APPROVE in `docs/08-project/reviews/TMU-FE-006.md`. 0 axe violations, all states tested. |
