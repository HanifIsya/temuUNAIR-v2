---
id: WF-COMMITS
title: Commit and PR conventions
status: draft
owner: GS
updated: 2026-09-29
depends_on: ["WF-GIT"]
source_refs: ["Blueprint §7.2"]
---

# Commit and PR conventions

## Commit message

```
<type>(<scope>)<!>: <imperative subject ≤72 chars>

<why, not what — wrap at 100>

Task: TMU-BE-010
Refs: FR-REP-003, API-REP-01
Agent: backend-dev
```

| Part | Rule |
|---|---|
| Type | `feat` `fix` `docs` `test` `refactor` `perf` `build` `ci` `chore` `revert` |
| Scope | `web` `api` `worker` `ml` `db` `contracts` `ui` `i18n` `e2e` `docs` `ops` `agents` |
| `!` | breaking contract change; requires a `BREAKING CHANGE:` footer and an ADR |
| Subject | imperative, lowercase, no trailing period |
| Trailers | `Task:` (required), `Refs:` (FR/API/ADR ids), `Agent:` (agent name) |

Examples:

```
feat(api): add POST /reports with validation and idempotency

Implements API-REP-01 per the merged backend contract. Cross-field rules are
re-checked in the service layer because the DB CHECK only covers custody.

Task: TMU-BE-010
Refs: FR-REP-001, FR-REP-002, API-REP-01
Agent: backend-dev
```

```
feat(contracts)!: rename MatchView.score to internal-only

BREAKING CHANGE: score is removed from user-facing responses; staff views use
MatchModeratorView. Requires client regeneration and a minor UI change.

Task: TMU-CTR-004
Refs: ADR-0011, API-MAT-01
Agent: architect
```

## Rules

1. One logical change per commit; a red-test commit followed by a green commit is fine.
2. Never commit generated-file drift, secrets, `.env`, or large binaries.
3. commitlint enforces the format locally (lefthook) and in CI.
4. Squash merge means the **PR title** must be a valid Conventional Commit — it becomes the
   commit on `main`.

## Pull requests

- Title = squash commit message (same rules).
- Body: `.github/PULL_REQUEST_TEMPLATE.md` — task link, what/why, DoD evidence, labels,
  screenshots for UI, reviewer notes.
- Labels: `contract`, `breaking`, `migration`, `docs-only`, `needs-human`.
- Draft PR on first push (P1); mark ready only when the DoD is met (P3).
- Link the review file (`docs/08-project/reviews/<ID>.md`) in the PR body.
- Keep PRs < 400 changed lines where possible; split otherwise.

## PR checklist (author)

- [ ] Task file status/Progress log current
- [ ] `pnpm gate` green (paste tail)
- [ ] Red evidence recorded
- [ ] Contract/traceability/CHANGELOG updates included where required
- [ ] No secrets; gitleaks clean
- [ ] Review file linked; CI green

## PR checklist (human merger)

- [ ] Review verdict APPROVE (and security review for sensitive tasks)
- [ ] Labels correct; contract PRs merged before dependents
- [ ] Only one migration PR open
- [ ] Diff scoped to the task
- [ ] Squash merge; delete the branch; remove the worktree
