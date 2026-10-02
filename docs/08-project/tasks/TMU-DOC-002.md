---
id: TMU-DOC-002
title: "Source intake: commit proposal.pdf, draft proposal-extract.md, refresh _source/README.md"
status: TODO
lane: docs
slug: source-intake-pdf-extract
milestone: M1
priority: P1
owner: spec-writer
deps: [TMU-DOC-001, TMU-OPS-033]
refs: [SRC-README, BLUEPRINT, PRD]
created: 2026-10-02
updated: 2026-10-02
---

# TMU-DOC-002 — Source intake: commit `proposal.pdf`, draft `proposal-extract.md`, refresh `_source/README.md`

## Goal

Get the project's primary source of truth into the repo and into agent-reachable form: track the
human-dropped `proposal.pdf` byte-for-byte, write `docs/_source/proposal-extract.md` from the
actual PDF so later M1 tasks (especially OQ-1 in `TMU-DOC-003`) can quote it without inventing
anything, and bring `_source/README.md`'s status table in line with reality.

## Context

- `docs/_source/proposal.pdf` is present in the working tree but untracked (dropped by the human
  on/before 2026-10-02). `_source/README.md:17` still says "not in the repo yet".
- `docs/_source/logo.png` is tracked but is a **placeholder** (`README.md:18`); the real logo is
  still with the human. Do not change the logo or the token values it drives.
- `_source/README.md` rules: never edit or delete a source file's content; anything derived from
  the PDF must cite it (`proposal.pdf §…`); never invent UNAIR facts (write-doc rule 6) — the
  extract is transcription, not paraphrase-from-memory.
- `docs/_source/proposal-extract.md` is listed in the docs lane already; committing the PDF and
  editing `README.md` need `TMU-OPS-033` merged first (this task's dep).
- Tooling: the agent's file reader handles PDFs, so the extract can be produced directly from
  the real document. Anything illegible or missing goes in as an `OPEN QUESTION`, never a guess.
- Downstream: `TMU-DOC-003` answers OQ-1 (verbatim *Tujuan 1–5* and the *Cara Kerja* 8 steps)
  from this extract.

## Acceptance criteria

- [ ] `docs/_source/proposal.pdf` is tracked and byte-identical to the file the human dropped
      (`git add` only — no re-encoding, renaming or modification).
- [ ] `docs/_source/proposal-extract.md` exists with `status: draft`, covering: a section list,
      verbatim quotes of the *Tujuan 1–5* and the *Cara Kerja* 8 steps, and a figure list — every
      item citing `proposal.pdf §…`; illegible/absent content marked `OPEN QUESTION`.
- [ ] `docs/_source/README.md` table updated: `proposal.pdf` → committed; extract → drafted
      (human verification flagged); logo placeholder caveat unchanged.
- [ ] No other source file (`logo.png`, `proposal.pdf` body) is modified; `git diff` for the
      folder shows additions/edits only where the ACs say.
- [ ] `bash scripts/check-lane.sh` and `pnpm gate` green.

## Files expected to change

- `docs/_source/proposal.pdf` (new to git)
- `docs/_source/proposal-extract.md` (new)
- `docs/_source/README.md`
- `docs/08-project/tasks/TMU-DOC-002.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |

## Blockers

(none)
