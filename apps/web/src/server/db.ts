// apps/web/src/server/db.ts
// Lazy Drizzle singleton. Importing this module never opens a connection —
// the pool is created on the first getDb() call (tests inject their own db).

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@temuunair/db/src/schema";
import { parseConfig } from "./config";

function makeDb(connectionString: string) {
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}

export type Db = ReturnType<typeof makeDb>;

let db: Db | null = null;

export function getDb(): Db {
  db ??= makeDb(parseConfig(process.env).databaseUrl);
  return db;
}
