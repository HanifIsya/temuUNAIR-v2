---
id: TMU-DB-002
title: Reports base migration — reports, report_images, verification_hints
status: DONE
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

- [x] Forward-only migration + rollback note; schema mirrors BE-05 for these three tables.
- [x] `pnpm db:check` green; drift test fails if an index or the CHECK is missing.
- [x] No `needs_reprocess`/trigger here (deferred to TMU-DB-003 per BE-05).
- [x] `pnpm gate` green.

## Files expected to change

- `packages/db/migrations/0003_reports.sql`, `packages/db/migrations/meta/*`
- `packages/db/src/schema.ts`
- `tests/db/reports-base.test.ts`
- `docs/08-project/tasks/TMU-DB-002.md`
- `docs/08-project/reviews/TMU-DB-002.md`
- `docs/08-project/backlog.md`, `docs/08-project/status.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-03 | backend-dev | 1 PICK | branch `agent/db/TMU-DB-002-db-reports-base` created from `main`; dep `TMU-DB-001` DONE |
| 2026-10-03 | backend-dev | 2 RED | `tests/db/reports-base.test.ts` run against scratch DB → **6/6 fail** for the right reason (`reports`, `report_images`, `verification_hints` absent) |
| 2026-10-03 | backend-dev | 3 PLAN | 1) Add `reports`, `report_images`, `verification_hints` to `packages/db/src/schema.ts` with custom `tsvector` and `bytea`, BE-05 custody checks and 4 base indexes; 2) `pnpm db:generate` → `0003_reports.sql` + snapshot; 3) rollback header; 4) fix array default introspection in `patches/drizzle-kit@0.31.11.patch`; 5) re-run gate |
| 2026-10-03 | backend-dev | 5 GREEN | `tests/db/reports-base.test.ts` passes 6/6; `pnpm db:check` → `db:check: ok`; `check-live` 3/3 passed |
| 2026-10-03 | backend-dev | 7 GATE | `pnpm gate:quick` → `OK gate(quick) passed` (151/151 unit tests passed) |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 B, 0 M, 0 MINOR) → `docs/08-project/reviews/TMU-DB-002.md` |
| 2026-10-03 | backend-dev | 10 SHIP | task flipped to DONE; squash-merged to `main` |

## Evidence

- Red: `tests/db/reports-base.test.ts` 6/6 FAIL against pre-migration empty DB, 6/6 PASS after migration
- Green: `drizzle-kit generate` reports zero drift; `pnpm db:check` → `db:check: ok`; all 3 live tests pass
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** → `docs/08-project/reviews/TMU-DB-002.md`

## Blockers

(none)
