/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WizardShell } from "./wizard-shell";

const PROBE_MESSAGES = {
  common: {
    back: "PROBE BACK",
    next: "PROBE NEXT",
  },
  report: {
    wizard: {
      stepOf: "PROBE STEP {current}/{total}",
      draftSaved: "PROBE DRAFT SAVED",
      draftRestored: "PROBE DRAFT RESTORED",
      step: {
        category: { title: "PROBE CATEGORY" },
        photos: { title: "PROBE PHOTOS" },
        details: { title: "PROBE DETAILS" },
        where: { title: "PROBE WHERE" },
        review: { title: "PROBE REVIEW" },
      },
    },
  },
};

const STEPS = [
  { key: "category", titleKey: "report.wizard.step.category.title" },
  { key: "photos", titleKey: "report.wizard.step.photos.title" },
  { key: "details", titleKey: "report.wizard.step.details.title" },
  { key: "where", titleKey: "report.wizard.step.where.title" },
  { key: "review", titleKey: "report.wizard.step.review.title" },
];

type ShellProps = Partial<React.ComponentProps<typeof WizardShell>>;

function renderShell(overrides: ShellProps = {}) {
  const props = {
    steps: STEPS,
    current: 1,
    canProceed: true,
    onNext: vi.fn(),
    onBack: vi.fn(),
    ...overrides,
  };
  const view = render(
    <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
      <WizardShell {...props}>
        <p>PROBE BODY</p>
      </WizardShell>
    </NextIntlClientProvider>,
  );
  return { ...view, props };
}

afterEach(cleanup);

describe("WizardShell", () => {
  it("renders the step titles, indicator and the current heading", () => {
    renderShell({ current: 2 });

    expect(screen.getByTestId("wizard-step-count").textContent).toBe("PROBE STEP 2/5");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("PROBE PHOTOS");
    expect(screen.getByText("PROBE BODY")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("marks only the current step with aria-current", () => {
    renderShell({ current: 2 });

    const items = screen.getAllByRole("listitem");
    expect(items[1]?.getAttribute("aria-current")).toBe("step");
    expect(items[0]?.getAttribute("aria-current")).toBeNull();
    expect(items[2]?.getAttribute("aria-current")).toBeNull();
  });

  it("moves focus to the heading when the step changes", () => {
    const { rerender } = renderShell({ current: 1 });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("PROBE CATEGORY");

    rerender(
      <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
        <WizardShell steps={STEPS} current={2} canProceed onNext={vi.fn()} onBack={vi.fn()}>
          <p>PROBE BODY</p>
        </WizardShell>
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("PROBE PHOTOS");
    expect(document.activeElement).toBe(screen.getByRole("heading", { level: 1 }));
    expect(screen.getByRole("heading", { level: 1 }).getAttribute("tabindex")).toBe("-1");
  });

  it("disables back on the first step and emits onBack afterwards", async () => {
    const user = userEvent.setup();
    const { rerender, props } = renderShell({ current: 1 });

    expect(screen.getByTestId("wizard-back").hasAttribute("disabled")).toBe(true);

    rerender(
      <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
        <WizardShell
          steps={STEPS}
          current={2}
          canProceed
          onNext={props.onNext}
          onBack={props.onBack}
        >
          <p>PROBE BODY</p>
        </WizardShell>
      </NextIntlClientProvider>,
    );
    expect(screen.getByTestId("wizard-back").hasAttribute("disabled")).toBe(false);

    await user.click(screen.getByTestId("wizard-back"));
    expect(props.onBack).toHaveBeenCalledTimes(1);
  });

  it("blocks next with a reason while cannot proceed and emits onNext otherwise", async () => {
    const user = userEvent.setup();
    const { rerender, props } = renderShell({ canProceed: false, nextHint: "PROBE HINT" });

    expect(screen.getByTestId("wizard-next").hasAttribute("disabled")).toBe(true);
    const hint = screen.getByTestId("wizard-next-hint");
    expect(hint.textContent).toBe("PROBE HINT");
    expect(screen.getByTestId("wizard-next").getAttribute("aria-describedby")).toBe(
      hint.getAttribute("id"),
    );
    expect(props.onNext).not.toHaveBeenCalled();

    rerender(
      <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
        <WizardShell
          steps={STEPS}
          current={1}
          canProceed
          onNext={props.onNext}
          onBack={props.onBack}
        >
          <p>PROBE BODY</p>
        </WizardShell>
      </NextIntlClientProvider>,
    );
    expect(screen.getByTestId("wizard-next").hasAttribute("disabled")).toBe(false);

    await user.click(screen.getByTestId("wizard-next"));
    expect(props.onNext).toHaveBeenCalledTimes(1);
  });

  it("shows the draft hints", () => {
    renderShell({ draftState: "saved" });
    expect(screen.getByTestId("wizard-draft-saved").textContent).toBe("PROBE DRAFT SAVED");
    cleanup();

    renderShell({ draftState: "restored" });
    expect(screen.getByTestId("wizard-draft-restored").textContent).toBe("PROBE DRAFT RESTORED");
  });

  it("has no axe violations", async () => {
    const { container } = renderShell({ current: 2, canProceed: false, nextHint: "PROBE HINT" });

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
