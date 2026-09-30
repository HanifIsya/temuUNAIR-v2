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
const document = parse(readFileSync(join(repoRoot, openApiPath), "utf8"));

const findings = lintOpenApi(document);
for (const finding of findings) {
  process.stderr.write(`${finding.rule} ${finding.path}: ${finding.message}\n`);
}

if (findings.length > 0) {
  process.stderr.write(`contracts:lint failed: ${findings.length} finding(s)\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("contracts:lint OK\n");
}
