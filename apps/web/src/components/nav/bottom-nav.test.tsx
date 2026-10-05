/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

const navMocks = vi.hoisted(() => ({ pathname: "/home" }));

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
vi.mock("next/navigation", () => ({ usePathname: () => navMocks.pathname }));

import { BottomNav } from "./bottom-nav";

const PROBE_MESSAGES = {
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
      signOut: "PROBE SIGNOUT",
      admin: "PROBE ADMIN",
      notificationsCount: "PROBE {count, plural, =0 {ZERO} other {N#}}",
    },
    localeSwitcher: { label: "PROBE SWITCH", changed: "PROBE CHANGED {locale}" },
  },
};

function renderBottomNav() {
  return render(
    <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
      <BottomNav />
    </NextIntlClientProvider>,
  );
}

afterEach(() => {
  navMocks.pathname = "/home";
  cleanup();
});

describe("BottomNav", () => {
  it("renders the five IA items with labels, testids and hrefs", () => {
    renderBottomNav();

    const items: [string, string, string][] = [
      ["bottom-nav-home", "PROBE HOME", "/home"],
      ["bottom-nav-browse", "PROBE BROWSE", "/reports"],
      ["bottom-nav-report", "PROBE REPORT", "/reports/new"],
      ["bottom-nav-claims", "PROBE CLAIMS", "/claims"],
      ["bottom-nav-settings", "PROBE SETTINGS", "/me/settings"],
    ];
    for (const [testid, label, href] of items) {
      const link = screen.getByTestId(testid);
      expect(link.getAttribute("href")).toBe(href);
      expect(link.textContent).toContain(label);
    }
  });

  it("marks the active item with aria-current on an exact path match", () => {
    navMocks.pathname = "/reports";
    renderBottomNav();

    expect(screen.getByTestId("bottom-nav-browse").getAttribute("aria-current")).toBe("page");
    expect(screen.getByTestId("bottom-nav-home").getAttribute("aria-current")).toBeNull();
  });

  it("does not mark a sibling route as active", () => {
    navMocks.pathname = "/reports/new";
    renderBottomNav();

    expect(screen.getByTestId("bottom-nav-report").getAttribute("aria-current")).toBe("page");
    expect(screen.getByTestId("bottom-nav-browse").getAttribute("aria-current")).toBeNull();
  });

  it("labels the landmark for assistive technology", () => {
    renderBottomNav();

    expect(screen.getByRole("navigation", { name: "PROBE MAINNAV" })).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = renderBottomNav();

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
