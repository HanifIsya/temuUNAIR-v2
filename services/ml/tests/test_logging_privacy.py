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
        client.post("/v1/embed-text", json=_EMBED_TEXT_BODY)
        client.post("/v1/analyze-image", json=_ANALYZE_IMAGE_BODY)

    captured = capsys.readouterr()
    streams = {
        "caplog.text": caplog.text,
        "stdout": captured.out,
        "stderr": captured.err,
    }
    for stream_name, stream in streams.items():
        assert SENTINEL_TEXT not in stream, f"text payload leaked into {stream_name}"
        assert SENTINEL_IMAGE_URL not in stream, f"imageUrl payload leaked into {stream_name}"