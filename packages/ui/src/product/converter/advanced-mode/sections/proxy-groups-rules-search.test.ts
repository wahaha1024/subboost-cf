import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRuleDisplayName, replaceRuleProviderBase, useRulesLibrarySearch } from "./proxy-groups-rules-search";

const mocks = vi.hoisted(() => {
  const bag: {
    effects: Array<() => void | (() => void)>;
    refs: Array<{ current: unknown }>;
    refIndex: number;
    rulesApi: any;
    state: unknown[];
    stateIndex: number;
    interactions: Record<string, ReturnType<typeof vi.fn>>;
  } = {
    effects: [],
    refs: [],
    refIndex: 0,
    rulesApi: {},
    state: [],
    stateIndex: 0,
    interactions: {
      rulesSearchCompleted: vi.fn(),
    },
  };

  return {
    bag,
    useCallback: vi.fn((callback: unknown) => callback),
    useEffect: vi.fn((effect: () => void | (() => void)) => {
      bag.effects.push(effect);
    }),
    useRef: vi.fn((initial: unknown) => {
      const index = bag.refIndex;
      if (!bag.refs[index]) bag.refs[index] = { current: initial };
      bag.refIndex += 1;
      return bag.refs[index];
    }),
    useState: vi.fn((initial: unknown) => {
      const index = bag.stateIndex;
      if (bag.state.length <= index) {
        bag.state.push(typeof initial === "function" ? (initial as () => unknown)() : initial);
      }
      const setter = vi.fn((next: unknown) => {
        bag.state[index] = typeof next === "function" ? (next as (current: unknown) => unknown)(bag.state[index]) : next;
      });
      bag.stateIndex += 1;
      return [bag.state[index], setter];
    }),
    useProductApiAdapter: vi.fn(() => ({ rules: bag.rulesApi })),
    useProductInteractionAdapter: vi.fn(() => bag.interactions),
  };
});

vi.mock("react", () => ({
  useCallback: mocks.useCallback,
  useEffect: mocks.useEffect,
  useRef: mocks.useRef,
  useState: mocks.useState,
}));

vi.mock("@subboost/ui/product/api-adapter", () => ({
  useProductApiAdapter: mocks.useProductApiAdapter,
}));

vi.mock("@subboost/ui/product/interactions", () => ({
  useProductInteractionAdapter: mocks.useProductInteractionAdapter,
}));

function resetHookState() {
  mocks.bag.effects = [];
  mocks.bag.refs = [];
  mocks.bag.refIndex = 0;
  mocks.bag.state = [];
  mocks.bag.stateIndex = 0;
}

function useRenderedHook() {
  mocks.bag.effects = [];
  mocks.bag.refIndex = 0;
  mocks.bag.stateIndex = 0;
  const value = useRulesLibrarySearch();
  for (const effect of mocks.bag.effects) effect();
  return value;
}

async function flushAsync() {
  for (let i = 0; i < 10; i += 1) {
    await Promise.resolve();
  }
}

function rule(id: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    name: id,
    behavior: "domain",
    path: `geosite/${id}.mrs`,
    ...extra,
  };
}

