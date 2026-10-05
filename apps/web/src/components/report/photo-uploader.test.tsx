/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";

import type { PhotoEntry } from "@/hooks/use-upload";

import { PhotoUploader } from "./photo-uploader";

const PROBE_MESSAGES = {
  report: {
    wizard: {
      photos: {
        add: "PROBE ADD",
        required: "PROBE REQUIRED",
        uploading: "PROBE UPLOADING",
        processing: "PROBE PROCESSING",
        rejected: "PROBE REJECTED",
        restored: "PROBE RESTORED",
        remove: "PROBE REMOVE",
        retry: "PROBE RETRY",
      },
    },
  },
  error: {
    UPLOAD_INVALID_TYPE: "PROBE BAD TYPE",
    UPLOAD_TOO_LARGE: "PROBE TOO LARGE",
    UPLOAD_LIMIT_REACHED: "PROBE LIMIT",
  },
  common: {
    offline: "PROBE OFFLINE",
  },
};

function entry(overrides: Partial<PhotoEntry> = {}): PhotoEntry {
  return {
    localId: "p1",
    fileName: "photo.jpg",
    phase: "ready",
    progress: null,
    uploadId: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e82",
    thumbUrl: null,
    errorCode: null,
    idempotencyKey: "idem-1",
    ...overrides,
  };
}

type UploaderProps = Partial<React.ComponentProps<typeof PhotoUploader>>;

function renderUploader(overrides: UploaderProps = {}) {
  const onChange = (overrides.onChange ?? vi.fn()) as Mock;
  const props = {
    ...overrides,
    value: overrides.value ?? [],
    onChange,
  };
  const view = render(
    <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
      <PhotoUploader {...props} />
    </NextIntlClientProvider>,
  );
  return { ...view, props };
}

afterEach(cleanup);

describe("PhotoUploader", () => {
  it("renders an enabled file input when idle", () => {
    renderUploader();

    const input = screen.getByTestId("photo-uploader-input") as HTMLInputElement;
    expect(input.hasAttribute("disabled")).toBe(false);
    expect(input.getAttribute("accept")).toBe("image/jpeg,image/png,image/webp,image/heic");
    expect(screen.getByText("PROBE ADD")).toBeTruthy();
  });

  it("emits the selected files", async () => {
    const user = userEvent.setup();
    const { props } = renderUploader();
    const file = new File(["x"], "picked.jpg", { type: "image/jpeg" });

    await user.upload(screen.getByTestId("photo-uploader-input"), file);

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange.mock.calls[0]?.[0]?.[0]?.name).toBe("picked.jpg");
  });

  it("shows uploading progress states", () => {
    renderUploader({ value: [entry({ localId: "p1", phase: "uploading", progress: 40 })] });

    expect(screen.getByTestId("photo-uploader-item-0").getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText(/PROBE UPLOADING/)).toBeTruthy();
  });

  it("shows the processing state", () => {
    renderUploader({ value: [entry({ localId: "p1", phase: "processing" })] });

    expect(screen.getByText("PROBE PROCESSING")).toBeTruthy();
    expect(screen.getByTestId("photo-uploader-item-0").getAttribute("aria-busy")).toBe("true");
  });

  it("shows a failed entry with its error code and a retry action", () => {
    renderUploader({
      value: [entry({ localId: "p1", phase: "failed", errorCode: "UPLOAD_INVALID_TYPE" })],
      onRetry: vi.fn(),
    });

    const alert = screen.getByTestId("photo-uploader-error-0");
    expect(alert.textContent).toContain("photo.jpg");
    expect(alert.textContent).toContain("PROBE BAD TYPE");
    expect(screen.getByTestId("photo-uploader-retry-0")).toBeTruthy();
  });

  it("translates the offline failure through the common namespace", () => {
    renderUploader({ value: [entry({ localId: "p1", phase: "failed", errorCode: "OFFLINE" })] });

    expect(screen.getByTestId("photo-uploader-error-0").textContent).toContain("PROBE OFFLINE");
  });

  it("shows the rejected state", () => {
    renderUploader({ value: [entry({ localId: "p1", phase: "rejected" })] });

    expect(screen.getByTestId("photo-uploader-error-0").textContent).toContain("PROBE REJECTED");
  });

  it("labels a rehydrated entry", () => {
    renderUploader({ value: [entry({ localId: "p1", phase: "ready", thumbUrl: null })] });

    expect(screen.getByTestId("photo-uploader-item-0").textContent).toContain("PROBE RESTORED");
  });

  it("disables adding at the cap and explains the limit", () => {
    renderUploader({ value: [entry({ localId: "p1" })], max: 1 });

    expect((screen.getByTestId("photo-uploader-input") as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByTestId("photo-uploader-limit").textContent).toContain("PROBE LIMIT");
  });

  it("hints when a required photo is still missing", () => {
    renderUploader({ value: [], required: true });

    expect(screen.getByTestId("photo-uploader-required").textContent).toBe("PROBE REQUIRED");
    cleanup();

    renderUploader({ value: [entry({ localId: "p1" })], required: true });
    expect(screen.queryByTestId("photo-uploader-required")).toBeNull();
  });

  it("emits remove for an entry", async () => {
    const user = userEvent.setup();
    const { props } = renderUploader({
      value: [entry({ localId: "p1" })],
      onRemove: vi.fn(),
    });

    await user.click(screen.getByTestId("photo-uploader-remove-0"));
    expect(props.onRemove).toHaveBeenCalledWith("p1");
  });

  it("emits retry for a failed entry", async () => {
    const user = userEvent.setup();
    const { props } = renderUploader({
      value: [entry({ localId: "p1", phase: "failed", errorCode: "UPLOAD_TOO_LARGE" })],
      onRetry: vi.fn(),
    });

    await user.click(screen.getByTestId("photo-uploader-retry-0"));
    expect(props.onRetry).toHaveBeenCalledWith("p1");
  });

  it("is keyboard operable", async () => {
    const user = userEvent.setup();
    renderUploader();

    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId("photo-uploader-input"));
  });

  it("has no axe violations", async () => {
    const { container } = renderUploader({
      value: [
        entry({ localId: "p1" }),
        entry({ localId: "p2", phase: "uploading", progress: 10 }),
        entry({ localId: "p3", phase: "failed", errorCode: "UPLOAD_INVALID_TYPE" }),
      ],
      required: true,
      onRemove: vi.fn(),
      onRetry: vi.fn(),
    });

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
