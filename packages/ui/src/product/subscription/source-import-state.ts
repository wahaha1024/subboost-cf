import type { SubscriptionSource } from "@subboost/ui/store/config-store";
import { tryNormalizeSubscriptionUrlInput } from "@subboost/core/subscription/url-input";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function markSourceAsPendingImport(source: SubscriptionSource): SubscriptionSource {
  if (
    source.parsed === false &&
    source.parsing === false &&
    source.nodeCount === undefined &&
    source.subscriptionUserInfo === undefined &&
    source.error === undefined &&
    source.errorInfo === undefined
  ) {
    return source;
  }

  return {
    ...source,
    parsed: false,
    parsing: false,
    nodeCount: undefined,
    subscriptionUserInfo: undefined,
    error: undefined,
    errorInfo: undefined,
  };
}

export function isSourcePendingImport(source: SubscriptionSource): boolean {
  const content =
    source.type === "url"
      ? (tryNormalizeSubscriptionUrlInput(source.content) ?? normalizeText(source.content))
      : normalizeText(source.content);
  if (!content) return false;

  if (source.parsing) return true;
  if (!source.parsed) return true;

  const lastParsedContent =
    source.type === "url"
      ? (tryNormalizeSubscriptionUrlInput(source.lastParsedContent ?? "") ?? normalizeText(source.lastParsedContent))
      : normalizeText(source.lastParsedContent);
  if (lastParsedContent && lastParsedContent !== content) return true;

  if (
    typeof source.lastParsedTag === "string" &&
    normalizeText(source.lastParsedTag) !== normalizeText(source.tag)
  ) {
    return true;
  }

  if (
    typeof source.lastParsedNameTemplate === "string" &&
    normalizeText(source.lastParsedNameTemplate) !== normalizeText(source.nameTemplate)
  ) {
    return true;
  }

  return false;
}
