---
description: Draft one document from the documentation manifest
agent: spec-writer
---
Document: $ARGUMENTS

1. Find the row in `docs/00-BLUEPRINT.md` §4 for this document; read its "must contain" list.
2. Read the docs it `depends_on` and its `source_refs`.
3. Draft the document with front-matter (id, title, status: draft, owner, updated, depends_on,
   source_refs) and every required section.
4. Use stable IDs, "The system shall…" grammar, MoSCoW priorities and Gherkin where applicable.
5. Mark anything not sourced from the PDF/blueprint as an explicit `OPEN QUESTION` — never
   invent UNAIR facts.
6. Report the path and the list of required sections covered.
