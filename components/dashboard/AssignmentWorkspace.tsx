"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/shared/StatusBadge";

export type AssignmentWorkspaceItem = {
  id: string;
  title: string;
  prompt: string;
  course: string;
  school: string;
  wuValue: number;
  submission: { content: string; status: string; feedback: string | null } | null;
};

function AssignmentCard({ item }: { item: AssignmentWorkspaceItem }) {
  const router = useRouter();
  const [content, setContent] = useState(item.submission?.content ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const status = item.submission?.status ?? "not_started";
  const locked = status === "submitted" || status === "under_review" || status === "approved";

  async function save(action: "draft" | "submit") {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: item.id, content, action }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error ?? "Coursework could not be saved.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Coursework could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-[18px] border border-[#ded7cb] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a7a6a]">{item.school} · {item.course}</p><h2 className="mt-2 font-playfair text-xl font-bold text-[#1C3327]">{item.title}</h2></div>
        <div className="flex items-center gap-3"><StatusBadge status={status} /><span className="text-[12px] font-semibold text-[#8a6b30]">{item.wuValue} WU after approval</span></div>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-[13px] leading-7 text-[#5f584f]">{item.prompt}</p>
      <label className="mt-5 block text-[11px] font-bold uppercase tracking-[0.13em] text-[#6b6459]" htmlFor={`assignment-${item.id}`}>Your response</label>
      <textarea id={`assignment-${item.id}`} rows={7} value={content} disabled={locked || busy} onChange={(event) => setContent(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d8d0c4] bg-[#fcfaf6] px-4 py-3 text-[13px] leading-6 focus:outline-none focus:ring-2 focus:ring-[#4a7c59] disabled:opacity-70" placeholder="Develop your response with evidence, reasoning, and reflection." />
      {item.submission?.feedback && <div className="mt-4 rounded-xl border border-[#cfe0d3] bg-[#f0f7f3] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#4a7c59]">Faculty feedback</p><p className="mt-2 text-[12px] leading-6 text-[#2d5240]">{item.submission.feedback}</p></div>}
      {error && <p role="alert" className="mt-3 text-[12px] text-red-700">{error}</p>}
      {!locked && <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => save("draft")} disabled={busy || content.trim().length === 0} className="min-h-11 rounded-xl border border-[#cfc6b8] px-5 text-[12px] font-semibold text-[#4f473f] disabled:opacity-40">Save draft</button><button type="button" onClick={() => save("submit")} disabled={busy || content.trim().length < 50} className="min-h-11 rounded-xl bg-[#1C3327] px-6 text-[12px] font-semibold text-white disabled:opacity-40">{busy ? "Saving…" : "Submit for faculty review"}</button></div>}
    </article>
  );
}

export default function AssignmentWorkspace({ items }: { items: AssignmentWorkspaceItem[] }) {
  if (items.length === 0) return <div className="rounded-[18px] border border-[#ded7cb] bg-[#F5F0E8] p-10 text-center"><h2 className="font-playfair text-xl font-bold text-[#1C3327]">No enrolled coursework is assigned</h2><p className="mt-2 text-[13px] text-[#6b6459]">Assignments appear here when they belong to one of your active courses.</p></div>;
  return <div className="space-y-4">{items.map((item) => <AssignmentCard key={item.id} item={item} />)}</div>;
}
