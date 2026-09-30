// Shared API primitives (Blueprint §5A.4): ids, timestamps, error envelope, pagination,
// system responses and meta schemas.
import { z } from "zod";
import { Campus, Category } from "./enums.ts";

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

export const LocationMeta = z.object({
  id: Uuid,
  campus: Campus,
  name: z.string(),
  building: z.string().optional(),
  note: z.string().optional(),
});
