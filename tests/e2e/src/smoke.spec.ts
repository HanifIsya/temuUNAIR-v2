import { test, expect } from "@playwright/test";

test.describe("Web App Smoke Scenario (TMU-OPS-013)", () => {
  test("loads landing page with TemuUNAIR title and language", async ({ page }) => {
    const response = await page.goto("/");
    expect(response).toBeDefined();
    await expect(page).toHaveTitle(/TemuUNAIR/);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", /^(id|en)$/);
  });
});
