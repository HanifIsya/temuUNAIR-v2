// apps/web/src/server/storage/index.ts
// S3-compatible storage client (BE-10): private bucket, unguessable keys,
// presigned PUT/GET with short TTLs. Tests inject a fake via vi.mock.

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { parseConfig } from "../config";

export interface StorageClient {
  presignPut(key: string, mime: string, expiresInSeconds: number): Promise<string>;
  presignGet(key: string, expiresInSeconds: number): Promise<string>;
  head(key: string): Promise<{ size: number; contentType: string | null } | null>;
  get(key: string): Promise<Buffer | null>;
  put(key: string, data: Buffer, mime: string): Promise<void>;
  delete(key: string): Promise<void>;
}

function isNotFound(err: unknown): boolean {
  if (err && typeof err === "object") {
    const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
    return e.name === "NotFound" || e.name === "NoSuchKey" || e.$metadata?.httpStatusCode === 404;
  }
  return false;
}

interface S3Context {
  client: S3Client;
  bucket: string;
}

let context: S3Context | null = null;

function s3(): S3Context {
  if (!context) {
    const cfg = parseConfig(process.env);
    context = {
      bucket: cfg.s3Bucket,
      client: new S3Client({
        region: cfg.s3Region,
        endpoint: cfg.s3Endpoint,
        forcePathStyle: true,
        credentials: {
          accessKeyId: cfg.s3AccessKey,
          secretAccessKey: cfg.s3SecretKey,
        },
      }),
    };
  }
  return context;
}

export function getStorage(): StorageClient {
  return {
    async presignPut(key: string, mime: string, expiresInSeconds: number): Promise<string> {
      const { client, bucket } = s3();
      return getSignedUrl(
        client,
        new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: mime }),
        { expiresIn: expiresInSeconds },
      );
    },

    async presignGet(key: string, expiresInSeconds: number): Promise<string> {
      const { client, bucket } = s3();
      return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
        expiresIn: expiresInSeconds,
      });
    },

    async head(key: string): Promise<{ size: number; contentType: string | null } | null> {
      const { client, bucket } = s3();
      try {
        const result = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        return {
          size: result.ContentLength ?? 0,
          contentType: result.ContentType ?? null,
        };
      } catch (err) {
        if (isNotFound(err)) return null;
        throw err;
      }
    },

    async get(key: string): Promise<Buffer | null> {
      const { client, bucket } = s3();
      try {
        const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        if (!result.Body) return null;
        const bytes = await result.Body.transformToByteArray();
        return Buffer.from(bytes);
      } catch (err) {
        if (isNotFound(err)) return null;
        throw err;
      }
    },

    async put(key: string, data: Buffer, mime: string): Promise<void> {
      const { client, bucket } = s3();
      await client.send(
        new PutObjectCommand({ Bucket: bucket, Key: key, Body: data, ContentType: mime }),
      );
    },

    async delete(key: string): Promise<void> {
      const { client, bucket } = s3();
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
  };
}
