---
id: TMU-DOC-003
title: Resolve OQ-1..OQ-5 (answer OQ-1 from source; defer OQ-2..5 with DECs)
status: IN_PROGRESS
lane: docs
slug: resolve-open-questions
milestone: M1
priority: P1
owner: spec-writer
deps: [TMU-DOC-002]
refs: [PRD, DECISIONS, BLUEPRINT]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-003 — Resolve OQ-1..OQ-5 (answer OQ-1 from source; defer OQ-2..5 with DECs)

## Goal

Satisfy the roadmap's M1 exit clause "OQ-1..OQ-5 answered or deferred with DEC": answer OQ-1
verbatim from the proposal PDF (via `TMU-DOC-002`'s extract) and record an explicit deferral DEC
for every OQ whose owner sits outside the agent team, so no open question silently blocks M1
approval.

## Context

- `docs/01-product/01-PRD.md:117-121` is the OQ table:

  | OQ | Question | Owner | Due |
  |---|---|---|---|
  | OQ-1 | Verbatim *Tujuan 1–5* and the PDF's *Cara Kerja* 8 steps | spec-writer | M1 approval |
  | OQ-2 | Real UNAIR domains (DEC-001) | UNAIR DTI | M3 AUTH |
  | OQ-3 | Drop-point list and operating hours (DEC-005) | Stakeholders | M3 seeds |
  | OQ-4 | Which sensitive categories are prohibited from public listing entirely? (DEC-014) | Legal/DPO | M3 REPORT |
  | OQ-5 | Production hosting target (DEC-011) | Advisor | M9 deploy |

- Only OQ-1 is agent-answerable at M1, and only from the real PDF — the extract from
  `TMU-DOC-002` is the vehicle; never reconstruct the wording from memory (write-doc rule 6).
- OQ-2..OQ-5 cannot be answered here (their owners are external and their due milestones are
  M3/M9); the roadmap allows "deferred with DEC" — a DEC entry in
  `docs/01-product/12-assumptions-and-decisions.md` that names the OQ, the deferral, the owner
  and the due milestone. The docs lane's `docs/01-product/**` glob covers that file.
- Existing DEC numbering must continue (find the last `DEC-###` before minting new ones).
- Stale-source claim refresh (follow-up from `TMU-DOC-002` review F5): once `TMU-DOC-002` merges,
  `docs/01-product/01-PRD.md:13` ("`proposal.pdf` … not in the repo yet") is false — update that
  line to the committed state (hash + extract pointer) while touching the PRD for OQ-1.
  `docs/02-design/02-brand-and-logo.md:13`'s logo caveat is unaffected (logo.png is still the
  placeholder).
- `docs/08-project/decisions-log.md` is **meta-lane-only** (`docs/08-project/**` outside the
  `_common` globs) — a `lane: docs` branch fails `scripts/check-lane.sh` on it. Handoff: record
  the new DEC IDs and one-line summaries in this task's Progress log; `TMU-META-005` applies
  them.

## Acceptance criteria

- [x] OQ-1 is answered with verbatim content from `proposal.pdf` (Tujuan 1–5, Cara Kerja 8
      steps) and the PRD OQ row records the answer or a pointer to where it lives.
- [x] OQ-2, OQ-3, OQ-4 and OQ-5 each have a DEC entry in `12-assumptions-and-decisions.md`
      explicitly deferring them (owner + due milestone preserved), with DEC IDs continuing the
      existing sequence.
- [x] Handoff recorded: the new DEC IDs and one-line summaries are written into this task's
      Progress log for `TMU-META-005`, which owns `docs/08-project/decisions-log.md`.
- [x] No UNAIR fact is invented: every OQ-1 statement traces to a `proposal.pdf §…` citation.
- [x] `pnpm gate` green.

## Files expected to change

