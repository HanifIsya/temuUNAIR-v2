---
id: ML-DATASET
title: ML evaluation dataset specification
status: draft
owner: ML
updated: 2026-09-29
depends_on: ["ML-EVAL", "TEST-STRATEGY"]
source_refs: ["Blueprint §4.7", "DEC-003", "DEC-014"]
---

# ML evaluation dataset specification

## Folder layout

```
tests/fixtures/ml/
├─ labels.csv                 # pair_id, lost_item_id, found_item_id, is_match, split, notes
├─ train/{lost,found}/<item_id>/*.jpg
├─ dev/{lost,found}/<item_id>/*.jpg
└─ test/{lost,found}/<item_id>/*.jpg
```

`labels.csv` columns:

| Column | Type | Notes |
|---|---|---|
| `pair_id` | string | unique |
| `lost_item_id` / `found_item_id` | string | folder names |
| `is_match` | 0/1 | ground truth |
| `split` | train/dev/test | frozen per item |
| `category` | enum | for stratified analysis |
| `hard_negative` | 0/1 | same category, different item |
| `source` | synthetic/consented | provenance |
| `licence` | string | e.g. CC0, project-owned |
| `notes` | string | e.g. "no usable image", "Indonesian text only" |

## Composition targets

| Aspect | Target (M5) | Target (M8) |
|---|---|---|
| Labelled pairs | ≥ 200 | ≥ 500 |
| True pairs | ≥ 80 | ≥ 200 |
| Hard negatives | ≥ 60 | ≥ 150 |
| Categories covered | all 19 | all 19 |
| Indonesian-only text | 100% | 100% |
| Sensitive categories | synthetic only | synthetic only |

## Splits

- 60/20/20 by **item** (a pair's images never straddle splits).
- `test` is frozen; touching it invalidates prior reports (record the reason in the report).
- Stratify so every category appears in `dev` and `test`.

## Privacy and consent

1. **Synthetic first:** generated or CC0 images with fictional items; no real documents.
2. Real reports may be used **only** with explicit consent, anonymized (no faces, no card
   numbers), and recorded in `source`/`licence` columns.
3. No KTM/KTP/ATM numbers, ever — even synthetic ones must be obviously fake
   (`0000 0000 0000 0000`, `NAMA CONTOH`).
4. Fixture images are committed only if licence-clean; otherwise they live outside the repo and
   are fetched by a script (documented in the report).

## Augmentation (dev/train only)

- Rotations ±15°, mild blur/brightness changes, JPEG quality 70–90.
- No augmentation of `test`; no synthetic text overlays (would create false signals).

## Quality checks (CI)

| Check | Rule |
|---|---|
| Labels valid | every image belongs to a listed item; no orphan folders |
| Split integrity | no item appears in two splits |
| Privacy scan | filenames and metadata contain no personal data; EXIF stripped |
| Determinism | a fixed seed reproduces the same augmentation set |

## Maintenance

- New pairs are added with a PR that updates `labels.csv` and a short note in the eval report.
- Removing pairs requires a reason (they may be hard cases that expose a model weakness).
- The dataset version is recorded in every eval report.
