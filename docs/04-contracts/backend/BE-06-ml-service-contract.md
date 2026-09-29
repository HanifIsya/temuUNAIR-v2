---
id: BE-06
title: ML service contract
status: draft
owner: ML
updated: 2026-09-29
depends_on: ["ARCH-ML", "BE-01", "BE-04"]
source_refs: ["Blueprint §5A.8", "DEC-003", "DEC-015"]
---

# BE-06 — ML service contract

Internal only. Base URL `$ML_SERVICE_URL`. Auth `Authorization: Bearer $ML_SERVICE_TOKEN` on all
`/v1/*` endpoints. Timeout 8 s per call; the service is stateless. Errors use the `BE-04`
envelope. No image or text is logged or stored.

## Endpoints

| Endpoint | Auth | Request → Response |
|---|---|---|
| `GET /health` | — | → `{status:"ok"}` |
| `GET /ready` | — | → `{status, models:[{name,version,loaded}]}` |
| `GET /v1/models` | bearer | → contents of `models.lock.json` (name, version, sha256, licence) |
| `POST /v1/analyze-image` | bearer | `{imageUrl, options?:{detect,embed,quality}}` → `ImageAnalysis` |
| `POST /v1/embed-text` | bearer | `{texts:[{id,text}], locale}` → `{embeddings:[{id,clipText[512],sentence[384]}], modelVersions}` |
| `POST /v1/extract-attributes` | bearer | `{title,description,locale}` → `Attributes` |

## Schemas

```jsonc
// ImageAnalysis
{
  "modelVersions": { "yolo": "…", "clip": "…", "quality": "1" },
  "detections": [
    { "label": "backpack", "classId": 24, "confidence": 0.91, "bbox": { "x": 0.12, "y": 0.20, "w": 0.55, "h": 0.60 } }
  ], // normalized 0–1
  "primaryObject": { "label": "backpack", "confidence": 0.91, "bbox": { "x": 0.12, "y": 0.20, "w": 0.55, "h": 0.60 } },
  "embedding": { "model": "clip-vit-b-32", "dim": 512, "vector": [ /* L2-normalised */ ], "source": "crop" },
  "categoryGuess": [ { "category": "BAG", "score": 0.74 } ],
  "quality": { "blur": 0.18, "brightness": 0.62, "width": 1024, "height": 768, "usable": true },
  "sensitive": { "cardLikely": false }
}
```

```jsonc
// Attributes
{
  "normalized": "tas ransel biru tua eiger gantungan kunci kuning",
  "itemName": "tas ransel",
  "category": { "value": "BAG", "confidence": 0.8 },
  "colors": ["biru", "kuning"],
  "brand": "eiger",
  "material": "nilon",
  "features": ["gantungan kunci", "resleting depan"],
  "keywords": ["tas", "ransel", "biru"]
}
```

## Behavioural contract

1. **Vectors are L2-normalised** (both image and text) and deterministic for the same input +
   `modelVersions` (eval mode, fixed seeds).
2. `usable=false` when blur/brightness are below thresholds → the worker skips image↔image
   scoring (falls back to text/attr/loc/time).
3. No image or text is persisted or logged; `imageUrl` fetches are allowlisted (our storage
   host only) and redirects are rejected.
4. Model files come from `models.lock.json`; checksums are verified at startup; a mismatch makes
   `/ready` report `status:"degraded"` and `/v1/*` return `503`.
5. `extract-attributes` is rule/lexicon-based (Indonesian colours, brands, materials); using an
   LLM requires an ADR (privacy + cost).
6. Warm-up on boot (one dummy image + text) so the first real call is fast.
7. `modelVersions` in responses is the exact object stored in `image_features.model_versions` /
   `report_features.model_versions`.

## Status codes

| Code | When |
|---|---|
| `400` | malformed body |
| `401` | missing/incorrect bearer token |
| `413` | image too large (server-side cap ~12 MB) |
| `415` | unsupported content type |
| `422` | image unreadable/decodable |
| `429` | internal rate limit (worker retries) |
| `503` | model not ready / checksum mismatch |

The worker retries only `429`, `5xx` and timeouts; other codes fail fast.

## `ml-openapi.json`

Generated from the FastAPI app (`services/ml/scripts/export_openapi.py`) and committed at
`docs/04-contracts/backend/ml-openapi.json`. The worker's generated client must type-check
against it, and Schemathesis fuzzes it in CI.

## Examples

`POST /v1/analyze-image`
```json
{ "imageUrl": "https://storage.internal/temuunair/reports/018f…/018f….jpg?X-Amz-Expires=300",
  "options": { "detect": true, "embed": true, "quality": true } }
```

`POST /v1/embed-text`
```json
{ "texts": [{ "id": "018f2c…", "text": "Tas ransel biru tua, ada gantungan kunci kuning." }],
  "locale": "id" }
```

`POST /v1/extract-attributes`
```json
{ "title": "Tas ransel biru", "description": "Biru tua, ada gantungan kunci kuning.", "locale": "id" }
```

## Testing

- Schemas: pydantic models mirror these shapes exactly; a contract test parses fixtures.
- Determinism: same request twice → byte-identical vectors after rounding.
- Failure: unreadable image → `422`; oversized → `413`; bad token → `401`.
- Licence/checksum: startup fails readiness if a model file does not match `models.lock.json`.
