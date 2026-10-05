---
id: TMU-FE-006
title: Home dashboard — my-reports summary, CTAs, seed demo pass (SCR-003)
status: TODO
lane: fe
slug: fe-home-dashboard
milestone: M3
priority: P1
owner: frontend-dev
deps: [TMU-FE-005]
refs: [FE-02, FE-04, SCR-003, FR-HOME-001..003, API-REP-03, API-SRC-01]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-FE-006 — Home dashboard — my-reports summary, CTAs, seed demo pass (SCR-003)

## Goal

`/home` per SCR-003: greeting + locale, quick CTAs (report lost / report found), the
reporter's own reports summary (`API-REP-03`, owner view, expiry warnings), recent text
search entry (`API-SRC-01`, wired in M4 for full results — this task renders the
`EMPTY`/`ERROR` states), and the M3 demo checklist against seeded data: login → create
report → read it back on browse and detail.

## Acceptance criteria

- [ ] Data requirements exactly as `FE-02` lists `/home` (query keys, staleTime, SSR/CSR split).
- [ ] Expired/`EXPIRING` reports surfaced with renew CTA (action handler, no state machine in UI).
- [ ] Demo checklist run against the seeded DB and recorded in the task file; a11y + i18n green.
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/(app)/home/**`, `apps/web/src/features/home/**`
- matching tests; i18n files
- `docs/08-project/tasks/TMU-FE-006.md`
