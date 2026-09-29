---
id: PERSONAS
title: Personas
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["PRD", "VISION"]
source_refs: ["proposal.pdf §C Target Pengguna (pending extract)", "DEC-006"]
---

# Personas

> The proposal names two target users — **Loser** and **Finder**. The blueprint adds `P-ADMIN`
> because the PDF's "admin verification" feature implies a third actor (DEC-006).

## `P-LOSER` — "I lost it between classes"

| Attribute | Detail |
|---|---|
| Who | Student or staff member, 18–45, smartphone-first, rarely on desktop |
| Context | Between classes, in a hurry, often remembers hours later; may be stressed if item is a KTM/phone |
| Jobs-to-be-done | 1) Report the loss in <60 s without a form marathon. 2) Get told *when* something similar is found. 3) Prove it is mine without publishing private details. 4) Meet safely and get it back. |
| Pains today | WhatsApp groups scroll away; posts on IG are untraceable; people ask for "ciri-cirinya" publicly, exposing details |
| Needs from TemuUNAIR | Fast wizard, optional photos, match notifications, hidden-detail proof, chat inside the app, status visibility |
| Success | Item returned; never had to share a phone number publicly |
| Key screens | `/home`, `/reports/new?type=lost`, `/reports/[id]/matches`, `/claims/[id]` |

## `P-FINDER` — "I found something, now what?"

| Attribute | Detail |
|---|---|
| Who | Student/staff member who picked something up, or security staff at a drop point |
| Context | On the move; may not want to carry the item; wants a quick, low-effort way to do the right thing |
| Jobs-to-be-done | 1) Report the find quickly with a photo. 2) Declare custody (with me / at drop point). 3) Write 1–3 private questions only the true owner can answer. 4) Approve the right person without confrontation. |
| Pains today | No structured way to verify owners; risk of handing an item to the wrong person; strangers messaging privately |
| Needs from TemuUNAIR | Photo-first wizard, custody options, hint editor with suggestions, claimant answers side-by-side with their own, moderator backup for disputes |
| Success | Handed the item to the rightful owner with a record; zero personal exposure |
| Key screens | `/reports/new?type=found`, `/claims` (incoming), `/claims/[id]` |

## `P-ADMIN` — moderator / administrator

| Attribute | Detail |
|---|---|
| Who | Campus admin, security-post coordinator, or student volunteer moderator (per campus) |
| Context | Desktop during office hours; needs to clear a queue quickly |
| Jobs-to-be-done | 1) Verify and moderate reports (approve/remove/restore). 2) Resolve disputed claims with a note. 3) Manage locations and drop points. 4) Suspend abusers. 5) Watch service stats. |
| Pains today | No tooling at all; moderation happens in chat |
| Needs from TemuUNAIR | Moderation queue with flags, dispute view showing both sides, audit trail, campus scoping |
| Success | Empty queue, disputes closed with a documented decision |
| Key screens | `/admin`, `/admin/reports`, `/admin/claims`, `/admin/users`, `/admin/places`, `/admin/audit` |

## Anti-personas (explicitly not designed for)

- **Scrapers/brokers** collecting item photos or owner identities → mitigated by login-only
  browsing (DEC-018), masked photos, no embeddings exposure.
- **Fraudsters** claiming items they do not own → mitigated by hidden-detail challenges,
  claim quotas, 3-rejection limit, moderator arbitration, audit log.
