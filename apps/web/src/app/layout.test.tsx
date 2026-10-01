/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getLocale: vi.fn(), getMessages: vi.fn() }));

vi.mock("next-intl/server", () => ({
  getLocale: mocks.getLocale,
  getMessages: mocks.getMessages,
}));

import { useTranslations } from "next-intl";

import RootLayout from "./layout";

function Probe() {
  const t = useTranslations("app");
  return (
    <p>
      {t("name")} — {t("tagline")}
    </p>
  );
}

const ID_MESSAGES = {
  app: { name: "TemuUNAIR", tagline: "Hilang hari ini, ketemu bersama" },
};
const EN_MESSAGES = {
  app: { name: "TemuUNAIR", tagline: "Lost Today, Found Together" },
};

afterEach(cleanup);

describe("root layout", () => {
  it("renders in id and switches to en", async () => {
    mocks.getLocale.mockResolvedValue("id");
    mocks.getMessages.mockResolvedValue(ID_MESSAGES);

    render(await RootLayout({ children: <Probe /> }));

    expect(document.querySelector("html")?.getAttribute("lang")).toBe("id");
    expect(screen.getByText(/Hilang hari ini, ketemu bersama/)).toBeTruthy();

    cleanup();
    mocks.getLocale.mockResolvedValue("en");
    mocks.getMessages.mockResolvedValue(EN_MESSAGES);

    render(await RootLayout({ children: <Probe /> }));

    expect(document.querySelector("html")?.getAttribute("lang")).toBe("en");
    expect(screen.getByText(/Lost Today, Found Together/)).toBeTruthy();
  });

  it("exposes the brand and tagline in the document language", async () => {
    mocks.getLocale.mockResolvedValue("id");
    mocks.getMessages.mockResolvedValue(ID_MESSAGES);

    render(await RootLayout({ children: <Probe /> }));

    expect(screen.getByText(/TemuUNAIR/)).toBeTruthy();
    expect(screen.getByText(/Hilang hari ini, ketemu bersama/)).toBeTruthy();
  });

  it("has no axe violations", async () => {
    mocks.getLocale.mockResolvedValue("id");
    mocks.getMessages.mockResolvedValue(ID_MESSAGES);

    const { container } = render(await RootLayout({ children: <Probe /> }));
    const results = await axe(container);

    expect(results.violations).toEqual([]);
  });
});
