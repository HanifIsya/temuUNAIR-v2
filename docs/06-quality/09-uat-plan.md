---
id: UAT
title: UAT plan
status: draft
owner: QA
updated: 2026-09-29
depends_on: ["RESEARCH", "METRICS", "E2E"]
source_refs: ["Blueprint §4.7"]
---

# UAT plan (M9)

## Objectives

1. Validate that real civitas akademika can complete the core journeys without help.
2. Measure usability (SUS) and task success against `METRICS` targets.
3. Collect qualitative feedback for the course report and post-launch backlog.

## Participants

| Group | Count | Recruitment |
|---|---|---|
| Students who lost something | 3–4 | campus mailing list / class groups |
| Students who found something | 2–3 | campus mailing list |
| Moderator/admin (staff or volunteer) | 1–2 | project contacts |

Inclusion: owns a smartphone, has used any lost-and-found channel before. Consent recorded;
no real item data created during tests (use the seeded demo data).

## Environment

- Staging deployment with seeded demo data and `ML_MODE=stub` for determinism.
- Test devices: participants' own phones (primary) + one desktop session for admin tasks.
- Recording: screen + think-aloud audio (consent required; deleted after analysis; never
  committed).

## Tasks

| # | Task | Success criterion | Links |
|---|---|---|---|
| T1 | Report a lost backpack with a photo | Completed < 90 s, no help | E2E-02 |
| T2 | Report a found wallet with 2 verification questions | Completed; hints never visible publicly | E2E-03, E2E-10 |
| T3 | Find the found backpack via browse and text search | Finds it in ≤ 3 interactions | E2E-05 |
| T4 | Explain why a match was suggested | Reads reasons correctly | E2E-04 |
| T5 | Claim an item by answering questions | Reaches SUBMITTED | E2E-06 |
| T6 | As finder: compare answers and approve | Approves the right claimant | E2E-06 |
| T7 | Plan and confirm a handover | Both confirm; status RETURNED | E2E-09 |
| T8 | Switch language and confirm persistence | Preference persists | E2E-15 |
| T9 | As moderator: clear one flagged report | Correct action + reason | E2E-11 |

## Measures

| Measure | Target |
|---|---|
| Task success without help | ≥ 80% |
| Median time T1 | < 90 s |
| SUS score | ≥ 68 |
| Critical usability issues | 0 open at launch |
| Privacy comprehension ("who can see my answers?") | 100% correct |

## Session script

1. Welcome, consent, device check (5 min).
2. Think-aloud warm-up (2 min).
3. Tasks T1–T8 (30–40 min), moderator tasks T9 in a separate session.
4. Debrief: likes, frustrations, trust in AI suggestions, privacy comfort (10 min).
5. SUS questionnaire (5 min).

## Analysis and outputs

- `docs/06-quality/09-uat-plan.md` gains a results section: per-task success, timings, SUS,
  quotes (anonymized), and a prioritized issue list.
- Issues become tasks (`TMU-QA-*`/lane tasks) with severity; launch-blocking issues must be
  fixed before the release tag.
- Findings feed `docs/01-product/11-success-metrics.md` and the course report.

## Ethics

- Consent form explains recording and data use; participants may withdraw anytime.
- No real personal data enters the system during tests.
- Compensation policy: `OPEN` (snacks/vouchers TBD).

## Schedule

| When | Activity |
|---|---|
| M8 | Pilot with 1 participant (dry run, fix logistics) |
| M9 week 1 | Full sessions |
| M9 week 2 | Analysis, fixes, results written |
