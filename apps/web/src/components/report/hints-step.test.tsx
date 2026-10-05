/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import MESSAGES from "@/i18n/messages/id.json";
import { HintsStep, type HintsStepProps } from "./hints-step";

afterEach(() => {
  cleanup();
});

function renderHints(props?: Partial<HintsStepProps>) {
  const defaults: HintsStepProps = {
    hints: [{ prompt: "Apa warna gantungan?", answer: "Kuning" }],
    suggestedPrompts: ["Ada stiker apa?", "Nama depan di kartu?"],
    isSensitive: false,
    onChangeHints: vi.fn(),
    ...props,
  };

  const utils = render(
    <NextIntlClientProvider locale="id" messages={MESSAGES}>
      <HintsStep {...defaults} />
    </NextIntlClientProvider>,
  );

  return { ...utils, props: defaults };
}

describe("HintsStep", () => {
  it("renders warning banner and password-safe answer input", () => {
    renderHints();

    expect(screen.getByRole("note").textContent).toContain("Jangan tampilkan jawaban");
    const answerInput = screen.getByTestId("hints-answer-0") as HTMLInputElement;
    expect(answerInput.type).toBe("password");
    expect(answerInput.autocomplete).toBe("off");
  });

  it("shows sensitive warning when isSensitive is true", () => {
    renderHints({ isSensitive: true });

    expect(screen.getByRole("note").textContent).toContain("minimal 2 pertanyaan");
  });

  it("adds a hint when add button is clicked", async () => {
    const user = userEvent.setup();
    const { props } = renderHints({ hints: [{ prompt: "P1", answer: "A1" }] });

    await user.click(screen.getByTestId("hints-add"));
    expect(props.onChangeHints).toHaveBeenCalledWith([
      { prompt: "P1", answer: "A1" },
      { prompt: "", answer: "" },
    ]);
  });

  it("removes a hint when remove button is clicked", async () => {
    const user = userEvent.setup();
    const { props } = renderHints({
      hints: [
        { prompt: "P1", answer: "A1" },
        { prompt: "P2", answer: "A2" },
      ],
    });

    await user.click(screen.getByTestId("hints-remove-1"));
    expect(props.onChangeHints).toHaveBeenCalledWith([{ prompt: "P1", answer: "A1" }]);
  });

  it("fills prompt when suggestion chip is clicked", async () => {
    const user = userEvent.setup();
    const { props } = renderHints({
      hints: [{ prompt: "", answer: "" }],
      suggestedPrompts: ["Ada stiker apa?"],
    });

    await user.click(screen.getByTestId("hint-suggestion-Ada stiker"));
    expect(props.onChangeHints).toHaveBeenCalledWith([{ prompt: "Ada stiker apa?", answer: "" }]);
  });

  it("has zero axe violations", async () => {
    const { container } = renderHints();
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("maintains touch target >= 44px on interactive controls", () => {
    renderHints();
    expect(screen.getByTestId("hints-prompt-0").className).toContain("min-h-11");
    expect(screen.getByTestId("hints-answer-0").className).toContain("min-h-11");
    expect(screen.getByTestId("hints-add").className).toContain("min-h-11");
  });
});