- `docs/01-product/01-PRD.md`
- `docs/01-product/12-assumptions-and-decisions.md`
- `docs/08-project/tasks/TMU-DOC-003.md`
- `docs/08-project/tasks/TMU-DOC-019.md` (F5 follow-up filing: stale `(pending extract)` `source_refs` sweep)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)
- `docs/08-project/reviews/TMU-DOC-003.md` (review record, `_common`)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-02 | orchestrator | 1 PICK | worktree `E:\wt\TMU-DOC-003` @ `fe62c10` (post-`TMU-DOC-002` merge); status → `IN_PROGRESS`; deps `TMU-DOC-002` DONE |
| 2026-10-02 | orchestrator | 5 GREEN | PRD: OQ-1 answered verbatim in new §2.1 (`proposal.pdf §B Tujuan 1–5, p. 3` incl. the OQ-6 truncation note; `proposal.pdf §D figure, p. 4` 8 steps), OQ table rows updated (OQ-1 closed, OQ-2..5 marked deferred), draft note + front-matter refreshed to committed-source state (F5 follow-up from DOC-002); DECISIONS: DEC-021..024 appended (OQ-2→M3 AUTH, OQ-3→M3 seeds, OQ-4→M3 REPORT, OQ-5→M9 deploy, each preserving owner + interim DEC), `updated` bumped |
| 2026-10-02 | orchestrator | 7 GATE | `pnpm gate` → `OK gate(quick) passed` — lane check exit 0 (incl. `docs/01-product/12-*`), prettier, lint, typecheck, i18n 70 keys, 140/140 unit, contracts:check+lint, db:check, ml ruff+7 pytest |
| 2026-10-02 | orchestrator | handoff | for `TMU-META-005` (meta lane owns `docs/08-project/decisions-log.md`) — add rows: **DEC-021** defer OQ-2 (real UNAIR domains) to UNAIR DTI, due M3 AUTH, status `deferred — open`; **DEC-022** defer OQ-3 (drop-point list + hours) to stakeholders, due M3 seeds; **DEC-023** defer OQ-4 (legally prohibited sensitive categories) to Legal/DPO, due M3 REPORT; **DEC-024** defer OQ-5 (production hosting target) to Advisor, due M9 deploy — one-liners mirror `12-assumptions-and-decisions.md:38-41`; also `traceability-matrix.md` rows if the DEC range `DEC-001..DEC-018`-style refs appear there |
| 2026-10-02 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 6 MINOR F1–F6) → cycle 1 in `reviews/TMU-DOC-003.md`; 17 PRD-vs-PDF/extract comparisons all MATCH (Tujuan 1–5 incl. OQ-6 truncation, figure boxes 1–8, citations, DEC pairs, trailers) |
| 2026-10-02 | orchestrator | 5 FIX c1 | (F1) Files-expected completed (DOC-019 filing, regen indexes, review file); (F2) `## Evidence` section added + `7 GATE` row, HANDOFF row relabelled off the step-7 number; (F3) OQ-6 row added to PRD §11 so the registry matches §2.1; (F4) PRD `source_refs` restored `§A` alongside §B/§D; (F5) 10-doc stale `(pending extract)` sweep filed into `TMU-DOC-019` Context (+ its `logo.png:13` stale claim); (F6) DEC-022 fallback attribution corrected to DEC-005 default + PRD §9 "contoh" |

## Evidence

- Red: N/A — documentation-only change (no behaviour); ACs are artifact + integrity checks, recorded in the Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check, prettier, lint, typecheck, i18n, 140/140 unit tests, contracts, db, ml) — independently re-run and re-verified by the cycle-1 reviewer
- PR: https://github.com/HanifIsya/temuUNAIR-v2/pull/35
- Review: cycle 1 `APPROVE` (0 BLOCKER, 0 MAJOR, 6 MINOR F1–F6, all closed pre-merge) → `docs/08-project/reviews/TMU-DOC-003.md`

## Blockers

(none)
