// apps/web/src/server/repositories/me.ts
// Drizzle implementation of MeRepository (SQL lives only here, BE-03 conventions).

import { randomUUID } from "node:crypto";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { auditLogs, notificationPrefs, sessions, users } from "@temuunair/db/src/schema";
import { DomainError, ErrorCode } from "../errors";
import type { Db } from "../db";
import type { AuditEntry, MeRepository, PrefsRow, UserRow } from "../services/me";

const DELETION_ACTION = "user.deletion.requested";

type SessionUserRow = UserRow & { sessionExpires: Date };

export class PgMeRepository implements MeRepository {
  constructor(private readonly db: Db) {}

  async findSessionUser(token: string, now: Date): Promise<SessionUserRow | null> {
    const rows = await this.db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        unairRef: users.unairRef,
        role: users.role,
        moderatorCampus: users.moderatorCampus,
        locale: users.locale,
        status: users.status,
        createdAt: users.createdAt,
        sessionExpires: sessions.expires,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.sessionToken, token), gt(sessions.expires, now)))
      .limit(1);
    return (rows[0] as SessionUserRow | undefined) ?? null;
  }

  async extendSession(token: string, newExpires: Date): Promise<void> {
    await this.db
      .update(sessions)
      .set({ expires: newExpires })
      .where(eq(sessions.sessionToken, token));
  }

  async getUserById(id: string): Promise<UserRow | null> {
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return (rows[0] as UserRow | undefined) ?? null;
  }

  async updateProfile(
    id: string,
    patch: { displayName?: string; locale?: string },
    now: Date,
  ): Promise<UserRow> {
    const rows = await this.db
      .update(users)
      .set({ ...patch, updatedAt: now })
      .where(eq(users.id, id))
      .returning();
    const row = rows[0];
    if (!row) {
      throw new DomainError(ErrorCode.NOT_FOUND, "User not found");
    }
    return row as UserRow;
  }

  async getPrefs(userId: string): Promise<PrefsRow | null> {
    const rows = await this.db
      .select()
      .from(notificationPrefs)
      .where(eq(notificationPrefs.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  }

  async upsertPrefs(
    userId: string,
    prefs: { emailEnabled: boolean; mutedTypes: string[] },
  ): Promise<PrefsRow> {
    const rows = await this.db
      .insert(notificationPrefs)
      .values({ userId, ...prefs })
      .onConflictDoUpdate({
        target: notificationPrefs.userId,
        set: { emailEnabled: prefs.emailEnabled, mutedTypes: prefs.mutedTypes },
      })
      .returning();
    const row = rows[0];
    if (!row) {
      throw new DomainError(ErrorCode.INTERNAL, "Failed to store preferences");
    }
    return row;
  }

  async insertAudit(entry: AuditEntry): Promise<void> {
    await this.db.insert(auditLogs).values({
      id: entry.id ?? randomUUID(),
      actorId: entry.actorId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      before: entry.before ?? null,
      after: entry.after ?? null,
      requestId: entry.requestId ?? null,
    });
  }

  /** Latest audited deletion request that references a pg-boss job id. */
  async findDeletionRequest(userId: string): Promise<{ jobId: string; scheduledAt: Date } | null> {
    const rows = await this.db
      .select({ after: auditLogs.after })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.entityId, userId),
          eq(auditLogs.action, DELETION_ACTION),
          sql`${auditLogs.after} ->> 'jobId' IS NOT NULL`,
        ),
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(1);
    const after = rows[0]?.after as { jobId?: unknown; scheduledAt?: unknown } | null | undefined;
    if (!after || typeof after.jobId !== "string" || typeof after.scheduledAt !== "string") {
      return null;
    }
    return { jobId: after.jobId, scheduledAt: new Date(after.scheduledAt) };
  }
}
