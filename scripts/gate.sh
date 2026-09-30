#!/usr/bin/env bash
# Quality gate (Blueprint §7.4). Usage: scripts/gate.sh [quick|full]
set -euo pipefail
MODE="${1:-quick}"
step() { echo -e "\n> $*"; }

step "lane check";            bash scripts/check-lane.sh
step "format";                pnpm -s format:check
step "lint";                  pnpm -s lint
step "typecheck";             pnpm -s typecheck
step "i18n keys";             pnpm -s i18n:check
step "unit tests";            pnpm -s test:unit
step "contracts in sync";     pnpm -s contracts:check
step "openapi lint";          pnpm -s contracts:lint
step "migrations check";      pnpm -s db:check
if [ -f services/ml/pyproject.toml ]; then
  step "ml lint+tests";       (cd services/ml && uv run ruff check . && uv run pytest -q -m "not slow")
fi
if [ "$MODE" = "full" ]; then
  step "breaking changes";    pnpm -s contracts:breaking
  step "build";               pnpm -s build
  step "integration";         pnpm -s test:integration
  step "contract fuzz";       pnpm -s test:contract
  step "e2e";                 pnpm -s test:e2e
  step "secret scan";         gitleaks detect --no-banner
  step "dependency audit";    pnpm -s run audit
fi
echo -e "\nOK gate($MODE) passed"
