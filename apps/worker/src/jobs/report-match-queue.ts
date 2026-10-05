// apps/worker/src/jobs/report-match-queue.ts
// pg-boss enqueue for the report.match queue (BE-07): created on demand by the
// worker (queue FK requires the row to exist before send), singletonKey keeps
// one in-flight match per report, 3 attempts with a 30 s backoff base.

export const REPORT_MATCH_QUEUE_NAME = "report.match";

type QueuePolicy = "standard" | "short" | "singleton" | "stately";

export interface MatchBossLike {
  start?(): Promise<unknown> | unknown;
  getQueue?(name: string): Promise<{ name: string; policy?: string } | null | undefined>;
  createQueue?(name: string, options: { name: string; policy: QueuePolicy }): Promise<void>;
  updateQueue?(name: string, options: { name: string; policy: QueuePolicy }): Promise<void>;
  send(
    name: string,
    data: unknown,
    options?: {
      singletonKey?: string;
      retryLimit?: number;
      retryDelay?: number;
      retryBackoff?: boolean;
      expireInSeconds?: number;
    },
  ): Promise<string | null>;
}

export class ReportMatchQueue {
  private ensured = false;

  constructor(private readonly boss: MatchBossLike) {}

  private async ensureQueue(): Promise<void> {
    if (this.ensured) return;
    const existing = await this.boss.getQueue?.(REPORT_MATCH_QUEUE_NAME);
    if (!existing) {
      await this.boss.createQueue?.(REPORT_MATCH_QUEUE_NAME, {
        name: REPORT_MATCH_QUEUE_NAME,
        policy: "standard",
      });
    } else if (existing.policy !== "standard") {
      await this.boss.updateQueue?.(REPORT_MATCH_QUEUE_NAME, {
        name: REPORT_MATCH_QUEUE_NAME,
        policy: "standard",
      });
    }
    this.ensured = true;
  }

  async enqueue(reportId: string): Promise<void> {
    await this.ensureQueue();
    await this.boss.send(
      REPORT_MATCH_QUEUE_NAME,
      { reportId, reason: "process" },
      {
        singletonKey: reportId,
        retryLimit: 3,
        retryDelay: 30,
        retryBackoff: true,
        expireInSeconds: 30,
      },
    );
  }
}
