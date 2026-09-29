---
id: ADR-0004
title: Multilingual CLIP-aligned text encoder for text↔image matching
status: proposed
owner: AR+ML
updated: 2026-09-29
depends_on: ["ARCH-ML", "MATCH-SPEC"]
source_refs: ["DEC-003", "Blueprint §1.3"]
---

# ADR-0004 — Multilingual CLIP-aligned text encoder for text↔image matching

## Context

OpenAI CLIP's text encoder is English-centric; TemuUNAIR reports are written in Bahasa
Indonesia. Text↔image matching must work for queries like "tas ransel biru" against image
embeddings from ViT-B/32.

## Options

1. **OpenAI CLIP text encoder only** — poor Indonesian quality; would require translating
   queries (extra dependency, latency, privacy).
2. **Multilingual CLIP-aligned sentence encoder** (e.g. `sentence-transformers/clip-ViT-B-32-multilingual-v1`,
   distilled into the ViT-B/32 space, 512-d). Same vector space as the image encoder; works
   zero-shot for Indonesian.
3. **Translate-then-encode** — use a translation API/model before CLIP. Extra service, cost,
   data leaves the boundary, latency.
4. **Fine-tune CLIP on Indonesian pairs** — best quality, needs a dataset and GPU time
   (out of scope for coursework).

## Decision

Option 2 as the default, pending verification of the specific model's alignment quality. Keep
the decision **proposed** until the M5 eval report confirms Recall@k targets; if it
underperforms, fall back to option 3 (local translation) with an ADR update.

## Consequences

- Text and image embeddings live in the same 512-d space → `S_ti` is meaningful for Indonesian.
- The model must be pinned in `models.lock.json` with checksums and its licence recorded.
- Text↔text similarity still uses a separate multilingual sentence encoder (`vector(384)`);
  two text paths coexist by design.
- Embedding dimension is fixed at 512 for the CLIP space; changing models requires reindexing
  (`algo_version`).
- Evaluation must report Indonesian-specific quality (the eval set is Indonesian by default).
