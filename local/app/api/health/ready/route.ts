import { json } from "@local/lib/http";
import { prisma } from "@local/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return json({ ok: true, database: "ready" });
  } catch {
    return json({ ok: false, database: "unavailable" }, 503);
  }
}
