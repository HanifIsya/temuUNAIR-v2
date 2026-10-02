---
id: SRC-README
title: Source material
status: approved
owner: OR
updated: 2026-10-02
depends_on: []
source_refs: ["Blueprint §0.1"]
---

# `docs/_source/` — source material

This folder holds the raw inputs every document traces back to. It is **read-only** for agents.

| File | What it is | Status |
|---|---|---|
| `proposal.pdf` | TemuUNAIR proposal — Kelompok 3, Inovasi Sistem Informasi dan Teknologi I1, S1 Sistem Informasi, Universitas Airlangga | **committed** 2026-10-02 (`TMU-DOC-002`) — SHA-256 `028501CB2CBBA3385F62F57B192D1B87C2541CF2CE58348C44E99B0BE5FBF8B9`, byte-identical to the human's drop |
| `logo.png` | TemuUNAIR logo (source for `docs/02-design/03-design-tokens.md` and `tokens.json`) | **PLACEHOLDER** — generated mark (magnifier + yellow dot, brand placeholder colours). Replace with the real logo; then run TMU-DSG-001 to sample the real palette. |
| `proposal-extract.md` | Citation-first summary of the PDF (sections, verbatim quotes, figure list) transcribed from the committed PDF for agents that cannot read PDFs | **drafted** (`TMU-DOC-002`) — **human verification pending** before any doc cites it as final |

## Human-dropped and unverified material

The blueprint bootstrap step (§0.1 step 1) expects the PDF and logo to be dropped here by the
project owner. The PDF is now committed and transcribed (draft extract, human verification
pending); the **logo is still the placeholder**. Agents **must not invent** missing contents:
anything absent stays a `source_refs: ["proposal.pdf §…"]` citation with an explicit
`OPEN QUESTION` instead of fabricated detail. A draft extract is a transcription aid, not
verified ground truth, until a human signs off (README rule 1 still applies: never edit a source
file; corrections go through a dated copy + ADR).

## Rules

1. Never edit or delete a source file. To correct it, add a new file with a dated suffix and an ADR.
2. Anything derived from the PDF must cite it in `source_refs`, e.g. `proposal.pdf §B Tujuan 3`.
3. The logo is the only legitimate source for brand colours. The current `logo.png` is a
   **placeholder** (magnifier + yellow dot); token values remain placeholders until TMU-DSG-001
   samples the real logo. Do not treat the placeholder's colours as brand truth.
