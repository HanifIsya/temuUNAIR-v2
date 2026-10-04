// apps/web/src/server/services/uploads.ts
// TMU-BE-004: upload handshake services (BE-10, ARCH-MEDIA, API-UPL-01..03).
// init  — validate MIME/size/rate limit, presign a scoped PUT, persist PENDING.
// complete — HEAD + magic bytes + sha256, decode with sharp, reject undersized,
//            strip EXIF (never persist GPS), normalize to JPEG q82 + 480px thumb.
// state — owner-only UploadState projection with a signed thumb URL.

import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { DomainError, ErrorCode } from "../errors";
import { isRateLimitEnabled, UPLOAD_INIT_RATE } from "../rate-limit";
import type { RateLimiter } from "../rate-limit";
import type { StorageClient } from "../storage";

export const ALLOWED_UPLOAD_MIME = ["image/jpeg", "image/png", "image/webp", "image/heic"] as const;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const PRESIGN_TTL_SECONDS = 300;
export const MIN_SHORTEST_SIDE = 320;
export const THUMB_MAX_SIDE = 480;

export type UploadStatusValue = "PENDING" | "READY" | "REJECTED";

export interface UploadRecord {
  id: string;
  uploaderId: string;
  reportId: string | null;
  storageKey: string;
  thumbKey: string | null;
  mime: string;
  sha256: string | null;
  status: UploadStatusValue;
  width: number | null;
  height: number | null;
}

export interface UploadsRepository {
  insertPending(input: {
    id: string;
    uploaderId: string;
    storageKey: string;
    mime: string;
    sha256?: string;
  }): Promise<void>;
  findById(id: string): Promise<UploadRecord | null>;
  markRejected(id: string): Promise<void>;
  markReady(input: {
    id: string;
    storageKey: string;
    thumbKey: string;
    width: number;
    height: number;
  }): Promise<void>;
}

export interface UploadDeps {
  storage: StorageClient;
  limiter: RateLimiter;
}

export interface UploadInitInput {
  userId: string;
  mime: string;
  sizeBytes: number;
  sha256?: string;
}

export interface UploadInitResult {
  uploadId: string;
  uploadUrl: string;
  expiresAt: string;
}

