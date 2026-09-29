---
id: ADR-0009
title: YOLO as a crop helper only (and its AGPL licence)
status: accepted
owner: AR+ML
updated: 2026-09-29
depends_on: ["ARCH-ML", "MATCH-SPEC"]
source_refs: ["DEC-015", "DEC-016", "RISK-005", "RISK-006"]
---

# ADR-0009 — YOLO as a crop helper only (and its AGPL licence)

## Context

The PDF names YOLO for object detection. Pretrained YOLO (COCO) knows ~80 classes (backpack,
handbag, cell phone, laptop, umbrella, bottle…) but **not** KTM, wallet, keys, tumbler, AirPods
— exactly the campus items users lose most. Ultralytics YOLO is AGPL-3.0 (commercial licence
available).

## Options

1. **Fine-tune YOLO on campus items** — best detection quality, needs a labelled dataset and
   GPU time; out of scope for the course timeline (stretch).
2. **Use YOLO as a crop helper**: detect a known object, crop to it, embed the crop with CLIP;
   if nothing is detected (or confidence is low), embed the full image. Add CLIP zero-shot
   category scores as a fallback signal.
3. **Drop YOLO entirely** — fewer moving parts, but loses the useful "focus on the item, not
   the background" behaviour for the classes it does know.
4. **Swap to an Apache-2.0 detector** — avoids AGPL, adds evaluation work and a new dependency.

## Decision

Option 2. YOLO runs only to find a primary object (crop source) and to supply coarse labels;
CLIP does the matching work. Fine-tuning and licence replacement are deferred.

## Consequences

- No training pipeline is required; models stay pretrained and pinned in `models.lock.json`.
- The `source: crop|full` field on embeddings records which path was used, enabling eval
  analysis of crop-vs-full quality.
- CLIP zero-shot category guesses fill the gap for undetected classes (DEC-015).
- **Licence:** AGPL-3.0 is acceptable for coursework but flagged as RISK-006. Before any public
  or commercial deployment, re-evaluate with an Apache-2.0 detector or obtain a commercial
  licence; this is a launch gate, not a code change.
- Detection is advisory: a wrong crop cannot corrupt the report, only the embedding quality, and
  the full-image fallback bounds the damage.
