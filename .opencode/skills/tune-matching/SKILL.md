---
name: tune-matching
description: Changing matching weights, thresholds or models with an eval report. Use ONLY for matching-quality changes; never for quick fixes.
---

1. Confirm the change is in scope of the task and does not silently alter contract behaviour
   (thresholds live in `BE-11` env contract).
2. Make the change in the code/config (`MATCH_THRESHOLD_*`, weights in
   `server/services/matching/*`, or the ML model).
3. Run the eval harness on the frozen test split:

   ```bash
   cd services/ml && uv run python -m eval.run --set test --algo <new-version> --seed 42
   ```

4. Write a dated report `docs/06-quality/10-ml-eval-report-<date>.md` (template) with:
   Recall@10/1, MRR, Precision@5, Precision at STRONG, coverage, latency, ablations,
   calibration, 10 FP + 10 misses, decisions and follow-ups.
5. Bump `algo_version` (format `YYYY.MM.N`); update `docs/03-architecture/05-matching-algorithm-spec.md`
   and, if thresholds change, the env contract and `.env.example`.
6. Gate rules:
   - Precision at STRONG must stay ≥ 0.90 on `test`, else the change is rejected;
   - Recall@10 ≥ 0.80 and Precision@5 ≥ 0.70 must hold;
   - attach the report to the PR.
7. Trigger a reindex (`matching.reindex`) plan for the affected scope; document cost and timing.

Never tune on the test split: fit on `dev`, verify on `test`, and record every run.
