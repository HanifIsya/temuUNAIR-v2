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
} from "drizzle-orm/pg-core";

// citext lives in the database (0001_init creates the extension); drizzle-orm has no
// built-in builder, so it is declared as a custom type that generates the `citext` DDL.
const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

export const userRole = pgEnum("user_role", ["USER", "MODERATOR", "ADMIN"]);
export const campus = pgEnum("campus", ["KAMPUS_A", "KAMPUS_B", "KAMPUS_C", "BANYUWANGI"]);

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
