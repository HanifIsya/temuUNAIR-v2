// apps/web/src/server/services/me.ts
// ME + notification-preference domain logic (API-ME-01..05, FR-AUTH-004 account
// deletion cool-off, FR-AUTH-005 re-login cancels, FR-NTF-006 preferences).

import { z } from "zod";
import { DomainError, ErrorCode } from "../errors";
import { zodToValidationFailed } from "../validation";
import type { DeletionQueue } from "./deletion-queue";

/** FR-AUTH-004: 7 days between the deletion request and the anonymization job. */
export const COOL_OFF_MS = 7 * 24 * 60 * 60 * 1000;

export interface UserRow {
  id: string;
  email: string;
  displayName: string;
  unairRef: string | null;
  role: "USER" | "MODERATOR" | "ADMIN";
  moderatorCampus: string | null;
  locale: string;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: Date;
}

export interface PrefsRow {
  userId: string;
  emailEnabled: boolean;
  mutedTypes: string[];
}

export interface AuditEntry {
  id?: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  requestId?: string | null;
}

export interface Me {
  id: string;
  email: string;
  displayName: string;
  role: UserRow["role"];
  status: UserRow["status"];
  locale: string;
  moderatorCampus?: string;
  createdAt: string;
}

export interface ServiceContext {
  now: Date;
  requestId: string;
}

export interface MeRepository {
  findSessionUser(token: string, now: Date): Promise<(UserRow & { sessionExpires: Date }) | null>;
  extendSession(token: string, newExpires: Date): Promise<void>;
  getUserById(id: string): Promise<UserRow | null>;
  updateProfile(
    id: string,
    patch: { displayName?: string; locale?: string },
    now: Date,
  ): Promise<UserRow>;
  getPrefs(userId: string): Promise<PrefsRow | null>;
  upsertPrefs(
    userId: string,
    prefs: { emailEnabled: boolean; mutedTypes: string[] },
  ): Promise<PrefsRow>;
  insertAudit(entry: AuditEntry): Promise<void>;
  findDeletionRequest(userId: string): Promise<{ jobId: string; scheduledAt: Date } | null>;
}

/** Privacy rule 5: unairRef never leaves the service layer. */
export function toMe(row: UserRow): Me {
  const me: Me = {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    role: row.role,
    status: row.status,
    locale: row.locale,
    createdAt: row.createdAt.toISOString(),
  };
  if (row.moderatorCampus !== null) {
    me.moderatorCampus = row.moderatorCampus;
  }
  return me;
}

const meUpdateSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  locale: z.string().min(2).max(5).optional(),
});

const NOTIFICATION_TYPES = [
  "MATCH_SUGGESTED",
  "MATCH_INVITE",
  "CLAIM_SUBMITTED",
  "CLAIM_APPROVED",
  "CLAIM_REJECTED",
  "CLAIM_REMINDER",
  "MESSAGE_RECEIVED",
  "HANDOVER_PLANNED",
  "HANDOVER_CONFIRMED",
  "REPORT_RETURNED",
  "REPORT_EXPIRING",
  "REPORT_EXPIRED",
  "REPORT_REMOVED",
  "REPORT_APPROVED",
  "ADMIN_DISPUTE",
] as const;

const notificationPrefsSchema = z.object({
  emailEnabled: z.boolean(),
  mutedTypes: z.array(z.enum(NOTIFICATION_TYPES)),
});

export async function getMe(repo: MeRepository, userId: string): Promise<Me> {
  const row = await repo.getUserById(userId);
  if (!row) {
    throw new DomainError(ErrorCode.NOT_FOUND, "User not found");
  }
  return toMe(row);
}

export async function updateMe(
  repo: MeRepository,
  userId: string,
  body: unknown,
  ctx: ServiceContext,
): Promise<Me> {
  const parsed = meUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw zodToValidationFailed(parsed.error);
  }
  const row = await repo.getUserById(userId);
  if (!row) {
    throw new DomainError(ErrorCode.NOT_FOUND, "User not found");
  }
  if (Object.keys(parsed.data).length === 0) {
    return toMe(row);
  }
  const updated = await repo.updateProfile(userId, parsed.data, ctx.now);
  await repo.insertAudit({
    actorId: userId,
    action: "user.profile.updated",
    entityType: "user",
    entityId: userId,
    before: { displayName: row.displayName, locale: row.locale },
    after: parsed.data,
    requestId: ctx.requestId,
  });
  return toMe(updated);
}

/**
 * FR-AUTH-004: schedule the account.delete job 7 days out and audit the request.
 * Idempotent while the job is pending (BE-07: one deletion per user).
 */
export async function requestAccountDeletion(
  repo: MeRepository,
  queue: DeletionQueue,
  userId: string,
  ctx: ServiceContext,
): Promise<{ scheduledAt: string }> {
  const existing = await repo.findDeletionRequest(userId);
  if (existing && (await queue.isPending(existing.jobId))) {
    return { scheduledAt: existing.scheduledAt.toISOString() };
  }
  const runAt = new Date(ctx.now.getTime() + COOL_OFF_MS);
  const jobId = await queue.schedule(userId, runAt);
  const scheduledAt = runAt.toISOString();
  if (jobId !== null) {
    await repo.insertAudit({
      actorId: userId,
      action: "user.deletion.requested",
      entityType: "user",
      entityId: userId,
      after: { jobId, scheduledAt },
      requestId: ctx.requestId,
    });
  }
  return { scheduledAt };
}

/**
 * FR-AUTH-005 / BE-09: re-login within the cool-off cancels the pending job.
 * Returns true when a pending job was actually cancelled.
 */
export async function cancelPendingDeletion(
  repo: MeRepository,
  queue: DeletionQueue,
  userId: string,
): Promise<boolean> {
  const existing = await repo.findDeletionRequest(userId);
  if (!existing) return false;
  if (!(await queue.isPending(existing.jobId))) return false;
  await queue.cancel(existing.jobId);
  await repo.insertAudit({
    actorId: userId,
    action: "user.deletion.cancelled",
    entityType: "user",
    entityId: userId,
    after: { jobId: existing.jobId },
    requestId: null,
  });
  return true;
}

/** API-ME-04: defaults (BE-08) when the user has never written preferences. */
export async function getPrefs(
  repo: MeRepository,
  userId: string,
): Promise<{ emailEnabled: boolean; mutedTypes: string[] }> {
  const row = await repo.getPrefs(userId);
  if (!row) {
    return { emailEnabled: true, mutedTypes: [] };
  }
  return { emailEnabled: row.emailEnabled, mutedTypes: [...row.mutedTypes] };
}

/** API-ME-05: upsert preferences (accepted muted types = NotificationType). */
export async function setPrefs(
  repo: MeRepository,
  userId: string,
  body: unknown,
  ctx: ServiceContext,
): Promise<{ emailEnabled: boolean; mutedTypes: string[] }> {
  const parsed = notificationPrefsSchema.safeParse(body);
  if (!parsed.success) {
    throw zodToValidationFailed(parsed.error);
  }
  const saved = await repo.upsertPrefs(userId, parsed.data);
  await repo.insertAudit({
    actorId: userId,
    action: "user.notification_prefs.updated",
    entityType: "user",
    entityId: userId,
    after: parsed.data,
    requestId: ctx.requestId,
  });
  return { emailEnabled: saved.emailEnabled, mutedTypes: [...saved.mutedTypes] };
}
