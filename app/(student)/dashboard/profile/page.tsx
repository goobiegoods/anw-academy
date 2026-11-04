import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getLevelTitle, formatDate } from "@/lib/utils";
import AcademySeal from "@/components/ui/academy-seal";
import ProfileForms from "@/components/dashboard/ProfileForms";

export const dynamic = "force-dynamic";

const FOREST = "#1C3327";
const GOLD = "#D4A94A";
const CARD = {
  backgroundColor: "#FAF7F0",
  border: "0.5px solid #DDD5C5",
} as const;

export default async function StudentRecordPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="text-center py-24">
        <h1 className="font-playfair text-2xl font-bold text-[#1a1a1a]">
          Student Record
        </h1>
        <p className="text-[#6b6459] mt-2 text-sm">
          <Link href="/login" className="text-[#4a7c59] font-medium">
            Sign in
          </Link>{" "}
          to view your record.
        </p>
      </div>
    );
  }

  const profile = user.studentProfile ?? {
    level: 1,
    totalWU: 0,
    bio: null,
    location: null,
  };

  const [enrollments, earnedCerts, totalCertifications] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: { course: { include: { school: true } } },
      orderBy: { startedAt: "asc" },
    }),
    prisma.studentCertification.findMany({
      where: { userId: user.id, status: "awarded" },
      include: { certification: true },
      orderBy: { awardedAt: "asc" },
    }),
    prisma.certification.count(),
  ]);

  // Primary school = the school with the most enrollments
  const schoolCounts = new Map<string, { name: string; count: number }>();
  for (const e of enrollments) {
    const key = e.course.school.id;
    const entry = schoolCounts.get(key) ?? {
      name: e.course.school.name,
      count: 0,
    };
    entry.count += 1;
    schoolCounts.set(key, entry);
  }
  const primarySchool =
    [...schoolCounts.values()].sort((a, b) => b.count - a.count)[0]?.name ??
    "Not yet enrolled";

  const enrollmentDate = enrollments[0]?.startedAt ?? user.createdAt;
  const isGraduate = earnedCerts.length > 0;
  const certTarget = totalCertifications || 8;
  const certPct = Math.min(
    100,
    Math.round((earnedCerts.length / certTarget) * 100),
  );

  const memberSince = formatDate(user.createdAt);

  const identityRows: [string, string][] = [
    ["Student No.", user.studentId ?? "Pending assignment"],
    ["Member Since", memberSince],
    ["Enrollment Date", formatDate(enrollmentDate)],
    ["Graduation Goal", "In Progress"],
    ["Primary School", primarySchool],
    [
      "Academic Level",
      `Level ${profile.level} — ${getLevelTitle(profile.level)}`,
    ],
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* ── 1. Header ─────────────────────────────────────────────────── */}
      <div className="rounded-[16px] p-6" style={CARD}>
        <div className="flex items-center gap-5 flex-wrap">
          <AcademySeal size="md" variant="dark" />
          <div className="min-w-0">
            <h1 className="font-playfair text-2xl font-bold text-[#1a1a1a]">
              {user.name}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className="text-[11px] font-semibold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "rgba(212,169,74,0.15)",
                  color: "#8a6b30",
                  border: `0.5px solid rgba(212,169,74,0.4)`,
                }}
              >
                Academic Standing: Pending Registrar Review
              </span>
              {isGraduate && (
                <span
                  className="text-[11px] font-semibold px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: FOREST }}
                >
                  ✓ Verified Graduate
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Identity block ─────────────────────────────────────────── */}
      <div className="rounded-[16px] overflow-hidden" style={CARD}>
        <div
          className="px-6 py-4"
          style={{ borderBottom: "0.5px solid #DDD5C5" }}
        >
          <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">
            Student Identity
          </h2>
        </div>
        <dl className="px-6 py-4">
          {identityRows.map(([label, value], i) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4 py-2.5"
              style={
                i < identityRows.length - 1
                  ? { borderBottom: "0.5px solid #EDE5D5" }
                  : undefined
              }
            >
              <dt className="text-[12px] uppercase tracking-[0.12em] font-semibold text-[#8a7a6a] flex-shrink-0">
                {label}
              </dt>
              <dd
                className={`text-[13.5px] text-right ${
                  label === "Student No."
                    ? "font-mono font-semibold"
                    : "font-medium"
                } text-[#1a1a1a]`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── 3. Academic Progress ──────────────────────────────────────── */}
      <div className="rounded-[16px] p-6" style={CARD}>
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-1">
          Academic Progress
        </h2>
        <p className="text-[13px] text-[#6b6459] mb-4">
          {earnedCerts.length} of {certTarget} Certifications Earned
        </p>
        <div
          className="h-2.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "#EDE5D5" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${certPct}%`, backgroundColor: GOLD }}
          />
        </div>
        <p className="text-[11px] text-[#8a7a6a] mt-2">
          {profile.totalWU.toLocaleString()} Wellness Units earned to date
        </p>
      </div>

      {/* ── 4. Certifications Earned ──────────────────────────────────── */}
      <div className="rounded-[16px] overflow-hidden" style={CARD}>
        <div
          className="px-6 py-4"
          style={{ borderBottom: "0.5px solid #DDD5C5" }}
        >
          <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">
            Certifications Earned
          </h2>
        </div>
        {earnedCerts.length > 0 ? (
          <div>
            {earnedCerts.map((cert, i) => (
              <div
                key={cert.id}
                className="px-6 py-4 flex items-center gap-4"
                style={
                  i < earnedCerts.length - 1
                    ? { borderBottom: "0.5px solid #DDD5C5" }
                    : undefined
                }
              >
                <AcademySeal size="sm" variant="gold" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[13px] text-[#1a1a1a] leading-snug">
                    {cert.certification.title}
                  </p>
                  <p className="text-[11px] text-[#8a7a6a] mt-0.5">
                    {cert.awardedAt
                      ? `Awarded ${formatDate(cert.awardedAt)}`
                      : "Awarded"}
                    {cert.certificateNumber
                      ? ` · Certificate No. ${cert.certificateNumber}`
                      : ""}
                  </p>
                </div>
                <Link
                  href={`/dashboard/certifications/${cert.id}/diploma`}
                  className="flex-shrink-0 text-[12px] font-semibold hover:underline"
                  style={{ color: "#8a6b30" }}
                >
                  View Diploma →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-6 text-center">
            <p className="text-sm text-[#6b6459] italic leading-relaxed">
              Your first certification is within reach — keep learning.
            </p>
          </div>
        )}
      </div>

      {/* ── 5. Quick links ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/transcript">
          <div
            className="rounded-[16px] p-5 h-full hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all"
            style={{ backgroundColor: FOREST }}
          >
            <p className="font-playfair font-bold text-white text-[15px]">
              View Official Transcript
            </p>
            <p
              className="text-[12px] mt-1"
              style={{ color: "rgba(243,236,218,0.6)" }}
            >
              Your complete academic record →
            </p>
          </div>
        </Link>
        <Link href="/dashboard/ai-tutor">
          <div
            className="rounded-[16px] p-5 h-full hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all"
            style={{
              backgroundColor: "rgba(212,169,74,0.15)",
              border: "0.5px solid rgba(212,169,74,0.4)",
            }}
          >
            <p
              className="font-playfair font-bold text-[15px]"
              style={{ color: "#8a6b30" }}
            >
              Consult the Scholar
            </p>
            <p className="text-[12px] text-[#8a7a6a] mt-1">
              Your AI study companion →
            </p>
          </div>
        </Link>
      </div>

      {/* ── 6. Edit personal details ──────────────────────────────────── */}
      <ProfileForms
        initialName={user.name}
        initialEmail={user.email}
        initialBio={profile.bio ?? ""}
        initialLocation={profile.location ?? ""}
      />
    </div>
  );
}
