import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getLevelTitle, getWUForLevel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="text-center py-24">
        <h1 className="font-playfair text-2xl font-bold text-[#1a1a1a]">Welcome to ANW</h1>
        <p className="text-[#6b6459] mt-2 text-sm">
          No student profile found.{" "}
          <Link href="/login" className="text-[#4a7c59] font-medium">Sign in</Link> to begin.
        </p>
      </div>
    );
  }

  const profile =
    user.studentProfile ??
    (await prisma.studentProfile.create({ data: { userId: user.id } }));

  const [enrollments, transactions, announcements, discussions, exams, caseStudies, activeCert] =
    await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: user.id },
        include: { course: { include: { school: true, modules: { include: { lessons: true } } } } },
        orderBy: { startedAt: "desc" },
        take: 3,
      }),
      prisma.wellnessUnitTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.announcement.findMany({
        where: { audience: { in: ["all", "student"] } },
        orderBy: { createdAt: "desc" },
        take: 2,
      }),
      prisma.discussion.findMany({ take: 3, orderBy: { id: "asc" }, include: { course: true } }),
      prisma.quiz.findMany({ where: { type: { in: ["midterm", "final"] } }, take: 3, include: { course: true, school: true } }),
      prisma.caseStudy.findMany({ where: { userId: user.id, status: { in: ["submitted", "under_review"] } } }),
      profile.activeCertificationId
        ? prisma.certification.findUnique({ where: { id: profile.activeCertificationId } })
        : prisma.certification.findFirst({ where: { level: 3 } }),
    ]);

  // Completed-lesson counts per enrolled course for accurate progress
  const allLessonIds = enrollments.flatMap((e) =>
    e.course.modules.flatMap((m) => m.lessons.map((l) => l.id))
  );
  const completed = allLessonIds.length
    ? await prisma.lessonProgress.findMany({
        where: { userId: user.id, lessonId: { in: allLessonIds }, completed: true },
      })
    : [];
  const completedSet = new Set(completed.map((c) => c.lessonId));

  const levelData = getWUForLevel(profile.level);
  const levelSpan = levelData.max - levelData.min;
  const inLevel = profile.totalWU - levelData.min;
  const levelPct = levelSpan > 0 ? Math.min(100, Math.round((inLevel / levelSpan) * 100)) : 100;
  const toNext = Math.max(0, levelData.max - profile.totalWU);

  const certWU = activeCert?.requiredWU ?? 500;
  const certPct = Math.min(100, Math.round((profile.totalWU / certWU) * 100));

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Streak: distinct days with a WU transaction in the last 7 days
  const recentTx = await prisma.wellnessUnitTransaction.findMany({
    where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    select: { createdAt: true },
  });
  const streak = new Set(recentTx.map((t) => t.createdAt.toISOString().slice(0, 10))).size;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">
          Welcome back, {user.name.split(" ")[0]}.
        </h1>
        <p className="text-[#6b6459] mt-1 text-sm">
          Level {profile.level} — {getLevelTitle(profile.level)} · {today}
        </p>
      </div>

      {/* Hero row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* WU ring */}
        <div className="bg-white border border-[#e2ddd5] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#c9923a] mb-3">
            Wellness Units
          </p>
          <div className="flex items-end gap-2 mb-3">
            <span className="font-playfair text-4xl font-bold text-[#1a1a1a]">{profile.totalWU}</span>
            <span className="text-sm text-[#c9923a] mb-1.5">WU</span>
          </div>
          <div className="h-2 rounded-full bg-[#f0ece4] overflow-hidden">
            <div className="h-full bg-[#4a7c59] rounded-full" style={{ width: `${levelPct}%` }} />
          </div>
          <p className="text-[11px] text-[#6b6459] mt-2">
            {toNext} WU to Level {profile.level + 1}
          </p>
        </div>

        {/* Cert progress */}
        <div className="bg-white border border-[#e2ddd5] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#c9923a] mb-3">
            Active Certification
          </p>
          <p className="font-playfair font-bold text-[#1a1a1a] text-base leading-snug mb-3">
            {activeCert?.title ?? "Choose a certification"}
          </p>
          <div className="h-2 rounded-full bg-[#f0ece4] overflow-hidden">
            <div className="h-full bg-[#c9923a] rounded-full" style={{ width: `${certPct}%` }} />
          </div>
          <p className="text-[11px] text-[#6b6459] mt-2">
            {certPct}% · {profile.totalWU}/{certWU} WU
          </p>
        </div>

        {/* Streak */}
        <div className="bg-white border border-[#e2ddd5] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#c9923a] mb-3">
            Activity Streak
          </p>
          <div className="flex items-end gap-2 mb-2">
            <span className="font-playfair text-4xl font-bold text-[#1a1a1a]">{streak}</span>
            <span className="text-sm text-[#6b6459] mb-1.5">day{streak === 1 ? "" : "s"}</span>
          </div>
          <p className="text-[11px] text-[#6b6459]">
            {streak > 0 ? "Keep the momentum going." : "Complete a lesson to start a streak."}
          </p>
        </div>
      </div>

      {/* Active courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">Active Courses</h2>
          <Link href="/dashboard/courses" className="text-[13px] text-[#4a7c59] font-medium hover:underline">
            View all →
          </Link>
        </div>
        {enrollments.length === 0 ? (
          <div className="bg-white border border-[#e2ddd5] rounded-2xl p-8 text-center">
            <p className="text-sm text-[#6b6459]">You are not enrolled in any courses yet.</p>
            <Link href="/dashboard/courses" className="inline-block mt-3 text-[#4a7c59] font-medium text-sm">
              Browse courses →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {enrollments.map((e) => {
              const lessons = e.course.modules.flatMap((m) => m.lessons);
              const doneCount = lessons.filter((l) => completedSet.has(l.id)).length;
              const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
              const nextLesson = lessons.find((l) => !completedSet.has(l.id));
              return (
                <Link key={e.id} href={`/dashboard/courses/${e.course.slug}`}>
                  <div className="bg-white border border-[#e2ddd5] rounded-2xl overflow-hidden hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all">
                    <div className="h-1.5" style={{ backgroundColor: e.course.school.color }} />
                    <div className="p-5">
                      <p className="text-[11px] text-[#9a9088] mb-1.5">
                        {e.course.school.name.replace("School of ", "")}
                      </p>
                      <h3 className="font-semibold text-[#1a1a1a] text-sm leading-snug mb-3">
                        {e.course.title}
                      </h3>
                      <div className="h-2 rounded-full bg-[#f0ece4] overflow-hidden mb-2">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: e.course.school.color }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#6b6459]">
                        <span>{pct}% complete</span>
                        <span>{doneCount}/{lessons.length} lessons</span>
                      </div>
                      {nextLesson && (
                        <p className="text-[11px] mt-3 pt-3 border-t border-[#f0ece4] text-[#1a1a1a]">
                          <span className="text-[#9a9088]">Next: </span>
                          {nextLesson.title}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e2ddd5] rounded-2xl p-6">
          <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-4">To Do</h2>
          <div className="space-y-3">
            {discussions.slice(0, 2).map((d) => (
              <Link key={d.id} href={`/dashboard/discussions/${d.id}`} className="flex items-start gap-3 group">
                <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-[#c9923a] bg-[#c9923a]/12 rounded px-2 py-1 mt-0.5">Discuss</span>
                <span className="flex-1 text-[13px] text-[#1a1a1a] group-hover:text-[#4a7c59] leading-snug">
                  {d.title}
                </span>
              </Link>
            ))}
            {exams.slice(0, 2).map((x) => (
              <Link key={x.id} href={`/dashboard/exams/${x.id}`} className="flex items-start gap-3 group">
                <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-[#2d5282] bg-[#2d5282]/12 rounded px-2 py-1 mt-0.5">Exam</span>
                <span className="flex-1 text-[13px] text-[#1a1a1a] group-hover:text-[#4a7c59] leading-snug">
                  {x.title}
                </span>
              </Link>
            ))}
            {caseStudies.length > 0 && (
              <div className="flex items-start gap-3">
                <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-[#4a7c59] bg-[#4a7c59]/12 rounded px-2 py-1 mt-0.5">Review</span>
                <span className="flex-1 text-[13px] text-[#6b6459] leading-snug">
                  {caseStudies.length} case stud{caseStudies.length === 1 ? "y" : "ies"} awaiting mentor review
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2ddd5] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Recent WU</h2>
            <Link href="/dashboard/wellness-units" className="text-[12px] text-[#4a7c59] font-medium hover:underline">
              View all
            </Link>
          </div>
          {transactions.length === 0 ? (
            <p className="text-[13px] text-[#9a9088]">No transactions yet. Complete a lesson to earn your first WU.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#1a1a1a] leading-snug truncate">{tx.description}</p>
                    <p className="text-[11px] text-[#9a9088]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-playfair font-bold text-[#c9923a] text-sm whitespace-nowrap">
                    +{tx.amount} WU
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div>
          <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-4">Announcements</h2>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="bg-white border border-[#e2ddd5] rounded-xl p-5">
                <h3 className="font-semibold text-[#1a1a1a] text-sm mb-1">{a.title}</h3>
                <p className="text-[13px] text-[#6b6459]" style={{ lineHeight: 1.7 }}>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI tutor shortcut */}
      <Link href="/dashboard/ai-tutor">
        <div className="rounded-2xl p-7 bg-gradient-to-br from-[#2d5240] to-[#1a2e22] text-white hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#e8b45a] mb-2">
                AI Learning Companion
              </p>
              <h3 className="font-playfair text-2xl font-bold">Ask the ANW Scholar</h3>
              <p className="text-[13px] text-white/70 mt-1.5 max-w-md">
                Your intelligent companion, drawing on the full depth of the ANW curriculum. Stuck on
                a concept? Ask anything.
              </p>
            </div>
            <span className="text-3xl">→</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
