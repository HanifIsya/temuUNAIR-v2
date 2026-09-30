---
id: SEC-REV-TMU-OPS-006
task: TMU-OPS-006
reviewer: security-reviewer
verdict: APPROVE
date: 2026-09-30
---

# TMU-OPS-006 — Security review (ML service skeleton)

## Verdict

**APPROVE.** The diff adds a FastAPI skeleton with only the two contract-public probes
(`/health`, `/ready`), reads `models.lock.json` without logging its contents, adds no secrets, and
pins a fresh, hash-verified dependency tree in `uv.lock`. No BLOCKER or MAJOR security findings.
Four MINOR findings are residual gaps owned by M5 (`TMU-ML-001..`) or the gate/CI parity task
(`TMU-OPS-008`); none blocks this merge. The code reviewer's `TMU-OPS-006.md` (verdict CHANGES,
M1/M2) is independent: this artifact resolves its M2 (missing security review), and its M1 overlaps
my F1 — see the cross-reference at the end.

Reviewed revision: `agent/ml/TMU-OPS-006-ml-service-skeleton` @ `54e6bc1`, diff
`origin/main...HEAD` (8 paths: `services/ml/{README.md,app/__init__.py,app/main.py,pyproject.toml,tests/test_health.py,tests/test_logging_privacy.py,uv.lock}`,
`docs/08-project/tasks/TMU-OPS-006.md`). Read-only review; no product code was changed.

## Scope now vs deferred to M5

| Area | In scope now | Deferred to M5 |
|---|---|---|
| Endpoints | `/health`, `/ready` (public by BE-06) | `/v1/*` with bearer auth, SSRF allowlist, checksum verification |
| Logging/privacy | No payload path exists; lifespan logs counts only | Real request handlers, model loaders, warm-up |
| Dependencies | fastapi/uvicorn + dev tooling, locked | torch/ultralytics/open_clip/sentence-transformers (incl. AGPL RISK-006) |
| Build | hatchling editable install; wheel ships `app` only | Dockerfile, model downloads, `scripts/export_openapi.py` |

## Checks run

- `git diff origin/main...HEAD` (full diff, `--name-status`, `--check` clean); `git log origin/main..HEAD`
  → 2 commits; `models.lock.json` **not touched** by this branch.
- Static read of `services/ml/app/main.py`, `tests/`, `pyproject.toml`, `uv.lock` (406 lines, 25 packages),
  plus the installed tree `services/ml/.venv` (uvicorn 0.54.0, fastapi 0.142.2, starlette 1.7.0,
  pydantic 2.13.5, httpx 0.28.1).
- Secret/PII pattern scans of the full diff and `services/ml/**` (tokens, keys, bearer, passwords,
  private-key markers): **no matches**. `git log --all -S "BEGIN RSA PRIVATE KEY"` → no commits;
  `git log --all -- "*.env"` → only `.env.example` at bootstrap.
- Threat-model cross-check: `docs/03-architecture/14-security-threat-model.md` TB-3 (Worker ↔ ML,
  lines 38-45) and `docs/06-quality/07-security-checklist.md` ML boundary (`:56-62`) and
  dependencies/secrets (`:78-84`).
- **Could not run** (sandbox permission layer denies `uv`, `pytest`, `pnpm gate`, `gitleaks`):
  `uv lock --check`, `uv sync --frozen`, `uv run pytest`, `gitleaks detect`, `pnpm gate`. Lockfile
  integrity and install behaviour below are static analysis; the task file `:98-128` and the CI
  `ml` job (`ci.yml:79-100`) carry the executed evidence.

## Findings

### BLOCKER

None.

### MAJOR

None.

### MINOR

- **F1 — the privacy sentinel test is an app-layer guard only; it bypasses uvicorn, and its
  `/v1/*` POSTs currently 404.** *In scope now: genuine regression guard for the app layer;
  residual server-layer gap owned by M5 (`TMU-ML-001`).*
  Evidence: `tests/test_logging_privacy.py:33-47` captures the right trio — `caplog` at DEBUG plus
  `capsys` stdout/stderr — and `:48-50` asserts both sentinels are absent from all three. The POST
  bodies do reach the ASGI app (so a future middleware/handler that logs bodies at the app layer
  would be caught), but the test drives the app with `TestClient`
  (`test_logging_privacy.py:12,36`), i.e. in-process ASGI — uvicorn's protocol and access logger
  never execute, so `--log-level debug`/custom logging config leakage is untested. Uvicorn's
  defaults are body-free: the access line logs method + path+query only, never the body
  (`uvicorn 0.54.0`, `.venv/Lib/site-packages/uvicorn/protocols/http/h11_impl.py:476-484` and
  `uvicorn/protocols/utils.py:58-61`), and the TRACE message logger masks bodies/headers with
  placeholders (`.venv/.../uvicorn/middleware/message_logger.py:14-19`). Separately, the two
  `POST /v1/*` calls hit routes that do not exist yet (`app/main.py:89,95` are the only routes),
  so no payload-handling code path is exercised, and the test never asserts a status code.
  Recommended fix (owner `ml-dev`, M5 `TMU-ML-001`): add an integration test that boots a real
  `uvicorn.Server` with the production logging config and asserts the sentinels never appear in
  process output, including a sentinel in a query string (the only payload fragment uvicorn can
  echo); when `/v1/*` lands, exercise an authenticated happy path and ensure pydantic v2
  validation-error objects (which normally embed the offending `input`) are never logged —
  FastAPI's default 422 returns `exc.errors()` verbatim
  (`fastapi/exception_handlers.py:20-26`).
