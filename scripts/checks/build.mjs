#!/usr/bin/env node
// Workspace build step (TMU-OPS-001).
//
// M0 has no buildable app package yet; `apps/web` arrives in TMU-OPS-003 and `apps/worker` in
// TMU-OPS-007. Once either exists this script delegates to turbo so `pnpm build` and the gate's
// full-mode build step exercise the real workspace graph.
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const WORKSPACE_PACKAGES = [
  ["apps/web", "TMU-OPS-003"],
  ["apps/worker", "TMU-OPS-007"],
];

const present = WORKSPACE_PACKAGES.filter(([dir]) => existsSync(`${dir}/package.json`));

if (present.length === 0) {
  console.log("pending: build — no buildable workspace package yet");
  for (const [dir, owner] of WORKSPACE_PACKAGES) {
    console.log(`         ${dir} arrives in ${owner}`);
  }
  console.log("         nothing to build; exiting 0 (M0 exit criteria allow a no-op gate)");
  process.exit(0);
}

const names = present.map(([dir]) => {
  const pkg = JSON.parse(readFileSync(`${dir}/package.json`, "utf8"));
  return pkg.name ?? dir;
});

console.log(`build: running turbo for ${names.join(", ")}`);
execSync("pnpm exec turbo run build", { stdio: "inherit" });
