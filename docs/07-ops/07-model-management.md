---
id: OPS-MODELS
title: Model management
status: draft
owner: ML
updated: 2026-09-29
depends_on: ["ARCH-ML", "ML-EVAL", "MATCH-SPEC"]
source_refs: ["Blueprint §4.8", "DEC-003", "DEC-015", "DEC-016"]
---

# Model management

## Registry

- Every model is listed in `services/ml/models.lock.json`: `name`, `version`, `sha256`,
  `licence`, `source` (URL or internal path), `size`.
- Files download at build/startup into `services/ml/models/` (gitignored); checksums are verified
  before readiness flips to `ok`.
- `GET /v1/models` exposes the lockfile so the worker can record `model_versions` per feature row.

## Current models

| Purpose | Model | Notes |
|---|---|---|
| Detection | ultralytics YOLO (small, COCO) | crop helper only; AGPL (RISK-006, ADR-0009) |
| Image embedding | open_clip ViT-B/32 | 512-d, L2-normalised |
| Text↔image | multilingual CLIP-aligned encoder | DEC-003, ADR-0004 |
| Text↔text | multilingual sentence encoder | 384-d |
| Attributes | rule/lexicon (no model file) | Indonesian colours/brands/materials |

## Updating a model

1. **Propose** with an ADR if the change alters matching semantics (dimension, space, licence).
2. **Benchmark** on the frozen eval set; write a dated report (`/eval-matching`).
3. **Bump** `algo_version` (`YYYY.MM.N`) and the lockfile entry (version + sha256).
4. **Re-embed**: run `matching.reindex` (admin) for the affected scope — features written with
   the old version remain until replaced; matching ignores mismatched versions.
5. **Verify**: `GET /v1/models` matches; `/ready` ok; spot-check matches in staging.
6. **Deploy**: ml image first, then trigger reindex; monitor queue depth and dead letters.

## Reindexing

| Scope | Use |
|---|---|
| `report` | one report (debugging) |
| `campus` | after a campus-specific issue |
| `all` | after a model or weight change |

- Job: `matching.reindex` (`BE-07`), admin-only, rate-limited, resumable in chunks.
- Reindex does not change user-visible statuses; it recomputes features and upserts matches.
- Expect cost: ~1 ML call per image + 1 text call per report; run off-peak.

## A/B and rollback

- `algo_version` on every match row enables before/after comparison.
- A/B via `algo_version` is manual in MVP: run a reindex for a subset, compare metrics, decide.
- Rollback = restore the previous lockfile + reindex back (old features are still present until
  overwritten, so a partial rollback is fast).

## Licence tracking

| Model | Licence | Action before public deployment |
|---|---|---|
| Ultralytics YOLO | AGPL-3.0 | replace with Apache-2.0 detector or buy a licence (RISK-006) |
| open_clip / CLIP weights | check per checkpoint | record in lockfile; verify redistribution terms |
| sentence-transformers models | typically Apache-2.0/MIT | verify per model card |

Every lockfile entry must carry its licence; the security-reviewer checks this at each milestone.

## Failure modes

| Failure | Behaviour |
|---|---|
| Download fails | startup fails readiness; use `ML_MODE=stub` in dev |
| Checksum mismatch | refuse to serve `/v1/*` (503); alert |
| Dimension change without reindex | matching ignores old-version rows; coverage drops until reindex |
| Slow model on CPU | reduce input size / batch size; tune threads; measure before changing thresholds |
