// apps/web/src/server/services/report-queue.ts
// pg-boss wrapper for the report.process queue (BE-07 R1): enqueued on report
// create, one in-flight process per report (singletonKey), 3 retries with a
// 30 s expiry. Dedupes against a pending singleton (send returns null).

import PgBoss from "pg-boss";
import { parseConfig } from "../config";

export const REPORT_PROCESS_QUEUE_NAME = "report.process";
const QUEUE_POLICY = "standard";

type QueuePolicy = "standard" | "short" | "singleton" | "stately";

/** Structural view of pg-boss so tests can fake it without a database. */
export interface ReportBossLike {
  start?(): Promise<unknown> | unknown;
  getQueue?(name: string): Promise<{ name: string; policy?: string } | null | undefined>;
  createQueue?(name: string, options: { name: string; policy: QueuePolicy }): Promise<void>;
  updateQueue?(name: string, options: { name: string; policy: QueuePolicy }): Promise<void>;
  send(
    name: string,
    data: unknown,
    options?: { singletonKey?: string; retryLimit?: number; expireInSeconds?: number },
  ): Promise<string | null>;
}

export interface ReportProcessQueueLike {
  enqueue(reportId: string): Promise<string | null>;
}

export class ReportProcessQueue implements ReportProcessQueueLike {
  private ready: Promise<void> | null = null;

  constructor(private readonly boss: ReportBossLike) {}

  private ensure(): Promise<void> {
    this.ready ??= (async () => {
      await this.boss.start?.();
      const options: { name: string; policy: QueuePolicy } = {
        name: REPORT_PROCESS_QUEUE_NAME,
        policy: QUEUE_POLICY,
      };
      const existing = await this.boss.getQueue?.(REPORT_PROCESS_QUEUE_NAME);
      if (existing) {
        if (existing.policy !== QUEUE_POLICY) {
          await this.boss.updateQueue?.(REPORT_PROCESS_QUEUE_NAME, options);
        }
      } else {
        await this.boss.createQueue?.(REPORT_PROCESS_QUEUE_NAME, options);
      }
    })();
    return this.ready;
  }

  async enqueue(reportId: string): Promise<string | null> {
    await this.ensure();
    return this.boss.send(
      REPORT_PROCESS_QUEUE_NAME,
      { reportId },
      { singletonKey: reportId, retryLimit: 3, expireInSeconds: 30 },
    );
  }
}

let queue: ReportProcessQueueLike | null = null;

/** Lazy singleton used by production handlers (mocked in tests). */
export function getReportProcessQueue(): ReportProcessQueueLike {
  queue ??= new ReportProcessQueue(
    new PgBoss({ connectionString: parseConfig(process.env).databaseUrl }),
  );
  return queue;
}
