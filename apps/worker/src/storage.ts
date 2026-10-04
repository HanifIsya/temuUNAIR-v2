// apps/worker/src/storage.ts
// Short-lived presigned GET URLs so the ML service can fetch only our own
// storage objects (ARCH-ML request flow, 5 min TTL).

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { WorkerConfig } from "./config.js";

export const IMAGE_PRESIGN_TTL_SECONDS = 300;

export type PresignGet = (key: string) => Promise<string>;

export function createPresignGet(config: WorkerConfig): PresignGet {
  const client = new S3Client({
    region: config.s3Region,
    endpoint: config.s3Endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.s3AccessKey,
      secretAccessKey: config.s3SecretKey,
    },
  });
  return async (key: string): Promise<string> =>
    getSignedUrl(client, new GetObjectCommand({ Bucket: config.s3Bucket, Key: key }), {
      expiresIn: IMAGE_PRESIGN_TTL_SECONDS,
    });
}
