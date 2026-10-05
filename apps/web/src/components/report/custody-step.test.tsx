/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import MESSAGES from "@/i18n/messages/id.json";
import { CustodyStep, type CustodyStepProps } from "./custody-step";

afterEach(() => {
  cleanup();
});

const DROP_POINTS = [
  {
    id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e80",
    campus: "KAMPUS_B" as const,
    name: "Pos Satpam Utama",
    active: true,
    hours: "08:00 - 16:00",
  },
];

function renderCustody(props?: Partial<CustodyStepProps>) {
  const defaults: CustodyStepProps = {
    custody: undefined,
    dropPointId: undefined,
    dropPoints: DROP_POINTS,
    onChangeCustody: vi.fn(),
    onChangeDropPointId: vi.fn(),
    ...props,
  };

  const utils = render(
    <NextIntlClientProvider locale="id" messages={MESSAGES}>
      <CustodyStep {...defaults} />
    </NextIntlClientProvider>,
  );

  return { ...utils, props: defaults };
}

describe("CustodyStep", () => {
  it("renders custody radio options", () => {
    renderCustody({ custody: "HELD_BY_FINDER" });

    expect(screen.getByTestId("custody-option-finder")).toBeTruthy();
    expect(screen.getByTestId("custody-option-drop-point")).toBeTruthy();
    expect(screen.queryByTestId("report-drop-point-select")).toBeNull();
  });

  it("shows drop point select when AT_DROP_POINT is selected", async () => {
    const user = userEvent.setup();
    const { props } = renderCustody({ custody: "AT_DROP_POINT" });

    expect(screen.getByTestId("report-drop-point-select")).toBeTruthy();

    await user.selectOptions(screen.getByTestId("report-drop-point-select"), DROP_POINTS[0]!.id);
    expect(props.onChangeDropPointId).toHaveBeenCalledWith(DROP_POINTS[0]!.id);
  });

  it("has zero axe violations", async () => {
    const { container } = renderCustody({
      custody: "AT_DROP_POINT",
      dropPointId: DROP_POINTS[0]!.id,
    });
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("maintains touch target >= 44px on interactive controls", () => {
    renderCustody();
    expect(screen.getByTestId("custody-option-finder").className).toContain("min-h-11");
    expect(screen.getByTestId("custody-option-drop-point").className).toContain("min-h-11");
  });
});
