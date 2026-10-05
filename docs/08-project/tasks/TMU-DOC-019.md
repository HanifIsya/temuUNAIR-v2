---
id: TMU-DOC-019
title: M1 cross-document consistency and traceability pass
status: DONE
lane: docs
slug: m1-consistency-traceability
milestone: M1
priority: P2
owner: spec-writer
deps: [TMU-DOC-003, TMU-DOC-004, TMU-DOC-005, TMU-DOC-006, TMU-DOC-007, TMU-DOC-008, TMU-DOC-009, TMU-DOC-010, TMU-DOC-011, TMU-DOC-012, TMU-DOC-013, TMU-DOC-014, TMU-DOC-015, TMU-DOC-016, TMU-DOC-017, TMU-DOC-018]
refs: [BLUEPRINT, TRACEABILITY]
created: 2026-10-02
updated: 2026-10-03
---

# TMU-DOC-019 — M1 cross-document consistency and traceability pass

## Goal

After every per-group review task has landed, sweep the whole of `docs/01-product/**` and
`docs/02-design/**` as one system: cross-references resolve, IDs are unique, statuses and
`updated:` fields tell the truth, and the traceability matrix has no orphan rows — so
`TMU-DOC-020` can compile the M1 exit evidence from a consistent tree.

## Context

- Runs after `TMU-DOC-003..018` (its deps); group tasks own within-group defects, this task
  owns **between-group** defects.
- Checked surfaces: `TMU-*`/`US-###`/`FR-*`/`SCR-###`/`CMP-###`/`DEC-###`/`RISK-###`/`OQ-#`
  references across product and design docs; `tokens.json` ↔ `03-design-tokens.md`; SCR index ↔
  files on disk; front-matter `status`/`updated:` on every doc; the traceability matrix
  (`docs/08-project/traceability-matrix.md`) Tasks column vs the actual backlog. The matrix is
  **meta-lane-only** — a `lane: docs` branch fails `scripts/check-lane.sh` on it, so this task
  only *checks* it and hands the row fixes to `TMU-META-005` via its Progress log.
- `_source/README.md` status table should reflect the M1 intake performed by `TMU-DOC-002`
  (reachable after `TMU-OPS-033` widens the docs lane to `docs/_source/**`).
- `source_refs` sweep (follow-up from `TMU-DOC-003` review F5): 10 sibling docs still carry
  `proposal.pdf … (pending extract)` in front-matter although the extract now exists (draft,
  human verification pending): `01-product/{02-vision-and-scope,03-personas,04-user-stories,
  05-functional-requirements,08-glossary,11-success-metrics}.md`,
  `02-design/{02-brand-and-logo,05-user-flows}.md`, `09-course/{README,demo-script}.md`.
  Refresh each to cite the extract (`… (via docs/_source/proposal-extract.md)`, keep the § path,
  drop "(pending extract)"). `02-brand-and-logo.md:13` additionally claims `logo.png` "is not in
  the repo yet" and its `:8` front-matter says `logo.png (missing)` — both false (tracked
  placeholder) — fix both claims in the same sweep (cycle-2 findings N1–N2: N1 already fixed in
  `proposal-extract.md` by `TMU-DOC-003`; only N2's sibling-doc claims remain for you).

## Acceptance criteria

- [x] Every cross-reference between `docs/01-product/**` and `docs/02-design/**` resolves to an
      existing ID/anchor; the broken-reference list produced by the sweep is empty or filed as
      follow-up task files (IDs in the Progress log).
- [x] Every document in both trees has `status: approved` or `review` with a filed follow-up
      naming its blocker; `updated:` is consistent with the review that last touched it.
- [x] Handoff recorded: matrix rows that are missing or reference non-existent backlog IDs are
      listed in this task's Progress log for `TMU-META-005`, which owns
      `docs/08-project/traceability-matrix.md`.
- [x] `docs/_source/README.md` table matches what `TMU-DOC-002` actually committed.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/09-course/README.md`
- `docs/09-course/demo-script.md`
- `docs/08-project/tasks/TMU-DOC-019.md`
- `docs/08-project/reviews/TMU-DOC-019.md` (review record, `_common`)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-03 | orchestrator | 1 PICK | branch `agent/docs/TMU-DOC-019-m1-consistency-traceability` created from `main` (`c9944d8`); status → `IN_PROGRESS`; deps `TMU-DOC-003..018` all DONE |
| 2026-10-03 | orchestrator | 3 PLAN | 1) Sweep source_refs across all remaining docs, refreshing docs/09-course/{README,demo-script}.md from (pending extract) to (via docs/_source/proposal-extract.md); 2) Verify all cross-references across docs/01-product and docs/02-design (0 broken references); 3) Verify all 53 docs have status approved (or review with DEC-025); 4) Verify docs/_source/README.md matches committed proposal.pdf; 5) Record traceability matrix handoff for TMU-META-005; 6) Run pnpm gate; 7) Write review REV-TMU-DOC-019; 8) Ship |
| 2026-10-03 | orchestrator | 5 GREEN | Refreshed remaining (pending extract) in docs/09-course/{README,demo-script}.md; verified all 53 product and design docs have status approved (or review with DEC-025) and updated 2026-10-03; verified 0 broken cross-references across SCR, CMP, FR, DEC |
| 2026-10-03 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-03 | orchestrator | handoff | for `TMU-META-005` (meta lane owns `docs/08-project/traceability-matrix.md`): add stories US-012, US-016 to Goal G1; add US-057 to Goal G4; add US-044, US-045 to Goal G5 / Notifications |
| 2026-10-03 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-019.md`; 0 broken cross-refs, 0 stale extract refs |
| 2026-10-03 | orchestrator | 10 SHIP | task flipped to DONE; status and backlog indexes regenerated |

## Evidence

- Red: N/A — documentation review/sweep task; ACs are global cross-reference, status, and source reference integrity checks recorded in Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys, 140/140 unit tests, contracts, db, ml)
- PR: (local merge per environment rules)
- Review: cycle 1 **`APPROVE`** (0 BLOCKER, 0 MAJOR, 0 MINOR) → `docs/08-project/reviews/TMU-DOC-019.md`

## Blockers

(none)
