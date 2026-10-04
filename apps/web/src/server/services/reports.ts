// apps/web/src/server/services/reports.ts
// TMU-BE-006: report create/read services (API-REP-01/02/04).
// Cross-field validation (FR-REP-001..006, TC-REP matrix), browse visibility
// (BE-03, FR-SRC-001/002, ARCH: hidden statuses + own reports excluded, default
// opposite of active intent), keyset pagination (BE-01), and view selection
// (public / owner / moderator) with sensitive masking delegated to the mapper.

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { DomainError, ErrorCode } from "../errors";
import { logger } from "../logging";
import { REPORT_CREATE_RATES, type RateLimiter } from "../rate-limit";
import { zodToValidationFailed } from "../validation";
import { encryptFieldAnswer } from "./field-crypto";
import {
  buildReportImages,
  mapReportModerator,
  mapReportOwner,
  mapReportPublic,
} from "./report-mapper";
import { CATEGORY_META, CAMPUS_VALUES, SENSITIVE_CATEGORIES } from "./meta";
import { PRESIGN_TTL_SECONDS } from "./uploads";

export const BROWSE_DEFAULT_LIMIT = 20;
export const BROWSE_MAX_LIMIT = 50;
export const MAX_REPORT_IMAGES = 5;
export const MAX_HINTS = 3;
export const MIN_SENSITIVE_HINTS = 2;
export const REPORT_WINDOW_DAYS = 180;

export type ReportType = "LOST" | "FOUND";
export type CustodyValue = "HELD_BY_FINDER" | "AT_DROP_POINT";
export type ViewerRole = "USER" | "MODERATOR" | "ADMIN";
export type ReportStatusValue =
  | "PENDING_REVIEW"
  | "OPEN"
  | "MATCHED"
  | "IN_VERIFICATION"
  | "RETURNED"
  | "EXPIRED"
  | "CANCELLED"
  | "REMOVED";

/** BE-03 / FR-SRC-002: the only statuses exposed by the public browse. */
export const BROWSE_VISIBLE_STATUSES: ReportStatusValue[] = ["OPEN", "MATCHED"];
/** Statuses that count as the reporter's "active intent" for source switching. */
export const ACTIVE_INTENT_STATUSES: ReportStatusValue[] = ["OPEN", "MATCHED", "IN_VERIFICATION"];
const SENSITIVE_SET = new Set<string>(SENSITIVE_CATEGORIES);

export interface ReportImageView {
  id: string;
  url: string | null;
  thumbUrl?: string | null;
  isMasked: boolean;
}

export interface ReportPublicView {
  id: string;
  type: ReportType;
  status: ReportStatusValue;
  category: string;
  isSensitive: boolean;
  title: string;
  description: string;
  colors: string[];
  brand?: string;
  images: ReportImageView[];
  campus: (typeof CAMPUS_VALUES)[number];
  locationName?: string;
  occurredAt: { from: Date; to?: Date };
  custody?: CustodyValue;
  dropPointName?: string;
  createdAt: Date;
}

export interface ReportOwnerView extends ReportPublicView {
  version: number;
  matchCount: number;
  hintPrompts: string[];
  activeClaimId?: string;
  expiresAt: Date;
  resolvedAt?: Date;
}

export interface ReportModeratorView extends ReportOwnerView {
  reporterId: string;
  reporterEmail: string;
  flagCount: number;
}

export interface ReportRowView {
  id: string;
  type: ReportType;
  status: ReportStatusValue;
  reporterId: string;
  category: string;
  isSensitive: boolean;
  title: string;
  description: string;
  colors: string[];
  brand: string | null;
  campus: (typeof CAMPUS_VALUES)[number];
  locationId: string | null;
  locationNote: string | null;
  occurredFrom: Date;
  occurredTo: Date | null;
  custody: CustodyValue | null;
  dropPointId: string | null;
  expiresAt: Date;
  resolvedAt: Date | null;
  version: number;
  createdAt: Date;
  locationName: string | null;
  dropPointName: string | null;
}

export interface ReportImageRow {
  id: string;
  storageKey: string;
  thumbKey: string | null;
  maskedKey: string | null;
  position: number;
}

