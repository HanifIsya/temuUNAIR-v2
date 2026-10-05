import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import middleware from "@/middleware";
import { APP_AUTH_MATCHER } from "./guard";

const url = (path: string) => `http://localhost:3000${path}`;

describe("app auth middleware", () => {
  it("covers every protected route from the FE-01 route map", () => {
    expect(APP_AUTH_MATCHER).toEqual(["/home", "/reports", "/claims", "/notifications", "/me"]);
  });

  it("redirects a signed-out request to /login preserving the path and query", () => {
    const response = middleware(new NextRequest(url("/reports?q=tas")));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Freports%3Fq%3Dtas",
    );
  });

  it("keeps deep links intact in the next parameter", () => {
    const response = middleware(new NextRequest(url("/me/settings")));

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Fme%2Fsettings",
    );
  });

  it("leaves public routes alone", () => {
    const response = middleware(new NextRequest(url("/login")));

    expect(response.headers.get("location")).toBeNull();
  });

  it("passes protected requests that carry a session cookie", () => {
    const response = middleware(
      new NextRequest(url("/home"), {
        headers: { cookie: "__Secure-temuunair.session=abc" },
      }),
    );

    expect(response.headers.get("location")).toBeNull();
  });
});
