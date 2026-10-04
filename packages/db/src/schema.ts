// Drizzle schema mirror of BE-05 (docs/04-contracts/backend/BE-05-database-contract.md).
// TMU-DB-001 lands the core tables only (users, Auth.js adapter, locations, drop_points);
// reports/matching/claims/ops tables arrive with TMU-DB-002..005. The `db:check` drift gate
// diffs this module against the applied migration folder — they must stay identical.
import { sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  doublePrecision,
  jsonb,
  integer,
  primaryKey,
  check,
  customType,
  smallint,
  index,
  vector,
  numeric,
  unique,
} from "drizzle-orm/pg-core";

// citext lives in the database (0001_init creates the extension); drizzle-orm has no
// built-in builder, so it is declared as a custom type that generates the `citext` DDL.
const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const userRole = pgEnum("user_role", ["USER", "MODERATOR", "ADMIN"]);
export const campus = pgEnum("campus", ["KAMPUS_A", "KAMPUS_B", "KAMPUS_C", "BANYUWANGI"]);
export const reportType = pgEnum("report_type", ["LOST", "FOUND"]);
export const reportStatus = pgEnum("report_status", [
  "PENDING_REVIEW",
  "OPEN",
  "MATCHED",
  "IN_VERIFICATION",
  "RETURNED",
  "EXPIRED",
  "CANCELLED",
  "REMOVED",
]);
export const matchState = pgEnum("match_state", [
  "SUGGESTED",
  "DISMISSED",
  "CLAIMED",
  "INVALIDATED",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    email: citext("email").notNull().unique(),
    displayName: text("display_name").notNull(),
    // NIM/NIP when provided; never exposed in API responses (BE-05, privacy rule 5).
    unairRef: text("unair_ref"),
    role: userRole("role").notNull().default("USER"),
    moderatorCampus: campus("moderator_campus"),
    locale: text("locale").notNull().default("id"),
    status: text("status").notNull().default("ACTIVE"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("users_status_check", sql`${table.status} IN ('ACTIVE', 'SUSPENDED', 'DELETED')`),
  ],
);

// Auth.js adapter tables (BE-05: "+ Auth.js adapter tables: accounts, sessions,
// verification_tokens") — canonical @auth/drizzle-adapter shapes. BE-05 rule 7 exception:
// they carry composite natural keys and no `id uuid`/`updated_at` of their own.
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey(),
  campus: campus("campus").notNull(),
  name: text("name").notNull(),
  // BUILDING|ROOM|CANTEEN|LIBRARY|PARKING|PRAYER|SPORT|OUTDOOR|OTHER (BE-05 comment).
  kind: text("kind").notNull(),
  parentId: uuid("parent_id").references((): AnyPgColumn => locations.id),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  active: boolean("active").notNull().default(true),
});

export const dropPoints = pgTable("drop_points", {
  id: uuid("id").primaryKey(),
  campus: campus("campus").notNull(),
  locationId: uuid("location_id").references(() => locations.id),
  name: text("name").notNull(),
  hours: jsonb("hours"),
  contactNote: text("contact_note"),
  active: boolean("active").notNull().default(true),
});

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey(),
    type: reportType("type").notNull(),
    status: reportStatus("status").notNull().default("OPEN"),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id),
    category: text("category").notNull(),
    isSensitive: boolean("is_sensitive").notNull().default(false),
    title: text("title").notNull(),
    description: text("description").notNull(),
    colors: text("colors").array().notNull().default([]),
    brand: text("brand"),
    campus: campus("campus").notNull(),
    locationId: uuid("location_id").references(() => locations.id),
    locationNote: text("location_note"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    occurredFrom: timestamp("occurred_from", { withTimezone: true }).notNull(),
    occurredTo: timestamp("occurred_to", { withTimezone: true }),
    custody: text("custody"),
    dropPointId: uuid("drop_point_id").references(() => dropPoints.id),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    searchTsv: tsvector("search_tsv"),
    needsReprocess: boolean("needs_reprocess").notNull().default(false),
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("reports_custody_check", sql`(${table.custody} IN ('HELD_BY_FINDER', 'AT_DROP_POINT'))`),
    check(
      "reports_found_custody_check",
      sql`(${table.type} = 'FOUND') = (${table.custody} IS NOT NULL)`,
    ),
    index("reports_browse_idx").on(table.type, table.status, table.campus, table.createdAt.desc()),
    index("reports_reporter_idx").on(table.reporterId, table.createdAt.desc()),
    index("reports_tsv_idx").using("gin", table.searchTsv),
    index("reports_expiry_idx")
      .on(table.expiresAt)
      .where(sql`${table.status} IN ('OPEN', 'MATCHED')`),
  ],
);

export const reportImages = pgTable(
  "report_images",
  {
    id: uuid("id").primaryKey(),
    reportId: uuid("report_id").references(() => reports.id, { onDelete: "cascade" }),
    uploaderId: uuid("uploader_id")
      .notNull()
      .references(() => users.id),
    storageKey: text("storage_key").notNull(),
    thumbKey: text("thumb_key"),
    maskedKey: text("masked_key"),
    mime: text("mime").notNull(),
    width: integer("width"),
    height: integer("height"),
    sha256: text("sha256"),
    status: text("status").notNull().default("PENDING"),
    position: smallint("position").notNull().default(0),
  },
  (table) => [
    check("report_images_status_check", sql`${table.status} IN ('PENDING', 'READY', 'REJECTED')`),
  ],
);

export const verificationHints = pgTable("verification_hints", {
  id: uuid("id").primaryKey(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => reports.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  answerEnc: bytea("answer_enc").notNull(),
});

export const imageFeatures = pgTable("image_features", {
  imageId: uuid("image_id")
    .primaryKey()
    .references(() => reportImages.id, { onDelete: "cascade" }),
  embedding: vector("embedding", { dimensions: 512 }).notNull(),
  detection: jsonb("detection"),
  quality: jsonb("quality"),
  categoryScores: jsonb("category_scores"),
  modelVersions: jsonb("model_versions").notNull(),
});

export const reportFeatures = pgTable(
  "report_features",
  {
    reportId: uuid("report_id")
      .primaryKey()
      .references(() => reports.id, { onDelete: "cascade" }),
    imageEmbedding: vector("image_embedding", { dimensions: 512 }),
    clipTextEmbedding: vector("clip_text_embedding", { dimensions: 512 }),
    sentenceEmbedding: vector("sentence_embedding", { dimensions: 384 }),
    attributes: jsonb("attributes").notNull().default({}),
    modelVersions: jsonb("model_versions").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("report_features_img_hnsw").using("hnsw", table.imageEmbedding.op("vector_cosine_ops")),
    index("report_features_txt_hnsw").using(
      "hnsw",
      table.clipTextEmbedding.op("vector_cosine_ops"),
    ),
    index("report_features_sent_hnsw").using(
      "hnsw",
      table.sentenceEmbedding.op("vector_cosine_ops"),
    ),
  ],
);

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").primaryKey(),
    lostReportId: uuid("lost_report_id")
      .notNull()
      .references(() => reports.id),
    foundReportId: uuid("found_report_id")
      .notNull()
      .references(() => reports.id),
    score: numeric("score", { precision: 4, scale: 3 }).notNull(),
    band: text("band").notNull(),
    reasons: jsonb("reasons").notNull(),
    components: jsonb("components").notNull(),
    state: matchState("state").notNull().default("SUGGESTED"),
    algoVersion: text("algo_version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("matches_lost_report_id_found_report_id_unique").on(
      table.lostReportId,
      table.foundReportId,
    ),
  ],
);
