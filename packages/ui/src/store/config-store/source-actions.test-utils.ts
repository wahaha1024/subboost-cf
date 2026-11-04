import { vi } from "vitest";
import type { ParsedNode, ParseResult } from "@subboost/core/types/node";
import { initialState, type SubscriptionSource } from "./definitions";
import { createSourceActions } from "./source-actions";

const sourceActionMocks = vi.hoisted(() => ({
  parseSubscription: vi.fn(),
  fetchUrlContentInBrowser: vi.fn(),
}));

export const PROXY_PROVIDER_HINT = "若错误多次出现，且确信订阅链接正确，可尝试在高级编辑中开启「proxy-providers模式」。";

vi.mock("@subboost/core/parser", () => ({
  parseSubscription: sourceActionMocks.parseSubscription,
}));

vi.mock("./definitions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./definitions")>();
  return {
    ...actual,
    fetchUrlContentInBrowser: sourceActionMocks.fetchUrlContentInBrowser,
  };
});

export function getSourceActionMocks() {
  return sourceActionMocks;
}

export function resetSourceActionMocks() {
  vi.clearAllMocks();
  sourceActionMocks.parseSubscription.mockReturnValue(parseResult([]));
  sourceActionMocks.fetchUrlContentInBrowser.mockResolvedValue({
    content: "",
    headers: {},
    parseResult: parseResult([]),
  });
}

export function node(name: string, extra: Record<string, unknown> = {}): ParsedNode {
  return {
    name,
    type: "ss",
    server: `${name.toLowerCase().replaceAll(" ", "-")}.example.com`,
    port: 443,
    cipher: "aes-128-gcm",
    password: "secret",
    ...extra,
  } as unknown as ParsedNode;
}

export function parseResult(nodes: ParsedNode[], errors: string[] = []): ParseResult {
  return { nodes, errors, totalParsed: nodes.length, totalFailed: errors.length };
}

export function source(overrides: Partial<SubscriptionSource>): SubscriptionSource {
  return { id: "source-1", type: "yaml", content: "proxies: []", ...overrides };
}

export function createHarness(overrides: Record<string, unknown> = {}) {
  let state = {
    ...structuredClone(initialState),
    ...overrides,
  } as any;

  const applyPatch = (patch: any) => {
    if (patch && patch !== state) state = { ...state, ...patch };
  };

  const set = (partial: any) => applyPatch(typeof partial === "function" ? partial(state) : partial);
  const setAndGenerateConfig = (updater: any) => applyPatch(updater(state));
  const actions = createSourceActions(set, () => state, setAndGenerateConfig);

  return { actions, getState: () => state };
}
