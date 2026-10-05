---
id: TMU-META-008
title: Contract-doc governance sweep — BE-*/FE-* status, traceability rows and M2 evidence index
status: TODO
lane: meta
slug: contract-governance-sweep
milestone: M3
priority: P2
owner: docs-keeper
deps: [TMU-CTR-008]
refs: [CONTRACTS-README, DOR-DOD, TRACE]
created: 2026-10-03
updated: 2026-10-03
---

# TMU-META-008 — Contract-doc governance sweep — BE-*/FE-* status, traceability rows and M2 evidence index

## Goal

Close caveat 1 from `TMU-CTR-007`: all 25 contract documents (`BE-01..13`, `FE-01..12`,
README, plus the BE-02 companion) still carry `status: draft` although they are the binding
merged contract and were authored/reviewed through `TMU-CTR-001..008`. Run a governance
sweep: confirm each doc's content matches the merged registry/behaviour, flip front-matter
to `approved` where it does (or file a correction task where it doesn't), add the missing
FR/US → API-* traceability rows for the CTR additions, and index the M2 approval evidence
(review files) in one place.

## Acceptance criteria

- [ ] Every `docs/04-contracts/**` doc is `approved` or has a filed correction task; no silent draft.
- [ ] `docs/08-project/traceability-matrix.md` (and FR/US docs' API refs) cover all 66 operations.
- [ ] An evidence table in the sweep output links `TMU-CTR-001..008` + review verdicts.
- [ ] `pnpm gate` green; only `docs/**` and `docs/08-project/**` touched.

## Files expected to change

- `docs/04-contracts/**` (front-matter + corrections only)
- `docs/08-project/traceability-matrix.md`
- `docs/08-project/tasks/TMU-META-008.md`
- `docs/08-project/reviews/TMU-META-008.md`
