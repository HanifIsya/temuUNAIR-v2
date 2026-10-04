---
id: TMU-BE-006
title: Report create/read (API-REP-01/02/04) with visibility and masking mappers
status: TODO
lane: be
slug: be-report-create-read
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-BE-004, TMU-BE-005]
refs: [BE-03, BE-05, ARCH-STATES, API-REP-01, API-REP-02, API-REP-04, FR-REP]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-BE-006 — Report create/read (API-REP-01/02/04) with visibility and masking mappers

## Goal

The walking-skeleton report path: `POST /reports` (`ReportCreate` Zod cross-field rules —
FOUND requires ≥1 READY image + custody + ≥1 hint / ≥2 sensitive; LOST forbids
custody/hints; 180-day window), enqueue `report.process`; `GET /reports` (opposite-type
default, visibility exclusions, browse filters, keyset pagination, ≤50) and
`GET /reports/{id}` returning the correct view shape (public / owner / moderator) with
sensitive masking applied **in the mapper** — `isSensitive` items never leak original URLs,
geo or raw description.

## Acceptance criteria

- [ ] `expectMatchesContract` for the three API-REP ids; authn + ownership asserted per BE-13.
- [ ] Cross-field validation matrix as tests (TC-REP set); enqueue verified on create.
- [ ] Hidden statuses and non-party own-reports excluded from browse; masked for others.
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/api/v1/reports/**/route.ts`, `apps/web/src/server/services/reports.ts`, repositories, mappers
- matching tests
- `docs/08-project/tasks/TMU-BE-006.md`
