import Link from "next/link";
import { ChevronRight, CheckCircle2, Award, FileText, MessageCircle, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getLevelTitle, getWUForLevel, getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

// ── Avatar colors cycling through brand palette ────────────────────────────────
const AVATAR_BG = ["#2d5240", "#4a7c9e", "#9b4444", "#7c5c9e", "#b87333"];

// ── Icon per WU transaction source type ───────────────────────────────────────
function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "lesson":
      return <CheckCircle2 size={14} strokeWidth={2} className="text-[#4a7c59]" />;
    case "quiz":
      return <Award size={14} strokeWidth={2} className="text-[#c9923a]" />;
    case "assignment":
      return <FileText size={14} strokeWidth={2} className="text-[#2d5282]" />;
    case "discussion":
      return <MessageCircle size={14} strokeWidth={2} className="text-[#7c5c9e]" />;
    default:
      return <BookOpen size={14} strokeWidth={2} className="text-[#6b6459]" />;
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="text-center py-24">
        <h1 className="font-playfair text-2xl font-bold text-[#1a1a1a]">Welcome to ANW</h1>
        <p className="text-[#6b6459] mt-2 text-sm">
          <Link href="/login" className="text-[#4a7c59] font-medium">Sign in</Link> to begin.
        </p>
      </div>
    );
  }

  const profile =
    user.studentProfile ??
    (await prisma.studentProfile.create({ data: { userId: user.id } }));

  // ── Parallel data fetch ────────────────────────────────────────────────────
  const [
    enrollments,
    completedProgress,
    recentTransactions,
    streakDays,
    activeCert,
    discussions,
    exams,
    communityStudents,
  ] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            school: true,
            modules: {
              orderBy: { order: "asc" },
              include: { lessons: { orderBy: { order: "asc" } } },
            },
          },
        },
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: user.id, completed: true },
      select: { lessonId: true, completedAt: true },
      orderBy: { completedAt: "desc" },
    }),
    prisma.wellnessUnitTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.wellnessUnitTransaction.findMany({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) } },
      select: { createdAt: true },
    }),
    profile.activeCertificationId
      ? prisma.certification.findUnique({ where: { id: profile.activeCertificationId } })
      : prisma.certification.findFirst({ where: { level: 3 } }),
    prisma.discussion.findMany({ take: 4, orderBy: { id: "asc" }, include: { course: true } }),
    prisma.quiz.findMany({
      where: { type: { in: ["midterm", "final"] } },
      take: 3,
      include: { course: true, school: true },
    }),
    // Only real students — no fabricated counts
    prisma.user.findMany({
      where: { role: "STUDENT", id: { not: user.id } },
      select: { name: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  // ── "Continue" banner logic ────────────────────────────────────────────────
  // Find the next uncompleted lesson in the most recently active course.
  const completedSet = new Set(completedProgress.map((p) => p.lessonId));

  type EnrolledLesson = (typeof enrollments)[0]["course"]["modules"][0]["lessons"][0];
  type EnrolledCourse = (typeof enrollments)[0]["course"];

  let continueLesson: EnrolledLesson | null = null;
  let continueCourse: EnrolledCourse | null = null;
  let continueLessonNumber = 0;
  let continueTotalLessons = 0;
  let isFirstLesson = false;

  if (completedProgress.length > 0) {
    const lastId = completedProgress[0].lessonId;
    // Identify which enrolled course the last-completed lesson belongs to
    outer: for (const e of enrollments) {
      const lessons = e.course.modules.flatMap((m) => m.lessons);
      if (lessons.some((l) => l.id === lastId)) {
        const next = lessons.find((l) => !completedSet.has(l.id));
        if (next) {
          continueLesson = next;
          continueCourse = e.course;
          continueLessonNumber = lessons.findIndex((l) => l.id === next.id) + 1;
          continueTotalLessons = lessons.length;
        }
        break outer;
      }
    }
    // That course may be fully complete — find the first incomplete lesson in any course
    if (!continueLesson) {
      for (const e of enrollments) {
        const lessons = e.course.modules.flatMap((m) => m.lessons);
        const next = lessons.find((l) => !completedSet.has(l.id));
        if (next) {
          continueLesson = next;
          continueCourse = e.course;
          continueLessonNumber = lessons.findIndex((l) => l.id === next.id) + 1;
          continueTotalLessons = lessons.length;
          break;
        }
      }
    }
  } else if (enrollments.length > 0) {
    // Brand-new student: recommend lesson 1 of their oldest enrollment
    const oldest = [...enrollments].sort(
      (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    )[0];
    const lessons = oldest.course.modules.flatMap((m) => m.lessons);
    if (lessons.length > 0) {
      continueLesson = lessons[0];
      continueCourse = oldest.course;
      continueLessonNumber = 1;
      continueTotalLessons = lessons.length;
      isFirstLesson = true;
    }
  }

  // ── Stat computations ──────────────────────────────────────────────────────
  const levelData = getWUForLevel(profile.level);
  const levelSpan = levelData.max - levelData.min;
  const inLevel = profile.totalWU - levelData.min;
  const levelPct = levelSpan > 0 ? Math.min(100, Math.round((inLevel / levelSpan) * 100)) : 100;
  const toNext = Math.max(0, levelData.max - profile.totalWU);

  const certWU = activeCert?.requiredWU ?? 500;
  const certPct = Math.min(100, Math.round((profile.totalWU / certWU) * 100));

  const streak = new Set(streakDays.map((t) => t.createdAt.toISOString().slice(0, 10))).size;

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const firstName = user.name.split(" ")[0];

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8a7a6a] mb-1.5">
            {dateStr}
          </p>
          <h1 className="font-playfair text-4xl font-bold text-[#1a1a1a] leading-tight">
            Welcome back, {firstName}.
          </h1>
        </div>

        {/* Community avatars — only rendered when real peer students exist */}
        {communityStudents.length > 0 && (
          <div className="flex items-center gap-3 pt-1 flex-shrink-0">
            <div className="flex -space-x-2">
              {communityStudents.map((s, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#faf8f4] flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: AVATAR_BG[i % AVATAR_BG.length] }}
                >
                  <span className="text-white text-[9px] font-bold tracking-wide">
                    {getInitials(s.name)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#6b6459] max-w-[160px] leading-snug">
              Join a growing community of practitioners
            </p>
          </div>
        )}
      </div>

      {/* ── CONTINUE WHERE YOU LEFT OFF ─────────────────────────────────────── */}
      {continueLesson && continueCourse ? (
        <div
          className="rounded-[20px] overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1C3327 0%, #2d5240 100%)" }}
        >
          <div className="px-7 py-6 flex items-center justify-between gap-6 flex-wrap">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#e8b45a] mb-2">
                {isFirstLesson ? "Start your first lesson" : "Continue where you left off"}
              </p>
              <h2 className="font-playfair text-2xl font-bold text-white leading-snug mb-1">
                {continueLesson.title}
              </h2>
              <p className="text-[13px] text-white/60">
                {continueCourse.title} · Lesson {continueLessonNumber} of {continueTotalLessons}
              </p>
            </div>
            <Link
              href={`/dashboard/courses/${continueCourse.slug}/lessons/${continueLesson.id}`}
              className="flex-shrink-0 bg-[#e8b45a] text-[#1C3327] font-bold text-[13px] px-6 py-3 rounded-xl hover:bg-[#f0c46a] transition-colors whitespace-nowrap"
            >
              {isFirstLesson ? "Start lesson →" : "Resume →"}
            </Link>
          </div>
        </div>
      ) : enrollments.length === 0 ? (
        <div
          className="rounded-[20px] overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1C3327 0%, #2d5240 100%)" }}
        >
          <div className="px-7 py-6 flex items-center justify-between gap-6 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#e8b45a] mb-2">
                Ready to begin?
              </p>
              <h2 className="font-playfair text-2xl font-bold text-white mb-1">
                Your learning journey starts here
              </h2>
              <p className="text-[13px] text-white/60">
                Explore the ANW curriculum and enroll in your first course
              </p>
            </div>
            <Link
              href="/dashboard/courses"
              className="flex-shrink-0 bg-[#e8b45a] text-[#1C3327] font-bold text-[13px] px-6 py-3 rounded-xl hover:bg-[#f0c46a] transition-colors whitespace-nowrap"
            >
              Browse courses →
            </Link>
          </div>
        </div>
      ) : null}

      {/* ── STAT CARDS ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Wellness Units — dark green filled */}
        <div
          className="rounded-2xl p-6 flex flex-col justify-between"
          style={{ background: "linear-gradient(150deg, #1C3327 0%, #253d30 100%)" }}
        >
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#e8b45a] mb-3">
            Wellness Units
          </p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-playfair text-5xl font-bold text-white">{profile.totalWU}</span>
            <span className="text-[#e8b45a] text-sm font-medium">WU</span>
          </div>
          <div>
            <div className="h-1.5 rounded-full bg-white/20 overflow-hidden mb-2">
              <div
                className="h-full bg-[#e8b45a] rounded-full"
                style={{ width: `${levelPct}%` }}
              />
            </div>
            <p className="text-[11px] text-white/50">
              {toNext > 0
                ? `${toNext} WU to Level ${profile.level + 1} · ${getLevelTitle(profile.level + 1)}`
                : `Level ${profile.level} — ${getLevelTitle(profile.level)}`}
            </p>
          </div>
        </div>

        {/* Certification Path — white */}
        <div className="bg-white border border-[#e2ddd5] rounded-2xl p-6 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#c9923a] mb-3">
              Certification Path
            </p>
            <p className="font-playfair font-bold text-[#1a1a1a] text-lg leading-snug mb-1">
              {activeCert?.title ?? "Natural Wellness Practitioner"}
            </p>
            <p className="text-[12px] text-[#6b6459] mb-4 leading-relaxed">
              A recognized credential upon completion
            </p>
          </div>
          <div>
            <div className="h-1.5 rounded-full bg-[#f0ece4] overflow-hidden mb-2">
              <div className="h-full bg-[#c9923a] rounded-full" style={{ width: `${certPct}%` }} />
            </div>
            <p className="text-[11px] text-[#8a7a6a]">
              {profile.totalWU} of {certWU} WU earned
            </p>
          </div>
        </div>

        {/* Activity Streak — white */}
        <div className="bg-white border border-[#e2ddd5] rounded-2xl p-6 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#c9923a] mb-3">
            Activity Streak
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-playfair text-5xl font-bold text-[#1a1a1a]">{streak}</span>
            <span className="text-[#6b6459] text-sm">{streak === 1 ? "day" : "days"}</span>
          </div>
          <p className="text-[12px] text-[#6b6459]">
            {streak >= 7
              ? "Outstanding — a full week of learning."
              : streak >= 3
              ? "Keep the momentum going."
              : streak >= 1
              ? "Good start — consistency builds mastery."
              : "Complete a lesson to start your streak."}
          </p>
        </div>
      </div>

      {/* ── ANW SCHOLAR BANNER — purple, distinct from green Continue ───────── */}
      <Link href="/dashboard/ai-tutor">
        <div
          className="rounded-[20px] px-7 py-6 hover:shadow-[0_8px_32px_rgba(42,36,84,0.3)] transition-shadow"
          style={{ background: "linear-gradient(135deg, #2A2454 0%, #3C3489 100%)" }}
        >
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#a89de8] mb-2">
                AI Learning Companion
              </p>
              <h2 className="font-playfair text-2xl font-bold text-white mb-1">
                Ask the ANW Scholar
              </h2>
              <p className="text-[13px] text-white/65 max-w-md leading-relaxed">
                Stuck on a concept? Your Scholar draws from the full ANW curriculum — ask anything,
                anytime.
              </p>
            </div>
            <span className="flex-shrink-0 border border-[#a89de8]/40 text-white font-semibold text-[13px] px-6 py-3 rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap">
              Ask now →
            </span>
          </div>
        </div>
      </Link>

      {/* ── CONTINUE LEARNING ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">Continue Learning</h2>
          <Link href="/dashboard/courses" className="text-[13px] text-[#4a7c59] font-medium hover:underline">
            View all →
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white border border-[#e2ddd5] rounded-2xl p-10 text-center">
            <p className="font-playfair text-lg font-bold text-[#1a1a1a] mb-2">No courses yet</p>
            <p className="text-[13px] text-[#6b6459] mb-5 max-w-sm mx-auto leading-relaxed">
              Explore the ANW curriculum and enroll in your first course to start earning Wellness
              Units.
            </p>
            <Link
              href="/dashboard/courses"
              className="inline-flex items-center gap-2 bg-[#2d5240] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1e3a2d] transition-colors"
            >
              Browse courses
              <ChevronRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrollments.map((e) => {
              const lessons = e.course.modules.flatMap((m) => m.lessons);
              const doneCount = lessons.filter((l) => completedSet.has(l.id)).length;
              const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
              const nextLesson = lessons.find((l) => !completedSet.has(l.id));
              const schoolColor = e.course.school.color;
              return (
                <Link key={e.id} href={`/dashboard/courses/${e.course.slug}`}>
                  <div className="bg-white border border-[#e2ddd5] rounded-[16px] overflow-hidden hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all h-full">
                    <div className="flex h-full">
                      {/* Colored left border matching school */}
                      <div className="w-1 flex-shrink-0" style={{ backgroundColor: schoolColor }} />
                      <div className="flex-1 p-5 flex flex-col">
                        <p className="text-[11px] text-[#9a9088] mb-1">
                          {e.course.school.name.replace("School of ", "")}
                        </p>
                        <h3 className="font-playfair font-bold text-[#1a1a1a] text-[15px] leading-snug mb-3 flex-1">
                          {e.course.title}
                        </h3>
                        <div className="h-1.5 rounded-full bg-[#f0ece4] overflow-hidden mb-1.5">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: schoolColor }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#9a9088] mb-3">
                          <span>{pct}% complete</span>
                          <span>{doneCount}/{lessons.length} lessons</span>
                        </div>
                        {nextLesson ? (
                          <p className="text-[12px] text-[#1a1a1a] border-t border-[#f0ece4] pt-3 line-clamp-1">
                            <span className="text-[#9a9088]">Next: </span>
                            {nextLesson.title}
                          </p>
                        ) : (
                          <p className="text-[12px] text-[#4a7c59] font-medium border-t border-[#f0ece4] pt-3">
                            ✓ Course complete
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── THIS WEEK + RECENT ACTIVITY ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* This Week — shaded parchment background */}
        <div className="bg-[#f7f5f1] rounded-2xl p-6">
          <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-4">This Week</h2>

          {discussions.length === 0 && exams.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-[13px] text-[#8a7a6a] leading-relaxed">
                No upcoming items — enjoy some free study time, or explore a new lesson.
              </p>
            </div>
          ) : (
            <div>
              {discussions.slice(0, 3).map((d) => (
                <Link
                  key={d.id}
                  href={`/dashboard/discussions/${d.id}`}
                  className="flex items-center gap-3 py-3 border-b border-[#e8e3db] last:border-0 group"
                >
                  <span className="w-2 h-2 rounded-full bg-[#c9923a] flex-shrink-0" />
                  {/* Fixed-width label ensures consistent row height regardless of text */}
                  <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#c9923a] w-[58px] flex-shrink-0">
                    Discuss
                  </span>
                  <span className="flex-1 text-[13px] text-[#1a1a1a] group-hover:text-[#4a7c59] leading-snug line-clamp-1 min-w-0">
                    {d.title}
                  </span>
                  <ChevronRight size={14} strokeWidth={2} className="text-[#b0a898] flex-shrink-0" />
                </Link>
              ))}
              {exams.slice(0, 2).map((x) => (
                <Link
                  key={x.id}
                  href={`/dashboard/exams/${x.id}`}
                  className="flex items-center gap-3 py-3 border-b border-[#e8e3db] last:border-0 group"
                >
                  <span className="w-2 h-2 rounded-full bg-[#2d5282] flex-shrink-0" />
                  <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#2d5282] w-[58px] flex-shrink-0">
                    Exam
                  </span>
                  <span className="flex-1 text-[13px] text-[#1a1a1a] group-hover:text-[#4a7c59] leading-snug line-clamp-1 min-w-0">
                    {x.title}
                  </span>
                  <ChevronRight size={14} strokeWidth={2} className="text-[#b0a898] flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity — icon per type, WU serif right-aligned */}
        <div className="bg-white border border-[#e2ddd5] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Recent Activity</h2>
            <Link href="/dashboard/wellness-units" className="text-[12px] text-[#4a7c59] font-medium hover:underline">
              View all
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-[13px] text-[#8a7a6a] leading-relaxed">
                No activity yet — complete your first lesson to earn Wellness Units.
              </p>
            </div>
          ) : (
            <div>
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-3 border-b border-[#f0ece4] last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-[#f5f1ea] flex items-center justify-center flex-shrink-0">
                    <ActivityIcon type={tx.sourceType} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#1a1a1a] leading-snug line-clamp-1">
                      {tx.description}
                    </p>
                    <p className="text-[11px] text-[#9a9088] mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="font-playfair font-bold text-[#c9923a] text-[15px] whitespace-nowrap flex-shrink-0">
                    +{tx.amount} WU
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
