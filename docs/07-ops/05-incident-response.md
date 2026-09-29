---
id: OPS-INCIDENT
title: Incident response
status: draft
owner: OR
updated: 2026-09-29
depends_on: ["OPS-MONITORING", "THREAT-MODEL", "PRIVACY-RETENTION"]
source_refs: ["Blueprint §4.8"]
---

# Incident response

## Severity levels

| Level | Definition | Examples | Response target |
|---|---|---|---|
| **SEV-1** | Data breach, PII exposure, service fully down | hint answers leaked, DB exposed, auth broken for everyone | acknowledge ≤ 30 min, mitigate ≤ 4 h |
| **SEV-2** | Major feature broken, data integrity risk | uploads failing, claims stuck, matching down for a day | acknowledge ≤ 2 h, mitigate ≤ 24 h |
| **SEV-3** | Degraded or partial | slow endpoints, one campus affected, email delays | next business day |
| **SEV-4** | Cosmetic or single-user | UI glitch, one report stuck | normal backlog |

## First response (any incident)

1. **Stop the bleeding** — rollback, disable the feature flag, revoke a key, or take the service
   read-only. Prefer a reversible action.
2. **Record** — start a timeline in the incident file (`docs/08-project/incidents/INC-###.md`,
   create the folder if needed): time, symptom, action, actor.
3. **Assess PII impact** — which data, whose, how many; this decides notification duties.
4. **Communicate** — SEV-1/2: notify the team channel and the project owner; keep updates
   factual.
5. **Fix forward or rollback** — follow `02-deployment-runbook.md` rollback path.
6. **Verify** — smoke tests + targeted queries (the affected entity state is correct).
7. **Close** — post-mortem within 5 days for SEV-1/2.

## PII-specific steps (SEV-1)

1. Contain: revoke access, delete leaked artifacts, rotate secrets.
2. Determine scope from `audit_logs` and logs (never re-expose data while investigating).
3. Notify affected users (draft in `13-legal-privacy-drafts.md` style) and the DPO/legal contact
   (`OPEN`: contact still unassigned — O-3).
4. Document for UU PDP accountability; keep evidence.
5. Fix the root cause + add a regression test and a checklist item.

## Communication templates

**Internal (team channel)**
```
[SEV-2] Uploads failing since 10:12 WIB.
Impact: new reports cannot attach photos. Existing data safe.
Action: rolled back web to v0.3.1; monitoring.
Next update: 11:00 WIB.
```

**User-facing (in-app banner / email for SEV-1)**
```
Kami menemukan gangguan pada [fitur] pukul [waktu] WIB.
[Data yang terdampak / tidak terdampak]. Kami sudah [tindakan].
Jika kamu punya pertanyaan, hubungi [kontak].
```

## Post-mortem template

```markdown
# INC-### — <title>
- Severity: SEV-x
- Date/time (WIB):
- Duration:
- Impact (users, data):
- Detection (alert? user report?):
## Timeline
- 10:12 — symptom first seen
- 10:15 — action
## Root cause
## What went well / what did not
## Action items
| # | Action | Owner | Task | Due |
```

Post-mortems are blameless; action items become tasks with owners and dates.

## Drills

| Drill | When | Success |
|---|---|---|
| Restore from backup | monthly (M8+) | RTO ≤ 4 h, data verified |
| Rollback deploy | before launch | previous tag serving in ≤ 15 min |
| Secret rotation | quarterly | services healthy after rotation |
| PII exposure tabletop | M8 | team can name the first 5 steps |
