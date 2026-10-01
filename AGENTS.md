# TemuUNAIR — Agent Rules

TemuUNAIR is a lost-and-found web platform for Universitas Airlangga with AI matching
(text + photo + location + time). Full plan: `docs/00-BLUEPRINT.md`.

Remote: **`https://github.com/HanifIsya/temuUNAIR-v2`** — all pushes go there, under the
**HanifIsya** GitHub account. Never push to any other remote (the pre-push hook enforces this).

## Read order for every task
1. `docs/08-project/tasks/<TASK-ID>.md` — assignment, DoD, Progress log
2. Linked FR / US / SCR docs
3. `docs/04-contracts/backend/*` and/or `frontend/*` — **the contract is law**
4. `docs/05-workflow/02-agent-loop.md`

## Commands
`pnpm i` · `pnpm dev` · `pnpm gate` (quick) · `pnpm gate:full` · `pnpm contracts:build` ·
`pnpm db:migrate` · `pnpm test:unit` · `pnpm test:integration` · `pnpm test:e2e` ·
ML: `cd services/ml && uv run pytest`

## Hard rules
1. Contract-first. If behaviour is not in a merged contract, STOP and request a `TMU-CTR-*` task.
2. Stay in your lane (`.agent/lanes.json`). `scripts/check-lane.sh` enforces it.
3. Tests first (red → green → refactor). Never weaken or delete tests to pass the gate.
4. NEVER: push directly to `main`; merge to `main` only at loop step 12 MERGE GATE (any agent may merge, a human may still merge; DEC-020) - breaking/irreversible contract or migration PRs stop for a human; force-push except `--force-with-lease` on your own `agent/*` branch;
   use `--no-verify`; commit secrets or `.env`; edit a merged migration; hand-edit generated files.
5. Privacy: never log or return hint answers, emails, embeddings, or raw image URLs of sensitive items.
   Fixtures use synthetic data only.
6. Ambiguity → write `docs/08-project/blockers/BLK-###.md` (or a DEC/ADR) and stop that task.
7. Minimal diffs. One task per branch. No drive-by refactors.
8. Conventional Commits with `Task:` trailer (`docs/05-workflow/07-commit-and-pr-conventions.md`).
9. UI text lives in i18n files only (`id` default, `en` mirror). Error `code`s need `error.<code>` keys.
10. Finish by: updating the task file (status, Progress log, evidence), running `pnpm gate`, handing off to `@reviewer`.

## Loop safety
If `.agent/STOP` exists, stop immediately. Max 5 fix attempts per failing gate step;
the same error signature 3 times ⇒ write a blocker and stop.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
