---
id: SRC-README
title: Source material
status: approved
owner: OR
updated: 2026-09-29
depends_on: []
source_refs: ["Blueprint §0.1"]
---

# `docs/_source/` — source material

This folder holds the raw inputs every document traces back to. It is **read-only** for agents.

| File | What it is | Status |
|---|---|---|
| `proposal.pdf` | TemuUNAIR proposal — Kelompok 3, Inovasi Sistem Informasi dan Teknologi I1, S1 Sistem Informasi, Universitas Airlangga | **must be added by a human** — not in the repo yet |
| `logo.png` | TemuUNAIR logo (source for `docs/02-design/03-design-tokens.md` and `tokens.json`) | **PLACEHOLDER** — generated mark (magnifier + yellow dot, brand placeholder colours). Replace with the real logo; then run TMU-DSG-001 to sample the real palette. |
| `proposal-extract.md` | Human-written summary of the PDF (sections, quotes, figure list) used by agents that cannot read PDFs | to be written in M1 |

## Why these are not committed yet

The blueprint bootstrap step (§0.1 step 1) expects the PDF and logo to be dropped here by the
project owner. Agents **must not invent** their contents: while these files are missing, every
document that would cite them carries `source_refs: ["proposal.pdf §…"]` and an explicit
`OPEN QUESTION` instead of fabricated detail.

## Rules

1. Never edit or delete a source file. To correct it, add a new file with a dated suffix and an ADR.
2. Anything derived from the PDF must cite it in `source_refs`, e.g. `proposal.pdf §B Tujuan 3`.
3. The logo is the only legitimate source for brand colours. The current `logo.png` is a
   **placeholder** (magnifier + yellow dot); token values remain placeholders until TMU-DSG-001
   samples the real logo. Do not treat the placeholder's colours as brand truth.
