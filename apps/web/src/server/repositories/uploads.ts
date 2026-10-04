// apps/web/src/server/repositories/uploads.ts
// Drizzle implementation of UploadsRepository. The report_images table doubles
// as the upload-state store: report_id stays NULL until a report attaches the
// image (ARCH-MEDIA, BE-10).

import { eq } from "drizzle-orm";
import { reportImages } from "@temuunair/db/src/schema";
import type { Db } from "../db";
import type { UploadRecord, UploadsRepository } from "../services/uploads";

export class PgUploadsRepository implements UploadsRepository {
  constructor(private readonly db: Db) {}

  async insertPending(input: {
    id: string;
    uploaderId: string;
    storageKey: string;
    mime: string;
    sha256?: string;
  }): Promise<void> {
    await this.db.insert(reportImages).values({
      id: input.id,
      uploaderId: input.uploaderId,
      storageKey: input.storageKey,
      mime: input.mime,
      sha256: input.sha256 ?? null,
      status: "PENDING",
    });
  }

  async findById(id: string): Promise<UploadRecord | null> {
    const rows = await this.db
      .select({
        id: reportImages.id,
        uploaderId: reportImages.uploaderId,
        reportId: reportImages.reportId,
        storageKey: reportImages.storageKey,
        thumbKey: reportImages.thumbKey,
        mime: reportImages.mime,
        sha256: reportImages.sha256,
        status: reportImages.status,
        width: reportImages.width,
        height: reportImages.height,
      })
      .from(reportImages)
      .where(eq(reportImages.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return row as UploadRecord;
  }

  async markRejected(id: string): Promise<void> {
    await this.db.update(reportImages).set({ status: "REJECTED" }).where(eq(reportImages.id, id));
  }

  async markReady(input: {
    id: string;
    storageKey: string;
    thumbKey: string;
    width: number;
    height: number;
  }): Promise<void> {
    await this.db
      .update(reportImages)
      .set({
        status: "READY",
        storageKey: input.storageKey,
        thumbKey: input.thumbKey,
        width: input.width,
        height: input.height,
      })
      .where(eq(reportImages.id, input.id));
  }
}
