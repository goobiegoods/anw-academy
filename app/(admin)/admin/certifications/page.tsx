import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminCertificationsPage() {
  await requireAdmin();

  const certifications = await prisma.certification.findMany({
    orderBy: { level: "asc" },
    include: {
      studentCerts: {
        select: { status: true },
      },
    },
  });

  const totalAwarded = certifications.reduce(
    (sum, c) => sum + c.studentCerts.filter((s) => s.status === "awarded").length,
    0
  );
  const totalInProgress = certifications.reduce(
    (sum, c) => sum + c.studentCerts.filter((s) => s.status === "in_progress").length,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Certifications</h1>
          <p className="text-[#6b6459] mt-1">
            {certifications.length} certification levels · {totalAwarded} awarded · {totalInProgress} in progress
          </p>
        </div>
      </div>

      {totalAwarded === 0 && totalInProgress === 0 && (
        <div
          className="rounded-[16px] px-6 py-4 flex items-center gap-3"
          style={{ backgroundColor: "rgba(212,169,74,0.08)", border: "0.5px solid rgba(212,169,74,0.30)" }}
        >
          <span style={{ color: "#D4A94A" }}>✦</span>
          <p className="text-sm text-[#6b6459]">
            No students have earned or started a certification pathway yet. Counts will update as students progress.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {certifications.map((cert) => {
          const awarded = cert.studentCerts.filter((s) => s.status === "awarded").length;
          const inProgress = cert.studentCerts.filter((s) => s.status === "in_progress").length;

          return (
            <div
              key={cert.id}
              className="rounded-[16px] p-5"
              style={{ backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold font-playfair text-white flex-shrink-0"
                  style={{ backgroundColor: "#1C3327" }}
                >
                  {cert.level}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="font-playfair font-bold text-[#1a1a1a]">{cert.title}</h2>
                      <p className="text-xs text-[#6b6459] mt-0.5">
                        Level {cert.level} · ✦ {cert.requiredWU.toLocaleString()} WU required · {cert.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-playfair text-2xl font-bold" style={{ color: "#4a7c59" }}>
                        {awarded}
                      </p>
                      <p className="text-xs text-[#6b6459]">awarded</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-6 text-sm">
                    <div>
                      <span className="font-semibold" style={{ color: "#c9923a" }}>{inProgress}</span>
                      <span className="text-[#6b6459] ml-1">in progress</span>
                    </div>
                    <div>
                      <span className="font-semibold" style={{ color: "#4a7c59" }}>{awarded}</span>
                      <span className="text-[#6b6459] ml-1">completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
