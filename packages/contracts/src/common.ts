// Shared API primitives (Blueprint §5A.4): ids, timestamps, error envelope, pagination,
// system responses and meta schemas.
import { z } from "zod";
import {
  Campus,
  Category,
  Custody,
  MatchBand,
  MatchState,
  ReportStatus,
  ReportType,
  UploadStatus,
  UserRole,
  UserStatus,
} from "./enums.ts";

export const Uuid = z.string().uuid();
export const IsoDateTime = z.string().datetime({ offset: true });

export const ErrorEnvelope = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
    requestId: z.string(),
  }),
});

export const PageMeta = z.object({
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export const paged = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: z.array(item), page: PageMeta });

export const HealthResponse = z.object({ status: z.literal("ok") });

export const ReadyResponse = z.object({
  db: z.enum(["ok", "degraded", "down"]),
  storage: z.enum(["ok", "degraded", "down"]),
  ml: z.enum(["ok", "degraded", "down"]),
});

export const CategoryMeta = z.object({
  value: Category,
  labelKey: z.string(),
  isSensitive: z.boolean(),
  hintPrompts: z.array(z.string()),
});

export const CampusMeta = z.object({
  id: Campus,
  name: z.string(),
  locationCount: z.number().int().nonnegative().optional(),
});

export const LocationMeta = z.object({
  id: Uuid,
  campus: Campus,
  name: z.string(),
  building: z.string().optional(),
  note: z.string().optional(),
});

export const DropPointMeta = z.object({
  id: Uuid,
  campus: Campus,
  name: z.string(),
  locationId: Uuid.optional(),
  hours: z.string().optional(),
  contactNote: z.string().optional(),
  active: z.boolean(),
});

export const Me = z.object({
  id: Uuid,
  email: z.string().email(),
  displayName: z.string(),
  role: UserRole,
  status: UserStatus,
  locale: z.string(),
  moderatorCampus: Campus.optional(),
  createdAt: IsoDateTime,
});

export const MeUpdate = z.object({
  displayName: z.string().min(2).max(100).optional(),
  locale: z.string().min(2).max(5).optional(),
});

export const AccountDeletionResponse = z.object({
  scheduledAt: IsoDateTime,
});

export const NotificationPrefs = z.object({
  emailEnabled: z.boolean(),
  mutedTypes: z.array(z.string()),
});

export const UploadInitRequest = z.object({
  mime: z.string(),
  sizeBytes: z.number().int().positive(),
  sha256: z.string().optional(),
});

export const UploadInitResponse = z.object({
  uploadId: Uuid,
  uploadUrl: z.string().url(),
  expiresAt: IsoDateTime,
});

export const UploadState = z.object({
  id: Uuid,
  status: UploadStatus,
  mime: z.string().optional(),
  sizeBytes: z.number().int().optional(),
  thumbUrl: z.string().url().nullable().optional(),
  maskedUrl: z.string().url().nullable().optional(),
  createdAt: IsoDateTime.optional(),
});

export const ReportLocationInput = z.object({
  campus: Campus,
  locationId: Uuid.optional(),
  note: z.string().optional(),
});

export const OccurredAtWindow = z.object({
  from: IsoDateTime,
  to: IsoDateTime.optional(),
});

export const VerificationHintInput = z.object({
  prompt: z.string().min(3).max(200),
  answer: z.string().min(1).max(200),
});

export const ReportCreate = z.object({
  type: ReportType,
  category: Category,
  title: z.string().min(3).max(80),
  description: z.string().min(10).max(1000),
  colors: z.array(z.string()).default([]),
  brand: z.string().optional(),
  imageIds: z.array(Uuid).default([]),
  location: ReportLocationInput,
  occurredAt: OccurredAtWindow,
  custody: Custody.optional(),
  dropPointId: Uuid.optional(),
  hints: z.array(VerificationHintInput).optional(),
});

export const ReportImage = z.object({
  id: Uuid,
  url: z.string().url().nullable(),
  thumbUrl: z.string().url().nullable().optional(),
  isMasked: z.boolean().default(false),
});

export const ReportPublic = z.object({
  id: Uuid,
  type: ReportType,
  status: ReportStatus,
  category: Category,
  isSensitive: z.boolean(),
  title: z.string(),
  description: z.string(),
  colors: z.array(z.string()),
  brand: z.string().optional(),
  images: z.array(ReportImage),
  campus: Campus,
  locationName: z.string().optional(),
  occurredAt: OccurredAtWindow,
  custody: Custody.optional(),
  dropPointName: z.string().optional(),
  createdAt: IsoDateTime,
});

export const ReportOwnerView = ReportPublic.extend({
  version: z.number().int().positive(),
  matchCount: z.number().int().nonnegative().default(0),
  hintPrompts: z.array(z.string()).default([]),
  activeClaimId: Uuid.optional(),
  expiresAt: IsoDateTime,
  resolvedAt: IsoDateTime.optional(),
});

export const ReportModeratorView = ReportOwnerView.extend({
  reporterId: Uuid,
  reporterEmail: z.string().email(),
  flagCount: z.number().int().nonnegative().default(0),
});

export const ReportUpdate = z.object({
  title: z.string().min(3).max(80).optional(),
  description: z.string().min(10).max(1000).optional(),
  colors: z.array(z.string()).optional(),
  brand: z.string().optional(),
  imageIds: z.array(Uuid).optional(),
  location: ReportLocationInput.optional(),
  occurredAt: OccurredAtWindow.optional(),
});

export const ReportCancelRequest = z.object({
  reason: z.string().optional(),
});

export const ReportFlagRequest = z.object({
  reason: z.string(),
  note: z.string().optional(),
});

export const ReportFlagResponse = z.object({
  status: z.literal("ok"),
});

export const SearchFilters = z.object({
  campus: z.array(Campus).optional(),
  category: z.array(Category).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  custody: Custody.optional(),
  type: ReportType.optional(),
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
});

export const SearchRequest = z.object({
  q: z.string().max(120).optional(),
  imageUploadId: Uuid.optional(),
  filters: SearchFilters.optional(),
});

export const MatchReason = z.object({
  code: z.string(),
  labelKey: z.string(),
});

export const SearchHit = ReportPublic.extend({
  band: MatchBand.optional(),
  reasons: z.array(MatchReason).optional(),
});

export const MatchView = z.object({
  id: Uuid,
  state: MatchState,
  band: MatchBand,
  reasons: z.array(MatchReason),
  other: ReportPublic,
  createdAt: IsoDateTime,
});

export const RematchResponse = z.object({
  enqueued: z.boolean(),
});

export const ActionStatusResponse = z.object({
  status: z.literal("ok"),
});
