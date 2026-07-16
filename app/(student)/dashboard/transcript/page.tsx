import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import AcademySeal from "@/components/ui/academy-seal";
import DocumentActions from "@/components/dashboard/DocumentActions";

export const dynamic = "force-dynamic";

const PARCHMENT = "#F5F0E8";
const FOREST = "#1C3327";
const GOLD = "#D4A94A";

const SMALLCAPS = "uppercase tracking-[0.25em]";

export default async function TranscriptPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="text-center py-24">
        <h1 className="font-playfair text-2xl font-bold text-[#1a1a1a]">Official Transcript</h1>
        <p className="text-[#6b6459] mt-2 text-sm">
          <Link href="/login" className="text-[#4a7c59] font-medium">Sign in</Link> to view your transcript.
        </p>
      </div>
    );
  }

  const profile =
    user.studentProfile ??
    (await prisma.studentProfile.create({ data: { userId: user.id } }));

  const [enrollments, earnedCerts, completedProgress] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            school: { select: { id: true, name: true, order: true } },
            modules: { include: { lessons: { select: { id: true } } } },
          },
        },
      },
      orderBy: { startedAt: "asc" },
    }),
    prisma.studentCertification.findMany({
      where: { userId: user.id, status: "awarded" },
      include: { certification: true },
      orderBy: { awardedAt: "asc" },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: user.id, completed: true },
      select: { lessonId: true },
    }),
  ]);

  const completedSet = new Set(completedProgress.map((p) => p.lessonId));
  const enrollmentDate = enrollments[0]?.startedAt ?? user.createdAt;

  // Group coursework by school
  const bySchool = new Map<
    string,
    {
      name: string;
      order: number;
      rows: { title: string; level: number; hours: number; wu: number; status: string }[];
    }
  >();
  for (const e of enrollments) {
    const lessons = e.course.modules.flatMap((m) => m.lessons);
    const done = lessons.filter((l) => completedSet.has(l.id)).length;
    const status =
      lessons.length > 0 && done === lessons.length
        ? "Mastered"
        : done > 0
        ? "In Progress"
        : "Enrolled";
    const school = bySchool.get(e.course.school.id) ?? {
      name: e.course.school.name,
      order: e.course.school.order,
      rows: [],
    };
    school.rows.push({
      title: e.course.title,
      level: e.course.level,
      hours: e.course.estimatedHours,
      wu: e.course.wuValue,
      status,
    });
    bySchool.set(e.course.school.id, school);
  }
  const schoolGroups = [...bySchool.values()].sort((a, b) => a.order - b.order);

  const transcriptDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusStyle = (status: string) =>
    status === "Mastered"
      ? { color: FOREST, fontWeight: 600 }
      : status === "In Progress"
      ? { color: "#8a6b30", fontWeight: 500 }
      : { color: "#8a7a6a" };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Actions — hidden in print */}
      <div className="print:hidden flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#1a1a1a]">Official Transcript</h1>
          <p className="text-[13px] text-[#6b6459] mt-0.5">
            Your complete academic record, ready to print or share.
          </p>
        </div>
        <DocumentActions
          printLabel="Download as PDF"
          shareUrl={`/verify/${user.studentId ?? ""}`}
        />
      </div>

      {/* ── The document ─────────────────────────────────────────────── */}
      <div
        className="print-document rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.1)] overflow-hidden"
        style={{ backgroundColor: PARCHMENT, border: `1px solid rgba(212,169,74,0.35)` }}
      >
        <div className="px-8 md:px-12 py-10">
          {/* 1. Header */}
          <div className="flex flex-col items-center text-center">
            <AcademySeal size="lg" variant="gold" />
            <p
              className={`font-playfair font-bold text-[19px] ${SMALLCAPS} mt-5`}
              style={{ color: FOREST }}
            >
              The Academy of Natural Wellness
            </p>
            <p
              className={`font-playfair text-[13px] ${SMALLCAPS} mt-1.5`}
              style={{ color: "#8a6b30" }}
            >
              Official Academic Transcript
            </p>
            <div className="w-32 h-px my-6" style={{ backgroundColor: GOLD }} />
            <h1 className="font-playfair text-3xl font-bold" style={{ color: FOREST }}>
              {user.name}
            </h1>
            <div className="mt-3 space-y-0.5 text-[12.5px]" style={{ color: "#5a5348" }}>
              <p>
                Student No:{" "}
                <span className="font-mono font-semibold" style={{ color: FOREST }}>
                  {user.studentId ?? "Pending"}
                </span>
              </p>
              <p>Enrollment Date: {formatDate(enrollmentDate)}</p>
              <p>Transcript Date: {transcriptDate}</p>
            </div>
          </div>

          {/* 2. Academic Standing */}
          <div className="mt-10">
            <p className={`text-[10px] font-bold ${SMALLCAPS} mb-3`} style={{ color: "#8a6b30" }}>
              Academic Standing
            </p>
            <div className="flex items-center gap-3">
              <AcademySeal size="sm" variant="gold" />
              <p className="font-playfair text-xl font-bold" style={{ color: FOREST }}>
                Good Standing
              </p>
            </div>
          </div>

          {/* 3. Certifications Earned */}
          <div className="mt-10">
            <p className={`text-[10px] font-bold ${SMALLCAPS} mb-3`} style={{ color: "#8a6b30" }}>
              Certifications Earned
            </p>
            {earnedCerts.length === 0 ? (
              <p className="text-[13px] italic" style={{ color: "#8a7a6a" }}>
                No certifications awarded yet — coursework in progress.
              </p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ borderBottom: `1.5px solid ${FOREST}` }}>
                    {["Certification", "Date Awarded", "Certificate No.", "Status"].map((h) => (
                      <th
                        key={h}
                        className="py-2 pr-4 text-[10px] uppercase tracking-[0.14em] font-bold"
                        style={{ color: FOREST }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {earnedCerts.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "0.5px solid rgba(138,107,48,0.25)" }}>
                      <td className="py-2.5 pr-4 text-[13px] font-medium" style={{ color: "#2a2620" }}>
                        {c.certification.title}
                      </td>
                      <td className="py-2.5 pr-4 text-[12.5px]" style={{ color: "#5a5348" }}>
                        {c.awardedAt ? formatDate(c.awardedAt) : "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-[12px] font-mono" style={{ color: "#5a5348" }}>
                        {c.certificateNumber ?? "—"}
                      </td>
                      <td className="py-2.5">
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={{
                            backgroundColor: "rgba(28,51,39,0.08)",
                            color: FOREST,
                            border: `0.5px solid rgba(28,51,39,0.25)`,
                          }}
                        >
                          Diploma Issued
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 4. Completed Coursework */}
          <div className="mt-10">
            <p className={`text-[10px] font-bold ${SMALLCAPS} mb-3`} style={{ color: "#8a6b30" }}>
              Coursework
            </p>
            {schoolGroups.length === 0 ? (
              <p className="text-[13px] italic" style={{ color: "#8a7a6a" }}>
                No coursework on record yet.
              </p>
            ) : (
              schoolGroups.map((school) => (
                <div key={school.name} className="mb-7 last:mb-0">
                  <h3
                    className="font-playfair font-bold text-[15px] mb-2"
                    style={{ color: FOREST }}
                  >
                    {school.name}
                  </h3>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ borderBottom: `1.5px solid ${FOREST}` }}>
                        {["Curriculum", "Academic Level", "Academic Hours", "WU Earned", "Status"].map(
                          (h) => (
                            <th
                              key={h}
                              className="py-2 pr-4 text-[10px] uppercase tracking-[0.12em] font-bold"
                              style={{ color: FOREST }}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {school.rows.map((row) => (
                        <tr
                          key={row.title}
                          style={{ borderBottom: "0.5px solid rgba(138,107,48,0.25)" }}
                        >
                          <td className="py-2.5 pr-4 text-[13px] font-medium" style={{ color: "#2a2620" }}>
                            {row.title}
                          </td>
                          <td className="py-2.5 pr-4 text-[12.5px]" style={{ color: "#5a5348" }}>
                            Level {row.level}
                          </td>
                          <td className="py-2.5 pr-4 text-[12.5px]" style={{ color: "#5a5348" }}>
                            {row.hours}
                          </td>
                          <td className="py-2.5 pr-4 text-[12.5px]" style={{ color: "#5a5348" }}>
                            {row.status === "Mastered" ? row.wu : "—"}
                          </td>
                          <td className="py-2.5 text-[12px]" style={statusStyle(row.status)}>
                            {row.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>

          {/* 5. WU Summary */}
          <div
            className="mt-10 rounded-lg px-6 py-4 flex items-center justify-between"
            style={{ backgroundColor: "rgba(28,51,39,0.06)", border: "0.5px solid rgba(28,51,39,0.15)" }}
          >
            <p className={`text-[10px] font-bold ${SMALLCAPS}`} style={{ color: FOREST }}>
              Academic Credits — Wellness Units (WU)
            </p>
            <p className="font-playfair text-2xl font-bold" style={{ color: FOREST }}>
              {profile.totalWU.toLocaleString()} WU
            </p>
          </div>

          {/* 6. Footer */}
          <div
            className="mt-10 pt-6 text-center"
            style={{ borderTop: "0.5px solid rgba(138,107,48,0.35)" }}
          >
            <p className="text-[12px] italic font-playfair" style={{ color: "#5a5348" }}>
              This is an official academic record of the Academy of Natural Wellness.
            </p>
            <div className="flex justify-center my-4">
              <AcademySeal size="sm" variant="gold" />
            </div>
            <p className="font-playfair italic text-[12px] tracking-[0.08em]" style={{ color: "#8a6b30" }}>
              Natura Sanat, Sapientia Docet
            </p>
            <p className="text-[11px] mt-2" style={{ color: "#8a7a6a" }}>
              Verify at anw-academy.vercel.app/verify
            </p>
            <p className={`text-[10px] ${SMALLCAPS} mt-4`} style={{ color: "#8a7a6a" }}>
              Registrar, Academy of Natural Wellness
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
