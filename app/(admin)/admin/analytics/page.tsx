import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { Users, GraduationCap, Coins, TrendingUp, BookOpen, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const [
    totalStudents,
    totalWU,
    totalEnrollments,
    completedEnrollments,
    certsAwarded,
    quizAttempts,
    quizPassed,
    schools,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.wellnessUnitTransaction.aggregate({ _sum: { amount: true } }),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { progressPercent: 100 } }),
    prisma.studentCertification.count({ where: { status: "awarded" } }),
    prisma.quizAttempt.count(),
    prisma.quizAttempt.count({ where: { passed: true } }),
    prisma.school.findMany({
      orderBy: { order: "asc" },
      include: {
        courses: {
          select: {
            wuValue: true,
            enrollments: { select: { progressPercent: true } },
            quizzes: {
              select: {
                attempts: { select: { passed: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  const wuTotal = totalWU._sum.amount ?? 0;
  const completionRate = totalEnrollments > 0
    ? Math.round((completedEnrollments / totalEnrollments) * 100)
    : 0;
  const quizPassRate = quizAttempts > 0
    ? Math.round((quizPassed / quizAttempts) * 100)
    : 0;

  const schoolStats = schools.map((s) => {
    const allEnrollments = s.courses.flatMap((c) => c.enrollments);
    const allAttempts = s.courses.flatMap((c) =>
      c.quizzes.flatMap((q) => q.attempts)
    );
    const schoolEnrollments = allEnrollments.length;
    const schoolCompletions = allEnrollments.filter((e) => e.progressPercent === 100).length;
    const schoolPassed = allAttempts.filter((a) => a.passed).length;
    const schoolAttempts = allAttempts.length;
    const avgPassRate = schoolAttempts > 0
      ? Math.round((schoolPassed / schoolAttempts) * 100)
      : 0;
    return {
      id: s.id,
      name: s.name.replace("School of ", ""),
      icon: s.icon,
      color: s.color,
      enrollments: schoolEnrollments,
      completions: schoolCompletions,
      avgPassRate,
    };
  });

  const statCards = [
    { title: "Total Students",      value: totalStudents.toLocaleString(),  icon: Users,         color: "#4a7c59" },
    { title: "Total WU Awarded",    value: wuTotal.toLocaleString(),        icon: Coins,         color: "#c9923a" },
    { title: "Total Enrollments",   value: totalEnrollments.toLocaleString(), icon: BookOpen,    color: "#2c6e8a" },
    { title: "Certs Awarded",       value: certsAwarded.toLocaleString(),   icon: Award,         color: "#5b4fcf" },
    { title: "Completion Rate",     value: `${completionRate}%`,            icon: TrendingUp,    color: "#d4882a" },
    { title: "Quiz Pass Rate",      value: `${quizPassRate}%`,              icon: GraduationCap, color: "#4a7c59" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Analytics</h1>
        <p className="text-[#6b6459] mt-1">Academy-wide performance — live data</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ title, value, icon: Icon, color }) => (
          <div
            key={title}
            className="rounded-[16px] p-5"
            style={{ backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#8a7a6a]">
                  {title}
                </p>
                <p className="font-playfair text-4xl font-bold text-[#1a1a1a] mt-2 leading-none">
                  {value}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-[16px] p-6"
        style={{ backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }}
      >
        <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-5">School Breakdown</h2>
        {schoolStats.every((s) => s.enrollments === 0) ? (
          <p className="text-sm text-[#6b6459] py-4">
            No enrollment data yet across any school.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "0.5px solid #DDD5C5" }}>
                  {["School", "Enrollments", "Completions", "Quiz Pass Rate"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-semibold text-[#8a7a6a] uppercase tracking-wider px-4 py-3 first:px-0"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schoolStats.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "0.5px solid #EDE8DE" }}>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <span>{s.icon}</span>
                        <span className="font-medium text-sm text-[#1a1a1a]">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#1a1a1a]">{s.enrollments}</td>
                    <td className="px-4 py-4 text-sm text-[#1a1a1a]">{s.completions}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#ede8de] rounded-full h-1.5 w-24">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${s.avgPassRate}%`,
                              backgroundColor: "#4a7c59",
                            }}
                          />
                        </div>
                        <span className="text-sm text-[#1a1a1a]">{s.avgPassRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
