// apps/web/src/server/services/deletion-queue.ts
// pg-boss wrapper for the account.delete queue (BE-07): one pending deletion per
// user (policy "short" + singletonKey), cancel by job id (stored in audit_logs).

import PgBoss from "pg-boss";
import { parseConfig } from "../config";

export const DELETION_QUEUE_NAME = "account.delete";

export interface DeletionQueue {
  schedule(userId: string, runAt: Date): Promise<string | null>;
  cancel(jobId: string): Promise<void>;
  isPending(jobId: string): Promise<boolean>;
}

type QueuePolicy = "standard" | "short" | "singleton" | "stately";

/** Structural view of pg-boss so tests can fake it without a database. */
export interface PgBossLike {
  start?(): Promise<unknown> | unknown;
  getQueue?(name: string): Promise<{ name: string; policy?: string } | null | undefined>;
  createQueue?(name: string, options: { name: string; policy: QueuePolicy }): Promise<void>;
  updateQueue?(name: string, options: { name: string; policy: QueuePolicy }): Promise<void>;
  send(
    name: string,
    data: unknown,
    options?: { startAfter?: Date; singletonKey?: string },
  ): Promise<string | null>;
  cancel(name: string, id: string): Promise<void>;
  getJobById(
    name: string,
    id: string,
    options?: { includeArchive?: boolean },
  ): Promise<{ state: string } | null | undefined>;
}

const PENDING_STATES = new Set(["created", "retry", "active"]);

export class PgBossDeletionQueue implements DeletionQueue {
  private ready: Promise<void> | null = null;

  constructor(private readonly boss: PgBossLike) {}

  private ensure(): Promise<void> {
    this.ready ??= (async () => {
      await this.boss.start?.();
      const options = { name: DELETION_QUEUE_NAME, policy: "short" as const };
      const existing = await this.boss.getQueue?.(DELETION_QUEUE_NAME);
      if (existing) {
        if (existing.policy !== "short") {
          await this.boss.updateQueue?.(DELETION_QUEUE_NAME, options);
        }
      } else {
        await this.boss.createQueue?.(DELETION_QUEUE_NAME, options);
      }
    })();
    return this.ready;
  }

  async schedule(userId: string, runAt: Date): Promise<string | null> {
    await this.ensure();
    return this.boss.send(
      DELETION_QUEUE_NAME,
      { userId },
      {
        startAfter: runAt,
        singletonKey: userId,
      },
    );
  }

  async cancel(jobId: string): Promise<void> {
    await this.ensure();
    await this.boss.cancel(DELETION_QUEUE_NAME, jobId);
  }

  async isPending(jobId: string): Promise<boolean> {
    await this.ensure();
    const job = await this.boss.getJobById(DELETION_QUEUE_NAME, jobId, { includeArchive: true });
    if (!job) return false;
    return PENDING_STATES.has(job.state);
  }
}

let queue: DeletionQueue | null = null;

/** Lazy singleton used by production handlers (mocked in tests). */
export function getDeletionQueue(): DeletionQueue {
  queue ??= new PgBossDeletionQueue(
    new PgBoss({ connectionString: parseConfig(process.env).databaseUrl }),
  );
  return queue;
}
