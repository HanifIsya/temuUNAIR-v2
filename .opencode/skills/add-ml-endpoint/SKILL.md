---
name: add-ml-endpoint
description: Recipe for a new route in the FastAPI ML service. Use when a task adds or changes any services/ml endpoint.
---

1. Add the endpoint to `docs/04-contracts/backend/BE-06` first (request/response, status codes,
   behavioural notes) — it is a contract change (`TMU-CTR-*`).
2. Implement in `services/ml/app/main.py` + a pipeline in `app/pipelines/`; pydantic models
   mirror the contract exactly.
3. Requirements:
   - stateless; no image/text persisted or logged;
   - deterministic for the same input + model versions;
   - pinned models in `models.lock.json` with checksums verified at startup;
   - CPU-friendly (respect the latency budget in `ARCH-ML`).
4. Export the OpenAPI: `uv run python scripts/export_openapi.py` → commit
   `docs/04-contracts/backend/ml-openapi.json`.
5. Tests: pytest for the pipeline, a contract test parsing fixtures, a determinism test, and
   error cases (400/413/415/422/503).
6. Run `cd services/ml && uv run ruff check . && uv run pytest -q`.

Checklist:
- [ ] Bearer token required (except health)
- [ ] SSRF guard on image URLs (allowlist our storage host, no redirects)
- [ ] Response schemas validated against the committed OpenAPI
