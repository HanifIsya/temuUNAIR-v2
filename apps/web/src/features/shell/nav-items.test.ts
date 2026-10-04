import { describe, expect, it } from "vitest";

import en from "@/i18n/messages/en.json";
import id from "@/i18n/messages/id.json";
import { AVATAR_MENU_ITEMS, BOTTOM_NAV_ITEMS, TOP_NAV_ITEMS, visibleNavItems } from "./nav-items";

const leaf = (tree: unknown, dotted: string): string | undefined => {
  let node: unknown = tree;
  for (const part of dotted.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" && node.length > 0 ? node : undefined;
};

describe("nav items", () => {
  it("covers the IA mobile row: Beranda, Cari, Lapor, Klaim, Akun", () => {
    expect(BOTTOM_NAV_ITEMS.map((item) => item.id)).toEqual([
      "home",
      "browse",
      "report",
      "claims",
      "settings",
    ]);
    expect(BOTTOM_NAV_ITEMS.map((item) => item.href)).toEqual([
      "/home",
      "/reports",
      "/reports/new",
      "/claims",
      "/me/settings",
    ]);
    expect(BOTTOM_NAV_ITEMS.map((item) => item.testid)).toEqual([
      "bottom-nav-home",
      "bottom-nav-browse",
      "bottom-nav-report",
      "bottom-nav-claims",
      "bottom-nav-settings",
    ]);
  });

  it("covers the IA desktop row: Cari, Lapor, Klaim", () => {
    expect(TOP_NAV_ITEMS.map((item) => item.id)).toEqual(["browse", "report", "claims"]);
    expect(TOP_NAV_ITEMS.map((item) => item.href)).toEqual(["/reports", "/reports/new", "/claims"]);
    expect(TOP_NAV_ITEMS.map((item) => item.testid)).toEqual([
      "top-nav-browse",
      "top-nav-report",
      "top-nav-claims",
    ]);
  });

  it("labels every item with keys present in both locales", () => {
    const items = [...BOTTOM_NAV_ITEMS, ...TOP_NAV_ITEMS, ...AVATAR_MENU_ITEMS];
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(leaf(id, item.labelKey), `id:${item.labelKey}`).toBeTruthy();
      expect(leaf(en, item.labelKey), `en:${item.labelKey}`).toBeTruthy();
    }
  });

  it("links only to internal paths", () => {
    const items = [...BOTTOM_NAV_ITEMS, ...TOP_NAV_ITEMS, ...AVATAR_MENU_ITEMS];
    for (const item of items) {
      if (item.href === undefined) continue;
      expect(item.href.startsWith("/"), item.testid).toBe(true);
      expect(item.href.startsWith("//"), item.testid).toBe(false);
    }
  });

  it("gates the admin entry to moderators and admins", () => {
    const admin = AVATAR_MENU_ITEMS.find((item) => item.id === "admin");
    expect(admin?.roles).toEqual(["MODERATOR", "ADMIN"]);
    expect(admin?.href).toBe("/admin");

    expect(visibleNavItems(AVATAR_MENU_ITEMS, "USER").map((item) => item.id)).not.toContain(
      "admin",
    );
    expect(visibleNavItems(AVATAR_MENU_ITEMS, "MODERATOR").map((item) => item.id)).toContain(
      "admin",
    );
    expect(visibleNavItems(AVATAR_MENU_ITEMS, "ADMIN").map((item) => item.id)).toContain("admin");
  });

  it("keeps testids unique across every nav surface", () => {
    const testids = [...BOTTOM_NAV_ITEMS, ...TOP_NAV_ITEMS, ...AVATAR_MENU_ITEMS].map(
      (item) => item.testid,
    );
    expect(new Set(testids).size).toBe(testids.length);
  });
});
