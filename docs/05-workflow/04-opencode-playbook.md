---
id: WF-OPENCODE
title: OpenCode playbook
status: draft
owner: OR
updated: 2026-09-29
depends_on: ["WF-LOOP", "WF-ORCA"]
source_refs: ["Blueprint §6"]
---

# OpenCode playbook

## What loads when OpenCode starts

| File | Purpose |
|---|---|
| `AGENTS.md` | always-loaded rules (keep short) |
| `opencode.json` | config: default agent, permissions, instructions, MCP |
| `docs/05-workflow/05-definition-of-ready-done.md`, `13-coding-standards.md`, `docs/04-contracts/README.md` | extra instruction files |
| `.opencode/agents/*.md` | 11 agents |
| `.opencode/commands/*.md` | slash commands |
| `.opencode/skills/<name>/SKILL.md` | recipes loaded on demand |

**Config is loaded once.** After changing any of these files, quit and restart OpenCode.

## Agent catalogue

| Agent | Mode | Writes | Model tier (recommended) |
|---|---|---|---|
| `orchestrator` | primary | `docs/08-project/**` | strongest |
| `spec-writer` | subagent | product/design/quality docs | mid |
| `architect` | subagent | architecture docs, contracts, `packages/contracts` | strongest |
| `backend-dev` | subagent | `apps/web/src/server`, `app/api`, `apps/worker`, `packages/db` | strong |
| `frontend-dev` | subagent | `apps/web/src` UI paths | strong |
| `ml-dev` | subagent | `services/ml`, ML docs, eval | strong |
| `qa-engineer` | subagent | `tests/**`, `*.test.*`, quality docs | cheap/fast |
| `reviewer` | subagent | `docs/08-project/reviews/**` only | strongest |
| `security-reviewer` | subagent | reviews + security docs | strongest |
| `git-steward` | subagent | nothing (git only) | cheap/fast |
| `docs-keeper` | subagent | `docs/08-project/**`, changelog | cheap/fast |

Model names are **not** hard-coded in the agent files: add `model: provider/model-id` to any
agent frontmatter (or in `opencode.json`) to pin one.

## Permission model

- Global `opencode.json` denies `git push*`, `gh pr*`, `rm -rf*`, `curl*`, `wget*`, `sudo*`.
- Only `git-steward` may push and open PRs (its agent-level block overrides the global deny).
- Per-agent `edit` rules restrict writes by path; `bash` rules restrict commands.
- Rules are evaluated as ordered patterns — **last matching rule wins**, so the `"*"` catch-all
  goes first and specific rules after it.
- Path-restricted `edit` is a convenience; the real guarantees are `scripts/check-lane.sh` in the
  gate and branch protection on GitHub.

## Commands

| Command | Agent | What it does |
|---|---|---|
| `/task <ID>` | orchestrator | Run one task end-to-end |
| `/next [lane]` | orchestrator | Print the next runnable task and propose the worktree/branch |
| `/resume` | orchestrator | Recover state after a crash/new session |
| `/gate [full]` | current | Run `pnpm gate` or `pnpm gate:full` and summarise failures |
| `/review` | reviewer | Review the current branch against the task DoD |
| `/ship` | git-steward | Commit, rebase, gate, push, open/refresh PR |
| `/fix-ci` | orchestrator | Read failing CI logs, fix in the lane, re-gate, push |
| `/contract-check` | architect | `contracts:check`, `lint`, `breaking` and explain failures |
| `/contract-change <what>` | architect | Start a `TMU-CTR-*` task |
| `/blocker <text>` | orchestrator | Create `BLK-###` and mark the task BLOCKED |
| `/adr <title>` | architect | Create `ADR-####` |
| `/spec <doc-id>` | spec-writer | Draft one document from the manifest |
| `/eval-matching` | ml-dev | Run the eval harness and write a dated report |
| `/seed-demo` | backend-dev | Load synthetic demo data |
| `/status` | docs-keeper | Regenerate and show `status.md` |

## Skills

| Skill | Use when |
|---|---|
| `add-endpoint` | implementing any `API-*` endpoint |
| `add-page` | implementing any route from `FE-01` |
| `add-migration` | any schema change |
| `add-job` | new pg-boss queue/handler |
| `add-ml-endpoint` | new ML service route |
| `contract-change` | any change to `packages/contracts` or contracts docs |
| `commit-and-push` | finishing a green checkpoint |
| `open-pr` | creating/refreshing PRs from the template |
| `write-doc` | creating any manifest doc |
| `write-adr` | recording a decision |
| `write-gherkin` | acceptance criteria and test-case derivation |
| `tune-matching` | changing weights/thresholds/models with an eval report |
| `add-i18n-keys` | adding UI strings (id + en) and error keys |

## Session hygiene

1. Start every session with `/resume` or `/task <ID>` — never free-form.
2. Keep one task per session; if you must switch, finish or park the first with a Progress log
   note.
3. After a crash: `git status` + task file Progress log, then `/resume`.
4. Before ending: push green work and write the Progress log; never leave unpushed red state.
5. `touch .agent/STOP` halts any loop; delete it to resume.

## MCP servers

| Server | Enabled | Use |
|---|---|---|
| `playwright` | off by default | visual/UI verification (frontend tasks) |
| `context7` | off by default | up-to-date library docs |

Enable only when needed; both add token overhead and latency.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `ConfigInvalidError` on start | validate `opencode.json` against `$schema`; use `OPENCODE_DISABLE_PROJECT_CONFIG=1` to start and fix |
| Agent edits outside its lane | check the frontmatter `permission.edit` patterns and `check-lane.sh` |
| Permission prompt storm | narrow the `bash` patterns; the catch-all stays `ask` |
| Command not found | commands live in `.opencode/commands/*.md`; restart after adding |
| Skill not triggering | ensure `description` mentions the trigger keywords; restart |
