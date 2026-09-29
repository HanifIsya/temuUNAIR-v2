---
id: SCR-016
title: Legal pages
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["SCR-015", "LEGAL"]
source_refs: ["FE-01", "DEC-017", "13-legal-privacy-drafts.md"]
---

# SCR-016 — Legal pages (`/privacy`, `/terms`)

## Purpose
Publish the privacy notice, terms of service and community guidelines in `id` and `en`, with a
visible "last updated" date and a plain-language summary on top.

## Entry points / exits
Entry: landing footer, settings, sign-up note. Exits: external links to the campus contact.

## Layout regions
1. Header: page title + "Terakhir diperbarui: <date>" + locale switcher.
2. Summary box ("Ringkasan singkat").
3. Full text (rendered from the approved copy in `13-legal-privacy-drafts.md`).
4. Contact block for privacy requests.

## Data
Static MDX content. **Legal review gate:** content may not be published until approved
(L-3 in `13-legal-privacy-drafts.md`).

## Components
Static layout primitives only; no data components.

## States
| Loading | Empty | Error | Forbidden | Offline |
|---|---|---|---|---|
| static | — | — | — | cached by the browser |

## Copy keys
`legal.privacy.title` ("Kebijakan Privasi") · `legal.terms.title` ("Syarat Penggunaan") ·
`legal.updated` ("Terakhir diperbarui") · `legal.summary` · `legal.contact`.

## Analytics
`legal_viewed{page}`.

## Accessibility
- Long documents use real headings (`<h2>`, `<h3>`) and a table of contents with in-page links.
- Line length constrained to ~70 characters for readability.

## Test hooks
`legal-privacy-page`, `legal-terms-page`, `legal-updated-date`.

## Open questions
- `OPEN`: whether `/privacy` needs a downloadable PDF version for the course report appendix.
