---
id: ML-EVAL
title: ML evaluation plan
status: approved
owner: ML
updated: 2026-10-03
depends_on: ["MATCH-SPEC", "ARCH-ML", "METRICS"]
source_refs: ["Blueprint §5A.9", "DEC-003", "DEC-012"]
---

# ML evaluation plan

Purpose: decide weights, thresholds and models **with evidence**, and keep a dated record of
every tuning change. Reports: `docs/06-quality/10-ml-eval-report-<date>.md` (skill
`/eval-matching`).

## Dataset

| Aspect | Spec |
|---|---|
| Source | Synthetic pairs + consented real reports collected after launch (no unconsented personal data) |
| Size (target) | ≥ 200 labelled pairs at M5; ≥ 500 before tuning at M8 |
| Composition | true pairs (same physical item: lost+found), hard negatives (same category, different item), easy negatives |
| Labels | `pair_id`, `is_match` (0/1), item metadata, split (`train`/`dev`/`test`) |
| Splits | 60/20/20 by **item** (never split a pair across splits); frozen `test` |
| Licences/consent | Each image's provenance recorded in `docs/06-quality/04-ml-eval-dataset-spec.md`; synthetic fixtures are CC0/generated |
| Privacy | No KTM/ATM real numbers; sensitive samples are synthetic or redacted |

Layout: `tests/fixtures/ml/<split>/{lost,found}/<item_id>/…` + `labels.csv`.

## Metrics

| Metric | Definition | Why | Target |
|---|---|---|---|
| Recall@10 | share of true pairs in top-10 candidate list | retrieval quality | ≥ 0.80 |
| Recall@1 | share ranked first | headline quality | ≥ 0.55 |
| MRR | mean reciprocal rank of the true match | ranking quality | ≥ 0.65 |
| Precision@5 | share of top-5 suggestions that are true pairs | user trust (RISK-001) | ≥ 0.70 |
| Precision at STRONG | of pairs ≥ STRONG threshold, share true | notification quality | ≥ 0.90 |
| Coverage | share of reports with ≥1 candidate | cold-start health | ≥ 0.60 |
| Latency | p95 per pair scoring on CPU | UX budget | ≤ 50 ms/pair in scoring |

## Procedure

1. Reindex the frozen eval set with the candidate `algo_version`.
2. Run the harness: `cd services/ml && uv run python -m eval.run --set test --algo <version>`.
3. Produce a report: metrics table, confusion at thresholds, per-signal ablations
   (drop one signal, renormalise), error analysis (10 worst false positives, 10 worst misses),
   and the calibration curve for raw cosine → `[0,1]`.
4. Compare against the previous report; state which weights/thresholds change and why.
5. Bump `algo_version`; attach the report to the PR (required by `tune-matching`).

## Threshold policy

| Threshold | Default | Rule to change |
|---|---|---|
| `MATCH_THRESHOLD_STRONG` | 0.75 | Change only if precision at STRONG stays ≥ 0.90 on `test` |
| `MATCH_THRESHOLD_POSSIBLE` | 0.55 | Change if Recall@10 drops below 0.80 or precision@5 below 0.70 |
| Affine map constants | `(cos−0.5)/0.4` | Refit on `dev`; verify on `test`; document the curve |

## Error analysis requirements

- Classify each false positive: same category different item, colour-only similarity, wrong
  location, time coincidence, text boilerplate ("tas biru").
- Classify each miss: no usable image, language mismatch, attributes missing, location filter
  too strict, time filter too strict.
- Every report ends with ≤5 concrete follow-up actions, each becoming a task or an explicit
  "won't fix with reason".

## Reproducibility

- Seeds fixed; model versions from `models.lock.json` recorded in the report.
- Harness version and git SHA recorded.
- Raw outputs (CSV) stored under `docs/06-quality/ml-eval/<date>/` (no images committed).

## Cadence

| When | What |
|---|---|
| M5 | Baseline report with initial weights |
| Every tuning PR | New dated report + diff vs previous |
| M8 | Final report on the frozen test set for the course report |
| After launch | Quarterly, or after any model/version change |
