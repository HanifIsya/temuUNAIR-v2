import { randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "@temuunair/db/src/schema";
import { loadContractApi, loadContractEnums } from "../contract-test-utils";
import { SESSION_COOKIE_NAME } from "../auth/session";
import { GET_CATEGORIES, GET_CAMPUSES, GET_DROP_POINTS, GET_LOCATIONS } from "./meta";

// TMU-BE-005 (red evidence): the four /api/v1/meta/* catalog endpoints
// (API-META-01..04, auth user-level) against a scratch database seeded with
// the M3 locations/drop-points fixtures.

const h = vi.hoisted(() => ({ getDb: vi.fn() }));

vi.mock("../db", () => ({ getDb: h.getDb }));

const { expectMatchesContract, responseSchema } = await loadContractApi();
const { Category, Campus } = await loadContractEnums();

// TS5097-style escape hatch: a static import would pull packages/db/seeds/seed.ts
// (never part of a typecheck program; db lane) into tsconfig.test.json and fail
// on its noUncheckedIndexedAccess errors.
const seedSpecifier = "@temuunair/db/seeds/seed";
const {
  dropPoints: seedDropPoints,
  generateDropPointsSql,
  generateLocationsSql,
} = (await import(seedSpecifier)) as {
  dropPoints: Array<{ name: string }>;
  generateDropPointsSql: () => string;
  generateLocationsSql: () => string;
};

const U1 = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e81";
const BASE = "http://localhost";
const META = `${BASE}/api/v1/meta`;
const scratchName = `tmu_be005_${Date.now()}_${randomBytes(4).toString("hex")}`;

function cookieHeader(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}`;
}

function get(url: string, token?: string): Request {
  const headers = new Headers();
  if (token) headers.set("cookie", cookieHeader(token));
  return new Request(url, { headers });
}

async function expectEnvelope(res: Response, status: number, code: string): Promise<void> {
  expect(res.status).toBe(status);
  const body = (await res.json()) as { error: { code: string; requestId: string } };
  expect(body.error.code).toBe(code);
  expect(body.error.requestId).toMatch(/^req_/);
  expect(res.headers.get("X-Request-Id")).toBe(body.error.requestId);
}

describe.skipIf(!process.env.DATABASE_URL)(
  "TMU-BE-005 /api/v1/meta handlers on a live database",
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
      await pool.query(generateLocationsSql());
      await pool.query(generateDropPointsSql());

      await pool.query(
        `INSERT INTO users (id, email, display_name, unair_ref, role, moderator_campus, locale, status)
           VALUES ($1, 'budi@student.unair.ac.id', 'Budi S.', 'NIM12345', 'USER', NULL, 'id', 'ACTIVE')`,
        [U1],
      );
      await pool.query(
        `INSERT INTO sessions (session_token, user_id, expires)
           VALUES ('sess-u1', $1, now() + interval '30 days')`,
        [U1],
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
      ["categories", () => GET_CATEGORIES(get(`${META}/categories`))],
      ["campuses", () => GET_CAMPUSES(get(`${META}/campuses`))],
      ["locations", () => GET_LOCATIONS(get(`${META}/locations`))],
      ["drop-points", () => GET_DROP_POINTS(get(`${META}/drop-points`))],
    ] as Array<[string, () => Promise<Response>]>)(
      "GET /meta/%s rejects an unauthenticated request with 401 AUTH_REQUIRED",
      async (_name, call) => {
        await expectEnvelope(await call(), 401, "AUTH_REQUIRED");
      },
    );

    it("GET /meta/categories serves CategoryMeta exactly per the shared Category enum (API-META-01)", async () => {
      const res = await GET_CATEGORIES(get(`${META}/categories`, "sess-u1"));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Array<{
        value: string;
        labelKey: string;
        isSensitive: boolean;
        hintPrompts: string[];
      }>;
      expectMatchesContract("API-META-01", body, responseSchema("API-META-01"));

      expect(body.map((entry) => entry.value)).toEqual([...Category]);
      for (const entry of body) {
        expect(entry.labelKey).toBe(`category.${entry.value}`);
        expect(entry.hintPrompts.length).toBeGreaterThanOrEqual(2);
        expect(entry.hintPrompts.every((prompt) => prompt.length > 0)).toBe(true);
      }
      const sensitive = body.filter((entry) => entry.isSensitive).map((entry) => entry.value);
      expect(sensitive.sort()).toEqual(["BANK_CARD", "ID_CARD", "WALLET"]);
    });

    it("GET /meta/campuses serves the Campus enum with location counts (API-META-02)", async () => {
      const res = await GET_CAMPUSES(get(`${META}/campuses`, "sess-u1"));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Array<{
        id: string;
        name: string;
        locationCount?: number;
      }>;
      expectMatchesContract("API-META-02", body, responseSchema("API-META-02"));

      expect(body.map((entry) => entry.id)).toEqual([...Campus]);
      const counts = new Map<string, number>(
        (
          await pool.query(
            `SELECT campus, count(*)::int AS count FROM locations WHERE active GROUP BY campus`,
          )
        ).rows.map((r) => [r.campus as string, r.count as number]),
      );
      for (const entry of body) {
        expect(entry.name.length).toBeGreaterThan(0);
        expect(entry.locationCount).toBe(counts.get(entry.id));
      }
    });

    it("GET /meta/locations serves every active location (API-META-03)", async () => {
      const res = await GET_LOCATIONS(get(`${META}/locations`, "sess-u1"));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Array<{ id: string; campus: string; name: string }>;
      expectMatchesContract("API-META-03", body, responseSchema("API-META-03"));

      const expected = await one<{ count: number }>(
        `SELECT count(*)::int AS count FROM locations WHERE active`,
      );
      expect(body).toHaveLength(expected!.count);
      expect(body.every((row) => Campus.includes(row.campus))).toBe(true);
      expect(body.every((row) => row.name.length > 0)).toBe(true);
    });

    it("GET /meta/locations?campus= filters to one campus", async () => {
      const res = await GET_LOCATIONS(get(`${META}/locations?campus=KAMPUS_B`, "sess-u1"));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Array<{ campus: string }>;
      expectMatchesContract("API-META-03", body, responseSchema("API-META-03"));
      expect(body.length).toBeGreaterThan(0);
      expect(body.every((row) => row.campus === "KAMPUS_B")).toBe(true);
    });

    it("GET /meta/locations rejects an unknown campus filter with 422 VALIDATION_FAILED", async () => {
      const res = await GET_LOCATIONS(get(`${META}/locations?campus=KAMPUS_X`, "sess-u1"));
      expect(res.status).toBe(422);
      const body = (await res.json()) as {
        error: { code: string; details?: { fields?: Array<{ path: string }> } };
      };
      expect(body.error.code).toBe("VALIDATION_FAILED");
      expect(body.error.details?.fields?.[0]?.path).toBe("campus");
    });

    it("GET /meta/drop-points serves seeded drop points (API-META-04)", async () => {
      const res = await GET_DROP_POINTS(get(`${META}/drop-points`, "sess-u1"));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Array<{
        id: string;
        campus: string;
        name: string;
        locationId?: string;
        hours?: string;
        contactNote?: string;
        active: boolean;
      }>;
      expectMatchesContract("API-META-04", body, responseSchema("API-META-04"));

      expect(body).toHaveLength(seedDropPoints.length);
      expect(body.every((row) => row.active)).toBe(true);
      expect(body.every((row) => Campus.includes(row.campus))).toBe(true);

      const withHours = body.find((row) => row.name === "Satpam Rektorat");
      expect(withHours).toBeDefined();
      expect(typeof withHours!.hours).toBe("string");
      expect(withHours!.hours).toContain("07:00-17:00");
      expect(typeof withHours!.contactNote).toBe("string");
      expect(withHours!.locationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it("GET /meta/drop-points?campus= filters to one campus", async () => {
      const res = await GET_DROP_POINTS(get(`${META}/drop-points?campus=KAMPUS_A`, "sess-u1"));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Array<{ campus: string }>;
      expectMatchesContract("API-META-04", body, responseSchema("API-META-04"));
      expect(body).toHaveLength(2);
      expect(body.every((row) => row.campus === "KAMPUS_A")).toBe(true);
    });

    it("GET /meta/drop-points rejects an unknown campus filter with 422, never a 500", async () => {
      const res = await GET_DROP_POINTS(get(`${META}/drop-points?campus=NOPE`, "sess-u1"));
      await expectEnvelope(res, 422, "VALIDATION_FAILED");
    });
  },
);
