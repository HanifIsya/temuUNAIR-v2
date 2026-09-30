#!/usr/bin/env node
// Placeholder gate steps (TMU-OPS-001).
//
// M0 exit criteria (docs/01-product/10-roadmap.md) require `pnpm gate` to run end to end even
// though most checks only become real once their milestone lands. Every step routed here prints
// what will implement it and exits 0 so the gate stays green and honest about its coverage.
//
// Each placeholder is replaced by a real implementation in the task named below:
//   contracts:*  -> TMU-OPS-004 (packages/contracts)
//   db:*         -> TMU-OPS-005 (packages/db)
//   test:e2e     -> TMU-OPS-008 (Playwright, needs the web shell from TMU-OPS-003)
//   test:integration / test:contract / seed -> TMU-OPS-008
import { readFileSync, existsSync } from "node:fs";

const STEPS = {
  "contracts:build": {
    owner: "TMU-OPS-004",
    detail: "regenerates OpenAPI, TS types, client and MSW handlers from packages/contracts",
  },
  "contracts:check": {
    owner: "TMU-OPS-004",
    detail: "fails when a generated contract artefact is out of sync or hand-edited",
  },
  "contracts:lint": {
    owner: "TMU-OPS-004",
    detail: "validates the emitted OpenAPI against the BE-01 conventions",
  },
  "contracts:breaking": {
    owner: "TMU-OPS-004",
    detail: "compares the emitted contract against the last released CONTRACT_VERSION",
  },
  "db:check": {
    owner: "TMU-OPS-005",
    detail: "applies migrations to an empty pgvector database and diffs the result",
  },
  "db:generate": {
    owner: "TMU-OPS-005",
    detail: "generates a forward-only migration from the Drizzle schema",
  },
  "db:migrate": {
    owner: "TMU-OPS-005",
    detail: "applies pending migrations to DATABASE_URL",
  },
  seed: {
    owner: "TMU-OPS-005",
    detail: "loads synthetic demo data (docs/06-quality/05-seed-and-fixture-data.md)",
  },
  "test:integration": {
    owner: "TMU-OPS-008",
    detail: "Vitest + testcontainers against real Postgres, MinIO and Mailpit",
  },
  "test:contract": {
    owner: "TMU-OPS-008",
    detail: "Schemathesis fuzzing of the web and ML OpenAPI documents",
  },
  "test:e2e": {
    owner: "TMU-OPS-008",
    detail: "Playwright scenarios E2E-01..15 with ML_MODE=stub",
  },
};

const step = process.argv[2];
const spec = STEPS[step];

if (!spec) {
  console.error(`Unknown placeholder step: ${step ?? "(none given)"}`);
  process.exit(1);
}

const contractVersion = existsSync("docs/04-contracts/CONTRACT_VERSION")
  ? readFileSync("docs/04-contracts/CONTRACT_VERSION", "utf8").trim()
  : "unknown";

console.log(`pending: ${step} — not implemented until ${spec.owner}`);
console.log(`         ${spec.detail}`);
if (step.startsWith("contracts:")) {
  console.log(`         contract set in docs: v${contractVersion}`);
}
console.log("         M0 exit criteria allow this step to be a no-op; it exits 0.");
