/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import MESSAGES from "@/i18n/messages/id.json";
import { MatchCard } from "./match-card";

afterEach(() => {
  cleanup();
});

const SAMPLE_MATCH = {
  id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e85",
  state: "SUGGESTED" as const,
  band: "STRONG" as const,
  reasons: [
    { code: "IMAGE_SIMILAR", labelKey: "match.reason.IMAGE_SIMILAR" },
    { code: "SAME_BUILDING", labelKey: "match.reason.SAME_BUILDING" },
  ],
  other: {
    id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e84",
    type: "FOUND" as const,
    status: "OPEN" as const,
    category: "WALLET" as const,
    isSensitive: false,
    title: "Dompet cokelat Bonia",
    description: "Dompet kulit cokelat lipat dua.",
    colors: ["BROWN"],
    brand: "Bonia",
    images: [],
    campus: "KAMPUS_A" as const,
    locationName: "Lobi FK",
    occurredAt: { from: "2026-09-29T10:00:00+07:00" },
    custody: "HELD_BY_FINDER" as const,
    createdAt: "2026-09-29T10:30:00+07:00",
  },
  createdAt: "2026-09-29T11:00:00+07:00",
};

function renderMatchCard(
  match = SAMPLE_MATCH,
  onDismiss?: (id: string) => void,
  onClaim?: (id: string) => void,
) {
  return render(
    <NextIntlClientProvider locale="id" messages={MESSAGES}>
      <MatchCard match={match} onDismiss={onDismiss} onClaim={onClaim} />
    </NextIntlClientProvider>,
  );
}

describe("MatchCard (CMP-017, CMP-018)", () => {
  it("renders match other title, strong band badge, and reasons without raw score", () => {
    renderMatchCard();
    expect(screen.getByTestId(`match-card-${SAMPLE_MATCH.id}`)).toBeTruthy();
    expect(screen.getByText("Dompet cokelat Bonia")).toBeTruthy();
    expect(screen.getByTestId("match-band-badge")).toBeTruthy();
    expect(screen.getByTestId("match-band-badge").textContent).toContain("Kuat");
  });

  it("handles dismiss and claim actions with accessible button labels", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const onClaim = vi.fn();

    renderMatchCard(SAMPLE_MATCH, onDismiss, onClaim);

    const dismissBtn = screen.getByTestId(`match-dismiss-${SAMPLE_MATCH.id}`);
    expect(dismissBtn.getAttribute("aria-label")).toContain("Dompet cokelat Bonia");
    await user.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledWith(SAMPLE_MATCH.id);

    const claimBtn = screen.getByTestId(`match-claim-${SAMPLE_MATCH.id}`);
    await user.click(claimBtn);
    expect(onClaim).toHaveBeenCalledWith(SAMPLE_MATCH.id);
  });

  it("has zero axe violations", async () => {
    const { container } = renderMatchCard(SAMPLE_MATCH, vi.fn(), vi.fn());
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
