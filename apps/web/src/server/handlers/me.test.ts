import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "@temuunair/db/src/schema";
import { loadContractApi } from "../contract-test-utils";
import { SESSION_COOKIE_NAME } from "../auth/session";
import { DELETE, GET, PATCH } from "./me";
import { GET as GET_PREFS, PUT as PUT_PREFS } from "./me-preferences";

// TMU-BE-003 (red evidence): live /api/v1/me + /api/v1/me/notification-preferences
// handlers against a scratch database (BE-01 envelope, BE-09 auth/CSRF, API-ME-01..05,
// FR-AUTH-004 deletion cool-off, FR-AUTH-005 re-login cancels, FR-NTF-006 prefs).

const h = vi.hoisted(() => {
  const state = {
    scheduled: [] as Array<{ userId: string; runAt: Date }>,
    cancelled: [] as string[],
    jobs: new Set<string>(),
    pendingByUser: new Map<string, string>(),
    scheduleCalls: 0,
  };
  return { state, getDb: vi.fn() };
});

vi.mock("../db", () => ({ getDb: h.getDb }));

vi.mock("../services/deletion-queue", () => ({
  getDeletionQueue: () => ({
    schedule: async (userId: string, runAt: Date): Promise<string | null> => {
      h.state.scheduleCalls += 1;
      if (h.state.pendingByUser.has(userId)) return null;
      const jobId = `job-${h.state.scheduled.length + 1}`;
      h.state.pendingByUser.set(userId, jobId);
      h.state.jobs.add(jobId);
      h.state.scheduled.push({ userId, runAt });
      return jobId;
    },
    cancel: async (jobId: string): Promise<void> => {
      h.state.cancelled.push(jobId);
      h.state.jobs.delete(jobId);
      for (const [userId, pending] of h.state.pendingByUser) {
        if (pending === jobId) h.state.pendingByUser.delete(userId);
      }
    },
    isPending: async (jobId: string): Promise<boolean> => h.state.jobs.has(jobId),
  }),
}));

const { expectMatchesContract, responseSchema } = await loadContractApi();

const U1 = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e81";
const U2 = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82";
const U3 = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e83";
const BASE = "http://localhost";
const ME_URL = `${BASE}/api/v1/me`;
const PREFS_URL = `${BASE}/api/v1/me/notification-preferences`;
const DAY_MS = 86_400_000;
const COOL_OFF_MS = 7 * DAY_MS;
const scratchName = `tmu_be003_${Date.now()}_${randomBytes(4).toString("hex")}`;

