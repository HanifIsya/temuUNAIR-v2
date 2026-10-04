import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { MlCallError, STUB_MODEL_VERSIONS, createMlClient } from "../ml/client.js";
import {
  type ImageRow,
  type ProcessJob,
  type ReportProcessDeps,
  type ReportProcessStore,
  type ReportRow,
  JobFailure,
  createReportProcessHandler,
  imageFeatureWriteSchema,
  reportFeatureWriteSchema,
  runReportProcess,
} from "./report-process.js";
import { REPORT_MATCH_QUEUE_NAME, ReportMatchQueue } from "./report-match-queue.js";

// TMU-BE-007 (red evidence): report.process handler (BE-07) — idempotent double-run,
// ML stub features, retry/backoff classification, dead-letter needs_reprocess flag,
// and structured logs that never contain report text, image bytes or image URLs.

const REPORT_ID = "11111111-2222-4333-8444-555555555555";
const TITLE = "Tas ransel biru eiger";
const DESCRIPTION = "Tas ransel biru tua dengan gantungan kunci berbentuk mobil warna kuning.";
const PRESIGNED =
  "http://localhost:9000/temuunair-dev/reports/img1.jpg?X-Amz-Expires=300&X-Amz-Signature=deadbeef";

function baseReport(overrides: Partial<ReportRow> = {}): ReportRow {
  return {
    id: REPORT_ID,
    type: "FOUND",
    status: "OPEN",
    title: TITLE,
    description: DESCRIPTION,
    brand: "Eiger",
    colors: ["biru", "kuning"],
    category: "BAG",
    updatedAt: new Date("2026-10-01T10:00:00.000Z"),
    needsReprocess: false,
    ...overrides,
  };
}

function readyImage(position: number): ImageRow {
  return {
    id: randomUUID(),
    storageKey: `reports/${REPORT_ID}/img${position}.jpg`,
    status: "READY",
    position,
  };
}

interface HarnessOptions {
  report?: ReportRow | null;
  secondReport?: ReportRow | null;
  images?: ImageRow[];
  features?: { modelVersions: Record<string, string>; processedAt: Date } | null;
  ml?: Partial<{ analyzeImage: unknown; embedText: unknown; extractAttributes: unknown }>;
  enqueueMatch?: unknown;
  now?: () => Date;
}

function makeMl() {
  const stub = createMlClient({
    mode: "stub",
    serviceUrl: "http://ml.internal:8000",
    token: "dev-ml-token",
    allowedStorageOrigins: ["http://localhost:9000"],
  });
  return {
    analyzeImage: vi.fn((url: string) => stub.analyzeImage(url)),
    embedText: vi.fn((texts: { id: string; text: string }[], locale: "id" | "en") =>
      stub.embedText(texts, locale),
    ),
    extractAttributes: vi.fn((input: { title: string; description: string; locale: "id" | "en" }) =>
      stub.extractAttributes(input),
    ),
    modelVersions: vi.fn(() => stub.modelVersions()),
  };
}

