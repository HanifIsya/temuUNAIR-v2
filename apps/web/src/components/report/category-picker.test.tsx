/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ApiCategories } from "@/features/report/types";

import { CategoryPicker } from "./category-picker";

const PROBE_MESSAGES = {
  report: {
    wizard: {
      category: { legend: "PROBE LEGEND" },
    },
  },
  category: {
    ID_CARD: "PROBE IDCARD",
    BAG: "PROBE BAG",
    KEYS: "PROBE KEYS",
  },
  sensitive: {
    notice: {
      title: "PROBE SENSITIVE TITLE",
      body: "PROBE SENSITIVE BODY",
      dropPoint: "PROBE DROP POINT",
    },
  },
  common: {
    retry: "PROBE RETRY",
    unknownError: "PROBE LOAD ERROR",
  },
};

const OPTIONS: ApiCategories = [
  { value: "ID_CARD", labelKey: "category.ID_CARD", isSensitive: true, hintPrompts: [] },
  { value: "BAG", labelKey: "category.BAG", isSensitive: false, hintPrompts: [] },
  { value: "KEYS", labelKey: "category.KEYS", isSensitive: false, hintPrompts: [] },
];

type PickerProps = Partial<React.ComponentProps<typeof CategoryPicker>>;

function renderPicker(overrides: PickerProps = {}) {
  const props = {
    options: [...OPTIONS],
    onChange: vi.fn(),
    ...overrides,
  };
  const view = render(
    <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
      <CategoryPicker {...props} />
    </NextIntlClientProvider>,
  );
  return { ...view, props };
}

afterEach(cleanup);

describe("CategoryPicker", () => {
  it("renders one labelled option per category", () => {
    renderPicker();

    expect(screen.getByRole("group", { name: "PROBE LEGEND" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "PROBE IDCARD" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "PROBE BAG" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "PROBE KEYS" })).toBeTruthy();
  });

  it("emits the chosen value and reflects the new value when controlled", async () => {
    const user = userEvent.setup();
    const { props, rerender } = renderPicker();

    await user.click(screen.getByRole("button", { name: "PROBE BAG" }));

    expect(props.onChange).toHaveBeenCalledWith("BAG");

    rerender(
      <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
        <CategoryPicker options={[...OPTIONS]} value="BAG" onChange={props.onChange} />
      </NextIntlClientProvider>,
    );
    expect(screen.getByTestId("category-option-BAG").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("category-option-ID_CARD").getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  it("preselects the restored value", () => {
    renderPicker({ value: "KEYS" });

    expect(screen.getByTestId("category-option-KEYS").getAttribute("aria-pressed")).toBe("true");
  });

  it("renders skeletons while loading", () => {
    renderPicker({ loading: true, options: [] });

    expect(screen.getByTestId("category-picker-skeleton")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "PROBE BAG" })).toBeNull();
  });

  it("renders an error with retry when loading failed", async () => {
    const user = userEvent.setup();
    const { props } = renderPicker({ loading: false, error: true, options: [], onRetry: vi.fn() });

    expect(screen.getByTestId("category-picker-error")).toBeTruthy();
    await user.click(screen.getByTestId("category-picker-retry"));
    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the sensitive notice only for a sensitive selection", () => {
    const { rerender } = renderPicker({ value: "ID_CARD" });

    expect(screen.getByTestId("sensitive-notice").getAttribute("data-category")).toBe("ID_CARD");

    rerender(
      <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
        <CategoryPicker options={[...OPTIONS]} value="BAG" onChange={vi.fn()} />
      </NextIntlClientProvider>,
    );
    expect(screen.queryByTestId("sensitive-notice")).toBeNull();
  });

  it("is keyboard operable", async () => {
    const user = userEvent.setup();
    const { props } = renderPicker();

    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId("category-option-ID_CARD"));
    await user.keyboard("{Enter}");
    expect(props.onChange).toHaveBeenCalledWith("ID_CARD");
  });

  it("has no axe violations", async () => {
    const { container } = renderPicker({ value: "ID_CARD" });

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
