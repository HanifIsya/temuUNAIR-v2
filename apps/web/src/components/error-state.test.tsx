/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: (props: import("react").ComponentProps<"a">) => {
    const { href, children, ...rest } = props;
    return (
      <a {...rest} href={href}>
        {children}
      </a>
    );
  },
}));

import { ErrorState, type ErrorStateProps } from "./error-state";

const PROBE_MESSAGES = {
  auth: {
    error: {
      title: "PROBE TITLE",
      domain: "PROBE DOMAIN",
      action: { another: "PROBE ACTION" },
    },
  },
  common: { retry: "PROBE RETRY", copy: "PROBE COPY", copied: "PROBE COPIED" },
};

function renderErrorState(props: Partial<ErrorStateProps> = {}) {
  const merged: ErrorStateProps = {
    titleKey: "auth.error.title",
    descKey: "auth.error.domain",
    ...props,
  };
  return render(
    <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
      <ErrorState {...merged} />
    </NextIntlClientProvider>,
  );
}

afterEach(cleanup);

describe("ErrorState", () => {
  it("renders title and message from i18n keys and focuses the heading", () => {
    renderErrorState();

    expect(screen.getByRole("heading").textContent).toBe("PROBE TITLE");
    const message = screen.getByRole("alert");
    expect(message.textContent).toBe("PROBE DOMAIN");
    expect(document.activeElement).toBe(screen.getByRole("heading"));
  });

  it("renders an h1 when heading level 1 is requested", () => {
    renderErrorState({ headingLevel: 1 });

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("PROBE TITLE");
  });

  it("links the action to the message through aria-describedby", () => {
    renderErrorState({
      action: { labelKey: "auth.error.action.another", href: "/login" },
    });

    const action = screen.getByTestId("error-state-action");
    const message = screen.getByTestId("error-state-message");
    expect(action.getAttribute("href")).toBe("/login");
    expect(action.textContent).toBe("PROBE ACTION");
    expect(action.getAttribute("aria-describedby")).toBe(message.getAttribute("id"));
  });

  it("omits the action entirely when none is given", () => {
    renderErrorState({ action: undefined });

    expect(screen.queryByTestId("error-state-action")).toBeNull();
  });

  it("invokes onRetry from the retry button", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderErrorState({ onRetry });

    await user.click(screen.getByTestId("error-state-retry"));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("error-state-retry").textContent).toBe("PROBE RETRY");
  });

  it("shows the requestId and copies it to the clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    renderErrorState({ requestId: "req-123" });

    expect(screen.getByTestId("error-request-id").textContent).toContain("req-123");
    await user.click(screen.getByTestId("error-request-id-copy"));
    expect(writeText).toHaveBeenCalledWith("req-123");
    expect(screen.getByTestId("error-request-id-copy").textContent).toBe("PROBE COPIED");
  });

  it("keeps the message hidden from no one: aria-linked and announced", () => {
    renderErrorState({ requestId: "req-456", headingLevel: 1 });

    const message = screen.getByTestId("error-state-message");
    expect(message.getAttribute("role")).toBe("alert");
    expect(message.getAttribute("id")).toBeTruthy();
    expect(screen.getByTestId("error-request-id")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = renderErrorState({ requestId: "req-123", onRetry: vi.fn() });
    const results = await axe(container);

    expect(results.violations).toEqual([]);
  });
});
