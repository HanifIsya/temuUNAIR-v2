import { randomBytes, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { MlCallError, STUB_MODEL_VERSIONS, createMlClient } from "../ml/client.js";
import { createSqlReportProcessStore } from "./report-process-store.js";
import { type ProcessJob, type ReportProcessDeps, runReportProcess } from "./report-process.js";

// TMU-BE-007 (red evidence): report.process against a live scratch database —
// features land in image_features/report_features, a double-run exits early
// (BE-07 idempotency rule 1), text changes reprocess, and a dead-lettered run
// sets reports.needs_reprocess while the report stays usable.

const scratchName = `tmu_be007_${Date.now()}_${randomBytes(4).toString("hex")}`;
const U1 = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d7001";
const TITLE = "Dompet kulit hitam";
const DESCRIPTION = "Dompet kulit hitam dengan kartu KTP terlihat di dalamnya.";

interface Recorder {
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
}

function makeLogger(): Recorder {
  return { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

describe.skipIf(!process.env.DATABASE_URL)(
  "TMU-BE-007 report.process on a live scratch database",
  () => {
    const scratchUrl = (() => {
      const url = new URL(process.env.DATABASE_URL ?? "postgres://localhost:1");
      url.pathname = `/${scratchName}`;
      return url.toString();
    })();

    let pool: Pool;

    async function one<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
      const result = await pool.query(sql, params);
      return result.rows[0] as T | undefined;
    }

    async function dbNow(): Promise<Date> {
      const result = await pool.query("SELECT clock_timestamp() AS now");
      return result.rows[0]?.now as Date;
    }

    async function seedReport(
      opts: {
        title?: string;
        description?: string;
        category?: string;
      } = {},
    ): Promise<string> {
      const id = randomUUID();
      await pool.query(
        `INSERT INTO reports (id, type, status, reporter_id, category, is_sensitive, title, description, colors, brand, campus, occurred_from, custody, expires_at, created_at, updated_at)
         VALUES ($1, 'FOUND', 'OPEN', $2, $3, false, $4, $5, '{hitam}', 'TestBrand', 'KAMPUS_A', now() - interval '3 days', 'HELD_BY_FINDER', now() + interval '90 days', now(), now())`,
        [id, U1, opts.category ?? "WALLET", opts.title ?? TITLE, opts.description ?? DESCRIPTION],
      );
      return id;
    }

    async function seedImage(reportId: string, status: string, position: number): Promise<string> {
      const id = randomUUID();
      await pool.query(
        `INSERT INTO report_images (id, report_id, uploader_id, storage_key, thumb_key, masked_key, mime, width, height, status, position)
         VALUES ($1, $2, $3, $4, $5, NULL, 'image/jpeg', 640, 480, $6, $7)`,
        [id, reportId, U1, `uploads/${id}`, `uploads/${id}_thumb.jpg`, status, position],
      );
      return id;
    }

    function depsFor(mlOverrides?: { analyzeImage?: (url: string) => Promise<unknown> }): {
      deps: ReportProcessDeps;
      ml: {
        analyzeImage: ReturnType<typeof vi.fn>;
        embedText: ReturnType<typeof vi.fn>;
        extractAttributes: ReturnType<typeof vi.fn>;
        modelVersions: ReturnType<typeof vi.fn>;
      };
      logger: Recorder;
      enqueueMatch: ReturnType<typeof vi.fn>;
    } {
      const stub = createMlClient({
        mode: "stub",
        serviceUrl: "http://ml.internal:8000",
        token: "dev-ml-token",
        allowedStorageOrigins: ["http://localhost:9000"],
      });
      const ml = {
        analyzeImage: vi.fn((url: string) => stub.analyzeImage(url)),
        embedText: vi.fn((texts: { id: string; text: string }[], locale: "id" | "en") =>
          stub.embedText(texts, locale),
        ),
        extractAttributes: vi.fn(
          (input: { title: string; description: string; locale: "id" | "en" }) =>
            stub.extractAttributes(input),
        ),
        modelVersions: vi.fn(() => stub.modelVersions()),
      };
      if (mlOverrides?.analyzeImage) {
        ml.analyzeImage.mockImplementation(mlOverrides.analyzeImage as typeof ml.analyzeImage);
      }
      const logger = makeLogger();
      const enqueueMatch = vi.fn(async () => undefined);
      const deps: ReportProcessDeps = {
        store: createSqlReportProcessStore(pool),
        ml: ml as unknown as ReportProcessDeps["ml"],
        presignGet: async (key: string) =>
          `http://localhost:9000/temuunair-dev/${key}?X-Amz-Expires=300&X-Amz-Signature=live`,
        logger,
        enqueueMatch,
        now: dbNow,
      };
      return { deps, ml, logger, enqueueMatch };
    }

    function job(reportId: string, overrides?: Partial<ProcessJob>): ProcessJob {
      return {
        id: randomUUID(),
        data: { reportId },
        retryCount: 0,
        retryLimit: 3,
        ...overrides,
      };
    }

    beforeAll(async () => {
      const admin = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
      await admin.query(`CREATE DATABASE ${scratchName}`);
      await admin.end();

      pool = new Pool({ connectionString: scratchUrl, max: 1 });
      await migrate(drizzle(pool), { migrationsFolder: "packages/db/migrations" });

      await pool.query(
        `INSERT INTO users (id, email, display_name, unair_ref, role, moderator_campus, locale, status)
         VALUES ($1, 'worker@test.unair.ac.id', 'Worker W.', NULL, 'USER', NULL, 'id', 'ACTIVE')`,
        [U1],
      );
    }, 180_000);

    afterAll(async () => {
      await pool?.end();
      const admin = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
      try {
        await admin.query(`DROP DATABASE IF EXISTS ${scratchName} WITH (FORCE)`);
      } finally {
        await admin.end();
      }
    }, 60_000);

    it("writes schema-valid image and report features and enqueues report.match", async () => {
      const reportId = await seedReport();
      const img1 = await seedImage(reportId, "READY", 0);
      const img2 = await seedImage(reportId, "READY", 1);
      await seedImage(reportId, "REJECTED", 2);

      const { deps, ml, enqueueMatch } = depsFor();
      const outcome = await runReportProcess(job(reportId), deps);
      expect(outcome).toBe("processed");
      expect(ml.analyzeImage).toHaveBeenCalledTimes(2);
      expect(enqueueMatch).toHaveBeenCalledWith(reportId);

      const images = await pool.query(
        `SELECT image_id, embedding::text AS embedding, model_versions
         FROM image_features WHERE image_id = ANY($1) ORDER BY image_id`,
        [[img1, img2]],
      );
      expect(images.rows).toHaveLength(2);
      for (const row of images.rows) {
        const embedding = JSON.parse(String(row.embedding)) as number[];
        expect(embedding).toHaveLength(512);
        expect(row.model_versions).toMatchObject(STUB_MODEL_VERSIONS);
      }

      const feature = await one<{
        clip: string;
        sentence: string;
        image: string | null;
        attributes: Record<string, unknown>;
        modelVersions: Record<string, string>;
        processedAt: Date;
      }>(
        `SELECT clip_text_embedding::text AS clip, sentence_embedding::text AS sentence,
                image_embedding::text AS image, attributes, model_versions AS "modelVersions",
                processed_at AS "processedAt"
         FROM report_features WHERE report_id = $1`,
        [reportId],
      );
      expect(feature).toBeDefined();
      expect(JSON.parse(String(feature?.clip))).toHaveLength(512);
      expect(JSON.parse(String(feature?.sentence))).toHaveLength(384);
      expect(JSON.parse(String(feature?.image))).toHaveLength(512);
      expect(feature?.attributes).toBeTypeOf("object");
      expect(feature?.modelVersions).toEqual(STUB_MODEL_VERSIONS);
      expect(feature?.processedAt).toBeInstanceOf(Date);

      const report = await one<{ status: string; needs_reprocess: boolean }>(
        `SELECT status, needs_reprocess FROM reports WHERE id = $1`,
        [reportId],
      );
      expect(report).toMatchObject({ status: "OPEN", needs_reprocess: false });
    }, 30_000);

    it("exits early on a double-run without calling ML again (BE-07 idempotency)", async () => {
      const reportId = await seedReport({ title: "Koper biru besar" });
      await seedImage(reportId, "READY", 0);

      const first = depsFor();
      await expect(runReportProcess(job(reportId), first.deps)).resolves.toBe("processed");
      expect(first.ml.analyzeImage).toHaveBeenCalledTimes(1);

      const second = depsFor();
      await expect(runReportProcess(job(reportId), second.deps)).resolves.toBe("early-exit");
      expect(second.ml.analyzeImage).not.toHaveBeenCalled();
      expect(second.ml.embedText).not.toHaveBeenCalled();

      const counts = await one<{ features: string; images: string }>(
        `SELECT (SELECT count(*) FROM report_features WHERE report_id = $1)::text AS features,
                (SELECT count(*) FROM image_features WHERE image_id IN
                   (SELECT id FROM report_images WHERE report_id = $1))::text AS images`,
        [reportId],
      );
      expect(counts?.features).toBe("1");
      expect(counts?.images).toBe("1");
    }, 30_000);

    it("reprocesses after the report text changes (updated_at beyond processed_at)", async () => {
      const reportId = await seedReport({ title: "Sepeda gunung" });
      await seedImage(reportId, "READY", 0);

      const first = depsFor();
      await expect(runReportProcess(job(reportId), first.deps)).resolves.toBe("processed");

      await pool.query(
        `UPDATE reports SET title = 'Sepeda gunung merah',
             updated_at = (SELECT processed_at FROM report_features WHERE report_id = $1) + interval '1 second'
         WHERE id = $1`,
        [reportId],
      );

      const second = depsFor();
      await expect(runReportProcess(job(reportId), second.deps)).resolves.toBe("processed");
      expect(second.ml.analyzeImage).toHaveBeenCalledTimes(1);
    }, 30_000);

    it("sets needs_reprocess after retry exhaustion and keeps the report usable", async () => {
      const reportId = await seedReport({ title: "Headset wireless" });
      await seedImage(reportId, "READY", 0);

      const { deps, logger } = depsFor({
        analyzeImage: () =>
          Promise.reject(
            new MlCallError("ml down", { code: "ML_HTTP_503", status: 503, retryable: true }),
          ),
      });

      await expect(
        runReportProcess(job(reportId, { retryCount: 2, retryLimit: 3 }), deps),
      ).rejects.toThrow();

      const report = await one<{ status: string; needs_reprocess: boolean }>(
        `SELECT status, needs_reprocess FROM reports WHERE id = $1`,
        [reportId],
      );
      expect(report).toMatchObject({ status: "OPEN", needs_reprocess: true });

      const deadLetter = logger.error.mock.calls
        .map((call) => call[0] as Record<string, unknown>)
        .find((record) => record.outcome === "dead-letter");
      expect(deadLetter).toMatchObject({ reportId, attempt: 3 });
    }, 30_000);
  },
);
