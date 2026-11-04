import { createSubBoostFaviconRedirect } from "@subboost/ui/brand-favicon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return createSubBoostFaviconRedirect();
}
