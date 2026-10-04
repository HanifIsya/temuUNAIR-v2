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
import { TopNav } from "./top-nav";

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

const MODERATOR: Me = {
  ...USER,
  id: "m-1",
  role: "MODERATOR",
  moderatorCampus: "KAMPUS_A",
};

function renderTopNav(user: Me = USER) {
  return render(
    <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
      <TopNav user={user} />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  navMocks.pathname = "/home";
  navMocks.push.mockReset();
  authMocks.signOut.mockClear();
  shellMocks.onChange.mockClear();
});
afterEach(cleanup);

describe("TopNav", () => {
  it("renders the desktop row, logo, switcher, bell and avatar trigger", () => {
    renderTopNav();

    expect(screen.getByTestId("top-nav-logo").getAttribute("href")).toBe("/home");
    for (const [testid, href] of [
      ["top-nav-browse", "/reports"],
      ["top-nav-report", "/reports/new"],
      ["top-nav-claims", "/claims"],
    ] as const) {
      const link = screen.getByTestId(testid);
      expect(link.getAttribute("href")).toBe(href);
    }
    expect(screen.getByTestId("locale-switcher")).toBeTruthy();
    expect(screen.getByTestId("notification-bell")).toBeTruthy();
    expect(screen.getByTestId("avatar-menu-trigger").getAttribute("aria-label")).toBe(
      "Budi Santoso",
    );
    expect(screen.getByRole("navigation", { name: "PROBE TOPNAV" })).toBeTruthy();
  });

  it("keeps the admin entry out of the avatar menu for regular users", async () => {
    const user = userEvent.setup();
    renderTopNav();

    await user.click(screen.getByTestId("avatar-menu-trigger"));

    expect(screen.getByTestId("avatar-menu-profile").getAttribute("href")).toBe("/me/settings");
    expect(screen.getByTestId("avatar-menu-my-reports").getAttribute("href")).toBe("/me/reports");
    expect(screen.getByTestId("avatar-menu-settings").getAttribute("href")).toBe("/me/settings");
    expect(screen.queryByTestId("avatar-menu-admin")).toBeNull();
  });

  it("shows the admin entry for moderators", async () => {
    const user = userEvent.setup();
    renderTopNav(MODERATOR);

    await user.click(screen.getByTestId("avatar-menu-trigger"));

    const admin = screen.getByTestId("avatar-menu-admin");
    expect(admin.getAttribute("href")).toBe("/admin");
    expect(admin.textContent).toContain("PROBE ADMIN");
  });

  it("closes the avatar menu on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderTopNav();

    const trigger = screen.getByTestId("avatar-menu-trigger");
    await user.click(trigger);
    expect(screen.getByTestId("avatar-menu").hasAttribute("hidden")).toBe(false);

    await user.keyboard("{Escape}");

    expect(screen.getByTestId("avatar-menu").hasAttribute("hidden")).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  it("signs out from the avatar menu", async () => {
    const user = userEvent.setup();
    renderTopNav();

    await user.click(screen.getByTestId("avatar-menu-trigger"));
    await user.click(screen.getByTestId("avatar-menu-sign-out"));

    expect(authMocks.signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });

  it("opens the notification list from the bell", async () => {
    const user = userEvent.setup();
    renderTopNav();

    await user.click(screen.getByTestId("notification-bell"));

    expect(navMocks.push).toHaveBeenCalledWith("/notifications");
  });

  it("has no axe violations closed and open", async () => {
    const user = userEvent.setup();
    const { container } = renderTopNav();

    expect((await axe(container)).violations).toEqual([]);

    await user.click(screen.getByTestId("avatar-menu-trigger"));
    expect((await axe(container)).violations).toEqual([]);
  });
});
