---
id: FE-03
title: Component contract
status: draft
owner: AR
updated: 2026-09-29
depends_on: ["CMP", "FE-02", "FE-12"]
source_refs: ["Blueprint §5B.3"]
---

# FE-03 — Component contract

Props use types imported from `@temuunair/contracts`. Every component lists loading / empty /
error variants and carries the `data-testid`s from `FE-12`. The inventory source is
`docs/02-design/08-component-inventory.md`.

| CMP | Component | Props (essentials) | Emits | Notes / variants |
|---|---|---|---|---|
| 001 | `AppShell` | `user: Me`, `children`, `variant: "app"\|"public"\|"admin"` | — | top nav (desktop), bottom nav (mobile), skip-link |
| 002 | `NotificationBell` | `count: number` | `onOpen` | polls unread count |
| 003 | `LocaleSwitcher` | `locale: "id"\|"en"` | `onChange` | persists to `PATCH /me` |
| 004 | `ReportCard` | `report: ReportPublic\|ReportOwnerView`, `variant: "browse"\|"mine"\|"compact"` | `onOpen` | masked image + "sensitive" badge; status badge on `mine` |
| 005 | `ReportGrid` | `items`, `isLoading`, `hasMore`, `emptyState` | `onLoadMore` | infinite scroll with explicit "Muat lebih banyak" button |
| 006 | `ReportFilterBar` | `value: ReportQuery`, `campuses`, `categories` | `onChange`, `onReset` | syncs with URL |
| 007 | `StatusBadge` | `status: ReportStatus\|ClaimStatus` | — | icon + text, never colour-only |
| 008 | `StatusStepper` | `steps`, `current` | — | mirrors PDF flow: dibuat → cocok → verifikasi → dikembalikan |
| 009 | `WizardShell` | `steps`, `current`, `canProceed` | `onNext`, `onBack`, `onSaveDraft` | focus moves to step heading |
| 010 | `CategoryPicker` | `value`, `options: CategoryMeta[]` | `onChange` | icon grid; shows `SensitiveNotice` for sensitive |
| 011 | `PhotoUploader` | `value: UploadState[]`, `max=5`, `required` | `onChange`, `onError` | idle → uploading(%) → processing → ready / rejected; camera capture on mobile; keyboard-operable button, not drop-zone only |
| 012 | `ImageGallery` | `images`, `allowZoom` | — | masked images non-zoomable |
| 013 | `LocationPicker` | `value: LocationInput`, `campuses`, `locations`, `allowGeo` | `onChange` | campus → building/room; optional map pin (pin icon from logo) + "pilih dari daftar" alternative |
| 014 | `DateTimeRangePicker` | `value: OccurredAt`, `mode: "window"\|"point"` | `onChange` | WIB, quick chips (Hari ini, Kemarin) |
| 015 | `VerificationHintsEditor` | `value`, `min`, `max=3`, `sensitive` | `onChange` | prompt suggestions from `CategoryMeta`; warns "jangan tampilkan jawaban di foto" |
| 016 | `SensitiveNotice` | `category` | — | explains masking + hand-in-to-drop-point advice |
| 017 | `MatchCard` | `match: MatchView` | `onDismiss`, `onClaim`, `onOpen` | shows band + `ReasonChips`, no raw score |
| 018 | `MatchBandBadge` / `ReasonChips` | `band` / `reasons` | — | i18n via `labelKey` |
| 019 | `ChallengeForm` | `items`, `isSubmitting` | `onSubmit` | one input per hint; shows remaining daily claim attempts |
| 020 | `ClaimCard` | `claim: ClaimView`, `perspective` | `onOpen` | |
| 021 | `AnswerCompare` | `answers`, `perspective` | — | finder sees claimant answer next to own expected answer |
| 022 | `ClaimTimeline` | `claim` | — | created → decision → handover → confirmations |
| 023 | `ChatThread` | `claimId`, `messages`, `hasOlder` | `onLoadOlder` | `aria-live="polite"`, day separators, safety banner |
| 024 | `ChatComposer` | `disabled`, `maxLength=1000` | `onSend` | Enter=send, Shift+Enter=newline |
| 025 | `HandoverPanel` | `claim`, `canEdit` | `onSavePlan`, `onConfirm` | suggests drop points; two-sided confirmation state |
| 026 | `NotificationItem` | `notification` | `onOpen`, `onMarkRead` | deep-links by `type` |
| 027 | `EmptyState` / `ErrorState` | `titleKey`, `descKey`, `action?` / `error: ApiError`, `onRetry` | — | `ErrorState` shows `requestId` |
| 028 | `Skeletons` | `variant` | — | one per list/detail |
| 029 | `ConfirmDialog` | `titleKey`, `bodyKey`, `tone`, `requireTyped?` | `onConfirm`, `onCancel` | focus trap, ESC closes |
| 030 | `FlagDialog` | `reportId` | `onDone` | reasons from `FlagReason` |
| 031 | `SafetyTipBanner` | `context` | — | "Bertemu di area kampus yang ramai" |
| 032 | `DropPointCard` | `dropPoint` | — | hours, campus, map link |
| 033 | `AdminTable<T>` | `columns`, `rows`, `page` | `onRowAction`, `onSort` | keyboard-navigable |
| 034 | `ModerationDrawer` | `report: ReportModeratorView` | `onApprove`, `onRemove` | shows flags + hint answers behind disclosure |
| 035 | `StatCard` | `labelKey`, `value`, `delta?` | — | |
| 036 | `ToastProvider` | — | — | errors keep `requestId` copyable |

## Type import rule

```ts
import type { ReportPublic, MatchView, ClaimView, Me } from "@temuunair/contracts";
```

Local re-declarations of enums or response shapes are forbidden (ESLint `no-restricted-imports`
guard on string literals that duplicate contract enums where practical).

## Variant requirements

| Component | Must implement |
|---|---|
| `ReportCard` | browse / mine / compact × (loading, ready, masked, sensitive) |
| `PhotoUploader` | idle, uploading(%), processing, ready, rejected(reason), over-limit, retry |
| `StatusBadge` | every `ReportStatus` and `ClaimStatus` value with icon + text |
| `MatchCard` | suggested, dismissed (exits), claimed (badge), invalidated |
| `HandoverPanel` | none, planned, one-confirmed, both-confirmed |
| `AdminTable` | loading, empty, filtered-empty, error, row-action pending |

## Accessibility hooks

Every interactive element follows `FE-09`; components expose the testids from `FE-12` on the
interactive node (button/input/link), not on wrappers.

## Data access rule

Components never call APIs. Feature hooks in `apps/web/src/features/<area>/use*.ts` wrap the
generated client and TanStack Query; components receive data via props.
