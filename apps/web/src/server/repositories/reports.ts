// apps/web/src/server/repositories/reports.ts
// Drizzle implementation of ReportsRepository (SQL lives only here): browse
// keyset pagination (BE-01 row-value comparison), detail joins for location /
// drop point names, and the atomic create transaction (report + encrypted
// hints + upload attachment).

import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, ne, or, sql } from "drizzle-orm";
import {
  claims,
  dropPoints,
  flags,
  locations,
  matches,
  reports,
  reportImages,
  users,
  verificationHints,
} from "@temuunair/db/src/schema";
import type { Db } from "../db";
import {
  ACTIVE_INTENT_STATUSES,
  BROWSE_VISIBLE_STATUSES,
  type CreateReportRecord,
  type ReportImageRow,
  type ReportRowView,
  type ReportsRepository,
  type ResolvedBrowseFilters,
} from "../services/reports";

function toRowView(row: Record<string, unknown>): ReportRowView {
  return {
    id: row.id as string,
    type: row.type as ReportRowView["type"],
    status: row.status as ReportRowView["status"],
    reporterId: row.reporterId as string,
    category: row.category as string,
    isSensitive: row.isSensitive as boolean,
    title: row.title as string,
    description: row.description as string,
    colors: (row.colors as string[]) ?? [],
    brand: (row.brand as string | null) ?? null,
    campus: row.campus as ReportRowView["campus"],
    locationId: (row.locationId as string | null) ?? null,
    locationNote: (row.locationNote as string | null) ?? null,
    occurredFrom: row.occurredFrom as Date,
    occurredTo: (row.occurredTo as Date | null) ?? null,
    custody: (row.custody as ReportRowView["custody"]) ?? null,
    dropPointId: (row.dropPointId as string | null) ?? null,
    expiresAt: row.expiresAt as Date,
    resolvedAt: (row.resolvedAt as Date | null) ?? null,
    version: (row.version as number) ?? 1,
    createdAt: row.createdAt as Date,
    locationName: (row.locationName as string | null) ?? null,
    dropPointName: (row.dropPointName as string | null) ?? null,
  };
}

export class PgReportsRepository implements ReportsRepository {
  constructor(private readonly db: Db) {}

  async findActiveIntentType(userId: string): Promise<"LOST" | "FOUND" | null> {
    const rows = await this.db
      .select({ type: reports.type })
      .from(reports)
      .where(and(eq(reports.reporterId, userId), inArray(reports.status, ACTIVE_INTENT_STATUSES)))
      .orderBy(desc(reports.createdAt))
      .limit(1);
    return rows[0]?.type ?? null;
  }

  async listReports(filters: ResolvedBrowseFilters, viewerId: string): Promise<ReportRowView[]> {
    const conditions = [
      ne(reports.reporterId, viewerId),
      inArray(reports.status, BROWSE_VISIBLE_STATUSES),
      eq(reports.type, filters.type),
    ];
    if (filters.campus.length > 0) {
      conditions.push(inArray(reports.campus, filters.campus));
    }
    if (filters.category.length > 0) {
      conditions.push(inArray(reports.category, filters.category));
    }
    if (filters.custody) {
      conditions.push(eq(reports.custody, filters.custody));
    }
    if (filters.dateTo) {
      conditions.push(sql`${reports.occurredFrom} <= ${filters.dateTo}`);
    }
    if (filters.dateFrom) {
      conditions.push(
        or(
          and(
            sql`${reports.occurredTo} IS NULL`,
            sql`${reports.occurredFrom} >= ${filters.dateFrom}`,
          ),
          sql`${reports.occurredTo} >= ${filters.dateFrom}`,
        )!,
      );
    }
    if (filters.cursor) {
      conditions.push(
        sql`(${reports.createdAt}, ${reports.id}) < (${filters.cursor.createdAt}, ${filters.cursor.id})`,
      );
    }

    const rows = await this.db
      .select({
        id: reports.id,
        type: reports.type,
        status: reports.status,
        reporterId: reports.reporterId,
        category: reports.category,
        isSensitive: reports.isSensitive,
        title: reports.title,
        description: reports.description,
        colors: reports.colors,
        brand: reports.brand,
        campus: reports.campus,
        locationId: reports.locationId,
        locationNote: reports.locationNote,
        occurredFrom: reports.occurredFrom,
        occurredTo: reports.occurredTo,
        custody: reports.custody,
        dropPointId: reports.dropPointId,
        expiresAt: reports.expiresAt,
        resolvedAt: reports.resolvedAt,
        version: reports.version,
        createdAt: reports.createdAt,
        locationName: locations.name,
        dropPointName: dropPoints.name,
      })
      .from(reports)
      .leftJoin(locations, eq(reports.locationId, locations.id))
      .leftJoin(dropPoints, eq(reports.dropPointId, dropPoints.id))
      .where(and(...conditions))
      .orderBy(desc(reports.createdAt), desc(reports.id))
      .limit(filters.limit + 1);
    return rows.map((row) => toRowView(row as Record<string, unknown>));
  }

