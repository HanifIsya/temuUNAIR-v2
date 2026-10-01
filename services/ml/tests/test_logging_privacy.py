"""Privacy tests: the ML service must never log request payloads.

BE-06: "No image or text is logged or stored"; AGENTS.md rule 5 and
`services/ml/README.md` non-negotiable #1. The sentinel strings below are synthetic
fixtures (no real people, no real UNAIR data) chosen to be unmistakable in any log.
"""

from __future__ import annotations

import logging

from fastapi.testclient import TestClient

from app.main import app

SENTINEL_TEXT = "TMU-OPS-006-SENTINEL-TEXT-7d41c0b2-must-never-be-logged"
SENTINEL_IMAGE_URL = (
    "https://sentinel-tmu-ops-006.invalid/private-3f9a12c8-must-never-be-logged.png"
)

_EMBED_TEXT_BODY = {
    "texts": [
        {
            "id": "018f0000-0000-7000-8000-000000000001",
            "text": SENTINEL_TEXT,
        }
    ],
    "locale": "id",
}
_ANALYZE_IMAGE_BODY = {"imageUrl": SENTINEL_IMAGE_URL}


def test_request_payloads_never_reach_logs_or_std_streams(caplog, capsys):
    caplog.set_level(logging.DEBUG)

    with TestClient(app) as client:
        client.get("/health")
        client.get("/ready")
        embed_response = client.post("/v1/embed-text", json=_EMBED_TEXT_BODY)
        image_response = client.post("/v1/analyze-image", json=_ANALYZE_IMAGE_BODY)

    # Positive control (m2): the lifespan emits "ml service starting" through the
    # `app.main` logger. If this line is missing, log capture is misconfigured and
    # the sentinel assertions below would pass vacuously.
    assert "ml service starting" in caplog.text, (
        "positive control failed: the lifespan startup log was not captured, so "
        "the sentinel-absence assertions cannot be trusted"
    )

    # Skeleton state (M1): `app.main` registers only `/health` and `/ready`, so the
    # `/v1/*` payloads cannot reach any handler and both POSTs 404. Asserting the
    # status keeps this test non-vacuous today: it fails loudly if a route is added
    # without this test being upgraded.
    # M5 obligation: when `/v1/*` lands (TMU-ML-*), replace these 404 assertions
    # with the authenticated happy path (bearer token from env, assert 2xx) so the
    # payload actually flows through a handler and the privacy claim stays real.
    assert embed_response.status_code == 404
    assert image_response.status_code == 404

    captured = capsys.readouterr()
    streams = {
        "caplog.text": caplog.text,
        "stdout": captured.out,
        "stderr": captured.err,
    }
    for stream_name, stream in streams.items():
        assert SENTINEL_TEXT not in stream, f"text payload leaked into {stream_name}"
        assert SENTINEL_IMAGE_URL not in stream, f"imageUrl payload leaked into {stream_name}"