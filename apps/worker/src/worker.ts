// apps/worker/src/worker.ts
// pg-boss registration for all BE-07 queues. report.process runs the real
// handler with job metadata (includeMetadata) so dead-letter detection can read
// retryCount/retryLimit; its runner is built lazily on the first job so tests
// can inject their own and no env is required at construction time.

import PgBoss from "pg-boss";
import { Pool } from "pg";
import { getWorkerConfig } from "./config.js";
import { createWorkerLogger } from "./logging.js";
import { createMlClient } from "./ml/client.js";
import { QUEUES, type QueueName, parseJobPayload } from "./registry.js";
import { createPresignGet } from "./storage.js";
import { ReportMatchQueue } from "./jobs/report-match-queue.js";
import { createReportProcessHandler, type ProcessJob } from "./jobs/report-process.js";
import { createSqlReportProcessStore } from "./jobs/report-process-store.js";

export type ReportProcessRunner = (jobs: ProcessJob[]) => Promise<void>;

export interface WorkerOptions {
  connectionString?: string;
  reportProcess?: ReportProcessRunner;
}

export interface WorkerInstance {
  boss: PgBoss;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  registeredQueues: QueueName[];
}

function buildReportProcessRunner(boss: PgBoss, connectionString: string): ReportProcessRunner {
  const config = getWorkerConfig();
  const pool = new Pool({ connectionString });
  const store = createSqlReportProcessStore(pool);
  const logger = createWorkerLogger({ level: process.env.LOG_LEVEL ?? "info" });
  const ml = createMlClient({
    mode: config.mlMode,
    serviceUrl: config.mlServiceUrl,
    token: config.mlServiceToken,
    allowedStorageOrigins: config.allowedStorageOrigins,
  });
  const presignGet = createPresignGet(config);
  const matchQueue = new ReportMatchQueue(boss);

  return createReportProcessHandler({
    store,
    ml,
    presignGet,
    logger,
    enqueueMatch: async (reportId: string) => {
      await matchQueue.enqueue(reportId);
    },
    now: () => new Date(),
  });
}

export function createWorker(options: WorkerOptions = {}): WorkerInstance {
  const connectionString = options.connectionString ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const dbUrl: string = connectionString;

  const boss = new PgBoss({
    connectionString: dbUrl,
  });

  const registeredQueues = Object.keys(QUEUES) as QueueName[];

  let runnerMemo: ReportProcessRunner | undefined;

  function resolveRunner(): ReportProcessRunner {
    if (options.reportProcess) return options.reportProcess;
    runnerMemo ??= buildReportProcessRunner(boss, dbUrl);
    return runnerMemo;
  }

  async function start() {
    getWorkerConfig(); // BE-11 rule 5: fail fast on ML_MODE=stub in production
    await boss.start();

    for (const queue of registeredQueues) {
      if (queue === "report.process") {
        await boss.work(queue, { includeMetadata: true }, async (jobs) => {
          for (const job of jobs) {
            parseJobPayload(queue, job.data);
          }
          await resolveRunner()(jobs as ProcessJob[]);
        });
        continue;
      }

      // Other BE-07 queues: no-op handlers with contract payload parsing
      await boss.work(queue, async (jobs) => {
        for (const job of jobs) {
          const startTime = Date.now();
          const payload = parseJobPayload(queue, job.data);
          void payload;
          const durationMs = Date.now() - startTime;
          if (process.env.NODE_ENV !== "test") {
            process.stdout.write(`[worker] processed ${queue} job ${job.id} in ${durationMs}ms\n`);
          }
        }
      });
    }
  }

  async function stop() {
    await boss.stop({ graceful: true, timeout: 5000 });
  }

  return {
    boss,
    start,
    stop,
    registeredQueues,
  };
}
