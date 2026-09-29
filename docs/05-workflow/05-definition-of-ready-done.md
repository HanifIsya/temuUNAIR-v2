---
id: DOR-DOD
title: Definition of Ready and Done
status: draft
owner: OR
updated: 2026-09-29
depends_on: ["WF-LOOP", "BE-13", "FE-12"]
source_refs: ["Blueprint §4.6, §7.6", "P1, P4"]
---

# Definition of Ready (DoR) / Definition of Done (DoD)

## Definition of Ready — a task may start only when all are true

| # | Check |
|---|---|
| 1 | Task file exists with front-matter (`id`, `title`, `status: TODO`, `lane`, `milestone`, `deps`, `priority`, `owner`) |
| 2 | All `deps` are `DONE` and merged to `main` |
| 3 | Linked FR/US/SCR/API/DB IDs exist in merged docs (P1: docs before code) |
| 4 | Contract entries needed by the task are merged (P2) — or the task is explicitly a `TMU-CTR-*` |
| 5 | Acceptance criteria (Gherkin) are available for the behaviour |
| 6 | The lane's paths in `.agent/lanes.json` cover every file the task will touch |
| 7 | No conflicting open PR in the same files (contract/migration serialization respected) |
| 8 | Any required secrets/credentials are present in the dev environment (or a blocker is filed) |

A task that fails DoR is marked `BLOCKED` with a blocker file — never started "optimistically".

## Definition of Done — a task is complete only when all are true

| # | Check | Evidence in the task file |
|---|---|---|
| 1 | Red tests existed first and failed for the right reason | "red evidence": command + failure summary |
| 2 | All new/updated tests pass; full `pnpm gate` green | pasted gate tail |
| 3 | Contract tests pass for every touched `API-*` (`expectMatchesContract`) | test names |
| 4 | Auth/RBAC asserted for new endpoints; state transitions covered | test names |
| 5 | Privacy: no hint answers, emails, embeddings, sensitive URLs logged or returned | reviewer note |
| 6 | i18n keys added for both `id` and `en`, including any new `error.<code>` | `i18n:check` green |
| 7 | A11y: component states + keyboard path + zero axe violations (UI tasks) | component test output |
| 8 | Docs updated: task file status, Progress log, traceability row, CHANGELOG for contracts | links |
| 9 | Generated files in sync (`contracts:check`), no hand edits | gate output |
| 10 | Reviewer verdict `APPROVE` in `docs/08-project/reviews/<ID>.md` (fresh context) | review file |
| 11 | Security review done for sensitive tasks (auth, claims, uploads, privacy) | review file |
| 12 | PR ready, CI green, labels correct; worktree note updated | PR URL |

## Review cycles

- Max **2** review cycles per task; after that the PR gets `needs-human` and stops.
- Reviewer findings are labelled BLOCKER / MAJOR / MINOR. BLOCKER/MAJOR → back to step 5 of the
  loop. MINOR → may be a follow-up task (must be filed, not silently ignored).

## Definition of Done for a milestone

1. Every task in the milestone is `DONE` (or explicitly moved/cut with a decision entry).
2. `pnpm gate:full` green on `main`; E2E suite green.
3. Demo checklist for the milestone passes (see `10-roadmap.md`).
4. Risk register reviewed; scores ≥ 15 have actions.
5. `status.md` regenerated; traceability matrix has no orphan rows.
6. Human tags `m<N>-<name>`.

## Anti-patterns (automatic review rejection)

- Tests added after implementation without red evidence.
- "TODO" left in code paths that the task claims complete.
- Weakening an assertion or deleting a test to pass.
- Contract change smuggled into a feature PR.
- Generated files hand-edited.
- Out-of-lane edits.
- Private fields leaked into responses "because the UI does not show them".
