// apps/worker/src/jobs/report-process.ts
// report.process handler (BE-07): waits for READY images, runs ML calls
// sequentially, writes image_features/report_features and enqueues report.match.
// Idempotent per BE-07 rule 1 (model_versions + processed_at vs updated_at),
// classifies retryable vs non-retryable failures and flags
// reports.needs_reprocess on dead-letter.

import { z } from "zod";
import { scrubMessage } from "../logging.js";
import type { Attributes, EmbedTextResponse, ImageAnalysis, MlClient } from "../ml/client.js";
import { MlCallError } from "../ml/client.js";
import { reportProcessPayloadSchema } from "../registry.js";

export type ProcessOutcome = "processed" | "early-exit" | "non-retryable" | "not-found";

export interface ProcessJob {
  id: string;
  data: unknown;
  retryCount?: number;
  retryLimit?: number;
}

export type JobFailureKind = "retryable" | "non-retryable";

export class JobFailure extends Error {
  readonly kind: JobFailureKind;
  readonly reason: string;
  readonly code?: string;

  constructor(message: string, kind: JobFailureKind, reason: string, code?: string) {
    super(message);
    this.name = "JobFailure";
    this.kind = kind;
    this.reason = reason;
    this.code = code;
  }
}

export interface ReportRow {
  id: string;
  type: "FOUND" | "LOST";
  status: string;
  title: string;
  description: string;
  brand: string | null;
  colors: string[];
  category: string;
  updatedAt: Date;
  needsReprocess: boolean;
}

export interface ImageRow {
  id: string;
  storageKey: string;
  status: "PENDING" | "READY" | "REJECTED" | string;
  position: number;
}

export interface StoredFeatures {
  modelVersions: Record<string, string>;
  processedAt: Date;
}

const detectionWriteSchema = z.object({
  detections: z.array(
    z.object({
      label: z.string(),
      classId: z.number().int(),
      confidence: z.number().min(0).max(1),
      bbox: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }),
    }),
  ),
  primaryObject: z.unknown(),
});

const qualityWriteSchema = z.object({
  blur: z.number(),
  brightness: z.number(),
  width: z.number().int(),
  height: z.number().int(),
  usable: z.boolean(),
});

export const imageFeatureWriteSchema = z.object({
  imageId: z.string().uuid(),
  embedding: z.array(z.number()).length(512),
  detection: detectionWriteSchema,
  quality: qualityWriteSchema,
  categoryScores: z.record(z.number()),
  modelVersions: z.record(z.string()),
});
export type ImageFeatureWrite = z.infer<typeof imageFeatureWriteSchema>;

export const reportFeatureWriteSchema = z.object({
  reportId: z.string().uuid(),
  imageEmbedding: z.array(z.number()).length(512).nullable(),
  clipTextEmbedding: z.array(z.number()).length(512),
  sentenceEmbedding: z.array(z.number()).length(384),
  attributes: z.record(z.unknown()),
  modelVersions: z.record(z.string()),
  processedAt: z.date(),
});
export type ReportFeatureWrite = z.infer<typeof reportFeatureWriteSchema>;

export interface ReportProcessStore {
  loadReport(reportId: string): Promise<ReportRow | null>;
  loadImages(reportId: string): Promise<ImageRow[]>;
  loadFeatures(reportId: string): Promise<StoredFeatures | null>;
  markNeedsReprocess(reportId: string): Promise<void>;
  clearNeedsReprocess(reportId: string): Promise<void>;
  upsertImageFeature(feature: ImageFeatureWrite): Promise<void>;
  upsertReportFeature(feature: ReportFeatureWrite): Promise<void>;
}

export interface ReportProcessLogger {
  info(record: Record<string, unknown>): void;
  warn(record: Record<string, unknown>): void;
  error(record: Record<string, unknown>): void;
}

export interface ReportProcessDeps {
  store: ReportProcessStore;
  ml: MlClient;
  presignGet(key: string): Promise<string>;
  logger: ReportProcessLogger;
  enqueueMatch(reportId: string): Promise<void>;
  now(): Date | Promise<Date>;
}

function attemptOf(job: ProcessJob): number {
  return (job.retryCount ?? 0) + 1;
}

function isFinalAttempt(job: ProcessJob): boolean {
  return attemptOf(job) >= (job.retryLimit ?? 1);
}

function versionsMatch(stored: Record<string, string>, current: Record<string, string>): boolean {
  return Object.entries(current).every(([name, version]) => stored[name] === version);
}

async function enqueueMatch(deps: ReportProcessDeps, reportId: string): Promise<void> {
  try {
    await deps.enqueueMatch(reportId);
  } catch {
    throw new JobFailure(
      `failed to enqueue report.match for report ${reportId}`,
      "retryable",
      "match-enqueue-failed",
    );
  }
}

async function handleFailure(
  job: ProcessJob,
  reportId: string,
  startedAt: number,
  deps: ReportProcessDeps,
  err: unknown,
): Promise<ProcessOutcome> {
  const { store, logger } = deps;
  const attempt = attemptOf(job);
  const base: Record<string, unknown> = {
    jobId: job.id,
    reportId,
    attempt,
    durationMs: Date.now() - startedAt,
  };
  const message = err instanceof Error ? scrubMessage(err.message) : scrubMessage(String(err));

  if (err instanceof MlCallError && !err.retryable) {
    await store.markNeedsReprocess(reportId);
    logger.error({ ...base, outcome: "non-retryable", code: err.code, message });
    return "non-retryable";
  }

  const code = err instanceof MlCallError ? err.code : undefined;
  const reason =
    err instanceof JobFailure
      ? err.reason
      : err instanceof MlCallError
        ? "ml-retryable"
        : "unexpected";

  if (isFinalAttempt(job)) {
    await store.markNeedsReprocess(reportId);
    logger.error({ ...base, outcome: "dead-letter", reason, code, message });
  } else {
    logger.warn({ ...base, outcome: "retry", reason, code, message });
  }

  if (err instanceof JobFailure) throw err;
  throw new JobFailure(
    `report ${reportId} failed (${reason}): ${message}`,
    "retryable",
    reason,
    code,
  );
}