export interface CreateReportRecord {
  id: string;
  reporterId: string;
  type: ReportType;
  category: string;
  isSensitive: boolean;
  title: string;
  description: string;
  colors: string[];
  brand: string | null;
  campus: (typeof CAMPUS_VALUES)[number];
  locationId: string | null;
  locationNote: string | null;
  occurredFrom: Date;
  occurredTo: Date | null;
  custody: CustodyValue | null;
  dropPointId: string | null;
  expiresAt: Date;
  createdAt: Date;
}

export interface ResolvedBrowseFilters {
  type: ReportType;
  campus: (typeof CAMPUS_VALUES)[number][];
  category: string[];
  dateFrom?: Date;
  dateTo?: Date;
  custody?: CustodyValue;
  limit: number;
  cursor?: { createdAt: Date; id: string };
}

export interface ReportsRepository {
  findActiveIntentType(userId: string): Promise<ReportType | null>;
  listReports(filters: ResolvedBrowseFilters, viewerId: string): Promise<ReportRowView[]>;
  listImagesForReports(reportIds: string[]): Promise<Map<string, ReportImageRow[]>>;
  getReport(id: string): Promise<ReportRowView | null>;
  getImages(reportId: string): Promise<ReportImageRow[]>;
  getHintPrompts(reportId: string): Promise<string[]>;
  getMatchCount(reportId: string): Promise<number>;
  getActiveClaimId(reportId: string): Promise<string | null>;
  getFlagCount(reportId: string): Promise<number>;
  getReporterEmail(reporterId: string): Promise<string | null>;
  findAttachableImages(
    userId: string,
    imageIds: string[],
  ): Promise<Array<{ id: string; uploaderId: string; status: string; reportId: string | null }>>;
  locationExists(locationId: string): Promise<boolean>;
  dropPointExists(dropPointId: string): Promise<boolean>;
  createReport(
    record: CreateReportRecord,
    hints: Array<{ prompt: string; answerEnc: Buffer }>,
    imageIds: string[],
  ): Promise<void>;
}

export interface ReportViewer {
  userId: string;
  role: ViewerRole;
  moderatorCampus: string | null;
}

export interface ReportsReadDeps {
  repo: ReportsRepository;
  storage: { presignGet(key: string, expiresInSeconds: number): Promise<string> };
}

export interface CreateReportDeps extends ReportsReadDeps {
  queue: { enqueue(reportId: string): Promise<string | null> };
  limiter: RateLimiter;
  fieldEncryptionKey: string;
  reportTtlDays: number;
  isRateLimitEnabled: () => boolean;
}

export interface CreateReportContext {
  userId: string;
  now: Date;
}

const categorySchema = z
  .string()
  .refine((value) => CATEGORY_META.some((entry) => entry.value === value));

const reportCreateSchema = z.object({
  type: z.enum(["LOST", "FOUND"]),
  category: categorySchema,
  title: z.string().min(3).max(80),
  description: z.string().min(10).max(1000),
  colors: z.array(z.string()).default([]),
  brand: z.string().optional(),
  imageIds: z.array(z.string().uuid()).default([]),
  location: z.object({
    campus: z.enum(CAMPUS_VALUES),
    locationId: z.string().uuid().optional(),
    note: z.string().optional(),
  }),
  occurredAt: z.object({
    from: z.string().datetime({ offset: true }),
    to: z.string().datetime({ offset: true }).optional(),
  }),
  custody: z.enum(["HELD_BY_FINDER", "AT_DROP_POINT"]).optional(),
  dropPointId: z.string().uuid().optional(),
  hints: z
    .array(
      z.object({
        prompt: z.string().min(3).max(200),
        answer: z.string().min(1).max(200),
      }),
    )
    .optional(),
});

type ReportCreateParsed = z.infer<typeof reportCreateSchema>;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  });

const browseQuerySchema = z.object({
  type: z.enum(["LOST", "FOUND"]).optional(),
  campus: z.array(z.enum(CAMPUS_VALUES)).default([]),
  category: z.array(categorySchema).default([]),
  dateFrom: isoDate.optional(),
  dateTo: isoDate.optional(),
  custody: z.enum(["HELD_BY_FINDER", "AT_DROP_POINT"]).optional(),
  limit: z.coerce.number().int().min(1).max(BROWSE_MAX_LIMIT).default(BROWSE_DEFAULT_LIMIT),
  cursor: z.string().optional(),
});

