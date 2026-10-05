---
id: TMU-FE-005
title: Browse list + report detail via generated client (SCR-005/006)
status: TODO
lane: fe
slug: fe-browse-detail
milestone: M3
priority: P1
owner: frontend-dev
deps: [TMU-BE-006, TMU-FE-002]
refs: [FE-02, FE-04, SCR-005, SCR-006, FR-BRW-001..003, API-REP-02, API-REP-04]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-FE-005 — Browse list + report detail via generated client (SCR-005/006)

## Goal

Mobile-first browse (`/browse`) and detail (`/reports/{id}`) using only the generated API
client and `FE-04` query-key rules: opposite-type default with a LOST/FOUND tab, keyset
pagination ("load more", no offset), filter chips (campus/category/location) mapping to the
`API-REP-02` query params, and the detail page showing the masked public view — hint prompts
visible only to the claimant flow (M6), owner actions visible only to the reporter. Stale
time/invalidation per FE-02; empty/loading/error/offline states per FE-06.

## Acceptance criteria

- [ ] Query keys match `FE-04` verbatim; filters serialize to the contract param names (camelCase).
- [ ] Raw `fetch("/api/v1/...")` nowhere (lint-enforced); masked sensitive fields never rendered.
- [ ] Component tests cover every FE-06 state for both routes; a11y zero axe violations.
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/(app)/browse/**`, `apps/web/src/app/(app)/reports/[id]/**`, `apps/web/src/features/browse/**`
- matching tests; i18n files
- `docs/08-project/tasks/TMU-FE-005.md`