async function processReport(
  job: ProcessJob,
  reportId: string,
  startedAt: number,
  deps: ReportProcessDeps,
): Promise<ProcessOutcome> {
  const { store, ml, presignGet, logger } = deps;
  const attempt = attemptOf(job);
  const base: Record<string, unknown> = { jobId: job.id, reportId, attempt };

  const report = await store.loadReport(reportId);
  if (!report) {
    logger.warn({ ...base, durationMs: Date.now() - startedAt, outcome: "not-found" });
    return "not-found";
  }

  const images = await store.loadImages(reportId);
  if (images.some((image) => image.status === "PENDING")) {
    throw new JobFailure(
      `report ${reportId} still has pending images`,
      "retryable",
      "images-pending",
    );
  }
  const readyImages = images.filter((image) => image.status === "READY");

  const features = await store.loadFeatures(reportId);
  if (features) {
    const current = await ml.modelVersions();
    if (
      versionsMatch(features.modelVersions, current) &&
      report.updatedAt.getTime() <= features.processedAt.getTime()
    ) {
      if (report.needsReprocess) {
        await store.clearNeedsReprocess(reportId);
      }
      await enqueueMatch(deps, reportId);
      logger.info({ ...base, durationMs: Date.now() - startedAt, outcome: "early-exit" });
      return "early-exit";
    }
  }

  const processedAt = await deps.now();

  const analyses: { image: ImageRow; analysis: ImageAnalysis }[] = [];
  for (const image of readyImages) {
    const presigned = await presignGet(image.storageKey);
    const analysis = await ml.analyzeImage(presigned);
    analyses.push({ image, analysis });
  }

  const embed: EmbedTextResponse = await ml.embedText(
    [{ id: reportId, text: `${report.title}. ${report.description}` }],
    "id",
  );
  const attributes: Attributes = await ml.extractAttributes({
    title: report.title,
    description: report.description,
    locale: "id",
  });

  for (const { image, analysis } of analyses) {
    const feature = imageFeatureWriteSchema.parse({
      imageId: image.id,
      embedding: analysis.embedding.vector,
      detection: {
        detections: analysis.detections,
        primaryObject: analysis.primaryObject,
      },
      quality: analysis.quality,
      categoryScores: Object.fromEntries(
        analysis.categoryGuess.map((guess) => [guess.category, guess.score]),
      ),
      modelVersions: analysis.modelVersions,
    });
    await store.upsertImageFeature(feature);
  }

  const firstEmbed = embed.embeddings[0];
  if (!firstEmbed) {
    throw new JobFailure(
      `embed-text returned no embeddings for report ${reportId}`,
      "non-retryable",
      "empty-embeddings",
      "ML_INVALID_RESPONSE",
    );
  }

  const imageSource =
    analyses.find(({ analysis }) => analysis.quality.usable !== false) ?? analyses[0];
  const modelVersions: Record<string, string> = {};
  for (const { analysis } of analyses) {
    Object.assign(modelVersions, analysis.modelVersions);
  }
  Object.assign(modelVersions, embed.modelVersions);

  const reportFeature = reportFeatureWriteSchema.parse({
    reportId,
    imageEmbedding: imageSource ? imageSource.analysis.embedding.vector : null,
    clipTextEmbedding: firstEmbed.clipText,
    sentenceEmbedding: firstEmbed.sentence,
    attributes,
    modelVersions,
    processedAt,
  });
  await store.upsertReportFeature(reportFeature);

  const current = await store.loadReport(reportId);
  if (!current) {
    throw new JobFailure(
      `report ${reportId} disappeared during processing`,
      "retryable",
      "report-vanished-during-processing",
    );
  }
  if (current.updatedAt.getTime() !== report.updatedAt.getTime()) {
    throw new JobFailure(
      `report ${reportId} changed during processing`,
      "retryable",
      "report-changed-during-processing",
    );
  }

  if (current.needsReprocess) {
    await store.clearNeedsReprocess(reportId);
  }
  await enqueueMatch(deps, reportId);

  logger.info({ ...base, durationMs: Date.now() - startedAt, outcome: "processed" });
  return "processed";
}

export async function runReportProcess(
  job: ProcessJob,
  deps: ReportProcessDeps,
): Promise<ProcessOutcome> {
  const payload = reportProcessPayloadSchema.safeParse(job.data);
  if (!payload.success) {
    throw new JobFailure(
      `report.process job ${job.id} has an invalid payload`,
      "non-retryable",
      "invalid-payload",
    );
  }
  const reportId = payload.data.reportId;
  const startedAt = Date.now();

  try {
    return await processReport(job, reportId, startedAt, deps);
  } catch (err) {
    return handleFailure(job, reportId, startedAt, deps, err);
  }
}

export function createReportProcessHandler(
  deps: ReportProcessDeps,
): (jobs: ProcessJob[]) => Promise<void> {
  return async (jobs: ProcessJob[]): Promise<void> => {
    for (const job of jobs) {
      await runReportProcess(job, deps);
    }
  };
}
