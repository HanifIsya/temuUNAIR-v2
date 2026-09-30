---
id: TMU-META-002
title: Post-merge bookkeeping — OPS-002 DONE and META-001 close-out
status: REVIEW
lane: meta
slug: post-merge-bookkeeping
milestone: M0
priority: P1
owner: docs-keeper
deps: [TMU-OPS-002, TMU-META-001]
refs: [WF-GIT, DEC-019]
created: 2026-09-30
updated: 2026-09-30
---

# TMU-META-002 — Post-merge bookkeeping: OPS-002 DONE and META-001 close-out

## Goal

Close loop step 13 for TMU-OPS-002 (merged as `b9d6ba6`, PR #5) and for TMU-META-001 itself
(merged as `5d1f9e1`, PR #4 — its own close-out was missed when PR #4 merged), then regenerate
the generated indexes so the M0 chain unblocks: TMU-OPS-003..007 depend on TMU-OPS-002.

## Context

- TMU-OPS-002 merged to `main` as `b9d6ba6` (PR [#5](https://github.com/HanifIsya/temuUNAIR-v2/pull/5),
  squash, 2026-09-30T14:02:52Z); its task file still reads `REVIEW` and its Evidence `PR:` line
  still says "(draft)".
- TMU-META-001 merged as `5d1f9e1` (PR [#4](https://github.com/HanifIsya/temuUNAIR-v2/pull/4),
  squash, 2026-09-30T10:51:11Z); its task file still reads `IN_PROGRESS` and its Evidence
  `PR:`/`Review:` lines are `(pending)`. Its review notes the close-out is step-13 work, not a
  finding.
- Task files, `backlog.md` and `status.md` are `_common`; `docs/08-project/**` is the `meta` lane
  (`.agent/lanes.json`).
- Observation from this round: the first cold `pnpm gate` in the fresh worktree hit the Vitest
  default 5000 ms timeout in `scripts/checks/config-presets.test.mjs` ("errors on `any` and
  `console` through the real root config", 5409 ms — ESLint + typescript-eslint cold load); warm
  re-runs pass in ~3.4 s. CI passed on PR #5. Filed as a follow-up in TMU-OPS-008 (gate/CI parity
  owns that guard), not fixed here (see Out of scope).

## Acceptance criteria

- [x] `docs/08-project/tasks/TMU-OPS-002.md` front-matter status is `DONE` with PR #5 and the
      merge commit `b9d6ba6` in the Progress log and Evidence.
- [x] `docs/08-project/tasks/TMU-META-001.md` front-matter status is `DONE` with PR #4, the merge
      commit `5d1f9e1` and the review link in the Progress log and Evidence.
- [x] `node scripts/backlog-index.mjs` regenerates `backlog.md`/`status.md` with OPS-002 and
      META-001 `DONE`; after this task's own status flip the indexes are re-generated so every
      backlog row matches its task front-matter (review cycle 1 MAJOR).
- [x] `pnpm gate` green.

## Files expected to change

- `docs/08-project/tasks/TMU-OPS-002.md`, `docs/08-project/tasks/TMU-META-001.md`
- `docs/08-project/tasks/TMU-META-002.md` (this file)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated)
- `docs/08-project/reviews/TMU-META-002.md`

## Out of scope

- Traceability-matrix rows (no FR/API touched in M0).
- `docs/04-contracts/CHANGELOG.md` (no contract change).
- The Vitest cold-timeout observation above: filed to TMU-OPS-008 (the guard is `scripts/**`,
  ops lane; this branch is meta).
- The `meta` commit-scope gap (review MINOR 3): `docs/05-workflow/**` is ops/arch lane, so the
  one-line scope-list fix (`meta` added) is filed to TMU-OPS-008; this branch complies meanwhile
  by using the allowed `tasks` scope for its fix commit and PR title.

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-09-30 | orchestrator | task filed | filed after PR #5 merged (`b9d6ba6`); also closes the META-001 self-close-out gap left by PR #4 |
| 2026-09-30 | docs-keeper | 0 SYNC | worktree `E:\wt\TMU-META-002` from `origin/main` @ `b9d6ba6`; `pnpm i --frozen-lockfile` OK; baseline `pnpm gate` green (first cold run hit the Vitest 5 s timeout in the ESLint guard — see Context; warm runs pass, 36/36) |
| 2026-09-30 | docs-keeper | 4 RED | probe → 6/6 FAIL (OPS-002/META-001 statuses, PR evidence, backlog rows) |
| 2026-09-30 | docs-keeper | 5 GREEN | statuses `DONE` with PR #4/#5 evidence, indexes regenerated, probe 6/6 PASS |
| 2026-09-30 | docs-keeper | 6 REFACTOR | evidence probe inlined in this file (temp file removed); gate green (`OK gate(quick) passed`, 36/36); status → `REVIEW` |
| 2026-09-30 | reviewer | 9 REVIEW c1 | verdict **CHANGES** — 1 MAJOR (indexes generated before the status flip → stale), 3 MINOR → `docs/08-project/reviews/TMU-META-002.md` |
| 2026-09-30 | docs-keeper | 9 REVIEW c1 fix | MAJOR: `node scripts/backlog-index.mjs` re-run after the status flip → indexes match front-matter (probe check 7); MINOR 1: red evidence re-cited against `b9d6ba6` (`--ref`); MINOR 2 filed to TMU-OPS-008 (cold Vitest timeout); MINOR 3 filed to TMU-OPS-008 (`meta` scope list) and fix commit/PR title use the allowed `tasks` scope |

### Plan

1. RED probe: statuses + indexes still show OPS-002/META-001 open.
2. Mark OPS-002 `DONE` (PR #5 / `b9d6ba6`); close META-001 (PR #4 / `5d1f9e1` + review link).
3. Regenerate `backlog.md`/`status.md`; GREEN probe.
4. `pnpm gate`; commit; review; ship; merge gate.

## Evidence

- Red: probe run against the pre-edit commit `b9d6ba6` (the reviewed state before this branch's
  changes) → **6/6 FAIL** (exit 1):

  ```
  $ node meta002-probe.mjs --ref b9d6ba6
  FAIL OPS-002 DONE
  FAIL OPS-002 PR5 evidence
  FAIL META-001 DONE
  FAIL META-001 PR4 evidence
  FAIL backlog OPS-002 DONE
  FAIL backlog META-001 DONE
  ```

- Green: same probe on the edited tree → **7/7 PASS** (exit 0); `node scripts/backlog-index.mjs`
  → `Wrote backlog.md (17 tasks) and status.md`; `pnpm gate` → `OK gate(quick) passed`
  (36/36 unit).
- Review cycle 1 fix: the committed indexes were generated before this task's own status flip and
  went stale (review MAJOR). Re-ran the generator after the flip; probe check 7
  ("indexes match task front-matter") now fails on `25234ef` and passes on the fix commit, and it
  is part of the inlined probe so future bookkeeping tasks cannot ship a stale index.
- Probe script (reproducible; save outside the repo, e.g.
  `$env:TEMP\meta002-probe.mjs`; `--ref <git-ref>` reads that commit's blobs via `git show`,
  default reads the working tree):

  ```js
  // TMU-META-002 bookkeeping probe (read-only). Usage: node meta002-probe.mjs [--ref <git-ref>]
  import { execSync } from "node:child_process";
  import { readFileSync, readdirSync } from "node:fs";

  const i = process.argv.indexOf("--ref");
  const ref = i === -1 ? null : process.argv[i + 1];
  const read = (p) =>
    ref ? execSync(`git show ${ref}:${p}`, { encoding: "utf8" }) : readFileSync(p, "utf8");
  const listTaskFiles = () =>
    ref
      ? execSync(`git ls-tree --name-only ${ref}:docs/08-project/tasks`, { encoding: "utf8" })
          .split(/\r?\n/)
          .filter(Boolean)
      : readdirSync("docs/08-project/tasks").filter((f) => f.endsWith(".md"));

  const o2 = read("docs/08-project/tasks/TMU-OPS-002.md");
  const m1 = read("docs/08-project/tasks/TMU-META-001.md");
  const bl = read("docs/08-project/backlog.md");
  const row = (id) => bl.split(/\r?\n/).find((l) => l.includes(`tasks/${id}.md)`)) || "";

  // Every task's backlog row must carry the same status as its front-matter.
  const mismatched = listTaskFiles().filter((f) => {
    const fm = read(`docs/08-project/tasks/${f}`);
    const status = (fm.match(/^status:\s*(\S+)/m) || [])[1];
    const rowStatus = (row(f.replace(/\.md$/, "")).split("|")[4] || "").trim();
    return status !== rowStatus;
  });

  const checks = [
    ["OPS-002 DONE", /^status: DONE$/m.test(o2)],
    ["OPS-002 PR5 evidence", /pull\/5/.test(o2) && /b9d6ba6/.test(o2)],
    ["META-001 DONE", /^status: DONE$/m.test(m1)],
    ["META-001 PR4 evidence", /pull\/4/.test(m1) && /5d1f9e1/.test(m1)],
    ["backlog OPS-002 DONE", /\| DONE \|/.test(row("TMU-OPS-002"))],
    ["backlog META-001 DONE", /\| DONE \|/.test(row("TMU-META-001"))],
    ["indexes match task front-matter", mismatched.length === 0],
  ];
  let fail = 0;
  for (const [name, ok] of checks) {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
    if (!ok) fail++;
  }
  if (mismatched.length) console.log(`mismatched: ${mismatched.join(", ")}`);
  process.exit(fail ? 1 : 0);
  ```

- PR: (pending)
- Review: cycle 1 **CHANGES** (1 MAJOR, 3 MINOR) → fixed; cycle 2 pending
  (`docs/08-project/reviews/TMU-META-002.md`)

## Blockers

(none)
