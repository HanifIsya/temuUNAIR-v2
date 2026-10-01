#!/usr/bin/env node
// `contracts:lint` (TMU-OPS-004): validate the emitted OpenAPI document against the BE-01
// conventions (the deterministic TS implementation of the BE-02 rule set).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { lintOpenApi } from "../src/lint.ts";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const openApiPath = "docs/04-contracts/backend/BE-02-openapi.yaml";

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

// src/lint.ts never throws; the read+parse at the edge must not either — a malformed hand-edit
// fails readably with `contracts:lint failed: …` instead of a raw Node stack
// (REV-TMU-OPS-004 MINOR 3).
const load = (): { ok: true; document: unknown } | { ok: false; error: string } => {
  let raw: string;
  try {
    raw = readFileSync(join(repoRoot, openApiPath), "utf8");
  } catch (error) {
    return { ok: false, error: `cannot read ${openApiPath}: ${messageOf(error)}` };
  }
  try {
    return { ok: true, document: parse(raw) };
  } catch (error) {
    return { ok: false, error: `invalid YAML in ${openApiPath}: ${messageOf(error)}` };
  }
};

const loaded = load();
if (!loaded.ok) {
  process.stderr.write(`contracts:lint failed: ${loaded.error}\n`);
  process.exitCode = 1;
} else {
  const findings = lintOpenApi(loaded.document);
  for (const finding of findings) {
    process.stderr.write(`${finding.rule} ${finding.path}: ${finding.message}\n`);
  }

  if (findings.length > 0) {
    process.stderr.write(`contracts:lint failed: ${findings.length} finding(s)\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write("contracts:lint OK\n");
  }
}
