import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getLevelTitle, getInitials, getWUForLevel } from "@/lib/utils";
import {
  ArrowLeft, CheckCircle2, Award, FileText, MessageCircle,
  BookOpen, Coins, GraduationCap,
} from "lucide-react";

export const dynamic = "force-dynamic";

function WUIcon({ type }: { type: string }) {
  const size = 14;
  switch (type) {
    case "lesson":     return <CheckCircle2 size={size} className="text-[#4a7c59]" />;
    case "quiz":       return <Award size={size} className="text-[#c9923a]" />;
    case "assignment": return <FileText size={size} className="text-[#2c6e8a]" />;
    case "discussion": return <MessageCircle size={size} className="text-[#7a5c3a]" />;
    default:           return <BookOpen size={size} className="text-[#6b6459]" />;
  }
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      studentProfile: true,
      enrollments: {
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
      },
      wuTransactions: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      quizAttempts: {
        include: {
          quiz: {
            include: {
              course: { include: { school: { select: { name: true, color: true } } } },
            },
          },
        },
        orderBy: { attemptedAt: "desc" },
        take: 20,
      },
      certifications: {
        include: { certification: true },
      },
      lessonProgress: {
        where: { completed: true },
        select: { lessonId: true, completedAt: true },
      },
    },
  });

  if (!student || student.role !== "STUDENT") notFound();

  const profile = student.studentProfile;
  const levelData = getWUForLevel(profile?.level ?? 1);
  const wu = profile?.totalWU ?? 0;
  const level = profile?.level ?? 1;
  const completedSet = new Set(student.lessonProgress.map((p) => p.lessonId));

  const totalLessons = student.enrollments.reduce(
    (sum, e) => sum + e.course.modules.reduce((s, m) => s + m.lessons.length, 0),
    0
  );

  const levelSpan = levelData.max - levelData.min;
  const inLevel = wu - levelData.min;
  const levelPct = levelSpan > 0 ? Math.min(100, Math.round((inLevel / levelSpan) * 100)) : 100;

  const joinDate = student.createdAt.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const initials = getInitials(student.name);
  const lastActive = student.wuTransactions[0]?.createdAt;

  return (
    <div className="space-y-6">

      {/* Back */}
      <Link
        href="/admin/students"
        className="inline-flex items-center gap-2 text-[13px] font-medium text-[#4a7c59] hover:text-[#2d5240] transition-colors"
      >
        <ArrowLeft size={14} />
        All students
      </Link>

      {/* ── Student header ─────────────────────────────────────────────────── */}
      <div
        className="rounded-[20px] overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1C3327 0%, #2d5240 100%)" }}
      >
        <div className="px-7 py-6 flex items-start gap-6 flex-wrap">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-playfair font-bold text-2xl flex-shrink-0"
            style={{ backgroundColor: "rgba(212,169,74,0.20)", color: "#D4A94A", border: "2px solid rgba(212,169,74,0.35)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-playfair text-3xl font-bold text-white leading-tight">{student.name}</h1>
            <p className="text-[13px] mt-1" style={{ color: "rgba(243,236,218,0.65)" }}>{student.email}</p>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#D4A94A" }}>
                Level {level} — {getLevelTitle(level)}
              </span>
              <span className="text-[11px]" style={{ color: "rgba(243,236,218,0.50)" }}>
                Joined {joinDate}
              </span>
              {lastActive && (
                <span className="text-[11px]" style={{ color: "rgba(243,236,218,0.50)" }}>
                  Last active {lastActive.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Wellness Units", value: wu.toLocaleString(), sub: `Level ${level}`, icon: Coins, color: "#c9923a" },
          { label: "Courses", value: student.enrollments.length, sub: "enrolled", icon: BookOpen, color: "#4a7c59" },
          { label: "Lessons", value: completedSet.size, sub: `of ${totalLessons}`, icon: CheckCircle2, color: "#2c6e8a" },
          { label: "Certifications", value: student.certifications.filter(c => c.status === "awarded").length, sub: "awarded", icon: GraduationCap, color: "#5b4fcf" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-[#e2ddd5] rounded-[16px] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[#8a7a6a]">{label}</p>
                <p className="font-playfair text-3xl font-bold text-[#1a1a1a] mt-1 leading-none">{value}</p>
                <p className="text-[11px] text-[#8a7a6a] mt-0.5">{sub}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            {label === "Wellness Units" && (
              <div className="mt-3">
                <div className="h-1 rounded-full bg-[#f0ece4] overflow-hidden">
                  <div className="h-full bg-[#c9923a] rounded-full" style={{ width: `${levelPct}%` }} />
                </div>
                <p className="text-[10px] text-[#8a7a6a] mt-1">{levelPct}% to Level {level + 1}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Course enrollments ────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0ece4]">
          <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Course Enrollments</h2>
        </div>
        {student.enrollments.length === 0 ? (
          <p className="px-6 py-8 text-sm text-[#6b6459] text-center">Not enrolled in any courses.</p>
        ) : (
          <div>
            {student.enrollments.map((e, idx) => {
              const lessons = e.course.modules.flatMap((m) => m.lessons);
              const done = lessons.filter((l) => completedSet.has(l.id)).length;
              const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
              const sc = e.course.school;
              return (
                <div
                  key={e.id}
                  className="px-6 py-4 flex items-center gap-5 flex-wrap"
                  style={{ borderBottom: idx < student.enrollments.length - 1 ? "1px solid #f0ece4" : undefined }}
                >
                  <div
                    className="w-2.5 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sc.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-0.5" style={{ color: sc.color }}>
                      {sc.name.replace("School of ", "")}
                    </p>
                    <p className="text-[14px] font-semibold text-[#1a1a1a] leading-snug">{e.course.title}</p>
                    <p className="text-[11px] text-[#8a7a6a] mt-0.5">
                      {done} / {lessons.length} lessons · Started {e.startedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="w-32 flex-shrink-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold text-[#1a1a1a]">{pct}%</span>
                      {pct === 100 && (
                        <span className="text-[10px] font-semibold text-[#4a7c59]">Complete ✓</span>
                      )}
                    </div>
                    <div className="h-1.5 rounded-full bg-[#f0ece4] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: sc.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── WU History + Quiz Attempts ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* WU History */}
        <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0ece4]">
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">WU History</h2>
          </div>
          {student.wuTransactions.length === 0 ? (
            <p className="px-6 py-8 text-sm text-center text-[#6b6459]">No WU earned yet.</p>
          ) : (
            <div className="divide-y divide-[#f5f1ea]">
              {student.wuTransactions.map((tx) => (
                <div key={tx.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#f5f1ea] flex items-center justify-center flex-shrink-0">
                    <WUIcon type={tx.sourceType} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#1a1a1a] leading-snug truncate">{tx.description}</p>
                    <p className="text-[10px] text-[#8a7a6a] mt-0.5">
                      {tx.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <span className="font-playfair font-bold text-[15px] flex-shrink-0" style={{ color: "#c9923a" }}>
                    +{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Attempts */}
        <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0ece4]">
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Quiz Attempts</h2>
          </div>
          {student.quizAttempts.length === 0 ? (
            <p className="px-6 py-8 text-sm text-center text-[#6b6459]">No quiz attempts yet.</p>
          ) : (
            <div className="divide-y divide-[#f5f1ea]">
              {student.quizAttempts.map((a) => (
                <div key={a.id} className="px-5 py-3 flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                    style={{ backgroundColor: a.passed ? "#4a7c59" : "#c0392b" }}
                  >
                    {a.passed ? "✓" : "✗"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#1a1a1a] leading-snug truncate">{a.quiz.title}</p>
                    <p className="text-[10px] text-[#8a7a6a] mt-0.5">
                      {a.attemptedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className="text-[14px] font-bold leading-none"
                      style={{ color: a.passed ? "#4a7c59" : "#c0392b" }}
                    >
                      {a.score}%
                    </p>
                    <p className="text-[10px] text-[#8a7a6a] mt-0.5">{a.passed ? "Passed" : "Failed"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Certifications ─────────────────────────────────────────────────── */}
      {student.certifications.length > 0 && (
        <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0ece4]">
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Certifications</h2>
          </div>
          <div className="divide-y divide-[#f5f1ea]">
            {student.certifications.map((sc) => (
              <div key={sc.id} className="px-6 py-4 flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(212,169,74,0.12)", border: "1px solid rgba(212,169,74,0.30)" }}
                >
                  <GraduationCap size={18} style={{ color: "#c9923a" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1a1a1a] leading-snug">{sc.certification.title}</p>
                  <p className="text-[11px] text-[#8a7a6a] mt-0.5">Level {sc.certification.level}</p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                    sc.status === "awarded"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {sc.status === "awarded" ? "Awarded" : "In Progress"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
