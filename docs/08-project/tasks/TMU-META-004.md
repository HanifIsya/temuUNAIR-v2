---
id: TMU-META-004
title: File the M1 task breakdown (TMU-DOC-002..020) and the source-lane enabler
status: REVIEW
lane: meta
slug: file-m1-backlog
milestone: M1
priority: P1
owner: orchestrator
deps: [TMU-DOC-001]
refs: [ROADMAP, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-META-004 — File the M1 task breakdown (TMU-DOC-002..020) and the source-lane enabler

## Goal

Close the M1 backlog gap: the roadmap promises M1 key tasks `TMU-DOC-001..020`, but only
`TMU-DOC-001` is filed, so the generated dashboard reports `M1 — 100%` while none of the actual
M1 work (source intake, OQ resolution, doc reviews, M1 exit) exists as a runnable task. Decompose
M1 from the Blueprint §4 document tables and the roadmap's M1 exit criteria into task files, plus
the `docs/_source` lane gap that blocks source intake.

## Context

- `node scripts/next-task.mjs` (2026-10-02, after TMU-DOC-001 merged) returned `TMU-CTR-006`
  (M2) because no other M1 task file exists. `docs/08-project/status.md` shows `M1 — 100%` from
  a single DONE row — a false completion signal.
- Roadmap M1 row (`docs/01-product/10-roadmap.md:20`): every `docs/01-product/**` and
  `docs/02-design/**` doc merged and approved, PDF + logo added, OQ-1..OQ-5 answered or deferred
  with DEC; key tasks `TMU-DOC-001..020`; human gate "Docs approved — no code before this".
- Blueprint §4 (lines 224-258) lists every M1 document with its required sections — that table
  is the decomposition source for the review groups below.
- `docs/_source/README.md` records that `proposal.pdf` must be committed in M1 and that
  `proposal-extract.md` is "to be written in M1"; the human has dropped the PDF into
  `docs/_source/proposal.pdf` (untracked). No lane glob covers it: the docs lane holds only
  `docs/_source/proposal-extract.md`, so a docs-lane branch cannot commit the PDF until the lane
  is widened — that change is `.agent/lanes.json` (ops lane) and is filed as `TMU-OPS-033`.
- Human decision, 2026-10-02: file the M1 breakdown before running the scheduler's M2 pick.
- Known gap recorded, not filed: `docs/_source/README.md` references `TMU-DSG-001` (sample the
  real logo palette). It cannot start until the human replaces the placeholder `logo.png`, and it
  needs a lane/ID decision; `TMU-DOC-011` carries the placeholder caveat instead.

## Filed by this task

| ID | Title | Priority | Deps |
|---|---|---|---|
| TMU-OPS-033 | Widen the docs lane to `docs/_source/**` (M1 source intake enabler) | P1 | TMU-DOC-001 |
| TMU-DOC-002 | Source intake: commit proposal.pdf, draft proposal-extract.md, refresh `_source/README.md` | P1 | TMU-DOC-001, TMU-OPS-033 |
| TMU-DOC-003 | Resolve OQ-1..OQ-5 (answer OQ-1 from source; defer OQ-2..5 with DECs) | P1 | TMU-DOC-002 |
| TMU-DOC-004 | Review and approve the M1 core product docs (PRD, VISION, PERSONAS) | P2 | TMU-DOC-003 |
| TMU-DOC-005 | Review and approve the requirements docs (US, FR, NFR) | P2 | TMU-DOC-002 |
| TMU-DOC-006 | Review and approve the acceptance-criteria and glossary docs | P2 | TMU-DOC-002 |
| TMU-DOC-007 | Review and approve the risk register and roadmap | P2 | TMU-DOC-002 |
| TMU-DOC-008 | Review and approve the success-metrics and decisions docs | P2 | TMU-DOC-002 |
| TMU-DOC-009 | Review the legal/privacy drafts and record the human legal-review requirement | P2 | TMU-DOC-002 |
| TMU-DOC-010 | Review and approve the operations-model and user-research docs | P2 | TMU-DOC-002 |
| TMU-DOC-011 | Review and approve the design foundations (principles, brand, tokens) | P2 | TMU-DOC-002 |
| TMU-DOC-012 | Review and approve information architecture and user flows | P2 | TMU-DOC-002 |
| TMU-DOC-013 | Review and approve wireframes | P2 | TMU-DOC-002 |
| TMU-DOC-014 | Review and approve the screen specs (SCR-001..023) | P2 | TMU-DOC-002 |
| TMU-DOC-015 | Review and approve the component inventory and content/microcopy docs | P2 | TMU-DOC-002 |
| TMU-DOC-016 | Review and approve the accessibility and responsive/motion docs | P2 | TMU-DOC-002 |
| TMU-DOC-017 | Review and approve the state designs and notification templates | P2 | TMU-DOC-002 |
| TMU-DOC-018 | Review and approve the admin-console design and onboarding docs | P2 | TMU-DOC-002 |
| TMU-DOC-019 | M1 cross-document consistency and traceability pass | P2 | TMU-DOC-003..018 |
| TMU-DOC-020 | M1 exit checklist, docs-approval evidence and M2 handoff | P1 | TMU-DOC-019 |

## Acceptance criteria

- [ ] The 20 files above exist under `docs/08-project/tasks/` with the scheduler-required
      front-matter (`id`, `title`, `status`, `lane`, `slug`, `milestone`, `priority`, `owner`,
      `deps`), unique IDs matching their filenames, and single-line `deps: [...]` arrays.
- [ ] Every `owner` is an agent file in `.opencode/agents/`; every `lane` is one of the eleven
      lanes in `.agent/lanes.json`.
- [ ] Every `deps` entry references an existing task ID; the chain
      `TMU-OPS-033 → TMU-DOC-002 → TMU-DOC-003 → TMU-DOC-004 → … → TMU-DOC-019 → TMU-DOC-020`
      is acyclic and gates M1 in the intended order.
- [ ] `node scripts/backlog-index.mjs` regenerates `backlog.md`/`status.md` (47 rows) and
      `node scripts/next-task.mjs` returns `TMU-OPS-033` (the first runnable M1 task).
- [ ] Only `docs/08-project/**` files change — no product doc, contract, migration, lane map or
      generated source outside the generated indexes is touched by this task.
- [ ] `pnpm gate` green (including the scaffold task-backlog tests).

## Files expected to change

- `docs/08-project/tasks/TMU-META-004.md` (this file)
- `docs/08-project/tasks/TMU-OPS-033.md`
- `docs/08-project/tasks/TMU-DOC-002.md` … `TMU-DOC-020.md` (19 files)
- `docs/08-project/backlog.md` (regenerated)
- `docs/08-project/status.md` (regenerated)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | task filed | human decision 2026-10-02: file the M1 breakdown first — `next-task` had returned `TMU-CTR-006` (M2) while M1 had 1 of the 20 promised task files |
| 2026-10-02 | orchestrator | 1 PICK | worktree `E:\wt\TMU-META-004` @ `0a26eff`; status → `IN_PROGRESS` |
| 2026-10-02 | orchestrator | 2 GREEN | 21 task files written; `backlog-index` → 47 tasks; `next-task` → `TMU-OPS-033`; `bash scripts/check-lane.sh` exit 0; `pnpm gate` → `OK gate(quick) passed` |

## Evidence

- Green: `pnpm gate` → `OK gate(quick) passed` — lane check, prettier, lint, typecheck,
  i18n (70 keys/locale), 139 unit tests / 16 files, `contracts:check OK (version 1.0.0)`,
  `contracts:lint OK`, `db:check: ok`, ml ruff + 7 pytest passed.
- Indexes: `backlog-index` → 47 tasks; `next-task` → `TMU-OPS-033`.
- PR: (pending)
- Review: (pending)

## Blockers

(none)
