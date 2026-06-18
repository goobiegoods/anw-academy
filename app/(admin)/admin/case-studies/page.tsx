import Avatar from "@/components/shared/Avatar";
import StatusBadge from "@/components/shared/StatusBadge";

const caseStudies = [
  { id: 1, author: "Emma Clarke", title: "Supporting Seasonal Allergies Naturally", course: "Introduction to Herbal Medicine", status: "approved", wu: 15, submittedAt: "May 28, 2026" },
  { id: 2, author: "David Okafor", title: "TCM Approach to Stress-Related Insomnia", course: "TCM Organ Systems", status: "submitted", wu: null, submittedAt: "Jun 7, 2026" },
  { id: 3, author: "Sofia Reyes", title: "Functional Nutrition for Gut Dysbiosis", course: "Gut Health Basics", status: "under_review", wu: null, submittedAt: "Jun 8, 2026" },
  { id: 4, author: "Aiden Moss", title: "Herbal Support for Stress Resilience", course: "Nervous System Herbs", status: "submitted", wu: null, submittedAt: "Jun 9, 2026" },
];

export default function AdminCaseStudiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Case Studies</h1>
        <p className="text-[#6b6459] mt-1">Review and provide feedback on student case studies</p>
      </div>

      <div className="space-y-4">
        {caseStudies.map((cs) => (
          <div key={cs.id} className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-5">
            <div className="flex items-start gap-4">
              <Avatar name={cs.author} size="sm" />
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="font-semibold text-[#1a1a1a]">{cs.title}</h2>
                    <p className="text-sm text-[#6b6459] mt-0.5">{cs.author} · {cs.course}</p>
                    <p className="text-xs text-[#6b6459] mt-0.5">Submitted {cs.submittedAt}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={cs.status} />
                    {cs.wu && <span className="text-sm font-bold text-[#c9923a]">+{cs.wu} WU</span>}
                  </div>
                </div>
                {cs.status === "submitted" && (
                  <div className="flex gap-3 mt-3">
                    <button className="bg-[#4a7c59] text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-[#2d5240]">
                      Review
                    </button>
                    <button className="border border-[#e2ddd5] text-xs text-[#6b6459] px-4 py-1.5 rounded-lg hover:bg-[#f5f1ea]">
                      View Full
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
