import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  submitted:    { bg: "rgba(44,110,138,0.10)",   text: "#2c6e8a", border: "rgba(44,110,138,0.25)",  label: "Submitted" },
  under_review: { bg: "rgba(201,146,58,0.12)",   text: "#9a6800", border: "rgba(201,146,58,0.30)",  label: "Under Review" },
  approved:     { bg: "rgba(74,124,89,0.12)",    text: "#2d5240", border: "rgba(74,124,89,0.30)",   label: "Approved" },
  rejected:     { bg: "rgba(185,60,60,0.10)",    text: "#9b3333", border: "rgba(185,60,60,0.25)",   label: "Rejected" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default async function AdminCaseStudiesPage() {
  await requireAdmin();

  const caseStudies = await prisma.caseStudy.findMany({
    orderBy: { submittedAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Case Studies</h1>
        <p className="text-[#6b6459] mt-1">
          {caseStudies.length === 0
            ? "No case studies submitted yet."
            : `${caseStudies.length} case ${caseStudies.length === 1 ? "study" : "studies"} submitted`}
        </p>
      </div>

      {caseStudies.length === 0 ? (
        <div
          className="rounded-[20px] p-12 text-center"
          style={{ backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(28,51,39,0.08)" }}
          >
            <FileText size={22} style={{ color: "#4a7c59" }} />
          </div>
          <p className="font-playfair text-xl font-bold text-[#1a1a1a] mb-2">No case studies yet</p>
          <p className="text-sm text-[#6b6459] max-w-sm mx-auto">
            When students submit case studies for review, they will appear here for feedback and WU awarding.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {caseStudies.map((cs) => {
            const style = STATUS_STYLES[cs.status] ?? STATUS_STYLES.submitted;
            return (
              <div
                key={cs.id}
                className="rounded-[16px] p-5"
                style={{ backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                    style={{ backgroundColor: "#1C3327" }}
                  >
                    {getInitials(cs.user.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <h2 className="font-semibold text-[#1a1a1a]">{cs.title}</h2>
                        <p className="text-sm text-[#6b6459] mt-0.5">
                          {cs.user.name} · {cs.course?.title ?? "General"}
                        </p>
                        <p className="text-xs text-[#6b6459] mt-0.5">
                          Submitted {cs.submittedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: style.bg, color: style.text, border: `0.5px solid ${style.border}` }}
                        >
                          {style.label}
                        </span>
                        {cs.wuAwarded && (
                          <span className="text-sm font-bold" style={{ color: "#c9923a" }}>
                            +{cs.wuAwarded} WU
                          </span>
                        )}
                      </div>
                    </div>
                    {cs.status === "submitted" && (
                      <div className="flex gap-3 mt-3">
                        <span className="text-xs text-[#6b6459] italic">
                          Review functionality coming soon.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
