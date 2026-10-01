import PgBoss from "pg-boss";
import { QUEUES, type QueueName, parseJobPayload } from "./registry.js";

export interface WorkerOptions {
  connectionString?: string;
}

export interface WorkerInstance {
  boss: PgBoss;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  registeredQueues: QueueName[];
}

export function createWorker(options: WorkerOptions = {}): WorkerInstance {
  const connectionString = options.connectionString ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const boss = new PgBoss({
    connectionString,
  });

  const registeredQueues = Object.keys(QUEUES) as QueueName[];

  async function start() {
    await boss.start();

    // Register no-op handlers for all BE-07 queues with contract payload parsing
    for (const queue of registeredQueues) {
      await boss.work(queue, async (jobs) => {
        for (const job of jobs) {
          const startTime = Date.now();
          // Validate payload with contract schema (never cast)
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