describe("proxy group rules library search", () => {
  let originalWindow: typeof globalThis.window | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    resetHookState();
    mocks.bag.rulesApi = {
      getTotalRules: vi.fn(async () => 100),
      searchRules: vi.fn(async () => ({
        items: [rule("openai")],
        source: "remote",
        totalMatched: 1,
        totalRules: 100,
      })),
    };
    originalWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        clearTimeout: globalThis.clearTimeout.bind(globalThis),
        setTimeout: globalThis.setTimeout.bind(globalThis),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  });

  it("replaces rule provider hosts and formats display names", () => {
    expect(replaceRuleProviderBase("https://old.example/geosite/openai.mrs", "https://rules.example.com/")).toBe(
      "https://rules.example.com/geosite/openai.mrs"
    );
    expect(replaceRuleProviderBase("https://old.example/list/openai.txt", "https://rules.example.com")).toBe(
      "https://old.example/list/openai.txt"
    );
    expect(getRuleDisplayName(rule("openai", { name: "openai", nameZh: "OpenAI 服务" }) as any)).toBe(
      "openai（OpenAI 服务）"
    );
    expect(getRuleDisplayName(rule("cn", { name: "", nameZh: "" }) as any)).toBe("cn");
    expect(getRuleDisplayName(rule("direct", { name: "direct", nameZh: "direct" }) as any)).toBe("direct");
  });

  it("loads total rules as helper copy", async () => {
    useRenderedHook();
    await flushAsync();
    const hook = useRenderedHook();

    expect(mocks.bag.rulesApi.getTotalRules).toHaveBeenCalled();
    expect(hook.totalRules).toBe(100);
  });

  it("searches after debounce and records success metadata", async () => {
    const initialHook = useRenderedHook();
    initialHook.setRuleSearchKeyword(" openai ");
    useRenderedHook();
    vi.advanceTimersByTime(300);
    await flushAsync();
    const hook = useRenderedHook();

    expect(mocks.bag.rulesApi.searchRules).toHaveBeenCalledWith(
      expect.objectContaining({ keyword: "openai", page: 1, size: 50 })
    );
    expect(hook.searchResults).toEqual([expect.objectContaining({ id: "openai" })]);
    expect(hook.rulesSearchSource).toBe("remote");
    expect(hook.totalMatched).toBe(1);
    expect(mocks.bag.interactions.rulesSearchCompleted).toHaveBeenCalledWith({
      result: "success",
      resultSource: "remote",
      resultCount: 1,
    });
  });

  it("loads more results and ignores duplicate ids", async () => {
    mocks.bag.rulesApi.searchRules = vi
      .fn()
      .mockResolvedValueOnce({
        items: [rule("a"), rule("b")],
        source: "stale",
        totalMatched: 3,
        totalRules: 120,
      })
      .mockResolvedValueOnce({
        items: [rule("b"), rule("c")],
        source: "stale",
        totalMatched: 3,
        totalRules: 120,
      });

    const initialHook = useRenderedHook();
    initialHook.setRuleSearchKeyword("ai");
    useRenderedHook();
    vi.advanceTimersByTime(300);
    await flushAsync();
    const firstPageHook = useRenderedHook();

    expect(firstPageHook.canLoadMore).toBe(true);
    firstPageHook.handleLoadMore();
    await flushAsync();
    const hook = useRenderedHook();

    expect(mocks.bag.rulesApi.searchRules).toHaveBeenLastCalledWith(
      expect.objectContaining({ keyword: "ai", page: 2, size: 50 })
    );
    expect(hook.searchResults.map((item) => item.id)).toEqual(["a", "b", "c"]);
    expect(hook.rulesSearchSource).toBe("stale");
  });

  it("reports unavailable search APIs as errors", async () => {
    mocks.bag.rulesApi = {
      getTotalRules: vi.fn(async () => null),
    };

    const initialHook = useRenderedHook();
    initialHook.setRuleSearchKeyword("openai");
    useRenderedHook();
    vi.advanceTimersByTime(300);
    await flushAsync();
    const hook = useRenderedHook();

    expect(hook.searchResults).toEqual([]);
    expect(hook.rulesSearchError).toBe("规则库接口暂不可用");
    expect(mocks.bag.interactions.rulesSearchCompleted).toHaveBeenCalledWith({
      result: "error",
      resultSource: "unknown",
      resultCount: 0,
    });
  });

  it("resets search state for blank keywords", () => {
    mocks.bag.state = ["  ", [rule("old")], true, true, "old error", 2, 10, 100, "remote"];
    useRenderedHook();
    const hook = useRenderedHook();

    expect(hook.searchResults).toEqual([]);
    expect(hook.rulesSearchError).toBeNull();
    expect(hook.rulesSearchLoading).toBe(false);
    expect(hook.rulesSearchLoadingMore).toBe(false);
    expect(hook.totalMatched).toBeNull();
    expect(hook.rulesSearchSource).toBeNull();
  });

  it("handles malformed search data and non-Error search failures", async () => {
    mocks.bag.rulesApi.searchRules = vi
      .fn()
      .mockResolvedValueOnce({
        items: "bad",
        source: "local",
      })
      .mockRejectedValue("boom");

    const initialHook = useRenderedHook();
    initialHook.setRuleSearchKeyword("missing");
    useRenderedHook();
    vi.advanceTimersByTime(300);
    await flushAsync();
    const emptyResultHook = useRenderedHook();

    expect(emptyResultHook.searchResults).toEqual([]);
    expect(emptyResultHook.totalMatched).toBeNull();
    expect(emptyResultHook.rulesSearchSource).toBeNull();
    expect(mocks.bag.interactions.rulesSearchCompleted).toHaveBeenCalledWith({
      result: "noResult",
      resultSource: "unknown",
      resultCount: 0,
    });

    emptyResultHook.setRuleSearchKeyword("again");
    useRenderedHook();
    vi.advanceTimersByTime(300);
    await flushAsync();
    const failedHook = useRenderedHook();

    expect(failedHook.rulesSearchError).toBe("搜索失败");
  });

  it("guards load-more calls while busy or unavailable", () => {
    const states = [
      ["", [rule("a")], false, false, null, 1, 3, 100, "remote"],
      ["ai", [rule("a")], true, false, null, 1, 3, 100, "remote"],
      ["ai", [rule("a")], false, true, null, 1, 3, 100, "remote"],
      ["ai", [rule("a")], false, false, null, 1, 1, 100, "remote"],
    ];

    for (const state of states) {
      resetHookState();
      mocks.bag.state = state;
      // eslint-disable-next-line react-hooks/rules-of-hooks -- mocked hook harness intentionally exercises several state snapshots.
      const hook = useRenderedHook();
      hook.handleLoadMore();
    }

    expect(mocks.bag.rulesApi.searchRules).not.toHaveBeenCalled();
  });

  it("handles malformed load-more data and non-Error load-more failures", async () => {
    mocks.bag.rulesApi.searchRules = vi
      .fn()
      .mockResolvedValueOnce({
        items: [rule("a")],
        source: "remote",
        totalMatched: 3,
        totalRules: 100,
      })
      .mockResolvedValueOnce({
        items: [null, { id: 1 }, rule("b")],
        source: "unavailable",
        totalMatched: 4,
        totalRules: 101,
      })
      .mockRejectedValueOnce("offline");

    const initialHook = useRenderedHook();
    initialHook.setRuleSearchKeyword("ai");
    useRenderedHook();
    vi.advanceTimersByTime(300);
    await flushAsync();
    const firstPageHook = useRenderedHook();

    firstPageHook.handleLoadMore();
    await flushAsync();
    const mergedHook = useRenderedHook();
    expect(mergedHook.searchResults.map((item) => item.id)).toEqual(["a", "b"]);
    expect(mergedHook.rulesSearchSource).toBe("unavailable");
    expect(mergedHook.totalRules).toBe(101);

    mergedHook.handleLoadMore();
    await flushAsync();
    const failedHook = useRenderedHook();
    expect(failedHook.rulesSearchError).toBe("加载失败");
  });
});
