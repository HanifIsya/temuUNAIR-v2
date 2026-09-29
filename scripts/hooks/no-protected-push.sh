#!/usr/bin/env bash
# Pre-push guard (Blueprint §7.9).
# 1. Refuses pushes targeting main / release branches.
# 2. Refuses pushes to any remote other than the canonical TemuUNAIR-v2 repo
#    (all pushes must go to github.com/HanifIsya/temuUNAIR-v2 using the HanifIsya account).
set -euo pipefail

EXPECTED_REMOTE="github.com/HanifIsya/temuUNAIR-v2"

REMOTE_NAME="${1:-origin}"
REMOTE_URL="$(git remote get-url "$REMOTE_NAME" 2>/dev/null || true)"
if [[ "$REMOTE_URL" != *"$EXPECTED_REMOTE"* ]]; then
  echo "BLOCKED: push target '$REMOTE_NAME' ($REMOTE_URL) is not the canonical repo $EXPECTED_REMOTE" >&2
  exit 1
fi

while read -r local_ref local_sha remote_ref remote_sha; do
  case "$remote_ref" in
    refs/heads/main|refs/heads/release/*)
      echo "BLOCKED: direct push to protected branch $remote_ref" >&2
      exit 1
      ;;
  esac
done
exit 0
