import {
  normalizeSubscriptionImportErrorInfo,
  SubscriptionImportError,
} from "@subboost/core/subscription/import-error";
import type { ParseResult } from "@subboost/core/types/node";

export type ClientApiErrorResponse = {
  error?: string;
  errorInfo?: unknown;
};

export type SourceImportApiResponse = ClientApiErrorResponse & {
  content?: string;
  headers?: Record<string, string>;
  parseResult?: ParseResult;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function readJsonPayload(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => "");
  if (!text.trim()) return {};

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

function getErrorMessage(data: unknown, fallbackMessage: string): string {
  if (!isRecord(data) || typeof data.error !== "string" || !data.error.trim()) {
    return fallbackMessage;
  }
  return data.error;
}

export async function readJsonResponse<T>(response: Response, fallbackMessage = "请求失败"): Promise<T> {
  const data = await readJsonPayload(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(data, fallbackMessage));
  }
  return data as T;
}

export async function readSourceImportResponse(
  response: Response,
  fallbackMessage = "获取 url 失败"
): Promise<SourceImportApiResponse> {
  const data = (await readJsonPayload(response)) as SourceImportApiResponse;
  if (!response.ok) {
    const info = normalizeSubscriptionImportErrorInfo(data.errorInfo || data.error);
    if (info) throw new SubscriptionImportError(info);
    throw new Error(getErrorMessage(data, fallbackMessage));
  }
  return data;
}
