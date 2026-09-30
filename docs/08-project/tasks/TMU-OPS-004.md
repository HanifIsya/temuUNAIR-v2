---
id: TMU-OPS-004
title: Contracts package skeleton and real contracts checks
status: TODO
lane: contracts
slug: contracts-package-skeleton
milestone: M0
priority: P1
owner: architect
deps: [TMU-OPS-002]
refs: [CONTRACTS-README, BE-01, FE-01]
created: 2026-09-29
updated: 2026-09-30
---

# TMU-OPS-004 — Contracts package skeleton and real `contracts:*` checks

## Goal

Create `packages/contracts` as the single source of truth workspace package (Zod schemas +
route registry) with a generator that emits `BE-02-openapi.yaml`, `generated/types.ts`,
`generated/client.ts` and `generated/msw-handlers.ts`, so `contracts:check` and
`contracts:lint` are real from M0 instead of placeholders.

## Context

- `docs/04-contracts/README.md` governance: `packages/contracts` is the single source; every
  generated artefact is derived; `CONTRACT_VERSION` follows semver.
- `docs/04-contracts/backend/BE-02-openapi.md` and `docs/04-contracts/frontend/FE-01-route-map.md`
  describe the intended outputs.
- The root gate scripts already route here: `scripts/checks/step.mjs` (TMU-OPS-011) runs
  `pnpm --filter @temuunair/contracts run <build|check|lint|breaking>` as soon as
  `packages/contracts/package.json` exists, and falls back to the named placeholder until then.
  **No root file needs to change in this task.**
- The real endpoint catalogue is authored in M2 (`TMU-CTR-001..005`); this task only builds the
  pipeline and a minimal registry so the checks can run.

## Acceptance criteria

- [ ] `pnpm contracts:build` regenerates all four artefacts deterministically; running it twice
      produces no diff.
- [ ] `pnpm contracts:check` fails when a generated file is hand-edited (red evidence) and passes
      when regenerated.
- [ ] `pnpm contracts:lint` validates the emitted OpenAPI against the rules in BE-01.
- [ ] `pnpm contracts:breaking` compares against the last released `CONTRACT_VERSION` and exits 0
      on a non-breaking change (red evidence for a breaking one).
- [ ] `docs/04-contracts/CONTRACT_VERSION` is read by the build and stamped into the artefacts.
- [ ] `pnpm gate` green (the `contracts:*` steps now run the real package).

## Files expected to change

- `packages/contracts/**` (package.json, src/, scripts/)
- `docs/04-contracts/CONTRACT_VERSION` (only if the build needs it machine-readable)

## Out of scope

- Authoring the real endpoint schemas (M2, `TMU-CTR-001..005`).
- ML OpenAPI export (`services/ml`, TMU-OPS-006 / M5).
- Schemathesis fuzzing (TMU-OPS-008).
- Root `package.json`/`scripts/**` edits: the dispatcher already routes this step; if a change is
  needed, file a follow-up `ops` task.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | root-script dependency removed (dispatcher exists from TMU-OPS-011) |

### Plan

1. Scaffold `packages/contracts` with Zod + a minimal route registry.
2. Implement the generator for OpenAPI, types, client and MSW handlers.
3. Implement the package scripts `build`/`check`/`lint`/`breaking`.
4. Capture red evidence from a hand-edited generated file and a breaking change, then restore.
5. `pnpm gate`.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)