/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({ useSession: vi.fn() }));

vi.mock("next-auth/react", () => authMocks);
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

import { PublicHeader } from "./public-header";

const PROBE_MESSAGES = {
  app: { name: "TemuUNAIR" },
  common: { signIn: "PROBE SIGNIN", home: "PROBE HOME", skipToContent: "PROBE SKIP" },
};

function renderHeader() {
  return render(
    <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
      <PublicHeader />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  authMocks.useSession.mockReset();
});
afterEach(cleanup);

describe("PublicHeader", () => {
  it("shows a session skeleton while the session is loading", () => {
    authMocks.useSession.mockReturnValue({ status: "loading", data: null });
    renderHeader();

    const skeleton = screen.getByTestId("header-session-skeleton");
    expect(skeleton.getAttribute("aria-busy")).toBe("true");
    expect(screen.queryByTestId("header-login-button")).toBeNull();
    expect(screen.queryByTestId("header-home-link")).toBeNull();
  });

  it("offers sign-in to unauthenticated visitors", () => {
    authMocks.useSession.mockReturnValue({ status: "unauthenticated", data: null });
    renderHeader();

    const link = screen.getByTestId("header-login-button");
    expect(link.getAttribute("href")).toBe("/login");
    expect(link.textContent).toBe("PROBE SIGNIN");
    expect(screen.queryByTestId("header-home-link")).toBeNull();
  });

  it("links signed-in visitors home instead of sign-in", () => {
    authMocks.useSession.mockReturnValue({ status: "authenticated", data: null });
    renderHeader();

    const link = screen.getByTestId("header-home-link");
    expect(link.getAttribute("href")).toBe("/home");
    expect(link.textContent).toBe("PROBE HOME");
    expect(screen.queryByTestId("header-login-button")).toBeNull();
  });

  it("puts the skip link first in the keyboard order", async () => {
    const user = userEvent.setup();
    authMocks.useSession.mockReturnValue({ status: "unauthenticated", data: null });
    renderHeader();

    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId("header-skip-link"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId("header-logo"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId("header-login-button"));
  });

  it("has no axe violations", async () => {
    authMocks.useSession.mockReturnValue({ status: "unauthenticated", data: null });
    const { container } = renderHeader();
    const results = await axe(container);

    expect(results.violations).toEqual([]);
  });
});
