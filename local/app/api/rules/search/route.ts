import { NextRequest, NextResponse } from "next/server";
import { parsePagePagination } from "@subboost/core/api/pagination";
import { RuleIndexUnavailableError, normalizeRuleSearchType } from "@subboost/server-core/rules";
import { searchRules } from "@local/lib/rule-catalog";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") ?? "";
  const type = normalizeRuleSearchType(searchParams.get("type"));
  const { page, pageSize: size } = parsePagePagination(searchParams, {
    sizeParam: "size",
    defaultSize: 20,
    maxPage: 5000,
    maxSize: 50,
  });

  try {
    return NextResponse.json(await searchRules({ keyword, type, page, size, allowStale: true }));
  } catch (error) {
    if (!(error instanceof RuleIndexUnavailableError)) throw error;
    return NextResponse.json(
      {
        items: [],
        keyword,
        type,
        page,
        size,
        totalMatched: 0,
        totalRules: 0,
        source: "unavailable",
        error: "规则库暂不可用，请稍后重试",
        code: "RULE_INDEX_UNAVAILABLE",
      },
      { status: 503 }
    );
  }
}
