import { testDefaults } from "@temuunair/config/vitest";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  plugins: [
    tsconfigPaths({
      projects: ["apps/web/tsconfig.json", "tsconfig.test.json"],
    }),
  ],
  test: { ...testDefaults },
});