  async listImagesForReports(reportIds: string[]): Promise<Map<string, ReportImageRow[]>> {
    const grouped = new Map<string, ReportImageRow[]>();
    if (reportIds.length === 0) return grouped;
    const rows = await this.db
      .select({
        id: reportImages.id,
        reportId: reportImages.reportId,
        storageKey: reportImages.storageKey,
        thumbKey: reportImages.thumbKey,
        maskedKey: reportImages.maskedKey,
        position: reportImages.position,
      })
      .from(reportImages)
      .where(inArray(reportImages.reportId, reportIds))
      .orderBy(asc(reportImages.position));
    for (const row of rows) {
      if (!row.reportId) continue;
      const list = grouped.get(row.reportId) ?? [];
      list.push({
        id: row.id,
        storageKey: row.storageKey,
        thumbKey: row.thumbKey,
        maskedKey: row.maskedKey,
        position: row.position,
      });
      grouped.set(row.reportId, list);
    }
    return grouped;
  }

  async getReport(id: string): Promise<ReportRowView | null> {
    const rows = await this.db
      .select({
        id: reports.id,
        type: reports.type,
        status: reports.status,
        reporterId: reports.reporterId,
        category: reports.category,
        isSensitive: reports.isSensitive,
        title: reports.title,
        description: reports.description,
        colors: reports.colors,
        brand: reports.brand,
        campus: reports.campus,
        locationId: reports.locationId,
        locationNote: reports.locationNote,
        occurredFrom: reports.occurredFrom,
        occurredTo: reports.occurredTo,
        custody: reports.custody,
        dropPointId: reports.dropPointId,
        expiresAt: reports.expiresAt,
        resolvedAt: reports.resolvedAt,
        version: reports.version,
        createdAt: reports.createdAt,
        locationName: locations.name,
        dropPointName: dropPoints.name,
      })
      .from(reports)
      .leftJoin(locations, eq(reports.locationId, locations.id))
      .leftJoin(dropPoints, eq(reports.dropPointId, dropPoints.id))
      .where(eq(reports.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return toRowView(row as Record<string, unknown>);
  }

  async getImages(reportId: string): Promise<ReportImageRow[]> {
    const rows = await this.db
      .select({
        id: reportImages.id,
        storageKey: reportImages.storageKey,
        thumbKey: reportImages.thumbKey,
        maskedKey: reportImages.maskedKey,
        position: reportImages.position,
      })
      .from(reportImages)
      .where(eq(reportImages.reportId, reportId))
      .orderBy(asc(reportImages.position));
    return rows;
  }

  async getHintPrompts(reportId: string): Promise<string[]> {
    const rows = await this.db
      .select({ prompt: verificationHints.prompt })
      .from(verificationHints)
      .where(eq(verificationHints.reportId, reportId))
      .orderBy(asc(verificationHints.prompt));
    return rows.map((row) => row.prompt);
  }

  async getMatchCount(reportId: string): Promise<number> {
    const rows = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(matches)
      .where(or(eq(matches.lostReportId, reportId), eq(matches.foundReportId, reportId)));
    return rows[0]?.n ?? 0;
  }

  async getActiveClaimId(reportId: string): Promise<string | null> {
    const rows = await this.db
      .select({ id: claims.id })
      .from(claims)
      .where(and(eq(claims.foundReportId, reportId), eq(claims.status, "APPROVED")))
      .limit(1);
    return rows[0]?.id ?? null;
  }

  async getFlagCount(reportId: string): Promise<number> {
    const rows = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(flags)
      .where(and(eq(flags.reportId, reportId), eq(flags.status, "OPEN")));
    return rows[0]?.n ?? 0;
  }

  async getReporterEmail(reporterId: string): Promise<string | null> {
    const rows = await this.db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, reporterId))
      .limit(1);
    return rows[0]?.email ?? null;
  }

  async findAttachableImages(
    userId: string,
    imageIds: string[],
  ): Promise<Array<{ id: string; uploaderId: string; status: string; reportId: string | null }>> {
    const rows = await this.db
      .select({
        id: reportImages.id,
        uploaderId: reportImages.uploaderId,
        status: reportImages.status,
        reportId: reportImages.reportId,
      })
      .from(reportImages)
      .where(inArray(reportImages.id, imageIds));
    return rows.filter((row) => row.uploaderId === userId);
  }

  async locationExists(locationId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: locations.id })
      .from(locations)
      .where(eq(locations.id, locationId))
      .limit(1);
    return rows.length > 0;
  }

  async dropPointExists(dropPointId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: dropPoints.id })
      .from(dropPoints)
      .where(and(eq(dropPoints.id, dropPointId), eq(dropPoints.active, true)))
      .limit(1);
    return rows.length > 0;
  }

  async createReport(
    record: CreateReportRecord,
    hints: Array<{ prompt: string; answerEnc: Buffer }>,
    imageIds: string[],
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(reports).values({
        id: record.id,
        type: record.type,
        status: "OPEN",
        reporterId: record.reporterId,
        category: record.category,
        isSensitive: record.isSensitive,
        title: record.title,
        description: record.description,
        colors: record.colors,
        brand: record.brand,
        campus: record.campus,
        locationId: record.locationId,
        locationNote: record.locationNote,
        occurredFrom: record.occurredFrom,
        occurredTo: record.occurredTo,
        custody: record.custody,
        dropPointId: record.dropPointId,
        expiresAt: record.expiresAt,
        createdAt: record.createdAt,
        updatedAt: record.createdAt,
      });
      if (hints.length > 0) {
        await tx.insert(verificationHints).values(
          hints.map((hint) => ({
            id: randomUUID(),
            reportId: record.id,
            prompt: hint.prompt,
            answerEnc: hint.answerEnc,
          })),
        );
      }
      for (const [index, imageId] of imageIds.entries()) {
        await tx
          .update(reportImages)
          .set({ reportId: record.id, position: index })
          .where(eq(reportImages.id, imageId));
      }
    });
  }
}
