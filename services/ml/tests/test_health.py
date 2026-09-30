"""Contract tests for the ML service health endpoints (BE-06).

TMU-OPS-006 RED: these tests describe the skeleton `@ml-dev` must build. They fail
until `services/ml/app/main.py` exists.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import ModelState, app, readiness_payload

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
    lockfile = {entry["name"]: entry["version"] for entry in _lockfile_models()}

    assert isinstance(models, list)
    assert {entry["name"] for entry in models} == set(lockfile)
    assert len(models) == len(lockfile)
    # m4: names alone are not enough; the response must carry the lockfile's
    # exact name -> version mapping.
    assert {entry["name"]: entry["version"] for entry in models} == lockfile


def test_ready_models_expose_name_version_loaded_and_are_unloaded(client):
    response = client.get("/ready")

    assert response.status_code == 200
    for entry in response.json()["models"]:
        assert isinstance(entry.get("name"), str) and entry["name"]
        assert isinstance(entry.get("version"), str) and entry["version"]
        assert entry.get("loaded") is False


def test_readiness_payload_empty_registry_is_degraded_not_ok():
    # m1: `all([])` is True, so an empty registry must be guarded explicitly;
    # a service with zero registered models can never be ready.
    payload = readiness_payload([])

    assert payload["status"] == "degraded"
    assert payload["models"] == []


def test_readiness_payload_all_models_loaded_and_pinned_is_ok():
    # m1: the `ok` branch is currently unreachable (startup hard-codes
    # loaded=False); this unit test pins the M5 handoff condition so the fix
    # cannot silently break it.
    states = [
        ModelState(name="model-a", version="1.2.3", loaded=True, checksum_pinned=True),
        ModelState(name="model-b", version="4.5.6", loaded=True, checksum_pinned=True),
    ]

    payload = readiness_payload(states)

    assert payload["status"] == "ok"
    assert payload["models"] == [
        {"name": "model-a", "version": "1.2.3", "loaded": True},
        {"name": "model-b", "version": "4.5.6", "loaded": True},
    ]