import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ProgressBar from "@/components/shared/ProgressBar";
import WUBadge from "@/components/shared/WUBadge";
import SectionHeader from "@/components/shared/SectionHeader";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const user = await getCurrentUser();

  const enrollments = user
    ? await prisma.enrollment.findMany({
        where: { userId: user.id },
        include: {
          course: {
            include: {
              school: true,
              modules: { include: { lessons: true } },
            },
          },
        },
        orderBy: { startedAt: "desc" },
      })
    : [];

  const allLessonIds = enrollments.flatMap((e) =>
    e.course.modules.flatMap((m) => m.lessons.map((l) => l.id))
  );
  const completedLessons =
    user && allLessonIds.length
      ? await prisma.lessonProgress.findMany({
          where: { userId: user.id, lessonId: { in: allLessonIds }, completed: true },
        })
      : [];
  const completedSet = new Set(completedLessons.map((c) => c.lessonId));

  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const availableCourses = await prisma.course.findMany({
    where: enrolledCourseIds.length ? { id: { notIn: enrolledCourseIds } } : {},
    include: { school: true },
    orderBy: [{ school: { order: "asc" } }, { order: "asc" }],
    take: 6,
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">My Courses</h1>
        <p className="text-[#6b6459] mt-1">Your enrolled courses and progress</p>
      </div>

      <section>
        <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-5">Enrolled Courses</h2>
        {enrollments.length === 0 ? (
          <div className="bg-white border border-[#e2ddd5] rounded-2xl p-8 text-center">
            <p className="text-sm text-[#6b6459]">You are not enrolled in any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrollments.map((e) => {
              const lessons = e.course.modules.flatMap((m) => m.lessons);
              const doneCount = lessons.filter((l) => completedSet.has(l.id)).length;
              const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
              return (
                <Link key={e.id} href={`/dashboard/courses/${e.course.slug}`}>
                  <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden h-full">
                    <div className="h-1.5" style={{ backgroundColor: e.course.school.color }} />
                    <div className="p-5">
                      <p className="text-xs text-[#6b6459] mb-2 flex items-center gap-1">
                        {e.course.school.icon} {e.course.school.name.replace("School of ", "")}
                      </p>
                      <h3 className="font-semibold text-[#1a1a1a] mb-1 leading-snug">{e.course.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-[#6b6459] mb-4">
                        <span>Level {e.course.level}</span>
                        <span>·</span>
                        <span>{e.course.estimatedHours}h</span>
                      </div>
                      <ProgressBar value={pct} showLabel />
                      <div className="flex items-center justify-between mt-2 text-xs text-[#6b6459]">
                        <span>{pct}% complete</span>
                        <WUBadge value={e.course.wuValue} size="sm" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">Available Courses</h2>
          <Link href="/schools" className="text-sm text-[#4a7c59] font-medium hover:underline">
            Browse all schools →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {availableCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card overflow-hidden"
            >
              <div className="h-1.5" style={{ backgroundColor: course.school.color }} />
              <div className="p-5">
                <p className="text-xs text-[#6b6459] mb-2 flex items-center gap-1">
                  {course.school.icon} {course.school.name.replace("School of ", "")}
                </p>
                <h3 className="font-semibold text-[#1a1a1a] mb-1 leading-snug">{course.title}</h3>
                <div className="flex items-center gap-3 text-xs text-[#6b6459] mb-4">
                  <span>Level {course.level}</span>
                  <span>·</span>
                  <span>{course.estimatedHours}h</span>
                  <WUBadge value={course.wuValue} size="sm" />
                </div>
                <Link
                  href={`/dashboard/courses/${course.slug}`}
                  className="block w-full bg-[#4a7c59] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#2d5240] transition-colors text-center"
                >
                  Explore Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
