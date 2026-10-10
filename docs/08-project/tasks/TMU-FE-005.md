---
id: TMU-FE-005
title: Browse list + report detail via generated client (SCR-005/006)
status: DONE
lane: fe
slug: fe-browse-detail
milestone: M3
priority: P1
owner: frontend-dev
deps: [TMU-BE-006, TMU-FE-002]
refs: [FE-02, FE-04, SCR-005, SCR-006, FR-BRW-001..003, API-REP-02, API-REP-04]
created: 2026-10-03
updated: 2026-10-10
---

# TMU-FE-005 — Browse list + report detail via generated client (SCR-005/006)

## Goal

Mobile-first browse (`/browse` and `/reports`) and detail (`/reports/{id}`) using only the generated API
client and `FE-04` query-key rules: opposite-type default with a LOST/FOUND tab, keyset
pagination ("load more", no offset), filter chips (campus/category/location) mapping to the
`API-REP-02` query params, and the detail page showing the masked public view — hint prompts
visible only to the claimant flow (M6), owner actions visible only to the reporter. Stale
time/invalidation per FE-02; empty/loading/error/offline states per FE-06.

## Acceptance criteria

- [x] Query keys match `FE-04` verbatim; filters serialize to the contract param names (camelCase).
- [x] Raw `fetch("/api/v1/...")` nowhere (lint-enforced); masked sensitive fields never rendered.
- [x] Component tests cover every FE-06 state for both routes; a11y zero axe violations.
- [x] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/(app)/browse/**`, `apps/web/src/app/(app)/reports/[id]/**`, `apps/web/src/features/browse/**`
- `apps/web/src/components/report/**`, `apps/web/src/features/report/**`
- matching tests; i18n files
- `docs/08-project/tasks/TMU-FE-005.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-10 | frontend-dev | 1 PICK | Picked up TMU-FE-005. Checked DoR (deps TMU-BE-006 and TMU-FE-002 are DONE; contracts and specs SCR-005/006 merged). |
| 2026-10-10 | frontend-dev | 4 RED | Wrote failing tests for StatusBadge, ReportCard, BrowseView, and ReportDetailView (`status-badge.test.tsx`, `report-card.test.tsx`, `browse-view.test.tsx`, `report-detail-view.test.tsx`). vitest failed as modules did not exist. |
| 2026-10-10 | frontend-dev | 7 GREEN | Implemented StatusBadge (CMP-007), ReportCard (CMP-004), ReportGrid (CMP-005), ReportFilterBar (CMP-006), useReportsList, useReportDetail, BrowseView, ReportDetailView, /reports page, /browse redirect, and /reports/[id] page. All 20 tests pass with 0 axe violations. |
| 2026-10-10 | frontend-dev | 8 POLISH | Added i18n keys to id.json and en.json (277 keys matching, identical ICU placeholders). pnpm lint, typecheck, format:check pass clean. |
| 2026-10-10 | reviewer | 10 REVIEW | Cycle 1 REJECT (changes requested: SSR prefetch, search label a11y, URL state sync, notFound handling, date/enum formatting, tokens). |
| 2026-10-10 | frontend-dev | 10 REVISE | Implemented cycle 1 fixes: added getServerReport for SSR initialData, sr-only label on search input, URL searchParams sync in BrowseView, notFound() calls on 404, Asia/Jakarta Intl date formatting, campus enum formatting, list/listitem semantics on ReportGrid, theme tokens for badges and masks. |
| 2026-10-10 | reviewer | 11 REVIEW | Cycle 2 APPROVE in docs/08-project/reviews/TMU-FE-005.md. All findings resolved, 0 axe violations, 20 tests passing. |
