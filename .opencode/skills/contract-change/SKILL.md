---
name: contract-change
description: Safe procedure for changing the backend or frontend contract. Use ONLY for TMU-CTR tasks or when a merged contract must change.
---

1. Confirm you are on a `TMU-CTR-*` task branch (lane `contracts`). Feature tasks may not change
   contracts — if one needs a change, create the CTR task and mark the feature BLOCKED.
2. Edit Zod schemas/registry in `packages/contracts`; **never hand-edit generated files**
   (`BE-02-openapi.yaml`, `generated/*`).
3. Run `pnpm contracts:build`, `contracts:check`, `contracts:lint`, `contracts:breaking`.
4. Bump `docs/04-contracts/CONTRACT_VERSION`:
   - additive optional fields/endpoints → **minor**;
   - rename/removal/semantic change → **major** + ADR + label `breaking`.
5. Update the affected docs (`BE-03` examples, `BE-04` codes, `FE-02`/`FE-03`) and
   `docs/04-contracts/CHANGELOG.md` with the reason and PR link.
6. Regenerate MSW handlers; confirm frontend tests still pass against them.
7. Open the PR with label `contract`; request both backend and frontend reviewers. Dependent
   branches rebase only after it merges.

Checklist:
- [ ] `contracts:check` green (no drift)
- [ ] `contracts:breaking` clean or explicitly labelled
- [ ] `CONTRACT_VERSION` and `CHANGELOG.md` updated
- [ ] Error codes have `error.<code>` keys; notification types have title/body keys
- [ ] Examples updated to match the new schemas
