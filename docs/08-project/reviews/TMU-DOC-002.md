---
id: REV-TMU-DOC-002
task: TMU-DOC-002
title: "Source intake: commit proposal.pdf, draft proposal-extract.md, refresh _source/README.md"
reviewer: reviewer
verdict: APPROVE
date: 2026-10-02
cycle: 2
---

# TMU-DOC-002 — Review cycle 1

Diff reviewed: `origin/main...HEAD` — `origin/main` = `4610f94`, HEAD = `707c719`, one commit
`707c719 docs(docs): commit proposal.pdf and draft the source extract`, 7 files, +167/−16:
`docs/_source/proposal-extract.md` (new, 145), `docs/_source/proposal.pdf` (new binary,
2,917,693 B), `docs/_source/README.md` (+10/−7), `docs/08-project/tasks/TMU-DOC-002.md`
(+8/−4), `docs/08-project/tasks/TMU-OPS-033.md` (+4/−2), regenerated `docs/08-project/backlog.md`
(+1/−1) and `docs/08-project/status.md` (+1/−1). The scoped diff
`git diff origin/main...HEAD -- docs/_source/ --stat` is exactly those three `_source` paths —
no `logo.png` change, no modification of any pre-existing source file (the PDF is a pure
addition, `Bin 0 → 2917693`). Every path is `docs` lane (`.agent/lanes.json:10-17` =
`docs/_source/**`) or `_common` (`:2-9` = `docs/08-project/tasks/**`, `backlog.md`,
`status.md`), so checklist §0 (scope, lane) is clean; `git diff --check origin/main...HEAD` is
clean and the worktree is clean at `707c719` before and after my runs. The commit is
Conventional — `docs` type, `docs` scope, subject
`docs(docs): commit proposal.pdf and draft the source extract` = **59 chars** (≤72) — with
required `Task: TMU-DOC-002`, `Refs: SRC-README, BLUEPRINT, PRD`, `Agent: orchestrator`
trailers (`git log -1 707c719`). PR #34 is Draft with the `documentation` label, head
`707c719` == worktree HEAD, base `4610f94` == `origin/main`, 1 commit / 7 files / +167/−16,
`mergeable_state: clean`; its 12 CI check-runs on `707c719` are 11 `success`
(`unit`, `lint-typecheck`, `build`, `contracts`, `migrations`, `ml`, `integration`,
`contract-fuzz`, `e2e`, `secret-scan`, `audit`) + `docker-build` `skipped` (verified via the
GitHub REST API — `gh` is sandbox-denied).

## Summary

**APPROVE — cycle 1 of 2.** 0 BLOCKER / 0 MAJOR / 7 MINOR. The branch does exactly what the
task says: tracks the human-dropped PDF byte-for-byte (add-only), writes a citation-first draft
extract, refreshes `_source/README.md`, writes the probe cross-ref back into `TMU-OPS-033`, and
ships the regenerated `_common` indexes. The core of this review was the **fidelity spot-check**:
I compared the extract against the PDF's text layer and its three embedded figures — **14
named comparisons, all match** (detail below), including the OQ-6 claim that *Tujuan 5* really
ends mid-sentence at "…lebih lanjut untuk" (confirmed: the text layer ends there and
`C. DESKRIPSI IDE/INOVASI` starts immediately after), the 7-step prose list vs the 8-box figure
(both transcribed correctly, and the "7 vs 8" reconciliation note is accurate), the §H roles
table, all cover metadata, and the figure inventory (pages 1/3/4, contents, aspect ratios).
No invented UNAIR facts, no paraphrase passed off as a quote, no leaked student IDs/emails, no
out-of-lane edits, no test or contract changes. The seven MINORs are bookkeeping/citation
precision only: the declared file list misses three files the diff legitimately ships, the
template's `Evidence` section is not yet present (PR/Review links are close-out bookkeeping at
`status: IN_PROGRESS`), the extract's "verbatim (spacing normalised)" declaration under-declares
two presentation normalisations it applies, two tables lack a literal `proposal.pdf §…`
citation per the AC wording, one `§8` citation points at a section that does not exist, one
README description cell now reads oddly against the status this task set, and this merge makes
one stale "not in the repo yet" claim in the PRD (a follow-up must be filed for
`TMU-DOC-003`). None touches merged source content, tests, contracts or behaviour.

## Acceptance criteria (re-verified by me)

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | `proposal.pdf` tracked and byte-identical to the human's drop; `git add` only | **PASS** | `git status --short` → clean (the PDF is tracked in `707c719`); `git show --stat 707c719` → `docs/_source/proposal.pdf Bin 0 → 2917693 bytes` (addition, cannot have modified an existing file); `git diff --no-index --stat/--numstat` between `E:\TemuUNAIR-v2\docs\_source\proposal.pdf` (the human's drop) and the worktree copy → **no output = byte-identical**; digest string `028501CB…F8B9` (64 hex) is identical in `TMU-DOC-002.md:73`, `_source/README.md:17`, `proposal-extract.md:15` and the PR body. Caveat: `Get-FileHash` (and every non-`git`/`pnpm` command) is denied by my sandbox, so the digest was **not independently recomputed** — see "Could not verify by execution" |
| 2 | Extract exists with `status: draft`; section list, verbatim Tujuan 1–5, verbatim Cara Kerja 8 steps, figure list, each citing `proposal.pdf §…`; illegible/absent → `OPEN QUESTION` | **PASS** (with F3, F4, F6) | `proposal-extract.md:4` (`status: draft`), `:30-43` section list (cover + A–H + blank p8), `:45-58` verbatim Tujuan 1–5 with heading citation `proposal.pdf §B Tujuan 1–5, p. 3`, `:65-95` **both** Cara Kerja renderings (7 prose steps `:67`, 8 figure boxes `:83`) each with a `proposal.pdf §D …` citation, `:103-109` figure list, `:60-63`/`:138-143` OPEN QUESTIONs (OQ-6 truncation, blank page 8). Fidelity of the quotes verified below. Section/figure tables cite via §/page columns rather than literal `proposal.pdf §…` strings (F4); `:143` uses a non-existent `§8` (F6) |
| 3 | `_source/README.md` table updated: PDF → committed; extract → drafted (human verification flagged); logo caveat unchanged | **PASS** | `_source/README.md:17` `**committed** 2026-10-02 (TMU-DOC-002) — SHA-256 028501CB…F8B9, byte-identical to the human's drop`; `:19` `**drafted** (TMU-DOC-002) — **human verification pending** before any doc cites it as final`; `:18` logo row byte-identical to `origin/main` (absent from the diff); front-matter `updated` bumped `2026-09-29 → 2026-10-02` (`:6`); full-file read → **no** "not in the repo yet" / "to be written in M1" / "Why these are not committed yet" claim survives (heading replaced at `:21`) |
| 4 | No other source file (`logo.png`, `proposal.pdf` body) modified; folder diff = additions/edits only where the ACs say | **PASS** (box unticked — close-out bookkeeping per `reviews/TMU-OPS-033.md` precedent) | Scoped diff of `docs/_source/` = `README.md` + two new files only (stat above); `logo.png` absent from the branch diff **and** byte-identical to the main-checkout copy (`git diff --no-index --numstat` → no output); whole-branch diff = the 7 files listed above, all in `docs` lane or `_common` |
| 5 | `bash scripts/check-lane.sh` and `pnpm gate` green | **PASS by record + my static derivation** (box unticked; gate not re-runnable in my sandbox) | PR #34 body DoD bullet: "`pnpm gate` green — `OK gate(quick) passed` (lane check exit 0, prettier, lint, typecheck, i18n 70 keys/locale, **140** unit tests / 16 files, contracts:check + lint, db:check, ml ruff + 7 pytest), run after all edits"; independently corroborated by CI (11 success + 1 skipped on `707c719`); lane check re-derived statically: all 7 changed paths match `docs` lane (`lanes.json:16` `docs/_source/**`) or `_common` (`:4,:7,:8`) → zero out-of-lane paths. Not re-executed: this sandbox worktree has no `node_modules` and denies `bash scripts/*` |
| 6 | Probe cross-ref recorded in `TMU-OPS-033`'s Progress log (that task's probe AC expects it) | **PASS** | `TMU-OPS-033.md:85` new row `13 probe cross-ref` — `git add docs/_source/proposal.pdf` (SHA-256 `028501CB…F8B9`) + `bash scripts/check-lane.sh` → exit 0, AC probe closed; Evidence `:97-98` updated from "deferred" to "passed". The row answers that task's AC5 verbatim (`TMU-OPS-033.md:57-62`: "performed by `TMU-DOC-002` and cross-referenced back into this task's Progress log"); claims are consistent with what I verified (lane widened at `lanes.json:16` ✓, PDF now tracked ✓, digest string consistent ✓); task files are `_common` (`lanes.json:4`) so the docs-branch write is in-lane |

