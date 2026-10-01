---
id: TMU-OPS-018
title: Make shared configs aware of apps/web (generated next-env.d.ts, automatic JSX)
status: TODO
lane: ops
slug: shared-configs-apps-web
milestone: M0
priority: P2
owner: ops-dev
deps: []
refs: [WF-STANDARDS, TMU-OPS-003]
created: 2026-10-01
updated: 2026-10-01
---

# TMU-OPS-018 — Make shared configs aware of `apps/web`

## Goal

Stop the shared, ops-owned configs from tripping over `apps/web` artefacts: a local
`next build` must not break `pnpm gate` (generated `next-env.d.ts`), and root Vitest must
compile `.tsx` with the automatic JSX runtime so new component files work without per-file
pragmas.

## Context

Findings while delivering TMU-OPS-003 (all reproduced 2026-10-01 in `E:\wt\TMU-OPS-003`):

1. `next build` writes `apps/web/next-env.d.ts` (CRLF, `/// <reference ... />` lines). It is
   untracked and owned by no lane. Consequences with today's configs:
   - `pnpm lint` (`eslint .`) fails: `@typescript-eslint/triple-slash-reference`
     (`Do not use a triple slash reference for ./.next/types/routes.d.ts`).
   - `pnpm format:check` fails when the file carries CRLF (`prettier` wants `lf`).
   - `.gitignore` has no `next-env.d.ts` entry, so an `git add -A` would stage a file
     no lane covers (lane check then fails).
   CI is unaffected today (no build step), but `gate:full` re-runs would fail locally, and so
   would any reviewer who runs the build before the gate.
2. Root `vitest run` compiles `.tsx` under `apps/web/src` with esbuild's *classic* runtime,
   because the nearest tsconfig (`apps/web/tsconfig.json`) is pinned to `jsx: "preserve"` by
   Next. TMU-OPS-003 works around this with a `/** @jsxRuntime automatic */` pragma at the top
   of every `.tsx` (the clean `apps/web/src/tsconfig.json` fix is outside the `fe` lane).
   Setting `esbuild.jsx: "automatic"` in the root Vitest config removes the footgun for
   future files.

## Acceptance criteria

- [ ] `next-env.d.ts` is ignored in `.gitignore` and `.prettierignore`, and `**/next-env.d.ts`
      is added to the `ignores` list in `packages/config/eslint.config.mjs`.
- [ ] After `pnpm --filter @temuunair/web build` on a fresh worktree, `pnpm gate` is green
      without deleting or reformatting anything.
- [ ] Root `vitest.config.ts` sets `esbuild: { jsx: "automatic" }` so a `.tsx` file without a
      pragma renders correctly in a component test; `pnpm gate` stays green with the existing
      pragma-bearing files untouched.
- [ ] Test files under `apps/web/src` are typechecked by `pnpm gate` — today
      `apps/web/tsconfig.json` excludes `**/*.test.{ts,tsx}` and the root `tsconfig.json` (the
      only thing the gate typechecks) includes just `scripts/**`, so type drift in component
      tests passes unnoticed (REV-TMU-OPS-003 finding F5).
- [ ] `pnpm gate` green.

## Files expected to change

- `.gitignore`, `.prettierignore`
- `packages/config/eslint.config.mjs`
- `vitest.config.ts` (root)
- `docs/08-project/tasks/TMU-OPS-018.md` (this file)

## Out of scope

- Removing the `/** @jsxRuntime automatic */` pragmas added by TMU-OPS-003 (harmless; keep
  until FE standards decide otherwise).
- Changing what `next build` generates (Next.js behaviour).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-01 | orchestrator | task filed | finding from TMU-OPS-003 GREEN/GATE (ops-lane files: eslint/preset, gitignore, prettierignore, root vitest config) |
| 2026-10-01 | orchestrator | extended | folded in REV-TMU-OPS-003 minor F5 (apps/web test files not typechecked by any gate step) |

### Plan

1. Add `next-env.d.ts` to `.gitignore` and `.prettierignore`.
2. Add `**/next-env.d.ts` to `packages/config/eslint.config.mjs` ignores.
3. Add `esbuild: { jsx: "automatic" }` to root `vitest.config.ts`.
4. Fresh-worktree proof: build → `pnpm gate` green without manual cleanup.

## Evidence

- Red: (pending)
- Green: (pending)
- PR: (pending)
- Review: (pending)

## Blockers

(none)
