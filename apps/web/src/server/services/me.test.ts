import { describe, expect, it, vi } from "vitest";
import { loadContractApi } from "../contract-test-utils";
import { DomainError } from "../errors";
import {
  cancelPendingDeletion,
  getMe,
  getPrefs,
  requestAccountDeletion,
  setPrefs,
  updateMe,
  type AuditEntry,
  type MeRepository,
  type PrefsRow,
  type UserRow,
} from "./me";
import type { DeletionQueue } from "./deletion-queue";

// TMU-BE-003 (red evidence): ME + preference services (API-ME-01..05, FR-AUTH-004/005).

const { expectMatchesContract, responseSchema } = await loadContractApi();

const USER_ID = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e81";
const NOW = new Date("2026-10-04T10:00:00+07:00");
const CTX = { now: NOW, requestId: "req_test0000000001" };
const COOL_OFF_MS = 7 * 24 * 60 * 60 * 1000;

function makeRow(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: USER_ID,
    email: "budi@student.unair.ac.id",
    displayName: "Budi S.",
    unairRef: "NIM12345",
    role: "USER",
    moderatorCampus: null,
    locale: "id",
    status: "ACTIVE",
    createdAt: new Date("2026-09-20T08:00:00+07:00"),
    ...overrides,
  };
}

interface RepoState {
  row: UserRow | null;
  prefs: PrefsRow | null;
  audits: AuditEntry[];
  deletion: { jobId: string; scheduledAt: Date } | null;
  profileUpdates: Array<{ id: string; patch: Record<string, string> }>;
}

function fakeRepo(seed: Partial<UserRow> = {}): { repo: MeRepository; state: RepoState } {
  const state: RepoState = {
    row: makeRow(seed),
    prefs: null,
    audits: [],
    deletion: null,
    profileUpdates: [],
  };
  const repo: MeRepository = {
    getUserById: vi.fn(async (id: string) => (state.row?.id === id ? state.row : null)),
    findSessionUser: vi.fn(async () => null),
    extendSession: vi.fn(async () => {}),
    updateProfile: vi.fn(async (id: string, patch: Record<string, string>, now: Date) => {
      state.profileUpdates.push({ id, patch });
      state.row = { ...state.row!, ...patch, createdAt: state.row!.createdAt };
      void now;
      return state.row;
    }),
    getPrefs: vi.fn(async () => state.prefs),
    upsertPrefs: vi.fn(
      async (_userId: string, prefs: { emailEnabled: boolean; mutedTypes: string[] }) => {
        state.prefs = { userId: USER_ID, ...prefs };
        return state.prefs;
      },
    ),
    insertAudit: vi.fn(async (entry: AuditEntry) => {
      state.audits.push(entry);
    }),
    findDeletionRequest: vi.fn(async () => {
      if (state.deletion) return state.deletion;
      for (let i = state.audits.length - 1; i >= 0; i--) {
        const entry = state.audits[i];
        if (entry?.action !== "user.deletion.requested") continue;
        const after = entry.after as { jobId?: unknown; scheduledAt?: unknown } | undefined;
        if (typeof after?.jobId === "string" && typeof after?.scheduledAt === "string") {
          return { jobId: after.jobId, scheduledAt: new Date(after.scheduledAt) };
        }
      }
      return null;
    }),
  };
  return { repo, state };
}

function fakeQueue() {
  const scheduled: Array<{ userId: string; runAt: Date }> = [];
  const cancelled: string[] = [];
  const pending = new Map<string, string>();
  let jobSeq = 0;
  const queue: DeletionQueue = {
    schedule: vi.fn(async (userId: string, runAt: Date) => {
      for (const [jobId, owner] of pending) {
        if (owner === userId) {
          void jobId;
          return null;
        }
      }
      jobSeq += 1;
      const jobId = `job-${jobSeq}`;
      pending.set(jobId, userId);
      scheduled.push({ userId, runAt });
      return jobId;
    }),
    cancel: vi.fn(async (jobId: string) => {
      cancelled.push(jobId);
      pending.delete(jobId);
    }),
    isPending: vi.fn(async (jobId: string) => pending.has(jobId)),
  };
  return { queue, scheduled, cancelled, pending };
}

