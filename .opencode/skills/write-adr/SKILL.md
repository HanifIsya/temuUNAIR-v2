---
name: write-adr
description: Recording an architecture decision. Use when a non-obvious choice is made (technology, algorithm, licence, process).
---

1. Determine the next `ADR-####` id (never reuse or renumber).
2. Create `docs/03-architecture/adr/ADR-####-<slug>.md`:

```markdown
---
id: ADR-####
title: …
status: proposed | accepted | superseded
owner: AR
updated: YYYY-MM-DD
depends_on: [DOC-ID]
source_refs: [DEC-###, "Blueprint §…"]
---

# ADR-#### — <title>

## Context
## Options
1. … (with trade-offs)
2. …
## Decision
## Consequences
- positive
- negative / risks / mitigations
- when to revisit
```

3. Link the DEC ids it implements or changes; note if it supersedes another ADR.
4. Add the row to `docs/03-architecture/adr/README.md` and `docs/08-project/decisions-log.md`.
5. If it affects a contract/schema, create the corresponding `TMU-CTR-*` task.
6. Human gate for auth, privacy, matching thresholds or hosting decisions.
