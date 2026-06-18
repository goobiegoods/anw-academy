"use client";

import { useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";

const caseStudies = [
  {
    id: 1,
    title: "Supporting Seasonal Allergies Naturally",
    course: "Introduction to Herbal Medicine",
    status: "approved",
    wuAwarded: 15,
    feedback: "Excellent case study. Your safety considerations section was thorough and showed strong awareness of scope of practice. Your herbal recommendations were well-reasoned and historically grounded.",
    submittedAt: "2 weeks ago",
  },
];

export default function CaseStudiesPage() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", scenario: "", observations: "", wellnessSupport: "", safetyConsiderations: "", reflection: ""
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Case Studies</h1>
        <p className="text-[#6b6459] mt-1">Apply your learning to real-world wellness scenarios</p>
      </div>

      {caseStudies.map((cs) => (
        <div key={cs.id} className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
            <div>
              <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">{cs.title}</h2>
              <p className="text-sm text-[#6b6459] mt-1">{cs.course} · {cs.submittedAt}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={cs.status} />
              {cs.wuAwarded && (
                <span className="text-sm font-bold text-[#c9923a]">+{cs.wuAwarded} WU</span>
              )}
            </div>
          </div>
          {cs.feedback && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-700 mb-1">Mentor Feedback</p>
              <p className="text-sm text-green-800">{cs.feedback}</p>
            </div>
          )}
        </div>
      ))}

      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
        <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-2">Submit a New Case Study</h2>
        <p className="text-sm text-[#6b6459] mb-6">Case studies earn 10–25 WU based on depth and quality. All case studies are reviewed by ANW mentors.</p>

        {!submitting ? (
          <button
            className="bg-[#4a7c59] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2d5240] transition-colors"
            onClick={() => setSubmitting(true)}
          >
            + New Case Study
          </button>
        ) : (
          <div className="space-y-4">
            {[
              { key: "title", label: "Case Study Title", placeholder: "e.g., Supporting Seasonal Allergies Naturally" },
              { key: "scenario", label: "Client Scenario (anonymized)", placeholder: "Describe the situation, background, and wellness concern…" },
              { key: "observations", label: "Observations & Assessment", placeholder: "What did you observe or learn about the individual's current wellness status?" },
              { key: "wellnessSupport", label: "Wellness Support Provided", placeholder: "What educational information or wellness lifestyle suggestions did you share?" },
              { key: "safetyConsiderations", label: "Safety Considerations", placeholder: "What safety boundaries did you maintain? Were any referrals made?" },
              { key: "reflection", label: "Personal Reflection", placeholder: "What did you learn from this experience? What would you do differently?" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">{label} *</label>
                <textarea
                  rows={key === "title" ? 1 : 4}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-[#e2ddd5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] resize-none"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div className="flex gap-3">
              <button className="bg-[#4a7c59] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2d5240]" onClick={() => setSubmitting(false)}>
                Submit Case Study
              </button>
              <button className="border border-[#e2ddd5] text-[#6b6459] px-6 py-3 rounded-xl hover:bg-[#f5f1ea]" onClick={() => setSubmitting(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
