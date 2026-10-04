/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LocaleSwitcher } from "./locale-switcher";

const PROBE_MESSAGES = {
  common: {
    localeSwitcher: {
      label: "PROBE SWITCH",
      changed: "PROBE CHANGED {language}",
    },
  },
};

function renderSwitcher(locale: "id" | "en", onChange = vi.fn()) {
  const view = render(
    <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
      <LocaleSwitcher locale={locale} onChange={onChange} />
    </NextIntlClientProvider>,
  );
  return { ...view, onChange };
}

afterEach(cleanup);

describe("LocaleSwitcher", () => {
  it("labels the group and marks the active locale", () => {
    renderSwitcher("id");

    expect(screen.getByRole("group", { name: "PROBE SWITCH" })).toBeTruthy();
    expect(screen.getByTestId("locale-switcher-id").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("locale-switcher-en").getAttribute("aria-pressed")).toBe("false");
  });

  it("emits onChange and announces the switch", async () => {
    const user = userEvent.setup();
    const { onChange } = renderSwitcher("id");

    await user.click(screen.getByTestId("locale-switcher-en"));

    expect(onChange).toHaveBeenCalledWith("en");
    expect(screen.getByTestId("locale-switcher-announcement").textContent).toBe(
      "PROBE CHANGED English",
    );
  });

  it("ignores re-selecting the current locale", async () => {
    const user = userEvent.setup();
    const { onChange } = renderSwitcher("id");

    await user.click(screen.getByTestId("locale-switcher-id"));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId("locale-switcher-announcement").textContent).toBe("");
  });

  it("is keyboard operable", async () => {
    const user = userEvent.setup();
    const { onChange } = renderSwitcher("id");

    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId("locale-switcher-en"));

    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("en");
  });

  it("has no axe violations", async () => {
    const { container } = renderSwitcher("id");

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
