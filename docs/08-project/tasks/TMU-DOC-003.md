---
id: TMU-DOC-003
title: Resolve OQ-1..OQ-5 (answer OQ-1 from source; defer OQ-2..5 with DECs)
status: TODO
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
- `docs/08-project/decisions-log.md` is **meta-lane-only** (`docs/08-project/**` outside the
  `_common` globs) — a `lane: docs` branch fails `scripts/check-lane.sh` on it. Handoff: record
  the new DEC IDs and one-line summaries in this task's Progress log; `TMU-META-005` applies
  them.

## Acceptance criteria

- [ ] OQ-1 is answered with verbatim content from `proposal.pdf` (Tujuan 1–5, Cara Kerja 8
      steps) and the PRD OQ row records the answer or a pointer to where it lives.
- [ ] OQ-2, OQ-3, OQ-4 and OQ-5 each have a DEC entry in `12-assumptions-and-decisions.md`
      explicitly deferring them (owner + due milestone preserved), with DEC IDs continuing the
      existing sequence.
- [ ] Handoff recorded: the new DEC IDs and one-line summaries are written into this task's
      Progress log for `TMU-META-005`, which owns `docs/08-project/decisions-log.md`.
- [ ] No UNAIR fact is invented: every OQ-1 statement traces to a `proposal.pdf §…` citation.
- [ ] `pnpm gate` green.

## Files expected to change

- `docs/01-product/01-PRD.md`
- `docs/01-product/12-assumptions-and-decisions.md`
- `docs/08-project/tasks/TMU-DOC-003.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
