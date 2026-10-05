/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NotificationBell } from "./notification-bell";

const PROBE_MESSAGES = {
  common: {
    nav: {
      notificationsCount: "PROBE {count, plural, =0 {ZERO} other {N#}}",
    },
  },
};

function renderBell(count: number, onOpen = vi.fn()) {
  const view = render(
    <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
      <NotificationBell count={count} onOpen={onOpen} />
    </NextIntlClientProvider>,
  );
  return { ...view, onOpen };
}

afterEach(() => {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    get: () => true,
  });
  cleanup();
});

describe("NotificationBell", () => {
  it("renders the zero state without a chip", () => {
    renderBell(0);

    expect(screen.getByTestId("notification-bell").getAttribute("aria-label")).toBe("PROBE ZERO");
    expect(screen.queryByTestId("notification-bell-badge")).toBeNull();
  });

  it("renders the unread chip when the count is positive", () => {
    renderBell(3);

    const badge = screen.getByTestId("notification-bell-badge");
    expect(badge.textContent).toBe("3");
    expect(badge.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByTestId("notification-bell").getAttribute("aria-label")).toBe("PROBE N3");
  });

  it("emits onOpen when activated", async () => {
    const user = userEvent.setup();
    const { onOpen } = renderBell(0);

    await user.click(screen.getByTestId("notification-bell"));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("renders and stays operable while offline", async () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    const user = userEvent.setup();
    const { onOpen } = renderBell(0);

    await user.click(screen.getByTestId("notification-bell"));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations", async () => {
    const { container } = renderBell(2);

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
