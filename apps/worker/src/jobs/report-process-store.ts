// apps/worker/src/jobs/report-process-store.ts
// SQL access for report.process. Raw SQL keeps the worker independent of the
// web app's repository layer (BE-06: the worker owns its own persistence).

import type {
  ImageFeatureWrite,
  ImageRow,
  ReportFeatureWrite,
  ReportProcessStore,
  ReportRow,
  StoredFeatures,
} from "./report-process.js";

export interface ReportProcessPgClient {
  query(text: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

function toReport(row: Record<string, unknown>): ReportRow {
  return row as unknown as ReportRow;
}

/** pgvector accepts JSON-style `[...]` literals; node-pg would quote array elements. */
function vectorParam(values: number[] | null): string | null {
  return values === null ? null : JSON.stringify(values);
}

export function createSqlReportProcessStore(client: ReportProcessPgClient): ReportProcessStore {
  return {
    async loadReport(reportId: string): Promise<ReportRow | null> {
      const { rows } = await client.query(
        `SELECT id, type, status, title, description, brand, colors, category,
                updated_at AS "updatedAt", needs_reprocess AS "needsReprocess"
         FROM reports WHERE id = $1`,
        [reportId],
      );
      const row = rows[0];
      return row ? toReport(row) : null;
    },

    async loadImages(reportId: string): Promise<ImageRow[]> {
      const { rows } = await client.query(
        `SELECT id, storage_key AS "storageKey", status, position
         FROM report_images WHERE report_id = $1
         ORDER BY position, id`,
        [reportId],
      );
      return rows as unknown as ImageRow[];
    },

    async loadFeatures(reportId: string): Promise<StoredFeatures | null> {
      const { rows } = await client.query(
        `SELECT model_versions AS "modelVersions", processed_at AS "processedAt"
         FROM report_features WHERE report_id = $1`,
        [reportId],
      );
      const row = rows[0];
      if (!row) return null;
      return row as unknown as StoredFeatures;
    },

    async markNeedsReprocess(reportId: string): Promise<void> {
      await client.query(`UPDATE reports SET needs_reprocess = true WHERE id = $1`, [reportId]);
    },

    async clearNeedsReprocess(reportId: string): Promise<void> {
      await client.query(`UPDATE reports SET needs_reprocess = false WHERE id = $1`, [reportId]);
    },

    async upsertImageFeature(feature: ImageFeatureWrite): Promise<void> {
      await client.query(
        `INSERT INTO image_features (image_id, embedding, detection, quality, category_scores, model_versions)
         VALUES ($1, $2::vector, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb)
         ON CONFLICT (image_id) DO UPDATE SET
           embedding = EXCLUDED.embedding,
           detection = EXCLUDED.detection,
           quality = EXCLUDED.quality,
           category_scores = EXCLUDED.category_scores,
           model_versions = EXCLUDED.model_versions`,
        [
          feature.imageId,
          vectorParam(feature.embedding),
          feature.detection,
          feature.quality,
          feature.categoryScores,
          feature.modelVersions,
        ],
      );
    },

    async upsertReportFeature(feature: ReportFeatureWrite): Promise<void> {
      await client.query(
        `INSERT INTO report_features (report_id, image_embedding, clip_text_embedding, sentence_embedding, attributes, model_versions, processed_at)
         VALUES ($1, $2::vector, $3::vector, $4::vector, $5::jsonb, $6::jsonb, $7)
         ON CONFLICT (report_id) DO UPDATE SET
           image_embedding = EXCLUDED.image_embedding,
           clip_text_embedding = EXCLUDED.clip_text_embedding,
           sentence_embedding = EXCLUDED.sentence_embedding,
           attributes = EXCLUDED.attributes,
           model_versions = EXCLUDED.model_versions,
           processed_at = EXCLUDED.processed_at`,
        [
          feature.reportId,
          vectorParam(feature.imageEmbedding),
          vectorParam(feature.clipTextEmbedding),
          vectorParam(feature.sentenceEmbedding),
          feature.attributes,
          feature.modelVersions,
          feature.processedAt,
        ],
      );
    },
  };
}
