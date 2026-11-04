import type { ParseResult } from "@subboost/core/types/node";

function looksLikeSchemeLink(line: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(line.trim());
}

function looksLikeBase64Payload(content: string): boolean {
  const normalized = content.replace(/\s/g, "");
  if (!normalized || normalized.length < 32) return false;
  return /^[A-Za-z0-9+/=_-]+$/.test(normalized);
}

export function looksLikeLinkOrBase64SubscriptionPayload(content: string): boolean {
  const text = content.trim();
  if (!text) return false;

  if (looksLikeBase64Payload(text)) return true;

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith(";"));

  return lines.length > 0 && lines.every(looksLikeSchemeLink);
}

export function looksLikeMissingAnyTLSDetails(parsed: ParseResult): boolean {
  if (!parsed || parsed.nodes.length === 0) return false;

  const anytlsNodes = parsed.nodes.filter((node) => node?.type === "anytls") as Array<Record<string, unknown>>;
  if (anytlsNodes.length === 0) return false;

  return anytlsNodes.every((node) => {
    const fp = node["client-fingerprint"];
    if (typeof fp === "string" && fp.trim()) return false;

    const alpn = node.alpn;
    if (Array.isArray(alpn)) {
      return !alpn.some((value) => typeof value === "string" && value.trim());
    }

    return !(typeof alpn === "string" && alpn.trim());
  });
}

export function shouldTryClashMetaForV2raynPayload(content: string, parsed: ParseResult): boolean {
  return looksLikeMissingAnyTLSDetails(parsed) || looksLikeLinkOrBase64SubscriptionPayload(content);
}