export interface UploadState {
  id: string;
  status: UploadStatusValue;
  mime: string;
  thumbUrl: string | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const HEIC_BRANDS = new Set(["heic", "heix", "hevc", "heim", "heis", "hevm", "mif1"]);

export function isUploadId(value: string): boolean {
  return UUID_RE.test(value);
}

export function magicMatchesMime(bytes: Buffer, mime: string): boolean {
  if (mime === "image/jpeg") {
    return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mime === "image/png") {
    return bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mime === "image/webp") {
    return (
      bytes.length > 12 &&
      bytes.subarray(0, 4).toString("latin1") === "RIFF" &&
      bytes.subarray(8, 12).toString("latin1") === "WEBP"
    );
  }
  if (mime === "image/heic") {
    if (bytes.length < 12 || bytes.subarray(4, 8).toString("latin1") !== "ftyp") return false;
    return HEIC_BRANDS.has(bytes.subarray(8, 12).toString("latin1"));
  }
  return false;
}

function notFound(): DomainError {
  return new DomainError(ErrorCode.NOT_FOUND, "Upload not found");
}

function invalidType(message: string): DomainError {
  return new DomainError(ErrorCode.UPLOAD_INVALID_TYPE, message);
}

async function toState(deps: UploadDeps, row: UploadRecord): Promise<UploadState> {
  const thumbUrl = row.thumbKey
    ? await deps.storage.presignGet(row.thumbKey, PRESIGN_TTL_SECONDS)
    : null;
  return { id: row.id, status: row.status, mime: row.mime, thumbUrl };
}

export async function initUpload(
  repo: UploadsRepository,
  deps: UploadDeps,
  input: UploadInitInput,
  now: Date,
): Promise<UploadInitResult> {
  if (!(ALLOWED_UPLOAD_MIME as readonly string[]).includes(input.mime)) {
    throw invalidType(`Unsupported upload MIME: ${input.mime}`);
  }
  if (input.sizeBytes > MAX_UPLOAD_BYTES) {
    throw new DomainError(ErrorCode.UPLOAD_TOO_LARGE, `Upload exceeds ${MAX_UPLOAD_BYTES} bytes`);
  }
  if (isRateLimitEnabled()) {
    const result = deps.limiter.check(
      "uploads:init",
      input.userId,
      UPLOAD_INIT_RATE.limit,
      UPLOAD_INIT_RATE.windowMs,
    );
    if (!result.allowed) {
      throw new DomainError(ErrorCode.RATE_LIMITED, "Too many uploads", {
        retryAfterSeconds: result.retryAfterSeconds,
      });
    }
  }

  const uploadId = randomUUID();
  const storageKey = `uploads/${uploadId}`;
  const uploadUrl = await deps.storage.presignPut(storageKey, input.mime, PRESIGN_TTL_SECONDS);
  await repo.insertPending({
    id: uploadId,
    uploaderId: input.userId,
    storageKey,
    mime: input.mime,
    sha256: input.sha256,
  });
  const expiresAt = new Date(now.getTime() + PRESIGN_TTL_SECONDS * 1000).toISOString();
  return { uploadId, uploadUrl, expiresAt };
}

export async function completeUpload(
  repo: UploadsRepository,
  deps: UploadDeps,
  input: { userId: string; uploadId: string },
): Promise<UploadState> {
  if (!isUploadId(input.uploadId)) throw notFound();
  const row = await repo.findById(input.uploadId);
  if (!row || row.uploaderId !== input.userId) throw notFound();
  if (row.status !== "PENDING") return toState(deps, row);

  const head = await deps.storage.head(row.storageKey);
  if (!head) throw notFound();
  if (head.contentType && head.contentType !== row.mime) {
    await repo.markRejected(row.id);
    throw invalidType("Stored object content-type does not match the declared MIME");
  }
  if (head.size > MAX_UPLOAD_BYTES) {
    await repo.markRejected(row.id);
    return toState(deps, { ...row, status: "REJECTED" });
  }

  const bytes = await deps.storage.get(row.storageKey);
  if (!bytes) throw notFound();
  if (row.sha256 && createHash("sha256").update(bytes).digest("hex") !== row.sha256) {
    await repo.markRejected(row.id);
    throw invalidType("Uploaded bytes do not match the declared sha256");
  }
  if (!magicMatchesMime(bytes, row.mime)) {
    await repo.markRejected(row.id);
    throw invalidType("Uploaded bytes are not a valid image of the declared MIME");
  }

  let original: Buffer;
  let thumb: Buffer;
  let width: number;
  let height: number;
  try {
    const meta = await sharp(bytes).metadata();
    if (!meta.width || !meta.height) throw new Error("missing dimensions");
    if (Math.min(meta.width, meta.height) < MIN_SHORTEST_SIDE) {
      await repo.markRejected(row.id);
      return toState(deps, { ...row, status: "REJECTED" });
    }
    // rotate() applies EXIF orientation to pixels; metadata (incl. GPS) is
    // never copied to the output (DEC-010, ADR-0008).
    original = await sharp(bytes).rotate().toColourspace("srgb").jpeg({ quality: 82 }).toBuffer();
    thumb = await sharp(bytes)
      .rotate()
      .resize(THUMB_MAX_SIDE, THUMB_MAX_SIDE, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer();
    const outMeta = await sharp(original).metadata();
    width = outMeta.width ?? meta.width;
    height = outMeta.height ?? meta.height;
  } catch (err) {
    if (err instanceof DomainError) throw err;
    await repo.markRejected(row.id);
    throw invalidType("Image could not be processed");
  }

  const thumbKey = `${row.storageKey}_thumb.jpg`;
  await deps.storage.put(row.storageKey, original, "image/jpeg");
  await deps.storage.put(thumbKey, thumb, "image/jpeg");
  await repo.markReady({
    id: row.id,
    storageKey: row.storageKey,
    thumbKey,
    width,
    height,
  });

  return toState(deps, {
    ...row,
    status: "READY",
    storageKey: row.storageKey,
    thumbKey,
    width,
    height,
  });
}

export async function getUploadState(
  repo: UploadsRepository,
  deps: UploadDeps,
  input: { userId: string; uploadId: string },
): Promise<UploadState> {
  if (!isUploadId(input.uploadId)) throw notFound();
  const row = await repo.findById(input.uploadId);
  if (!row || row.uploaderId !== input.userId) throw notFound();
  return toState(deps, row);
}
