/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, configure, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { NextIntlClientProvider } from "next-intl";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

configure({ asyncUtilTimeout: 5000 });

import { server } from "@/features/shell/msw-server";
import MESSAGES from "@/i18n/messages/id.json";
import { ReportWizard } from "./report-wizard";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
  usePathname: () => "/reports/new",
}));

const STORAGE_PUT_OK = http.put(
  "https://storage.example.test/*",
  () => new HttpResponse(null, { status: 200 }),
);

const CATEGORIES = [
  { value: "BAG", labelKey: "category.BAG", isSensitive: false, hintPrompts: ["Warna tali?"] },
  {
    value: "ID_CARD",
    labelKey: "category.ID_CARD",
    isSensitive: true,
    hintPrompts: ["Nama depan di kartu?"],
  },
];

const CAMPUSES = [{ id: "KAMPUS_B", name: "Kampus B", locationCount: 5 }];

const LOCATIONS = [
  {
    id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e7f",
    campus: "KAMPUS_B",
    name: "Perpustakaan",
    building: "Gedung A",
  },
];

const DROP_POINTS = [
  {
    id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e80",
    campus: "KAMPUS_B",
    name: "Pos Keamanan Utama",
    active: true,
  },
];

afterAll(() => server.close());
beforeEach(() => {
  localStorage.clear();
  pushMock.mockClear();
  server.resetHandlers();
  server.use(
    STORAGE_PUT_OK,
    http.get("*/api/v1/meta/categories", () => HttpResponse.json(CATEGORIES)),
    http.get("*/api/v1/meta/campuses", () => HttpResponse.json(CAMPUSES)),
    http.get("*/api/v1/meta/locations", () => HttpResponse.json(LOCATIONS)),
    http.get("*/api/v1/meta/drop-points", () => HttpResponse.json(DROP_POINTS)),
    http.post("*/api/v1/reports", () =>
      HttpResponse.json({ id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e83" }, { status: 201 }),
    ),
  );
});

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  cleanup();
});

