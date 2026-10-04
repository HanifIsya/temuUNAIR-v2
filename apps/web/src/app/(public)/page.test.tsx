/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

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

import LandingPage from "./page";

afterEach(cleanup);

function renderLanding() {
  return render(
    <NextIntlClientProvider locale="id" messages={MESSAGES}>
      <LandingPage />
    </NextIntlClientProvider>,
  );
}

describe("landing page", () => {
  it("renders the hero headline and explanation from the landing namespace", () => {
    renderLanding();

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(MESSAGES.landing.hero.title);
    expect(screen.getByText(MESSAGES.landing.hero.subtitle)).toBeTruthy();
  });

  it("sends visitors to sign-in from the single login CTA", () => {
    renderLanding();

    const cta = screen.getByTestId("landing-login-button");
    expect(cta.getAttribute("href")).toBe("/login");
    expect(cta.textContent).toBe(MESSAGES.landing.cta.login);
  });

  it("shows the three value cards", () => {
    renderLanding();

    expect(screen.getByTestId("landing-value-card-1").textContent).toBe(
      MESSAGES.landing.value.report.title,
    );
    expect(screen.getByTestId("landing-value-card-2").textContent).toBe(
      MESSAGES.landing.value.match.title,
    );
    expect(screen.getByTestId("landing-value-card-3").textContent).toBe(
      MESSAGES.landing.value.safe.title,
    );
  });

  it("exposes exactly one main landmark with id main", () => {
    const { container } = renderLanding();

    expect(container.querySelectorAll("main").length).toBe(1);
    expect(container.querySelector("main")?.id).toBe("main");
  });

  it("reaches the sign-in CTA by keyboard as the first stop", async () => {
    const user = userEvent.setup();
    renderLanding();

    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId("landing-login-button"));
  });

  it("has no axe violations", async () => {
    const { container } = renderLanding();
    const results = await axe(container);

    expect(results.violations).toEqual([]);
  });
});
