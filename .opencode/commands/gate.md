---
description: Run the quality gate and summarise failures
---
Run `pnpm gate$ARGUMENTS` (use `full` for the complete gate). If it fails:
1. Report the failing step, the first error, and an error signature (tool + rule/test + file).
2. Suggest the root-cause fix — do not apply it unless asked.
3. Count attempts: the same signature 3 times means a blocker is required
   (`docs/05-workflow/11-blockers-and-escalation.md`).
