import { createHash, randomBytes } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Pool } from "pg";
import sharp from "sharp";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "@temuunair/db/src/schema";
import { loadContractApi } from "../contract-test-utils";
import { SESSION_COOKIE_NAME } from "../auth/session";
import { COMPLETE, GET_BY_ID, POST } from "./uploads";

// TMU-BE-004 (red evidence): the two-step upload handshake (BE-10, ARCH-MEDIA,
// API-UPL-01..03) against a scratch database: presigned init with idempotency
// and per-user rate limit, complete with magic-byte/EXIF verification, and
// owner-only state polling.

const h = vi.hoisted(() => {
  process.env.RATE_LIMIT_ENABLED = "false";
  const objects = new Map<string, { data: Buffer; mime: string }>();
  const presignPuts: Array<{ key: string; mime: string }> = [];
  const puts: Array<{ key: string; mime: string; bytes: number }> = [];
  return {
    getDb: vi.fn(),
    presignPut: vi.fn(async (key: string, mime: string) => {
      presignPuts.push({ key, mime });
      return `https://storage.test/${key}?X-Amz-Algorithm=AWS4&X-Amz-Signature=fake`;
    }),
    presignGet: vi.fn(
      async (key: string) =>
        `https://storage.test/${key}?X-Amz-Algorithm=AWS4&X-Amz-Signature=gfake`,
    ),
    head: vi.fn(async (key: string) => {
      const object = objects.get(key);
      return object ? { size: object.data.length, contentType: object.mime } : null;
    }),
    get: vi.fn(async (key: string) => objects.get(key)?.data ?? null),
    put: vi.fn(async (key: string, data: Buffer, mime: string) => {
      objects.set(key, { data, mime });
      puts.push({ key, mime, bytes: data.length });
    }),
    delete: vi.fn(async (key: string) => {
      objects.delete(key);
    }),
    state: { objects, presignPuts, puts },
  };
});

vi.mock("../db", () => ({ getDb: h.getDb }));
vi.mock("../storage", () => ({
  getStorage: () => ({
    presignPut: h.presignPut,
    presignGet: h.presignGet,
    head: h.head,
    get: h.get,
    put: h.put,
    delete: h.delete,
  }),
}));

const { expectMatchesContract, responseSchema } = await loadContractApi();

const U1 = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e81";
const U2 = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82";
const BASE = "http://localhost";
const UPLOADS_URL = `${BASE}/api/v1/uploads`;
const scratchName = `tmu_be004_${Date.now()}_${randomBytes(4).toString("hex")}`;

