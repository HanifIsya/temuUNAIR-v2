---
id: CMP
title: Component inventory
status: draft
owner: SW
updated: 2026-09-29
depends_on: ["TOKENS", "FE-03", "WIREFRAMES"]
source_refs: ["Blueprint §5B.3"]
---

# Component inventory

Canonical contract for every UI component. The props/events/states columns here are the source
for `docs/04-contracts/frontend/FE-03-component-contract.md`. IDs `CMP-###` are stable.

## Layout & shell

| CMP | Component | Props (essentials) | Emits | Variants / states |
|---|---|---|---|---|
| 001 | `AppShell` | `user: Me`, `children`, `variant: "app"\|"public"\|"admin"` | — | top nav desktop / bottom nav mobile / admin sidebar; skip-link |
| 002 | `NotificationBell` | `count: number` | `onOpen` | 0 / 1-9 / 9+ states; polling |
| 003 | `LocaleSwitcher` | `locale: "id"\|"en"` | `onChange` | inline / menu; persists via `PATCH /me` |
| 027 | `EmptyState` | `titleKey`, `descKey`, `action?` | — | illustration + CTA |
| 027b | `ErrorState` | `error: ApiError`, `onRetry` | `onRetry` | shows copyable `requestId` |
| 028 | `Skeletons` | `variant` | — | card / list / table / detail |
| 029 | `ConfirmDialog` | `titleKey`, `bodyKey`, `tone`, `requireTyped?` | `onConfirm`, `onCancel` | focus trap, ESC closes |
| 031 | `SafetyTipBanner` | `context: "handover"\|"claim"\|"report"` | — | dismissible per session |
| 036 | `ToastProvider` | — | — | success / error (requestId copyable) |

## Reporting

| CMP | Component | Props (essentials) | Emits | Variants / states |
|---|---|---|---|---|
| 004 | `ReportCard` | `report: ReportPublic\|ReportOwnerView`, `variant: "browse"\|"mine"\|"compact"` | `onOpen` | masked badge, status badge, skeleton |
| 005 | `ReportGrid` | `items`, `isLoading`, `hasMore`, `emptyState` | `onLoadMore` | 2-col mobile / 4-col desktop; explicit load-more button |
| 006 | `ReportFilterBar` | `value: ReportQuery`, `campuses`, `categories` | `onChange`, `onReset` | sheet (mobile) / panel (desktop); active-count badge |
| 007 | `StatusBadge` | `status: ReportStatus\|ClaimStatus` | — | icon + text + colour; never colour-only |
| 008 | `StatusStepper` | `steps`, `current` | — | dibuat → cocok → verifikasi → dikembalikan |
| 009 | `WizardShell` | `steps`, `current`, `canProceed` | `onNext`, `onBack`, `onSaveDraft` | focus to step heading; draft indicator |
| 010 | `CategoryPicker` | `value`, `options: CategoryMeta[]` | `onChange` | icon grid; sensitive notice inline |
| 011 | `PhotoUploader` | `value: UploadState[]`, `max=5`, `required` | `onChange`, `onError` | idle → uploading(%) → processing → ready/rejected; camera capture; keyboard button |
| 012 | `ImageGallery` | `images`, `allowZoom` | — | masked = non-zoomable, no download |
| 013 | `LocationPicker` | `value: LocationInput`, `campuses`, `locations`, `allowGeo` | `onChange` | campus → building/room; optional map pin + "pilih dari daftar" alternative |
| 014 | `DateTimeRangePicker` | `value: OccurredAt`, `mode: "window"\|"point"` | `onChange` | WIB; quick chips (Hari ini, Kemarin) |
| 015 | `VerificationHintsEditor` | `value`, `min`, `max=3`, `sensitive` | `onChange` | prompt suggestions; warning "jangan tampilkan jawaban di foto" |
| 016 | `SensitiveNotice` | `category` | — | explains masking + drop-point advice |
| 030 | `FlagDialog` | `reportId` | `onDone` | reasons from `FlagReason`; note optional |

## Matching

| CMP | Component | Props | Emits | Variants / states |
|---|---|---|---|---|
| 017 | `MatchCard` | `match: MatchView` | `onDismiss`, `onClaim`, `onOpen` | band + reasons, no raw score; dismissed animation |
| 018 | `MatchBandBadge` / `ReasonChips` | `band` / `reasons` | — | i18n via `labelKey` |

## Claims, chat, handover

| CMP | Component | Props | Emits | Variants / states |
|---|---|---|---|---|
| 019 | `ChallengeForm` | `items`, `isSubmitting` | `onSubmit` | one input per hint; remaining attempts |
| 020 | `ClaimCard` | `claim: ClaimView`, `perspective` | `onOpen` | claimant / finder; unread dot |
| 021 | `AnswerCompare` | `answers`, `perspective` | — | finder/moderator see expected; claimant does not |
| 022 | `ClaimTimeline` | `claim` | — | created → decision → handover → confirmations |
| 023 | `ChatThread` | `claimId`, `messages`, `hasOlder` | `onLoadOlder` | `aria-live="polite"`; day separators; safety banner |
| 024 | `ChatComposer` | `disabled`, `maxLength=1000` | `onSend` | Enter=send, Shift+Enter=newline; disabled on closed claim |
| 025 | `HandoverPanel` | `claim`, `canEdit` | `onSavePlan`, `onConfirm` | drop-point suggestions; two-sided confirmation states |
| 026 | `NotificationItem` | `notification` | `onOpen`, `onMarkRead` | deep-links by type; unread dot + text |
| 032 | `DropPointCard` | `dropPoint` | — | hours, campus, map link (external) |

## Admin

| CMP | Component | Props | Emits | Variants / states |
|---|---|---|---|---|
| 033 | `AdminTable<T>` | `columns`, `rows`, `page` | `onRowAction`, `onSort` | keyboard navigable; sticky header |
| 034 | `ModerationDrawer` | `report: ReportModeratorView` | `onApprove`, `onRemove` | flags, hint-answer disclosure, history |
| 035 | `StatCard` | `labelKey`, `value`, `delta?` | — | sign + text for delta |

## Rules

1. Every component lists **all** states from `FE-06` and has the `data-testid`s from `FE-12`.
2. Props use types from `@temuunair/contracts` — never local re-declarations of enums.
3. Components never call APIs directly; data comes via hooks in `apps/web/src/features/*`.
4. No raw hex/px: only tokens (`FE-07`).
5. No nested interactive elements: cards expose exactly one link/button surface plus explicit
   secondary buttons with distinct accessible names.
