/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { NextIntlClientProvider } from "next-intl";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";

// Must stay the first project import: it starts the MSW server before the
// generated API client captures `globalThis.fetch` (openapi-fetch@0.17).
import { server } from "@/features/shell/msw-server";

import { categoryMetaSchema } from "@/features/report/schemas";

import MESSAGES from "@/i18n/messages/id.json";

import ReportNewPage from "./page";

const DRAFT_KEY_LOST = "tu.draft.report.lost";

const STORAGE_PUT_OK = http.put(
  "https://storage.example.test/*",
  () => new HttpResponse(null, { status: 200 }),
);

const CATEGORIES = [
  categoryMetaSchema.parse({
    value: "BAG",
    labelKey: "category.BAG",
    isSensitive: false,
    hintPrompts: [],
  }),
  categoryMetaSchema.parse({
    value: "ID_CARD",
    labelKey: "category.ID_CARD",
    isSensitive: true,
    hintPrompts: ["Nama depan di kartu?"],
  }),
];

afterAll(() => server.close());
beforeEach(() => {
  localStorage.clear();
  server.resetHandlers();
  server.use(
    STORAGE_PUT_OK,
    http.get("*/api/v1/meta/categories", () => HttpResponse.json(CATEGORIES)),
  );
});
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  cleanup();
});

function t(path: string, vars?: Record<string, string>): string {
  const key = path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, MESSAGES);
  expect(typeof key).toBe("string");
  let text = key as string;
  for (const [name, value] of Object.entries(vars ?? {})) {
    text = text.replace(`{${name}}`, value);
  }
  return text;
}

