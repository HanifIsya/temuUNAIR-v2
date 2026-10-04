import type { UserRole } from "./types";

export interface NavItem {
  id: string;
  labelKey: string;
  testid: string;
  href?: string;
  roles?: readonly UserRole[];
}

export const BOTTOM_NAV_ITEMS: readonly NavItem[] = [
  { id: "home", labelKey: "common.nav.home", testid: "bottom-nav-home", href: "/home" },
  { id: "browse", labelKey: "common.nav.browse", testid: "bottom-nav-browse", href: "/reports" },
  {
    id: "report",
    labelKey: "common.nav.report",
    testid: "bottom-nav-report",
    href: "/reports/new",
  },
  { id: "claims", labelKey: "common.nav.claims", testid: "bottom-nav-claims", href: "/claims" },
  {
    id: "settings",
    labelKey: "common.nav.settings",
    testid: "bottom-nav-settings",
    href: "/me/settings",
  },
];

export const TOP_NAV_ITEMS: readonly NavItem[] = [
  { id: "browse", labelKey: "common.nav.browse", testid: "top-nav-browse", href: "/reports" },
  {
    id: "report",
    labelKey: "common.nav.report",
    testid: "top-nav-report",
    href: "/reports/new",
  },
  { id: "claims", labelKey: "common.nav.claims", testid: "top-nav-claims", href: "/claims" },
];

export const AVATAR_MENU_ITEMS: readonly NavItem[] = [
  {
    id: "profile",
    labelKey: "common.nav.profile",
    testid: "avatar-menu-profile",
    href: "/me/settings",
  },
  {
    id: "my-reports",
    labelKey: "common.nav.myReports",
    testid: "avatar-menu-my-reports",
    href: "/me/reports",
  },
  {
    id: "settings",
    labelKey: "common.nav.accountSettings",
    testid: "avatar-menu-settings",
    href: "/me/settings",
  },
  { id: "sign-out", labelKey: "common.nav.signOut", testid: "avatar-menu-sign-out" },
  {
    id: "admin",
    labelKey: "common.nav.admin",
    testid: "avatar-menu-admin",
    href: "/admin",
    roles: ["MODERATOR", "ADMIN"],
  },
];

export function visibleNavItems(items: readonly NavItem[], role: UserRole): NavItem[] {
  return items.filter((item) => item.roles === undefined || item.roles.includes(role));
}
