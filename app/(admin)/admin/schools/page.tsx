import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage() {
  await requireAdmin();

  const schools = await prisma.school.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { departments: true, courses: true } },
      courses: {
        select: {
          enrollments: { select: { progressPercent: true } },
        },
      },
    },
  });

  const schoolData = schools.map((s) => {
    const allProgress = s.courses.flatMap((c) => c.enrollments.map((e) => e.progressPercent));
    const totalEnrollments = allProgress.length;
    const avgProgress = totalEnrollments > 0
      ? Math.round(allProgress.reduce((a, b) => a + b, 0) / totalEnrollments)
      : 0;
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      icon: s.icon,
      color: s.color,
      departments: s._count.departments,
      courses: s._count.courses,
      enrollments: totalEnrollments,
      avgProgress,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Schools</h1>
        <p className="text-[#6b6459] mt-1">
          {schools.length} schools · real enrollment and progress data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {schoolData.map((school) => (
          <div
            key={school.slug}
            className="rounded-[16px] overflow-hidden"
            style={{ backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }}
          >
            <div className="h-1.5" style={{ backgroundColor: school.color }} />
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${school.color}18` }}
                >
                  {school.icon}
                </div>
                <div className="flex-1">
                  <h2 className="font-playfair font-bold text-[#1a1a1a]">{school.name}</h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#6b6459]">
                    <span>{school.departments} department{school.departments !== 1 ? "s" : ""}</span>
                    <span>·</span>
                    <span>{school.courses} course{school.courses !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(28,51,39,0.05)" }}>
                  <p className="text-2xl font-bold font-playfair text-[#1a1a1a]">
                    {school.enrollments}
                  </p>
                  <p className="text-xs text-[#6b6459]">Enrollments</p>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(28,51,39,0.05)" }}>
                  <p className="text-2xl font-bold font-playfair text-[#1a1a1a]">
                    {school.avgProgress}%
                  </p>
                  <p className="text-xs text-[#6b6459]">Avg Progress</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