function cookieHeader(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}`;
}

function withSession(token: string, init: RequestInit = {}): Request {
  const headers = new Headers(init.headers);
  headers.set("cookie", cookieHeader(token));
  return new Request(ME_URL, { ...init, headers });
}

function mutation(
  url: string,
  token: string,
  body: unknown,
  opts: { csrf?: boolean; method?: string } = {},
): Request {
  const headers = new Headers({ "content-type": "application/json" });
  headers.set("cookie", cookieHeader(token));
  if (opts.csrf !== false) {
    headers.set("x-requested-with", "temuunair");
    headers.set("origin", BASE);
  }
  return new Request(url, { method: opts.method ?? "POST", headers, body: JSON.stringify(body) });
}

async function expectEnvelope(res: Response, status: number, code: string): Promise<void> {
  expect(res.status).toBe(status);
  const body = (await res.json()) as { error: { code: string; requestId: string } };
  expect(body.error.code).toBe(code);
  expect(body.error.requestId).toMatch(/^req_/);
  expect(res.headers.get("X-Request-Id")).toBe(body.error.requestId);
}

describe.skipIf(!process.env.DATABASE_URL)(
  "TMU-BE-003 /api/v1/me handlers on a live database",
  () => {
    const scratchUrl = (() => {
      const url = new URL(process.env.DATABASE_URL ?? "postgres://localhost:1");
      url.pathname = `/${scratchName}`;
      return url.toString();
    })();

    let pool: Pool;

    async function one<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
      const result = await pool.query(sql, params);
      return result.rows[0] as T | undefined;
    }

    beforeAll(async () => {
      const admin = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
      await admin.query(`CREATE DATABASE ${scratchName}`);
      await admin.end();

      pool = new Pool({ connectionString: scratchUrl, max: 1 });
      await migrate(drizzle(pool), { migrationsFolder: "packages/db/migrations" });

      await pool.query(
        `INSERT INTO users (id, email, display_name, unair_ref, role, moderator_campus, locale, status)
           VALUES
            ($1, 'budi@student.unair.ac.id', 'Budi S.', 'NIM12345', 'USER', NULL, 'id', 'ACTIVE'),
            ($2, 'susi@student.unair.ac.id', 'Susi W.', NULL, 'USER', NULL, 'id', 'SUSPENDED'),
            ($3, 'admin@unair.ac.id', 'Admin U.', NULL, 'MODERATOR', 'KAMPUS_A', 'id', 'ACTIVE')`,
        [U1, U2, U3],
      );
      await pool.query(
        `INSERT INTO sessions (session_token, user_id, expires) VALUES
            ('sess-u1-valid', $1, now() + interval '30 days'),
            ('sess-u1-soon', $1, now() + interval '10 days'),
            ('sess-u1-expired', $1, now() - interval '1 day'),
            ('sess-u2', $2, now() + interval '30 days'),
            ('sess-u3', $3, now() + interval '30 days')`,
        [U1, U2, U3],
      );

      const db = drizzle(pool, { schema });
      h.getDb.mockReturnValue(db);
    }, 180_000);

    afterAll(async () => {
      await pool?.end();
      const admin = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
      try {
        await admin.query(`DROP DATABASE IF EXISTS ${scratchName} WITH (FORCE)`);
      } finally {
        await admin.end();
      }
    }, 60_000);

    it.each([
      ["GET /me", () => GET(new Request(ME_URL))],
      [
        "PATCH /me",
        () =>
          PATCH(
            new Request(ME_URL, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: "{}",
            }),
          ),
      ],
      ["DELETE /me", () => DELETE(new Request(ME_URL, { method: "DELETE" }))],
      ["GET prefs", () => GET_PREFS(new Request(PREFS_URL))],
      [
        "PUT prefs",
        () =>
          PUT_PREFS(
            new Request(PREFS_URL, {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: "{}",
            }),
          ),
      ],
    ] as Array<[string, () => Promise<Response>]>)(
      "%s rejects an unauthenticated request with 401 AUTH_REQUIRED",
      async (_name, call) => {
        await expectEnvelope(await call(), 401, "AUTH_REQUIRED");
      },
    );

    it("GET /me rejects an expired session with 401", async () => {
      const res = await GET(withSession("sess-u1-expired"));
      await expectEnvelope(res, 401, "AUTH_REQUIRED");
    });

    it("GET /me rejects a suspended account with 403 ACCOUNT_SUSPENDED", async () => {
      const res = await GET(withSession("sess-u2"));
      await expectEnvelope(res, 403, "ACCOUNT_SUSPENDED");
    });

    it("GET /me returns the API-ME-01 projection without private fields", async () => {
      const res = await GET(withSession("sess-u1-valid"));
      expect(res.status).toBe(200);
      expect(res.headers.get("X-Request-Id")).toMatch(/^req_/);
      const body = (await res.json()) as Record<string, unknown>;
      expectMatchesContract("API-ME-01", body, responseSchema("API-ME-01"));
      expect(body).not.toHaveProperty("unairRef");
      expect(body.id).toBe(U1);
      expect(JSON.stringify(body)).not.toContain("NIM12345");
    });

    it("GET /me includes moderatorCampus for staff callers", async () => {
      const res = await GET(withSession("sess-u3"));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      expectMatchesContract("API-ME-01", body, responseSchema("API-ME-01"));
      expect(body.moderatorCampus).toBe("KAMPUS_A");
    });

    it("slides the session expiry when it is inside the 30-day window", async () => {
      const before = await one<{ expires: Date }>(
        `SELECT expires FROM sessions WHERE session_token = 'sess-u1-soon'`,
      );
      expect(before!.expires.getTime()).toBeLessThan(Date.now() + 30 * DAY_MS);
      const res = await GET(withSession("sess-u1-soon"));
      expect(res.status).toBe(200);
      const after = await one<{ expires: Date }>(
        `SELECT expires FROM sessions WHERE session_token = 'sess-u1-soon'`,
      );
      expect(after!.expires.getTime()).toBeGreaterThanOrEqual(Date.now() + 29 * DAY_MS);
    });

    it("PATCH /me rejects a mutation without X-Requested-With with 403 FORBIDDEN", async () => {
      const headers = new Headers({ "content-type": "application/json", origin: BASE });
      headers.set("cookie", cookieHeader("sess-u1-valid"));
      const res = await PATCH(
        new Request(ME_URL, { method: "PATCH", headers, body: JSON.stringify({ locale: "en" }) }),
      );
      await expectEnvelope(res, 403, "FORBIDDEN");
    });

    it("PATCH /me rejects a cross-origin mutation with 403 FORBIDDEN", async () => {
      const headers = new Headers({
        "content-type": "application/json",
        "x-requested-with": "temuunair",
        origin: "https://evil.example",
      });
      headers.set("cookie", cookieHeader("sess-u1-valid"));
      const res = await PATCH(
        new Request(ME_URL, { method: "PATCH", headers, body: JSON.stringify({ locale: "en" }) }),
      );
      await expectEnvelope(res, 403, "FORBIDDEN");
    });

    it("PATCH /me rejects a bad locale with 422 VALIDATION_FAILED", async () => {
      const res = await PATCH(
        mutation(ME_URL, "sess-u1-valid", { locale: "x" }, { method: "PATCH" }),
      );
      expect(res.status).toBe(422);
      const body = (await res.json()) as {
        error: { code: string; details?: { fields?: Array<{ path: string }> } };
      };
      expect(body.error.code).toBe("VALIDATION_FAILED");
      expect(body.error.details?.fields?.[0]?.path).toBe("locale");
    });

    it("PATCH /me applies a valid profile patch (API-ME-02) and persists it", async () => {
      const res = await PATCH(
        mutation(
          ME_URL,
          "sess-u1-valid",
          { displayName: "Budi Santoso", locale: "en" },
          { method: "PATCH" },
        ),
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      expectMatchesContract("API-ME-02", body, responseSchema("API-ME-02"));
      expect(body.displayName).toBe("Budi Santoso");
      const row = await one<{ displayName: string; locale: string }>(
        `SELECT display_name AS "displayName", locale FROM users WHERE id = $1`,
        [U1],
      );
      expect(row).toEqual({ displayName: "Budi Santoso", locale: "en" });
    });

    it("DELETE /me rejects a suspended account with 403 before scheduling anything", async () => {
      const before = h.state.scheduleCalls;
      const res = await DELETE(mutation(ME_URL, "sess-u2", undefined, { method: "DELETE" }));
      await expectEnvelope(res, 403, "ACCOUNT_SUSPENDED");
      expect(h.state.scheduleCalls).toBe(before);
    });

    it("DELETE /me schedules the cool-off job and audits it (API-ME-03, 202)", async () => {
      const res = await DELETE(mutation(ME_URL, "sess-u1-valid", undefined, { method: "DELETE" }));
      expect(res.status).toBe(202);
      const body = (await res.json()) as { scheduledAt: string };
      expectMatchesContract("API-ME-03", body, responseSchema("API-ME-03"));
      expect(new Date(body.scheduledAt).getTime()).toBeGreaterThan(Date.now() + COOL_OFF_MS - 5000);
      expect(new Date(body.scheduledAt).getTime()).toBeLessThanOrEqual(Date.now() + COOL_OFF_MS);

      expect(h.state.scheduleCalls).toBe(1);
      expect(h.state.scheduled).toHaveLength(1);
      expect(h.state.scheduled[0]!.userId).toBe(U1);
      expect(h.state.scheduled[0]!.runAt.toISOString()).toBe(body.scheduledAt);

      const audit = await one<{ action: string; after: { jobId?: string; scheduledAt?: string } }>(
        `SELECT action, after FROM audit_logs WHERE entity_id = $1 AND action = 'user.deletion.requested'`,
        [U1],
      );
      expect(audit?.action).toBe("user.deletion.requested");
      expect(audit?.after.jobId).toBe("job-1");
      expect(audit?.after.scheduledAt).toBe(body.scheduledAt);
    });

    it("DELETE /me is idempotent while the job is pending (same scheduledAt, no new work)", async () => {
      const res = await DELETE(mutation(ME_URL, "sess-u1-valid", undefined, { method: "DELETE" }));
      expect(res.status).toBe(202);
      const body = (await res.json()) as { scheduledAt: string };
      expect(h.state.scheduleCalls).toBe(1);
      expect(h.state.scheduled).toHaveLength(1);
      const audits = await pool.query(
        `SELECT id FROM audit_logs WHERE entity_id = $1 AND action = 'user.deletion.requested'`,
        [U1],
      );
      expect(audits.rowCount).toBe(1);
      const audit = await one<{ after: { scheduledAt?: string } }>(
        `SELECT after FROM audit_logs WHERE entity_id = $1 AND action = 'user.deletion.requested'`,
        [U1],
      );
      expect(audit?.after.scheduledAt).toBe(body.scheduledAt);
    });

    it("GET prefs returns the API-ME-04 defaults before any write", async () => {
      const res = await GET_PREFS(
        new Request(PREFS_URL, { headers: { cookie: cookieHeader("sess-u1-valid") } }),
      );
      expect(res.status).toBe(200);
      const body = (await res.json()) as unknown;
      expectMatchesContract("API-ME-04", body, responseSchema("API-ME-04"));
      expect(body).toEqual({ emailEnabled: true, mutedTypes: [] });
    });

    it("PUT prefs round-trips the preferences (API-ME-05) and persists them", async () => {
      const put = await PUT_PREFS(
        mutation(
          PREFS_URL,
          "sess-u1-valid",
          { emailEnabled: false, mutedTypes: ["MATCH_SUGGESTED"] },
          { method: "PUT" },
        ),
      );
      expect(put.status).toBe(200);
      const saved = (await put.json()) as unknown;
      expectMatchesContract("API-ME-05", saved, responseSchema("API-ME-05"));
      expect(saved).toEqual({ emailEnabled: false, mutedTypes: ["MATCH_SUGGESTED"] });

      const row = await one<{ emailEnabled: boolean; mutedTypes: string[] }>(
        `SELECT email_enabled AS "emailEnabled", muted_types AS "mutedTypes" FROM notification_prefs WHERE user_id = $1`,
        [U1],
      );
      expect(row).toEqual({ emailEnabled: false, mutedTypes: ["MATCH_SUGGESTED"] });

      const get = await GET_PREFS(
        new Request(PREFS_URL, { headers: { cookie: cookieHeader("sess-u1-valid") } }),
      );
      expect(get.status).toBe(200);
      const reread = (await get.json()) as unknown;
      expectMatchesContract("API-ME-04", reread, responseSchema("API-ME-04"));
      expect(reread).toEqual({ emailEnabled: false, mutedTypes: ["MATCH_SUGGESTED"] });
    });

    it("PUT prefs rejects an unknown muted type with 422 VALIDATION_FAILED", async () => {
      const res = await PUT_PREFS(
        mutation(
          PREFS_URL,
          "sess-u1-valid",
          { emailEnabled: true, mutedTypes: ["BOGUS"] },
          { method: "PUT" },
        ),
      );
      expect(res.status).toBe(422);
      const body = (await res.json()) as {
        error: { code: string; details?: { fields?: Array<{ path: string }> } };
      };
      expect(body.error.code).toBe("VALIDATION_FAILED");
      expect(body.error.details?.fields?.[0]?.path).toBe("mutedTypes.0");
    });
  },
);
