import { describe, expect, it, vi } from "vitest";
import { DomainError } from "../errors";
import { requireSessionUser, type SessionUser } from "./request-user";
import type { MeRepository, UserRow } from "../services/me";
import { SESSION_COOKIE_NAME } from "./session";

// TMU-BE-003 (red evidence): requireSessionUser per BE-09 (enforcement rule 1).

const USER_ID = "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e81";
const NOW = new Date("2026-10-04T10:00:00+07:00");
const DAY_MS = 24 * 60 * 60 * 1000;

function makeRow(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: USER_ID,
    email: "budi@student.unair.ac.id",
    displayName: "Budi S.",
    unairRef: null,
    role: "USER",
    moderatorCampus: null,
    locale: "id",
    status: "ACTIVE",
    createdAt: new Date("2026-09-20T08:00:00+07:00"),
    ...overrides,
  };
}

function makeRepo(session: (UserRow & { sessionExpires: Date }) | null): Pick<
  MeRepository,
  "findSessionUser" | "extendSession"
> & {
  extendSession: ReturnType<typeof vi.fn>;
  findSessionUser: ReturnType<typeof vi.fn>;
} {
  return {
    findSessionUser: vi.fn(async () => session),
    extendSession: vi.fn(async () => {}),
  };
}

function requestWithCookie(token: string | null): Request {
  const headers = new Headers();
  if (token) headers.set("cookie", `${SESSION_COOKIE_NAME}=${token}`);
  return new Request("http://localhost/api/v1/me", { headers });
}

describe("requireSessionUser", () => {
  it("throws AUTH_REQUIRED (401) when the session cookie is absent", async () => {
    const repo = makeRepo({ ...makeRow(), sessionExpires: new Date(NOW.getTime() + 30 * DAY_MS) });
    const err = await requireSessionUser(requestWithCookie(null), repo, NOW).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe("AUTH_REQUIRED");
    expect((err as DomainError).httpStatus).toBe(401);
    expect(repo.findSessionUser).not.toHaveBeenCalled();
  });

  it("throws AUTH_REQUIRED when no live session row matches the token", async () => {
    const repo = makeRepo(null);
    const err = await requireSessionUser(requestWithCookie("missing"), repo, NOW).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe("AUTH_REQUIRED");
  });

  it("throws ACCOUNT_SUSPENDED (403) for a suspended user", async () => {
    const repo = makeRepo({
      ...makeRow({ status: "SUSPENDED" }),
      sessionExpires: new Date(NOW.getTime() + 30 * DAY_MS),
    });
    const err = await requireSessionUser(requestWithCookie("tok"), repo, NOW).catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(DomainError);
    expect((err as DomainError).code).toBe("ACCOUNT_SUSPENDED");
    expect((err as DomainError).httpStatus).toBe(403);
    expect(repo.extendSession).not.toHaveBeenCalled();
  });

  it("returns the BE-09 SessionUser for an active user", async () => {
    const repo = makeRepo({
      ...makeRow({ role: "MODERATOR", moderatorCampus: "KAMPUS_B", locale: "en" }),
      sessionExpires: new Date(NOW.getTime() + 30 * DAY_MS),
    });
    const user: SessionUser = await requireSessionUser(requestWithCookie("tok"), repo, NOW);
    expect(user).toEqual({
      id: USER_ID,
      email: "budi@student.unair.ac.id",
      displayName: "Budi S.",
      role: "MODERATOR",
      moderatorCampus: "KAMPUS_B",
      locale: "en",
      status: "ACTIVE",
    });
    expect(repo.extendSession).not.toHaveBeenCalled();
  });

  it("slides the session expiry when it is within a day of the 30-day window", async () => {
    const repo = makeRepo({
      ...makeRow(),
      sessionExpires: new Date(NOW.getTime() + 10 * DAY_MS),
    });
    await requireSessionUser(requestWithCookie("tok"), repo, NOW);
    expect(repo.extendSession).toHaveBeenCalledTimes(1);
    const [token, newExpiry] = repo.extendSession.mock.calls[0]!;
    expect(token).toBe("tok");
    expect((newExpiry as Date).getTime()).toBe(NOW.getTime() + 30 * DAY_MS);
  });

  it("does not write when the session was already extended recently", async () => {
    const repo = makeRepo({
      ...makeRow(),
      sessionExpires: new Date(NOW.getTime() + 30 * DAY_MS),
    });
    await requireSessionUser(requestWithCookie("tok"), repo, NOW);
    expect(repo.extendSession).not.toHaveBeenCalled();
  });
});
