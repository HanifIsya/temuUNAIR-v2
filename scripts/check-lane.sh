#!/usr/bin/env bash
# Fails if the current branch touches paths outside its lane (Blueprint §7.4/§7.5).
set -euo pipefail
BR="$(git branch --show-current)"
[[ "$BR" =~ ^agent/([a-z]+)/(TMU-[A-Z]+-[0-9]+) ]] || { echo "lane check skipped (not an agent branch)"; exit 0; }
LANE="${BASH_REMATCH[1]}"; TASK="${BASH_REMATCH[2]}"
git fetch origin main --quiet
mapfile -t FILES < <(git diff --name-only origin/main...HEAD; git diff --name-only; git diff --name-only --cached)
node -e '
  const lanes = require("./.agent/lanes.json");
  const [lane, task, ...files] = process.argv.slice(1); // task kept for messages
  const globToRe = g => new RegExp("^" + g.replace(/[.+^${}()|[\]\\]/g,"\\$&").replace(/\*\*/g,"::").replace(/\*/g,"[^/]*").replace(/::/g,".*") + "$");
  const allowed = [...(lanes[lane]||[]), ...lanes._common].map(globToRe);
  const bad = [...new Set(files)].filter(f => f && !allowed.some(r => r.test(f)));
  if (bad.length) { console.error("Out-of-lane edits for lane " + lane + ":\n" + bad.join("\n")); process.exit(1); }
' "$LANE" "$TASK" "${FILES[@]:-}"
