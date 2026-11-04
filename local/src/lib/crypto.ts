import { decryptEncryptedFieldV2, encryptEncryptedFieldV2 } from "@subboost/server-core/crypto";
import { requireEnv } from "./env";

function getMasterKey(): string {
  return requireEnv("ENCRYPTION_KEY");
}

export function encryptText(plaintext: string): string {
  return encryptEncryptedFieldV2(plaintext, getMasterKey());
}

export function decryptText(ciphertext: string): string {
  return decryptEncryptedFieldV2(ciphertext, getMasterKey());
}

export function encryptJson(value: unknown): string {
  return encryptText(JSON.stringify(value));
}

export function decryptJson<T>(ciphertext: string | null | undefined, fallback: T): T {
  if (!ciphertext) return fallback;
  return JSON.parse(decryptText(ciphertext)) as T;
}

export function decryptJsonObject(ciphertext: string | null | undefined): Record<string, unknown> {
  const value = decryptJson<unknown>(ciphertext, {});
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
