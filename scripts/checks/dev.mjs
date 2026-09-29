#!/usr/bin/env node
// Dev-server launcher (TMU-OPS-001).
//
// `pnpm dev` and `pnpm dev:worker` must exist from M0 so docs/07-ops/01-local-dev-setup.md is
// accurate, but the apps themselves arrive in TMU-OPS-003 (web) and TMU-OPS-007 (worker). This
// script reports which one is missing instead of failing with an opaque pnpm error.
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

const TARGETS = {
  web: { dir: "apps/web", owner: "TMU-OPS-003", filter: "@temuunair/web" },
  worker: { dir: "apps/worker", owner: "TMU-OPS-007", filter: "@temuunair/worker" },
};

const target = process.argv[2] === "worker" ? TARGETS.worker : TARGETS.web;

if (!existsSync(`${target.dir}/package.json`)) {
  console.error(`pending: ${target.dir} does not exist yet — created in ${target.owner}`);
  console.error("         see docs/07-ops/01-local-dev-setup.md for what will run here");
  process.exit(1);
}

execSync(`pnpm --filter ${target.filter} dev`, { stdio: "inherit" });
