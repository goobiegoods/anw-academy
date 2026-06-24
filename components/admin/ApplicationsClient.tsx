"use client";

import { useState } from "react";

type Application = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  school: string;
  pathway: string;
  experience: string;
  motivation: string;
  status: string;
  date: string;
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under review",
  ACCEPTED: "accepted",
  WAITLISTED: "waitlisted",
  REJECTED: "rejected",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  SUBMITTED:    { bg: "rgba(44,110,138,0.10)", text: "#2c6e8a", border: "rgba(44,110,138,0.25)" },
  UNDER_REVIEW: { bg: "rgba(201,146,58,0.12)", text: "#9a6800", border: "rgba(201,146,58,0.30)" },
  ACCEPTED:     { bg: "rgba(74,124,89,0.12)",  text: "#2d5240", border: "rgba(74,124,89,0.30)" },
  WAITLISTED:   { bg: "rgba(91,79,207,0.10)",  text: "#5b4fcf", border: "rgba(91,79,207,0.25)" },
  REJECTED:     { bg: "rgba(185,60,60,0.10)",  text: "#9b3333", border: "rgba(185,60,60,0.25)" },
  DRAFT:        { bg: "rgba(107,100,89,0.10)", text: "#6b6459", border: "rgba(107,100,89,0.25)" },
};

const ALL_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "WAITLISTED", "REJECTED"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.DRAFT;
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text, border: `0.5px solid ${s.border}` }}
    >
      {STATUS_LABELS[status] ?? status.toLowerCase()}
    </span>
  );
}

export default function ApplicationsClient({ applications: initial }: { applications: Application[] }) {
  const [apps, setApps] = useState(initial);
  const [selected, setSelected] = useState<Application | null>(initial[0] ?? null);
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = apps.map((a) => (a.id === id ? { ...a, status } : a));
      setApps(updated);
      if (selected?.id === id) setSelected({ ...selected, status });
    } finally {
      setUpdating(false);
    }
  };

  if (apps.length === 0) {
    return (
      <div
        className="rounded-[20px] p-12 text-center"
        style={{ backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }}
      >
        <p className="font-playfair text-xl font-bold text-[#1a1a1a] mb-2">No applications yet</p>
        <p className="text-sm text-[#6b6459]">
          When prospective students apply, their applications will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* List */}
      <div className="space-y-3">
        {apps.map((app) => {
          const s = STATUS_COLORS[app.status] ?? STATUS_COLORS.DRAFT;
          return (
            <button
              key={app.id}
              onClick={() => setSelected(app)}
              className="w-full text-left"
            >
              <div
                className="rounded-[16px] p-4 transition-all"
                style={{
                  backgroundColor: "#FAF7F0",
                  border: selected?.id === app.id ? "1.5px solid #4a7c59" : "0.5px solid #DDD5C5",
                  boxShadow: selected?.id === app.id ? "0 0 0 3px rgba(74,124,89,0.08)" : undefined,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                    style={{ backgroundColor: "#1C3327" }}
                  >
                    {getInitials(app.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-[#1a1a1a]">{app.name}</p>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-[#6b6459] mt-0.5 truncate">{app.school} · {app.date}</p>
                    <p className="text-xs text-[#6b6459] truncate">{app.email}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected ? (
        <div
          className="rounded-[16px] p-6 sticky top-6 h-fit"
          style={{ backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }}
        >
          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold font-playfair text-lg flex-shrink-0"
              style={{ backgroundColor: "#1C3327", border: "2px solid rgba(212,169,74,0.3)" }}
            >
              {getInitials(selected.name)}
            </div>
            <div>
              <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">{selected.name}</h2>
              <p className="text-sm text-[#6b6459]">{selected.email}</p>
              {selected.location && <p className="text-sm text-[#6b6459]">{selected.location}</p>}
            </div>
          </div>

          <div className="space-y-3 mb-5 text-sm">
            {[
              ["School Interest", selected.school],
              ["Pathway", selected.pathway],
              ["Experience", selected.experience],
              selected.phone ? ["Phone", selected.phone] : null,
            ].filter(Boolean).map(([label, val]) => (
              <div key={label} className="flex gap-3">
                <span className="text-[#6b6459] w-28 flex-shrink-0">{label}</span>
                <span className="font-medium text-[#1a1a1a]">{val}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: "rgba(28,51,39,0.05)" }}>
            <p className="text-[11px] font-semibold text-[#6b6459] uppercase tracking-wider mb-2">Motivation</p>
            <p className="text-sm text-[#1a1a1a] leading-relaxed">{selected.motivation}</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-[#6b6459] uppercase tracking-wider mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={updating}
                  onClick={() => updateStatus(selected.id, s)}
                  className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-50"
                  style={
                    selected.status === s
                      ? { backgroundColor: "#1C3327", color: "#fff", borderColor: "#1C3327" }
                      : { backgroundColor: "#FAF7F0", color: "#6b6459", borderColor: "#DDD5C5" }
                  }
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded-[16px] p-8 text-center h-fit"
          style={{ backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" }}
        >
          <p className="text-sm text-[#6b6459]">Select an application to review</p>
        </div>
      )}
    </div>
  );
}
