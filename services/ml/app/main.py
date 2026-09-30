"""FastAPI application for the TemuUNAIR ML service (BE-06).

Skeleton scope (TMU-OPS-006): `GET /health` and `GET /ready`. Real model loading,
checksum verification and the authenticated `/v1/*` endpoints arrive in M5
(`TMU-ML-001..`).

Privacy: no image bytes, text bodies or embeddings are ever logged or persisted
(BE-06 behavioural contract #3; `services/ml/README.md` non-negotiable #1).
"""

from __future__ import annotations

import json
import logging
from collections.abc import Iterator
from contextlib import asynccontextmanager
from dataclasses import dataclass
from pathlib import Path

from fastapi import FastAPI

logger = logging.getLogger(__name__)

MODELS_LOCK_PATH = Path(__file__).resolve().parents[1] / "models.lock.json"
_CHECKSUM_PLACEHOLDER = "TODO"


@dataclass(frozen=True)
class ModelState:
    """Readiness row for one registered model (BE-06 `/ready` schema)."""

    name: str
    version: str
    loaded: bool
    checksum_pinned: bool


def _is_checksum_pinned(sha256: object) -> bool:
    """A checksum is pinned once it is a real digest, not the M5 placeholder."""
    return isinstance(sha256, str) and bool(sha256) and sha256 != _CHECKSUM_PLACEHOLDER


def load_model_states(path: Path = MODELS_LOCK_PATH) -> list[ModelState]:
    """Read the pinned registry and report per-model readiness.

    M5 replaces the `loaded` flag with the real loader state and verifies every
    checksum against the downloaded model file.
    """
    registry = json.loads(path.read_text(encoding="utf-8"))
    return [
        ModelState(
            name=entry["name"],
            version=entry["version"],
            loaded=False,  # M5: set from the model loaders
            checksum_pinned=_is_checksum_pinned(entry.get("sha256")),
        )
        for entry in registry["models"]
    ]


def readiness_payload(states: list[ModelState]) -> dict[str, object]:
    """BE-06: `ok` only when every model is loaded and every checksum is pinned."""
    ready = all(state.loaded and state.checksum_pinned for state in states)
    return {
        "status": "ok" if ready else "degraded",
        "models": [
            {"name": state.name, "version": state.version, "loaded": state.loaded}
            for state in states
        ],
    }


@asynccontextmanager
async def lifespan(application: FastAPI) -> Iterator[None]:
    """Load the registry at startup; metadata-only logging, never payloads."""
    states = load_model_states()
    application.state.model_states = states
    logger.info(
        "ml service starting: %d models registered, %d checksums pinned",
        len(states),
        sum(1 for state in states if state.checksum_pinned),
    )
    yield


app = FastAPI(title="TemuUNAIR ML service", version="0.1.0", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    """Liveness probe (BE-06)."""
    return {"status": "ok"}


@app.get("/ready")
def ready() -> dict[str, object]:
    """Readiness probe (BE-06): degraded while checksums are unpinned or models unloaded."""
    states: list[ModelState] = app.state.model_states
    return readiness_payload(states)