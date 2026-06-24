import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  await requireAdmin();

  const courses = await prisma.course.findMany({
    orderBy: [{ school: { order: "asc" } }, { order: "asc" }],
    include: {
      school: { select: { name: true, icon: true, color: true } },
      _count: { select: { enrollments: true } },
    },
  });

  const totalCourses = courses.length;
  const totalEnrollments = courses.reduce((sum, c) => sum + c._count.enrollments, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Courses</h1>
        <p className="text-[#6b6459] mt-1">
          {totalCourses} courses across 6 schools · {totalEnrollments} total enrollments
        </p>
      </div>

      <div
        className="rounded-[16px] overflow-hidden"
        style={{ border: "0.5px solid #DDD5C5" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "#FAF7F0", borderBottom: "0.5px solid #DDD5C5" }}>
                {["Course", "Level", "WU", "Hours", "Enrolled", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7a6a] px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map((c, i) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: i < courses.length - 1 ? "0.5px solid #EDE8DE" : undefined,
                    backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#FAF8F4",
                  }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.school.icon}</span>
                      <div>
                        <p className="font-medium text-[13px] text-[#1a1a1a]">{c.title}</p>
                        <p className="text-[11px] text-[#6b6459]">{c.school.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6b6459]">{c.level}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-[13px]" style={{ color: "#c9923a" }}>
                      {c.wuValue} WU
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#6b6459]">{c.estimatedHours}h</td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-[13px] text-[#1a1a1a]">
                      {c._count.enrollments}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={
                        c.status === "published"
                          ? { backgroundColor: "rgba(74,124,89,0.12)", color: "#2d5240", border: "0.5px solid rgba(74,124,89,0.3)" }
                          : { backgroundColor: "rgba(107,100,89,0.10)", color: "#6b6459", border: "0.5px solid #DDD5C5" }
                      }
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className="px-5 py-3 text-[11px] text-[#8a7a6a]"
          style={{ borderTop: "0.5px solid #EDE8DE", backgroundColor: "#FAF8F4" }}
        >
          {totalCourses} courses total
        </div>
      </div>
    </div>
  );
}
