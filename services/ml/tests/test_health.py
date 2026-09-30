"""Contract tests for the ML service health endpoints (BE-06).

TMU-OPS-006 RED: these tests describe the skeleton `@ml-dev` must build. They fail
until `services/ml/app/main.py` exists.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app

MODELS_LOCK = Path(__file__).resolve().parents[1] / "models.lock.json"


def _lockfile_models() -> list[dict[str, str]]:
    registry = json.loads(MODELS_LOCK.read_text(encoding="utf-8"))
    return registry["models"]


@pytest.fixture()
def client():
    # Context manager runs startup/shutdown so /ready reflects the checksum
    # verification performed at startup (BE-06 behavioural contract #4).
    with TestClient(app) as test_client:
        yield test_client


def test_health_returns_exactly_ok(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ready_returns_degraded_while_checksums_are_unpinned(client):
    response = client.get("/ready")

    assert response.status_code == 200
    assert response.json()["status"] == "degraded"


def test_ready_lists_every_model_from_the_lockfile(client):
    response = client.get("/ready")

    assert response.status_code == 200
    models = response.json()["models"]
    lockfile_names = [entry["name"] for entry in _lockfile_models()]

    assert isinstance(models, list)
    assert {entry["name"] for entry in models} == set(lockfile_names)
    assert len(models) == len(lockfile_names)


def test_ready_models_expose_name_version_loaded_and_are_unloaded(client):
    response = client.get("/ready")

    assert response.status_code == 200
    for entry in response.json()["models"]:
        assert isinstance(entry.get("name"), str) and entry["name"]
        assert isinstance(entry.get("version"), str) and entry["version"]
        assert entry.get("loaded") is False