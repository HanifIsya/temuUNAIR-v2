---
id: TMU-OPS-038
title: Fix main CI red — gitleaks allowlist coverage (secret-scan) + web image `patches/` COPY (docker-build)
status: DONE
lane: ops
slug: main-ci-green
milestone: M3
priority: P1
owner: ops-dev
deps: []
refs: [WF-CICD, WF-SECRETS, TMU-FE-003]
created: 2026-10-05
updated: 2026-10-05
---

# TMU-OPS-038 — Fix main CI red: secret-scan allowlist coverage + web image `patches/` COPY

## Goal

`/fix-ci` (loop step 0/11): the squash-merge of TMU-FE-003 (`8f13326`, PR #46) left the main
push-run CI red on two jobs:

1. **`secret-scan` (required)** — `gitleaks/gitleaks-action@v2` scans the pushed commit's
   diff (417 files: the PR content plus the whole M3 stack that first entered
   `origin/main` history through this squash) and reports two `generic-api-key` findings.
   A full-history `gitleaks detect` (the `gate:full` secret-scan step, `scripts/gate.sh:25`)
   reports **4** on the merged tree — the same two findings, each found twice:
   - `apps/worker/src/config.ts:41` — the capture is the env-var *reference*
     `env.S3_SECRET_KEY` on the dev-default line `s3SecretKey: env.S3_SECRET_KEY ?? "minioadmin"`.
     The existing allowlist regex `minioadmin` never matches that capture, so the
     well-known dev placeholder is still flagged. Pre-existing M3-stack code (not part of
     the wizard change set itself); it entered `origin/main` history via this squash.
   - `docs/08-project/reviews/TMU-FE-003-security.md:39` — the advisory identifier
     `GHSA-7rqj-j65f-68wh` quoted in security finding M-6. A documented identifier, not a
     secret (`WF-SECRETS` already allowlists example/docs values by design).

   Both are false positives. The fix is narrow allowlist entries in `.gitleaks.toml` —
   two regexes plus a `.gitleaks.toml` path exemption for the config file itself (it
   contains secret-shaped patterns by design, same rationale as the existing
   `.github/workflows/ci.yml` path entry). No source file or review doc exempted wholesale.

2. **`docker-build` (advisory, main-push only — `ci.yml:180-186`)** — the deps stage fails
   `ENOENT patches/drizzle-kit@0.31.11.patch`: `pnpm install --frozen-lockfile` applies
   `pnpm.patchedDependencies` (root `package.json:57-59`, introduced with the BLK-002 fix
   in TMU-OPS-035) but the stage copies only workspace manifests, never `patches/`.
   Pre-existing before the merge (run `36976231643` at `fcbc9b8` also failed). The fix is
   `COPY patches/ ./patches/` before install; `.dockerignore` does not exclude `patches`.

## Acceptance criteria

- [x] `gitleaks detect --no-banner` reports zero leaks over full history on the fixed tree
      (this is the `gate:full` secret-scan command).
- [x] `.gitleaks.toml` gains only: the `.gitleaks.toml` path exemption + two narrow regexes
      (`env.S3_SECRET_KEY` env-var reference, `GHSA-…` advisory IDs). No source or review
      file allowlisted by path.
- [x] `infra/docker/web.Dockerfile` deps stage copies `patches/` before
      `pnpm install --frozen-lockfile`.
- [x] `pnpm gate` (quick) green on the branch, lane check included.
- [x] CI on this PR: `secret-scan` success (required jobs all green).
- [x] Post-merge main push run: `secret-scan` success **and** `docker-build` success.
- [x] Task file updated (status, Progress log, evidence); `backlog.md`/`status.md`
      regenerated; review verdict recorded.

## Files expected to change

- `.gitleaks.toml`
- `infra/docker/web.Dockerfile`
- `docs/08-project/tasks/TMU-OPS-038.md`, `docs/08-project/tasks/TMU-OPS-039.md`
  (files security finding M-6's upgrade follow-up — see Out of scope),
  `docs/08-project/reviews/TMU-OPS-038.md`
- `docs/08-project/backlog.md`, `docs/08-project/status.md`

## Out of scope

- The CI `audit` job (advisory: `continue-on-error`, `ci.yml:171`) stays red until the
  production advisories are upgraded away — that is security review M-6, filed here as
  **TMU-OPS-039** (dependency upgrade + ADR), not fixed by this change.
- Dependabot's own `npm_and_yarn … Update` workflow runs (not required `ci.yml` checks).

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-05 | ops-dev | 0 SYNC | main push run `37265352637` on `8f13326`: required jobs green except **`secret-scan` failure** (2 findings: `apps/worker/src/config.ts:41`, `docs/08-project/reviews/TMU-FE-003-security.md:39`); `docker-build` failure `ENOENT patches/drizzle-kit@0.31.11.patch` (advisory; same job also failed at `fcbc9b8`, run `36976231643`); `audit` failure = advisory (M-6 → TMU-OPS-039) |
| 2026-10-05 | ops-dev | 0 SYNC | local full-history `gitleaks detect` on the merged tree → `169 commits scanned, leaks found: 4` (the two findings, each twice) — gate:full would be red |
| 2026-10-05 | ops-dev | 1 PICK | fix-ci task created (loop step 0: stop and fix main); branch `agent/ops/TMU-OPS-038-main-ci-green` from `origin/main` (`8f13326`) |
| 2026-10-05 | ops-dev | 5 GREEN | `.gitleaks.toml`: path exemption `^\.gitleaks\.toml$` + regexes `env\.S3_SECRET_KEY` (env-var reference capture) and `GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}` (advisory IDs); `infra/docker/web.Dockerfile`: `COPY patches/ ./patches/` before `pnpm install --frozen-lockfile`; M-6 dispositioned as new task TMU-OPS-039 |
| 2026-10-05 | ops-dev | 5 GREEN | verify: full-history `gitleaks detect` (the gate:full command) → `169 commits scanned, no leaks found` (was `leaks found: 4`); `gitleaks dir` over the changed files → findings only in gitignored `apps/web/.next/` build cache (never committed) |
| 2026-10-05 | ops-dev | 7 GATE | `pnpm gate` (quick) → `OK gate(quick) passed`, exit 0 (lane check, format, lint, typecheck, i18n, unit, contracts 1.1.0, db:check ok, ml 7/7) |
| 2026-10-05 | ops-dev | 8 COMMIT/PUSH | committed `b731e3c` and pushed to `origin/agent/ops/TMU-OPS-038-main-ci-green` |
| 2026-10-05 | ops-dev | 9 REVIEW | adversarial reviewer cycle 1: **APPROVE** (0 B / 0 M / 1 MINOR closed); recorded in `docs/08-project/reviews/TMU-OPS-038.md` |
| 2026-10-05 | ops-dev | 10 SHIP | draft PR [#47](https://github.com/HanifIsya/temuUNAIR-v2/pull/47) created, marked ready for review |
| 2026-10-05 | ops-dev | 11 CI | 10 required jobs pass (`secret-scan` 10s, `build`, `e2e`, `integration`, `unit`, `contracts`, `contract-fuzz`, `lint-typecheck`, `migrations`, `ml`), `docker-build` skips on PR, `audit` advisory fail |
| 2026-10-05 | ops-dev | 12 MERGE | PR #47 squash-merged to `origin/main` (step 12 MERGE GATE per DEC-020) |
| 2026-10-05 | ops-dev | 13 POST-MERGE | task flipped to DONE; backlog/status regenerated; main branch synced |

## Evidence

- `gitleaks detect --no-banner` on merged tree: 170 commits scanned, **no leaks found** (down from 4 leaks across history).
- CI PR #47: `secret-scan` passed in 10s (run `37278897687`), all required checks green.
- Reviewer: cycle 1 verdict **APPROVE** in `docs/08-project/reviews/TMU-OPS-038.md`.
- PR: [#47](https://github.com/HanifIsya/temuUNAIR-v2/pull/47).

## Definition of Done

See `docs/05-workflow/05-definition-of-ready-done.md`. Evidence above; review verdict in
`docs/08-project/reviews/TMU-OPS-038.md`.
