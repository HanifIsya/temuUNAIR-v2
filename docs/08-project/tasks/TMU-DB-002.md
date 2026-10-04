---
id: TMU-DB-002
title: Reports base migration — reports, report_images, verification_hints
status: TODO
lane: db
slug: db-reports-base
milestone: M3
priority: P1
owner: backend-dev
deps: [TMU-DB-001]
refs: [BE-05, DEC-004, DEC-007, DEC-014]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-DB-002 — Reports base migration — reports, report_images, verification_hints

## Goal

Land `0003_reports.sql`: the `reports` table per BE-05 (type/status enums, `expires_at`,
`search_tsv` column, `CHECK ((type = 'FOUND') = (custody IS NOT NULL))`, version) with its
base indexes (`reports_browse_idx`, `reports_reporter_idx`, `reports_tsv_idx` GIN,
`reports_expiry_idx` partial), plus `report_images` (storage/thumb/masked keys, status,
position) and `verification_hints` (`prompt` + `answer_enc bytea`; AES-GCM lives at app
level per DEC-004). The reports *additions* (needs_reprocess, FTS trigger) are owned by
`TMU-DB-003` per BE-05 §"Domain additions" — do not duplicate them here.

## Acceptance criteria

- [ ] Forward-only migration + rollback note; schema mirrors BE-05 for these three tables.
- [ ] `pnpm db:check` green; drift test fails if an index or the CHECK is missing.
- [ ] No `needs_reprocess`/trigger here (deferred to TMU-DB-003 per BE-05).
- [ ] `pnpm gate` green.

## Files expected to change

- `packages/db/migrations/0003_reports.sql`, `packages/db/migrations/meta/*`
- `packages/db/src/schema.ts`
- `tests/db/*`
- `docs/08-project/tasks/TMU-DB-002.md`
