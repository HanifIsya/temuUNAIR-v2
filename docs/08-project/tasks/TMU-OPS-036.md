---
id: TMU-OPS-036
title: Lane map — grant be lane access to tests/contract/** (BLK-003 option 2)
status: DONE
lane: ops
slug: lane-map-contract-tests
milestone: M3
priority: P1
owner: ops-dev
deps: []
refs: [BLK-003, WF-LANES, TMU-BE-008]
created: 2026-10-04
updated: 2026-10-04
---

# TMU-OPS-036 — Lane map: grant be lane access to `tests/contract/**`

## Goal

Execute option 2 of BLK-003: add `"tests/contract/**"` to the `be` lane in
`.agent/lanes.json` (WF-LANES: lane-map edits are ops-only) so future backend tasks may
edit the Schemathesis contract runner (`tests/contract/run-contract.mjs`) without a
DoR #6 failure. `qa` keeps owning `tests/**` — lanes are additive, so the runner stays
in qa ownership too. Complements the option-1 split already executed (TMU-BE-008
trimmed, TMU-QA-001 filed).

## Acceptance criteria

- [x] `.agent/lanes.json` `be` array contains `"tests/contract/**"`.
- [x] `scripts/check-lane.sh` green on the ops branch; `pnpm gate` green.

## Files expected to change

- `.agent/lanes.json`
- `docs/08-project/blockers/BLK-003.md` (close)
- `docs/08-project/tasks/TMU-OPS-036.md`, `docs/08-project/reviews/TMU-OPS-036.md`
- `docs/08-project/backlog.md`, `docs/08-project/status.md`

## Progress log

| Time | Agent | Step | Evidence |
|---|---|---|---|
| 2026-10-04 | backend-dev | 1 PICK | branch `agent/ops/TMU-OPS-036-lane-map-contract-tests` from `main` (`1245da6`); raised by BLK-003 option 2 on human instruction |
| 2026-10-04 | backend-dev | 5 GREEN | `.agent/lanes.json`: `"tests/contract/**"` added to `be` (additive — `qa` keeps `tests/**`); BLK-003 closed with both resolutions |
| 2026-10-04 | backend-dev | 7 GATE | `bash scripts/check-lane.sh` → exit 0; `pnpm gate` → `OK gate(quick) passed` |
| 2026-10-04 | reviewer | 9 REVIEW c1 | verdict **`APPROVE`** → `docs/08-project/reviews/TMU-OPS-036.md` |
| 2026-10-04 | backend-dev | 10 SHIP | task flipped to DONE; squash-merged to `main` |

## Evidence

- Lane diff: `be` = `[apps/web/src/server/**, apps/web/src/app/api/**, apps/web/package.json, apps/worker/**, tests/contract/**, **/*.test.ts]`
- `scripts/check-lane.sh` exit 0; `pnpm gate` → `OK gate(quick) passed`
- Review: cycle 1 **`APPROVE`** → `docs/08-project/reviews/TMU-OPS-036.md`
- PR: (local merge per environment rules)
