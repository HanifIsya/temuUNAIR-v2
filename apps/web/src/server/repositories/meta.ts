// apps/web/src/server/repositories/meta.ts
// Drizzle implementation of MetaRepository (SQL lives only here).

import { and, asc, eq, sql } from "drizzle-orm";
import { dropPoints, locations } from "@temuunair/db/src/schema";
import type { Db } from "../db";

export interface LocationRow {
  id: string;
  campus: string;
  name: string;
}

export interface DropPointRow {
  id: string;
  campus: string;
  name: string;
  locationId: string | null;
  hours: unknown;
  contactNote: string | null;
  active: boolean;
}

export interface MetaRepository {
  countActiveLocationsByCampus(): Promise<Map<string, number>>;
  listLocations(campus?: string): Promise<LocationRow[]>;
  listDropPoints(campus?: string): Promise<DropPointRow[]>;
}

export class PgMetaRepository implements MetaRepository {
  constructor(private readonly db: Db) {}

  async countActiveLocationsByCampus(): Promise<Map<string, number>> {
    const rows = await this.db
      .select({ campus: locations.campus, count: sql<number>`count(*)::int` })
      .from(locations)
      .where(eq(locations.active, true))
      .groupBy(locations.campus);
    return new Map(rows.map((row) => [row.campus as string, row.count]));
  }

  async listLocations(campus?: string): Promise<LocationRow[]> {
    const filters = [eq(locations.active, true)];
    if (campus) filters.push(eq(locations.campus, campus as "KAMPUS_A"));
    const rows = await this.db
      .select({ id: locations.id, campus: locations.campus, name: locations.name })
      .from(locations)
      .where(and(...filters))
      .orderBy(asc(locations.name));
    return rows as LocationRow[];
  }

  async listDropPoints(campus?: string): Promise<DropPointRow[]> {
    const filters = [eq(dropPoints.active, true)];
    if (campus) filters.push(eq(dropPoints.campus, campus as "KAMPUS_A"));
    const rows = await this.db
      .select({
        id: dropPoints.id,
        campus: dropPoints.campus,
        name: dropPoints.name,
        locationId: dropPoints.locationId,
        hours: dropPoints.hours,
        contactNote: dropPoints.contactNote,
        active: dropPoints.active,
      })
      .from(dropPoints)
      .where(and(...filters))
      .orderBy(asc(dropPoints.name));
    return rows as unknown as DropPointRow[];
  }
}
