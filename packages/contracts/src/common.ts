// Shared API primitives (Blueprint §5A.4): ids, timestamps, error envelope, pagination,
// system responses and meta schemas.
import { z } from "zod";
import { Campus, Category, UploadStatus, UserRole, UserStatus } from "./enums.ts";

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
