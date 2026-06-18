"use client";

import { useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import WUBadge from "@/components/shared/WUBadge";

const assignments = [
  { id: 1, title: "Herb Journal: Personal Plant Encounter", course: "Introduction to Herbal Medicine", school: { name: "Herbal Medicine", icon: "🌿", color: "#4a7c59" }, wu: 5, status: "submitted", due: "Submitted 3 days ago", feedback: "Excellent observational detail! Your description of chamomile's energetics was particularly insightful. +5 WU awarded." },
  { id: 2, title: "Yin/Yang Reflection Essay", course: "Yin and Yang Foundations", school: { name: "TCM", icon: "☯️", color: "#c0392b" }, wu: 5, status: "pending", due: "Due in 4 days", feedback: null },
  { id: 3, title: "7-Day Food Journal", course: "Foundations of Nutrition", school: { name: "Functional Wellness", icon: "⚡", color: "#d4882a" }, wu: 5, status: "draft", due: "Due in 8 days", feedback: null },
];

export default function AssignmentsPage() {
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [texts, setTexts] = useState<Record<number, string>>({});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Assignments</h1>
        <p className="text-[#6b6459] mt-1">Submit your coursework and track feedback</p>
      </div>

      <div className="space-y-5">
        {assignments.map((a) => (
          <div key={a.id} className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
              <div>
                <p className="text-xs text-[#6b6459] mb-1 flex items-center gap-1">
                  {a.school.icon} {a.course}
                </p>
                <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">{a.title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <StatusBadge status={a.status} />
                  <span className="text-xs text-[#6b6459]">{a.due}</span>
                </div>
              </div>
              <WUBadge value={a.wu} />
            </div>

            {a.feedback && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-green-700 mb-1">Mentor Feedback</p>
                <p className="text-sm text-green-800">{a.feedback}</p>
              </div>
            )}

            {a.status === "draft" && (
              <div>
                {submitting === a.id ? (
                  <div>
                    <textarea
                      rows={6}
                      value={texts[a.id] || ""}
                      onChange={(e) => setTexts({ ...texts, [a.id]: e.target.value })}
                      className="w-full border border-[#e2ddd5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] mb-3 resize-none"
                      placeholder="Write your assignment response here…"
                    />
                    <div className="flex gap-3">
                      <button className="bg-[#4a7c59] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#2d5240]" onClick={() => setSubmitting(null)}>
                        Submit
                      </button>
                      <button className="border border-[#e2ddd5] text-sm text-[#6b6459] px-5 py-2.5 rounded-lg hover:bg-[#f5f1ea]" onClick={() => setSubmitting(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="bg-[#4a7c59] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#2d5240] transition-colors"
                    onClick={() => setSubmitting(a.id)}
                  >
                    Write Submission
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