function cookieHeader(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}`;
}

function stateUrl(uploadId: string): string {
  return `${UPLOADS_URL}/${uploadId}`;
}

function completeUrl(uploadId: string): string {
  return `${UPLOADS_URL}/${uploadId}/complete`;
}

function initRequest(
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
  return new Request(UPLOADS_URL, { method: "POST", headers, body: JSON.stringify(body) });
}

function mutationRequest(url: string, token: string, opts: { csrf?: boolean } = {}): Request {
  const headers = new Headers();
  headers.set("cookie", cookieHeader(token));
  if (opts.csrf !== false) {
    headers.set("x-requested-with", "temuunair");
    headers.set("origin", BASE);
  }
  return new Request(url, { method: "POST", headers });
}

function stateRequest(uploadId: string, token: string): Request {
  return new Request(stateUrl(uploadId), { headers: { cookie: cookieHeader(token) } });
}

function completeRequest(uploadId: string, token: string, opts: { csrf?: boolean } = {}): Request {
  return mutationRequest(completeUrl(uploadId), token, opts);
}

function idCtx(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

async function expectEnvelope(res: Response, status: number, code: string): Promise<void> {
  expect(res.status).toBe(status);
  const body = (await res.json()) as { error: { code: string; requestId: string } };
  expect(body.error.code).toBe(code);
  expect(body.error.requestId).toMatch(/^req_/);
  expect(res.headers.get("X-Request-Id")).toBe(body.error.requestId);
}

async function jpegFixture(opts: { width?: number; height?: number; exif?: boolean } = {}) {
  const { width = 640, height = 480, exif = false } = opts;
  let pipeline = sharp({
    create: { width, height, channels: 3, background: { r: 12, g: 90, b: 210 } },
  });
  if (exif) {
    pipeline = pipeline.withExif({
      IFD0: { Copyright: "tmu-test" },
      IFD3: { GPSLatitudeRef: "N" },
    });
  }
  return pipeline.jpeg().toBuffer();
}

async function pngFixture(width = 640, height = 480): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 30, b: 60 } },
  })
    .png()
    .toBuffer();
}

function keyFromPresignedUrl(uploadUrl: string): string {
  const match = /^https:\/\/storage\.test\/([^?]+)/.exec(uploadUrl);
  expect(match).not.toBeNull();
  return match![1]!;
}

async function initAndGetUploadId(
  token: string,
  body: unknown,
  opts: { idempotencyKey?: string | null } = {},
): Promise<{ uploadId: string; uploadUrl: string; expiresAt: string }> {
  const res = await POST(initRequest(token, body, opts));
  expect(res.status).toBe(200);
  const parsed = (await res.json()) as { uploadId: string; uploadUrl: string; expiresAt: string };
  expectMatchesContract("API-UPL-01", parsed, responseSchema("API-UPL-01"));
  return parsed;
}

describe.skipIf(!process.env.DATABASE_URL)(
  "TMU-BE-004 /api/v1/uploads handlers on a live database",
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
            ($2, 'susi@student.unair.ac.id', 'Susi W.', NULL, 'USER', NULL, 'id', 'ACTIVE')`,
        [U1, U2],
      );
      await pool.query(
        `INSERT INTO sessions (session_token, user_id, expires) VALUES
            ('sess-u1', $1, now() + interval '30 days'),
            ('sess-u2', $2, now() + interval '30 days')`,
        [U1, U2],
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

    it("POST /uploads rejects an unauthenticated request with 401 AUTH_REQUIRED", async () => {
      const res = await POST(
        new Request(UPLOADS_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mime: "image/jpeg", sizeBytes: 1000 }),
        }),
      );
      await expectEnvelope(res, 401, "AUTH_REQUIRED");
    });

    it("POST /uploads rejects a mutation without CSRF headers with 403 FORBIDDEN", async () => {
      const res = await POST(
        initRequest("sess-u1", { mime: "image/jpeg", sizeBytes: 1000 }, { csrf: false }),
      );
      await expectEnvelope(res, 403, "FORBIDDEN");
    });

    it("POST /uploads rejects a disallowed MIME with 415 UPLOAD_INVALID_TYPE", async () => {
      const res = await POST(initRequest("sess-u1", { mime: "application/pdf", sizeBytes: 1000 }));
      await expectEnvelope(res, 415, "UPLOAD_INVALID_TYPE");
    });

    it("POST /uploads rejects a payload over 8 MB with 413 UPLOAD_TOO_LARGE", async () => {
      const res = await POST(
        initRequest("sess-u1", { mime: "image/jpeg", sizeBytes: 8 * 1024 * 1024 + 1 }),
      );
      await expectEnvelope(res, 413, "UPLOAD_TOO_LARGE");
    });

    it("POST /uploads requires an Idempotency-Key with 422 VALIDATION_FAILED", async () => {
      const res = await POST(
        initRequest("sess-u1", { mime: "image/jpeg", sizeBytes: 1000 }, { idempotencyKey: null }),
      );
      await expectEnvelope(res, 422, "VALIDATION_FAILED");
    });

    it("POST /uploads presigns a scoped PUT and persists a PENDING row (API-UPL-01)", async () => {
      const before = h.state.presignPuts.length;
      const init = await initAndGetUploadId("sess-u1", { mime: "image/jpeg", sizeBytes: 42_000 });

      expect(init.uploadId).toMatch(/^[0-9a-f-]{36}$/);
      expect(new Date(init.expiresAt).getTime()).toBeGreaterThan(Date.now() + 4 * 60_000);
      expect(new Date(init.expiresAt).getTime()).toBeLessThanOrEqual(
        Date.now() + 5 * 60_000 + 5000,
      );

      expect(h.state.presignPuts.length).toBe(before + 1);
      const presign = h.state.presignPuts.at(-1)!;
      expect(presign.key).toBe(`uploads/${init.uploadId}`);
      expect(presign.mime).toBe("image/jpeg");
      expect(init.uploadUrl).toContain(`uploads/${init.uploadId}`);

      const row = await one<{
        id: string;
        uploaderId: string;
        reportId: string | null;
        storageKey: string;
        status: string;
        mime: string;
      }>(
        `SELECT id, uploader_id AS "uploaderId", report_id AS "reportId",
                storage_key AS "storageKey", status, mime
           FROM report_images WHERE id = $1`,
        [init.uploadId],
      );
      expect(row).toMatchObject({
        id: init.uploadId,
        uploaderId: U1,
        reportId: null,
        storageKey: `uploads/${init.uploadId}`,
        status: "PENDING",
        mime: "image/jpeg",
      });
    });

    it("POST /uploads replays the original response for the same key and body", async () => {
      const key = `replay-${randomBytes(4).toString("hex")}`;
      const body = { mime: "image/png", sizeBytes: 51_000 };
      const first = await initAndGetUploadId("sess-u1", body, { idempotencyKey: key });
      const before = h.state.presignPuts.length;
      const second = await initAndGetUploadId("sess-u1", body, { idempotencyKey: key });
      expect(second).toEqual(first);
      expect(h.state.presignPuts.length).toBe(before);
    });

    it("POST /uploads rejects the same key with a different body with 409 IDEMPOTENCY_CONFLICT", async () => {
      const key = `conflict-${randomBytes(4).toString("hex")}`;
      await initAndGetUploadId(
        "sess-u1",
        { mime: "image/png", sizeBytes: 51_000 },
        { idempotencyKey: key },
      );
      const res = await POST(
        initRequest("sess-u1", { mime: "image/jpeg", sizeBytes: 51_000 }, { idempotencyKey: key }),
      );
      await expectEnvelope(res, 409, "IDEMPOTENCY_CONFLICT");
    });

    it("POST /uploads accepts image/heic at init time", async () => {
      const init = await initAndGetUploadId("sess-u1", { mime: "image/heic", sizeBytes: 90_000 });
      expect(init.uploadUrl).toContain(`uploads/${init.uploadId}`);
    });

    it("POST /uploads/{id}/complete rejects a payload that is not an image with 415", async () => {
      const init = await initAndGetUploadId("sess-u1", { mime: "image/jpeg", sizeBytes: 200 });
      const key = keyFromPresignedUrl(init.uploadUrl);
      h.state.objects.set(key, {
        data: Buffer.from("definitely not a jpeg payload"),
        mime: "image/jpeg",
      });

      const res = await COMPLETE(completeRequest(init.uploadId, "sess-u1"), idCtx(init.uploadId));
      await expectEnvelope(res, 415, "UPLOAD_INVALID_TYPE");

      const row = await one<{ status: string }>(`SELECT status FROM report_images WHERE id = $1`, [
        init.uploadId,
      ]);
      expect(row!.status).toBe("REJECTED");
    });

    // --- complete / state ---

    it("POST /uploads/{id}/complete processes the image to READY and strips EXIF (API-UPL-02)", async () => {
      const init = await initAndGetUploadId("sess-u1", { mime: "image/jpeg", sizeBytes: 40_000 });
      const key = keyFromPresignedUrl(init.uploadUrl);
      const fixture = await jpegFixture({ exif: true });
      expect((await sharp(fixture).metadata()).exif).toBeDefined();
      h.state.objects.set(key, { data: fixture, mime: "image/jpeg" });

      const res = await COMPLETE(completeRequest(init.uploadId, "sess-u1"), idCtx(init.uploadId));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      expectMatchesContract("API-UPL-02", body, responseSchema("API-UPL-02"));
      expect(body.id).toBe(init.uploadId);
      expect(body.status).toBe("READY");
      expect(body.mime).toBe("image/jpeg");
      expect(body.thumbUrl).toMatch(/^https:\/\/storage\.test\/uploads\//);

      const original = h.state.objects.get(key)!;
      const meta = await sharp(original.data).metadata();
      expect(meta.format).toBe("jpeg");
      expect(meta.exif).toBeUndefined();

      const thumbKey = `${key}_thumb.jpg`;
      const thumb = h.state.objects.get(thumbKey);
      expect(thumb).toBeDefined();
      const thumbMeta = await sharp(thumb!.data).metadata();
      expect(thumbMeta.exif).toBeUndefined();
      expect(Math.max(thumbMeta.width!, thumbMeta.height!)).toBeLessThanOrEqual(480);

      const row = await one<{
        status: string;
        thumbKey: string;
        width: number;
        height: number;
        reportId: string | null;
      }>(
        `SELECT status, thumb_key AS "thumbKey", width, height, report_id AS "reportId"
           FROM report_images WHERE id = $1`,
        [init.uploadId],
      );
      expect(row).toMatchObject({
        status: "READY",
        thumbKey: thumbKey,
        width: 640,
        height: 480,
        reportId: null,
      });
    });

    it("POST /uploads/{id}/complete is idempotent once the upload is READY", async () => {
      const init = await initAndGetUploadId("sess-u1", { mime: "image/jpeg", sizeBytes: 40_000 });
      const key = keyFromPresignedUrl(init.uploadUrl);
      h.state.objects.set(key, { data: await jpegFixture(), mime: "image/jpeg" });

      const first = await COMPLETE(completeRequest(init.uploadId, "sess-u1"), idCtx(init.uploadId));
      expect(first.status).toBe(200);
      const putsAfterFirst = h.state.puts.length;

      const second = await COMPLETE(
        completeRequest(init.uploadId, "sess-u1"),
        idCtx(init.uploadId),
      );
      expect(second.status).toBe(200);
      const body = (await second.json()) as { status: string };
      expect(body.status).toBe("READY");
      expect(h.state.puts.length).toBe(putsAfterFirst);
    });

    it("POST /uploads/{id}/complete hides a foreign upload with 404 NOT_FOUND", async () => {
      const init = await initAndGetUploadId("sess-u1", { mime: "image/jpeg", sizeBytes: 40_000 });
      const key = keyFromPresignedUrl(init.uploadUrl);
      h.state.objects.set(key, { data: await jpegFixture(), mime: "image/jpeg" });

      const res = await COMPLETE(completeRequest(init.uploadId, "sess-u2"), idCtx(init.uploadId));
      await expectEnvelope(res, 404, "NOT_FOUND");

      const row = await one<{ status: string }>(`SELECT status FROM report_images WHERE id = $1`, [
        init.uploadId,
      ]);
      expect(row!.status).toBe("PENDING");
    });

    it("POST /uploads/{id}/complete returns 404 for a malformed upload id", async () => {
      const res = await COMPLETE(completeRequest("not-a-uuid", "sess-u1"), idCtx("not-a-uuid"));
      await expectEnvelope(res, 404, "NOT_FOUND");
    });

    it("POST /uploads/{id}/complete rejects magic bytes that disagree with the declared MIME", async () => {
      const init = await initAndGetUploadId("sess-u1", { mime: "image/png", sizeBytes: 90_000 });
      const key = keyFromPresignedUrl(init.uploadUrl);
      h.state.objects.set(key, { data: await jpegFixture(), mime: "image/png" });

      const res = await COMPLETE(completeRequest(init.uploadId, "sess-u1"), idCtx(init.uploadId));
      await expectEnvelope(res, 415, "UPLOAD_INVALID_TYPE");

      const row = await one<{ status: string }>(`SELECT status FROM report_images WHERE id = $1`, [
        init.uploadId,
      ]);
      expect(row!.status).toBe("REJECTED");
    });

    it("POST /uploads/{id}/complete rejects a sha256 mismatch with 415 UPLOAD_INVALID_TYPE", async () => {
      const otherHash = createHash("sha256").update("different content").digest("hex");
      const init = await initAndGetUploadId("sess-u1", {
        mime: "image/jpeg",
        sizeBytes: 40_000,
        sha256: otherHash,
      });
      const key = keyFromPresignedUrl(init.uploadUrl);
      h.state.objects.set(key, { data: await jpegFixture(), mime: "image/jpeg" });

      const res = await COMPLETE(completeRequest(init.uploadId, "sess-u1"), idCtx(init.uploadId));
      await expectEnvelope(res, 415, "UPLOAD_INVALID_TYPE");
    });

    it("POST /uploads/{id}/complete rejects an undersized image with status REJECTED", async () => {
      const init = await initAndGetUploadId("sess-u1", { mime: "image/png", sizeBytes: 9_000 });
      const key = keyFromPresignedUrl(init.uploadUrl);
      h.state.objects.set(key, { data: await pngFixture(100, 100), mime: "image/png" });

      const res = await COMPLETE(completeRequest(init.uploadId, "sess-u1"), idCtx(init.uploadId));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      expectMatchesContract("API-UPL-02", body, responseSchema("API-UPL-02"));
      expect(body.status).toBe("REJECTED");
      expect(body.thumbUrl).toBeNull();

      const row = await one<{ status: string }>(`SELECT status FROM report_images WHERE id = $1`, [
        init.uploadId,
      ]);
      expect(row!.status).toBe("REJECTED");
    });

    it("POST /uploads/{id}/complete returns 404 when the object was never uploaded", async () => {
      const init = await initAndGetUploadId("sess-u1", { mime: "image/jpeg", sizeBytes: 40_000 });
      const res = await COMPLETE(completeRequest(init.uploadId, "sess-u1"), idCtx(init.uploadId));
      await expectEnvelope(res, 404, "NOT_FOUND");
    });

    it("GET /uploads/{id} returns the PENDING state to the owner (API-UPL-03)", async () => {
      const init = await initAndGetUploadId("sess-u1", { mime: "image/jpeg", sizeBytes: 40_000 });
      const res = await GET_BY_ID(stateRequest(init.uploadId, "sess-u1"), idCtx(init.uploadId));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      expectMatchesContract("API-UPL-03", body, responseSchema("API-UPL-03"));
      expect(body.status).toBe("PENDING");
      expect(body.thumbUrl).toBeNull();
    });

    it("GET /uploads/{id} returns signed URLs for a READY upload", async () => {
      const init = await initAndGetUploadId("sess-u1", { mime: "image/jpeg", sizeBytes: 40_000 });
      const key = keyFromPresignedUrl(init.uploadUrl);
      h.state.objects.set(key, { data: await jpegFixture({ exif: true }), mime: "image/jpeg" });
      const done = await COMPLETE(completeRequest(init.uploadId, "sess-u1"), idCtx(init.uploadId));
      expect(done.status).toBe(200);

      const res = await GET_BY_ID(stateRequest(init.uploadId, "sess-u1"), idCtx(init.uploadId));
      expect(res.status).toBe(200);
      const body = (await res.json()) as Record<string, unknown>;
      expectMatchesContract("API-UPL-03", body, responseSchema("API-UPL-03"));
      expect(body.status).toBe("READY");
      expect(body.thumbUrl).toMatch(/^https:\/\/storage\.test\//);
    });

    it("GET /uploads/{id} hides a foreign upload with 404 NOT_FOUND", async () => {
      const init = await initAndGetUploadId("sess-u1", { mime: "image/jpeg", sizeBytes: 40_000 });
      const res = await GET_BY_ID(stateRequest(init.uploadId, "sess-u2"), idCtx(init.uploadId));
      await expectEnvelope(res, 404, "NOT_FOUND");
    });

    it("POST /uploads rate-limits the 31st init in an hour with 429 RATE_LIMITED", async () => {
      process.env.RATE_LIMIT_ENABLED = "true";
      try {
        let last: Response | undefined;
        for (let i = 0; i < 31; i += 1) {
          last = await POST(
            initRequest(
              "sess-u2",
              { mime: "image/jpeg", sizeBytes: 1000 },
              {
                idempotencyKey: `rl-${Date.now()}-${i}`,
              },
            ),
          );
        }
        expect(last!.status).toBe(429);
        const body = (await last!.json()) as { error: { code: string } };
        expect(body.error.code).toBe("RATE_LIMITED");
        const retryAfter = Number(last!.headers.get("Retry-After"));
        expect(retryAfter).toBeGreaterThan(0);
        expect(retryAfter).toBeLessThanOrEqual(3600);
      } finally {
        process.env.RATE_LIMIT_ENABLED = "false";
      }
    });
  },
);
