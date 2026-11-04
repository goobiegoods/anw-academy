import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Prisma } from "@prisma/client";
import { levelForWU } from "@/lib/academy-2.0/academic-progress";

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

    return await prisma.user.findUnique({
      where: { email: authUser.email.toLowerCase() },
      include: { studentProfile: true, practitionerProfile: true },
    });
  } catch {
    return null;
  }
}

export async function awardWUInTransaction(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
  sourceType: string,
  description: string,
  sourceId?: string,
): Promise<boolean> {
  if (!Number.isInteger(amount) || amount <= 0) return false;

  if (sourceId) {
    const existing = await tx.wellnessUnitTransaction.findFirst({
      where: { userId, sourceType, sourceId },
      select: { id: true },
    });
    if (existing) return false;
  }

  await tx.wellnessUnitTransaction.create({
    data: { userId, amount, sourceType, sourceId, description },
  });

  const profile = await tx.studentProfile.findUnique({ where: { userId } });
  if (profile) {
    const totalWU = profile.totalWU + amount;
    await tx.studentProfile.update({
      where: { userId },
      data: { totalWU: { increment: amount }, level: levelForWU(totalWU) },
    });
  }

  return true;
}

export async function awardWU(
  userId: string,
  amount: number,
  sourceType: string,
  description: string,
  sourceId?: string,
): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(
        (tx) =>
          awardWUInTransaction(
            tx,
            userId,
            amount,
            sourceType,
            description,
            sourceId,
          ),
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      const retryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";
      if (!retryable || attempt === 2) throw error;
    }
  }

  return false;
}
