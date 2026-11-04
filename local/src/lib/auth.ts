import { prisma } from "./prisma";
import { readSession } from "./session";

export type CurrentAdmin = {
  id: string;
  username: string;
};

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const session = await readSession();
  if (!session) return null;
  const admin = await prisma.localAdmin.findUnique({
    where: { id: session.adminId },
    select: { id: true, username: true },
  });
  return admin;
}

export async function isSetupRequired(): Promise<boolean> {
  const count = await prisma.localAdmin.count();
  return count === 0;
}
