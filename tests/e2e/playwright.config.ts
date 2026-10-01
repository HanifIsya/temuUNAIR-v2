import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  retries: 0,
  workers: 1,
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm --filter @temuunair/web start -p 3000",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
    env: {
      ML_MODE: "stub",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
