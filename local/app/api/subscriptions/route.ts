import { createSubscriptionResponse, listSubscriptionsResponse } from "@local/lib/subscription-route-handlers";

export async function GET() {
  return listSubscriptionsResponse();
}

export async function POST(request: Request) {
  return createSubscriptionResponse(request);
}