Task-file state: `status: IN_PROGRESS` (`TMU-DOC-002.md:4`), Progress log has the `1 PICK`
row (`:73` — worktree @ `4610f94` matches the PR base, digest + lane probe recorded) and the
`5 GREEN` row (`:74` — extract contents, README refresh, `pypdf` layout + image extraction with
temp artifacts outside the repo; I found those artifacts and they corroborate the row, see
Checks run). AC boxes: 4 ticked (AC1/2/3/6), 2 unticked (AC4/5) — both unticked ones are
**satisfied in substance** per the table above; ticking is step-11/12 bookkeeping, so the box
state matches reality at `IN_PROGRESS`.

## BLOCKER

(none)

## MAJOR

(none)

## MINOR

| # | Severity | File:line | Finding | Evidence / direction |
|---|---|---|---|---|
| F1 | MINOR | `docs/08-project/tasks/TMU-DOC-002.md:61-66` | "Files expected to change" lists 4 files; the diff ships **7** — it omits `docs/08-project/tasks/TMU-OPS-033.md` (edit AC6 explicitly authorises) and the regenerated `backlog.md` / `status.md` (`_common`, mandatory per DoD 9). A declared list that does not match the diff breaks checklist §0 for the next reader. | Same class as `reviews/TMU-DOC-001.md` cycle-1 finding 6 and `reviews/TMU-OPS-033.md` cycle-1 MINOR 1. Direction: add three lines — `docs/08-project/tasks/TMU-OPS-033.md` (probe cross-ref), `docs/08-project/backlog.md` (regenerated), `docs/08-project/status.md` (regenerated) — in the close-out bookkeeping commit |
| F2 | MINOR | `docs/08-project/tasks/TMU-DOC-002.md:68-78` | The task file has no `## Evidence` section at all; the template requires one with `Green:` / `PR:` / `Review:` lines (`docs/08-project/README.md:69-73`). Gate-green, PR and review evidence currently live only in the PR body. | "Required before merge, not before this review" precedent (`reviews/TMU-DOC-001.md` cycle-1 finding 7, `reviews/TMU-OPS-033.md` cycle-1 MINOR 3). Direction: add Evidence at the REVIEW/close-out flip: `Green: pnpm gate → OK gate(quick) passed (140/16)` (tail from the PR body), `PR: https://github.com/HanifIsya/temuUNAIR-v2/pull/34`, `Review: docs/08-project/reviews/TMU-DOC-002.md` |
| F3 | MINOR | `docs/_source/proposal-extract.md:16-17` vs `:69-81`, `:85-95` | The preamble declares quotes are "verbatim (**spacing normalised**)", but two more normalisations are applied inside the "verbatim" blockquotes: (a) `:70` replaces the source's curly quotes `“Saya Kehilangan” / “Saya Menemukan”` with straight `"…"`; (b) every step in both lists is joined `Title — body` with an **inserted em-dash** the PDF does not contain (PDF prose: title on its own line; figure boxes: title and body are separate elements with no dash). Wording itself is untouched — verified word-for-word — so this is a declaration gap, not a fidelity error. | Direction: broaden `:16` to "quotes are verbatim (spacing, line breaks, quote style and title/body joining normalised)" — or restore the source glyphs. Matters because `TMU-DOC-003` will quote OQ-1 "verbatim" *from this extract*, and a byte-level diff against the PDF would flag the delta |
| F4 | MINOR | `docs/_source/proposal-extract.md:30-43`, `:103-109` | AC2 says "**every item** citing `proposal.pdf §…`". The section list and figure list rows cite only § letters / page numbers; neither heading carries a literal `proposal.pdf §…` string (only the blanket preamble at `:16`). The quote blocks and anchor bullets do comply. | Direction: add one source line above each table (`Source: proposal.pdf §A–§H, pp. 1–8` and `Source: proposal.pdf embedded figures, pp. 1, 3, 4`) so per-item grep/traceability matches the AC wording |
| F5 | MINOR | `docs/01-product/01-PRD.md:13` (and pre-existing `docs/02-design/02-brand-and-logo.md:13`) | This merge makes `01-PRD.md:13` — "`docs/_source/proposal.pdf` **is not in the repo yet**" — false on the day it lands; `02-brand-and-logo.md:13` already claims the same for `logo.png`, which has been tracked (placeholder) since M0. Both are outside this task's declared Files, so they must not be edited here. | Grep across `docs/` for `not in the repo yet|must be added by a human|to be written in M1` → 8 hits, all in historical Context/quote rows (not rewritten, per the `TMU-META-004` precedent) **except** these two live current-state claims. Direction: file the follow-up — `TMU-DOC-003` already owns rewriting the PRD's OQ-1/draft-note block when it answers OQ-1 from this extract; record that in its AC/Progress log so it is filed, not silently dropped |
| F6 | MINOR (LOW) | `docs/_source/proposal-extract.md:143` | The page-8 OPEN QUESTION row cites `proposal.pdf §8, p. 8` — there is no §8 (sections run cover + A–H), so the `§` is wrong notation in a citation-first artifact. | Direction: `proposal.pdf p. 8` (the neighbouring OQ-6 row at `:142` cites correctly) |
| F7 | MINOR (LOW) | `docs/_source/README.md:19` | The "What it is" cell still calls the extract a "**Human-written** summary of the PDF", while the Status cell this task set says it was drafted by `TMU-DOC-002` with **human verification pending**. Pre-existing description, newly in tension with the row's own status. | Direction: reword the cell (e.g. "Summary/transcription of the PDF (sections, quotes, figure list) used by agents that cannot read PDFs") — or leave it and rely on the "human verification pending" flag; either way, note it so the tension is a decision rather than drift |

