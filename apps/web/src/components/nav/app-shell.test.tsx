/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navMocks = vi.hoisted(() => ({ pathname: "/home", push: vi.fn(), refresh: vi.fn() }));
const authMocks = vi.hoisted(() => ({ signOut: vi.fn(() => Promise.resolve()) }));
const shellMocks = vi.hoisted(() => ({ onChange: vi.fn() }));

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
vi.mock("next/navigation", () => ({
  usePathname: () => navMocks.pathname,
  useRouter: () => ({ push: navMocks.push, refresh: navMocks.refresh }),
}));
vi.mock("next-auth/react", () => authMocks);
vi.mock("@/features/shell/use-locale-switcher", () => ({
  useLocaleSwitcher: () => ({ locale: "id", onChange: shellMocks.onChange }),
}));

import type { Me } from "@/features/shell/types";
import { AppShell } from "./app-shell";

const PROBE_MESSAGES = {
  app: { name: "PROBE APP" },
  common: {
    skipToContent: "PROBE SKIP",
    nav: {
      mainNavigation: "PROBE MAINNAV",
      topNavigation: "PROBE TOPNAV",
      home: "PROBE HOME",
      browse: "PROBE BROWSE",
      report: "PROBE REPORT",
      claims: "PROBE CLAIMS",
      settings: "PROBE SETTINGS",
      profile: "PROBE PROFILE",
      myReports: "PROBE MYREPORTS",
      accountSettings: "PROBE ACCOUNTSET",
      signOut: "PROBE SIGNOUT",
      admin: "PROBE ADMIN",
      notificationsCount: "PROBE {count, plural, =0 {ZERO} other {N#}}",
    },
    localeSwitcher: { label: "PROBE SWITCH", changed: "PROBE CHANGED {language}" },
  },
};

const USER: Me = {
  id: "u-1",
  email: "budi@example.test",
  displayName: "Budi Santoso",
  role: "USER",
  status: "ACTIVE",
  locale: "id",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function renderAppShell(children: import("react").ReactNode = <p>page-body</p>) {
  return render(
    <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
      <AppShell user={USER} variant="app">
        {children}
      </AppShell>
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  navMocks.pathname = "/home";
});
afterEach(cleanup);

describe("AppShell", () => {
  it("offers the skip link as the first focusable element", async () => {
    const user = userEvent.setup();
    renderAppShell();

    await user.tab();

    const skip = screen.getByTestId("app-shell-skip-link");
    expect(document.activeElement).toBe(skip);
    expect(skip.getAttribute("href")).toBe("#main");
  });

  it("renders children inside the main landmark", () => {
    renderAppShell();

    const main = screen.getByRole("main");
    expect(main.id).toBe("main");
    expect(main.textContent).toContain("page-body");
  });

  it("provides the header, both nav landmarks and a footer", () => {
    renderAppShell();

    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "PROBE MAINNAV" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "PROBE TOPNAV" })).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = renderAppShell();

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
