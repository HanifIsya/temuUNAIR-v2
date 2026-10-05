/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import MESSAGES from "@/i18n/messages/id.json";
import { DetailsStep, type DetailsStepProps } from "./details-step";

afterEach(() => {
  cleanup();
});

function renderDetails(props?: Partial<DetailsStepProps>) {
  const defaults: DetailsStepProps = {
    title: "",
    description: "",
    colors: [],
    brand: "",
    onChangeTitle: vi.fn(),
    onChangeDescription: vi.fn(),
    onChangeColors: vi.fn(),
    onChangeBrand: vi.fn(),
    ...props,
  };

  const utils = render(
    <NextIntlClientProvider locale="id" messages={MESSAGES}>
      <DetailsStep {...defaults} />
    </NextIntlClientProvider>,
  );

  return { ...utils, props: defaults };
}

describe("DetailsStep", () => {
  it("renders title, description, colors, and brand inputs", () => {
    renderDetails({
      title: "Tas ransel",
      description: "Tas hitam",
      colors: ["BLACK"],
      brand: "Eiger",
    });

    expect((screen.getByTestId("report-title-input") as HTMLInputElement).value).toBe("Tas ransel");
    expect((screen.getByTestId("report-desc-input") as HTMLTextAreaElement).value).toBe(
      "Tas hitam",
    );
    expect((screen.getByTestId("report-brand-input") as HTMLInputElement).value).toBe("Eiger");
    expect(screen.getByTestId("color-chip-black").getAttribute("aria-pressed")).toBe("true");
  });

  it("updates title and description on input", async () => {
    const user = userEvent.setup();
    const { props } = renderDetails();

    await user.type(screen.getByTestId("report-title-input"), "Tas");
    expect(props.onChangeTitle).toHaveBeenCalledWith("T");

    await user.type(screen.getByTestId("report-desc-input"), "Deskripsi");
    expect(props.onChangeDescription).toHaveBeenCalledWith("D");
  });

  it("toggles color selection and enforces maximum 3 colors", async () => {
    const user = userEvent.setup();
    const { props } = renderDetails({ colors: ["BLACK", "BLUE"] });

    // Selecting 3rd color
    await user.click(screen.getByTestId("color-chip-red"));
    expect(props.onChangeColors).toHaveBeenCalledWith(["BLACK", "BLUE", "RED"]);

    // Deselecting existing color
    await user.click(screen.getByTestId("color-chip-black"));
    expect(props.onChangeColors).toHaveBeenCalledWith(["BLUE"]);
  });

  it("disables unselected colors when 3 colors are chosen", () => {
    renderDetails({ colors: ["BLACK", "BLUE", "RED"] });

    expect(screen.getByTestId("color-chip-yellow").hasAttribute("disabled")).toBe(true);
    expect(screen.getByTestId("color-chip-black").hasAttribute("disabled")).toBe(false);
  });

  it("has zero axe violations", async () => {
    const { container } = renderDetails();
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("maintains touch target >= 44px on interactive controls", () => {
    renderDetails();
    expect(screen.getByTestId("report-title-input").className).toContain("min-h-11");
    expect(screen.getByTestId("report-brand-input").className).toContain("min-h-11");
    expect(screen.getByTestId("color-chip-black").className).toContain("min-h-11");
  });
});
