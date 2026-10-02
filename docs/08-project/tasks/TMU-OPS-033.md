---
id: TMU-OPS-033
title: Widen the docs lane to docs/_source/** (M1 source intake enabler)
status: TODO
lane: ops
slug: widen-docs-lane-source
milestone: M1
priority: P1
owner: ops-dev
deps: [TMU-DOC-001]
refs: [BLUEPRINT, SRC-README]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-OPS-033 — Widen the docs lane to `docs/_source/**` (M1 source intake enabler)

> ID note: filed as `TMU-OPS-033`. The roadmap reserves `TMU-OPS-022..026` for M9 and
> `TMU-OPS-027..032` for M8, so the first unallocated OPS ID is `033`. This is unplanned
> enabler work discovered during M1 backlog filing (TMU-META-004), not M8/M9 content.

## Goal

Teach the docs lane to own its whole source folder: `.agent/lanes.json` currently lists only
`docs/_source/proposal-extract.md`, so a docs-lane branch cannot commit the dropped-in
`docs/_source/proposal.pdf` or update `docs/_source/README.md` — `scripts/check-lane.sh` fails on
both paths. M1's exit criteria ("PDF + logo added") are unreachable until this is widened.

## Context

- The human has dropped the real `proposal.pdf` into `docs/_source/` in the **main checkout**
  (`E:\TemuUNAIR-v2\docs\_source\proposal.pdf`, untracked — so it is *not* in git and not in any
  agent worktree, which are created from `origin/main`). `docs/_source/README.md:17` says the
  file "must be added by a human" — the human's drop is done; committing it is bookkeeping that
  belongs to the docs lane (`TMU-DOC-002`, which copies it from the main checkout or picks it up
  once the human commits it).
- The docs lane (`.agent/lanes.json:11-17`) already owns `docs/01-product/**`,
  `docs/02-design/**` … and the single file `docs/_source/proposal-extract.md`. The other source
  paths (`proposal.pdf`, `README.md`, `logo.png`) are uncovered by any lane.
- `_source/README.md`'s "read-only for agents" rule governs source **content** (never edit or
  delete a source file); it does not forbid committing a file the human placed. This task changes
  permissions only — no source file content is touched.
- Only an ops-lane branch may edit `.agent/lanes.json` (it matches the `ops` globs only), which
  is why this is a separate task rather than part of `TMU-DOC-002`.

## Acceptance criteria

- [ ] The docs lane in `.agent/lanes.json` covers `docs/_source/**` (the narrower
      `docs/_source/proposal-extract.md` entry is subsumed and removed).
- [ ] No other lane's globs and no `_common` entry change; the eleven lane names stay intact.
- [ ] This branch only edits `.agent/lanes.json` and this task file — `bash scripts/check-lane.sh`
      passes.
- [ ] A probe proves the gap is closed: after this merges, a docs-lane branch can stage a
      `docs/_source/**` path and pass `bash scripts/check-lane.sh`. The PDF itself is not in
      this ops worktree (untracked, main checkout only), so the live probe —
      `git add docs/_source/proposal.pdf` + lane check — is performed by `TMU-DOC-002` and
      cross-referenced back into this task's Progress log; the static proof here is that the
      widened docs globs cover the path (record the glob diff in the Progress log).
- [ ] `pnpm gate` green, including the scaffold lane-map tests.

## Files expected to change

- `.agent/lanes.json`
- `docs/08-project/tasks/TMU-OPS-033.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown — lane gap found while planning source intake |

## Blockers

(none)
