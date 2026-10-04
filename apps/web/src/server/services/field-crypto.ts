// apps/web/src/server/services/field-crypto.ts
// FR-REP-005 / BE-05: verification-hint answers are encrypted at rest with
// AES-256-GCM (FIELD_ENCRYPTION_KEY, base64 32 B). Layout: iv(12) || tag(16) || ciphertext.

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function keyFrom(base64Key: string): Buffer {
  const key = Buffer.from(base64Key, "base64");
  if (key.length !== 32) {
    throw new Error("FIELD_ENCRYPTION_KEY must decode to exactly 32 bytes");
  }
  return key;
}

export function encryptFieldAnswer(base64Key: string, plaintext: string): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFrom(base64Key), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
}

export function decryptFieldAnswer(base64Key: string, blob: Buffer): string {
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const ciphertext = blob.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", keyFrom(base64Key), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