function makeLogger() {
  return { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

function harness(options: HarnessOptions = {}) {
  const state = {
    report: options.report === undefined ? baseReport() : options.report,
    secondReport: options.secondReport,
    images: options.images ?? [readyImage(0), readyImage(1)],
    features: options.features ?? null,
    imageFeatures: [] as unknown[],
    reportFeatures: [] as unknown[],
    marks: [] as string[],
    clears: [] as string[],
    loadReportCalls: 0,
    loadImagesCalls: 0,
    loadFeaturesCalls: 0,
  };

  const store: ReportProcessStore = {
    async loadReport() {
      state.loadReportCalls += 1;
      if (state.loadReportCalls === 1) return state.report;
      return state.secondReport !== undefined ? state.secondReport : state.report;
    },
    async loadImages() {
      state.loadImagesCalls += 1;
      return state.images;
    },
    async loadFeatures() {
      state.loadFeaturesCalls += 1;
      return state.features;
    },
    async markNeedsReprocess(reportId) {
      state.marks.push(reportId);
      if (state.report && state.report.id === reportId) state.report.needsReprocess = true;
    },
    async clearNeedsReprocess(reportId) {
      state.clears.push(reportId);
      if (state.report && state.report.id === reportId) state.report.needsReprocess = false;
    },
    async upsertImageFeature(feature) {
      state.imageFeatures.push(feature);
    },
    async upsertReportFeature(feature) {
      state.reportFeatures.push(feature);
    },
  };

  const ml = makeMl() as unknown as ReportProcessDeps["ml"] & ReturnType<typeof makeMl>;
  if (options.ml) Object.assign(ml, options.ml);

  const logger = makeLogger();
  const enqueueMatch =
    (options.enqueueMatch as ReturnType<typeof vi.fn> | undefined) ?? vi.fn(async () => undefined);

  const deps: ReportProcessDeps = {
    store,
    ml,
    presignGet: async () => PRESIGNED,
    logger,
    enqueueMatch,
    now: options.now ?? (() => new Date("2026-10-01T12:00:00.000Z")),
  };

  return { deps, state, ml, logger, enqueueMatch };
}

function job(overrides?: Partial<ProcessJob>): ProcessJob {
  return {
    id: "job-1",
    data: { reportId: REPORT_ID },
    retryCount: 0,
    retryLimit: 3,
    ...overrides,
  };
}

function loggedRecords(logger: ReturnType<typeof makeLogger>): Record<string, unknown>[] {
  return [...logger.info.mock.calls, ...logger.warn.mock.calls, ...logger.error.mock.calls].map(
    (call) => call[0] as Record<string, unknown>,
  );
}

describe("runReportProcess — processing", () => {
  it("analyses every READY image, writes schema-valid features and enqueues report.match", async () => {
    const { deps, state, ml, enqueueMatch, logger } = harness();

    const outcome = await runReportProcess(job(), deps);

    expect(outcome).toBe("processed");
    expect(ml.analyzeImage).toHaveBeenCalledTimes(2);
    expect(ml.embedText).toHaveBeenCalledTimes(1);
    expect(ml.extractAttributes).toHaveBeenCalledTimes(1);
    expect(ml.embedText).toHaveBeenCalledWith(
      [{ id: REPORT_ID, text: `${TITLE}. ${DESCRIPTION}` }],
      "id",
    );

    expect(state.imageFeatures).toHaveLength(2);
    for (const feature of state.imageFeatures) {
      expect(imageFeatureWriteSchema.parse(feature)).toBeTruthy();
    }
    expect(state.reportFeatures).toHaveLength(1);
    const reportFeature = reportFeatureWriteSchema.parse(state.reportFeatures[0]);
    expect(reportFeature.reportId).toBe(REPORT_ID);
    expect(reportFeature.clipTextEmbedding).toHaveLength(512);
    expect(reportFeature.sentenceEmbedding).toHaveLength(384);
    expect(reportFeature.imageEmbedding).toHaveLength(512);
    expect(reportFeature.modelVersions).toEqual(STUB_MODEL_VERSIONS);
    expect(reportFeature.attributes).toBeTypeOf("object");
    expect(reportFeature.processedAt.toISOString()).toBe("2026-10-01T12:00:00.000Z");

    expect(enqueueMatch).toHaveBeenCalledTimes(1);
    expect(enqueueMatch).toHaveBeenCalledWith(REPORT_ID);

    const record = loggedRecords(logger).find((r) => r.outcome === "processed");
    expect(record).toMatchObject({ jobId: "job-1", reportId: REPORT_ID, attempt: 1 });
    expect(record?.durationMs).toBeTypeOf("number");
  });

  it("produces text-only features when every image is rejected", async () => {
    const { deps, state } = harness({
      images: [
        { id: randomUUID(), storageKey: "reports/x/rejected.jpg", status: "REJECTED", position: 0 },
      ],
    });

    const outcome = await runReportProcess(job(), deps);

    expect(outcome).toBe("processed");
    expect(state.imageFeatures).toHaveLength(0);
    const feature = reportFeatureWriteSchema.parse(state.reportFeatures[0]);
    expect(feature.imageEmbedding).toBeNull();
    expect(feature.clipTextEmbedding).toHaveLength(512);
  });
});

describe("runReportProcess — idempotency (BE-07 rule 1)", () => {
  it("exits early without ML calls when model versions match and the report is unchanged", async () => {
    const { deps, state, ml, enqueueMatch, logger } = harness({
      features: {
        modelVersions: { ...STUB_MODEL_VERSIONS },
        processedAt: new Date("2026-10-01T11:00:00.000Z"),
      },
      report: baseReport({ updatedAt: new Date("2026-10-01T10:00:00.000Z") }),
    });

    const outcome = await runReportProcess(job(), deps);

    expect(outcome).toBe("early-exit");
    expect(ml.analyzeImage).not.toHaveBeenCalled();
    expect(ml.embedText).not.toHaveBeenCalled();
    expect(state.imageFeatures).toHaveLength(0);
    expect(state.reportFeatures).toHaveLength(0);
    expect(enqueueMatch).toHaveBeenCalledTimes(1);
    expect(loggedRecords(logger).some((r) => r.outcome === "early-exit")).toBe(true);
  });

  it("clears a stale needs_reprocess flag when the features are already current", async () => {
    const { deps, state } = harness({
      features: {
        modelVersions: { ...STUB_MODEL_VERSIONS },
        processedAt: new Date("2026-10-01T11:00:00.000Z"),
      },
      report: baseReport({ needsReprocess: true }),
    });

    await runReportProcess(job(), deps);

    expect(state.clears).toEqual([REPORT_ID]);
    expect(state.marks).toHaveLength(0);
  });

  it("reprocesses when the report changed after the last processed_at", async () => {
    const { deps, state, ml } = harness({
      features: {
        modelVersions: { ...STUB_MODEL_VERSIONS },
        processedAt: new Date("2026-10-01T11:00:00.000Z"),
      },
      report: baseReport({ updatedAt: new Date("2026-10-01T11:30:00.000Z") }),
    });

    const outcome = await runReportProcess(job(), deps);

    expect(outcome).toBe("processed");
    expect(ml.analyzeImage).toHaveBeenCalledTimes(2);
    expect(state.reportFeatures).toHaveLength(1);
  });

  it("reprocesses when stored model versions no longer match the current ones", async () => {
    const { deps, state, ml } = harness({
      features: {
        modelVersions: { yolo: "0.9.0", clip: "0.9.0", quality: "1", sentence: "0.9.0" },
        processedAt: new Date("2026-10-01T11:00:00.000Z"),
      },
    });

    const outcome = await runReportProcess(job(), deps);

    expect(outcome).toBe("processed");
    expect(ml.analyzeImage).toHaveBeenCalledTimes(2);
    expect(state.reportFeatures).toHaveLength(1);
  });

  it("retries when the report changes mid-processing and does not clear the flag", async () => {
    const { deps, state, logger } = harness({
      report: baseReport({ updatedAt: new Date("2026-10-01T10:00:00.000Z") }),
      secondReport: baseReport({
        updatedAt: new Date("2026-10-01T10:15:00.000Z"),
        needsReprocess: true,
      }),
    });

    await expect(runReportProcess(job(), deps)).rejects.toBeInstanceOf(JobFailure);
    expect(state.reportFeatures).toHaveLength(1);
    expect(state.clears).toHaveLength(0);
    expect(state.marks).toHaveLength(0);
    expect(
      loggedRecords(logger).some(
        (r) => r.outcome === "retry" && r.reason === "report-changed-during-processing",
      ),
    ).toBe(true);
  });
});

describe("runReportProcess — retry, dead-letter and non-retryable failures", () => {
  it("retries while images are still PENDING without flagging the report", async () => {
    const { deps, state, logger } = harness({
      images: [{ id: randomUUID(), storageKey: "reports/x/p.jpg", status: "PENDING", position: 0 }],
    });

    await expect(runReportProcess(job({ retryCount: 0 }), deps)).rejects.toBeInstanceOf(JobFailure);
    expect(state.marks).toHaveLength(0);
    expect(
      loggedRecords(logger).some((r) => r.outcome === "retry" && r.reason === "images-pending"),
    ).toBe(true);
  });

  it("dead-letters on the final attempt: sets needs_reprocess, keeps the report usable, rethrows", async () => {
    const { deps, state, logger } = harness({
      images: [{ id: randomUUID(), storageKey: "reports/x/p.jpg", status: "PENDING", position: 0 }],
    });

    await expect(
      runReportProcess(job({ retryCount: 2, retryLimit: 3 }), deps),
    ).rejects.toBeInstanceOf(JobFailure);

    expect(state.marks).toEqual([REPORT_ID]);
    expect(state.report).toMatchObject({ status: "OPEN", needsReprocess: true });
    const deadLetter = loggedRecords(logger).find((r) => r.outcome === "dead-letter");
    expect(deadLetter).toMatchObject({ jobId: "job-1", reportId: REPORT_ID, attempt: 3 });
  });

  it("rethrows retryable ML failures (5xx) so pg-boss retries with backoff", async () => {
    const ml = makeMl();
    ml.analyzeImage.mockImplementation(() =>
      Promise.reject(
        new MlCallError("analyze failed", { code: "ML_HTTP_503", status: 503, retryable: true }),
      ),
    );
    const { deps, state, logger } = harness({ ml });

    await expect(runReportProcess(job({ retryCount: 1 }), deps)).rejects.toBeInstanceOf(JobFailure);
    expect(state.marks).toHaveLength(0);
    expect(
      loggedRecords(logger).some((r) => r.outcome === "retry" && r.code === "ML_HTTP_503"),
    ).toBe(true);
  });

  it("flags needs_reprocess on retryable ML failure at the final attempt", async () => {
    const ml = makeMl();
    ml.analyzeImage.mockImplementation(() =>
      Promise.reject(
        new MlCallError("analyze failed", { code: "ML_HTTP_503", status: 503, retryable: true }),
      ),
    );
    const { deps, state, logger } = harness({ ml });

    await expect(
      runReportProcess(job({ retryCount: 2, retryLimit: 3 }), deps),
    ).rejects.toBeInstanceOf(JobFailure);
    expect(state.marks).toEqual([REPORT_ID]);
    expect(loggedRecords(logger).some((r) => r.outcome === "dead-letter")).toBe(true);
  });

  it("marks the report and completes without retry on non-retryable ML failures", async () => {
    const ml = makeMl();
    ml.analyzeImage.mockImplementation(() =>
      Promise.reject(
        new MlCallError("unsupported", { code: "ML_HTTP_415", status: 415, retryable: false }),
      ),
    );
    const { deps, state, logger, enqueueMatch } = harness({ ml });

    const outcome = await runReportProcess(job(), deps);

    expect(outcome).toBe("non-retryable");
    expect(state.marks).toEqual([REPORT_ID]);
    expect(state.reportFeatures).toHaveLength(0);
    expect(enqueueMatch).not.toHaveBeenCalled();
    const record = loggedRecords(logger).find((r) => r.outcome === "non-retryable");
    expect(record).toMatchObject({ reportId: REPORT_ID, code: "ML_HTTP_415" });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("fails fast without retries when the report no longer exists", async () => {
    const { deps, state, ml, logger } = harness({ report: null });

    const outcome = await runReportProcess(job(), deps);

    expect(outcome).toBe("not-found");
    expect(ml.analyzeImage).not.toHaveBeenCalled();
    expect(state.marks).toHaveLength(0);
    expect(loggedRecords(logger).some((r) => r.outcome === "not-found")).toBe(true);
  });

  it("throws when report.match cannot be enqueued so the job retries", async () => {
    const enqueueMatch = vi.fn(() => Promise.reject(new Error("pg-boss unavailable")));
    const { deps } = harness({ enqueueMatch });

    await expect(runReportProcess(job(), deps)).rejects.toBeInstanceOf(JobFailure);
    expect(enqueueMatch).toHaveBeenCalledTimes(1);
  });

  it("rejects an invalid payload before touching the store", async () => {
    const { deps, state } = harness();

    await expect(
      runReportProcess(job({ data: { reportId: "not-a-uuid" } }), deps),
    ).rejects.toThrow();
    expect(state.loadReportCalls).toBe(0);
    expect(state.loadImagesCalls).toBe(0);
  });
});

describe("runReportProcess — log privacy (BE-07 / privacy rules)", () => {
  it("never logs report text, image bytes or presigned image URLs", async () => {
    const { deps, logger } = harness();
    await runReportProcess(job(), deps);

    const serialized = JSON.stringify([
      ...logger.info.mock.calls,
      ...logger.warn.mock.calls,
      ...logger.error.mock.calls,
    ]);
    expect(serialized).not.toContain(DESCRIPTION);
    expect(serialized).not.toContain(TITLE);
    expect(serialized).not.toContain("gantungan");
    expect(serialized).not.toContain("X-Amz-Signature");
    expect(serialized).not.toContain("deadbeef");
    expect(serialized).not.toContain("base64");
    expect(serialized).not.toContain(PRESIGNED);
  });
});

describe("createReportProcessHandler", () => {
  it("runs every job in the batch", async () => {
    const { deps, state } = harness();
    const handler = createReportProcessHandler(deps);

    await handler([job({ id: "job-1" }), job({ id: "job-2" })]);
    expect(state.reportFeatures).toHaveLength(2);
  });

  it("propagates an invalid payload as a rejection", async () => {
    const { deps } = harness();
    const handler = createReportProcessHandler(deps);
    await expect(handler([job({ data: { reportId: "nope" } })])).rejects.toThrow();
  });
});

describe("ReportMatchQueue", () => {
  it("ensures the report.match queue once and sends the BE-07 payload with contract retry policy", async () => {
    const boss = {
      start: vi.fn(async () => undefined),
      getQueue: vi.fn(async () => null),
      createQueue: vi.fn(async () => undefined),
      updateQueue: vi.fn(async () => undefined),
      send: vi.fn(async () => "job-1"),
    };
    const queue = new ReportMatchQueue(boss);

    await queue.enqueue(REPORT_ID);
    await queue.enqueue(REPORT_ID);

    expect(boss.createQueue).toHaveBeenCalledTimes(1);
    expect(boss.createQueue).toHaveBeenCalledWith(REPORT_MATCH_QUEUE_NAME, {
      name: REPORT_MATCH_QUEUE_NAME,
      policy: "standard",
    });
    expect(boss.send).toHaveBeenCalledWith(
      REPORT_MATCH_QUEUE_NAME,
      { reportId: REPORT_ID, reason: "process" },
      {
        singletonKey: REPORT_ID,
        retryLimit: 3,
        retryDelay: 30,
        retryBackoff: true,
        expireInSeconds: 30,
      },
    );
  });
});
