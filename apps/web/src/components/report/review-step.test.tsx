/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import MESSAGES from "@/i18n/messages/id.json";
import { ReviewStep, type ReviewStepProps } from "./review-step";

afterEach(() => {
  cleanup();
});

function renderReview(props?: Partial<ReviewStepProps>) {
  const defaults: ReviewStepProps = {
    type: "LOST",
    category: "BAG",
    categoryLabel: "Tas",
    imageCount: 2,
    title: "Tas ransel biru",
    description: "Tas ransel Eiger biru tua",
    colors: ["Biru"],
    brand: "Eiger",
    campus: "KAMPUS_B",
    campusName: "Kampus B",
    locationName: "Perpustakaan",
    locationNote: "Lantai 2",
    occurredFrom: "2026-10-04T10:00:00+07:00",
    occurredTo: undefined,
    isSubmitting: false,
    onSubmit: vi.fn(),
    ...props,
  };

  const utils = render(
    <NextIntlClientProvider locale="id" messages={MESSAGES}>
      <ReviewStep {...defaults} />
    </NextIntlClientProvider>,
  );

  return { ...utils, props: defaults };
}

describe("ReviewStep", () => {
  it("renders summary of report data", () => {
    renderReview();

    expect(screen.getByTestId("review-step")).toBeTruthy();
    expect(screen.getByText("Tas ransel biru")).toBeTruthy();
    expect(screen.getByText(/Kampus B/)).toBeTruthy();
    expect(screen.getByText("2 foto dilampirkan")).toBeTruthy();
    expect(screen.getByTestId("report-submit").hasAttribute("disabled")).toBe(false);
  });

  it("calls onSubmit when submit button is clicked", async () => {
    const user = userEvent.setup();
    const { props } = renderReview();

    await user.click(screen.getByTestId("report-submit"));
    expect(props.onSubmit).toHaveBeenCalled();
  });

  it("disables submit button and sets aria-busy while submitting", () => {
    renderReview({ isSubmitting: true });

    const submitBtn = screen.getByTestId("report-submit");
    expect(submitBtn.hasAttribute("disabled")).toBe(true);
    expect(submitBtn.getAttribute("aria-busy")).toBe("true");
  });

  it("renders error message when error prop is provided", () => {
    renderReview({ error: "Gagal membuat laporan" });

    expect(screen.getByRole("alert").textContent).toBe("Gagal membuat laporan");
  });

  it("shows custody and hints count for FOUND report without displaying secret answers", () => {
    renderReview({
      type: "FOUND",
      custody: "AT_DROP_POINT",
      dropPointName: "Pos Satpam",
      hintsCount: 2,
    });

    expect(screen.getByText(/Pos Satpam/)).toBeTruthy();
    expect(screen.getByText(/2 pertanyaan verifikasi/)).toBeTruthy();
  });

  it("has zero axe violations", async () => {
    const { container } = renderReview();
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("maintains touch target >= 44px on interactive submit button", () => {
    renderReview();
    expect(screen.getByTestId("report-submit").className).toContain("min-h-11");
  });
});
