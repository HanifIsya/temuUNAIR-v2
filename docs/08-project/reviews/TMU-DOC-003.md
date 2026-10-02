---
id: REV-TMU-DOC-003
task: TMU-DOC-003
title: "Resolve OQ-1..OQ-5 (answer OQ-1 from source; defer OQ-2..5 with DECs)"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-02
cycle: 1
---

# TMU-DOC-003 — Review cycle 1

Diff reviewed: `origin/main...HEAD` — `origin/main` = `fe62c10`, HEAD = `7888ee3`, one commit
`7888ee3 docs(docs): resolve OQ-1 from source and defer OQ-2..5 with DECs`, 5 files,
+67/−22: `docs/01-product/01-PRD.md` (+64/−10 incl. front-matter, draft note, new §2.1, §11
rows), `docs/01-product/12-assumptions-and-decisions.md` (+6/−1: front-matter `updated` + four
new DEC rows), `docs/08-project/tasks/TMU-DOC-003.md` (+15/−3: status, AC ticks, three
Progress-log rows), regenerated `docs/08-project/backlog.md` (+1/−1) and
`docs/08-project/status.md` (+1/−1). `git status --short` clean before and after my runs;
`docs/_source/proposal.pdf` is untouched by the diff, so the DOC-002 intake hash still covers
it. Every path is `docs` lane (`lanes.json:10-17` = `docs/01-product/**`) or `_common`
(`lanes.json:2-9` = `docs/08-project/tasks/**`, `backlog.md`, `status.md`);
`decisions-log.md` and `traceability-matrix.md` are **not** in the diff (meta-lane — correct;
the mirror is handed to `TMU-META-005` instead). Commit is Conventional — `docs` type,
`docs` scope, subject `docs(docs): resolve OQ-1 from source and defer OQ-2..5 with DECs` =
**64 chars** (≤72) — with `Task: TMU-DOC-003`, `Refs: PRD, DECISIONS, BLUEPRINT` (matches the
task's `refs`), `Agent: orchestrator` trailers. PR #35 is **draft**, label **`documentation`**
only, head `7888ee3` == worktree HEAD, base `fe62c10` == `origin/main`, 1 commit / 5 files /
+67/−22, `mergeable_state: clean`; its 12 check-runs on `7888ee3` contain **no failing
conclusion** (success: `audit`, `e2e`, `lint-typecheck`, `ml`, `migrations`, `build`,
`contracts`, `unit`, `secret-scan`, …; `docker-build` `skipped`) — verified via the GitHub
REST API (`gh` is sandbox-denied).

**How I verified the PDF (disclosure).** My model cannot render PDFs (`Read` on
`docs/_source/proposal.pdf` → *this model does not support pdf input*), and the sandbox denies
interpreters (`uv`/`python`/`node` outside `scripts/`). I therefore verified against two
artifacts produced from the committed PDF at DOC-002 intake: (a) the **pypdf layout-mode text
dump of all 8 pages** (`…/Temp/opencode/proposal-layout.txt`) and (b) the **extracted page-4
figure PNG** (`…/Temp/opencode/pdf_p4_X19.png`, embedded name `X19.png` = the extract's figure
3). Both are cross-consistent with `proposal-extract.md` (section list, page numbers, 7-step
prose, Tujuan-5 truncation, figure inventory) and the PDF itself is byte-identical to the
SHA-256 `028501CB…F8B9` file DOC-002 verified at intake (this diff does not touch it).

## Summary

**APPROVE — cycle 1 of 2.** 0 BLOCKER / 0 MAJOR / 6 MINOR. The branch does exactly what the
task says: answers OQ-1 verbatim from source in a new PRD §2.1 (both quote blocks, each with a
literal `proposal.pdf §…` citation), keeps the source's mid-sentence Tujuan 5 as a flagged
`OQ-6` instead of completing it, closes OQ-1 and defers OQ-2..5 to `DEC-021..DEC-024` with
owner + due milestone preserved, rewrites the stale DOC-002-F5 draft note to the
committed-source state, and records the meta-lane mirror as a `TMU-META-005` handoff rather
than editing `decisions-log.md`. The core of this review was the **fidelity spot-check**: I
compared PRD §2.1 against the PDF text layer and the page-4 figure — **17 named comparisons,
all match** (detail below), including that Tujuan 5 genuinely ends at "…dikembangkan lebih
lanjut untuk" in the source and that all 8 figure boxes match word-for-word. No invented
UNAIR facts, no paraphrase passed off as a quote, no out-of-lane edits, no test/contract
changes (140/140 unit tests still pass), no leaked PII (cover NIMs/members not quoted). The
six MINORs are bookkeeping/citation precision only: the declared file list omits the two
regenerated indexes the diff ships, the template's `## Evidence` section is absent so AC5's
gate-green has no in-file evidence (I ran the gate myself — green), `OQ-6` is minted in §2.1
but absent from the §11 registry, `source_refs` drops `§A`, nine sibling docs keep a stale
"(pending extract)" annotation (pre-existing → follow-up), and `DEC-022` attributes PRD §9's
"contoh" fallback to `DEC-005`.

## Scope and lane (checklist §0)

- [x] Diff matches the task's stated scope — no drive-by refactors; only the two product docs,
  the task file and the two generated indexes move.
- [x] All changed paths inside the `docs` lane / `_common` (`lanes.json`); gate's lane check
  green.
- [x] No generated files hand-edited — `backlog.md`/`status.md` are the generator's output for
  exactly this status flip (see Checks run); no contracts/migrations/tests touched.
- [x] Commit message Conventional with `Task:`/`Refs:`/`Agent:` trailers.

## Acceptance criteria (re-verified by me)

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | OQ-1 answered verbatim from `proposal.pdf`; PRD OQ row records answer/pointer | **PASS** | `01-PRD.md:43-78` — both quote blocks; lead-ins cite `proposal.pdf §B Tujuan 1–5, p. 3` and `proposal.pdf §D figure, p. 4`; §11 OQ-1 row `:155` = **ANSWERED** + §2.1 pointer + extract pointer. Fidelity table below: 17/17 match |
| 2 | OQ-2..5 each have a deferring DEC (owner + due preserved, IDs continue the sequence) | **PASS** | `12-assumptions-and-decisions.md:38-41` — `DEC-021..024` follow `DEC-020` (`:37`); owner/due pairs match the §11 rows exactly (UNAIR DTI→M3 AUTH, Stakeholders→M3 seeds, Legal/DPO→M3 REPORT, Advisor→M9 deploy); interim DEC pointers (DEC-001/005/014/011) correct; `git diff` shows **no** edit to DEC-001..020 |
| 3 | Handoff recorded in this task's Progress log for `TMU-META-005` | **PASS** | `TMU-DOC-003.md:79` — DEC-021..024 IDs + one-liners + status strings; `12-assumptions-and-decisions.md:38-41` line citation verified exact; `decisions-log.md` (ends at DEC-020, `:40`) and `traceability-matrix.md` (no `DEC-0*` refs) untouched, so the conditional matrix instruction correctly resolves vacuous |
| 4 | No invented UNAIR fact; every OQ-1 statement traces to a `proposal.pdf §…` citation | **PASS** | Both quote blocks cited (`:43`, `:65`); OQ-6 note points at the extract's OPEN QUESTIONs (`:59-63`) and is true per the text layer; the "prose §D lists 7 steps" aside (`:66`) is true (layout dump: steps 1–7, pp. 4–5) and traced via the extract; DEC interim claims match their DEC rows; draft note's hash prefix/suffix match the DOC-002 intake hash |
| 5 | `pnpm gate` green | **PASS** (evidence gap → F2) | **I ran it myself**: `OK gate(quick) passed` — lane check (= `bash scripts/check-lane.sh`, `gate.sh:7`), prettier, lint, typecheck, i18n (70 keys/locale), **140/140** unit tests (unchanged count ⇒ no tests deleted/weakened), `contracts:check OK (1.0.0)`, `contracts:lint`, live `db:check`, ml ruff+**7 passed**. The task file records no gate tail anywhere (F2) |

## Fidelity spot-checks — PDF vs `01-PRD.md` §2.1 (17 named comparisons, all match)

| # | Comparison | Source checked against | Result |
|---|---|---|---|
| 1 | §B lead-in "Pengembangan TemuUNAIR memiliki tujuan sebagai berikut:" | PDF p. 3 text layer, `§B TUJUAN` | MATCH |
| 2 | Tujuan 1 ("Mengembangkan sistem informasi terintegrasi … Universitas Airlangga.") | PDF p. 3 text layer | MATCH (word-for-word; only line-wrap differs) |
| 3 | Tujuan 2 ("Merancang mekanisme pencarian dan pencocokan … waktu kejadian.") | PDF p. 3 text layer | MATCH |
| 4 | Tujuan 3 ("Mengintegrasikan proses verifikasi kepemilikan … terdokumentasi.") | PDF p. 3 text layer | MATCH |
| 5 | Tujuan 4 ("Menghasilkan mekanisme pengelolaan data … sistematis.") | PDF p. 3 text layer | MATCH |
| 6 | Tujuan 5 ends "… diimplementasikan dan dikembangkan lebih lanjut untuk" (truncated) **and** PRD flags it `OQ-6` instead of completing it | PDF p. 3 text layer (`C. DESKRIPSI IDE/INOVASI` starts on the next line, no completion) | MATCH — truncation is real; PRD does **not** invent a continuation |
| 7 | Figure box 1 **Login** — "Pengguna masuk menggunakan identitas UNAIR." | page-4 figure `X19.png` | MATCH |
| 8 | Figure box 2 **Lapor** — "Pengguna memilih kehilangan atau menemukan barang, kemudian mengisi informasi dan mengunggah foto." | page-4 figure `X19.png` | MATCH |
| 9 | Figure box 3 **Simpan Data** — "Sistem menyimpan laporan ke dalam database." | page-4 figure `X19.png` | MATCH |
| 10 | Figure box 4 **Smart Matching** — "Sistem mencocokkan laporan berdasarkan kemiripan foto, deskripsi, kategori, lokasi, dan waktu." | page-4 figure `X19.png` | MATCH |
| 11 | Figure box 5 **Notifikasi** — "Jika ada kecocokan, sistem mengirim notifikasi kepada pengguna terkait." | page-4 figure `X19.png` | MATCH |
| 12 | Figure box 6 **Verifikasi** — "Pengguna yang terkait berkomunikasi melalui sistem untuk verifikasi kepemilikan barang." | page-4 figure `X19.png` | MATCH |
| 13 | Figure box 7 **Barang Dikembalikan** — "Setelah verifikasi berhasil, barang dikembalikan kepada pemiliknya." | page-4 figure `X19.png` | MATCH |
| 14 | Figure box 8 **Resolved** — "Laporan diperbarui menjadi Returned/Resolved." | page-4 figure `X19.png` | MATCH (titles *and* bodies, boxes 1–8) |
| 15 | Citation accuracy: `§B …, p. 3` (TUJUAN is on page 3) and `§D figure, p. 4` (flow diagram is on page 4) | layout dump page markers | MATCH |
| 16 | "the PDF's prose §D lists 7 steps" aside (`:66`) | layout dump: 7 numbered prose steps, pp. 4–5 (`Login Pengguna … Pengembalian Barang`) | MATCH |
| 17 | PRD §2.1 quotes == `proposal-extract.md` quotes (both blocks) | extract `:49-60`, `:87-97` | MATCH — character-identical |

Also checked: every quote block carries a `proposal.pdf §…` citation; the draft note
(`:13-18`) accurately says the extract is `status: draft` with human verification pending
(no overclaim of "verified"); grep confirms no "not in the repo yet" / "pending extract" /
"Do not treat quoted Indonesian labels as verbatim" claim survives **in `01-PRD.md`** (F5
closed); no new UNAIR-specific fact (domains, drop points, hours, hosting, legal claims)
appears outside a citation or a deferral DEC.

## BLOCKER

(none)

## MAJOR

(none)

## MINOR

| ID | file:line | Finding | Required change |
|---|---|---|---|
| F1 | `docs/08-project/tasks/TMU-DOC-003.md:66-70` vs `git diff --stat` | **Files-expected omits two paths the diff ships**: `docs/08-project/backlog.md` and `docs/08-project/status.md` (both regenerated). Same class as DOC-002 C2-1 (a shipped path missing from the declared list). | Add both bullets, annotated as in DOC-002: "`docs/08-project/backlog.md`, `docs/08-project/status.md` (regenerated `_common` indexes, not hand edits)". **Fix before merge** |
| F2 | `docs/08-project/tasks/TMU-DOC-003.md:64,74-79` (no `## Evidence` section; template `docs/08-project/README.md:69-73`) | **Template `## Evidence` section absent**, so AC5 "`pnpm gate` green" (`:64`) has no gate tail, no `PR:` and no `Review:` link anywhere in the file (they live only in the PR body). Related: the Progress log's `7 HANDOFF` row (`:79`) reuses **loop step 7, which is GATE** (`02-agent-loop.md:50`) — there is no `7 GATE` row, and handoff-to-review is step 9. Precedents: DOC-002 F2, OPS-033 MINOR 3 ("required before merge, not before this review"). | Add `## Evidence` with `Red: N/A (documentation-only, rationale)` / `Green: pnpm gate → OK gate(quick) passed (140/140, contracts, db, ml)` / `PR: https://github.com/HanifIsya/temuUNAIR-v2/pull/35` / `Review: docs/08-project/reviews/TMU-DOC-003.md`; add a `7 GATE` row (or renumber the handoff row to `9`). **Fix before merge** |
| F3 | `docs/01-product/01-PRD.md:59-63` vs `:151-159` | **`OQ-6` is minted in §2.1 but has no row in the PRD's own §11 Open questions table** (which still holds only OQ-1..5) — the PRD's OQ registry and its new open question disagree. | Either add an `OQ-6` row to §11 (question: what completes Tujuan 5; owner: spec-writer → human; blocks: source verification) **or** reword §2.1 to attribute the ID solely to the extract ("tracked as OQ-6 in `proposal-extract.md` § OPEN QUESTIONs") instead of presenting a PRD-level open question outside §11 |
| F4 | `docs/01-product/01-PRD.md:8` | **`source_refs` narrowed from `proposal.pdf §A/§B` to `proposal.pdf §B/§D`**, silently dropping `§A` (LATAR BELAKANG) even though §1 Problem still draws its framing on it; the change reads as "only sections we now quote". | Restore `§A` alongside the quoted sections, e.g. `proposal.pdf §A (problem restatement) / §B/§D (via docs/_source/proposal-extract.md)` — or state in the draft note why §A is no longer a source |
| F5 | `docs/01-product/02-vision-and-scope.md:8`, `03-personas.md:8`, `04-user-stories.md:8`, `05-functional-requirements.md:8`, `08-glossary.md:8`, `11-success-metrics.md:8`, `02-design/05-user-flows.md:8`, `09-course/README.md:8`, `09-course/demo-script.md:8` | **Stale `source_refs: ["proposal.pdf … (pending extract)"]` survives in 9 sibling docs** — false now that the extract exists (draft). Pre-existing, **not introduced by this diff**, and out of this task's declared files, so nothing to change here — but it must be filed, not dropped (the DOC-002 F5 pattern). | **File a follow-up** (natural home: `TMU-DOC-019` cross-document consistency pass or a small docs task) to refresh these annotations to "via `proposal-extract.md` (draft)"; do not edit them in this PR |
| F6 | `docs/01-product/12-assumptions-and-decisions.md:39` (PRD `:157` is fine) | **`DEC-022` attributes the "contoh" fallback to `DEC-005`** ("DEC-005 synthetic drop points flagged 'contoh' stand meanwhile") — `DEC-005` (`:22`) only records custody + "provisional — real drop points needed"; the synthetic-`contoh` fallback is documented at PRD §9 (`01-PRD.md:139`), not in DEC-005. | Reword to cite both, e.g. "`DEC-005` (real drop points needed) plus PRD §9's synthetic drop points flagged "contoh" stand meanwhile" |

## Checks run

- `pnpm gate` → **`OK gate(quick) passed`** (my own run in `E:\wt\TMU-DOC-003`: lane check,
  prettier, lint, typecheck, i18n, 140/140 unit tests, contracts 1.0.0 + openapi lint,
  live `db:check`, ml ruff + 7 passed). Direct `bash scripts/check-lane.sh` is
  sandbox-denied for me; it is the gate's first step (`scripts/gate.sh:7`) and passed there.
- `git log --oneline -3`, `git show --stat 7888ee3`, full `git diff origin/main...HEAD`,
  `git status --short` (clean) — all read-only.
- GitHub REST via fetch: PR #35 (draft, `documentation`, head/base SHAs, 5 files, +67/−22,
  `mergeable_state: clean`) and the 12 check-runs on `7888ee3` (no failing conclusion).
