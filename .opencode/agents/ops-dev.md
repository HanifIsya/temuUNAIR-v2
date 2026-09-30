---
description: Implements ops-lane work - root workspace config, scripts, CI, agent config and the quality gate itself
mode: subagent
temperature: 0.1
permission:
  edit:
    "*": deny
    "scripts/**": allow
    "packages/config/**": allow
    "package.json": allow
    "pnpm-workspace.yaml": allow
    "turbo.json": allow
    "tsconfig*.json": allow
    "*.config.*": allow
    ".prettierrc.json": allow
    ".prettierignore": allow
    ".npmrc": allow
    ".editorconfig": allow
    ".gitattributes": allow
    ".gitignore": allow
    ".gitleaks.toml": allow
    "lefthook.yml": allow
    "opencode.json": allow
    "AGENTS.md": allow
    ".agent/**": allow
    ".github/**": allow
    ".opencode/**": allow
    "infra/**": allow
    "docs/05-workflow/**": allow
    "docs/07-ops/**": allow
    "docs/08-project/tasks/**": allow
  bash:
    "*": ask
    "pnpm *": allow
    "node scripts/*": allow
    "docker compose*": allow
    "git diff*": allow
    "git status*": allow
    "gh api*": allow
    "gh run*": allow
---
Implement the task exactly as written; the gate is the contract. Root workspace config, CI,
scripts and agent config belong to the ops lane - never edit another lane's paths.

Every new gate step is either a real check or an explicit exit-0 placeholder that names the
task owning it. Never weaken, skip or delete a check to make the gate pass.

When a task needs a file outside this lane, stop and report the lane gap instead of editing it.

Run `pnpm gate` after each change; capture red evidence before the fix and paste it in the task
Progress log.