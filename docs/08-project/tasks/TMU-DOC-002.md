---
id: TMU-DOC-002
title: "Source intake: commit proposal.pdf, draft proposal-extract.md, refresh _source/README.md"
status: DONE
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

- `docs/_source/proposal.pdf` exists only in the **main checkout** (`E:\TemuUNAIR-v2\docs\_source\proposal.pdf`,
  dropped by the human on/before 2026-10-02, untracked) — agent worktrees are created from
  `origin/main`, so the file is absent here until you copy it in (or the human commits it).
  `_source/README.md:17` still says "not in the repo yet".
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

- [x] `docs/_source/proposal.pdf` is tracked and byte-identical to the human's drop: copy it from
      `E:\TemuUNAIR-v2\docs\_source\proposal.pdf` (or take it from git if the human committed it),
      compare SHA-256 hashes before staging, then `git add` only — no re-encoding, renaming or
      modification. If neither source is available, file a blocker instead of proceeding.
- [x] `docs/_source/proposal-extract.md` exists with `status: draft`, covering: a section list,
      verbatim quotes of the *Tujuan 1–5* and the *Cara Kerja* 8 steps, and a figure list — every
      item citing `proposal.pdf §…`; illegible/absent content marked `OPEN QUESTION`.
- [x] `docs/_source/README.md` table updated: `proposal.pdf` → committed; extract → drafted
      (human verification flagged); logo placeholder caveat unchanged.
- [x] No other source file (`logo.png`, `proposal.pdf` body) is modified; `git diff` for the
      folder shows additions/edits only where the ACs say.
- [x] `bash scripts/check-lane.sh` and `pnpm gate` green.
- [x] Probe cross-reference: the `git add docs/_source/proposal.pdf` + lane-check result is
      recorded in `TMU-OPS-033`'s Progress log (that task's probe AC expects it back; task files
      are `_common`, so a docs branch may write it).

## Files expected to change

- `docs/_source/proposal.pdf` (new to git)
- `docs/_source/proposal-extract.md` (new)
- `docs/_source/README.md`
- `docs/08-project/tasks/TMU-DOC-002.md`
- `docs/08-project/tasks/TMU-OPS-033.md` (probe cross-reference, authorised by that task's AC)
- `docs/08-project/tasks/TMU-DOC-003.md` (stale-PRD-claim follow-up filing from review F5)
- `docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)
- `docs/08-project/reviews/TMU-DOC-002.md` (review record, `_common`)

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-02 | orchestrator | filed | TMU-META-004 M1 backlog breakdown |
| 2026-10-02 | orchestrator | 1 PICK | worktree `E:\wt\TMU-DOC-002` @ `4610f94`; status → `IN_PROGRESS`; PDF copied from main checkout, SHA-256 `028501CB2CBBA3385F62F57B192D1B87C2541CF2CE58348C44E99B0BE5FBF8B9` verified byte-identical; lane probe PASSED (cross-ref in `TMU-OPS-033`) |
| 2026-10-02 | orchestrator | 5 GREEN | `proposal-extract.md` drafted (status `draft`: section list A–H + cover, verbatim §B Tujuan 1–5, verbatim §D 7 prose steps + 8 figure boxes, 3-figure list, OQ-6 for truncated Tujuan 5, page-8 blank note); `README.md` table + section refreshed (PDF committed, extract drafted/human-verification pending, logo caveat intact); extraction via `pypdf` layout mode + image extraction, temp artifacts outside the repo |
| 2026-10-02 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR, 7 MINOR F1–F7) → cycle 1 in `reviews/TMU-DOC-002.md`; 14 PDF-vs-extract comparisons confirmed incl. OQ-6 truncation |
| 2026-10-02 | orchestrator | 5 FIX c1 | (F1) Files-expected list completed (OPS-033 cross-ref, regen indexes, review file); (F2) `## Evidence` section added; (F3) extract transcribes normalisation disclosure (spacing/quote-joins only, wording never altered); (F4) literal `proposal.pdf §…` citations added to section + figure lists; (F5) stale PRD `:13` claim refresh filed into `TMU-DOC-003` Context; (F6) `proposal.pdf §8` → `proposal.pdf p. 8`; (F7) README "Human-written summary" → transcription-accurate wording |
| 2026-10-02 | reviewer | 9 REVIEW c2 | verdict **`APPROVE`** (0 BLOCKER, 0 MAJOR; F1–F7 all VERIFIED CLOSED; new C2-1 MINOR — Files list missing the F5 edit to `TMU-DOC-003.md`) → cycle 2 appended to `reviews/TMU-DOC-002.md` |
| 2026-10-02 | orchestrator | 5 FIX c2 | (C2-1) added `docs/08-project/tasks/TMU-DOC-003.md` to Files-expected; status → `DONE`, AC4/AC5 ticked, Evidence Review line updated |
| 2026-10-02 | orchestrator | 10 CI | 11 checks green + 1 skipped on `f6408e1` (REST check during cycle-2 review); close-out commit CI verified post-push before merge |

## Evidence

- Red: N/A — documentation transcription with no behaviour change; ACs are artifact + integrity checks (hash, lane probe, gate), recorded in the Progress log
- Green: `pnpm gate` → `OK gate(quick) passed` (lane check, prettier, lint, typecheck, i18n, 140/140 unit tests, contracts, db, ml)
- PR: https://github.com/HanifIsya/temuUNAIR-v2/pull/34
- Review: cycle 1 `APPROVE` (0 BLOCKER, 0 MAJOR, 7 MINOR F1–F7, all closed in `f6408e1`); cycle 2 **`APPROVE`** (0 BLOCKER, 0 MAJOR, F1–F7 verified closed, 1 MINOR C2-1 fixed in close-out) → `docs/08-project/reviews/TMU-DOC-002.md`

## Blockers

(none)
