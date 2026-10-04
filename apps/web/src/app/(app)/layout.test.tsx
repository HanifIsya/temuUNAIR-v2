/** @jsxRuntime automatic */
// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const layoutMocks = vi.hoisted(() => ({ getAppUser: vi.fn(), redirect: vi.fn() }));

vi.mock("@/features/shell/server-user", () => ({ getAppUser: layoutMocks.getAppUser }));
vi.mock("@/components/nav/app-shell", () => ({
  AppShell: (props: { user: { displayName?: string }; variant: string; children?: ReactNode }) => (
    <div data-testid="app-shell-mock" data-variant={props.variant}>
      <span data-testid="app-shell-user">{props.user.displayName ?? ""}</span>
      {props.children}
    </div>
  ),
}));
vi.mock("next/navigation", () => ({ redirect: layoutMocks.redirect }));

import AppLayout from "./layout";

const USER = {
  id: "u-1",
  email: "budi@example.test",
  displayName: "Budi Santoso",
  role: "USER",
  status: "ACTIVE",
  locale: "id",
  createdAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  layoutMocks.getAppUser.mockReset();
  layoutMocks.redirect.mockReset();
});
afterEach(cleanup);

describe("(app) layout", () => {
  it("renders the app shell with the signed-in user", async () => {
    layoutMocks.getAppUser.mockResolvedValue({ user: USER });

    const tree = await AppLayout({ children: <p>page-body</p> });
    render(tree);

    const shell = screen.getByTestId("app-shell-mock");
    expect(shell.getAttribute("data-variant")).toBe("app");
    expect(screen.getByTestId("app-shell-user").textContent).toBe("Budi Santoso");
    expect(screen.getByText("page-body")).toBeTruthy();
    expect(layoutMocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects when the guard asks for it", async () => {
    layoutMocks.getAppUser.mockResolvedValue({ redirectTo: "/login" });

    await AppLayout({ children: <p>page-body</p> });

    expect(layoutMocks.redirect).toHaveBeenCalledWith("/login");
    expect(screen.queryByTestId("app-shell-mock")).toBeNull();
  });
});
