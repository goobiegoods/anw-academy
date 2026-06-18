import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import CapstoneForm from "@/components/dashboard/CapstoneForm";

export const dynamic = "force-dynamic";

export default async function CapstonePage() {
  const user = await getCurrentUser();
  const capstones = user
    ? await prisma.capstone.findMany({
        where: { userId: user.id },
        orderBy: { submittedAt: "desc" },
      })
    : [];

  return (
    <CapstoneForm
      existing={capstones.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        wuAwarded: c.wuAwarded,
        mentorFeedback: c.mentorFeedback,
      }))}
    />
  );
}
