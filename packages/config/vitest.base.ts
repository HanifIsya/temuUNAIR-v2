import type { UserConfig } from "vitest/config";

// Shared Vitest defaults (TMU-OPS-002). Component tests opt into jsdom per-file via
// `@vitest-environment jsdom` (TMU-OPS-003).
export const testDefaults: NonNullable<UserConfig["test"]> = {
  environment: "node",
  include: ["**/*.test.{ts,tsx,mts,mjs}"],
  exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/build/**", "services/ml/**"],
  passWithNoTests: false,
  // Cold ESLint load in scripts/checks/config-presets.test.mjs measured ~5.4 s (TMU-META-002),
  // above the 5 s Vitest default; give every suite headroom on a fresh worktree.
  testTimeout: 15000,
};
