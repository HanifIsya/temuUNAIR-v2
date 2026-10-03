---
id: DESIGN-PRINCIPLES
title: Design principles
status: approved
owner: SW
updated: 2026-10-03
depends_on: ["VISION", "PERSONAS", "NFR"]
source_refs: ["Blueprint §4.3", "DEC-008", "DEC-018"]
---

# Design principles

Five principles, in priority order. When they conflict, the lower number wins.

## 1. Trust first

Users hand over personal items and private details. Every screen must answer: *"Is this safe,
and is this the right person?"*

- Verification is a first-class flow, not a checkbox (`AnswerCompare`, hidden-detail challenge).
- Show status honestly: `StatusStepper` mirrors *dibuat → cocok → verifikasi → dikembalikan*.
- AI is a helper: show **reasons**, never raw confidence scores (DEC-012).
- No dark patterns; rejections always carry a reason.

## 2. Speed to report (< 60 s)

The median report must be finishable between classes on a phone.

- Wizard with small steps, sensible defaults, no mandatory photos for LOST.
- Category grid with icons; chips for time ("Hari ini", "Kemarin").
- Draft autosave so a locked phone or lost signal never destroys work.
- Progressive disclosure: hints, custody and advanced fields appear only for FOUND.

## 3. Privacy by default

- Sensitive categories are masked automatically; descriptions are generalized (DEC-014).
- Photos are EXIF-stripped before storage; exact geo is hidden for sensitive items.
- Browsing requires login (DEC-018); chat replaces phone-number exchange (DEC-009).
- Copy never nudges users to share more: no "add your WhatsApp for faster return".

## 4. Mobile-first, campus-real

- Designed at 360 px first; bottom navigation on mobile, top nav on desktop.
- Touch targets ≥ 44 px; one-hand reach for primary actions.
- Works on mid-range Android on campus Wi-Fi; skeletons instead of spinners everywhere.
- Indonesian first (DEC-008): warm, plain language ("Barang kamu hilang?"), no bureaucratic tone.

## 5. Accessible and inclusive

- WCAG 2.2 AA as the floor, not a stretch (`10-accessibility.md`).
- Status is never colour-only; yellow is an accent, never text on white.
- Full keyboard path, screen-reader labels, reduced-motion support.
- Plain Bahasa Indonesia; avoid abbreviations (KTM is explained on first use).

## Applying the principles

| Decision | Winner principle |
|---|---|
| Show a raw match score because it "looks smart" | No — Trust first |
| Require a photo for FOUND but not LOST | Speed (and evidence needs) |
| Show the finder's phone number for convenience | No — Privacy by default |
| Big decorative hero on mobile | No — Speed / Mobile-first |
| Colour-only "green = approved" badge | No — Accessible |
