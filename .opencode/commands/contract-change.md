---
description: Start a TMU-CTR contract-change task from a description
agent: architect
---
Requested change: $ARGUMENTS

Follow skill `contract-change`:

1. Confirm the change is not already covered by a merged contract (if it is, stop — it is a
   feature task, not a contract change).
2. Determine the next `TMU-CTR-###` id and create `docs/08-project/tasks/TMU-CTR-###-<slug>.md`
   from the task template (lane `contracts`, milestone per the roadmap).
3. List the exact schemas/registry entries/docs to change and the semver impact
   (additive = minor; rename/removal/semantic = major + ADR).
4. Do not implement yet: report the task id, the plan, and the review requirements (both BE and
   FE reviewers).
