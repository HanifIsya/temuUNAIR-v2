import { describe, expect, it, vi } from "vitest";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IMAGE_PRESIGN_TTL_SECONDS, createPresignGet } from "./storage.js";
import { parseWorkerConfig } from "./config.js";

// TMU-BE-007: the worker presigns short-lived GET URLs (5 min, ARCH-ML request flow)
// so the ML service can fetch only our own storage objects.

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class MockS3Client {
    constructor(public config: unknown) {}
    send(): Promise<unknown> {
      return Promise.resolve({});
    }
  },
  GetObjectCommand: class MockGetObjectCommand {
    constructor(public input: unknown) {}
  },
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(async () => "http://localhost:9000/temuunair-dev/key?X-Amz-Signature=sig"),
}));

describe("createPresignGet", () => {
  it("presigns a GET for the storage key with a 300 s TTL", async () => {
    const cfg = parseWorkerConfig({});
    const presignGet = createPresignGet(cfg);

    const url = await presignGet("reports/abc/img.jpg");

    expect(url).toContain("X-Amz-Signature=sig");
    expect(getSignedUrl).toHaveBeenCalledTimes(1);
    const [client, command, options] = vi.mocked(getSignedUrl).mock.calls[0] as [
      S3Client,
      GetObjectCommand,
      { expiresIn: number },
    ];
    expect(client).toBeInstanceOf(S3Client);
    expect(command).toBeInstanceOf(GetObjectCommand);
    expect(command.input).toMatchObject({ Bucket: "temuunair-dev", Key: "reports/abc/img.jpg" });
    expect(options.expiresIn).toBe(IMAGE_PRESIGN_TTL_SECONDS);
    expect(IMAGE_PRESIGN_TTL_SECONDS).toBe(300);
  });
});