describe("getMe (API-ME-01)", () => {
  it("returns a contract-shaped projection without private fields", async () => {
    const { repo } = fakeRepo();
    const me = await getMe(repo, USER_ID);
    expectMatchesContract("API-ME-01", me, responseSchema("API-ME-01"));
    expect(me).not.toHaveProperty("unairRef");
    expect(me).not.toHaveProperty("moderatorCampus");
    expect(JSON.stringify(me)).not.toContain("NIM12345");
    expect(me.email).toBe("budi@student.unair.ac.id");
    expect(me.createdAt).toBe(new Date("2026-09-20T08:00:00+07:00").toISOString());
  });

  it("includes moderatorCampus for staff callers", async () => {
    const { repo } = fakeRepo({ role: "MODERATOR", moderatorCampus: "KAMPUS_A" });
    const me = await getMe(repo, USER_ID);
    expectMatchesContract("API-ME-01", me, responseSchema("API-ME-01"));
    expect(me.moderatorCampus).toBe("KAMPUS_A");
  });
});

describe("updateMe (API-ME-02)", () => {
  it("applies a valid displayName and locale patch and audits it", async () => {
    const { repo, state } = fakeRepo();
    const me = await updateMe(repo, USER_ID, { displayName: "Budi Santoso", locale: "en" }, CTX);
    expectMatchesContract("API-ME-02", me, responseSchema("API-ME-02"));
    expect(me.displayName).toBe("Budi Santoso");
    expect(me.locale).toBe("en");
    expect(state.profileUpdates).toHaveLength(1);
    expect(state.audits).toHaveLength(1);
    expect(state.audits[0]!.action).toBe("user.profile.updated");
    expect(state.audits[0]!.entityId).toBe(USER_ID);
    expect(state.audits[0]!.requestId).toBe(CTX.requestId);
  });

  it("rejects a bad locale with 422 VALIDATION_FAILED and a field path", async () => {
    const { repo, state } = fakeRepo();
    const err = await updateMe(repo, USER_ID, { locale: "x" }, CTX).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DomainError);
    const domainError = err as DomainError;
    expect(domainError.code).toBe("VALIDATION_FAILED");
    expect(domainError.httpStatus).toBe(422);
    expect(domainError.details).toMatchObject({
      fields: [{ path: "locale", key: "error.VALIDATION_FAILED.locale" }],
    });
    expect(state.profileUpdates).toHaveLength(0);
    expect(state.audits).toHaveLength(0);
  });

  it("rejects a too-short displayName with VALIDATION_FAILED", async () => {
    const { repo } = fakeRepo();
    const err = await updateMe(repo, USER_ID, { displayName: "x" }, CTX).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe("VALIDATION_FAILED");
  });
});

describe("requestAccountDeletion (API-ME-03)", () => {
  it("schedules the account.delete job 7 days out and audits the request", async () => {
    const { repo, state } = fakeRepo();
    const { queue, scheduled } = fakeQueue();
    const result = await requestAccountDeletion(repo, queue, USER_ID, CTX);
    expectMatchesContract("API-ME-03", result, responseSchema("API-ME-03"));
    expect(new Date(result.scheduledAt).getTime()).toBe(NOW.getTime() + COOL_OFF_MS);
    expect(scheduled).toHaveLength(1);
    expect(scheduled[0]!.userId).toBe(USER_ID);
    expect(scheduled[0]!.runAt.getTime()).toBe(NOW.getTime() + COOL_OFF_MS);
    expect(state.audits).toHaveLength(1);
    expect(state.audits[0]!.action).toBe("user.deletion.requested");
    expect(state.audits[0]!.after).toMatchObject({ jobId: "job-1" });
  });

  it("is idempotent while the scheduled job is still pending", async () => {
    const { repo, state } = fakeRepo();
    const { queue, scheduled } = fakeQueue();
    const first = await requestAccountDeletion(repo, queue, USER_ID, CTX);
    const second = await requestAccountDeletion(repo, queue, USER_ID, CTX);
    expect(second.scheduledAt).toBe(first.scheduledAt);
    expect(scheduled).toHaveLength(1);
    expect(queue.schedule).toHaveBeenCalledTimes(1);
    expect(state.audits.filter((a) => a.action === "user.deletion.requested")).toHaveLength(1);
  });

  it("schedules a fresh job when the previous request already completed", async () => {
    const { repo, state } = fakeRepo();
    state.deletion = {
      jobId: "job-old",
      scheduledAt: new Date("2026-09-01T10:00:00+07:00"),
    };
    const { queue, scheduled } = fakeQueue();
    const result = await requestAccountDeletion(repo, queue, USER_ID, CTX);
    expect(scheduled).toHaveLength(1);
    expect(new Date(result.scheduledAt).getTime()).toBe(NOW.getTime() + COOL_OFF_MS);
    expect(state.audits.filter((a) => a.action === "user.deletion.requested")).toHaveLength(1);
  });
});