function validationFailed(path: string, message: string): DomainError {
  return new DomainError(ErrorCode.VALIDATION_FAILED, message, {
    fields: [{ path, key: `error.VALIDATION_FAILED.${path}` }],
  });
}

export function parseReportCreate(raw: unknown): ReportCreateParsed {
  const parsed = reportCreateSchema.safeParse(raw);
  if (!parsed.success) throw zodToValidationFailed(parsed.error);
  return parsed.data;
}

export function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(JSON.stringify({ c: createdAt.toISOString(), i: id }), "utf8").toString(
    "base64url",
  );
}

export function decodeCursor(raw: string): { createdAt: Date; id: string } | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as {
      c?: unknown;
      i?: unknown;
    };
    if (typeof parsed.c !== "string" || typeof parsed.i !== "string") return null;
    const createdAt = new Date(parsed.c);
    if (Number.isNaN(createdAt.getTime())) return null;
    return { createdAt, id: parsed.i };
  } catch {
    return null;
  }
}

export function parseBrowseQuery(params: URLSearchParams): ResolvedBrowseFilters {
  const parsed = browseQuerySchema.safeParse({
    type: params.get("type") ?? undefined,
    campus: params.getAll("campus"),
    category: params.getAll("category"),
    dateFrom: params.get("dateFrom") ?? undefined,
    dateTo: params.get("dateTo") ?? undefined,
    custody: params.get("custody") ?? undefined,
    limit: params.get("limit") ?? undefined,
    cursor: params.get("cursor") ?? undefined,
  });
  if (!parsed.success) throw zodToValidationFailed(parsed.error);

  let cursor: { createdAt: Date; id: string } | undefined;
  if (parsed.data.cursor) {
    const decoded = decodeCursor(parsed.data.cursor);
    if (!decoded) throw validationFailed("cursor", "Invalid pagination cursor");
    cursor = decoded;
  }

  return {
    ...(parsed.data.type ? { type: parsed.data.type } : {}),
    campus: parsed.data.campus,
    category: parsed.data.category,
    ...(parsed.data.dateFrom
      ? { dateFrom: new Date(`${parsed.data.dateFrom}T00:00:00.000Z`) }
      : {}),
    ...(parsed.data.dateTo ? { dateTo: new Date(`${parsed.data.dateTo}T23:59:59.999Z`) } : {}),
    ...(parsed.data.custody ? { custody: parsed.data.custody } : {}),
    limit: parsed.data.limit,
    ...(cursor ? { cursor } : {}),
  } as ResolvedBrowseFilters;
}

function assertCrossFieldRules(input: ReportCreateParsed, now: Date): boolean {
  const sensitive = SENSITIVE_SET.has(input.category);

  if (input.imageIds.length > MAX_REPORT_IMAGES) {
    throw new DomainError(
      ErrorCode.UPLOAD_LIMIT_REACHED,
      `A report accepts at most ${MAX_REPORT_IMAGES} images`,
    );
  }

  if (input.type === "LOST") {
    if (input.custody) throw validationFailed("custody", "LOST reports cannot carry custody");
    if (input.hints?.length) throw validationFailed("hints", "LOST reports cannot carry hints");
    if (input.dropPointId) {
      throw validationFailed("dropPointId", "Drop points are only valid with FOUND custody");
    }
  } else {
    if (!input.custody) throw validationFailed("custody", "FOUND reports require custody");
    if (input.custody === "AT_DROP_POINT" && !input.dropPointId) {
      throw validationFailed("dropPointId", "AT_DROP_POINT custody requires a drop point");
    }
    if (input.custody !== "AT_DROP_POINT" && input.dropPointId) {
      throw validationFailed("dropPointId", "A drop point requires AT_DROP_POINT custody");
    }
    const hints = input.hints ?? [];
    if (hints.length < 1 || hints.length > MAX_HINTS) {
      throw validationFailed("hints", `FOUND reports require 1-${MAX_HINTS} hints`);
    }
    if (sensitive && hints.length < MIN_SENSITIVE_HINTS) {
      throw validationFailed("hints", "Sensitive reports require at least 2 hints");
    }
    if (input.imageIds.length < 1) {
      throw validationFailed("imageIds", "FOUND reports require at least one image");
    }
  }

  const from = new Date(input.occurredAt.from);
  if (from.getTime() > now.getTime()) {
    throw validationFailed("occurredAt.from", "occurredAt.from cannot be in the future");
  }
  if (input.occurredAt.to) {
    const to = new Date(input.occurredAt.to);
    if (to.getTime() < from.getTime()) {
      throw validationFailed("occurredAt.to", "occurredAt.to cannot be before from");
    }
  }
  if (input.type === "LOST" && from.getTime() < now.getTime() - REPORT_WINDOW_DAYS * 86_400_000) {
    throw validationFailed("occurredAt.from", "LOST reports cannot be older than 180 days");
  }

  return sensitive;
}

