import { describe, expect, it, vi } from "vitest";
import { PgBossDeletionQueue, type PgBossLike } from "./deletion-queue";

// TMU-BE-003 (red evidence): pg-boss account.delete scheduling (BE-07 idempotency).

const USER_ID = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e81";
const RUN_AT = new Date("2026-10-11T10:00:00+07:00");

function fakeBoss(overrides: Partial<PgBossLike> = {}): PgBossLike & {
  createQueue: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  cancel: ReturnType<typeof vi.fn>;
  getJobById: ReturnType<typeof vi.fn>;
} {
  const boss = {
    start: vi.fn(async () => undefined),
    getQueue: vi.fn(async () => null),
    createQueue: vi.fn(async () => undefined),
    updateQueue: vi.fn(async () => undefined),
    send: vi.fn(async () => "job-1"),
    cancel: vi.fn(async () => undefined),
    getJobById: vi.fn(async () => null),
    ...overrides,
  };
  return boss as never;
}

describe("PgBossDeletionQueue", () => {
  it("creates the queue with the singleton 'short' policy on first use", async () => {
    const boss = fakeBoss();
    const queue = new PgBossDeletionQueue(boss);
    await queue.schedule(USER_ID, RUN_AT);
    expect(boss.createQueue).toHaveBeenCalledWith("account.delete", {
      name: "account.delete",
      policy: "short",
    });
    expect(boss.updateQueue).not.toHaveBeenCalled();
  });

  it("switches the policy when the queue already exists with another one", async () => {
    const boss = fakeBoss({
      getQueue: vi.fn(async () => ({ name: "account.delete", policy: "standard" })),
    });
    const queue = new PgBossDeletionQueue(boss);
    await queue.schedule(USER_ID, RUN_AT);
    expect(boss.createQueue).not.toHaveBeenCalled();
    expect(boss.updateQueue).toHaveBeenCalledWith("account.delete", {
      name: "account.delete",
      policy: "short",
    });
  });

  it("sends with singletonKey = userId and startAfter = runAt (BE-07 one deletion per user)", async () => {
    const boss = fakeBoss();
    const queue = new PgBossDeletionQueue(boss);
    const jobId = await queue.schedule(USER_ID, RUN_AT);
    expect(jobId).toBe("job-1");
    expect(boss.send).toHaveBeenCalledWith(
      "account.delete",
      { userId: USER_ID },
      { startAfter: RUN_AT, singletonKey: USER_ID },
    );
  });

  it("returns null when pg-boss dedupes against a pending job", async () => {
    const boss = fakeBoss({ send: vi.fn(async () => null) });
    const queue = new PgBossDeletionQueue(boss);
    const jobId = await queue.schedule(USER_ID, RUN_AT);
    expect(jobId).toBeNull();
  });

  it("ensures the queue only once across calls", async () => {
    const boss = fakeBoss();
    const queue = new PgBossDeletionQueue(boss);
    await queue.schedule(USER_ID, RUN_AT);
    await queue.cancel("job-1");
    await queue.isPending("job-1");
    expect(boss.start).toHaveBeenCalledTimes(1);
    expect(boss.createQueue).toHaveBeenCalledTimes(1);
  });

  it("cancels through pg-boss on the account.delete queue", async () => {
    const boss = fakeBoss();
    const queue = new PgBossDeletionQueue(boss);
    await queue.cancel("job-9");
    expect(boss.cancel).toHaveBeenCalledWith("account.delete", "job-9");
  });

  it("treats created, retry and active jobs as pending", async () => {
    const boss = fakeBoss({
      getJobById: vi.fn(async () => ({ state: "created" })),
    });
    const queue = new PgBossDeletionQueue(boss);
    await expect(queue.isPending("job-1")).resolves.toBe(true);

    boss.getJobById.mockResolvedValueOnce({ state: "retry" });
    await expect(queue.isPending("job-1")).resolves.toBe(true);

    boss.getJobById.mockResolvedValueOnce({ state: "active" });
    await expect(queue.isPending("job-1")).resolves.toBe(true);

    boss.getJobById.mockResolvedValueOnce({ state: "completed" });
    await expect(queue.isPending("job-1")).resolves.toBe(false);

    boss.getJobById.mockResolvedValueOnce(null);
    await expect(queue.isPending("job-1")).resolves.toBe(false);
  });
});
