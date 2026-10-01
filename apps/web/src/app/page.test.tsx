/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";

import HomePage from "./page";

const MESSAGES = {
  app: { name: "TemuUNAIR", tagline: "Hilang hari ini, ketemu bersama" },
};

afterEach(cleanup);

describe("home page", () => {
  it("renders translated copy from the app namespace", () => {
    render(
      <NextIntlClientProvider locale="id" messages={MESSAGES}>
        <HomePage />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("TemuUNAIR");
    expect(screen.getByText("Hilang hari ini, ketemu bersama")).toBeTruthy();
  });

  it("exposes exactly one main landmark with id main", () => {
    const { container } = render(
      <NextIntlClientProvider locale="id" messages={MESSAGES}>
        <HomePage />
      </NextIntlClientProvider>,
    );

    expect(container.querySelectorAll("main").length).toBe(1);
    expect(container.querySelector("main")?.id).toBe("main");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <NextIntlClientProvider locale="id" messages={MESSAGES}>
        <HomePage />
      </NextIntlClientProvider>,
    );
    const results = await axe(container);

    expect(results.violations).toEqual([]);
  });
});
