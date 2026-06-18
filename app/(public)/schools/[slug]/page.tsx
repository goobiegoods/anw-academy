import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const school = await prisma.school.findUnique({
    where: { slug },
    include: {
      departments: { include: { courses: true } },
      courses: {
        orderBy: { order: "asc" },
        include: { modules: { include: { lessons: true } } },
      },
    },
  });

  if (!school) notFound();

  const totalWU = school.courses.reduce((n, c) => n + c.wuValue, 0);
  const totalLessons = school.courses.reduce(
    (n, c) => n + c.modules.reduce((m, mod) => m + mod.lessons.length, 0),
    0
  );

  return (
    <div className="w-full bg-[#faf8f4]">
      {/* School-colored header */}
      <div
        className="w-full py-24"
        style={{
          background: `linear-gradient(135deg, ${school.color} 0%, ${school.color}dd 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="block w-10 h-px bg-[#e8b45a]" />
            <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-white/60">
              A School of the Academy
            </span>
          </div>
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-white leading-tight max-w-3xl">
            {school.name}
          </h1>
          <p
            className="text-[13.5px] text-white/80 max-w-2xl mt-6"
            style={{ lineHeight: 1.9 }}
          >
            {school.description}
          </p>

          <div className="flex flex-wrap gap-8 mt-10">
            {[
              { n: school.courses.length, label: "Courses" },
              { n: school.departments.length, label: "Departments" },
              { n: totalLessons, label: "Lessons" },
              { n: totalWU, label: "WU Available" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-playfair text-3xl font-bold text-white">
                  {stat.n}
                </p>
                <p className="uppercase tracking-[0.2em] text-[9px] text-white/60 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Departments */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-10 h-px bg-[#c9923a]" />
          <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#9a9088]">
            Departments
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {school.departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white border border-[#e2ddd5] rounded-2xl p-6"
            >
              <span
                className="block w-6 h-1 rounded-full mb-4"
                style={{ backgroundColor: school.color }}
              />
              <h3 className="font-playfair font-bold text-[#1a1a1a] text-lg">
                {dept.name}
              </h3>
              {dept.description && (
                <p className="text-[12.5px] text-[#6b6459] mt-2" style={{ lineHeight: 1.7 }}>
                  {dept.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Course grid */}
      <div className="w-full bg-[#f5f1ea] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-10 h-px bg-[#c9923a]" />
            <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#9a9088]">
              The Curriculum
            </span>
          </div>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-10">
            Courses of study
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {school.courses.map((course) => {
              const lessonCount = course.modules.reduce(
                (n, m) => n + m.lessons.length,
                0
              );
              return (
                <div
                  key={course.id}
                  className="bg-white border border-[#e2ddd5] rounded-2xl overflow-hidden flex flex-col"
                >
                  <div
                    className="h-1.5"
                    style={{ backgroundColor: school.color }}
                  />
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-[9px] uppercase tracking-[0.15em] font-bold px-2.5 py-1 rounded-full"
                        style={{
                          color: school.color,
                          backgroundColor: `${school.color}14`,
                        }}
                      >
                        Level {course.level}
                      </span>
                      <span className="font-playfair font-bold text-[#c9923a] text-sm">
                        {course.wuValue} WU
                      </span>
                    </div>
                    <h3 className="font-playfair font-bold text-[#1a1a1a] text-lg leading-snug">
                      {course.title}
                    </h3>
                    <p
                      className="text-[12px] text-[#6b6459] mt-2 flex-1"
                      style={{ lineHeight: 1.7 }}
                    >
                      {course.description.length > 180
                        ? `${course.description.slice(0, 180)}…`
                        : course.description}
                    </p>
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#f0ece4] text-[11px] text-[#9a9088]">
                      <span>{course.estimatedHours} hours</span>
                      <span>
                        {course.modules.length} modules · {lessonCount} lessons
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-14">
            <Link
              href="/admissions"
              className="inline-block text-white text-sm font-bold px-9 py-3.5 rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: school.color }}
            >
              Apply to the {school.name.replace("School of ", "School of ")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
