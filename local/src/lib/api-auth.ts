import { getCurrentAdmin, type CurrentAdmin } from "@local/lib/auth";
import { apiError } from "@local/lib/http";

type AdminResponseHandler = (admin: CurrentAdmin) => Response | Promise<Response>;

export function localAdminRequiredResponse(): Response {
  return apiError("Authentication required.", "UNAUTHORIZED", 401);
}

export async function getOptionalCurrentAdmin(): Promise<CurrentAdmin | null> {
  return getCurrentAdmin();
}

export async function withCurrentAdmin(handler: AdminResponseHandler): Promise<Response> {
  const admin = await getCurrentAdmin();
  if (!admin) return localAdminRequiredResponse();
  return handler(admin);
}
