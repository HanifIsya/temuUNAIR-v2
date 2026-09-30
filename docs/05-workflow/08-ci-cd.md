---
id: WF-CICD
title: CI/CD
status: draft
owner: OR
updated: 2026-09-29
depends_on: ["WF-GIT", "WF-REVIEW"]
source_refs: ["Blueprint §7.10"]
---

# CI/CD

Workflow: `.github/workflows/ci.yml`. All jobs required on `main` except `audit` and
`docker-build` (initially advisory).

## Jobs

| Job | What it runs | Required | Notes |
|---|---|---|---|
| `lint-typecheck` | `format:check`, `lint`, `typecheck`, `i18n:check` | yes | fastest feedback |
| `unit` | `test:unit` (Vitest) | yes | |
| `contracts` | `contracts:check`, `contracts:lint`, `contracts:breaking` | yes | breaking needs `fetch-depth: 0` |
| `migrations` | `db:check` against a pgvector Postgres service | yes | applies migrations on an empty DB |
| `ml` | `uv sync`, `ruff check`, `pytest -m "not slow"` | yes | working dir `services/ml` |
| `integration` | `test:integration` (testcontainers) | yes | DB + MinIO + Mailpit |
| `contract-fuzz` | `test:contract` (Schemathesis) | yes | web + ML OpenAPI |
| `e2e` | Playwright with `ML_MODE=stub` | yes | on PRs touching `apps/**`/`packages/**` |
| `secret-scan` | gitleaks action | yes | full history |
| `audit` | `pnpm audit --prod --audit-level=high` | advisory | non-blocking at first |
| `docker-build` | build web image | on `main` | catches Dockerfile drift |

## Caching and performance

- pnpm store cached via `actions/setup-node` cache; Turborepo remote cache optional later.
- Playwright browsers cached by version; `ML_MODE=stub` avoids model downloads.
- `concurrency` cancels superseded runs on the same ref.
- Target: full PR pipeline < 15 min.

## Secrets in CI

| Secret | Use |
|---|---|
| `GITHUB_TOKEN` | gitleaks, PR comments |
| `TURBO_TOKEN` / `TURBO_TEAM` | optional remote cache |
| none else | tests use local services with dummy credentials |

Never print env in CI; mask secrets; `audit` runs without credentials.

## Branch protection (documented in this repo, configured on GitHub)

- `main`: PR required, review verdict on record (DEC-019; no approval count is required
  because no agent can post a GitHub approval), code-owner review for `packages/contracts/**`,
  `docs/04-contracts/**`, `packages/db/migrations/**`; required checks above; linear history;
  no force-push; no bypass; squash-merge only; auto-delete merged branches.
- Secret scanning + push protection on.
- Dependabot for npm/pip/actions.

## Local parity

`pnpm gate` mirrors the required jobs in quick mode; `pnpm gate:full` adds breaking, build,
integration, contract fuzz, E2E, gitleaks and audit — run it before marking a PR ready when the
task touches runtime code.

## Failure handling

1. Read the *first* failing job; `gh run view --log-failed` for details.
2. Fix the root cause in the lane; never disable a check.
3. `/fix-ci` max 3 attempts → `needs-human`.
4. Infra flakiness (service timeout) → re-run once, then treat as a blocker if it persists.

## CD (not automated)

Deploys are human-triggered per `docs/07-ops/02-deployment-runbook.md`; CI only builds and
verifies. No auto-deploy to production in MVP.
