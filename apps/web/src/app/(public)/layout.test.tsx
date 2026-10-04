/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

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

import MESSAGES from "@/i18n/messages/id.json";

import PublicLayout from "./layout";

afterEach(cleanup);

function renderPublicLayout() {
  authMocks.useSession.mockReturnValue({ status: "unauthenticated", data: null });
  return render(
    <NextIntlClientProvider locale="id" messages={MESSAGES}>
      <PublicLayout>
        <main id="main">
          <p>page content</p>
        </main>
      </PublicLayout>
    </NextIntlClientProvider>,
  );
}

describe("(public) layout", () => {
  it("renders the public header above the page content", () => {
    renderPublicLayout();

    expect(screen.getByTestId("public-header")).toBeTruthy();
    expect(screen.getByTestId("header-login-button").getAttribute("href")).toBe("/login");
    expect(screen.getByText("page content")).toBeTruthy();
  });

  it("exposes exactly one skip link targeting the main landmark", () => {
    renderPublicLayout();

    const skipLinks = screen.getAllByTestId("header-skip-link");
    expect(skipLinks.length).toBe(1);
    expect(skipLinks[0]?.getAttribute("href")).toBe("#main");
  });

  it("has no axe violations", async () => {
    const { container } = renderPublicLayout();
    const results = await axe(container);

    expect(results.violations).toEqual([]);
  });
});
