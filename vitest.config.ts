import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Component tests opt into jsdom per-file via `@vitest-environment jsdom` (TMU-OPS-003).
    environment: "node",
    include: ["**/*.test.{ts,tsx,mts,mjs}"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/build/**", "services/ml/**"],
    passWithNoTests: false,
  },
});
