---
id: TMU-CTR-006
title: Reconcile BE-05 "Additions required by the docs" with the extensions-only 0001_init
status: TODO
lane: contracts
slug: be05-additions-vs-init-migration
milestone: M2
priority: P2
owner: architect
deps: [TMU-OPS-005]
refs: [BE-05, TMU-OPS-005]
created: 2026-10-01
updated: 2026-10-01
---

# TMU-CTR-006 — Reconcile BE-05 "Additions required by the docs" with the extensions-only `0001_init`

> ID note: filed as `TMU-CTR-006`, not `TMU-CTR-001`. The roadmap
> (`docs/01-product/10-roadmap.md:21`) reserves `TMU-CTR-001..005` for the M2 contracts
> implementation, and `TMU-CTR-001` in particular is named by `docs/04-contracts/CHANGELOG.md:16`,
> `docs/04-contracts/backend/BE-02-openapi.md:20` and `TMU-OPS-004.md:35`.

## Goal

Fix the contradiction between `docs/04-contracts/backend/BE-05-database-contract.md` and the
migration layout that `TMU-OPS-005` actually shipped, so the contract and the frozen migration
stop disagreeing before any domain table is written (M3).

## Context

- `BE-05` §"Additions required by the docs (to be included in `0001_init.sql`)" (line 126) tells
  the reader to put `ALTER TABLE reports ADD COLUMN needs_reprocess …` and three `CREATE INDEX`
  statements into `0001_init.sql`.
- `TMU-OPS-005` shipped `0001_init.sql` as **extensions only** (`vector`, `citext`), which its
  acceptance criteria require: *"The initial migration creates only what M0 needs; domain tables
  arrive in TMU-DB-001..005."*
- The statements quoted at BE-05:130-134 reference `reports`, `messages` and `notifications`,
  none of which exist at M0, so they cannot be applied by `0001_init.sql` as written.

## Why this is a contract task

A merged contract cannot be edited by a feature PR (`docs/04-contracts/README.md` governance rule
5). `TMU-OPS-005` may not touch `BE-05`, so the conflict is filed here instead of being papered
over.

## Decision needed

Either (a) retitle/relocate the BE-05 section so it reads as DDL that lands **with each table's own
migration** (TMU-DB-001..005) rather than in `0001_init.sql`, or (b) keep the section and state
explicitly that it supersedes the extensions-only baseline. Option (a) matches what M0 shipped and
keeps every migration self-contained.

## Acceptance criteria

- [ ] `BE-05` no longer instructs the reader to put table/column/index DDL into a migration that
      is defined to be extensions-only.
- [ ] The intended home of the `needs_reprocess` column and the three indexes is named, with the
      owning `TMU-DB-*` task identified.
- [ ] `BE-05` version/`CONTRACT_VERSION` treated per the contract-change protocol; `CHANGELOG.md`
      updated if the wording is material.
- [ ] `pnpm contracts:build`, `contracts:check`, `contracts:lint`, `contracts:breaking` all green.
- [ ] No migration file is edited (they are forward-only and, once merged, immutable).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-01 | orchestrator | filed | MINOR `m1` of the TMU-OPS-005 cycle-1 review (`docs/08-project/reviews/TMU-OPS-005.md`); must be filed before M3 starts |
| 2026-10-01 | orchestrator | renumbered | Cycle-2 review found `TMU-CTR-001` was reserved by the roadmap for the M2 contracts implementation → renumbered to `TMU-CTR-006` (C2-M1) |

## Blockers

(none)