- Grep sweeps: `not in the repo yet|pending extract|Do not treat quoted Indonesian`
  (PRD clean; 9 stale sibling hits → F5); `DEC-0*` in `decisions-log.md` (ends DEC-020) and
  `traceability-matrix.md` (no DEC refs → handoff's conditional is correctly vacuous);
  `HANDOFF` rows across task files (only this task uses one — no step-number convention to
  violate beyond the F2 note); `## Evidence` template requirement.
- Fidelity: PDF text-layer dump (all 8 pages) + extracted page-4 figure PNG vs PRD §2.1 vs
  `proposal-extract.md` — 17 comparisons above.

## Definition of Done (this cycle)

| DoD | Status | Note |
|---|---|---|
| 1 Red evidence first | Met (N/A justified) | Documentation transcription; no behaviour. Rationale still needs the `Red:` line inside the task file (F2) |
| 2 Gate green, pasted tail | **Met by my run**, not in the task file | F2 |
| 3 Contract tests per touched `API-*` | Met (N/A) | No contract/code touched; `contracts:check` green |
| 4 Auth/RBAC + transitions | Met (N/A) | Docs-only |
| 5 Privacy | Met | Quotes are public proposal text; no emails/NIMs/embeddings/sensitive URLs |
| 6 i18n `id`/`en` + `error.<code>` | Met (N/A) | No UI strings; `i18n:check` green |
| 7 A11y | Met (N/A) | No UI |
| 8 Docs updated (task file, progress, traceability, CHANGELOG) | Met with F1/F2 | Traceability = docs-keeper post-merge (README rule 5); no contract change ⇒ no CHANGELOG |
| 9 Generated files in sync | Met | `backlog.md`/`status.md` regeneration matches the status flip exactly; `contracts:check OK` |
| 10 Reviewer verdict | Met | This file, cycle 1 |
| 11 Security review | Not required | No auth/claims/upload/privacy surface |
| 12 PR ready, CI green, labels | Met (draft by design) | CI green; label `documentation` correct; PR flips out of draft at step 10 SHIP |

## Notes for the human

- **Method caveat**: fidelity was verified against DOC-002's intake artifacts (pypdf text dump
  + extracted figure PNG) because this model cannot open PDFs and the sandbox denies
  interpreters — not by me re-running extraction. The artifacts are cross-consistent with the
  committed PDF's identity (untouched in this diff, intake SHA-256 verified in DOC-002's
  review), but a human opening `proposal.pdf` pp. 3–4 remains the final word; that is exactly
  what `OQ-6` and the extract's "human verification pending" banner ask for.
- `status: IN_PROGRESS` at review time matches the immediately preceding DOC-002 precedent;
  flip to `REVIEW`/`DONE` at close-out per house style.
- F1 and F2 are close-out bookkeeping of the class both prior reviews called "required before
  merge, not before this review" — they do not block this verdict, but they must land before
  the PR leaves draft. F5 must be **filed** as a follow-up task (MINORs are not silently
  dropped).
- Remaining open by design after this task: human verification of the extract against the
  original PDF (incl. the Tujuan-5 completion), the logo placeholder caveat
  (`02-design/02-brand-and-logo.md:13`), and the `TMU-META-005` decisions-log/traceability
  mirror.

---

**Verdict: `APPROVE`** — cycle 1 of max 2 · 0 BLOCKER · 0 MAJOR · 6 MINOR (F1–F4, F6 fix
before merge/close-out; F5 filed as a follow-up task).
