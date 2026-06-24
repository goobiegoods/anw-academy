import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import {
  Users, BookOpen, CheckCircle2, Award, GraduationCap,
  Coins, TrendingUp, UserPlus, MessageCircle, FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ActivityIcon({ type }: { type: string }) {
  const cls = "flex-shrink-0";
  const size = 14;
  switch (type) {
    case "lesson":     return <CheckCircle2 size={size} className={cls} style={{ color: "#4a7c59" }} />;
    case "quiz":       return <Award size={size} className={cls} style={{ color: "#D4A94A" }} />;
    case "assignment": return <FileText size={size} className={cls} style={{ color: "#2c6e8a" }} />;
    case "discussion": return <MessageCircle size={size} className={cls} style={{ color: "#7a5c3a" }} />;
    case "enrollment": return <BookOpen size={size} className={cls} style={{ color: "#c9923a" }} />;
    case "signup":     return <UserPlus size={size} className={cls} style={{ color: "#5b4fcf" }} />;
    default:           return <Coins size={size} className={cls} style={{ color: "#6b6459" }} />;
  }
}

export default async function AdminOverviewPage() {
  await requireAdmin();

  const oneWeekAgo = new Date(Date.now() - 7 * 86400000);

  const [
    totalStudents,
    totalEnrollments,
    totalLessonsCompleted,
    totalExamsPassed,
    totalCertsAwarded,
    wuAggregate,
    signupsThisWeek,
    recentTransactions,
    recentSignups,
    schools,
    openSupport,
    pendingCaseStudies,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.enrollment.count(),
    prisma.lessonProgress.count({ where: { completed: true } }),
    prisma.quizAttempt.count({ where: { passed: true } }),
    prisma.studentCertification.count({ where: { status: "awarded" } }),
    prisma.studentProfile.aggregate({ _avg: { totalWU: true } }),
    prisma.user.count({ where: { role: "STUDENT", createdAt: { gte: oneWeekAgo } } }),
    prisma.wellnessUnitTransaction.findMany({
      take: 30,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT", createdAt: { gte: oneWeekAgo } },
      select: { name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.school.findMany({
      select: {
        id: true, name: true, color: true, icon: true, slug: true,
        courses: { select: { _count: { select: { enrollments: true } } } },
      },
      orderBy: { order: "asc" },
    }),
    prisma.supportMessage.count({ where: { status: "open" } }),
    prisma.caseStudy.count({ where: { status: "submitted" } }),
  ]);

  const avgWU = Math.round(wuAggregate._avg.totalWU ?? 0);

  // School enrollment totals
  const schoolEnrollments = schools
    .map((s) => ({
      ...s,
      total: s.courses.reduce((sum, c) => sum + c._count.enrollments, 0),
    }))
    .sort((a, b) => b.total - a.total);

  const maxEnrollment = schoolEnrollments[0]?.total ?? 1;

  // Merge signups into activity feed
  type FeedItem = {
    key: string;
    type: string;
    description: string;
    userName: string;
    createdAt: Date;
    amount?: number;
  };

  const txFeed: FeedItem[] = recentTransactions.map((tx) => ({
    key: tx.id,
    type: tx.sourceType,
    description: tx.description,
    userName: tx.user?.name ?? "Unknown",
    createdAt: tx.createdAt,
    amount: tx.amount,
  }));

  const signupFeed: FeedItem[] = recentSignups.map((u) => ({
    key: u.email,
    type: "signup",
    description: "Joined the Academy",
    userName: u.name,
    createdAt: u.createdAt,
  }));

  const feed = [...txFeed, ...signupFeed]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 25);

  const stats = [
    { label: "Total Students",       value: totalStudents,          icon: Users,         color: "#4a7c59" },
    { label: "Total Enrollments",     value: totalEnrollments,       icon: BookOpen,      color: "#2c6e8a" },
    { label: "Lessons Completed",     value: totalLessonsCompleted,  icon: CheckCircle2,  color: "#4a7c59" },
    { label: "Exams Passed",          value: totalExamsPassed,       icon: Award,         color: "#c9923a" },
    { label: "Certifications",        value: totalCertsAwarded,      icon: GraduationCap, color: "#5b4fcf" },
    { label: "Avg WU / Student",      value: `${avgWU} WU`,          icon: Coins,         color: "#D4A94A" },
  ];

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8a7a6a] mb-1.5">
            {dateStr}
          </p>
          <h1 className="font-playfair text-4xl font-bold text-[#1a1a1a] leading-tight">
            Admin Dashboard
          </h1>
        </div>
        {/* Alert badges */}
        <div className="flex items-center gap-3 pt-1">
          {openSupport > 0 && (
            <a href="/admin/support" className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              {openSupport} open support {openSupport === 1 ? "ticket" : "tickets"}
            </a>
          )}
          {pendingCaseStudies > 0 && (
            <a href="/admin/case-studies" className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
              {pendingCaseStudies} case {pendingCaseStudies === 1 ? "study" : "studies"} pending
            </a>
          )}
        </div>
      </div>

      {/* ── Signups this week banner ─────────────────────────────────────────── */}
      <div
        className="rounded-[20px] px-7 py-5 flex items-center justify-between gap-6 flex-wrap"
        style={{ background: "linear-gradient(135deg, #1C3327 0%, #2d5240 100%)" }}
      >
        <div className="flex items-center gap-5">
          <div className="text-center">
            <p className="font-playfair text-5xl font-bold text-white leading-none">{signupsThisWeek}</p>
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold mt-1" style={{ color: "#D4A94A" }}>
              new this week
            </p>
          </div>
          <div style={{ borderLeft: "1px solid rgba(243,236,218,0.15)" }} className="pl-5">
            <p className="font-playfair text-xl font-bold text-white leading-snug">
              {signupsThisWeek > 0 ? "The Academy is growing." : "No signups this week yet."}
            </p>
            <p className="text-[13px] mt-0.5" style={{ color: "rgba(243,236,218,0.60)" }}>
              {totalStudents.toLocaleString()} total students enrolled to date
            </p>
          </div>
        </div>
        <a
          href="/admin/students"
          className="flex-shrink-0 bg-[#D4A94A] text-[#1C3327] font-bold text-[13px] px-5 py-2.5 rounded-xl hover:bg-[#e8c060] transition-colors whitespace-nowrap"
        >
          View all students →
        </a>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-[#e2ddd5] rounded-[16px] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#8a7a6a]">
                  {label}
                </p>
                <p className="font-playfair text-4xl font-bold text-[#1a1a1a] mt-2 leading-none">
                  {typeof value === "number" ? value.toLocaleString() : value}
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

      {/* ── Schools + Activity ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* School enrollment breakdown */}
        <div className="bg-white border border-[#e2ddd5] rounded-[16px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Schools by Enrollment</h2>
            <a href="/admin/content" className="text-[12px] text-[#4a7c59] font-medium hover:underline">
              Content insights →
            </a>
          </div>
          {schoolEnrollments.length === 0 ? (
            <p className="text-sm text-[#6b6459] text-center py-6">No enrollment data yet.</p>
          ) : (
            <div className="space-y-4">
              {schoolEnrollments.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0 w-7">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{s.name}</p>
                      <span className="text-[13px] font-bold ml-3 flex-shrink-0" style={{ color: s.color }}>
                        {s.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#f0ece4] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(4, (s.total / maxEnrollment) * 100)}%`,
                          backgroundColor: s.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity feed */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "#1C3327" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-playfair text-lg font-bold text-white">Platform Activity</h2>
            <TrendingUp size={16} style={{ color: "rgba(212,169,74,0.70)" }} />
          </div>

          {feed.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              No activity yet.
            </p>
          ) : (
            <div className="space-y-0">
              {feed.slice(0, 15).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 py-2.5 border-b last:border-0"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: item.type === "quiz"
                        ? "rgba(212,169,74,0.22)"
                        : "rgba(255,255,255,0.10)",
                    }}
                  >
                    <ActivityIcon type={item.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] leading-snug truncate" style={{ color: "rgba(255,255,255,0.90)" }}>
                      <span className="font-semibold">{item.userName.split(" ")[0]}</span>
                      {" "}—{" "}
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.amount && (
                      <span className="font-playfair font-bold text-[13px]" style={{ color: "#D4A94A" }}>
                        +{item.amount}
                      </span>
                    )}
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick links ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/admin/students",    label: "Manage Students",   color: "#4a7c59",  desc: `${totalStudents} total` },
          { href: "/admin/discussions", label: "Moderate Posts",    color: "#2c6e8a",  desc: "Discussion board" },
          { href: "/admin/support",     label: "Support Inbox",     color: "#c9923a",  desc: openSupport > 0 ? `${openSupport} open` : "No open tickets" },
          { href: "/admin/content",     label: "Content Insights",  color: "#5b4fcf",  desc: "Completion & pass rates" },
        ].map(({ href, label, color, desc }) => (
          <a
            key={href}
            href={href}
            className="bg-white border border-[#e2ddd5] rounded-[16px] p-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all"
          >
            <div className="w-8 h-8 rounded-lg mb-3" style={{ backgroundColor: `${color}18` }}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              </div>
            </div>
            <p className="text-[13px] font-semibold text-[#1a1a1a] leading-snug">{label}</p>
            <p className="text-[11px] text-[#8a7a6a] mt-0.5">{desc}</p>
          </a>
        ))}
      </div>

    </div>
  );
}
