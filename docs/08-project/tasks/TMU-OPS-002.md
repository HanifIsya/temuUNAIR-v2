---
id: TMU-OPS-002
title: Shared config presets in packages/config
status: TODO
lane: ops
slug: shared-config-presets
milestone: M0
priority: P1
owner: ops-dev
deps: [TMU-OPS-001]
refs: [ARCH-STACK, WF-STANDARDS]
created: 2026-09-29
updated: 2026-09-30
---

# TMU-OPS-002 — Shared config presets in `packages/config`

## Goal

Give every workspace package one place to import its TypeScript, ESLint, Prettier and Vitest
settings from, so `lint`/`typecheck`/`test:unit` are real (not placeholders) and the coding
standards in `docs/05-workflow/13-coding-standards.md` are enforced by tooling.

## Context

- `docs/03-architecture/02-tech-stack-and-versions.md` pins ESLint (flat) + Prettier, TS 5.x
  `strict: true`, Vitest + Testing Library + jest-axe.
- `docs/05-workflow/13-coding-standards.md` forbids `any`, `@ts-ignore`, `console.log`, raw
  `fetch("/api/v1/…")` and raw hex/px — the presets are where those become lint rules.
- Blueprint §3 lists `packages/config/` as "tsconfig, eslint, prettier presets".
- `packages/config/**` is ops-lane (`.agent/lanes.json`), so this task runs on an `ops` branch;
  consuming packages extend the presets from their own lane in later tasks.

## Acceptance criteria

- [ ] `packages/config/tsconfig.base.json` sets `strict`, `noUncheckedIndexedAccess`,
      `noImplicitOverride`; the root `tsconfig.base.json` re-exports it (no behaviour change).
- [ ] `packages/config/eslint.config.mjs` exports a flat config erroring on
      `@typescript-eslint/no-explicit-any`, `@typescript-eslint/ban-ts-comment` and `no-console`
      in app code; the root `eslint.config.mjs` consumes it.
- [ ] `packages/config/vitest.base.ts` exports the shared Vitest defaults; the root
      `vitest.config.ts` consumes it.
- [ ] A deliberately bad fixture under `scripts/tooling/**` fails `pnpm lint` and `pnpm typecheck`
      (red evidence), then is removed.
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` still exit 0 on the clean tree.
- [ ] No dependency is added outside `packages/config`'s own `package.json` (root devDependencies
      keep only what the root configs themselves import).
- [ ] `pnpm gate` green.

## Files expected to change

- `packages/config/**` (package.json, tsconfig.base.json, eslint.config.mjs, prettier.json,
  vitest.base.ts)
- root `tsconfig.base.json`, `eslint.config.mjs`, `vitest.config.ts` (delegate to the presets)
- root `package.json`, `pnpm-lock.yaml` (workspace dependency on `@temuunair/config`)
- `scripts/tooling/**` (temporary bad fixture; removed before commit)

## Out of scope

- App/package-specific overrides (added by the owning package in later tasks).
- CI changes (TMU-OPS-008).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| 2026-09-30 | orchestrator | rewritten | owner → `ops-dev` (created in TMU-OPS-011); criteria made satisfiable in-lane |

### Plan

1. Create `packages/config` with `package.json`, `tsconfig.base.json`, `eslint.config.mjs`,
   `prettier.json`, `vitest.base.ts`.
2. Point the root configs at the presets (ops-lane files, same branch).
3. Add a temporary bad fixture under `tests/tooling/`, capture the red lint/typecheck output,
   delete it.
4. Re-run `pnpm gate`; capture the tail.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
