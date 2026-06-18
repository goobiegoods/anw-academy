"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ExistingCapstone = {
  id: string;
  title: string;
  status: string;
  wuAwarded: number | null;
  mentorFeedback: string | null;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "#9a9088" },
  submitted: { label: "Submitted", color: "#c9923a" },
  under_review: { label: "Under Review", color: "#2d5282" },
  approved: { label: "Approved", color: "#4a7c59" },
  rejected: { label: "Needs Revision", color: "#b3403f" },
};

const inputClass =
  "w-full border border-[#e2ddd5] rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59] min-h-[44px]";

export default function CapstoneForm({ existing }: { existing: ExistingCapstone[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", concept: "", description: "", submission: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handle = async (action: "draft" | "submit") => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/capstone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          type: "video",
          description: `Concept taught: ${form.concept}\n\n${form.description}`,
          submission: form.submission,
          action,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setDone(true);
      setForm({ title: "", concept: "", description: "", submission: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Video Capstone Project</h1>
        <p className="text-[#6b6459] mt-1 text-sm">
          The recorded teaching project required for practitioner certification.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-[#2d5240] text-white rounded-2xl p-7">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#e8b45a] mb-3">
          The Assignment
        </p>
        <p className="text-[13.5px] text-white/85" style={{ lineHeight: 1.85 }}>
          Record a <strong>10–15 minute video</strong> teaching one concept you have learned at the
          Academy, at a depth that demonstrates genuine mastery. Choose a single idea — a remedy, a
          principle, a clinical distinction — and teach it as if to a motivated beginner: a hook,
          clear explanation, an example, and the safety or scope considerations. Upload your video
          to any host (YouTube unlisted, Vimeo, Drive) and submit the link below. A faculty mentor
          reviews every capstone; approval earns <strong>50 WU</strong>.
        </p>
      </div>

      {/* Existing submissions */}
      {existing.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Your Submissions</h2>
          {existing.map((c) => {
            const s = STATUS_LABELS[c.status] ?? STATUS_LABELS.submitted;
            return (
              <div key={c.id} className="bg-white border border-[#e2ddd5] rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#1a1a1a] text-sm">{c.title}</p>
                  <span
                    className="text-[10px] uppercase tracking-[0.12em] font-bold px-2.5 py-1 rounded-full"
                    style={{ color: s.color, backgroundColor: `${s.color}18` }}
                  >
                    {s.label}
                  </span>
                </div>
                {c.mentorFeedback && (
                  <p className="text-[12.5px] text-[#6b6459] mt-2">{c.mentorFeedback}</p>
                )}
                {c.wuAwarded != null && (
                  <p className="text-[12px] text-[#4a7c59] font-semibold mt-1">+{c.wuAwarded} WU awarded</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-[#e2ddd5] rounded-2xl p-7 space-y-5">
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">New Submission</h2>
        {done && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
            Saved. A mentor will review your submission.
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Project title</label>
          <input value={form.title} onChange={set("title")} className={inputClass} placeholder="e.g. Teaching the Energetics of Chamomile" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Which concept did you choose?</label>
          <input value={form.concept} onChange={set("concept")} className={inputClass} placeholder="The single concept your video teaches" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Description</label>
          <textarea rows={4} value={form.description} onChange={set("description")} className={inputClass} placeholder="Briefly describe your approach and what a viewer will learn." />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Video link (mp4/mov host or unlisted URL)</label>
          <input value={form.submission} onChange={set("submission")} className={inputClass} placeholder="https://…" />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handle("draft")}
            disabled={busy || !form.title}
            className="flex-1 border border-[#4a7c59] text-[#4a7c59] font-semibold py-3 rounded-full min-h-[44px] disabled:opacity-40"
          >
            Save Draft
          </button>
          <button
            onClick={() => handle("submit")}
            disabled={busy || !form.title || !form.submission}
            className="flex-1 bg-[#4a7c59] text-white font-semibold py-3 rounded-full min-h-[44px] disabled:opacity-40"
          >
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}
