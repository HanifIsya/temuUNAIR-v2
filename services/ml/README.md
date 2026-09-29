# `services/ml` — TemuUNAIR ML service

FastAPI service for YOLO detection, CLIP/multilingual embeddings and NLP attribute extraction.

**Status: not implemented yet.** This README and `models.lock.json` are the M0/M2 scaffolding;
the service itself is built in milestone **M5** (`TMU-ML-001..`).

## Contract (do not deviate)

- `docs/04-contracts/backend/BE-06-ml-service-contract.md` — endpoints, schemas, status codes
- `docs/04-contracts/backend/ml-openapi.json` — generated OpenAPI (replaces the placeholder)
- `docs/03-architecture/06-ml-service-design.md` — models, preprocessing, budgets
- `docs/03-architecture/07-ml-evaluation-plan.md` — metrics and acceptance targets
- `docs/07-ops/07-model-management.md` — registry, updates, reindexing

## Planned layout

```
services/ml/
├─ pyproject.toml          # uv-managed
├─ models.lock.json        # pinned models with checksums + licences
├─ app/
│  ├─ main.py              # FastAPI app + routes
│  ├─ config.py            # env, model paths
│  ├─ models/              # model loaders
│  ├─ pipelines/           # analyze_image, embed_text, extract_attributes
│  ├─ lexicon/             # Indonesian colours/brands/materials
│  └─ schemas.py           # pydantic models mirroring BE-06
├─ eval/                   # evaluation harness (/eval-matching)
├─ scripts/                # download_models.py, warmup.py, export_openapi.py
└─ tests/                  # pytest; fixtures in tests/fixtures/ml
```

## Local commands (once implemented)

```bash
uv sync --frozen
uv run uvicorn app.main:app --reload      # http://localhost:8000
uv run ruff check . && uv run pytest -q
uv run python scripts/export_openapi.py   # writes ../../docs/04-contracts/backend/ml-openapi.json
```

## Non-negotiables

1. Stateless; **no image or text is logged or persisted**.
2. Deterministic for the same input + model versions (fixed seeds, eval mode).
3. Model files come from `models.lock.json`; checksums verified at startup.
4. `imageUrl` fetches are allowlisted to our storage host; redirects rejected (SSRF).
5. CPU-friendly latency budget (BE-06: `analyze-image` ≤ 3 s p95).
6. Licence of every model is recorded; Ultralytics YOLO is AGPL-3.0 (RISK-006).
