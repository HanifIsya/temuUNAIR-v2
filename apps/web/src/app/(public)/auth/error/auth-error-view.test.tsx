/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
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

import MESSAGES from "@/i18n/messages/id.json";

import { AuthErrorView } from "./auth-error-view";

const PROBE_MESSAGES = {
  auth: {
    error: {
      title: "PROBE TITLE",
      domain: "PROBE DOMAIN",
      generic: "PROBE GENERIC",
      action: { another: "PROBE ACTION" },
      suspended: { title: "PROBE SUSPENDED" },
    },
  },
  error: { ACCOUNT_SUSPENDED: "PROBE SUSPENDED BODY" },
  common: { copy: "PROBE COPY", copied: "PROBE COPIED", retry: "PROBE RETRY" },
};

function renderView(code: string | null, realCopy = false) {
  return render(
    <NextIntlClientProvider locale="id" messages={realCopy ? MESSAGES : PROBE_MESSAGES}>
      <AuthErrorView code={code} />
    </NextIntlClientProvider>,
  );
}

afterEach(cleanup);

describe("AuthErrorView", () => {
  it("explains a rejected domain with a 'coba akun lain' link to login", () => {
    renderView("AUTH_DOMAIN_NOT_ALLOWED");

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("PROBE TITLE");
    expect(screen.getByTestId("auth-error-message").textContent).toBe("PROBE DOMAIN");
    const action = screen.getByTestId("error-state-action");
    expect(action.getAttribute("href")).toBe("/login");
    expect(action.textContent).toBe("PROBE ACTION");
  });

  it("focuses the heading on load", () => {
    renderView("AUTH_DOMAIN_NOT_ALLOWED");

    expect(document.activeElement).toBe(screen.getByRole("heading", { level: 1 }));
  });

  it("treats the Auth.js AccessDenied callback as a domain rejection", () => {
    renderView("AccessDenied");

    expect(screen.getByTestId("auth-error-message").textContent).toBe("PROBE DOMAIN");
    expect(screen.getByTestId("error-state-action")).toBeTruthy();
  });

  it("shows the suspended account notice without any retry action", () => {
    renderView("ACCOUNT_SUSPENDED");

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("PROBE SUSPENDED");
    expect(screen.getByTestId("auth-error-message").textContent).toBe("PROBE SUSPENDED BODY");
    expect(screen.queryByTestId("error-state-action")).toBeNull();
  });

  it("falls back to a generic message with a retry link for provider failures", () => {
    renderView("OAuthCallback");

    expect(screen.getByTestId("auth-error-message").textContent).toBe("PROBE GENERIC");
    expect(screen.getByTestId("error-state-action").getAttribute("href")).toBe("/login");
  });

  it("maps a missing or unknown error to the generic message", () => {
    renderView(null);

    expect(screen.getByTestId("auth-error-message").textContent).toBe("PROBE GENERIC");
    expect(screen.getByText("PROBE GENERIC")).toBeTruthy();
  });

  it("matches the SCR-002 Indonesian copy", () => {
    renderView("AUTH_DOMAIN_NOT_ALLOWED", true);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Tidak bisa masuk");
    expect(screen.getByTestId("auth-error-message").textContent).toBe(
      "Akun ini bukan akun UNAIR. Masuk dengan email kampus.",
    );
  });

  it("exposes exactly one h1 and one main landmark", () => {
    const { container } = renderView("AUTH_DOMAIN_NOT_ALLOWED");

    expect(screen.getAllByRole("heading", { level: 1 }).length).toBe(1);
    expect(container.querySelectorAll("main").length).toBe(1);
    expect(container.querySelector("main")?.id).toBe("main");
  });

  it("has no axe violations", async () => {
    const { container } = renderView("ACCOUNT_SUSPENDED");
    const results = await axe(container);

    expect(results.violations).toEqual([]);
  });
});
