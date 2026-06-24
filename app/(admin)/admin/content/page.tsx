import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function ContentInsightsPage() {
  await requireAdmin();

  const [courses, quizzes, schools] = await Promise.all([
    prisma.course.findMany({
      include: {
        school: { select: { name: true, color: true, icon: true } },
        enrollments: { select: { progressPercent: true } },
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                lessonProgress: { where: { completed: true }, select: { id: true } },
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { enrollments: { _count: "desc" } },
    }),

    prisma.quiz.findMany({
      include: {
        attempts: {
          where: { submittedAt: { not: null } },
          select: { passed: true },
        },
        course: {
          select: {
            title: true,
            school: { select: { name: true, color: true } },
          },
        },
      },
    }),

    prisma.school.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
        courses: { select: { _count: { select: { enrollments: true } } } },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  // ── Course stats ────────────────────────────────────────────────────────
  const courseStats = courses
    .filter((c) => c._count.enrollments > 0)
    .map((c) => {
      const enrollCount = c._count.enrollments;
      const avgProgress =
        c.enrollments.length > 0
          ? Math.round(c.enrollments.reduce((s, e) => s + e.progressPercent, 0) / c.enrollments.length)
          : 0;
      const totalLessons = c.modules.reduce((s, m) => s + m.lessons.length, 0);
      return { ...c, enrollCount, avgProgress, totalLessons };
    });

  const topCourses = [...courseStats].sort((a, b) => b.enrollCount - a.enrollCount).slice(0, 8);
  const lowCompletionCourses = [...courseStats]
    .filter((c) => c.enrollCount >= 1)
    .sort((a, b) => a.avgProgress - b.avgProgress)
    .slice(0, 6);

  // ── Lesson completion rates ─────────────────────────────────────────────
  const lessonStats = courses.flatMap((c) => {
    const enrollCount = c._count.enrollments;
    if (enrollCount === 0) return [];
    return c.modules.flatMap((m) =>
      m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        courseName: c.title,
        schoolColor: c.school.color,
        schoolName: c.school.name.replace("School of ", ""),
        completions: l.lessonProgress.length,
        enrollCount,
        rate: Math.round((l.lessonProgress.length / enrollCount) * 100),
      }))
    );
  });

  const lowLessons = lessonStats
    .filter((l) => l.enrollCount >= 2)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 8);

  // ── Quiz pass rates ─────────────────────────────────────────────────────
  const quizStats = quizzes
    .filter((q) => q.attempts.length > 0)
    .map((q) => {
      const total = q.attempts.length;
      const passed = q.attempts.filter((a) => a.passed).length;
      const passRate = Math.round((passed / total) * 100);
      return { ...q, total, passed, passRate };
    })
    .sort((a, b) => a.passRate - b.passRate);

  const lowQuizzes = quizStats.slice(0, 6);
  const highQuizzes = quizStats.slice(-4).reverse();

  // ── School summary ──────────────────────────────────────────────────────
  const schoolSummary = schools
    .map((s) => ({
      ...s,
      totalEnrollments: s.courses.reduce((sum, c) => sum + c._count.enrollments, 0),
    }))
    .sort((a, b) => b.totalEnrollments - a.totalEnrollments);

  const maxSchoolEnroll = schoolSummary[0]?.totalEnrollments ?? 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Content Insights</h1>
        <p className="text-[#6b6459] mt-1">Completion rates, pass rates, and engagement signals across all content</p>
      </div>

      {/* ── Schools overview ──────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e2ddd5] rounded-[16px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-5">Schools by Total Enrollment</h2>
        {schoolSummary.length === 0 ? (
          <p className="text-sm text-[#6b6459] text-center py-4">No enrollment data yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schoolSummary.map((s) => (
              <div key={s.id} className="rounded-[12px] p-4 border border-[#e2ddd5]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1a1a1a] leading-snug">{s.name}</p>
                    <p className="text-[11px] text-[#8a7a6a]">{s.courses.length} courses</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-[#f0ece4] overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(4, (s.totalEnrollments / maxSchoolEnroll) * 100)}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
                <p className="text-right">
                  <span className="font-playfair font-bold text-[18px]" style={{ color: s.color }}>
                    {s.totalEnrollments.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#8a7a6a] ml-1">enrollments</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Top courses + low completion ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0ece4]">
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Most Enrolled Courses</h2>
          </div>
          {topCourses.length === 0 ? (
            <p className="px-6 py-8 text-sm text-center text-[#6b6459]">No enrollments yet.</p>
          ) : (
            <div className="divide-y divide-[#f5f1ea]">
              {topCourses.map((c) => (
                <div key={c.id} className="px-6 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-0.5" style={{ color: c.school.color }}>
                      {c.school.icon} {c.school.name.replace("School of ", "")}
                    </p>
                    <p className="text-[13px] font-medium text-[#1a1a1a] leading-snug truncate">{c.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[16px] font-bold" style={{ color: c.school.color }}>{c.enrollCount}</p>
                    <p className="text-[10px] text-[#8a7a6a]">enrolled</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0ece4]">
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Lowest Course Completion</h2>
            <p className="text-[11px] text-[#8a7a6a] mt-0.5">Average progress % across enrolled students</p>
          </div>
          {lowCompletionCourses.length === 0 ? (
            <p className="px-6 py-8 text-sm text-center text-[#6b6459]">No data yet.</p>
          ) : (
            <div className="divide-y divide-[#f5f1ea]">
              {lowCompletionCourses.map((c) => (
                <div key={c.id} className="px-6 py-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[13px] font-medium text-[#1a1a1a] leading-snug truncate pr-3">{c.title}</p>
                    <span
                      className="text-[13px] font-bold flex-shrink-0"
                      style={{ color: c.avgProgress < 30 ? "#c0392b" : c.avgProgress < 60 ? "#c9923a" : "#4a7c59" }}
                    >
                      {c.avgProgress}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#f0ece4] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(2, c.avgProgress)}%`,
                        backgroundColor: c.avgProgress < 30 ? "#c0392b" : c.avgProgress < 60 ? "#c9923a" : "#4a7c59",
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-[#8a7a6a] mt-1">{c.enrollCount} students enrolled</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Lesson completion ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0ece4]">
          <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Lessons with Lowest Completion</h2>
          <p className="text-[11px] text-[#8a7a6a] mt-0.5">
            Completions ÷ course enrollments — these lessons may need clarity improvements
          </p>
        </div>
        {lowLessons.length === 0 ? (
          <p className="px-6 py-8 text-sm text-center text-[#6b6459]">No lesson data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0ece4]" style={{ backgroundColor: "#faf8f4" }}>
                  {["Lesson", "Course", "Completions", "Enrollment", "Rate"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7a6a] px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lowLessons.map((l) => (
                  <tr key={l.id} className="border-b border-[#f5f1ea] last:border-0">
                    <td className="px-5 py-3 text-[13px] font-medium text-[#1a1a1a] max-w-[200px]">
                      <span className="line-clamp-2">{l.title}</span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-0.5" style={{ color: l.schoolColor }}>
                        {l.schoolName}
                      </p>
                      <p className="text-[12px] text-[#6b6459] truncate max-w-[160px]">{l.courseName}</p>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-[#1a1a1a]">{l.completions}</td>
                    <td className="px-5 py-3 text-[13px] text-[#1a1a1a]">{l.enrollCount}</td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[13px] font-bold"
                        style={{ color: l.rate < 30 ? "#c0392b" : l.rate < 60 ? "#c9923a" : "#4a7c59" }}
                      >
                        {l.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Quiz pass rates ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0ece4]">
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Lowest Quiz Pass Rates</h2>
            <p className="text-[11px] text-[#8a7a6a] mt-0.5">Quizzes where students are struggling</p>
          </div>
          {lowQuizzes.length === 0 ? (
            <p className="px-6 py-8 text-sm text-center text-[#6b6459]">No quiz attempts yet.</p>
          ) : (
            <div className="divide-y divide-[#f5f1ea]">
              {lowQuizzes.map((q) => (
                <div key={q.id} className="px-6 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1a1a] leading-snug truncate">{q.title}</p>
                    {q.course && (
                      <p className="text-[11px] mt-0.5" style={{ color: q.course.school.color }}>
                        {q.course.school.name.replace("School of ", "")} · {q.course.title}
                      </p>
                    )}
                    <p className="text-[10px] text-[#8a7a6a] mt-0.5">{q.total} attempts</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className="font-playfair font-bold text-[20px] leading-none"
                      style={{ color: q.passRate < 50 ? "#c0392b" : q.passRate < 70 ? "#c9923a" : "#4a7c59" }}
                    >
                      {q.passRate}%
                    </span>
                    <p className="text-[10px] text-[#8a7a6a]">pass rate</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0ece4]">
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Highest Quiz Pass Rates</h2>
            <p className="text-[11px] text-[#8a7a6a] mt-0.5">Where students are excelling</p>
          </div>
          {highQuizzes.length === 0 ? (
            <p className="px-6 py-8 text-sm text-center text-[#6b6459]">No quiz attempts yet.</p>
          ) : (
            <div className="divide-y divide-[#f5f1ea]">
              {highQuizzes.map((q) => (
                <div key={q.id} className="px-6 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1a1a] leading-snug truncate">{q.title}</p>
                    {q.course && (
                      <p className="text-[11px] mt-0.5" style={{ color: q.course.school.color }}>
                        {q.course.school.name.replace("School of ", "")}
                      </p>
                    )}
                    <p className="text-[10px] text-[#8a7a6a] mt-0.5">{q.total} attempts</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-playfair font-bold text-[20px] leading-none text-[#4a7c59]">
                      {q.passRate}%
                    </span>
                    <p className="text-[10px] text-[#8a7a6a]">pass rate</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
