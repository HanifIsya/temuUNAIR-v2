---
name: add-migration
description: Recipe for a forward-only database migration in packages/db. Use for any schema change (new table, column, index, enum).
---

1. Confirm the change is described in `docs/04-contracts/backend/BE-05` (or the task is a
   `TMU-CTR-*`/`TMU-DB-*` that updates it). No contract → stop.
2. Check no other remote `agent/db/*` branch is open (migration numbers would collide).
3. Create `packages/db/migrations/NNNN_description.sql`:
   - forward-only; never edit a merged migration;
   - `snake_case`; every table has `id`, `created_at`, `updated_at`;
   - `CREATE INDEX CONCURRENTLY` for large tables (outside a transaction);
   - add the rollback note as a comment at the top.
4. Update the Drizzle schema and seeds if the change affects them.
5. Write a `db:check` test: apply on an empty pgvector DB, assert the schema/constraints.
6. Run `pnpm db:check && pnpm gate`.

Checklist:
- [ ] Constraints encode business rules (e.g. partial unique indexes for claims)
- [ ] Indexes justified in the PR description
- [ ] No data-destructive statements without an ADR and a backup plan
- [ ] Rollback note present and accurate
