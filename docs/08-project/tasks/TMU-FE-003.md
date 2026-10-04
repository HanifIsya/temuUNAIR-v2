---
id: TMU-FE-003
title: Report wizard steps 1–2 — category/type choice + photos with upload hooks (SCR-004)
status: TODO
lane: fe
slug: fe-wizard-photos
milestone: M3
priority: P1
owner: frontend-dev
deps: [TMU-BE-004, TMU-FE-002]
refs: [FE-05, SCR-004, FR-REP-001, FR-REP-002, BE-10]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-FE-003 — Report wizard steps 1–2 — category/type choice + photos with upload hooks (SCR-004)

## Goal

First half of the LOST/FOUND wizard per FE-05: step 1 type + category selection driven by
`API-META-01` (sensitive-category banner for items flagged `isSensitive`), step 2 photo
capture using the BE-10 handshake hook `useUpload` (presign → PUT → complete, per-file
retry, 8 MB/type errors surfaced via FE-11), draft autosave to `localStorage` keyed by
`REPORT-DRAFT` version. MSW-backed component tests against the generated handlers.

## Acceptance criteria

- [ ] Shared Zod schemas from contracts (no duplicated rules); step transitions block on invalid photos.
- [ ] Upload error states: `UPLOAD_INVALID_TYPE`, `UPLOAD_TOO_LARGE`, network offline — all with i18n strings.
- [ ] Draft survives reload; versioned key ignores stale shapes.
- [ ] Red tests first; `pnpm gate` green.

## Files expected to change

- `apps/web/src/app/(app)/report/**` (steps 1–2), `apps/web/src/features/report/**`, `apps/web/src/hooks/useUpload.ts`
- matching tests; i18n files
- `docs/08-project/tasks/TMU-FE-003.md`
