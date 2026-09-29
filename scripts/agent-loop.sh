#!/usr/bin/env bash
# Unattended headless loop (Blueprint §7.7 B). Only run after the loop has proven reliable.
# Usage: LANE=be MAX_TASKS=3 scripts/agent-loop.sh
# Verify flags with `opencode run --help` for your installed version.
set -uo pipefail
LANE="${LANE:-}"; MAX_TASKS="${MAX_TASKS:-3}"; SLEEP="${SLEEP:-10}"
mkdir -p .agent/logs ../wt

for i in $(seq 1 "$MAX_TASKS"); do
  [ -f .agent/STOP ] && { echo "STOP file present - halting"; exit 0; }
  git fetch origin --quiet

  # any open blocker => human needed
  if grep -lq "^status: open" docs/08-project/blockers/*.md 2>/dev/null; then
    echo "Open blocker(s) - human needed"; exit 2
  fi

  TASK="$(node scripts/next-task.mjs ${LANE:+--lane "$LANE"})" || { echo "No runnable task"; exit 0; }
  L="$(node scripts/next-task.mjs --show "$TASK" --field lane)"
  SLUG="$(node scripts/next-task.mjs --show "$TASK" --field slug)"
  BR="agent/$L/$TASK-$SLUG"; WT="../wt/$TASK"

  git worktree add "$WT" -b "$BR" origin/main || exit 1
  LOG="$(pwd)/.agent/logs/$TASK-$(date +%Y%m%d-%H%M%S).log"
  (
    cd "$WT" && pnpm i --frozen-lockfile --silent &&
    opencode run --agent orchestrator \
      "Execute task $TASK following docs/05-workflow/02-agent-loop.md steps 1-11. Stop after the PR is ready and CI is green, or after writing a blocker." \
      2>&1 | tee "$LOG"
  )
  rc=$?   # pipefail is inherited, so this reflects opencode's exit code
  [ "$rc" -ne 0 ] && { echo "opencode exited with $rc - halting"; exit "$rc"; }
  sleep "$SLEEP"
done