- **F2 — no advisory scanning for the Python dependency tree.** *Gap introduced by this task; fix
  belongs to gate/CI parity (`TMU-OPS-008`).*
  Evidence: `scripts/gate.sh:25-26` runs `gitleaks` and `pnpm -s run audit` (npm only);
  `.github/workflows/ci.yml:156-165` is also npm-only and `continue-on-error: true`. The project's
  own checklist requires `pip-audit` (`docs/06-quality/07-security-checklist.md:81`) and NFR-025
  requires known high-severity advisories to be fixed or documented. This branch is the first to add
  Python runtime dependencies, so nothing currently checks fastapi/uvicorn/starlette/pydantic. CVE
  status could not be verified offline and no advisory IDs are asserted here; every resolved
  version is a current release (upload times Jul–Sep 2026, table below), so immediate risk is low.
  Recommended fix (owner `ops`): add `uv export --frozen | pip-audit -r -` (or equivalent) to
  `gate:full` and a non-advisory CI job, mirroring the npm audit path.
- **F3 — the build backend is not covered by `uv.lock`.** *In scope now; M5/ops follow-up.*
  Evidence: `pyproject.toml:19-21` requires `hatchling`, but no `hatchling` entry exists anywhere
  in `uv.lock` (checked across all 25 package entries), so `uv sync --frozen` still fetches an
  unpinned build backend at install time, outside the hash-verified lock. No arbitrary code runs at
  install time beyond the standard hatchling build, and the editable install is a plain path file
  (`services/ml/.venv/Lib/site-packages/_editable_impl_temuunair_ml.pth:1`); this is a
  reproducibility/supply-chain gap, not an exploit.
  Recommended fix (owner `ml-dev`/`ops`): pin the backend or build the wheel once with a pinned
  `uv`/`hatchling` and install with `--no-build-isolation` in the M5 image; use
  `uv sync --no-dev --frozen` for the runtime image.
- **F4 — loose lower bounds (`>=`) with no automated re-lock review.** *Acceptable now because gate
  and CI are frozen; follow-up recommended (`TMU-OPS-008`).*
  Evidence: `pyproject.toml:7-10,13-17` declares only lower bounds; `uv.lock` resolves them (table
  below). Both the gate (`scripts/gate.sh:17`) and CI (`ci.yml:91`) run `uv sync --frozen`, so the
  locked bytes are what execute and hashes are verified on install. The residual risk is a future
  `uv lock` (or dependency bot) silently jumping majors; there is no `.github/dependabot.yml`
  despite `docs/06-quality/07-security-checklist.md:84`.
  Recommended fix (owner `ops`): pin exact versions at M5 or enable Dependabot for `pip` while
  keeping `--frozen` everywhere. Lower bounds may remain for the dev-only group.

Resolved versions observed in `uv.lock` (current releases; no advisory check possible offline):
fastapi 0.142.2, starlette 1.7.0, pydantic 2.13.5 / pydantic-core 2.46.5, uvicorn 0.54.0,
anyio 4.15.1, h11 0.16.0, httpx 0.28.1, idna 3.20, certifi 2026.7.22, click 8.5.0, pytest 9.1.1,
ruff 0.16.9.

### INFO

- **I1 — FastAPI's default docs surfaces are unauthenticated.** `app/main.py:86` constructs
  `FastAPI(...)` without `docs_url`/`openapi_url`/`redoc_url`, so `/docs`, `/redoc`,
  `/openapi.json` and `/docs/oauth2-redirect` exist by default (`fastapi 0.142.2`,
  `.venv/.../fastapi/applications.py:240,440,464,477`; route registration `:1141-1185`). Today they
  expose only the two public probes, so no hardening claim is needed at this milestone.
  **M5 action:** when `/v1/*` lands, disable them (`docs_url=None, redoc_url=None,
  openapi_url=None`) or rely on network isolation — BE-06:13 says "Internal only" and TB-3
  requires "service not publicly exposed" (`14-security-threat-model.md:42`). Owner `ml-dev`.
- **I2 — `/ready` discloses model names/versions/loaded state without auth.** Contract-mandated
  (`BE-06:22`, `app/main.py:95-99`); the payload excludes `sha256`, licence and source
  (`readiness_payload` selects name/version/loaded only, `app/main.py:61-70`). Accepted as-is.
