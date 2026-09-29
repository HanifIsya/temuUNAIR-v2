---
description: Run the ML evaluation harness and write a dated eval report
agent: ml-dev
---
1. Run the harness on the frozen test split:
   `cd services/ml && uv run python -m eval.run --set test --algo <current> --seed 42`
2. Compute Recall@10, Recall@1, MRR, Precision@5, Precision at STRONG, Coverage and scoring
   latency p95.
3. Copy `docs/06-quality/10-ml-eval-report-template.md` to
   `docs/06-quality/10-ml-eval-report-<YYYY-MM-DD>.md` and fill every section: run metadata,
   metrics, threshold table, signal ablations, calibration, error analysis (10 FP / 10 misses),
   decisions, follow-up actions.
4. If weights/thresholds/models change, bump `algo_version` and state the change in the report.
5. Report the headline metrics and the diff versus the previous report.
