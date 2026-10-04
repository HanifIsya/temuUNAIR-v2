---
id: TMU-FE-002
title: App shell — navigation, locale switcher, notification bell slot (SCR-003 frame)
status: BLOCKED
blocked_by: BLK-005
lane: fe
slug: fe-app-shell
milestone: M3
priority: P1
owner: frontend-dev
deps: [TMU-FE-001]
refs: [FE-01, IA, SCR-003, FR-AUTH-006]
created: 2026-10-03
updated: 2026-10-05
---

# TMU-FE-002 — App shell — navigation, locale switcher, notification bell slot (SCR-003 frame)

> **BLOCKED (DoR #3)** — `refs` contains `FR-AUTH-006`, which does not exist (FR table ends
> at `FR-AUTH-005`). Blocker: `docs/08-project/blockers/BLK-005.md` (options: correct the
> refs to `FR-I18N-001` + `FR-AUTH-004`, or author `FR-AUTH-006`). Do not start until the
> blocker is resolved.

## Goal

The authenticated layout: bottom nav (mobile-first) / header (desktop) for Home, Browse,
Report, My reports; role-gated admin entry hidden for non-moderators; locale switcher
(`id` default, `en`) persisting via `PATCH /me`; notification bell slot rendering the
unread-count chip from `API-NTF-04` (polling per FE-04) with the empty state. Route group
`(app)` in FE-01.

## Acceptance criteria

- [ ] Nav renders the contract-typed items for each role; hidden admin entry asserted for user role.
- [ ] Locale switch round-trips the cookie + profile and re-renders without reload.
- [ ] Bell slot shows `0` state offline-safe (FE-06 offline state), real count wired later in M6.
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/(app)/layout.tsx`, `apps/web/src/components/nav/**`, `apps/web/src/features/shell/**`
- matching tests; i18n files
- `docs/08-project/tasks/TMU-FE-002.md`