- **I3 — no other authz surface.** Only two routes exist (`app/main.py:89,95`), both public by
  contract. No middleware, no CORS, no custom exception handlers; `debug` is the FastAPI default
  `False` (`.venv/.../fastapi/applications.py:80-91`). No IDOR/authz exposure in scope.
- **I4 — packaging scope is clean; the AGPL model stack is not in this tree yet.** The wheel ships
  only `app` (`pyproject.toml:23-24`); no install-time hooks and no `[project.scripts]`. An sdist
  (no sdist target configured) would additionally carry `tests/`, `README.md` and
  `models.lock.json` — all non-secret; the checksum placeholders are intentional
  (`models.lock.json:2`). Note for M5: `models.lock.json` is not shipped in the wheel, so a
  non-editable install would fail at startup (`app/main.py:24,49`) unless the Dockerfile keeps the
  repo layout. Ultralytics AGPL (RISK-006) is **not** in `uv.lock`; it is already declared and
  flagged in `models.lock.json:10-12` and `docs/07-ops/07-model-management.md:60-68`, to be
  revisited when M5 adds the model packages.

## Secrets and privacy

- **Secrets:** clean. No token/credential/private-key pattern in the diff or `services/ml/**`;
  `models.lock.json` untouched; no `.env` ever committed (only `.env.example` at bootstrap;
  `.gitignore:13-16,18-36`). `ML_SERVICE_TOKEN` appears only as an env-var name in docs, never a
  value. CI `secret-scan` (`ci.yml:147-154`) plus this manual scan cover the branch; local
  `gitleaks` is not installed (pre-existing host gap, TMU-OPS-008).
- **Logging:** `app/main.py:78-82` logs two integers (models registered, checksums pinned) — no
  lockfile contents, no payload. No request-body code path exists in this revision; FastAPI's
  default 404 body does not echo the request. The sentinel test is green (task file `:111-117`) and
  uses synthetic `.invalid` fixtures (`test_logging_privacy.py:16-19`); its blind spots are F1.
- **Uploads/EXIF/presigned URLs/hint answers/rate limits:** not present in this diff (no `/v1/*`,
  no storage, no claims). Deferred by design to M5 / later BE tasks.

## Cross-reference to the code review (`TMU-OPS-006.md`)

- The code reviewer's **M2** (no security-review artifact) is resolved by this file.
- The code reviewer's **M1** (vacuous privacy test) is the same observation as my F1, classified
  MAJOR there because it is the task's only privacy verification and the acceptance criterion
  claims it is "asserted by a test". I support the required fix (assert `404` now with an explicit
  M5 obligation to switch to an authenticated happy path); from a security-risk standpoint there is
  no exploitable defect in the skeleton, which is why my verdict remains APPROVE.
- The code reviewer's **m1** (`all([])` makes `/ready` report `ok` for an empty registry) is a
  readiness-correctness issue, not a security defect in this diff; it should be fixed before M5
  makes `loaded` real.

## DoD checklist (security-relevant rows)

| # | Item | Status | Evidence |
|---|---|---|---|
| 5 | Privacy: no hint answers, emails, embeddings, sensitive URLs logged/returned | Met | `app/main.py:78-82` counts only; no payload handlers; scans clean; F1 is the M5 test-coverage gap |
| 11 | Security review for sensitive tasks | Met | This file; uploads/auth/hint-answer surfaces are out of scope until M5 |
| — | NFR-025 dependencies free of known high advisories or documented | Partial (F2/F4) | Lock is fresh and hash-verified; no Python advisory job exists yet |
| — | Ultralytics AGPL noted (RISK-006) | Met (deferred) | Not in `uv.lock`; declared in `models.lock.json:10-12`; ADR-0009 |

## Notes for the human

- The sandbox denied `uv`, `pytest`, `pnpm gate` and `gitleaks`, so `uv lock --check` was **not**
  executed. Static consistency of `uv.lock` with `pyproject.toml` is exact: `uv.lock:3` mirrors
  `pyproject.toml:6`; the `temuunair-ml` block (`uv.lock:345-372`) mirrors `pyproject.toml:7-17`;
  25 package entries, each with sdist+wheel sha256; the dependency closure is complete
  (fastapi → annotated-doc/opentelemetry-api/pydantic/starlette/typing-extensions/typing-inspection;
  starlette → anyio/typing-extensions; anyio → idna/typing-extensions; uvicorn → click/h11;
  httpx → anyio/certifi/httpcore/idna; pytest → colorama/iniconfig/packaging/pluggy/pygments).
  CI's frozen sync is the remaining end-to-end proof.
- No product code was modified by this review. F1–F4 should be filed as follow-ups
  (M5 `TMU-ML-001..` for F1/F3; `TMU-OPS-008` for F2/F4) per the DoD rule that MINOR findings are
  filed, not silently ignored.