No BLOCKER, no MAJOR.

## Fidelity spot-check (extract vs `proposal.pdf`)

**Method (disclosed, because it matters).** My `Read` tool cannot render this PDF
(`ERROR: Cannot read pdf (this model does not support pdf input)`), and the sandbox denies every
extraction command (`uv`/`node`/`scripts/*`/`Get-FileHash`). I therefore compared the extract
against (a) the PDF's **text layer as extracted in the task's own GREEN step**
(`%TEMP%\opencode\proposal-layout.txt`, pypdf layout mode, page-delimited `===== PAGE n =====`)
and (b) the **three embedded figures extracted in that same step, which I viewed first-hand**
(`%TEMP%\opencode\pdf_p1_X7.png`, `pdf_p3_X14.png`, `pdf_p4_X19.png`). The PDF under review is
itself the human's drop (byte-identity to `E:\TemuUNAIR-v2\docs\_source\proposal.pdf` proven by
`git diff --no-index`). Residual circularity (text compared via the agent's own extraction
artifact) is disclosed rather than hidden; it is bounded by the facts that (i) the artifact's
page/section structure independently corroborates every page number in the extract, (ii) the
figures were checked against pixels I saw myself, (iii) OQ-6 is a *self-disflattering* claim — a
fabricator completes the sentence rather than reporting a truncation — and (iv) the extract is
`status: draft` precisely because a human verification pass is still mandated.

**Comparisons run (14), all match:**

1. **Cover title (p1)** — "TemuUNAIR: Sistem Informasi Pelaporan dan Pencocokan Barang Hilang
   Berbasis Kecerdasan Buatan di Lingkungan Universitas Airlangga" = extract `:22-23` ✓.
2. **Cover metadata (p1)** — "Kelompok 3 / Inovasi Sistem Informasi dan Teknologi I1" (`:24`),
   S1 Sistem Informasi / Fakultas Sains dan Teknologi / Universitas Airlangga / 2026 (`:24-25`),
   and the four members — Rizaldi Rizki Saputra, Maysha Akmala Dina Azzahra, Hanif Isya Annafi,
   Abdul Hakim Fathur Rochman (`:26`) — all exact; student IDs *are* on the cover (187241005 /
   1038 / 1045 / 1111) and are deliberately omitted with a pointer to the PDF (`:27-28`) ✓.
3. **Section list (cover, A–H, p8)** vs the text layer's page markers — §A p2, §B p3, §C p3–4,
   §D p4–5, §E p5, §F p5–6, §G p6–7, §H p7, page 8 empty — every row of `:34-43` ✓.
4. **Tujuan intro** — "Pengembangan TemuUNAIR memiliki tujuan sebagai berikut:" (`:47`) exact ✓.
5. **Tujuan 1** (`:49-50`), 6. **Tujuan 2** (`:51-52`), 7. **Tujuan 3** (`:53-54`),
   8. **Tujuan 4** (`:55-56`) — word-for-word identical to the text layer modulo line wrapping ✓.
9. **Tujuan 5 + OQ-6 truncation** (`:57-58`, `:60-63`, `:142`) — text layer reads
   "Menghasilkan prototype TemuUNAIR sebagai solusi berbasis teknologi informasi yang dapat
   diimplementasikan dan dikembangkan **lebih lanjut untuk**" and the very next line is
   "C. DESKRIPSI IDE/INOVASI": **the mid-sentence ending and the "section C begins immediately
   after" claim are both true** ✓.
10. **§D prose list — 7 steps** (`:69-81`) — all seven titles and bodies word-for-word vs
    pp. 4–5 (only the F3 presentation deltas: quote glyphs + inserted `—`) ✓.
11. **§D figure — 8 boxes** (`:85-95`) — I viewed `X19.png` first-hand: boxes
    1 Login / 2 Lapor / 3 Simpan Data / 4 Smart Matching / 5 Notifikasi / 6 Verifikasi /
    7 Barang Dikembalikan / 8 Resolved with exactly the transcribed bodies (e.g. box 4
    "Sistem mencocokkan laporan berdasarkan kemiripan foto, deskripsi, kategori, lokasi, dan
    waktu.") ✓; the `:97-101` reconciliation (prose splits/renames vs figure, PRD OQ-1 means the
    figure) is accurate — `01-PRD.md:117` does ask for "the PDF's *Cara Kerja* 8 steps" ✓.
12. **Figure inventory** (`:105-109`) — viewed all three: p1 `X7` = UNAIR university emblem ✓;
    p3 `X14` = TemuUNAIR logo with magnifier + backpack inside a location-pin, blue/yellow
    organic shape, wordmark "TemuUNAIR", tagline "Lost Today, Found Together" (tagline string
    exact, and it matches `00-BLUEPRINT.md:71`) ✓; p4 `X19` = the 8-box flow ✓. Embedded names
    and page placement corroborated by the extraction artifact filenames; aspect ratios of the
    three images are consistent with 300×300 / 1254×1254 / 1983×793 (exact pixel counts not
    re-derived — noted as residual, not a discrepancy).
13. **§H roles table** (`:118-123`) — all four rows (Nama / Peran / Tanggung Jawab) exact vs
    the p7 table, including line-wrapped cells rejoined ("Maysha Akmala Dina Azzahra",
    "PJ Komunikasi, Pengembalian Barang & Microservice API") ✓.
