import * as React from "react";
import type { RuleSetInfo } from "@subboost/core/rules/metadata";
import { useProductApiAdapter } from "@subboost/ui/product/api-adapter";
import { useProductInteractionAdapter } from "@subboost/ui/product/interactions";

const RULES_SEARCH_PAGE_SIZE = 50;
type RulesSearchSource = "remote" | "stale" | "unavailable";

export function replaceRuleProviderBase(url: string, baseUrl: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const match = url.match(/\/(geosite|geoip)\/[^/]+\.mrs$/);
  if (!match) return url;
  return `${normalizedBase}${match[0]}`;
}

export function getRuleDisplayName(rule: RuleSetInfo): string {
  const original = (rule.name || rule.id).trim();
  const common = (rule.nameZh || "").trim();
  if (common && common !== original) return `${original}（${common}）`;
  return original;
}

export function useRulesLibrarySearch() {
  const rulesApi = useProductApiAdapter().rules;
  const interactions = useProductInteractionAdapter();
  const [ruleSearchKeyword, setRuleSearchKeyword] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<RuleSetInfo[]>([]);
  const [rulesSearchLoading, setRulesSearchLoading] = React.useState(false);
  const [rulesSearchLoadingMore, setRulesSearchLoadingMore] = React.useState(false);
  const [rulesSearchError, setRulesSearchError] = React.useState<string | null>(null);
  const [rulesSearchPage, setRulesSearchPage] = React.useState(1);
  const [totalMatched, setTotalMatched] = React.useState<number | null>(null);
  const [totalRules, setTotalRules] = React.useState<number | null>(null);
  const [rulesSearchSource, setRulesSearchSource] = React.useState<RulesSearchSource | null>(null);
  const searchSeqRef = React.useRef(0);

  React.useEffect(() => {
    const controller = new AbortController();

    (rulesApi?.getTotalRules ? rulesApi.getTotalRules(controller.signal) : Promise.resolve(null))
      .then((data) => {
        if (controller.signal.aborted) return;
        if (typeof data === "number") setTotalRules(data);
      })
      .catch(() => {
        // Total count is helper copy only; search still works if preload fails.
      });

    return () => controller.abort();
  }, [rulesApi]);

  React.useEffect(() => {
    const keyword = ruleSearchKeyword.trim();
    const searchSeq = (searchSeqRef.current += 1);
    if (!keyword) {
      setSearchResults([]);
      setRulesSearchError(null);
      setRulesSearchLoading(false);
      setRulesSearchLoadingMore(false);
      setRulesSearchPage(1);
      setTotalMatched(null);
      setRulesSearchSource(null);
      return;
    }

    setRulesSearchPage(1);
    setTotalMatched(null);
    setRulesSearchSource(null);

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setRulesSearchLoading(true);
      setRulesSearchLoadingMore(false);
      setRulesSearchError(null);
      searchRules({
        api: rulesApi,
        keyword,
        page: 1,
        size: RULES_SEARCH_PAGE_SIZE,
        signal: controller.signal,
      })
        .then((data) => {
          if (controller.signal.aborted) return;
          if (searchSeqRef.current !== searchSeq) return;
          const items = Array.isArray(data.items) ? data.items : [];
          setSearchResults(items);
          if (typeof data.totalRules === "number") setTotalRules(data.totalRules);
          if (typeof data.totalMatched === "number") setTotalMatched(data.totalMatched);
          if (isRulesSearchSource(data.source)) setRulesSearchSource(data.source);
          const resultCount = typeof data.totalMatched === "number" ? data.totalMatched : items.length;
          interactions.rulesSearchCompleted?.({
            result: resultCount > 0 ? "success" : "noResult",
            resultSource: isRulesSearchSource(data.source) ? data.source : "unknown",
            resultCount,
          });
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          if (searchSeqRef.current !== searchSeq) return;
          setSearchResults([]);
          setRulesSearchError(err instanceof Error ? err.message : "搜索失败");
          interactions.rulesSearchCompleted?.({
            result: "error",
            resultSource: "unknown",
            resultCount: 0,
          });
        })
        .finally(() => {
          if (controller.signal.aborted) return;
          if (searchSeqRef.current !== searchSeq) return;
          setRulesSearchLoading(false);
        });
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [interactions, ruleSearchKeyword, rulesApi]);

  const canLoadMore =
    Boolean(ruleSearchKeyword.trim()) &&
    typeof totalMatched === "number" &&
    totalMatched > 0 &&
    searchResults.length < totalMatched;

  const handleLoadMore = React.useCallback(() => {
    const keyword = ruleSearchKeyword.trim();
    if (!keyword || !canLoadMore || rulesSearchLoading || rulesSearchLoadingMore) return;

    const nextPage = rulesSearchPage + 1;
    const searchSeq = searchSeqRef.current;

    setRulesSearchLoadingMore(true);
    setRulesSearchError(null);

    searchRules({
      api: rulesApi,
      keyword,
      page: nextPage,
      size: RULES_SEARCH_PAGE_SIZE,
    })
      .then((data) => {
        if (searchSeqRef.current !== searchSeq) return;

        const items = Array.isArray(data.items) ? data.items : [];
        setSearchResults((prev) => {
          if (items.length === 0) return prev;
          const seen = new Set(prev.map((r) => r.id));
          const merged = [...prev];
          for (const item of items) {
            if (!item || typeof item.id !== "string" || seen.has(item.id)) continue;
            seen.add(item.id);
            merged.push(item);
          }
          return merged;
        });

        if (typeof data.totalRules === "number") setTotalRules(data.totalRules);
        if (typeof data.totalMatched === "number") setTotalMatched(data.totalMatched);
        if (isRulesSearchSource(data.source)) setRulesSearchSource(data.source);
        setRulesSearchPage(nextPage);
      })
      .catch((err: unknown) => {
        if (searchSeqRef.current !== searchSeq) return;
        setRulesSearchError(err instanceof Error ? err.message : "加载失败");
      })
      .finally(() => {
        if (searchSeqRef.current !== searchSeq) return;
        setRulesSearchLoadingMore(false);
      });
  }, [canLoadMore, ruleSearchKeyword, rulesApi, rulesSearchLoading, rulesSearchLoadingMore, rulesSearchPage]);

  return {
    ruleSearchKeyword,
    setRuleSearchKeyword,
    searchResults,
    rulesSearchLoading,
    rulesSearchLoadingMore,
    rulesSearchError,
    rulesSearchSource,
    totalMatched,
    totalRules,
    canLoadMore,
    handleLoadMore,
  };
}

function isRulesSearchSource(value: unknown): value is RulesSearchSource {
  return value === "remote" || value === "stale" || value === "unavailable";
}

function searchRules({
  api,
  keyword,
  page,
  size,
  signal,
}: {
  api: ReturnType<typeof useProductApiAdapter>["rules"];
  keyword: string;
  page: number;
  size: number;
  signal?: AbortSignal;
}) {
  if (api?.searchRules) {
    return api.searchRules({ keyword, page, size, signal });
  }
  return Promise.reject(new Error("规则库接口暂不可用"));
}
