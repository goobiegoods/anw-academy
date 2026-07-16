import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkAndAwardCertifications } from "@/lib/certifications";
import { formatDate } from "@/lib/utils";
import AcademySeal from "@/components/ui/academy-seal";

export const dynamic = "force-dynamic";

const FOREST = "#1C3327";

export default async function CertificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="text-center py-24">
        <h1 className="font-playfair text-2xl font-bold text-[#1a1a1a]">Certifications</h1>
        <p className="text-[#6b6459] mt-2 text-sm">
          <Link href="/login" className="text-[#4a7c59] font-medium">Sign in</Link> to view your certifications.
        </p>
      </div>
    );
  }

  // Award anything newly earned before rendering
  await checkAndAwardCertifications(user.id);

  const [profile, certifications, studentCerts, approvedCaseStudies] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId: user.id } }),
    prisma.certification.findMany({ orderBy: [{ level: "asc" }, { title: "asc" }] }),
    prisma.studentCertification.findMany({ where: { userId: user.id } }),
    prisma.caseStudy.count({ where: { userId: user.id, status: "approved" } }),
  ]);

  const totalWU = profile?.totalWU ?? 0;
  const byCertId = new Map(studentCerts.map((sc) => [sc.certificationId, sc]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Certifications</h1>
        <p className="text-[#6b6459] mt-1">
          Track your progress toward the Academy&apos;s eight certifications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {certifications.map((cert) => {
          const sc = byCertId.get(cert.id);
          const isAwarded = sc?.status === "awarded";
          const progress = Math.min(100, Math.round((totalWU / cert.requiredWU) * 100));

          return (
            <div
              key={cert.id}
              className="rounded-[16px] overflow-hidden flex flex-col"
              style={
                isAwarded
                  ? { backgroundColor: FOREST, border: "0.5px solid rgba(255,255,255,0.08)" }
                  : { backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }
              }
            >
              {isAwarded ? (
                <div className="flex-1 p-8 text-center flex flex-col items-center justify-center">
                  <div className="mb-3">
                    <AcademySeal size="md" variant="dark" />
                  </div>
                  <p className="font-playfair italic text-[13px] text-[#D4A94A] mb-3">
                    Diploma Awarded
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-[0.22em] font-semibold mb-2"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    Level {cert.level}
                  </p>
                  <h2 className="font-playfair text-2xl font-bold text-white leading-snug mb-2">
                    {cert.title}
                  </h2>
                  {sc?.awardedAt && (
                    <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.50)" }}>
                      Awarded {formatDate(sc.awardedAt)}
                    </p>
                  )}
                  {sc?.certificateNumber && (
                    <p className="text-[11px] font-mono mt-1" style={{ color: "rgba(212,169,74,0.7)" }}>
                      {sc.certificateNumber}
                    </p>
                  )}
                  <Link
                    href={`/dashboard/certifications/${sc?.id}/diploma`}
                    className="mt-5 bg-[#D4A94A] text-[#1C3327] font-bold text-[13px] px-6 py-2.5 rounded-xl hover:bg-[#e8c060] transition-colors"
                  >
                    View Diploma →
                  </Link>
                </div>
              ) : (
                <div className="flex-1 p-8">
                  <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#8a7a6a] mb-2">
                    Level {cert.level} · {sc ? "In Progress" : "Available"}
                  </p>
                  <h2 className="font-playfair text-2xl font-bold text-[#1a1a1a] leading-snug mb-1">
                    {cert.title}
                  </h2>
                  <p className="text-[13px] text-[#6b6459] mb-6 leading-relaxed">
                    {cert.description}
                  </p>

                  <div
                    className="h-1.5 rounded-full overflow-hidden mb-2"
                    style={{ backgroundColor: "#EDE5D5" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${progress}%`, backgroundColor: "#B98A2E" }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8a7a6a]">
                    <span>
                      {totalWU.toLocaleString()} of {cert.requiredWU.toLocaleString()} WU
                    </span>
                    <span>{progress}%</span>
                  </div>
                  {(cert.requiredCaseStudies > 0 || cert.requiredCapstone) && (
                    <p className="text-[11px] text-[#8a7a6a] mt-3">
                      Also requires:{" "}
                      {[
                        cert.requiredCaseStudies > 0
                          ? `${approvedCaseStudies}/${cert.requiredCaseStudies} approved case studies`
                          : null,
                        cert.requiredCapstone ? "an approved capstone" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              )}

              <div
                className="px-6 py-3.5 flex items-center justify-center gap-5"
                style={{
                  borderTop: isAwarded
                    ? "0.5px solid rgba(255,255,255,0.10)"
                    : "0.5px solid #DDD5C5",
                }}
              >
                <span
                  className="text-[12px]"
                  style={{ color: isAwarded ? "rgba(255,255,255,0.50)" : "#6b6459" }}
                >
                  {cert.duration}
                </span>
                <span
                  className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isAwarded ? "rgba(255,255,255,0.20)" : "#c8bfb0" }}
                />
                <span
                  className="text-[12px]"
                  style={{ color: isAwarded ? "rgba(255,255,255,0.50)" : "#6b6459" }}
                >
                  {cert.requiredWU.toLocaleString()} WU required
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-[16px] p-6"
        style={{ backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }}
      >
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-1">
          Certification Pathways
        </h2>
        <p className="text-[13px] text-[#6b6459] mb-3 leading-relaxed">
          ANW diplomas are awarded upon completing required coursework and Wellness Unit
          milestones. Every diploma is publicly verifiable.
        </p>
        <Link href="/schools" className="text-[13px] text-[#4a7c59] font-medium hover:underline">
          View all schools →
        </Link>
      </div>
    </div>
  );
}
