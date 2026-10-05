/** @jsxRuntime automatic */
// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";

import { SensitiveNotice } from "./sensitive-notice";

const PROBE_MESSAGES = {
  sensitive: {
    notice: {
      title: "PROBE SENSITIVE TITLE",
      body: "PROBE SENSITIVE BODY",
      dropPoint: "PROBE DROP POINT",
    },
  },
};

function renderNotice() {
  return render(
    <NextIntlClientProvider locale="id" messages={PROBE_MESSAGES}>
      <SensitiveNotice category="ID_CARD" />
    </NextIntlClientProvider>,
  );
}

afterEach(cleanup);

describe("SensitiveNotice", () => {
  it("renders the masking and drop point guidance for the category", () => {
    renderNotice();

    const notice = screen.getByTestId("sensitive-notice");
    expect(notice.getAttribute("data-category")).toBe("ID_CARD");
    expect(notice.getAttribute("role")).toBe("note");
    expect(screen.getByText("PROBE SENSITIVE TITLE")).toBeTruthy();
    expect(screen.getByText("PROBE SENSITIVE BODY")).toBeTruthy();
    expect(screen.getByText("PROBE DROP POINT")).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = renderNotice();

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
