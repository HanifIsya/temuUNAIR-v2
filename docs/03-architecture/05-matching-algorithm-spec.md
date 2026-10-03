---
id: MATCH-SPEC
title: Matching algorithm specification
status: approved
owner: AR+ML
updated: 2026-10-03
depends_on: ["ARCH-STATES", "BE-06", "ARCH-ML"]
source_refs: ["Blueprint §5A.9", "DEC-003", "DEC-012", "DEC-015"]
---

# Matching algorithm specification

Initial hypotheses from Blueprint §5A.9 — every number here is **tunable and must be justified
by an eval report** (`docs/06-quality/10-ml-eval-report-<date>.md`). Changing weights, models or
thresholds bumps `algo_version` and requires the `tune-matching` skill.

## Pipeline

```mermaid
flowchart LR
  T[report.process] --> F[Features written]
  F --> M[report.match]
  M --> H[1 Hard filters SQL]
  H --> C[2 Candidate retrieval top-K per signal]
  C --> S[3 Signal scores 0..1]
  S --> W[4 Weighted score + bands]
  W --> P[5 Persist top 10, upsert matches]
  P --> N[6 Notify: STRONG now, POSSIBLE digest]
```

## 1. Hard filters (SQL)

- Opposite `type`; both reports in `OPEN`/`MATCHED`.
- Different reporters (never match a user to themselves).
- Category equal **or** in a compatibility group:

| Group | Members |
|---|---|
| G-A (devices) | `PHONE`, `LAPTOP_TABLET`, `EARPHONES`, `CHARGER_CABLE` |
| G-B (carry) | `BAG`, `WALLET`, `KEYS`, `ACCESSORY`, `STATIONERY` |
| G-C (wearables) | `CLOTHING`, `GLASSES`, `HELMET`, `SPORTS_GEAR` |
| G-D (docs) | `ID_CARD`, `BANK_CARD`, `BOOK_DOCUMENT` |
| G-E (misc) | `BOTTLE`, `UMBRELLA`, `OTHER` |

`OTHER` matches anything; `ID_CARD` ↔ `BANK_CARD` allowed; `PHONE` ↔ `LAPTOP_TABLET` **not**.
- Time: `found.occurred_from ≥ lost.occurred_from − 1 day` and `found.occurred_from ≤
  lost.occurred_to + 60 days` (when a window exists).

## 2. Candidate retrieval

Union of, then filter, cap at ≤100 candidates:

| Source | K | Index |
|---|---|---|
| image↔image cosine | 50 | `report_features_img_hnsw` |
| CLIP-text↔image (either direction) | 50 | `report_features_txt_hnsw` |
| sentence↔sentence | 50 | `report_features_sent_hnsw` |

## 3. Signals (each mapped to `[0,1]`)

| Signal | Definition | Notes |
|---|---|---|
| `S_ii` | cosine of mean image embeddings | skipped if either side lacks a usable image |
| `S_ti` | max(text↔image both directions) | uses multilingual CLIP text encoder |
| `S_tt` | cosine of sentence embeddings | |
| `S_attr` | colour Jaccard; brand equal = 1, explicit conflict = −0.3 (clamped 0); material/features overlap | rule/lexicon extraction (`extract-attributes`) |
| `S_loc` | same building 1.0 · same campus 0.6 · other campus 0.1; optional geo decay `exp(−km/2)` | building = location_id or parent |
| `S_time` | `exp(−Δdays/7)` | Δ from lost window end (or start) to found time |

Raw cosine → `[0,1]` via a calibrated affine map fitted on the eval set; initial guess:
`clip((cos − 0.5) / 0.4, 0, 1)`.

## 4. Weights

With usable images on both sides:

```
score = 0.30·S_ii + 0.10·S_ti + 0.20·S_tt + 0.15·S_attr + 0.15·S_loc + 0.10·S_time
```

If a side lacks a usable image: drop `S_ii`, raise `S_ti` to 0.25, renormalise the rest.

## 5. Bands and storage

| Band | Threshold (env) | Behaviour |
|---|---|---|
| `STRONG` | ≥ `MATCH_THRESHOLD_STRONG` (0.75) | stored; notified immediately |
| `POSSIBLE` | ≥ `MATCH_THRESHOLD_POSSIBLE` (0.55) | stored; daily digest |
| below | — | not stored |

- Keep top **10** per report (by score, then recency).
- `UNIQUE (lost_report_id, found_report_id)` — upsert on rematch.
- Every row stores `score`, `band`, `reasons`, `components`, `algo_version`.

## 6. Explainability

- `reasons[]` lists signals with normalised value ≥ 0.6, mapped to i18n `labelKey`s.
- Users never see numeric scores (DEC-012); moderators/evals can read `components`.

## 7. Sensitive categories

- Never match on card holder names/numbers; OCR is not used (stretch, DEC-014).
- Masked photos are still embedded server-side (masking is a display concern).
- Sensitive reports may still match normally; only the *display* is restricted.

## 8. Cold start

- New report with no features yet → `report.match` runs after `report.process` completes.
- No candidates → no match row; report stays `OPEN`; user can `rematch` after 10 min.
- Sparse corpus: browse + FTS remain the primary discovery path (RISK-004).

## 9. Versioning and evaluation

1. `algo_version` format `YYYY.MM.N` (e.g. `2026.10.1`).
2. Any change to weights/thresholds/models requires an eval report with Recall@k, MRR and
   precision at the STRONG threshold on the frozen eval set.
3. Admin reindex (`API-ADM-15`) recomputes features/matches for a new version.

## 10. Failure modes

| Failure | Behaviour |
|---|---|
| ML unavailable | `report.process` retries; report flagged `needs_reprocess`; UI unaffected |
| Unusable image (blur/dark) | skip image signals, rely on text/attrs/loc/time |
| Embedding dimension mismatch after model swap | reindex required; old rows ignored by version filter |
| Duplicate/abusive reports | hard filters + rate limits + flags; matches are advisory |