export async function createReport(
  deps: CreateReportDeps,
  raw: unknown,
  ctx: CreateReportContext,
): Promise<ReportOwnerView> {
  const input = parseReportCreate(raw);

  if (deps.isRateLimitEnabled()) {
    for (const rate of REPORT_CREATE_RATES) {
      const result = deps.limiter.check(rate.scope, ctx.userId, rate.limit, rate.windowMs);
      if (!result.allowed) {
        throw new DomainError(ErrorCode.RATE_LIMITED, "Report creation rate limit exceeded", {
          retryAfterSeconds: result.retryAfterSeconds,
        });
      }
    }
  }

  const sensitive = assertCrossFieldRules(input, ctx.now);

  if (input.location.locationId && !(await deps.repo.locationExists(input.location.locationId))) {
    throw validationFailed("location.locationId", "Unknown location");
  }
  if (
    input.custody === "AT_DROP_POINT" &&
    input.dropPointId &&
    !(await deps.repo.dropPointExists(input.dropPointId))
  ) {
    throw validationFailed("dropPointId", "Unknown drop point");
  }

  const imageIds = [...new Set(input.imageIds)];
  if (imageIds.length > 0) {
    const rows = await deps.repo.findAttachableImages(ctx.userId, imageIds);
    const byId = new Map(rows.map((row) => [row.id, row]));
    for (const imageId of imageIds) {
      const row = byId.get(imageId);
      if (
        !row ||
        row.uploaderId !== ctx.userId ||
        row.reportId !== null ||
        row.status !== "READY"
      ) {
        throw validationFailed("imageIds", "Images must be the caller's READY uploads");
      }
    }
  }

  const reportId = randomUUID();
  const record: CreateReportRecord = {
    id: reportId,
    reporterId: ctx.userId,
    type: input.type,
    category: input.category,
    isSensitive: sensitive,
    title: input.title,
    description: input.description,
    colors: input.colors,
    brand: input.brand ?? null,
    campus: input.location.campus,
    locationId: input.location.locationId ?? null,
    locationNote: input.location.note ?? null,
    occurredFrom: new Date(input.occurredAt.from),
    occurredTo: input.occurredAt.to ? new Date(input.occurredAt.to) : null,
    custody: input.type === "FOUND" ? (input.custody as CustodyValue) : null,
    dropPointId: input.custody === "AT_DROP_POINT" && input.dropPointId ? input.dropPointId : null,
    expiresAt: new Date(ctx.now.getTime() + deps.reportTtlDays * 86_400_000),
    createdAt: ctx.now,
  };
  const hints = (input.hints ?? []).map((hint) => ({
    prompt: hint.prompt,
    answerEnc: encryptFieldAnswer(deps.fieldEncryptionKey, hint.answer),
  }));
  await deps.repo.createReport(record, hints, imageIds);

  try {
    await deps.queue.enqueue(reportId);
  } catch (err) {
    logger.warn({ reportId, err }, "report.process enqueue failed after commit");
  }

  return buildOwnerView(deps, reportId, { privileged: true });
}

