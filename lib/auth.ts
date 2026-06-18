import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolve the current ANW user. Uses the Supabase session when present;
 * falls back to the demo student so the platform is explorable without login.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser?.email) {
      const user = await prisma.user.findUnique({
        where: { email: authUser.email },
        include: { studentProfile: true, practitionerProfile: true },
      });
      if (user) return user;
    }
  } catch {
    // No session — fall through to demo user
  }

  return prisma.user.findFirst({
    where: { role: "STUDENT" },
    include: { studentProfile: true, practitionerProfile: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function awardWU(
  userId: string,
  amount: number,
  sourceType: string,
  description: string,
  sourceId?: string
) {
  await prisma.wellnessUnitTransaction.create({
    data: { userId, amount, sourceType, sourceId, description },
  });
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (profile) {
    const totalWU = profile.totalWU + amount;
    const level =
      totalWU >= 1250 ? 6 : totalWU >= 1000 ? 5 : totalWU >= 750 ? 4 : totalWU >= 500 ? 3 : totalWU >= 150 ? 2 : 1;
    await prisma.studentProfile.update({
      where: { userId },
      data: { totalWU, level },
    });
  }
}