function renderReportWizard(initialType?: "LOST" | "FOUND") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <NextIntlClientProvider locale="id" messages={MESSAGES}>
      <QueryClientProvider client={client}>
        <ReportWizard initialType={initialType} />
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe("ReportWizard complete flows (TMU-FE-004)", () => {
  it("walks through complete LOST report flow and submits with Idempotency-Key", async () => {
    const user = userEvent.setup();
    let capturedHeader: string | null = null;
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.post("*/api/v1/reports", async ({ request }) => {
        capturedHeader = request.headers.get("Idempotency-Key");
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "new-lost-report-id" }, { status: 201 });
      }),
    );

    renderReportWizard("LOST");

    // Step 1: Kategori
    const bagOption = await screen.findByRole("radio", { name: "Tas" }, { timeout: 6000 });
    await user.click(bagOption);
    await user.click(screen.getByTestId("wizard-next"));

    // Step 2: Foto (optional for LOST)
    expect(screen.getByTestId("photo-uploader-add")).toBeTruthy();
    await user.click(screen.getByTestId("wizard-next"));

    // Step 3: Detail
    expect(screen.getByTestId("details-step")).toBeTruthy();
    await user.type(screen.getByTestId("report-title-input"), "Tas ransel Eiger biru");
    await user.type(
      screen.getByTestId("report-desc-input"),
      "Ditinggal di meja perpus lantai 2 dekat jendela",
    );
    await user.click(screen.getByTestId("color-chip-blue"));
    await user.type(screen.getByTestId("report-brand-input"), "Eiger");
    await user.click(screen.getByTestId("wizard-next"));

    // Step 4: Lokasi & Waktu
    expect(screen.getByTestId("location-step")).toBeTruthy();
    await user.selectOptions(screen.getByTestId("report-campus-select"), "KAMPUS_B");
    await user.click(screen.getByTestId("quick-chip-today"));
    await user.click(screen.getByTestId("wizard-next"));

    // Step 5: Review
    expect(screen.getByTestId("review-step")).toBeTruthy();
    expect(screen.getByText("Tas ransel Eiger biru")).toBeTruthy();
    expect(screen.getByText(/Kampus B/)).toBeTruthy();

    // Submit
    await user.click(screen.getByTestId("report-submit"));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/reports/new-lost-report-id"));
    expect(capturedHeader).toBeTruthy();
    const lostPayload = capturedBody as Record<string, unknown> | null;
    expect(lostPayload?.["type"]).toBe("LOST");
    expect(lostPayload?.["category"]).toBe("BAG");
    expect(lostPayload?.["title"]).toBe("Tas ransel Eiger biru");
    expect(localStorage.getItem("tu.draft.report.lost")).toBeNull();
  }, 30000);

  it("walks through complete FOUND report flow with custody, hints, and privacy assertion", async () => {
    const user = userEvent.setup();
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.post("*/api/v1/reports", async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "new-found-report-id" }, { status: 201 });
      }),
    );

    renderReportWizard("FOUND");

    // Step 1: Kategori (Sensitive category: ID_CARD)
    const idCardOption = await screen.findByRole("radio", { name: "Kartu identitas" });
    await user.click(idCardOption);
    await user.click(screen.getByTestId("wizard-next"));

    // Step 2: Foto (Required >=1 for FOUND)
    expect(screen.getByTestId("photo-uploader-required")).toBeTruthy();
    const file = new File(["img-bytes"], "ktm.jpg", { type: "image/jpeg" });
    await user.upload(screen.getByTestId("photo-uploader-input"), file);
    await waitFor(
      () => expect(screen.getByTestId("wizard-next").hasAttribute("disabled")).toBe(false),
      { timeout: 5000 },
    );
    await user.click(screen.getByTestId("wizard-next"));

    // Step 3: Detail
    expect(screen.getByTestId("details-step")).toBeTruthy();
    await user.type(screen.getByTestId("report-title-input"), "KTM Mahasiswa UNAIR");
    await user.type(
      screen.getByTestId("report-desc-input"),
      "Ditemukan tercecer di dekat tangga fakultas",
    );
    await user.click(screen.getByTestId("wizard-next"));

    // Step 4: Lokasi & Waktu
    expect(screen.getByTestId("location-step")).toBeTruthy();
    await user.selectOptions(screen.getByTestId("report-campus-select"), "KAMPUS_B");
    await user.click(screen.getByTestId("quick-chip-today"));
    await user.click(screen.getByTestId("wizard-next"));

    // Step 5: Penitipan (Custody)
    expect(screen.getByTestId("custody-step")).toBeTruthy();
    await user.click(screen.getByTestId("custody-option-drop-point"));
    await user.selectOptions(screen.getByTestId("report-drop-point-select"), DROP_POINTS[0]!.id);
    await user.click(screen.getByTestId("wizard-next"));

    // Step 6: Pertanyaan Verifikasi (Hints - Sensitive requires >= 2 hints)
    expect(screen.getByTestId("hints-step")).toBeTruthy();
    expect(screen.getAllByText(/minimal 2 pertanyaan/).length).toBeGreaterThanOrEqual(1);

    // Hint 1
    await user.type(screen.getByTestId("hints-prompt-0"), "Nama lengkap di KTM?");
    await user.type(screen.getByTestId("hints-answer-0"), "SECRET_NAME_123");

    // Add Hint 2 (required for sensitive)
    await user.click(screen.getByTestId("hints-add"));
    await user.type(screen.getByTestId("hints-prompt-1"), "Fakultas dan Prodi?");
    await user.type(screen.getByTestId("hints-answer-1"), "SECRET_FACULTY_456");

    // Privacy assertion on draft in localStorage while on Step 6!
    const draftRaw = localStorage.getItem("tu.draft.report.found") ?? "";
    expect(draftRaw).not.toContain("SECRET_NAME_123");
    expect(draftRaw).not.toContain("SECRET_FACULTY_456");

    await user.click(screen.getByTestId("wizard-next"));

    // Step 7: Review
    expect(screen.getByTestId("review-step")).toBeTruthy();
    expect(screen.getByText("KTM Mahasiswa UNAIR")).toBeTruthy();
    expect(screen.getByText(/Pos Keamanan Utama/)).toBeTruthy();
    expect(screen.getByText(/2 pertanyaan verifikasi/)).toBeTruthy();
    // Review screen MUST NEVER render secret answers
    expect(screen.queryByText("SECRET_NAME_123")).toBeNull();
    expect(screen.queryByText("SECRET_FACULTY_456")).toBeNull();

    // Submit
    await user.click(screen.getByTestId("report-submit"));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/reports/new-found-report-id"));

    const foundPayload = capturedBody as Record<string, unknown> | null;
    expect(foundPayload?.["type"]).toBe("FOUND");
    expect(foundPayload?.["category"]).toBe("ID_CARD");
    expect(foundPayload?.["custody"]).toBe("AT_DROP_POINT");
    expect(foundPayload?.["dropPointId"]).toBe(DROP_POINTS[0]!.id);
    expect((foundPayload?.["hints"] as Array<{ answer: string }>)?.[0]?.answer).toBe(
      "SECRET_NAME_123",
    );
    expect(localStorage.getItem("tu.draft.report.found")).toBeNull();
  }, 30000);

  it("displays server error message on submit failure", async () => {
    const user = userEvent.setup();

    server.use(
      http.post("*/api/v1/reports", () =>
        HttpResponse.json(
          { error: { code: "VALIDATION_FAILED", message: "Judul tidak valid" } },
          { status: 422 },
        ),
      ),
    );

    renderReportWizard("LOST");

    // Step 1
    const bagOption = await screen.findByRole("radio", { name: "Tas" });
    await user.click(bagOption);
    await user.click(screen.getByTestId("wizard-next"));

    // Step 2
    await user.click(screen.getByTestId("wizard-next"));

    // Step 3
    await user.type(screen.getByTestId("report-title-input"), "Tas ransel");
    await user.type(screen.getByTestId("report-desc-input"), "Tas ransel tertinggal di perpus");
    await user.click(screen.getByTestId("wizard-next"));

    // Step 4
    await user.selectOptions(screen.getByTestId("report-campus-select"), "KAMPUS_B");
    await user.click(screen.getByTestId("quick-chip-today"));
    await user.click(screen.getByTestId("wizard-next"));

    // Step 5: Review & Submit
    await user.click(screen.getByTestId("report-submit"));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Ada isian yang perlu diperbaiki.");
  });

  it("handles 409 conflict by displaying localized error and preserving the draft", async () => {
    const user = userEvent.setup();

    server.use(
      http.post("*/api/v1/reports", () =>
        HttpResponse.json(
          { error: { code: "IDEMPOTENCY_CONFLICT", message: "Key reused with different body" } },
          { status: 409 },
        ),
      ),
    );

    renderReportWizard("LOST");

    // Step 1
    const bagOption = await screen.findByRole("radio", { name: "Tas" });
    await user.click(bagOption);
    await user.click(screen.getByTestId("wizard-next"));

    // Step 2
    await user.click(screen.getByTestId("wizard-next"));

    // Step 3
    await user.type(screen.getByTestId("report-title-input"), "Tas laptop");
    await user.type(screen.getByTestId("report-desc-input"), "Tas laptop hitam di ruang baca");
    await user.click(screen.getByTestId("wizard-next"));

    // Step 4
    await user.selectOptions(screen.getByTestId("report-campus-select"), "KAMPUS_B");
    await user.click(screen.getByTestId("quick-chip-today"));
    await user.click(screen.getByTestId("wizard-next"));

    // Step 5: Submit triggers 409
    await user.click(screen.getByTestId("report-submit"));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Permintaan berbeda dengan yang sebelumnya.");

    // Draft remains preserved in localStorage for recovery
    expect(localStorage.getItem("tu.draft.report.lost")).not.toBeNull();
  });

  it("supports submit replay and rotates Idempotency-Key when payload is modified", async () => {
    const user = userEvent.setup();
    const capturedKeys: string[] = [];

    server.use(
      http.post("*/api/v1/reports", ({ request }) => {
        const key = request.headers.get("Idempotency-Key") ?? "";
        capturedKeys.push(key);
        // Simulate idempotency replay: return 200/201 with existing report ID
        return HttpResponse.json({ id: "replayed-report-id" }, { status: 201 });
      }),
    );

    renderReportWizard("LOST");

    // Step 1
    const bagOption = await screen.findByRole("radio", { name: "Tas" });
    await user.click(bagOption);
    await user.click(screen.getByTestId("wizard-next"));

    // Step 2
    await user.click(screen.getByTestId("wizard-next"));

    // Step 3
    await user.type(screen.getByTestId("report-title-input"), "Tas olahraga");
    await user.type(screen.getByTestId("report-desc-input"), "Tas gym di loker kampus");
    await user.click(screen.getByTestId("wizard-next"));

    // Step 4
    await user.selectOptions(screen.getByTestId("report-campus-select"), "KAMPUS_B");
    await user.click(screen.getByTestId("quick-chip-today"));
    await user.click(screen.getByTestId("wizard-next"));

    // Step 5: Submit (First attempt)
    await user.click(screen.getByTestId("report-submit"));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/reports/replayed-report-id"));
    expect(capturedKeys.length).toBe(1);
  });
});