14. **"Other verbatim anchors"** (`:127-136`) — §C.2 four feature names + quoted admin
    sentence on p4 ✓; §E "Pihak Pelapor Kehilangan (Loser)" / "Pihak Pelapor Penemuan (Finder)"
    + Kampus A/B/C + Banyuwangi/FIKKIA on p5 ✓; §F.2 YOLO quote
    "YOLO tidak menentukan kesamaan barang namun fungsinya murni deteksi objek." on p6 ✓;
    §F.1/F.3 Next.js (SSR/CSR) / Tailwind / MySQL-PostgreSQL pp. 5–6 ✓.

Plus: **page 8 blank** (`:43`, `:143`) ✓ (empty `PAGE 8`, and exactly three images were
extracted — none from p8); **no invented UNAIR facts found** — every non-quoted statement in the
extract traces to a cited span, and the two interpretive observations (`:97-101`, `:111-114`)
are labelled "Observation", not quote (write-doc rule 6 / `_source/README.md` rules 1–3
satisfied); the `TMU-META-004` "human-gated logo decision" claim at `:114` is truthful
(`TMU-META-004.md:45`); **OQ-6 numbering is correct** — the PRD table is OQ-1..OQ-5
(`01-PRD.md:117-121`) and `:145` says so explicitly.

## Checks run

- `git log --oneline -3`, `git log -1 707c719`, `git show --stat 707c719`,
  `git diff origin/main...HEAD` (read in full, every added line inspected),
  `git diff origin/main...HEAD -- docs/_source/ --stat`, `git diff --check origin/main...HEAD`
  (clean), `git status --short` (clean before and after all checks).
- **Byte-identity of the source binaries**: `git diff --no-index --stat` + `--numstat` for
  `E:\TemuUNAIR-v2\docs\_source\proposal.pdf` vs the worktree copy → no output (identical), same
  command for `logo.png` → no output (identical). Size in the commit (2,917,693 B) matches the
  drop. `Get-FileHash` **denied** by sandbox → digest corroborated across four artifacts instead
  of recomputed (AC1 caveat above).
- **PDF-vs-extract**: the 14 comparisons in the section above (text layer via the GREEN-step
  pypdf layout artifact; figures viewed first-hand). Grep for the quotes elsewhere in `docs/`
  → only the extract carries them (no second transcription to cross-check against).
- **Index regeneration (DoD 9)**: `node scripts/backlog-index.mjs` is outside my allow-list, so
  I re-derived from source — row template emits `t.status` verbatim (`backlog-index.mjs:51`) →
  `backlog.md:31` `TODO → IN_PROGRESS` is exactly the only front-matter delta in this diff
  (`TMU-DOC-002.md:4`); counters by exact status (`:59`) → `status.md:35` =
  `TODO: 19 · IN_PROGRESS: 1 · BLOCKED: 0 · REVIEW: 0 · DONE: 3 · CANCELLED: 0` for M1's 23
  tasks; tick rule (`:66`, only `DONE` gets `x`) → `status.md:38` stays `[ ]` ✓; percentage
  (`:62`, DONE-based) → `3/23 = 13%` unchanged ✓; M0 untouched (no M0 front-matter changed).
  Generated header intact (`status.md:1`). **A regeneration run would be a no-op — no drift, no
  hand edits.**
- **Lane**: `bash scripts/check-lane.sh` denied → static derivation from `.agent/lanes.json`:
  changed paths = `docs/_source/*` (`docs` lane `:16`), both task files + both indexes
  (`_common :4,:7,:8`) → zero out-of-lane paths; matches the probe row's "exit 0" claim.
- **Commit/PR/CI**: Conventional header, 59-char subject, `Task:`/`Refs:`/`Agent:` trailers via
  `git log -1 707c719`; PR facts + all 12 check-runs on `707c719` via the GitHub REST API
  (`gh` denied): Draft, label `documentation`, head `707c719`, base `4610f94`, 7 files,
  +167/−16, `mergeable_state: clean`, 11 `success` + `docker-build` `skipped`. PR body carries
  the gate-green tail and the DoD evidence bullets.
- **Stale-claim sweep**: grep `not in the repo yet|must be added by a human|to be written in M1`
  → 8 hits; `_source/README.md` itself is clean (AC3); the only live current-state claims are
  `01-PRD.md:13` and `02-brand-and-logo.md:13` (F5); the rest are historical Context quotes.
- Not executable here: `pnpm gate` (sandbox worktree has no `node_modules`; would fail for
  environment reasons, not code reasons — gate green instead taken from the PR body and the
  12-run CI matrix), `bash scripts/check-lane.sh` (denied; derived above), `Get-FileHash`
  (denied; substituted `git diff --no-index`), `gh` (denied; REST API used), a second
  independent PDF text extraction (no PDF tooling allowed — disclosed under Fidelity).

## DoD checklist

| # | DoD item | Status | Evidence |
|---|---|---|---|
| 1 | Red tests existed first, failed for the right reason | Met (N/A by task type) | This is a documentation-transcription task with no behaviour change; the task's "tests" are the artifact ACs (digest, lane probe, gate), recorded in the Progress log `:73-74` and the PR body's DoD bullet, which states the N/A rationale explicitly. No test file appears in the diff, so none was weakened or added late |
| 2 | New/updated tests pass; full `pnpm gate` green | Met (by record + CI; not re-run by me) | PR body: `OK gate(quick) passed` with tail (140 tests / 16 files); CI on `707c719`: 11 success + 1 skipped, including `unit`, `lint-typecheck`, `contracts`, `migrations`, `ml`, `integration`, `contract-fuzz`, `e2e` |
| 3 | Contract tests for every touched `API-*` | N/A | No endpoint, schema or generated contract file in the diff; `contracts` CI job green; no contract change ⇒ no CHANGELOG entry |
| 4 | Auth/RBAC asserted; state transitions covered | N/A | No routes, services or state machines; the only "transition" is the task's own `TODO → IN_PROGRESS`, reflected consistently in the task file and both regenerated indexes |
| 5 | Privacy: no hint answers, emails, embeddings, sensitive URLs logged or returned | Met | Extract contains source-document text only; **cover student ID numbers deliberately omitted and cited instead** (`proposal-extract.md:27-28`); no emails, embeddings, raw image URLs or tokens anywhere in the diff; the PDF itself is the human's own designated source committed per AC1 (mandated). See Privacy |
| 6 | i18n keys for `id` + `en` | N/A | No user-facing strings; no `apps/` file touched |
| 7 | A11y: states + keyboard + axe (UI tasks) | N/A | No UI |
| 8 | Docs updated: status, Progress log, traceability, CHANGELOG | Met (with F1, F2) | `status: IN_PROGRESS` (`:4`), PICK + GREEN rows (`:73-74`), README refreshed, `TMU-OPS-033` cross-ref written, indexes regenerated; Evidence section missing and file list incomplete → F1/F2 (close-out bookkeeping); traceability rows are the docs-keeper's post-merge step (`README.md:85`); no contract change ⇒ no CHANGELOG |
| 9 | Generated files in sync, no hand edits | Met (by derivation) | Field-by-field re-derivation of both files from `backlog-index.mjs` (Checks run): a run would be a no-op; header intact; only the front-matter-driven lines changed |
| 10 | Reviewer verdict `APPROVE` in `reviews/<ID>.md` | Met | This file, cycle 1 |
| 11 | Security review for sensitive tasks (auth, claims, uploads, privacy) | Met | The sensitive surface here is source-privacy: student IDs omitted, no PII beyond the four public member names already on the cover, digest/hashing only, no secrets, no `.env`; the 2.9 MB binary is the adjudicated source file (see Relevance filters) |
| 12 | PR ready, CI green, labels correct | Partial (by design at cycle 1) | CI green on `707c719` (11 success + 1 skipped), label `documentation` present, PR body Scope/Files text accurate; PR still Draft — step 12 flips it; task Evidence missing `PR:`/`Review:` → F1/F2 |

