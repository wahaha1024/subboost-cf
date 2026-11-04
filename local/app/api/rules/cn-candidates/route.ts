import { NextRequest, NextResponse } from "next/server";
import {
  buildCnRuleCandidateResponse,
  buildCnRuleCandidateUnavailableResponse,
  parseCnRuleCandidateQuery,
  RuleIndexUnavailableError,
} from "@subboost/server-core/rules";
import { getCnRuleCandidateDiscovery } from "@local/lib/rule-catalog";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { moduleIds, excludedRuleKeys, debug } = parseCnRuleCandidateQuery(searchParams);

  try {
    const result = await getCnRuleCandidateDiscovery({ moduleIds, excludedRuleKeys });
    return NextResponse.json(buildCnRuleCandidateResponse(result, { debug }));
  } catch (error) {
    if (!(error instanceof RuleIndexUnavailableError)) throw error;
    return NextResponse.json(buildCnRuleCandidateUnavailableResponse(), { status: 503 });
  }
}
