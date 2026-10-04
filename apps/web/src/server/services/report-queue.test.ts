import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { REPORT_PROCESS_QUEUE_NAME, ReportProcessQueue } from "./report-queue";

// TMU-BE-006 (red evidence): report.process enqueue semantics (BE-07 R1) —
// one in-flight process per report via singletonKey, 3 retries / 30 s expiry,
// dedupe-safe when pg-boss returns null for a pending singleton.

interface FakeBoss {
  start: ReturnType<typeof vi.fn>;
  getQueue: ReturnType<typeof vi.fn>;
  createQueue: ReturnType<typeof vi.fn>;
  updateQueue: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
}

function fakeBoss(overrides: Partial<Record<"send", unknown>> = {}): FakeBoss {
  return {
    start: vi.fn(async () => undefined),
    getQueue: vi.fn(async () => null),
    createQueue: vi.fn(async () => undefined),
    updateQueue: vi.fn(async () => undefined),
    send: vi.fn(async () => "job-1"),
    ...(overrides as object),
  } as FakeBoss;
}

describe("ReportProcessQueue", () => {
  it("ensures the report.process queue once and creates it when missing", async () => {
    const boss = fakeBoss();
    const queue = new ReportProcessQueue(boss);

    await queue.enqueue(randomUUID());
    await queue.enqueue(randomUUID());

    expect(boss.start).toHaveBeenCalledTimes(1);
    expect(boss.createQueue).toHaveBeenCalledTimes(1);
    expect(boss.createQueue).toHaveBeenCalledWith(REPORT_PROCESS_QUEUE_NAME, {
      name: REPORT_PROCESS_QUEUE_NAME,
      policy: "standard",
    });
    expect(boss.updateQueue).not.toHaveBeenCalled();
  });

  it("sends { reportId } with singletonKey and BE-07 retry/expiry options", async () => {
    const boss = fakeBoss();
    const queue = new ReportProcessQueue(boss);
    const reportId = randomUUID();

    await queue.enqueue(reportId);

    expect(boss.send).toHaveBeenCalledWith(
      REPORT_PROCESS_QUEUE_NAME,
      { reportId },
      { singletonKey: reportId, retryLimit: 3, expireInSeconds: 30 },
    );
  });

  it("returns null when pg-boss dedupes against a pending singleton job", async () => {
    const boss = fakeBoss({ send: vi.fn(async () => null) });
    const queue = new ReportProcessQueue(boss);

    await expect(queue.enqueue(randomUUID())).resolves.toBeNull();
  });

  it("normalises an existing non-standard queue policy before sending", async () => {
    const boss = fakeBoss();
    boss.getQueue = vi.fn(async () => ({ name: REPORT_PROCESS_QUEUE_NAME, policy: "short" }));
    const queue = new ReportProcessQueue(boss);

    await queue.enqueue(randomUUID());

    expect(boss.updateQueue).toHaveBeenCalledWith(REPORT_PROCESS_QUEUE_NAME, {
      name: REPORT_PROCESS_QUEUE_NAME,
      policy: "standard",
    });
    expect(boss.createQueue).not.toHaveBeenCalled();
  });
});
