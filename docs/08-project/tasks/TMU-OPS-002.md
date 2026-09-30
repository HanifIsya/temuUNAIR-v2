---
id: TMU-OPS-002
title: Shared config presets in packages/config
status: TODO
lane: ops
slug: shared-config-presets
milestone: M0
priority: P1
owner: orchestrator
deps: [TMU-OPS-001]
refs: [ARCH-STACK, WF-STANDARDS]
created: 2026-09-29
updated: 2026-09-29
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

## Acceptance criteria

- [ ] `packages/config` exports a base tsconfig with `strict`, `noUncheckedIndexedAccess`,
      `noImplicitOverride`.
- [ ] `packages/config` exports a flat ESLint config that errors on `@typescript-eslint/no-explicit-any`,
      `@typescript-eslint/ban-ts-comment` and `no-console` in app code.
- [ ] A deliberately bad fixture file fails `pnpm lint` and `pnpm typecheck` (red evidence),
      then is removed.
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` still exit 0 on the clean tree.
- [ ] No dependency is added outside `packages/config`'s own `package.json`.

## Files expected to change

- `packages/config/**`
- root `package.json` (devDependencies + script wiring)
- `pnpm-lock.yaml`

## Out of scope

- App/package-specific overrides (added by the owning package in later tasks).
- CI changes (TMU-OPS-008).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-29 | orchestrator | task filed | backlog row created |
| | | | |

### Plan

1. Create `packages/config` with `package.json`, `tsconfig.base.json`, `eslint.config.mjs`,
   `prettier.json`, `vitest.base.ts`.
2. Wire the root scripts to consume the presets.
3. Add a temporary bad fixture, capture the red lint/typecheck output, delete it.
4. Re-run `pnpm gate`; capture the tail.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
