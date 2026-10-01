import { z } from "zod";

const uuidSchema = z.string().uuid();

export const reportProcessPayloadSchema = z.object({
  reportId: uuidSchema,
});

export const reportMatchPayloadSchema = z.object({
  reportId: uuidSchema,
  reason: z.enum(["process", "rematch", "renew", "reindex"]),
});

export const notifySendPayloadSchema = z.object({
  notificationId: uuidSchema,
});

export const emptyPayloadSchema = z.object({});

export const accountDeletePayloadSchema = z.object({
  userId: uuidSchema,
});

export const matchingReindexPayloadSchema = z.object({
  scope: z.enum(["all", "campus", "report"]),
  campus: z.string().optional(),
  reportId: uuidSchema.optional(),
  algoVersion: z.number().int().positive(),
});

export const QUEUES = {
  "report.process": reportProcessPayloadSchema,
  "report.match": reportMatchPayloadSchema,
  "notify.send": notifySendPayloadSchema,
  "report.expire-sweep": emptyPayloadSchema,
  "claim.expire-sweep": emptyPayloadSchema,
  "media.cleanup": emptyPayloadSchema,
  "account.delete": accountDeletePayloadSchema,
  "matching.reindex": matchingReindexPayloadSchema,
} as const;

export type QueueName = keyof typeof QUEUES;

export function parseJobPayload<Q extends QueueName>(
  queue: Q,
  data: unknown,
): z.infer<(typeof QUEUES)[Q]> {
  const schema = QUEUES[queue];
  return schema.parse(data) as z.infer<(typeof QUEUES)[Q]>;
}
