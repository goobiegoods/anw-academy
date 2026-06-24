import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getLevelTitle, getInitials } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import StudentsSearchBar from "@/components/admin/StudentsSearchBar";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function timeAgo(date: Date | null): string {
  if (!date) return "Never";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const AVATAR_BG = ["#2d5240", "#4a7c9e", "#9b4444", "#7c5c9e", "#b87333"];

async function StudentTable({ q }: { q: string }) {
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      studentProfile: true,
      _count: { select: { enrollments: true } },
      wuTransactions: {
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (students.length === 0) {
    return (
      <div className="bg-white border border-[#e2ddd5] rounded-[16px] p-10 text-center">
        <p className="font-playfair text-lg font-bold text-[#1a1a1a] mb-1">
          {q ? `No students matching "${q}"` : "No students yet"}
        </p>
        <p className="text-sm text-[#6b6459]">
          {q ? "Try a different search." : "Students will appear here once they sign up."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e2ddd5]" style={{ backgroundColor: "#faf8f4" }}>
              {["Student", "Joined", "Level", "WU", "Courses", "Last Active", ""].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7a6a] px-5 py-3 first:pl-5 last:pr-5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const profile = student.studentProfile;
              const level = profile?.level ?? 1;
              const wu = profile?.totalWU ?? 0;
              const lastActivity = student.wuTransactions[0]?.createdAt ?? null;
              const initials = getInitials(student.name);
              const avatarColor = AVATAR_BG[student.name.charCodeAt(0) % AVATAR_BG.length];

              return (
                <tr
                  key={student.id}
                  className="border-b border-[#f5f1ea] last:border-0 hover:bg-[#faf8f4] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{student.name}</p>
                        <p className="text-[11px] text-[#8a7a6a] truncate">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[#6b6459] whitespace-nowrap">
                    {student.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#1C3327" }}
                      >
                        {level}
                      </div>
                      <span className="text-[12px] text-[#6b6459] hidden xl:block">{getLevelTitle(level)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-playfair font-bold text-[15px]" style={{ color: "#c9923a" }}>
                      {wu.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-wide ml-1 text-[#c9923a]/60">WU</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#1a1a1a]">
                    {student._count.enrollments}
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[#6b6459] whitespace-nowrap">
                    {timeAgo(lastActivity)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/students/${student.id}`}
                      className="flex items-center gap-1 text-[12px] font-medium text-[#4a7c59] hover:text-[#2d5240] transition-colors"
                    >
                      View <ChevronRight size={13} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-[#f5f1ea]" style={{ backgroundColor: "#faf8f4" }}>
        <p className="text-[11px] text-[#8a7a6a]">
          {students.length.toLocaleString()} {students.length === 1 ? "student" : "students"}
          {q ? ` matching "${q}"` : " total"}
        </p>
      </div>
    </div>
  );
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q = "" } = await searchParams;

  const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Students</h1>
          <p className="text-[#6b6459] mt-1">{totalStudents.toLocaleString()} enrolled students</p>
        </div>
      </div>

      <div className="max-w-sm">
        <Suspense>
          <StudentsSearchBar defaultValue={q} />
        </Suspense>
      </div>

      <StudentTable q={q} />
    </div>
  );
}