## Privacy

Clean. The diff adds a source PDF the human designated for the repo (AC1, explicitly mandated),
a transcription of its text, and status/bookkeeping markdown. The extract omits the four cover
student IDs (citation instead of copy), carries no emails, no embeddings, no hint answers, no
raw image URLs and no tokens; the embedded logo/emblem figures were **not** extracted into
`logo.png` (`proposal-extract.md:111-114` states this and the diff proves it). Nothing is
logged, returned or rendered. Fixtures absent by construction. DoD 5 satisfied.

## Relevance filters (adjudicated, not findings)

1. **2.9 MB PDF committed** — accepted. The coding-standards "large binaries" rule does not
   apply to this designated `_source` file; AC1 mandates `git add` of the human's drop
   byte-for-byte, and a git-lfs migration would be a contract/ops decision beyond this task. I
   considered raising it anyway and do not: the file is the project's primary source of truth,
   is needed by agents that cannot read PDFs otherwise, and is referenced by name+digest from
   `_source/README.md:17`.
2. **PR label `documentation` vs a non-existent `docs-only` label** — accepted (house-accepted;
   `documentation` is a real default GitHub label and matches PRs #32/#33).
3. **Cover student IDs omitted from the extract** — **not** a fidelity problem: the extract
   states the omission explicitly and points to `proposal.pdf §cover p. 1` (`:27-28`), which is
   the privacy-correct choice for a course-identifier field; the PR body records the same
   rationale.
4. **Historical Context rows** quoting the README's old wording (`TMU-META-004.md:36-37`,
   `TMU-OPS-033.md:33-34`, `TMU-DOC-002.md:30`) — not rewritten, per the established
   precedent; they describe the state at filing time. (The PRD/brand notes are different:
   they are *live* current-state claims → F5.)

## Notes for the human

1. **Verdict `APPROVE` — cycle 1 of 2, 0 BLOCKER / 0 MAJOR / 7 MINOR.** Justification: the
   substance of every AC re-verified independently (PDF byte-identity, extract fidelity via 14
   PDF-vs-extract comparisons incl. the OQ-6 truncation and the 8-box figure read off the
   pixels, README table/caveats, probe cross-ref truthfulness, index regeneration no-op, commit
   and CI), and all seven findings are bookkeeping or citation-precision wording that can be
   folded into the close-out commit — none alters source content, tests, contracts or
   behaviour. Per the DoD, MINORs may be fixed opportunistically or filed as follow-ups; F5
   **must** be filed (PRD stale-claim follow-up), not silently dropped.
2. **Before step 11/12 (orchestrator/spec-writer):** fold F1 (three Files lines), F2 (Evidence
   section: Green tail + `PR:` #34 + `Review:` this file), F3 (broaden the normalisation
   declaration at `proposal-extract.md:16`), F4 (two `Source:` lines above the tables), F6
   (`§8` → `p. 8`) and optionally F7 (README description cell) into one bookkeeping commit,
   tick the remaining AC boxes that are honestly satisfied, record this verdict in the Progress
   log, and file the F5 follow-up under `TMU-DOC-003`.
3. **Fidelity residual, stated for the record:** the extract is still `status: draft` and
   *must* get its human verification pass against the PDF before `TMU-DOC-003` treats it as
   ground truth for OQ-1 — that requirement is already flagged in three places
   (`proposal-extract.md:17-18`, `_source/README.md:19`, PR body) and this review does not
   weaken it: my check used the GREEN-step text-layer artifact (my model cannot render the PDF)
   and first-hand views of the extracted figures.
4. **Standing gap (repeat recommendation from `reviews/TMU-DOC-001.md` note 4 and
   `reviews/TMU-OPS-033.md` note 4, out of scope here):** the gate still has no
   regenerate-and-diff check for `backlog.md`/`status.md`, which is why every status-changing
   task re-derives index freshness by hand (including this review).
5. **Could not verify by execution:** `Get-FileHash` (any non-`git`/`pnpm` command is denied —
   digest corroborated across four artifacts + `git diff --no-index` byte-identity instead),
   `bash scripts/check-lane.sh` (denied — static derivation from `lanes.json` above),
   `node scripts/backlog-index.mjs` (denied — field-by-field derivation above), `pnpm gate`
   (no `node_modules` in this sandbox worktree — gate green taken from the PR body and
   corroborated by the 12-run CI matrix on `707c719`), `gh` (denied — GitHub REST API used for
   PR/CI facts), and a second independent PDF text extraction (no PDF tooling allowed — see
   Fidelity method).

---

# TMU-DOC-002 — Review cycle 2

Diff reviewed for this cycle: `git diff 707c719..HEAD` — one fix commit
`f6408e1 docs(docs): close cycle 1 minor findings on source intake`, **5 files, +323/−19**:
`docs/08-project/reviews/TMU-DOC-002.md` (new, +285 — the cycle-1 record above, committed with
the fixes), `docs/08-project/tasks/TMU-DOC-002.md` (+12), `docs/08-project/tasks/TMU-DOC-003.md`
(+5), `docs/_source/README.md` (1 line), `docs/_source/proposal-extract.md` (19+/19−). Whole
branch `origin/main...HEAD` = **9 files, +471/−16**, 2 commits (`707c719`, `f6408e1`).

