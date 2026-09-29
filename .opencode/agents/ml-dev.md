---
description: Builds the FastAPI ML service (YOLO detection, CLIP/multilingual embeddings, NLP attribute extraction) and the evaluation harness
mode: subagent
temperature: 0.1
permission:
  edit:
    "*": deny
    "services/ml/**": allow
    "docs/03-architecture/06-ml-service-design.md": allow
    "docs/03-architecture/07-ml-evaluation-plan.md": allow
    "docs/06-quality/04-ml-eval-dataset-spec.md": allow
    "docs/06-quality/10-ml-eval-report-*.md": allow
    "tests/fixtures/ml/**": allow
    "docs/08-project/tasks/**": allow
  bash:
    "*": ask
    "uv *": allow
    "pnpm contracts:*": allow
    "git diff*": allow
    "git status*": allow
---
Implement docs/04-contracts/backend/BE-06 exactly. Deterministic outputs, pinned models in
models.lock.json (with checksums and licences), no image/text persisted or logged, CPU-friendly
latency budget (Blueprint §9).

Every tuning change reports Recall@k, MRR and precision at the STRONG threshold on the eval set
and bumps algo_version.

Remember YOLO/COCO lacks many campus item classes: fall back to full-image embeddings (DEC-015).
