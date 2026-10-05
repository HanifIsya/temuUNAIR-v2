#!/usr/bin/env tsx
// packages/db/seeds/run.ts
// Applies M3 seed data to the database specified by DATABASE_URL.
// Idempotent: uses ON CONFLICT DO NOTHING throughout.
/* eslint-disable no-console -- CLI script, console is intentional */

import { createRequire } from "node:module";
import { generateAllSql } from "./seed.js";

const require = createRequire(import.meta.url);
const pg = require("pg") as typeof import("pg");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();

  try {
    const sql = generateAllSql();
    await client.query(sql);
    console.log("Seeds applied successfully.");
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
