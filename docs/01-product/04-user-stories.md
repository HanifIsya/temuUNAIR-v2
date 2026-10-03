---
id: US
title: User stories
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["PRD", "PERSONAS"]
source_refs: ["proposal.pdf §C.2 Fitur 1–4 (via docs/_source/proposal-extract.md)", "Blueprint §4.2"]
---

# User stories

Grammar: **As a** <persona> **I want** <capability> **so that** <benefit>. Priority is MoSCoW.
Each story links to functional requirements (`FR-*`) and its acceptance criteria
(`07-acceptance-criteria.md`).

## AUTH — identity

| ID | Story | Priority | FRs |
|---|---|---|---|
| US-001 | As a `P-LOSER` I want to sign in with my UNAIR Google account so that I do not manage another password | Must | FR-AUTH-001, FR-AUTH-002 |
| US-002 | As a `P-ADMIN` I want non-UNAIR accounts rejected so that the platform stays campus-only | Must | FR-AUTH-003 |
| US-003 | As a `P-LOSER` I want to set my language and notification preferences so that the service fits me | Should | FR-AUTH-004, FR-NTF-006 |
| US-004 | As a `P-LOSER` I want to delete my account and data so that I control my privacy | Must | FR-AUTH-005 |

## REPORT — reporting (PDF Fitur 1)

| ID | Story | Priority | FRs |
|---|---|---|---|
| US-010 | As a `P-LOSER` I want to report a lost item in under a minute so that I can do it between classes | Must | FR-REP-001, FR-REP-002 |
| US-011 | As a `P-FINDER` I want to report a found item with a photo and where it is now so that the owner can find it | Must | FR-REP-001, FR-REP-003, FR-REP-004 |
| US-012 | As a `P-FINDER` I want to write private verification questions so that only the real owner can claim the item | Must | FR-REP-005 |
| US-013 | As a `P-LOSER` I want photos optional so that a report is still possible without them | Must | FR-REP-006 |
| US-014 | As a reporter I want to edit, cancel or renew my report so that it stays accurate | Must | FR-REP-007, FR-REP-008, FR-REP-011 |
| US-015 | As a `P-LOSER` I want sensitive items (KTM, ATM card) to be masked publicly so that my identity is not exposed | Must | FR-REP-009 |
| US-016 | As any user I want to flag an inappropriate report so that moderators can act | Should | FR-REP-010 |

## SEARCH + MATCH — discovery and AI (PDF Fitur 2)

| ID | Story | Priority | FRs |
|---|---|---|---|
| US-020 | As a `P-LOSER` I want to browse found items with filters so that I can look myself | Must | FR-SRC-001, FR-SRC-002 |
| US-021 | As a `P-LOSER` I want to search by description text so that I find similar items | Must | FR-SRC-003, FR-SRC-005, FR-SRC-006 |
| US-022 | As a `P-LOSER` I want to search by photo so that I can find items that look like mine | Should | FR-SRC-004, FR-SRC-005, FR-SRC-006 |
| US-023 | As a report owner I want the system to suggest likely matches with reasons so that I do not have to search manually | Must | FR-MAT-001, FR-MAT-002, FR-MAT-006, FR-MAT-007 |
| US-024 | As a report owner I want to dismiss a wrong suggestion so that it stops bothering me | Must | FR-MAT-003 |
| US-025 | As a `P-FINDER` I want to invite a lost-item owner when I think I have their item so that we connect | Should | FR-MAT-004 |
| US-026 | As a report owner I want to trigger a re-check after editing so that new information is used | Should | FR-MAT-005 |

## CLAIM + CHAT + HANDOVER — verification and return (PDF Fitur 3)

| ID | Story | Priority | FRs |
|---|---|---|---|
| US-030 | As a `P-LOSER` I want to answer the finder's private questions so that I can prove ownership | Must | FR-CLM-001, FR-CLM-006, FR-CLM-007, FR-CLM-008 |
| US-031 | As a `P-FINDER` I want to see the claimant's answers next to mine so that I can decide | Must | FR-CLM-002 |
| US-032 | As a `P-FINDER` I want to approve or reject with a reason so that the claimant knows the outcome | Must | FR-CLM-003 |
| US-033 | As a claimant I want to chat with the finder inside the platform so that I do not share my phone number | Must | FR-CHT-001, FR-CHT-002, FR-CHT-003, FR-CHT-004 |
| US-034 | As either party I want to plan a safe handover (place, time) so that we meet with clear expectations | Must | FR-HND-001, FR-HND-003 |
| US-035 | As either party I want to confirm the handover so that the case is marked returned | Must | FR-HND-002, FR-CLM-009 |
| US-036 | As either party I want to raise a dispute so that a moderator resolves it | Must | FR-CLM-004 |
| US-037 | As a claimant I want to cancel my claim so that I can withdraw | Should | FR-CLM-005 |

## NOTIFICATION (PDF Cara Kerja 5)

| ID | Story | Priority | FRs |
|---|---|---|---|
| US-040 | As a report owner I want to be notified when a likely match appears so that I can act quickly | Must | FR-NTF-001 |
| US-041 | As a finder I want to be notified when someone claims my found report so that I can review it | Must | FR-NTF-002 |
| US-042 | As a user I want to control which notifications I receive by email so that I am not spammed | Should | FR-NTF-006 |
| US-043 | As a report owner I want a warning before my report expires so that I can renew it | Should | FR-NTF-004 |
| US-044 | As a claimant or finder I want to be notified when the counterpart sends a chat message so that I do not miss updates | Must | FR-NTF-003 |
| US-045 | As a user I want to see my unread notification count and mark notifications as read so that my inbox stays organized | Must | FR-NTF-005, FR-NTF-007 |

## MANAGE + ADMIN (PDF Fitur 4)

| ID | Story | Priority | FRs |
|---|---|---|---|
| US-050 | As a reporter I want to see all my reports by status so that I know what is active | Must | FR-MGT-001, FR-MGT-002 |
| US-051 | As a `P-ADMIN` I want a moderation queue with flags so that I can act on bad content | Must | FR-ADM-001, FR-ADM-007, FR-ADM-009 |
| US-052 | As a `P-ADMIN` I want to resolve disputed claims with a note so that there is a record | Must | FR-ADM-002 |
| US-053 | As a `P-ADMIN` I want to suspend abusive users so that the service stays safe | Must | FR-ADM-003 |
| US-054 | As a `P-ADMIN` I want to manage locations and drop points so that reporting matches reality | Should | FR-ADM-004 |
| US-055 | As an admin I want an audit log so that every privileged action is traceable | Must | FR-ADM-005 |
| US-056 | As an admin I want usage statistics so that we can report success metrics | Should | FR-ADM-006 |
| US-057 | As an admin I want to trigger a matching reindex when algorithms or categories update so that matches stay fresh | Must | FR-ADM-008 |

## I18N

| ID | Story | Priority | FRs |
|---|---|---|---|
| US-060 | As a user I want the interface in Bahasa Indonesia by default with an English option so that I understand it | Must | FR-I18N-001, FR-I18N-002, FR-I18N-003 |
