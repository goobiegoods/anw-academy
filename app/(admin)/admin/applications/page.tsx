import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import ApplicationsClient from "@/components/admin/ApplicationsClient";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  await requireAdmin();

  const applications = await prisma.application.findMany({
    orderBy: { submittedAt: "desc" },
  });

  const serialized = applications.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    phone: a.phone ?? "",
    location: a.location ?? "",
    school: a.schoolInterest,
    pathway: a.pathway,
    experience: a.experienceLevel,
    motivation: a.motivation,
    status: a.status,
    date: a.submittedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Applications</h1>
        <p className="text-[#6b6459] mt-1">
          {applications.length === 0
            ? "No applications received yet."
            : `${applications.length} application${applications.length === 1 ? "" : "s"} received`}
        </p>
      </div>
      <ApplicationsClient applications={serialized} />
    </div>
  );
}