async function buildOwnerView(
  deps: ReportsReadDeps,
  reportId: string,
  opts: { privileged: boolean },
): Promise<ReportOwnerView> {
  const row = await deps.repo.getReport(reportId);
  if (!row) throw new DomainError(ErrorCode.NOT_FOUND, "Report not found");
  const images = await buildReportImages(await deps.repo.getImages(reportId), {
    privileged: opts.privileged,
    sensitive: row.isSensitive,
    presign: (key) => deps.storage.presignGet(key, PRESIGN_TTL_SECONDS),
  });
  const base = mapReportPublic(row, images, { privileged: opts.privileged });
  const [hintPrompts, matchCount, activeClaimId] = await Promise.all([
    deps.repo.getHintPrompts(reportId),
    deps.repo.getMatchCount(reportId),
    deps.repo.getActiveClaimId(reportId),
  ]);
  return mapReportOwner(base, row, {
    hintPrompts,
    matchCount,
    ...(activeClaimId ? { activeClaimId } : {}),
  });
}

/** BE-03: default browse = opposite of the caller's active intent; AC FR-SRC-001 fallback = FOUND. */
async function resolveBrowseType(repo: ReportsRepository, viewerId: string): Promise<ReportType> {
  const intent = await repo.findActiveIntentType(viewerId);
  return intent === "FOUND" ? "LOST" : "FOUND";
}

export async function listReports(
  deps: ReportsReadDeps,
  opts: { params: URLSearchParams; viewerId: string },
): Promise<{ data: ReportPublicView[]; page: { nextCursor: string | null; hasMore: boolean } }> {
  const filters = parseBrowseQuery(opts.params);
  const type = filters.type ?? (await resolveBrowseType(deps.repo, opts.viewerId));
  const rows = await deps.repo.listReports({ ...filters, type }, opts.viewerId);

  const hasMore = rows.length > filters.limit;
  const pageRows = hasMore ? rows.slice(0, filters.limit) : rows;
  const imagesByReport = await deps.repo.listImagesForReports(pageRows.map((row) => row.id));

  const data = await Promise.all(
    pageRows.map(async (row) => {
      const images = await buildReportImages(imagesByReport.get(row.id) ?? [], {
        privileged: false,
        sensitive: row.isSensitive,
        presign: (key) => deps.storage.presignGet(key, PRESIGN_TTL_SECONDS),
      });
      return mapReportPublic(row, images, { privileged: false });
    }),
  );

  const last = pageRows.at(-1);
  const nextCursor = hasMore && last ? encodeCursor(last.createdAt, last.id) : null;
  return { data, page: { nextCursor, hasMore } };
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getReportView(
  deps: ReportsReadDeps,
  opts: { reportId: string; viewer: ReportViewer },
): Promise<ReportPublicView | ReportOwnerView | ReportModeratorView> {
  if (!UUID_PATTERN.test(opts.reportId)) {
    throw new DomainError(ErrorCode.NOT_FOUND, "Report not found");
  }
  const row = await deps.repo.getReport(opts.reportId);
  if (!row) throw new DomainError(ErrorCode.NOT_FOUND, "Report not found");

  const owner = row.reporterId === opts.viewer.userId;
  const moderator =
    opts.viewer.role === "ADMIN" ||
    (opts.viewer.role === "MODERATOR" && opts.viewer.moderatorCampus === row.campus);
  const privileged = owner || moderator;

  if (row.status === "REMOVED" && !privileged) {
    throw new DomainError(ErrorCode.NOT_FOUND, "Report not found");
  }

  const images = await buildReportImages(await deps.repo.getImages(opts.reportId), {
    privileged,
    sensitive: row.isSensitive,
    presign: (key) => deps.storage.presignGet(key, PRESIGN_TTL_SECONDS),
  });
  const base = mapReportPublic(row, images, { privileged });

  if (!owner && !moderator) return base;

  const [hintPrompts, matchCount, activeClaimId] = await Promise.all([
    deps.repo.getHintPrompts(opts.reportId),
    deps.repo.getMatchCount(opts.reportId),
    deps.repo.getActiveClaimId(opts.reportId),
  ]);
  const ownerView = mapReportOwner(base, row, {
    hintPrompts,
    matchCount,
    ...(activeClaimId ? { activeClaimId } : {}),
  });

  if (owner) return ownerView;

  const reporterEmail = (await deps.repo.getReporterEmail(row.reporterId)) ?? "";
  const flagCount = await deps.repo.getFlagCount(opts.reportId);
  return mapReportModerator(ownerView, {
    reporterId: row.reporterId,
    reporterEmail,
    flagCount,
  });
}