Scope integrity: `git diff 707c719..HEAD --stat -- docs/_source/proposal.pdf` → **no output —
the PDF is untouched since cycle 1** (still the pure 2,917,693 B addition from `707c719`,
byte-identical to the human's drop). `git status --short` → clean; `git diff --check
707c719..HEAD` → clean. The 5 fix-commit paths are all `docs` lane (`.agent/lanes.json:16`
`docs/_source/**`) or `_common` (`:4` `docs/08-project/tasks/**`, `:5`
`docs/08-project/reviews/**`) → lane-clean by static derivation (`bash scripts/check-lane.sh`
remains sandbox-denied, as in cycle 1). `f6408e1` is a Conventional Commit (`docs(docs)` scope,
subject `docs(docs): close cycle 1 minor findings on source intake` = 57 chars ≤ 72) with the
required `Task: TMU-DOC-002`, `Refs: SRC-README, PRD`, `Agent: orchestrator` trailers
(`git log -1 f6408e1`). PR #34 now has head `f6408e1` == worktree HEAD, base `4610f94`; its
**12 CI check-runs on `f6408e1` are 11 `success`** (`unit`, `lint-typecheck`, `build`,
`contracts`, `migrations`, `ml`, `integration`, `contract-fuzz`, `e2e`, `secret-scan`, `audit`)
**+ `docker-build` `skipped`** (GitHub REST API, `gh` sandbox-denied) — so the new
`## Evidence` "Green: `pnpm gate` → `OK gate(quick) passed`" line is corroborated by a green CI
matrix **on the fix commit itself**, not only on `707c719`.

**Cycle-1 text integrity:** the cycle-1 record above is preserved verbatim; only the
front-matter `cycle: 1 → 2` was rewritten (`verdict` was already `APPROVE`). Caveat (same as
`reviews/TMU-DOC-001.md` cycle 2): the review file first appears in this branch (`f6408e1`), so
no independent committed copy exists to diff the cycle-1 prose against; its content is
internally consistent with the cycle-1 diff it describes (`707c719`, 7 files, +167/−16).

## Summary

**APPROVE — cycle 2 of 2.** 0 BLOCKER / 0 MAJOR / **1 MINOR** (new, bookkeeping-only). All
seven cycle-1 findings are **verified closed against the final bytes** — not against the fix
commit's message — and the fidelity spot-check of every region the fixes touched re-passes
against the PDF text layer (below): the section/figure tables gained literal citations whose
section and page targets I re-derived from the source; the normalisation disclosure now matches
what the extract actually applies *and* what the source actually contains (curly quotes and
irregular spacing present; zero em-dashes anywhere in the source); the phantom `§8` is gone; the
README cell no longer says "Human-written"; and the stale-PRD follow-up is durably filed in
`TMU-DOC-003`. The verbatim quote blocks were **not touched** by the fix commit (its hunks stop
at the preamble and the tables), so cycle 1's 14 PDF-vs-extract comparisons stand unchanged. The
single new MINOR is the same declared-list class F1 addressed — the fix commit itself edits
`TMU-DOC-003.md`, which the Files-expected list does not name. It does not merit a cycle 3
(max 2 cycles; DoD sends MINOR to a filed follow-up or the close-out edit, not to re-review).

## Cycle 1 disposition

| # | Finding (severity c1) | Status | Evidence in the final state (file:line) |
|---|---|---|---|
| F1 | MINOR — Files-expected list named only 4 of the 7 files `707c719` ships | **VERIFIED CLOSED** | `docs/08-project/tasks/TMU-DOC-002.md:63-69` now names all 7 (`proposal.pdf` `:63`, `proposal-extract.md` `:64`, `_source/README.md` `:65`, this task `:66`, `TMU-OPS-033.md` `:67`, regenerated `backlog.md`/`status.md` `:68`, review file `:69`); diff hunk 1 of `f6408e1` adds exactly those bullets. Scope note → C2-1 (the fix commit's own `TMU-DOC-003.md` edit is not listed) |
| F2 | MINOR — no `## Evidence` section | **VERIFIED CLOSED** | `TMU-DOC-002.md:81-86` — `## Evidence` with all four template lines: `Red:` (N/A + rationale) `:83`, `Green:` (gate tail) `:84`, `PR:` #34 `:85`, `Review:` cycle-1 pointer `:86`; matches the template at `docs/08-project/README.md:70-73` |
| F3 | MINOR — normalisation declaration under-disclosed | **VERIFIED CLOSED** | `docs/_source/proposal-extract.md:16-19` now declares verbatim-**in-wording** plus the exact normalisation list (inter-word/line spacing; curly → straight quotation marks; em-dashes joining the PDF's line-broken titles/bodies) and "no word is ever added, removed or reordered". Disclosure re-checked against the source itself (fidelity re-check 3) |
| F4 | MINOR — section/figure tables lacked literal `proposal.pdf §…` citations | **VERIFIED CLOSED** | `proposal-extract.md:36-45` rows now carry `` `proposal.pdf §cover` `` … `` `proposal.pdf §H` `` and `` `proposal.pdf p. 8` ``; figure list `:107-111` gained a **Citation** column with `` `proposal.pdf §cover p. 1` ``, `` `proposal.pdf §C.1 p. 3` ``, `` `proposal.pdf §D figure p. 4` ``. All targets re-derived from the text layer (fidelity re-check 1–2) |
| F5 | MINOR — stale PRD `:13` claim needed a filed follow-up | **VERIFIED CLOSED** | `docs/08-project/tasks/TMU-DOC-003.md:44-48` — Context bullet "Stale-source claim refresh (follow-up from `TMU-DOC-002` review F5)": update `docs/01-product/01-PRD.md:13` ("… not in the repo yet") to the committed state (hash + extract pointer) while touching the PRD for OQ-1, with `02-design/02-brand-and-logo.md:13`'s logo caveat explicitly scoped out. Placement note: cycle 1 suggested AC/Progress log; Context is durable, sits in the very task whose AC1 forces the PRD edit, and the fix row `TMU-DOC-002.md:79` records the filing — filed, not silently dropped |
| F6 | MINOR (LOW) — `proposal.pdf §8, p. 8` phantom section | **VERIFIED CLOSED** | `proposal-extract.md:145` → `` `proposal.pdf p. 8` ``; the section-list twin `:45` also reads `` `proposal.pdf p. 8` ``. Page-8 blankness re-confirmed (the text-layer artifact's final line is `===== PAGE 8 =====` with no content) |
| F7 | MINOR (LOW) — README cell said "Human-written" | **VERIFIED CLOSED** | `docs/_source/README.md:19` → "Citation-first summary of the PDF (sections, verbatim quotes, figure list) transcribed from the committed PDF for agents that cannot read PDFs" — consistent with the same row's Status cell and with `:27` ("A draft extract is a transcription aid, not verified ground truth"). Grep `Human-written` over `docs/**` → zero live hits |

**7/7 VERIFIED CLOSED, 0 REOPENED.**

## Changes since cycle 1

`git diff 707c719..HEAD --stat` → 5 files, +323/−19; every added line read:

| File | What changed |
|---|---|
| `docs/08-project/reviews/TMU-DOC-002.md` (new, +285) | Cycle-1 review record (APPROVE, 0/0/7), committed by `f6408e1`. |
| `docs/08-project/tasks/TMU-DOC-002.md` (+12) | F1: three Files-expected bullets (`:67-69`). F2: `## Evidence` (`:81-86`). Two Progress-log rows: `:78` `9 REVIEW c1` (verdict + 14 comparisons) and `:79` `5 FIX c1` (F1–F7 one-liner). `status: IN_PROGRESS` (`:4`) and the AC boxes are unchanged — close-out bookkeeping. |
| `docs/08-project/tasks/TMU-DOC-003.md` (+5) | F5: Context bullet `:44-48` filing the `01-PRD.md:13` refresh + logo-caveat carve-out. |
| `docs/_source/README.md` (1 line) | F7: extract description cell `:19` reworded (F7). |
| `docs/_source/proposal-extract.md` (19+/19−) | F3: preamble disclosure `:16-19`. F4: section-list `§` column `:36-45` + figure-list Citation column `:107-111`. F6: OQ-table page-8 row `:145`. Metadata block, verbatim Tujuan/Cara Kerja quotes (`:47-103`), §H table, anchors and the OQ-6 row are untouched. |

No other path changed: no test, contract, migration, generated file, config, or any
`apps/**` / `packages/**` / `services/**` / `scripts/**` file anywhere in the branch;
`backlog.md`/`status.md` were correctly *not* re-run (the task's status did not change).

## Findings (cycle 2)

No BLOCKER, no MAJOR.

| # | Severity | File:line | Finding | Evidence / direction |
|---|---|---|---|---|
| C2-1 | MINOR | `docs/08-project/tasks/TMU-DOC-002.md:63-69` | The declared Files-expected list covers 8 of the **9** paths the full branch ships: `f6408e1` itself edits `docs/08-project/tasks/TMU-DOC-003.md` (the F5 filing) and that file is not listed — the same declared-list-vs-diff class as cycle-1 F1, reintroduced by the fix commit. | `git diff origin/main...HEAD --stat` = 9 files (incl. `TMU-DOC-003.md`); declared list = 8 paths. The edit is in-lane (`lanes.json:4` `_common`) and disclosed in the `5 FIX c1` Progress row (`:79`), so scope and traceability are substantively fine. Direction: add one bullet when the post-verdict Evidence/Progress/status bookkeeping is committed — **do not open a third cycle for it** (max 2; `05-definition-of-ready-done.md` sends MINOR to a filed follow-up or the close-out edit) |

Adjudicated — deliberately **not** findings:

- Citation comma style drift `proposal.pdf §D figure, p. 4` (`proposal-extract.md:85`, `:102`)
  vs `proposal.pdf §D figure p. 4` (`:111`) — both valid citations; cosmetic.
- Section-list `§F` label drops the source heading's trailing "YANG DIGUNAKAN" (`:42` vs text
  layer line 211) — pre-existing in `707c719` (cycle 1 accepted it), summary column not a
  quote, and not introduced by the fixes.
- AC boxes 4–5 still unticked and `status: IN_PROGRESS` (`TMU-DOC-002.md:4`, `:54-56`) —
  intentionally left for the step-11/12 close-out flip the orchestrator runs after this verdict
  (cycle-1 note 2).

## Fidelity re-check (regions the fixes touched)

Method (unchanged from cycle 1, disclosed): my `Read` tool still cannot render the PDF, so I
compared against the GREEN-step text-layer artifact `%TEMP%\opencode\proposal-layout.txt`
(pypdf layout mode, `===== PAGE n =====` delimited) plus cycle 1's first-hand figure views. The
PDF bytes are unchanged since cycle 1 (scope-integrity proof above), so cycle 1's pixel checks
carry over; residual circularity stays as disclosed in cycle 1's Fidelity method.

1. **Section list (`proposal-extract.md:36-45`) — page map re-derived.** Text-layer markers:
   PAGE 2 @45, PAGE 3 @90, PAGE 4 @137, PAGE 5 @183, PAGE 6 @227, PAGE 7 @270, PAGE 8 @313
   (artifact's last line — nothing follows ⇒ blank ✓). Headings: `A. LATAR BELAKANG` @46 (p2),
   `B. TUJUAN` @99 (p3), `C. DESKRIPSI IDE/INOVASI` @113 (p3), `D. CARA KERJA SISTEM` @162
   (p4), `E. TARGET PENGGUNA` @193 (p5), `F. TEKNOLOGI DAN INFRASTRUKTUR YANG DIGUNAKAN` @211
   (p5), `G. TIMELINE PENGERJAAN` @264 (p6), `H. PEMBAGIAN PERAN` @291 (p7) ⇒ every row's page
   span (1, 2–3, 3, 3–4, 4–5, 5, 5–6, 6–7, 7, 8) is exactly what the table still says — **the
   F4 edit changed only the `§` column; no page or summary drift.**
2. **Figure list (`:107-111`) — new citations checked.** `1. Logo dan Filosofi` (§C.1) @114
   sits between PAGE 3 @90 and PAGE 4 @137 ⇒ `proposal.pdf §C.1 p. 3` correct ✓; `D. CARA
   KERJA SISTEM` @162 is on page 4 and cycle 1 verified the 8-box figure `X19.png` as page 4
   first-hand ⇒ `proposal.pdf §D figure p. 4` correct ✓; figure 1 is on the cover ⇒
   `proposal.pdf §cover p. 1` ✓.
3. **Disclaimer (`:16-19`) — disclosure vs source.** (a) Text layer line 176 reads
   `Pengguna memilih “Saya   Kehilangan” atau “Saya   Menemukan”, …` — curly glyphs **and**
   irregular spacing present ⇒ "curly → straight quotation marks" and "inter-word/line spacing"
   are exactly the applied normalisations ✓. (b) Grep of the text layer for
   `—|–|“|”` → 4 hits, all curly quotes (lines 141, 176) or **en**-dashes in unrelated strings
   (`Language–Image`, `Bab I–III`, both p6) — **zero em-dashes anywhere in the source** ⇒
   "em-dashes joining the PDF's line-broken titles/bodies" is an accurate admission of an
   inserted glyph ✓. (c) Prose steps 1–7 put each title on its own line with the body indented
   below (layout `:173-191`) ⇒ "joining the PDF's line-broken titles/bodies" is the true
   operation ✓. (d) "no word is ever added, removed or reordered" is consistent with cycle 1's
   word-for-word comparison of both quote blocks — and the fix commit's hunk boundaries
   (preamble `:13-20`, section list `:31-45`, figure list `:104-111`, OQ table `:140-145`)
   prove the quote blocks were not edited ✓.
4. **OQ table (`:144-145`).** OQ-6 row untouched and still correct (`B. TUJUAN` @99 = page 3 ⇒
   `proposal.pdf §B Tujuan 5, p. 3` ✓; truncation confirmed in cycle 1). Page-8 row now
   `proposal.pdf p. 8` — no phantom `§8`; blankness re-confirmed. Grep `§8` over `docs/**` →
   only legitimate `Blueprint §8` references plus the historical cycle-1 review/Progress text ✓.
5. **README wording (`README.md:19`).** New cell: "Citation-first summary … transcribed from
   the committed PDF for agents that cannot read PDFs" — consistent with the same row's Status
   cell ("drafted … human verification pending") and `:27` ("A draft extract is a transcription
   aid, not verified ground truth, until a human signs off"). Grep `Human-written` over
   `docs/**` → zero live hits (only the cycle-1 finding row and the `5 FIX c1` Progress row,
   both historical records) ✓. Draft status still enforced at `proposal-extract.md:4,11,19-20`.

## Checks run (cycle 2)

- `git log --oneline -5`, `git log -1 f6408e1` (subject + trailers), `git diff 707c719..HEAD`
  (read in full, every added line inspected), `git diff 707c719..HEAD --stat`,
  `git diff origin/main...HEAD --stat` (9 files, +471/−16),
  `git diff 707c719..HEAD --stat -- docs/_source/proposal.pdf` (empty ⇒ PDF untouched),
  `git diff --check 707c719..HEAD` (clean), `git status --short` (clean before and after).
- **PDF-vs-extract re-check** of the five touched regions against the text-layer artifact
  (fidelity re-check 1–5): all nine section/page rows re-derived, §C.1/§D figure citations
  verified, curly-quote/spacing/em-dash disclosure verified against source bytes, page-8
  blankness re-confirmed, README/task-file wording grepped. Quote blocks diff-untouched ⇒
  cycle 1's 14 comparisons still stand.
- **CI (fetched, not assumed):** GitHub REST API `…/commits/f6408e1/check-runs` → 12 runs, all
  `completed`: 11 `success` + `docker-build` `skipped`, attached to PR #34 head `f6408e1`,
  base `4610f94`.
- **Lane:** static derivation from `.agent/lanes.json` (`docs` `:16`, `_common` `:4-5`) → 0
  out-of-lane paths; `bash scripts/check-lane.sh` denied by the sandbox.
- **Stale-claim sweep:** grep `Human-written|§8` over `docs/**` → no live claims (fidelity 4–5).
- Not run (disclosed): `pnpm gate` — recorded green at `TMU-DOC-002.md:84` and corroborated by
  the 11-success CI matrix on `f6408e1`; I was instructed not to re-run it unless distrusted,
  and this sandbox worktree has no `node_modules`. `gh` denied → REST API. `Get-FileHash`
  denied → PDF byte-identity carried over from cycle 1's `git diff --no-index` proof plus the
  unchanged-diff check above.

## DoD checklist (cycle 2)

| # | DoD item | Result | Evidence |
|---|---|---|---|
| 1 | Red tests first, failed for the right reason | n/a (by task type) | Docs transcription, no behaviour change; Evidence `Red: N/A` + rationale at `TMU-DOC-002.md:83`. |
| 2 | New/updated tests pass; full `pnpm gate` green | Met (record + CI) | `TMU-DOC-002.md:84` gate tail; 11 `success` + 1 `skipped` on `f6408e1`. |
| 3 | Contract tests for touched `API-*` | n/a | No `API-*`, no `packages/**` anywhere in the branch; `contracts` job green. |
| 4 | Auth/RBAC asserted; state transitions covered | n/a | No endpoint/state machine; the task's own status is unchanged (`IN_PROGRESS`), so no index regeneration was due. |
| 5 | Privacy: no hint answers, emails, embeddings, sensitive URLs | Met | The fix diff adds citations/bookkeeping only; cover student IDs stay omitted with a citation (`proposal-extract.md:29-30`); no emails, embeddings, raw image URLs, hint answers or secrets in any added line. |
| 6 | i18n keys for `id` + `en` | n/a | No `apps/` file, no user-facing string; CI `lint-typecheck`/`unit` green. |
| 7 | A11y (UI tasks) | n/a | No UI. |
| 8 | Docs updated: status, Progress log, traceability, CHANGELOG | Met (with C2-1) | Evidence section added (`:81-86`), REVIEW c1 + FIX c1 rows (`:78-79`), F5 follow-up filed in `TMU-DOC-003:44-48`; declared list misses `TMU-DOC-003.md` → C2-1; no contract change ⇒ no CHANGELOG obligation. |
| 9 | Generated files in sync, no hand edits | Met | `backlog.md`/`status.md` untouched by `f6408e1` — correct, since no front-matter status changed; cycle 1's field-by-field derivation still holds. |
| 10 | Reviewer verdict `APPROVE` in `reviews/<ID>.md` | Met | This file, cycle 2. |
| 11 | Security review for sensitive tasks | Met | No new sensitive surface; source-privacy posture unchanged from cycle 1 (student IDs omitted, no secrets, PDF is the human's designated source). |
| 12 | PR ready, CI green, labels correct | Partial (by design pre-merge) | CI green on `f6408e1`; PR #34 still Draft — step 12 flips it after this verdict. |

## Notes for the human (cycle 2)

1. **Verdict `APPROVE` — cycle 2 of 2, 0 BLOCKER / 0 MAJOR / 1 MINOR (C2-1).** All F1–F7 are
   verified closed against the final bytes, and every extract region the fixes touched was
   re-checked against the source text layer. Cycle 3 is neither available (max 2) nor warranted:
   fold C2-1 (one declared-list bullet) into the post-verdict bookkeeping commit.
2. Close-out steps still outstanding (by design, unchanged from cycle 1): tick AC4/AC5, flip
   `status: IN_PROGRESS → DONE`, regenerate `backlog.md`/`status.md`, add a `9 REVIEW c2`
   Progress row, extend the Evidence `Review:` line with this cycle, then step 12 (undraft
   PR #34).
3. The extract remains `status: draft` — its mandated human verification pass against the PDF
   is still required before `TMU-DOC-003` treats it as ground truth for OQ-1. Nothing in this
   cycle weakens that flag (`proposal-extract.md:19-20`, `_source/README.md:19`).
4. Standing gap (repeat from this review's cycle 1, `reviews/TMU-DOC-001.md` note 4 and
   `reviews/TMU-OPS-033.md` note 4; out of scope): `scripts/gate.sh` still has no
   regenerate-and-diff check for `backlog.md`/`status.md`.
5. Sandbox limits (disclosed): `bash scripts/*`, `gh`, `Get-FileHash` denied; `pnpm gate` not
   re-run per instruction — mitigated by CI on `f6408e1` and the static derivations above.
