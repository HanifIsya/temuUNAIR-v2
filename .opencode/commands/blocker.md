---
description: Create a blocker file and mark the current task BLOCKED
agent: orchestrator
---
Blocker: $ARGUMENTS

1. Determine the next `BLK-###` id.
2. Create `docs/08-project/blockers/BLK-###.md` from the template
   (`docs/05-workflow/11-blockers-and-escalation.md`): class, blocking scope, task, question,
   options, recommended default, evidence.
3. Set the current task's `status: BLOCKED` and note the blocker in its Progress log.
4. If the blocker needs a contract change, also create the `TMU-CTR-*` task and add it to the
   task's `deps`.
5. Report the blocker path and what the human must decide.