describe("cancelPendingDeletion (re-login cancels, FR-AUTH-005)", () => {
  it("cancels a pending job and audits the cancellation", async () => {
    const { repo, state } = fakeRepo();
    const { queue, scheduled, cancelled } = fakeQueue();
    await requestAccountDeletion(repo, queue, USER_ID, CTX);
    const cancelledOk = await cancelPendingDeletion(repo, queue, USER_ID);
    expect(cancelledOk).toBe(true);
    expect(cancelled).toEqual(["job-1"]);
    expect(scheduled).toHaveLength(1);
    expect(state.audits.some((a) => a.action === "user.deletion.cancelled")).toBe(true);
  });

  it("does nothing when no deletion is pending", async () => {
    const { repo, state } = fakeRepo();
    const { queue, cancelled } = fakeQueue();
    const cancelledOk = await cancelPendingDeletion(repo, queue, USER_ID);
    expect(cancelledOk).toBe(false);
    expect(cancelled).toHaveLength(0);
    expect(queue.cancel).not.toHaveBeenCalled();
    expect(state.audits).toHaveLength(0);
  });

  it("ignores a stale request whose job already finished", async () => {
    const { repo, state } = fakeRepo();
    state.deletion = {
      jobId: "job-done",
      scheduledAt: new Date("2026-09-01T10:00:00+07:00"),
    };
    const { queue, cancelled } = fakeQueue();
    const cancelledOk = await cancelPendingDeletion(repo, queue, USER_ID);
    expect(cancelledOk).toBe(false);
    expect(cancelled).toHaveLength(0);
    expect(state.audits).toHaveLength(0);
  });
});

describe("getPrefs (API-ME-04)", () => {
  it("returns contract defaults when the user has no preferences row", async () => {
    const { repo } = fakeRepo();
    const prefs = await getPrefs(repo, USER_ID);
    expectMatchesContract("API-ME-04", prefs, responseSchema("API-ME-04"));
    expect(prefs).toEqual({ emailEnabled: true, mutedTypes: [] });
  });

  it("returns the stored row when present", async () => {
    const { repo, state } = fakeRepo();
    state.prefs = { userId: USER_ID, emailEnabled: false, mutedTypes: ["CLAIM_REMINDER"] };
    const prefs = await getPrefs(repo, USER_ID);
    expectMatchesContract("API-ME-04", prefs, responseSchema("API-ME-04"));
    expect(prefs).toEqual({ emailEnabled: false, mutedTypes: ["CLAIM_REMINDER"] });
  });
});

describe("setPrefs (API-ME-05)", () => {
  it("round-trips the preferences and audits the write", async () => {
    const { repo, state } = fakeRepo();
    const saved = await setPrefs(
      repo,
      USER_ID,
      { emailEnabled: false, mutedTypes: ["MATCH_SUGGESTED"] },
      CTX,
    );
    expectMatchesContract("API-ME-05", saved, responseSchema("API-ME-05"));
    expect(saved).toEqual({ emailEnabled: false, mutedTypes: ["MATCH_SUGGESTED"] });
    const reread = await getPrefs(repo, USER_ID);
    expect(reread).toEqual(saved);
    expect(state.audits).toHaveLength(1);
    expect(state.audits[0]!.action).toBe("user.notification_prefs.updated");
  });

  it("rejects an unknown muted type with VALIDATION_FAILED", async () => {
    const { repo, state } = fakeRepo();
    const err = await setPrefs(
      repo,
      USER_ID,
      { emailEnabled: true, mutedTypes: ["NOT_A_TYPE"] },
      CTX,
    ).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DomainError);
    const domainError = err as DomainError;
    expect(domainError.code).toBe("VALIDATION_FAILED");
    expect(domainError.httpStatus).toBe(422);
    expect(domainError.details).toMatchObject({
      fields: [{ path: "mutedTypes.0", key: "error.VALIDATION_FAILED.mutedTypes.0" }],
    });
    expect(state.prefs).toBeNull();
  });

  it("rejects a body missing emailEnabled with VALIDATION_FAILED", async () => {
    const { repo } = fakeRepo();
    const err = await setPrefs(repo, USER_ID, { mutedTypes: [] }, CTX).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe("VALIDATION_FAILED");
  });
});
