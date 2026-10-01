import { testDefaults } from "@temuunair/config/vitest";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: { ...testDefaults },
});
