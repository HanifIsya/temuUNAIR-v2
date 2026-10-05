/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import MESSAGES from "@/i18n/messages/id.json";
import { LocationStep, type LocationStepProps } from "./location-step";

afterEach(() => {
  cleanup();
});

const CAMPUSES = [
  { id: "KAMPUS_A" as const, name: "Kampus A" },
  { id: "KAMPUS_B" as const, name: "Kampus B" },
];

const LOCATIONS = [
  {
    id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e7f",
    campus: "KAMPUS_B" as const,
    name: "Perpustakaan",
    building: "Gedung A",
  },
];

function renderLocation(props?: Partial<LocationStepProps>) {
  const defaults: LocationStepProps = {
    type: "LOST",
    campus: undefined,
    locationId: undefined,
    note: "",
    occurredFrom: "",
    occurredTo: undefined,
    campuses: CAMPUSES,
    locations: LOCATIONS,
    onChangeCampus: vi.fn(),
    onChangeLocationId: vi.fn(),
    onChangeNote: vi.fn(),
    onChangeOccurredFrom: vi.fn(),
    onChangeOccurredTo: vi.fn(),
    ...props,
  };

  const utils = render(
    <NextIntlClientProvider locale="id" messages={MESSAGES}>
      <LocationStep {...defaults} />
    </NextIntlClientProvider>,
  );

  return { ...utils, props: defaults };
}

describe("LocationStep", () => {
  it("renders campus select, note, and datetime inputs", () => {
    renderLocation({ campus: "KAMPUS_B", note: "Dekat lift" });

    expect((screen.getByTestId("report-campus-select") as HTMLSelectElement).value).toBe(
      "KAMPUS_B",
    );
    expect((screen.getByTestId("report-location-note") as HTMLInputElement).value).toBe(
      "Dekat lift",
    );
    expect(screen.getByTestId("report-location-select")).toBeTruthy();
  });

  it("calls onChangeCampus when campus is selected", async () => {
    const user = userEvent.setup();
    const { props } = renderLocation();

    await user.selectOptions(screen.getByTestId("report-campus-select"), "KAMPUS_B");
    expect(props.onChangeCampus).toHaveBeenCalledWith("KAMPUS_B");
  });

  it("sets occurredFrom when quick chip today is clicked", async () => {
    const user = userEvent.setup();
    const { props } = renderLocation();

    await user.click(screen.getByTestId("quick-chip-today"));
    expect(props.onChangeOccurredFrom).toHaveBeenCalled();
  });

  it("has zero axe violations", async () => {
    const { container } = renderLocation({ campus: "KAMPUS_B" });
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("maintains touch target >= 44px on interactive controls", () => {
    renderLocation({ campus: "KAMPUS_B" });
    expect(screen.getByTestId("report-campus-select").className).toContain("min-h-11");
    expect(screen.getByTestId("quick-chip-today").className).toContain("min-h-11");
    expect(screen.getByTestId("report-occurred-from").className).toContain("min-h-11");
  });
});
