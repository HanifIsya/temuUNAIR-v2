import { describe, it, expect } from "vitest";
import { QUEUES, parseJobPayload } from "./registry.js";

describe("BE-07 Queue Registry", () => {
  const EXPECTED_QUEUES = [
    "report.process",
    "report.match",
    "notify.send",
    "report.expire-sweep",
    "claim.expire-sweep",
    "media.cleanup",
    "account.delete",
    "matching.reindex",
  ].sort();

  it("matches the BE-07 queue list exactly (no extras, no omissions)", () => {
    const registeredQueues = Object.keys(QUEUES).sort();
    expect(registeredQueues).toEqual(EXPECTED_QUEUES);
  });

  describe("Payload validation", () => {
    const validUuid = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

    it("validates report.process payload", () => {
      const valid = { reportId: validUuid };
      expect(parseJobPayload("report.process", valid)).toEqual(valid);

      expect(() => parseJobPayload("report.process", { reportId: "invalid" })).toThrow();
      expect(() => parseJobPayload("report.process", {})).toThrow();
    });

    it("validates report.match payload", () => {
      const valid = { reportId: validUuid, reason: "process" };
      expect(parseJobPayload("report.match", valid)).toEqual(valid);

      expect(() =>
        parseJobPayload("report.match", { reportId: validUuid, reason: "invalid" }),
      ).toThrow();
      expect(() => parseJobPayload("report.match", { reportId: validUuid })).toThrow();
    });

    it("validates notify.send payload", () => {
      const valid = { notificationId: validUuid };
      expect(parseJobPayload("notify.send", valid)).toEqual(valid);

      expect(() => parseJobPayload("notify.send", { notificationId: "not-uuid" })).toThrow();
      expect(() => parseJobPayload("notify.send", {})).toThrow();
    });

    it("validates sweep and cleanup empty payloads", () => {
      expect(parseJobPayload("report.expire-sweep", {})).toEqual({});
      expect(parseJobPayload("report.expire-sweep", null)).toEqual({});
      expect(parseJobPayload("report.expire-sweep", undefined)).toEqual({});
      expect(parseJobPayload("claim.expire-sweep", {})).toEqual({});
      expect(parseJobPayload("claim.expire-sweep", null)).toEqual({});
      expect(parseJobPayload("media.cleanup", {})).toEqual({});
      expect(parseJobPayload("media.cleanup", null)).toEqual({});
    });

    it("validates account.delete payload", () => {
      const valid = { userId: validUuid };
      expect(parseJobPayload("account.delete", valid)).toEqual(valid);

      expect(() => parseJobPayload("account.delete", { userId: "invalid" })).toThrow();
      expect(() => parseJobPayload("account.delete", {})).toThrow();
    });

    it("validates matching.reindex payload", () => {
      const valid = { scope: "all", algoVersion: "2026.10.1" };
      expect(parseJobPayload("matching.reindex", valid)).toEqual(valid);

      const validCampus = {
        scope: "campus",
        campus: "KAMPUS_C",
        algoVersion: "2026.10.1",
      };
      expect(parseJobPayload("matching.reindex", validCampus)).toEqual(validCampus);

      expect(() =>
        parseJobPayload("matching.reindex", { scope: "unknown", algoVersion: "2026.10.1" }),
      ).toThrow();
      expect(() =>
        parseJobPayload("matching.reindex", { scope: "all", algoVersion: "" }),
      ).toThrow();
      expect(() => parseJobPayload("matching.reindex", { scope: "all" })).toThrow();
    });
  });
});
