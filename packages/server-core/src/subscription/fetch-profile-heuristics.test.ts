import { describe, expect, it } from "vitest";
import {
  looksLikeLinkOrBase64SubscriptionPayload,
  looksLikeMissingAnyTLSDetails,
  shouldTryClashMetaForV2raynPayload,
} from "./fetch-profile-heuristics";

describe("subscription fetch profile heuristics", () => {
  it("detects link-list and base64-like subscription payloads", () => {
    expect(looksLikeLinkOrBase64SubscriptionPayload("")).toBe(false);
    expect(looksLikeLinkOrBase64SubscriptionPayload("vmess://abc\n# comment\nss://def")).toBe(true);
    expect(looksLikeLinkOrBase64SubscriptionPayload("vmess://abc\nnot-a-link")).toBe(false);
    expect(looksLikeLinkOrBase64SubscriptionPayload("QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo=")).toBe(true);
  });

  it("detects AnyTLS nodes that are missing fingerprint and ALPN details", () => {
    expect(looksLikeMissingAnyTLSDetails({ nodes: [] } as any)).toBe(false);
    expect(looksLikeMissingAnyTLSDetails({ nodes: [{ type: "vmess" }] } as any)).toBe(false);
    expect(looksLikeMissingAnyTLSDetails({ nodes: [{ type: "anytls" }] } as any)).toBe(true);
    expect(looksLikeMissingAnyTLSDetails({ nodes: [{ type: "anytls", "client-fingerprint": "chrome" }] } as any)).toBe(false);
    expect(looksLikeMissingAnyTLSDetails({ nodes: [{ type: "anytls", alpn: ["", "h2"] }] } as any)).toBe(false);
    expect(looksLikeMissingAnyTLSDetails({ nodes: [{ type: "anytls", alpn: [" "] }] } as any)).toBe(true);
  });

  it("decides when Clash Meta should be retried for v2rayN payloads", () => {
    expect(shouldTryClashMetaForV2raynPayload("vmess://abc", { nodes: [] } as any)).toBe(true);
    expect(shouldTryClashMetaForV2raynPayload("not a subscription", { nodes: [{ type: "anytls" }] } as any)).toBe(true);
    expect(shouldTryClashMetaForV2raynPayload("not a subscription", { nodes: [{ type: "vmess" }] } as any)).toBe(false);
  });
});
