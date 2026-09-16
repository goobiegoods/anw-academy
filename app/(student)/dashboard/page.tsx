import Link from "next/link";
import { ChevronRight, Bot, Network } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PARCHMENT = "#F5F0E8";
const FOREST = "#1C3327";
const GOLD = "#D4A94A";

// Rotating weekly messages from the founder — index by ISO week number
const FOUNDER_QUOTES = [
  "The wisdom in these pages has guided healers for centuries. Your work here honors that lineage.",
];

function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default async function ReadingRoomPage() {
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

  const [enrollments, completedProgress, recentDiscoveries, schools] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            school: true,
            modules: {
              orderBy: { order: "asc" },
              include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true } } },
            },
          },
        },
      },
      orderBy: { startedAt: "desc" },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: user.id, completed: true },
      select: { lessonId: true, completedAt: true },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: user.id, completed: true, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 3,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: { select: { course: { select: { title: true, slug: true } } } },
          },
        },
      },
    }),
    prisma.school.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { courses: true } } },
    }),
  ]);

  const enrolledSlugs = enrollments.map((e) => e.course.slug);
  const enrolledSchoolNames = [...new Set(enrollments.map((e) => e.course.school.name))];
  const instructors =
    enrollments.length > 0
      ? await prisma.faculty.findMany({
          where: {
            isActive: true,
            OR: [
              { coursesTaught: { hasSome: enrolledSlugs } },
              { schools: { hasSome: enrolledSchoolNames } },
            ],
          },
          orderBy: [{ isFounding: "desc" }, { joinedAt: "asc" }],
          take: 6,
        })
      : [];

  const completedSet = new Set(completedProgress.map((p) => p.lessonId));
  const completedAtByLesson = new Map(
    completedProgress.map((p) => [p.lessonId, p.completedAt] as const)
  );

  const firstName = user.name.split(" ")[0];
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const quote = FOUNDER_QUOTES[isoWeek(new Date()) % FOUNDER_QUOTES.length];

  // Courses still in progress, with per-course completion + last-studied date
  const currentStudies = enrollments
    .map((e) => {
      const lessons = e.course.modules.flatMap((m) => m.lessons);
      const doneCount = lessons.filter((l) => completedSet.has(l.id)).length;
      const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
      const lastStudied = lessons
        .map((l) => completedAtByLesson.get(l.id))
        .filter((d): d is Date => !!d)
        .sort((a, b) => b.getTime() - a.getTime())[0];
      const nextLesson = lessons.find((l) => !completedSet.has(l.id));
      return { enrollment: e, lessons, doneCount, pct, lastStudied, nextLesson };
    })
    .filter((c) => c.pct < 100);

  return (
    <div className="space-y-8">

      {/* ── 1. Greeting ─────────────────────────────────────────────────── */}
      <div>
        <h1
          className="font-playfair italic text-4xl leading-tight"
          style={{ color: FOREST }}
        >
          Welcome back, Scholar {firstName}.
        </h1>
        <p className="text-[12px] text-[#8a7a6a] mt-2 tracking-[0.04em]">
          {user.studentId ? `Student No. ${user.studentId} · ` : ""}Member Since {memberSince}
        </p>
      </div>

      {/* ── 2. From the Founder's Desk ──────────────────────────────────── */}
      <div
        className="rounded-2xl px-7 py-6"
        style={{ backgroundColor: PARCHMENT, borderLeft: `4px solid ${FOREST}` }}
      >
        <p className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-3" style={{ color: "#8a6b30" }}>
          From the Founder&apos;s Desk
        </p>
        <p className="font-playfair italic text-[17px] leading-relaxed" style={{ color: FOREST }}>
          &ldquo;{quote}&rdquo;
        </p>
        <p className="text-[12px] text-[#8a7a6a] mt-3">
          — Orel Fitch, Founder &amp; Academic Director
        </p>
      </div>

      {/* ── 3. Current Studies ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">Current Studies</h2>
          <Link href="/dashboard/courses" className="text-[13px] text-[#4a7c59] font-medium hover:underline">
            View all →
          </Link>
        </div>

        {currentStudies.length === 0 ? (
          <div className="bg-white border border-[#e2ddd5] rounded-2xl p-10 text-center">
            <p className="font-playfair text-lg font-bold text-[#1a1a1a] mb-2">
              No studies in progress
            </p>
            <p className="text-[13px] text-[#6b6459] mb-5 max-w-sm mx-auto leading-relaxed">
              Explore the curricula of the six schools and begin your studies to start earning
              Wellness Units.
            </p>
            <Link
              href="/dashboard/courses"
              className="inline-flex items-center gap-2 bg-[#2d5240] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1e3a2d] transition-colors"
            >
              Browse curricula
              <ChevronRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentStudies.map(({ enrollment: e, lessons, doneCount, pct, lastStudied, nextLesson }) => (
              <div
                key={e.id}
                className="bg-white border border-[#e2ddd5] rounded-2xl p-6 flex flex-col shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold mb-1" style={{ color: e.course.school.color }}>
                  {e.course.school.name.replace("School of ", "")}
                </p>
                <h3 className="font-playfair font-bold text-lg text-[#1a1a1a] leading-snug mb-3">
                  {e.course.title}
                </h3>
                <div className="h-1.5 rounded-full bg-[#f0ece4] overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: e.course.school.color }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#8a7a6a] mb-4">
                  <span>{doneCount}/{lessons.length} lessons completed</span>
                  <span>
                    {lastStudied
                      ? `Last studied ${lastStudied.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : "Not started yet"}
                  </span>
                </div>
                <div className="mt-auto">
                  <Link
                    href={
                      nextLesson
                        ? `/dashboard/courses/${e.course.slug}/lessons/${nextLesson.id}`
                        : `/dashboard/courses/${e.course.slug}`
                    }
                    className="inline-block text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    style={{ backgroundColor: FOREST }}
                  >
                    Resume Studies →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Human Body Atlas ──────────────────────────────────────────── */}
      <Link href="/dashboard/atlas" className="group block">
        <div className="overflow-hidden rounded-[20px] border border-[#d8d0c3] bg-white transition-shadow hover:shadow-[0_8px_28px_rgba(28,51,39,0.1)]">
          <div className="grid sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e7efe9] text-[#2d6245]">
                  <Network size={19} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9b7a38]">Academy 2.0 · New study layer</p>
                  <h2 className="font-playfair text-xl font-bold text-[#1C3327]">Human Body Atlas</h2>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-[13px] leading-6 text-[#6b6459]">
                See how anatomy, physiology, evidence, traditions, safety, labs, and the six schools connect. Begin with the lymphatic system.
              </p>
            </div>
            <div className="border-t border-[#eee8de] bg-[#f5f0e8] px-6 py-4 text-[12px] font-bold text-[#1C3327] sm:h-full sm:min-w-[190px] sm:border-l sm:border-t-0 sm:px-7 sm:py-0 sm:flex sm:items-center sm:justify-center">
              Open the Atlas <ChevronRight size={14} className="ml-1 inline transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </div>
        </div>
      </Link>

      {/* ── 5. Recent Discoveries ───────────────────────────────────────── */}
      {recentDiscoveries.length > 0 && (
        <div>
          <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-4">Recent Discoveries</h2>
          <div className="bg-white border border-[#e2ddd5] rounded-2xl overflow-hidden">
            {recentDiscoveries.map((p, i) => (
              <Link
                key={p.lessonId}
                href={`/dashboard/courses/${p.lesson.module.course.slug}/lessons/${p.lesson.id}`}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-[#faf8f4] transition-colors ${
                  i < recentDiscoveries.length - 1 ? "border-b border-[#f0ece4]" : ""
                }`}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[13px]"
                  style={{ backgroundColor: "rgba(212,169,74,0.15)", color: "#8a6b30" }}
                >
                  ❦
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-medium text-[#1a1a1a] leading-snug line-clamp-1">
                    {p.lesson.title}
                  </span>
                  <span className="block text-[11px] text-[#9a9088] mt-0.5">
                    {p.lesson.module.course.title}
                  </span>
                </span>
                <span className="text-[11px] text-[#9a9088] flex-shrink-0">
                  {p.completedAt?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. My Schools ───────────────────────────────────────────────── */}
      <div>
        <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-4">My Schools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((school) => (
            <Link key={school.id} href={`/schools/${school.slug}`}>
              <div className="bg-white border border-[#e2ddd5] rounded-2xl p-5 h-full hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">
                <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: school.color }} />
                <h3 className="font-playfair font-bold text-[15px] text-[#1a1a1a] leading-snug">
                  {school.name}
                </h3>
                <p className="text-[11px] text-[#9a9088] mt-1 mb-3">
                  {school._count.courses} {school._count.courses === 1 ? "curriculum" : "curricula"}
                </p>
                <span className="text-[12px] font-semibold" style={{ color: school.color }}>
                  Enter School →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Your Instructors ────────────────────────────────────────────── */}
      {instructors.length > 0 && (
        <div>
          <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-4">Your Instructors</h2>
          <div className="flex flex-wrap gap-4">
            {instructors.map((f) => (
              <Link key={f.id} href={`/faculty/${f.slug}`}>
                <div className="bg-white border border-[#e2ddd5] rounded-2xl px-5 py-3.5 flex items-center gap-3 hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] transition-all">
                  {f.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.photoUrl}
                      alt={f.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      style={{ border: `2px solid ${GOLD}` }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: FOREST, border: `2px solid ${GOLD}` }}
                    >
                      <span className="font-playfair font-bold text-[12px]" style={{ color: GOLD }}>
                        {f.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-[13px] font-semibold text-[#1a1a1a] leading-tight">{f.name}</p>
                    <p className="text-[11px] text-[#8a7a6a] italic">{f.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. Academy Scholar ──────────────────────────────────────────── */}
      <Link href="/dashboard/ai-tutor">
        <div
          className="rounded-[20px] px-7 py-6 hover:shadow-[0_8px_32px_rgba(28,51,39,0.3)] transition-shadow"
          style={{ background: `linear-gradient(135deg, ${FOREST} 0%, #2d5240 100%)` }}
        >
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{ backgroundColor: "rgba(212,169,74,0.2)" }}
              >
                <Bot size={20} style={{ color: GOLD }} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-1.5" style={{ color: GOLD }}>
                  The Academy Scholar
                </p>
                <h2 className="font-playfair text-2xl font-bold text-white mb-1">
                  Consult the Scholar
                </h2>
                <p className="text-[13px] text-white/65 max-w-md leading-relaxed">
                  Stuck on a concept? The Scholar draws from the full ANW curriculum — ask
                  anything, anytime.
                </p>
              </div>
            </div>
            <span className="flex-shrink-0 bg-[#D4A94A] text-[#1C3327] font-bold text-[13px] px-6 py-3 rounded-xl hover:bg-[#e8c060] transition-colors whitespace-nowrap">
              Consult now →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
