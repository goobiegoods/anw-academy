import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolve the current ANW user from a verified Supabase identity.
 *
 * This deliberately fails closed. A missing session, failed verification, or
 * auth identity without a matching Academy record must never inherit another
 * student's identity or academic data.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser?.email) return null;

    return prisma.user.findUnique({
      where: { email: authUser.email.toLowerCase() },
      include: { studentProfile: true, practitionerProfile: true },
    });
  } catch {
    return null;
  }
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
