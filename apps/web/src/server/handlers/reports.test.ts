import { randomBytes, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "@temuunair/db/src/schema";
import { loadContractApi } from "../contract-test-utils";
import { SESSION_COOKIE_NAME } from "../auth/session";
import { decryptFieldAnswer } from "../services/field-crypto";
import { GET_BY_ID, GET_LIST, POST } from "./reports";

// TMU-BE-006 (red evidence): the walking-skeleton report path against a live
// scratch database — API-REP-01 (cross-field matrix, idempotency, rate limit,
// report.process enqueue, encrypted hints), API-REP-02 (opposite-type default,
// visibility, filters, keyset pagination, sensitive masking) and API-REP-04
// (public/owner/moderator view selection with masking in the mapper).

const h = vi.hoisted(() => {
  process.env.RATE_LIMIT_ENABLED = "false";
  process.env.FIELD_ENCRYPTION_KEY = Buffer.from("a".repeat(32)).toString("base64");
  return {
    getDb: vi.fn(),
    presignGet: vi.fn(async (key: string) => `https://storage.test/${key}?X-Amz-Signature=fake`),
    enqueue: vi.fn(async (_reportId: string) => "job-1"),
  };
});

vi.mock("../db", () => ({ getDb: h.getDb }));
vi.mock("../storage", () => ({ getStorage: () => ({ presignGet: h.presignGet }) }));
vi.mock("../jobs/report-process", () => ({
  getReportProcessQueue: () => ({ enqueue: h.enqueue }),
}));

const { expectMatchesContract, responseSchema } = await loadContractApi();

const U1 = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e01"; // creator/owner (USER)
const U2 = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e02"; // other user (USER)
const U3 = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e03"; // moderator KAMPUS_A
const U4 = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e04"; // admin
const U5 = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e05"; // rate-limit subject
const BASE = "http://localhost";
const REPORTS_URL = `${BASE}/api/v1/reports`;
const scratchName = `tmu_be006_${Date.now()}_${randomBytes(4).toString("hex")}`;

function cookieHeader(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}`;
}

function idCtx(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

async function expectEnvelope(res: Response, status: number, code: string): Promise<void> {
  expect(res.status).toBe(status);
  const body = (await res.json()) as { error: { code: string; requestId: string } };
  expect(body.error.code).toBe(code);
  expect(body.error.requestId).toMatch(/^req_/);
  expect(res.headers.get("X-Request-Id")).toBe(body.error.requestId);
}

async function expectFieldPath(res: Response, path: string): Promise<void> {
  expect(res.status).toBe(422);
  const body = (await res.json()) as {
    error: { code: string; details?: { fields?: Array<{ path: string }> } };
  };
  expect(body.error.code).toBe("VALIDATION_FAILED");
  const paths = body.error.details?.fields?.map((f) => f.path) ?? [];
  expect(paths.some((p) => p === path || p.startsWith(`${path}.`))).toBe(true);
}

function createRequest(
  token: string,
  body: unknown,
  opts: { csrf?: boolean; idempotencyKey?: string | null } = {},
): Request {
  const headers = new Headers({ "content-type": "application/json" });
  headers.set("cookie", cookieHeader(token));
  if (opts.csrf !== false) {
    headers.set("x-requested-with", "temuunair");
    headers.set("origin", BASE);
  }
  if (opts.idempotencyKey !== null) {
    headers.set("idempotency-key", opts.idempotencyKey ?? `key-${randomBytes(6).toString("hex")}`);
  }
  return new Request(REPORTS_URL, { method: "POST", headers, body: JSON.stringify(body) });
}

function listRequest(token: string, query = ""): Request {
  return new Request(`${REPORTS_URL}${query}`, { headers: { cookie: cookieHeader(token) } });
}

function detailRequest(token: string, id: string): Request {
  return new Request(`${REPORTS_URL}/${id}`, { headers: { cookie: cookieHeader(token) } });
}

function lostBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    type: "LOST",
    category: "BAG",
    title: "Tas ransel biru",
    description: "Tas ransel biru tua, ada gantungan kunci kuning.",
    colors: ["Biru"],
    brand: "Eiger",
    location: { campus: "KAMPUS_B" },
    occurredAt: { from: isoDaysAgo(6) },
    ...overrides,
  };
}

function foundBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    type: "FOUND",
    category: "PHONE",
    title: "Samsung Galaxy A54 hitam",
    description: "Ponsel hitam dengan casing matte, layar pecah di pojok kanan.",
    colors: ["Hitam"],
    location: { campus: "KAMPUS_A" },
    occurredAt: { from: isoDaysAgo(2) },
    custody: "HELD_BY_FINDER",
    hints: [{ prompt: "Apa warna casingnya?", answer: "Hitam matte" }],
    ...overrides,
  };
}

async function createReport(
  token: string,
  body: unknown,
  opts: { csrf?: boolean; idempotencyKey?: string | null } = {},
): Promise<Response> {
  return POST(createRequest(token, body, opts));
}

describe.skipIf(!process.env.DATABASE_URL)(
  "TMU-BE-006 /api/v1/reports handlers on a live database",
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

    async function seedUpload(
      uploaderId: string,
      opts: { status?: string; reportId?: string | null; maskedKey?: string | null } = {},
    ): Promise<string> {
      const id = randomUUID();
      const { status = "READY", reportId = null, maskedKey = null } = opts;
      await pool.query(
        `INSERT INTO report_images (id, report_id, uploader_id, storage_key, thumb_key, masked_key, mime, width, height, status, position)
         VALUES ($1, $2, $3, $4, $5, $6, 'image/jpeg', 640, 480, $7, 0)`,
        [id, reportId, uploaderId, `uploads/${id}`, `uploads/${id}_thumb.jpg`, maskedKey, status],
      );
      return id;
    }

    interface SeedReportOpts {
      reporter: string;
      type: "LOST" | "FOUND";
      status?: string;
      category?: string;
      campus?: string;
      title?: string;
      description?: string;
      sensitive?: boolean;
      custody?: string | null;
      occurredFrom?: Date;
      createdAt?: Date;
    }

    async function seedReport(opts: SeedReportOpts): Promise<string> {
      const id = randomUUID();
      const {
        reporter,
        type,
        status = "OPEN",
        category = "BAG",
        campus = "KAMPUS_A",
        title = "Barang contoh",
        description = "Deskripsi contoh untuk pengujian laporan.",
        sensitive = false,
        custody = type === "FOUND" ? "HELD_BY_FINDER" : null,
        occurredFrom = new Date(Date.now() - 3 * 86_400_000),
        createdAt = new Date(),
      } = opts;
      await pool.query(
        `INSERT INTO reports (id, type, status, reporter_id, category, is_sensitive, title, description, colors, campus, occurred_from, custody, expires_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '{}', $9, $10, $11, now() + interval '90 days', $12, now())`,
        [
          id,
          type,
          status,
          reporter,
          category,
          sensitive,
          title,
          description,
          campus,
          occurredFrom,
          custody,
          createdAt,
        ],
      );
      return id;
    }

    async function seedHint(reportId: string, prompt: string, answer: string): Promise<void> {
      const { encryptFieldAnswer } = await import("../services/field-crypto");
      const key = process.env.FIELD_ENCRYPTION_KEY as string;
      await pool.query(
        `INSERT INTO verification_hints (id, report_id, prompt, answer_enc) VALUES ($1, $2, $3, $4)`,
        [randomUUID(), reportId, prompt, encryptFieldAnswer(key, answer)],
      );
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
            ($2, 'susi@student.unair.ac.id', 'Susi W.', NULL, 'USER', NULL, 'id', 'ACTIVE'),
            ($3, 'mod@unair.ac.id', 'Moderator M.', NULL, 'MODERATOR', 'KAMPUS_A', 'id', 'ACTIVE'),
            ($4, 'admin@unair.ac.id', 'Admin A.', NULL, 'ADMIN', NULL, 'id', 'ACTIVE'),
            ($5, 'rani@student.unair.ac.id', 'Rani R.', NULL, 'USER', NULL, 'id', 'ACTIVE')`,
        [U1, U2, U3, U4, U5],
      );
      await pool.query(
        `INSERT INTO sessions (session_token, user_id, expires) VALUES
            ('sess-u1', $1, now() + interval '30 days'),
            ('sess-u2', $2, now() + interval '30 days'),
            ('sess-u3', $3, now() + interval '30 days'),
            ('sess-u4', $4, now() + interval '30 days'),
            ('sess-u5', $5, now() + interval '30 days')`,
        [U1, U2, U3, U4, U5],
      );

      const seedSpecifier = "@temuunair/db/seeds/seed";
      const { generateLocationsSql, generateDropPointsSql } = (await import(seedSpecifier)) as {
        generateLocationsSql: () => string;
        generateDropPointsSql: () => string;
      };
      await pool.query(generateLocationsSql());
      await pool.query(generateDropPointsSql());

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

    describe("API-REP-01 POST /reports", () => {
      it("rejects an unauthenticated request with 401 AUTH_REQUIRED", async () => {
        const res = await POST(
          new Request(REPORTS_URL, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(lostBody()),
          }),
        );
        await expectEnvelope(res, 401, "AUTH_REQUIRED");
      });

      it("rejects a mutation without CSRF headers with 403 FORBIDDEN", async () => {
        const res = await createReport("sess-u1", lostBody(), { csrf: false });
        await expectEnvelope(res, 403, "FORBIDDEN");
      });

      it("rejects a missing Idempotency-Key with 422 VALIDATION_FAILED", async () => {
        const res = await createReport("sess-u1", lostBody(), { idempotencyKey: null });
        await expectFieldPath(res, "Idempotency-Key");
      });

      it("rejects a FOUND report without an image (TC-REP-002)", async () => {
        const res = await createReport("sess-u1", foundBody({ imageIds: [] }));
        await expectFieldPath(res, "imageIds");
      });

      it("rejects a FOUND report without custody (TC-REP-003)", async () => {
        const imageId = await seedUpload(U1);
        const res = await createReport(
          "sess-u1",
          foundBody({ custody: undefined, imageIds: [imageId] }),
        );
        await expectFieldPath(res, "custody");
      });

      it("rejects a FOUND report without hints (FR-REP-001)", async () => {
        const imageId = await seedUpload(U1);
        const res = await createReport("sess-u1", foundBody({ hints: [], imageIds: [imageId] }));
        await expectFieldPath(res, "hints");
      });

      it("rejects a sensitive FOUND report with 1 hint and accepts 2 (TC-REP-004)", async () => {
        const oneHint = await seedUpload(U1);
        const rejected = await createReport(
          "sess-u1",
          foundBody({
            category: "ID_CARD",
            title: "KTM tertinggal",
            description: "KTM biru tertinggal di lobi FK, nama terlihat jelas.",
            imageIds: [oneHint],
            hints: [{ prompt: "Nama depan di kartu?", answer: "Budi" }],
          }),
        );
        await expectFieldPath(rejected, "hints");

        const twoHints = await seedUpload(U1);
        const res = await createReport(
          "sess-u1",
          foundBody({
            category: "ID_CARD",
            title: "KTM tertinggal",
            description: "KTM biru tertinggal di lobi FK, nama terlihat jelas.",
            imageIds: [twoHints],
            hints: [
              { prompt: "Nama depan di kartu?", answer: "Budi" },
              { prompt: "Ada tanda tangan di belakang?", answer: "Ada" },
            ],
          }),
        );
        expect(res.status).toBe(201);
        const body = (await res.json()) as { isSensitive: boolean };
        expect(body.isSensitive).toBe(true);
      });

      it("rejects LOST with custody or hints (TC-REP-005)", async () => {
        const withCustody = await createReport("sess-u1", lostBody({ custody: "AT_DROP_POINT" }));
        await expectFieldPath(withCustody, "custody");

        const withHints = await createReport(
          "sess-u1",
          lostBody({ hints: [{ prompt: "Apa isinya?", answer: "Kartu" }] }),
        );
        await expectFieldPath(withHints, "hints");
      });

      it("accepts LOST without images (TC-REP-006)", async () => {
        const res = await createReport("sess-u1", lostBody());
        expect(res.status).toBe(201);
        const body = (await res.json()) as { status: string; type: string };
        expect(body.status).toBe("OPEN");
        expect(body.type).toBe("LOST");
      });

      it("rejects a future occurredAt.from (TC-REP-007)", async () => {
        const res = await createReport(
          "sess-u1",
          lostBody({ occurredAt: { from: isoDaysAgo(-1) } }),
        );
        await expectFieldPath(res, "occurredAt.from");
      });

      it("rejects LOST older than 180 days but accepts FOUND (TC-REP-008)", async () => {
        const rejected = await createReport(
          "sess-u1",
          lostBody({ occurredAt: { from: isoDaysAgo(200) } }),
        );
        await expectFieldPath(rejected, "occurredAt.from");

        const imageId = await seedUpload(U1);
        const accepted = await createReport(
          "sess-u1",
          foundBody({ occurredAt: { from: isoDaysAgo(200) }, imageIds: [imageId] }),
        );
        expect(accepted.status).toBe(201);
      });

      it("rejects title/description outside bounds (TC-REP-009)", async () => {
        const shortTitle = await createReport("sess-u1", lostBody({ title: "ab" }));
        await expectFieldPath(shortTitle, "title");

        const shortDescription = await createReport("sess-u1", lostBody({ description: "pendek" }));
        await expectFieldPath(shortDescription, "description");
      });

      it("rejects more than 5 images with 409 UPLOAD_LIMIT_REACHED (TC-REP-011)", async () => {
        const ids = await Promise.all(Array.from({ length: 6 }, () => seedUpload(U1)));
        const res = await createReport("sess-u1", foundBody({ imageIds: ids }));
        await expectEnvelope(res, 409, "UPLOAD_LIMIT_REACHED");
      });

      it("rejects another user's upload (TC-REP-010)", async () => {
        const foreign = await seedUpload(U2);
        const res = await createReport("sess-u1", foundBody({ imageIds: [foreign] }));
        await expectFieldPath(res, "imageIds");
      });

      it("rejects an upload that is not READY or already linked", async () => {
        const pending = await seedUpload(U1, { status: "PENDING" });
        const pendingRes = await createReport("sess-u1", foundBody({ imageIds: [pending] }));
        await expectFieldPath(pendingRes, "imageIds");

        const holder = await seedReport({ reporter: U1, type: "LOST" });
        const linked = await seedUpload(U1, { reportId: holder });
        const linkedRes = await createReport("sess-u1", foundBody({ imageIds: [linked] }));
        await expectFieldPath(linkedRes, "imageIds");
      });

      it("validates custody/drop point combinations (FR-REP-004)", async () => {
        const image1 = await seedUpload(U1);
        const missingDrop = await createReport(
          "sess-u1",
          foundBody({ custody: "AT_DROP_POINT", imageIds: [image1] }),
        );
        await expectFieldPath(missingDrop, "dropPointId");

        const image2 = await seedUpload(U1);
        const unknownDrop = await createReport(
          "sess-u1",
          foundBody({
            custody: "AT_DROP_POINT",
            dropPointId: randomUUID(),
            imageIds: [image2],
          }),
        );
        await expectFieldPath(unknownDrop, "dropPointId");

        const image3 = await seedUpload(U1);
        const foreignDrop = await createReport(
          "sess-u1",
          foundBody({ custody: "HELD_BY_FINDER", dropPointId: randomUUID(), imageIds: [image3] }),
        );
        await expectFieldPath(foreignDrop, "dropPointId");
      });

      it("accepts AT_DROP_POINT with a valid seeded drop point", async () => {
        const row = await one<{ id: string }>(`SELECT id FROM drop_points LIMIT 1`);
        const imageId = await seedUpload(U1);
        const res = await createReport(
          "sess-u1",
          foundBody({
            custody: "AT_DROP_POINT",
            dropPointId: row!.id,
            imageIds: [imageId],
            location: { campus: "KAMPUS_A" },
          }),
        );
        expect(res.status).toBe(201);
        const body = (await res.json()) as { custody: string };
        expect(body.custody).toBe("AT_DROP_POINT");
      });

      it("rejects an unknown locationId and invalid enums", async () => {
        const badLocation = await createReport(
          "sess-u1",
          lostBody({ location: { campus: "KAMPUS_A", locationId: randomUUID() } }),
        );
        await expectFieldPath(badLocation, "location.locationId");

        const badCampus = await createReport(
          "sess-u1",
          lostBody({ location: { campus: "KAMPUS_Z" } }),
        );
        await expectFieldPath(badCampus, "location.campus");

        const badCategory = await createReport("sess-u1", lostBody({ category: "NOT_A_CATEGORY" }));
        await expectFieldPath(badCategory, "category");
      });

      it("rejects more than 3 hints for FOUND (FR-REP-005)", async () => {
        const imageId = await seedUpload(U1);
        const res = await createReport(
          "sess-u1",
          foundBody({
            imageIds: [imageId],
            hints: [
              { prompt: "Pertanyaan satu?", answer: "satu" },
              { prompt: "Pertanyaan dua?", answer: "dua" },
              { prompt: "Pertanyaan tiga?", answer: "tiga" },
              { prompt: "Pertanyaan empat?", answer: "empat" },
            ],
          }),
        );
        await expectFieldPath(res, "hints");
      });

      it("rejects an occurredAt.to earlier than from", async () => {
        const res = await createReport(
          "sess-u1",
          lostBody({ occurredAt: { from: isoDaysAgo(5), to: isoDaysAgo(10) } }),
        );
        await expectFieldPath(res, "occurredAt.to");
      });

      it("creates a FOUND report, links READY uploads, encrypts hint answers and enqueues report.process (TC-REP-001/012)", async () => {
        const imageId = await seedUpload(U1);
        const before = h.enqueue.mock.calls.length;
        const key = `key-${randomBytes(6).toString("hex")}`;

        const res = await createReport("sess-u1", foundBody({ imageIds: [imageId] }), {
          idempotencyKey: key,
        });
        expect(res.status).toBe(201);
        const body = (await res.json()) as {
          id: string;
          status: string;
          version: number;
          matchCount: number;
          hintPrompts: string[];
          expiresAt: string;
          images: Array<{ id: string; url: string | null }>;
          custody: string;
        };
        expectMatchesContract("API-REP-01", body, responseSchema("API-REP-01"));
        expect(body.status).toBe("OPEN");
        expect(body.version).toBe(1);
        expect(body.matchCount).toBe(0);
        expect(body.hintPrompts).toEqual(["Apa warna casingnya?"]);
        expect(new Date(body.expiresAt).getTime()).toBeGreaterThan(Date.now());
        expect(body.images).toHaveLength(1);
        expect(body.images[0]!.id).toBe(imageId);
        expect(body.images[0]!.url).toContain("https://storage.test/");
        expect(JSON.stringify(body)).not.toContain("Hitam matte");

        const report = await one<{ id: string; reporterId: string; isSensitive: boolean }>(
          `SELECT id, reporter_id AS "reporterId", is_sensitive AS "isSensitive" FROM reports WHERE id = $1`,
          [body.id],
        );
        expect(report?.reporterId).toBe(U1);
        expect(report?.isSensitive).toBe(false);

        const linked = await one<{ reportId: string; position: number }>(
          `SELECT report_id AS "reportId", position FROM report_images WHERE id = $1`,
          [imageId],
        );
        expect(linked?.reportId).toBe(body.id);

        const hint = await one<{ answerEnc: Buffer; prompt: string }>(
          `SELECT prompt, answer_enc AS "answerEnc" FROM verification_hints WHERE report_id = $1`,
          [body.id],
        );
        expect(hint?.prompt).toBe("Apa warna casingnya?");
        expect(hint!.answerEnc.toString("utf8")).not.toContain("Hitam matte");
        expect(
          decryptFieldAnswer(process.env.FIELD_ENCRYPTION_KEY as string, hint!.answerEnc),
        ).toBe("Hitam matte");

        expect(h.enqueue.mock.calls.length).toBe(before + 1);
        expect(h.enqueue).toHaveBeenLastCalledWith(body.id);
      });

      it("replays the original response for the same key+body and skips re-enqueue (TC-REP-013)", async () => {
        const key = `key-${randomBytes(6).toString("hex")}`;
        const body = lostBody();
        const first = await createReport("sess-u1", body, { idempotencyKey: key });
        expect(first.status).toBe(201);
        const firstBody = (await first.json()) as { id: string };
        const before = h.enqueue.mock.calls.length;

        const second = await createReport("sess-u1", body, { idempotencyKey: key });
        expect(second.status).toBe(201);
        const secondBody = (await second.json()) as { id: string };
        expect(secondBody.id).toBe(firstBody.id);
        expect(h.enqueue.mock.calls.length).toBe(before);
      });

      it("rejects the same key with a different body with 409 IDEMPOTENCY_CONFLICT (TC-REP-014)", async () => {
        const key = `key-${randomBytes(6).toString("hex")}`;
        await createReport("sess-u1", lostBody(), { idempotencyKey: key });
        const res = await createReport("sess-u1", lostBody({ title: "Judul lain sama sekali" }), {
          idempotencyKey: key,
        });
        await expectEnvelope(res, 409, "IDEMPOTENCY_CONFLICT");
      });

      it("still returns 201 when the enqueue call fails (no duplicate report)", async () => {
        h.enqueue.mockRejectedValueOnce(new Error("pg-boss down"));
        const res = await createReport("sess-u1", lostBody());
        expect(res.status).toBe(201);
      });

      it("rate-limits the 4th create in an hour with 429 and Retry-After (BE-12)", async () => {
        process.env.RATE_LIMIT_ENABLED = "true";
        try {
          for (let i = 0; i < 3; i += 1) {
            const ok = await createReport("sess-u5", lostBody());
            expect(ok.status).toBe(201);
          }
          const res = await createReport("sess-u5", lostBody());
          await expectEnvelope(res, 429, "RATE_LIMITED");
          expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
        } finally {
          process.env.RATE_LIMIT_ENABLED = "false";
        }
      });
    });

    describe("API-REP-02 GET /reports", () => {
      it("rejects an unauthenticated request with 401 AUTH_REQUIRED", async () => {
        const res = await GET_LIST(new Request(REPORTS_URL));
        await expectEnvelope(res, 401, "AUTH_REQUIRED");
      });

      it("returns a contract-shaped page of opposite-type visible reports by default", async () => {
        const hidden = await seedReport({ reporter: U1, type: "FOUND", status: "CANCELLED" });
        const wrongType = await seedReport({ reporter: U1, type: "LOST" });
        const visible = await seedReport({ reporter: U1, type: "FOUND", status: "OPEN" });

        const res = await GET_LIST(listRequest("sess-u2"));
        expect(res.status).toBe(200);
        const body = (await res.json()) as {
          data: Array<{ id: string; type: string; status: string; version?: number }>;
          page: { nextCursor: string | null; hasMore: boolean };
        };
        expectMatchesContract("API-REP-02", body, responseSchema("API-REP-02"));
        expect(body.data.some((r) => r.id === visible)).toBe(true);
        expect(body.data.some((r) => r.id === hidden)).toBe(false);
        expect(body.data.some((r) => r.id === wrongType)).toBe(false);
        expect(body.data.every((r) => r.type === "FOUND")).toBe(true);
        expect(body.data.every((r) => r.status === "OPEN" || r.status === "MATCHED")).toBe(true);
        expect(body.data.some((r) => "version" in r)).toBe(false);
      });

      it("hides every non-browsable status from other users", async () => {
        const statuses = [
          "PENDING_REVIEW",
          "REMOVED",
          "CANCELLED",
          "EXPIRED",
          "RETURNED",
          "IN_VERIFICATION",
        ];
        const ids: string[] = [];
        for (const status of statuses) {
          ids.push(await seedReport({ reporter: U1, type: "FOUND", status }));
        }
        const res = await GET_LIST(listRequest("sess-u2"));
        const body = (await res.json()) as { data: Array<{ id: string }> };
        for (const id of ids) {
          expect(body.data.some((r) => r.id === id)).toBe(false);
        }
      });

      it("never returns the caller's own reports", async () => {
        const own = await seedReport({ reporter: U2, type: "FOUND", category: "OTHER" });
        const other = await seedReport({ reporter: U1, type: "FOUND", category: "OTHER" });
        const res = await GET_LIST(listRequest("sess-u2", "?type=FOUND&category=OTHER"));
        const body = (await res.json()) as { data: Array<{ id: string }> };
        expect(body.data.some((r) => r.id === other)).toBe(true);
        expect(body.data.some((r) => r.id === own)).toBe(false);
      });

      it("honours ?type= over the default", async () => {
        const lost = await seedReport({ reporter: U1, type: "LOST", category: "KEYS" });
        const res = await GET_LIST(listRequest("sess-u2", "?type=LOST"));
        const body = (await res.json()) as { data: Array<{ id: string; type: string }> };
        expect(body.data.every((r) => r.type === "LOST")).toBe(true);
        expect(body.data.some((r) => r.id === lost)).toBe(true);
      });

      it("rejects invalid query params with 422 VALIDATION_FAILED", async () => {
        const badType = await GET_LIST(listRequest("sess-u2", "?type=MAGIC"));
        await expectFieldPath(badType, "type");

        const badCampus = await GET_LIST(listRequest("sess-u2", "?campus=KAMPUS_Z"));
        await expectFieldPath(badCampus, "campus");

        const badCategory = await GET_LIST(listRequest("sess-u2", "?category=NOPE"));
        await expectFieldPath(badCategory, "category");

        const badLimit = await GET_LIST(listRequest("sess-u2", "?limit=51"));
        await expectFieldPath(badLimit, "limit");

        const badCursor = await GET_LIST(listRequest("sess-u2", "?cursor=%%%not-base64%%%"));
        await expectFieldPath(badCursor, "cursor");

        const badDate = await GET_LIST(listRequest("sess-u2", "?dateFrom=yesterday"));
        await expectFieldPath(badDate, "dateFrom");
      });

      it("filters by campus, category, occurred date window and custody", async () => {
        const marker = `MKP${randomBytes(3).toString("hex").toUpperCase()}`;
        const bwCampus = await seedReport({ reporter: U1, type: "FOUND", campus: "BANYUWANGI" });
        const hel1 = await seedReport({
          reporter: U1,
          type: "FOUND",
          category: "HELMET",
          occurredFrom: new Date(Date.now() - 10 * 86_400_000),
        });
        const hel2 = await seedReport({
          reporter: U1,
          type: "FOUND",
          category: "HELMET",
          occurredFrom: new Date(Date.now() - 40 * 86_400_000),
        });
        expect(marker).toMatch(/^MKP/);

        const campusRes = await GET_LIST(listRequest("sess-u2", "?type=FOUND&campus=BANYUWANGI"));
        const campusBody = (await campusRes.json()) as {
          data: Array<{ id: string; campus: string }>;
        };
        expect(campusBody.data.some((r) => r.id === bwCampus)).toBe(true);
        expect(campusBody.data.every((r) => r.campus === "BANYUWANGI")).toBe(true);

        const categoryRes = await GET_LIST(listRequest("sess-u2", "?type=FOUND&category=HELMET"));
        const categoryBody = (await categoryRes.json()) as { data: Array<{ id: string }> };
        expect(categoryBody.data.some((r) => r.id === hel1)).toBe(true);
        expect(categoryBody.data.some((r) => r.id === hel2)).toBe(true);

        const dateRes = await GET_LIST(
          listRequest(
            "sess-u2",
            `?type=FOUND&category=HELMET&dateFrom=${new Date(Date.now() - 20 * 86_400_000).toISOString().slice(0, 10)}`,
          ),
        );
        const dateBody = (await dateRes.json()) as { data: Array<{ id: string }> };
        expect(dateBody.data.some((r) => r.id === hel1)).toBe(true);
        expect(dateBody.data.some((r) => r.id === hel2)).toBe(false);

        const dropRow = await one<{ id: string }>(`SELECT id FROM drop_points LIMIT 1`);
        const held = await seedReport({ reporter: U1, type: "FOUND", custody: "HELD_BY_FINDER" });
        const atDrop = await seedReport({
          reporter: U1,
          type: "FOUND",
          custody: "AT_DROP_POINT",
        });
        await pool.query(`UPDATE reports SET drop_point_id = $1 WHERE id = $2`, [
          dropRow!.id,
          atDrop,
        ]);
        const custodyRes = await GET_LIST(
          listRequest("sess-u2", "?type=FOUND&custody=AT_DROP_POINT"),
        );
        const custodyBody = (await custodyRes.json()) as { data: Array<{ id: string }> };
        expect(custodyBody.data.some((r) => r.id === atDrop)).toBe(true);
        expect(custodyBody.data.some((r) => r.id === held)).toBe(false);
      });

      it("paginates with an opaque keyset cursor (limit default-50, hasMore)", async () => {
        const base = Date.now();
        const pageIds: string[] = [];
        for (let i = 0; i < 3; i += 1) {
          pageIds.push(
            await seedReport({
              reporter: U1,
              type: "FOUND",
              category: "UMBRELLA",
              createdAt: new Date(base - i * 1000),
            }),
          );
        }

        const first = await GET_LIST(
          listRequest("sess-u2", "?type=FOUND&category=UMBRELLA&limit=2"),
        );
        const firstBody = (await first.json()) as {
          data: Array<{ id: string }>;
          page: { nextCursor: string | null; hasMore: boolean };
        };
        expectMatchesContract("API-REP-02", firstBody, responseSchema("API-REP-02"));
        expect(firstBody.data).toHaveLength(2);
        expect(firstBody.page.hasMore).toBe(true);
        expect(firstBody.page.nextCursor).toBeTruthy();

        const second = await GET_LIST(
          listRequest(
            "sess-u2",
            `?type=FOUND&category=UMBRELLA&limit=2&cursor=${encodeURIComponent(firstBody.page.nextCursor!)}`,
          ),
        );
        const secondBody = (await second.json()) as {
          data: Array<{ id: string }>;
          page: { nextCursor: string | null; hasMore: boolean };
        };
        expect(secondBody.data).toHaveLength(1);
        expect(secondBody.page.hasMore).toBe(false);
        expect(secondBody.page.nextCursor).toBeNull();

        const seen = new Set([...firstBody.data, ...secondBody.data].map((r) => r.id));
        for (const id of pageIds) expect(seen.has(id)).toBe(true);
        expect(seen.size).toBe(3);
      });

      it("masks sensitive reports in browse for other users (FR-REP-009)", async () => {
        const imageId = await seedUpload(U2, { maskedKey: null });
        const sensitive = await seedReport({
          reporter: U2,
          type: "FOUND",
          category: "ID_CARD",
          sensitive: true,
          title: "KTM Budi Santoso NIM 12345",
          description: "KTM biru atas nama Budi Santoso tertinggal di kantin FK.",
        });
        await pool.query(`UPDATE report_images SET report_id = $1, masked_key = $2 WHERE id = $3`, [
          sensitive,
          `reports/${sensitive}/${imageId}_masked.jpg`,
          imageId,
        ]);

        const res = await GET_LIST(listRequest("sess-u1", "?type=FOUND&category=ID_CARD"));
        const body = (await res.json()) as {
          data: Array<{
            id: string;
            title: string;
            description: string;
            images: Array<{ url: string | null; isMasked: boolean; thumbUrl: string | null }>;
          }>;
        };
        const row = body.data.find((r) => r.id === sensitive);
        expect(row).toBeDefined();
        expect(row!.title).not.toContain("Budi Santoso");
        expect(row!.description).not.toContain("Budi Santoso");
        expect(row!.title).not.toBe("KTM Budi Santoso NIM 12345");
        expect(row!.images[0]!.url).toBeNull();
        expect(row!.images[0]!.isMasked).toBe(true);
        expect(row!.images[0]!.thumbUrl).toContain("_masked.jpg");
      });

      it("switches the default to the opposite of the caller's active intent (FR-SRC-001)", async () => {
        await seedReport({ reporter: U2, type: "FOUND", category: "WALLET" });
        const res = await GET_LIST(listRequest("sess-u2"));
        const body = (await res.json()) as { data: Array<{ type: string }> };
        expect(body.data.length).toBeGreaterThan(0);
        expect(body.data.every((r) => r.type === "LOST")).toBe(true);
      });
    });

    describe("API-REP-04 GET /reports/{id}", () => {
      it("rejects an unauthenticated request with 401 AUTH_REQUIRED", async () => {
        const res = await GET_BY_ID(
          new Request(`${REPORTS_URL}/${randomUUID()}`),
          idCtx(randomUUID()),
        );
        await expectEnvelope(res, 401, "AUTH_REQUIRED");
      });

      it("returns 404 NOT_FOUND for a missing report", async () => {
        const res = await GET_BY_ID(detailRequest("sess-u1", randomUUID()), idCtx(randomUUID()));
        await expectEnvelope(res, 404, "NOT_FOUND");
      });

      it("returns the owner view to the reporter (TC-REP-023) and matches the contract", async () => {
        const created = await createReport("sess-u1", lostBody());
        const createdBody = (await created.json()) as { id: string };
        const reportId = createdBody.id;

        await seedHint(reportId, "Apa warna gantungannya?", "Kuning");
        const claimId = randomUUID();
        const lostTwin = await seedReport({ reporter: U2, type: "LOST" });
        await pool.query(
          `INSERT INTO claims (id, found_report_id, claimant_id, status, expires_at)
           VALUES ($1, $2, $3, 'APPROVED', now() + interval '72 hours')`,
          [claimId, reportId, U2],
        );
        await pool.query(
          `INSERT INTO matches (id, lost_report_id, found_report_id, score, band, reasons, components, state, algo_version)
           VALUES ($1, $2, $3, 0.900, 'STRONG', '[]', '{}', 'SUGGESTED', 'v1')`,
          [randomUUID(), lostTwin, reportId],
        );
        await pool.query(
          `UPDATE reports SET type = 'FOUND', custody = 'HELD_BY_FINDER' WHERE id = $1`,
          [reportId],
        );

        const res = await GET_BY_ID(detailRequest("sess-u1", reportId), idCtx(reportId));
        expect(res.status).toBe(200);
        const body = (await res.json()) as {
          version: number;
          matchCount: number;
          hintPrompts: string[];
          activeClaimId?: string;
          expiresAt: string;
          reporterEmail?: string;
        };
        expectMatchesContract("API-REP-04", body, responseSchema("API-REP-04"));
        expect(body.version).toBe(1);
        expect(body.matchCount).toBe(1);
        expect(body.hintPrompts).toEqual(["Apa warna gantungannya?"]);
        expect(body.activeClaimId).toBe(claimId);
        expect(body.reporterEmail).toBeUndefined();
        expect("geo" in body).toBe(false);
        expect("lat" in body).toBe(false);
      });

      it("returns the public view to other users without owner-only fields", async () => {
        const created = await createReport("sess-u1", lostBody());
        const createdBody = (await created.json()) as { id: string };
        const res = await GET_BY_ID(
          detailRequest("sess-u2", createdBody.id),
          idCtx(createdBody.id),
        );
        expect(res.status).toBe(200);
        const body = (await res.json()) as Record<string, unknown>;
        expect(body.id).toBe(createdBody.id);
        expect("version" in body).toBe(false);
        expect("hintPrompts" in body).toBe(false);
        expect("expiresAt" in body).toBe(false);
        expect("matchCount" in body).toBe(false);
        expect("activeClaimId" in body).toBe(false);
        expect("reporterEmail" in body).toBe(false);
        expect("score" in body).toBe(false);
      });

      it("returns the moderator view to a campus-scoped moderator and admin only", async () => {
        const imageId = await seedUpload(U1);
        const created = await createReport("sess-u1", foundBody({ imageIds: [imageId] }));
        expect(created.status).toBe(201);
        const createdBody = (await created.json()) as { id: string };
        const reportId = createdBody.id;

        const scoped = await GET_BY_ID(detailRequest("sess-u3", reportId), idCtx(reportId));
        const scopedBody = (await scoped.json()) as {
          reporterEmail?: string;
          flagCount?: number;
        };
        expectMatchesContract("API-REP-04", scopedBody, responseSchema("API-REP-04"));
        expect(scopedBody.reporterEmail).toBe("budi@student.unair.ac.id");
        expect(scopedBody.flagCount).toBe(0);

        const admin = await GET_BY_ID(detailRequest("sess-u4", reportId), idCtx(reportId));
        const adminBody = (await admin.json()) as { reporterEmail?: string };
        expect(adminBody.reporterEmail).toBe("budi@student.unair.ac.id");

        const foreign = await seedReport({ reporter: U1, type: "FOUND", campus: "KAMPUS_B" });
        const outOfScope = await GET_BY_ID(detailRequest("sess-u3", foreign), idCtx(foreign));
        const outOfScopeBody = (await outOfScope.json()) as Record<string, unknown>;
        expect("reporterEmail" in outOfScopeBody).toBe(false);
        expect("version" in outOfScopeBody).toBe(false);
      });

      it("masks a sensitive report for other users (AC FR-REP-009)", async () => {
        const imageId = await seedUpload(U1);
        const sensitive = await seedReport({
          reporter: U1,
          type: "FOUND",
          category: "ID_CARD",
          sensitive: true,
          title: "KTM Rani Putri NIM 998877",
          description: "KTM Rani Putri tertinggal di perpustakaan lantai 2.",
          custody: "HELD_BY_FINDER",
        });
        await pool.query(`UPDATE report_images SET report_id = $1, masked_key = $2 WHERE id = $3`, [
          sensitive,
          `reports/${sensitive}/${imageId}_masked.jpg`,
          imageId,
        ]);

        const res = await GET_BY_ID(detailRequest("sess-u2", sensitive), idCtx(sensitive));
        expect(res.status).toBe(200);
        const body = (await res.json()) as {
          title: string;
          description: string;
          isSensitive: boolean;
          images: Array<{ url: string | null; isMasked: boolean; thumbUrl: string | null }>;
        };
        expect(body.isSensitive).toBe(true);
        expect(body.title).not.toContain("Rani Putri");
        expect(body.description).not.toContain("Rani Putri");
        expect(body.images[0]!.url).toBeNull();
        expect(body.images[0]!.isMasked).toBe(true);
        expect(body.images[0]!.thumbUrl).toContain("_masked.jpg");
      });

      it("shows the raw text and original URL to the owner of a sensitive report", async () => {
        const imageId = await seedUpload(U1);
        const sensitive = await seedReport({
          reporter: U1,
          type: "FOUND",
          category: "BANK_CARD",
          sensitive: true,
          title: "Kartu ATM BCA tertinggal",
          description: "Kartu ATM BCA atas nama Budi di dompet hitam.",
          custody: "AT_DROP_POINT",
        });
        await pool.query(`UPDATE report_images SET report_id = $1 WHERE id = $2`, [
          sensitive,
          imageId,
        ]);

        const res = await GET_BY_ID(detailRequest("sess-u1", sensitive), idCtx(sensitive));
        expect(res.status).toBe(200);
        const body = (await res.json()) as {
          title: string;
          description: string;
          images: Array<{ url: string | null; isMasked: boolean }>;
        };
        expect(body.title).toBe("Kartu ATM BCA tertinggal");
        expect(body.description).toContain("Budi di dompet hitam");
        expect(body.images[0]!.url).toContain("https://storage.test/");
        expect(body.images[0]!.isMasked).toBe(false);
      });

      it("404s a REMOVED report for other users but serves it to the owner", async () => {
        const removed = await seedReport({ reporter: U1, type: "LOST", status: "REMOVED" });
        const other = await GET_BY_ID(detailRequest("sess-u2", removed), idCtx(removed));
        await expectEnvelope(other, 404, "NOT_FOUND");

        const owner = await GET_BY_ID(detailRequest("sess-u1", removed), idCtx(removed));
        expect(owner.status).toBe(200);
      });

      it("keeps a PENDING_REVIEW report readable by detail link for other users", async () => {
        const pending = await seedReport({ reporter: U1, type: "LOST", status: "PENDING_REVIEW" });
        const res = await GET_BY_ID(detailRequest("sess-u2", pending), idCtx(pending));
        expect(res.status).toBe(200);
        const body = (await res.json()) as { status: string };
        expect(body.status).toBe("PENDING_REVIEW");
      });
    });
  },
);
