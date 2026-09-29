---
id: RESEARCH
title: User research and usability plan
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["PERSONAS", "US", "METRICS"]
source_refs: ["Blueprint §4.2"]
---

# User research plan

Two activities: **discovery interviews** (before/early M4) and **usability tests** (M8–M9).
Everything uses real civitas akademika participants recruited on campus; consent is recorded;
no personal data from sessions is committed to the repo.

## 1. Discovery interviews (5–8 participants)

Goal: validate the pain statements in `03-personas.md` and the wizard assumptions.

### Screener

- Lost or found an item on campus in the last 12 months?
- Mix: ≥2 who lost, ≥2 who found, ≥1 who never used a lost-and-found channel.

### Script (30 min, semi-structured)

1. Ceritakan kejadian terakhir kamu kehilangan/menemukan barang di kampus. Apa yang kamu lakukan pertama kali?
2. Ke mana kamu mencari/melapor? Apa yang paling menyulitkan?
3. Kalau ada yang menemukan barangmu, apa yang bikin kamu yakin itu benar barangmu?
4. Kalau kamu yang menemukan, apa yang bikin kamu ragu menyerahkan ke orang yang mengaku pemiliknya?
5. Seberapa nyaman kamu bertemu langsung? Di mana?
6. Bagaimana perasaanmu kalau barang sensitif (KTM, kartu ATM) difoto dan dipasang publik?
7. Kalau layanan ini ada, fitur mana yang paling kamu butuhkan duluan?

### Outputs

- Updated persona pains; candidate microcopy; a list of "must not do" findings (privacy).
- Written into `docs/01-product/03-personas.md` (spec-writer) and design docs.

## 2. Usability tests (5–8 participants, M9)

### Tasks (think-aloud, mobile first)

| # | Task | Success criterion | Links |
|---|---|---|---|
| T1 | Report a lost backpack with a photo | Completed < 90 s, no help | E2E-02, FR-REP-001 |
| T2 | Report a found wallet and write 2 verification questions | Completed; hints never visible on public view | E2E-03, E2E-10 |
| T3 | Find the found backpack by browsing and text search | Finds it ≤ 3 interactions | E2E-05 |
| T4 | Open the suggested match and explain why it was suggested | Reads reasons correctly | E2E-04 |
| T5 | Claim an item by answering the questions | Reaches SUBMITTED | E2E-06 |
| T6 | As finder: compare answers and approve | Approves the right claimant | E2E-06 |
| T7 | Plan and confirm a handover | Both confirm; status becomes RETURNED | E2E-09 |
| T8 | Switch language to English and back | Preference persists | E2E-15 |

### Measures

- Task success rate (target ≥ 80% without help), time on task, error count, SUS score
  (target ≥ 68), and verbatim quotes for the report.

## 3. Ethics and data handling

- Written/verbal consent; participants may stop anytime.
- No recording committed to git; notes anonymized (P1, P2…).
- No real photos of participants' belongings in the repo; use synthetic fixtures.
- If a participant shares a real lost item, do not create a real report during the test —
  use the seeded demo data.

## 4. Cadence

| When | Activity | Owner |
|---|---|---|
| M3–M4 | 5 discovery interviews | SW + team |
| M5 | Quick feedback on match reasons with 3 users | ML + SW |
| M8 | Accessibility session (keyboard + screen reader) | QA |
| M9 | Full usability test + SUS; results in `09-uat-plan.md` report | QA |

## 5. Open questions

- `OPEN`: participant compensation policy (snacks/vouchers) and budget.
- `OPEN`: permission to recruit via campus mailing lists.
