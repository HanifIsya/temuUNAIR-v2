/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({ signIn: vi.fn() }));

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

import { LoginForm } from "./login-form";

const PROBE_MESSAGES = {
  app: { name: "PROBE BRAND" },
  auth: {
    login: {
      title: "PROBE TITLE",
      google: "PROBE GOOGLE",
      note: { domain: "PROBE NOTE" },
      network: "PROBE NETWORK",
      terms: "PROBE TERMS",
      privacy: "PROBE PRIVACY",
    },
  },
};

function renderForm(options: { next?: string | null; realCopy?: boolean } = {}) {
  const { next, realCopy = false } = options;
  return render(
    <NextIntlClientProvider locale="id" messages={realCopy ? MESSAGES : PROBE_MESSAGES}>
      <LoginForm next={next} />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  authMocks.signIn.mockReset();
});
afterEach(cleanup);

describe("LoginForm", () => {
  it("renders the sign-in card from i18n keys and focuses the heading", () => {
    renderForm();

    expect(screen.getByTestId("login-card")).toBeTruthy();
    expect(screen.getByTestId("login-title").textContent).toBe("PROBE TITLE");
    expect(document.activeElement).toBe(screen.getByTestId("login-title"));
    expect(screen.getByTestId("login-google-button").textContent).toBe("PROBE GOOGLE");
    expect(screen.getByText("PROBE NOTE")).toBeTruthy();
    expect(screen.getByTestId("login-privacy-link").getAttribute("href")).toBe("/privacy");
  });

  it("matches the SCR-002 Indonesian copy", () => {
    renderForm({ realCopy: true });

    expect(screen.getByTestId("login-title").textContent).toBe("Masuk");
    expect(screen.getByTestId("login-google-button").textContent).toBe("Lanjutkan dengan Google");
    expect(screen.getByText("Gunakan akun UNAIR kamu")).toBeTruthy();
  });

  it("starts the Google flow with the validated callbackUrl", async () => {
    const user = userEvent.setup();
    authMocks.signIn.mockResolvedValue(undefined);
    renderForm({ next: "/reports" });

    await user.click(screen.getByTestId("login-google-button"));

    expect(authMocks.signIn).toHaveBeenCalledWith("google", { callbackUrl: "/reports" });
  });

  it("falls back to / when the next parameter is not internal", async () => {
    const user = userEvent.setup();
    authMocks.signIn.mockResolvedValue(undefined);
    renderForm({ next: "//evil.example" });

    await user.click(screen.getByTestId("login-google-button"));

    expect(authMocks.signIn).toHaveBeenCalledWith("google", { callbackUrl: "/" });
  });

  it("defaults the callbackUrl to /", async () => {
    const user = userEvent.setup();
    authMocks.signIn.mockResolvedValue(undefined);
    renderForm();

    await user.click(screen.getByTestId("login-google-button"));

    expect(authMocks.signIn).toHaveBeenCalledWith("google", { callbackUrl: "/" });
  });

  it("keeps the button busy with a spinner while redirecting", async () => {
    const user = userEvent.setup();
    authMocks.signIn.mockReturnValue(new Promise(() => {}));
    renderForm();

    const button = screen.getByTestId("login-google-button") as HTMLButtonElement;
    await user.click(button);

    await waitFor(() => {
      expect(button.getAttribute("aria-busy")).toBe("true");
      expect(button.disabled).toBe(true);
      expect(screen.getByTestId("login-google-spinner")).toBeTruthy();
    });
  });

  it("shows an inline network message linked to the button when sign-in fails", async () => {
    const user = userEvent.setup();
    authMocks.signIn.mockRejectedValue(new Error("network down"));
    renderForm();

    const button = screen.getByTestId("login-google-button") as HTMLButtonElement;
    await user.click(button);

    await waitFor(() => {
      const message = screen.getByRole("alert");
      expect(message.textContent).toBe("PROBE NETWORK");
      expect(button.getAttribute("aria-describedby")).toBe(message.getAttribute("id"));
      expect(button.getAttribute("aria-busy")).toBe("false");
      expect(button.disabled).toBe(false);
    });
  });

  it("submits with Enter from the keyboard", async () => {
    const user = userEvent.setup();
    authMocks.signIn.mockResolvedValue(undefined);
    renderForm();

    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId("login-google-button"));
    await user.keyboard("{Enter}");

    expect(authMocks.signIn).toHaveBeenCalledWith("google", { callbackUrl: "/" });
  });

  it("has no axe violations", async () => {
    const { container } = renderForm();
    const results = await axe(container);

    expect(results.violations).toEqual([]);
  });
});
