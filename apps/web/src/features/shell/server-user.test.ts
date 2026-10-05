import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  requireSessionUser: vi.fn(),
  getMe: vi.fn(),
  getDb: vi.fn(() => ({})),
  PgMeRepository: vi.fn(function PgMeRepository() {
    return {};
  }),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/server/auth/request-user", () => ({ requireSessionUser: mocks.requireSessionUser }));
vi.mock("@/server/services/me", () => ({ getMe: mocks.getMe }));
vi.mock("@/server/db", () => ({ getDb: mocks.getDb }));
vi.mock("@/server/repositories/me", () => ({ PgMeRepository: mocks.PgMeRepository }));

import { DomainError, ErrorCode } from "@/server/errors";
import { getAppUser } from "./server-user";

const SERVICE_ME = {
  id: "u-1",
  email: "budi@example.test",
  displayName: "Budi Santoso",
  role: "USER",
  status: "ACTIVE",
  locale: "id",
  moderatorCampus: "KAMPUS_A",
  createdAt: "2026-01-01T00:00:00.000Z",
} as const;

beforeEach(() => {
  mocks.cookies.mockReset();
  mocks.requireSessionUser.mockReset();
  mocks.getMe.mockReset();
  mocks.cookies.mockResolvedValue({
    getAll: () => [
      { name: "__Secure-temuunair.session", value: "tok-123" },
      { name: "other", value: "1" },
    ],
  });
});

describe("getAppUser", () => {
  it("returns the signed-in user's profile from API-ME-01 data", async () => {
    mocks.requireSessionUser.mockResolvedValue({ id: "u-1", role: "USER" });
    mocks.getMe.mockResolvedValue(SERVICE_ME);

    const result = await getAppUser();

    expect(result).toEqual({ user: SERVICE_ME });
    const request = mocks.requireSessionUser.mock.calls[0]?.[0] as Request;
    expect(request.headers.get("cookie")).toContain("__Secure-temuunair.session=tok-123");
    expect(mocks.getMe).toHaveBeenCalledWith(expect.anything(), "u-1");
  });

  it("maps a missing session to the login page", async () => {
    mocks.requireSessionUser.mockRejectedValue(
      new DomainError(ErrorCode.AUTH_REQUIRED, "No active session"),
    );

    await expect(getAppUser()).resolves.toEqual({ redirectTo: "/login" });
  });

  it("maps a suspended account to the auth error page", async () => {
    mocks.requireSessionUser.mockRejectedValue(
      new DomainError(ErrorCode.ACCOUNT_SUSPENDED, "Account is not active"),
    );

    await expect(getAppUser()).resolves.toEqual({
      redirectTo: "/auth/error?error=ACCOUNT_SUSPENDED",
    });
  });

  it("drops a moderatorCampus value outside the contract enum", async () => {
    mocks.requireSessionUser.mockResolvedValue({ id: "u-1", role: "MODERATOR" });
    mocks.getMe.mockResolvedValue({ ...SERVICE_ME, moderatorCampus: "NOWHERE_EVER" });

    const result = await getAppUser();

    expect("user" in result).toBe(true);
    if ("user" in result) expect(result.user.moderatorCampus).toBeUndefined();
  });

  it("lets non-session failures propagate", async () => {
    mocks.requireSessionUser.mockResolvedValue({ id: "u-1", role: "USER" });
    mocks.getMe.mockRejectedValue(new Error("connection lost"));

    await expect(getAppUser()).rejects.toThrow("connection lost");
  });
});