async function renderWizard(type?: string) {
  const tree = await ReportNewPage({
    searchParams: Promise.resolve(type === undefined ? {} : { type }),
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <NextIntlClientProvider locale="id" messages={MESSAGES}>
      <QueryClientProvider client={client}>{tree}</QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

function stepHeading() {
  return screen.getByRole("heading", { level: 1 }).textContent;
}

describe("reports/new wizard", () => {
  it("starts on step 1 with the URL type selected and blocks next until a category is chosen", async () => {
    const user = userEvent.setup();
    await renderWizard("found");

    expect(stepHeading()).toBe(t("report.wizard.step.category.title"));
    expect(screen.getByTestId("wizard-step-count").textContent).toBe(
      t("report.wizard.stepOf", { current: "1", total: "7" }),
    );
    expect((screen.getByLabelText(t("report.wizard.type.found")) as HTMLInputElement).checked).toBe(
      true,
    );
    expect((screen.getByLabelText(t("report.wizard.type.lost")) as HTMLInputElement).checked).toBe(
      false,
    );

    const next = screen.getByTestId("wizard-next");
    expect(next.hasAttribute("disabled")).toBe(true);
    expect(screen.getByTestId("wizard-next-hint").textContent).toBe(
      t("report.wizard.needCategory"),
    );

    const bag = await screen.findByRole("radio", { name: t("category.BAG") });
    expect(next.hasAttribute("disabled")).toBe(true);

    await user.click(bag);
    await waitFor(() => expect(next.hasAttribute("disabled")).toBe(false));
    expect(
      (screen.getByRole("radio", { name: t("category.BAG") }) as HTMLInputElement).checked,
    ).toBe(true);
    expect(screen.queryByTestId("sensitive-notice")).toBeNull();
  });

  it("shows the sensitive notice when a sensitive category is selected", async () => {
    const user = userEvent.setup();
    await renderWizard("found");

    const option = await screen.findByRole("radio", { name: t("category.ID_CARD") });
    await user.click(option);

    const notice = screen.getByTestId("sensitive-notice");
    expect(notice.getAttribute("data-category")).toBe("ID_CARD");
    expect(notice.textContent).toContain(t("sensitive.notice.title"));
    expect(notice.textContent).toContain(t("sensitive.notice.dropPoint"));
  });

  it("advances to photos, saves the draft and blocks FOUND next until a photo is ready", async () => {
    const user = userEvent.setup();
    await renderWizard("found");

    const bag = await screen.findByRole("radio", { name: t("category.BAG") });
    await user.click(bag);
    await waitFor(() =>
      expect(screen.getByTestId("wizard-next").hasAttribute("disabled")).toBe(false),
    );
    await user.click(screen.getByTestId("wizard-next"));

    expect(stepHeading()).toBe(t("report.wizard.step.photos.title"));
    expect(screen.getByTestId("wizard-draft-saved")).toBeTruthy();
    const stored = JSON.parse(localStorage.getItem("tu.draft.report.found") ?? "null");
    expect(stored?.version).toBe(1);
    expect(stored?.data).toEqual({ type: "FOUND", category: "BAG", imageIds: [] });

    expect(screen.getByTestId("wizard-next").hasAttribute("disabled")).toBe(true);
    expect(screen.getByTestId("photo-uploader-required").textContent).toBe(
      t("report.wizard.photos.required"),
    );

    const file = new File(["x"], "found.jpg", { type: "image/jpeg" });
    await user.upload(screen.getByTestId("photo-uploader-input"), file);
    await waitFor(
      () => expect(screen.getByTestId("wizard-next").hasAttribute("disabled")).toBe(false),
      { timeout: 5000 },
    );
    expect(screen.getByTestId("photo-uploader-item-0")).toBeTruthy();

    await user.click(screen.getByTestId("wizard-next"));

    expect(stepHeading()).toBe(t("report.wizard.step.details.title"));
    expect(screen.getByTestId("wizard-step-count").textContent).toBe(
      t("report.wizard.stepOf", { current: "3", total: "7" }),
    );
    expect(screen.getByTestId("report-wizard-pending").textContent).toBe(
      t("report.wizard.step.pending"),
    );
    expect(screen.getByTestId("wizard-next").hasAttribute("disabled")).toBe(true);
    expect(screen.getByTestId("wizard-next-hint").textContent).toBe(
      t("report.wizard.step.pending"),
    );

    await user.click(screen.getByTestId("wizard-back"));
    expect(stepHeading()).toBe(t("report.wizard.step.photos.title"));
  });

  it("restores a saved draft with its category and photo", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      DRAFT_KEY_LOST,
      JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        data: {
          type: "LOST",
          category: "BAG",
          imageIds: ["018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82"],
        },
      }),
    );

    await renderWizard("lost");

    expect(screen.getByTestId("wizard-draft-restored")).toBeTruthy();
    expect(screen.getByTestId("wizard-step-count").textContent).toBe(
      t("report.wizard.stepOf", { current: "1", total: "5" }),
    );
    expect((screen.getByLabelText(t("report.wizard.type.lost")) as HTMLInputElement).checked).toBe(
      true,
    );

    const bag = await screen.findByRole("radio", { name: t("category.BAG") });
    await waitFor(() =>
      expect(
        (screen.getByRole("radio", { name: t("category.BAG") }) as HTMLInputElement).checked,
      ).toBe(true),
    );
    expect(bag).toBeTruthy();

    const next = screen.getByTestId("wizard-next");
    await waitFor(() => expect(next.hasAttribute("disabled")).toBe(false));
    await user.click(next);

    expect(stepHeading()).toBe(t("report.wizard.step.photos.title"));
    expect(screen.getByTestId("photo-uploader-item-0").textContent).toContain(
      t("report.wizard.photos.restored"),
    );
  });

  it("ignores a draft with a stale envelope version", async () => {
    localStorage.setItem(
      DRAFT_KEY_LOST,
      JSON.stringify({
        version: 99,
        savedAt: new Date().toISOString(),
        data: { type: "LOST", category: "BAG", imageIds: [] },
      }),
    );

    await renderWizard("lost");

    expect(screen.queryByTestId("wizard-draft-restored")).toBeNull();
    const bag = await screen.findByRole("radio", { name: t("category.BAG") });
    expect((bag as HTMLInputElement).checked).toBe(false);
    expect(screen.queryByTestId("photo-uploader-item-0")).toBeNull();
  });

  it("has no axe violations on step 1", async () => {
    const { container } = await renderWizard("found");
    await screen.findByRole("radio", { name: t("category.BAG") });

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
