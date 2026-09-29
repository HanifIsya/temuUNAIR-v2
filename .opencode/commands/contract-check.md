---
description: Check contracts are in sync, lint clean and non-breaking
agent: architect
---
Run and explain:

!`pnpm contracts:check 2>&1`
!`pnpm contracts:lint 2>&1`

Then, if this branch is not `main`:
!`pnpm contracts:breaking 2>&1`

Report: drift (generated files stale), lint findings, and breaking changes with the required
actions (label `breaking`, major `CONTRACT_VERSION` bump, ADR, CHANGELOG entry).
