import type { UserConfig } from "vitest/config";

// Shared Vitest defaults (TMU-OPS-002). Component tests opt into jsdom per-file via
// `@vitest-environment jsdom` (TMU-OPS-003).
export const testDefaults: NonNullable<UserConfig["test"]> = {
  environment: "node",
  include: ["**/*.test.{ts,tsx,mts,mjs}"],
  exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/build/**", "services/ml/**"],
  passWithNoTests: false,
};
