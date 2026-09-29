---
name: write-gherkin
description: Deriving Gherkin acceptance criteria and test cases from user stories and functional requirements.
---

1. For each FR, write scenarios with the minimum needed for confidence:

```gherkin
Scenario: <observable outcome>
  Given <precondition with concrete data>
  When <single action>
  Then <observable result>
  And <side effect that must hold>
```

2. Rules:
   - one behaviour per scenario; no "and also" scenarios;
   - concrete values (`ID_CARD`, 3 hints, 72 h), not "some" / "valid";
   - always include the edge cases named in `docs/01-product/07-acceptance-criteria.md`:
     duplicate reports, expired, suspended, two claimants, stale version, quota limits;
   - assert privacy outcomes explicitly (masked photo, no hint answer, no email leak);
   - state the expected error `code` for failure paths.
3. Map each scenario to a test path:
   - unit/route → `tests/<area>/<file>.spec.ts`
   - component → `apps/web/src/**/<Component>.test.tsx`
   - E2E → the `E2E-##` id when it is a full journey.
4. Record the mapping in `docs/06-quality/02-test-cases/TC-<MOD>-###.md` and update the
   traceability matrix (`FR → TC`).
5. Keep scenarios implementation-agnostic: no CSS selectors, no internal function names.
