"use client";

import { useState } from "react";
import Avatar from "@/components/shared/Avatar";
import StatusBadge from "@/components/shared/StatusBadge";

const initialApplications = [
  { id: 1, name: "Sarah Thompson", email: "sarah.t@email.com", phone: "555-0100", location: "Portland, OR", school: "Herbal Medicine", pathway: "Personal wellness", experience: "Some personal experience", motivation: "I've been using herbs for my family for years and want to learn formally.", status: "submitted", date: "Jun 9, 2026" },
  { id: 2, name: "Marcus Williams", email: "mwilliams@email.com", phone: "555-0101", location: "Chicago, IL", school: "Traditional Chinese Medicine", pathway: "Community wellness education", experience: "Self-taught knowledge", motivation: "TCM changed my life and I want to share it with my community.", status: "under_review", date: "Jun 9, 2026" },
  { id: 3, name: "Priya Nair", email: "priya.n@email.com", phone: "555-0102", location: "Austin, TX", school: "Functional Wellness", pathway: "Building a professional practice", experience: "Professional background", motivation: "As a yoga instructor, I want to deepen my nutrition knowledge.", status: "accepted", date: "Jun 8, 2026" },
  { id: 4, name: "James Chen", email: "jchen@email.com", phone: "555-0103", location: "Boston, MA", school: "Homeopathic Studies", pathway: "Academic and research interest", experience: "Complete beginner", motivation: "Academically curious about homeopathic philosophy.", status: "rejected", date: "Jun 7, 2026" },
  { id: 5, name: "Luna Rivera", email: "luna.r@email.com", phone: "555-0104", location: "Miami, FL", school: "Practice Building", pathway: "Building a professional practice", experience: "Experienced self-learner", motivation: "I want to structure my existing wellness coaching into a formal practice.", status: "waitlisted", date: "Jun 6, 2026" },
];

const statuses = ["submitted", "under_review", "accepted", "waitlisted", "rejected"];

export default function ApplicationsPage() {
  const [apps, setApps] = useState(initialApplications);
  const [selected, setSelected] = useState<typeof initialApplications[0] | null>(null);

  const updateStatus = (id: number, status: string) => {
    setApps(apps.map((a) => (a.id === id ? { ...a, status } : a)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Applications</h1>
        <p className="text-[#6b6459] mt-1">Review and manage admission applications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {apps.map((app) => (
            <div
              key={app.id}
              className={`bg-white border rounded-[16px] shadow-card p-4 cursor-pointer transition-all hover:shadow-card-hover ${selected?.id === app.id ? "border-[#4a7c59]" : "border-[#e2ddd5]"}`}
              onClick={() => setSelected(app)}
            >
              <div className="flex items-start gap-3">
                <Avatar name={app.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-[#1a1a1a]">{app.name}</p>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-[#6b6459] mt-0.5">{app.school} · {app.date}</p>
                  <p className="text-xs text-[#6b6459] truncate">{app.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selected ? (
          <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6 sticky top-6">
            <div className="flex items-start gap-4 mb-5">
              <Avatar name={selected.name} size="lg" />
              <div>
                <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">{selected.name}</h2>
                <p className="text-sm text-[#6b6459]">{selected.email}</p>
                <p className="text-sm text-[#6b6459]">{selected.location}</p>
              </div>
            </div>

            <div className="space-y-3 mb-5 text-sm">
              <div className="flex gap-3">
                <span className="text-[#6b6459] w-28 flex-shrink-0">School Interest</span>
                <span className="font-medium text-[#1a1a1a]">{selected.school}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-[#6b6459] w-28 flex-shrink-0">Pathway</span>
                <span className="font-medium text-[#1a1a1a]">{selected.pathway}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-[#6b6459] w-28 flex-shrink-0">Experience</span>
                <span className="font-medium text-[#1a1a1a]">{selected.experience}</span>
              </div>
            </div>

            <div className="bg-[#f5f1ea] rounded-xl p-4 mb-5">
              <p className="text-xs font-semibold text-[#6b6459] mb-2">Motivation</p>
              <p className="text-sm text-[#1a1a1a]">{selected.motivation}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#6b6459] uppercase tracking-wider mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                      selected.status === s
                        ? "bg-[#4a7c59] text-white border-[#4a7c59]"
                        : "border-[#e2ddd5] text-[#6b6459] hover:bg-[#f5f1ea]"
                    }`}
                  >
                    {s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-8 text-center text-[#6b6459] h-fit">
            <p>Select an application to review</p>
          </div>
        )}
      </div>
    </div>
  );
}
