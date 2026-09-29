---
name: write-doc
description: Quality bar and structure for creating any documentation-manifest file (front-matter, IDs, grammar, traceability).
---

1. Find the doc's row in `docs/00-BLUEPRINT.md` §4 — it lists the required sections.
2. Front-matter is mandatory:

```yaml
---
id: DOC-ID
title: …
status: draft          # draft | review | approved | superseded
owner: SW|AR|BE|FE|ML|QA|SR|OR|DK|GS
updated: YYYY-MM-DD
depends_on: [DOC-ID, …]
source_refs: ["proposal.pdf §…", "DEC-###", "ADR-####", "Blueprint §…"]
---
```

3. Stable IDs: `US-###`, `FR-<MOD>-###`, `NFR-###`, `SCR-###`, `CMP-###`, `API-<GRP>-##`,
   `DB-###`, `ADR-####`, `TC-###`, `E2E-##`, `RISK-###`, `DEC-###`, `TMU-<LANE>-###`.
4. Requirements use "The system shall …", MoSCoW priority, Gherkin acceptance criteria.
5. Docs in English; user-facing copy in Bahasa Indonesia (`id-ID`) with an English mirror.
6. Never invent UNAIR facts (domains, drop points, policies) — mark `OPEN QUESTION` and record a
   DEC/blocker instead.
7. Keep the traceability matrix updated (`G → US → FR → SCR → API → TC → TMU`).
