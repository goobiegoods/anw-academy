"use client";

import { useState } from "react";
import {
  Leaf, Wind, Activity, Droplets, Users, TrendingUp,
  Clock, CheckCircle2, FileEdit, AlertCircle, ChevronRight,
} from "lucide-react";

// ── School icon system ─────────────────────────────────────────────────────────
// One consistent Lucide line-icon per school; no emoji, no mismatched styles.
type LucideIcon = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

const SCHOOL_META: Record<string, { Icon: LucideIcon; color: string }> = {
  "Herbal Medicine":           { Icon: Leaf,        color: "#4a7c59" },
  "School of Herbal Medicine": { Icon: Leaf,        color: "#4a7c59" },
  "TCM":                       { Icon: Wind,        color: "#9b4444" },
  "Traditional Chinese Medicine": { Icon: Wind,     color: "#9b4444" },
  "School of Traditional Chinese Medicine": { Icon: Wind, color: "#9b4444" },
  "Functional Wellness":       { Icon: Activity,    color: "#c9923a" },
  "School of Functional Wellness": { Icon: Activity, color: "#c9923a" },
  "Homeopathic Studies":       { Icon: Droplets,    color: "#4a7c9e" },
  "School of Homeopathic Studies": { Icon: Droplets, color: "#4a7c9e" },
  "Practice Building":         { Icon: Users,       color: "#7c5c9e" },
  "School of Practice Building": { Icon: Users,     color: "#7c5c9e" },
  "Wellness Entrepreneurship": { Icon: TrendingUp,  color: "#b87333" },
  "School of Wellness Entrepreneurship": { Icon: TrendingUp, color: "#b87333" },
};

// ── Mock data ──────────────────────────────────────────────────────────────────
type Assignment = {
  id: number;
  title: string;
  course: string;
  school: string;
  wu: number;
  status: "pending" | "draft" | "submitted";
  dueLabel: string;
  feedback?: string | null;
};

const ALL_ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    title: "Yin/Yang Reflection Essay",
    course: "Yin and Yang Foundations",
    school: "TCM",
    wu: 8,
    status: "pending",
    dueLabel: "Due in 2 days",
    feedback: null,
  },
  {
    id: 2,
    title: "Herb Journal: Personal Plant Encounter",
    course: "Introduction to Herbal Medicine",
    school: "Herbal Medicine",
    wu: 5,
    status: "pending",
    dueLabel: "Due in 6 days",
    feedback: null,
  },
  {
    id: 3,
    title: "7-Day Food Journal",
    course: "Foundations of Nutrition",
    school: "Functional Wellness",
    wu: 5,
    status: "draft",
    dueLabel: "Due in 10 days",
    feedback: null,
  },
  {
    id: 4,
    title: "Doctrine of Signatures Reflection",
    course: "Plant Philosophy & History",
    school: "Herbal Medicine",
    wu: 5,
    status: "submitted",
    dueLabel: "Submitted 3 days ago",
    feedback:
      "Excellent observational detail — your description of chamomile's energetics was particularly insightful. The connection you drew between morphology and therapeutic action shows real botanical intuition developing. +5 WU awarded.",
  },
];

// ── Shared sub-components ──────────────────────────────────────────────────────

function SchoolChip({ school }: { school: string }) {
  const meta = SCHOOL_META[school];
  if (!meta) return <span className="text-[11.5px] text-[#6b6459]">{school}</span>;
  const { Icon, color } = meta;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: `${color}40`, backgroundColor: `${color}12` }}
    >
      <Icon size={11} strokeWidth={2} />
      {school}
    </span>
  );
}

function DueDateChip({ label }: { label: string }) {
  const m = label.match(/Due in (\d+) day/);
  if (!m) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-[#4a7c59] font-medium">
        <CheckCircle2 size={12} strokeWidth={2} />
        {label}
      </span>
    );
  }
  const days = parseInt(m[1]);
  if (days <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-[#fff0f0] text-[#c0392b] border border-[#f5c0c0]">
        <AlertCircle size={11} strokeWidth={2.5} />
        Due in {days} {days === 1 ? "day" : "days"}
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-[#fff8ed] text-[#b87333] border border-[#f0d090]">
        <Clock size={11} strokeWidth={2.5} />
        Due in {days} days
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11.5px] font-medium px-2.5 py-1 rounded-full bg-[#f5f1ea] text-[#6b6459] border border-[#e2ddd5]">
      <Clock size={11} strokeWidth={2} />
      Due in {days} days
    </span>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="font-playfair text-lg font-bold text-[#2d5240] whitespace-nowrap">{label}</h2>
      <span className="text-[11px] font-semibold text-[#6b6459] bg-[#ece8e0] px-2 py-0.5 rounded-full">
        {count}
      </span>
      <div className="flex-1 h-px bg-[#e2ddd5]" />
    </div>
  );
}

// ── Pending card ───────────────────────────────────────────────────────────────
// Visually prominent — this is what the student must act on.
function PendingCard({
  a,
  onSubmit,
}: {
  a: Assignment;
  onSubmit: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const days = a.dueLabel.match(/Due in (\d+) day/)?.[1];
  const n = days ? parseInt(days) : 99;
  // Red bar for ≤ 3 days, gold for anything else pending
  const accentColor = n <= 3 ? "#c0392b" : "#c9923a";

  return (
    <div className="bg-white rounded-[16px] border border-[#e2ddd5] shadow-[0_2px_8px_rgba(0,0,0,0.07)] overflow-hidden">
      <div className="flex">
        {/* Left urgency bar */}
        <div className="w-[5px] flex-shrink-0" style={{ backgroundColor: accentColor }} />

        <div className="flex-1 px-5 py-5">
          {/* School chip + WU incentive */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <SchoolChip school={a.school} />
            {/* WU shown as an incentive, not a badge */}
            <div className="flex flex-col items-end flex-shrink-0 min-w-[52px]">
              <span
                className="font-playfair font-bold text-2xl leading-none"
                style={{ color: "#c9923a" }}
              >
                +{a.wu}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#c9923a]/70 mt-0.5">
                WU earned
              </span>
            </div>
          </div>

          {/* Course + title */}
          <p className="text-[11.5px] text-[#8a7a6a] mb-0.5">{a.course}</p>
          <h3 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-3 leading-snug">
            {a.title}
          </h3>

          {/* Due date chip */}
          <div className="mb-4">
            <DueDateChip label={a.dueLabel} />
          </div>

          {/* Submit area */}
          {open ? (
            <div>
              <textarea
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                className="w-full border border-[#e2ddd5] rounded-xl px-4 py-3 text-[13.5px] text-[#1a1a1a] bg-[#faf8f4] focus:outline-none focus:ring-2 focus:ring-[#2d5240] mb-3 resize-none placeholder:text-[#b0a898] leading-relaxed"
                placeholder="Write your assignment response here…"
              />
              <div className="flex gap-3">
                <button
                  className="bg-[#2d5240] text-white text-[13px] font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1e3a2d] transition-colors"
                  onClick={() => { setOpen(false); onSubmit(a.id); }}
                >
                  Submit Assignment
                </button>
                <button
                  className="border border-[#e2ddd5] text-[13px] text-[#6b6459] px-5 py-2.5 rounded-xl hover:bg-[#f5f1ea] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="w-full flex items-center justify-between bg-[#2d5240] text-white text-[13px] font-semibold px-5 py-3 rounded-xl hover:bg-[#1e3a2d] transition-colors group"
              onClick={() => setOpen(true)}
            >
              Submit Assignment
              <ChevronRight
                size={16}
                strokeWidth={2.5}
                className="opacity-80 group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Draft card ─────────────────────────────────────────────────────────────────
// Distinct "in-progress" visual state: parchment bg, dashed border, muted WU.
function DraftCard({ a }: { a: Assignment }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  return (
    <div className="bg-[#f7f5f1] rounded-[16px] border border-dashed border-[#c9b89e]">
      <div className="px-5 py-5">
        {/* Status label + WU */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#8a7a6a] uppercase tracking-wide">
            <FileEdit size={13} strokeWidth={1.75} />
            Draft in progress
          </span>
          <span className="text-[12px] font-medium text-[#8a7a6a]">
            <span className="text-[#c9923a]">✦</span> {a.wu} WU
          </span>
        </div>

        <SchoolChip school={a.school} />
        <p className="text-[11.5px] text-[#8a7a6a] mt-2 mb-0.5">{a.course}</p>
        <h3 className="font-playfair text-[18px] font-bold text-[#1a1a1a] mb-3 leading-snug">
          {a.title}
        </h3>

        <div className="mb-4">
          <DueDateChip label={a.dueLabel} />
        </div>

        {open ? (
          <div>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              className="w-full border border-[#d8d0c4] rounded-xl px-4 py-3 text-[13.5px] text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#2d5240] mb-3 resize-none placeholder:text-[#b0a898] leading-relaxed"
              placeholder="Write your assignment response here…"
            />
            <div className="flex gap-3">
              <button
                className="bg-[#2d5240] text-white text-[13px] font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1e3a2d] transition-colors"
                onClick={() => setOpen(false)}
              >
                Submit Assignment
              </button>
              <button
                className="bg-white border border-[#d8d0c4] text-[13px] text-[#6b6459] px-5 py-2.5 rounded-xl hover:bg-[#f5f1ea] transition-colors"
                onClick={() => setOpen(false)}
              >
                Save Draft
              </button>
            </div>
          </div>
        ) : (
          <button
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#2d5240] bg-white border border-[#4a7c59]/30 px-5 py-2.5 rounded-xl hover:bg-[#f0f7f3] transition-colors group"
            onClick={() => setOpen(true)}
          >
            Continue Writing
            <ChevronRight
              size={14}
              strokeWidth={2.5}
              className="opacity-70 group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Submitted card ─────────────────────────────────────────────────────────────
// Visually resolved — green accent, feedback callout in the brand system,
// slightly reduced visual weight so it recedes behind pending work.
function SubmittedCard({ a }: { a: Assignment }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#e2ddd5] overflow-hidden opacity-90">
      <div className="flex">
        {/* Green left bar — signals completion */}
        <div className="w-[5px] flex-shrink-0 bg-[#4a7c59]" />

        <div className="flex-1 px-5 py-4">
          {/* School + completion mark + WU earned */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} strokeWidth={2} className="text-[#4a7c59] flex-shrink-0" />
              <SchoolChip school={a.school} />
            </div>
            <span className="text-[12px] text-[#8a7a6a] flex-shrink-0">
              <span className="text-[#c9923a]">✦</span> {a.wu} WU earned
            </span>
          </div>

          <p className="text-[11.5px] text-[#8a7a6a] mb-0.5">{a.course}</p>
          <h3 className="font-playfair text-[17px] font-bold text-[#1a1a1a] mb-3 leading-snug">
            {a.title}
          </h3>

          {/* Feedback callout — warm, brand-consistent, not generic green-50 */}
          {a.feedback && (
            <div className="border-l-4 border-[#4a7c59] bg-[#f0f7f3] rounded-r-xl pl-4 pr-4 py-3">
              <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#4a7c59] mb-1.5">
                Mentor Feedback
              </p>
              <p className="text-[13px] text-[#2d5240] leading-relaxed">{a.feedback}</p>
            </div>
          )}

          {/* Submitted label if no feedback yet */}
          {!a.feedback && (
            <span className="text-[12px] text-[#8a7a6a]">{a.dueLabel} · Awaiting mentor review</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AssignmentsPage() {
  const [submittedIds, setSubmittedIds] = useState<number[]>([]);

  const all: Assignment[] = ALL_ASSIGNMENTS.map((a) =>
    submittedIds.includes(a.id) ? { ...a, status: "submitted" as const, dueLabel: "Submitted just now" } : a
  );

  const pending = all
    .filter((a) => a.status === "pending")
    .sort((a, b) => {
      const dA = parseInt(a.dueLabel.match(/Due in (\d+)/)?.[1] ?? "99");
      const dB = parseInt(b.dueLabel.match(/Due in (\d+)/)?.[1] ?? "99");
      return dA - dB;
    });
  const drafts = all.filter((a) => a.status === "draft");
  const done = all.filter((a) => a.status === "submitted");

  const total = all.length;
  const doneCount = done.length;

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Assignments</h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <p className="text-[#6b6459] text-[14px]">
            Submit your coursework and collect mentor feedback
          </p>
          <span className="text-[12px] font-medium text-[#6b6459] bg-[#ece8e0] px-2.5 py-0.5 rounded-full">
            {doneCount} of {total} complete
          </span>
        </div>
      </div>

      {/* Action Required — pending, sorted by urgency */}
      {pending.length > 0 && (
        <section>
          <SectionHeader label="Action Required" count={pending.length} />
          <div className="space-y-4">
            {pending.map((a) => (
              <PendingCard
                key={a.id}
                a={a}
                onSubmit={(id) => setSubmittedIds((s) => [...s, id])}
              />
            ))}
          </div>
        </section>
      )}

      {/* In Progress — drafts */}
      {drafts.length > 0 && (
        <section>
          <SectionHeader label="In Progress" count={drafts.length} />
          <div className="space-y-4">
            {drafts.map((a) => (
              <DraftCard key={a.id} a={a} />
            ))}
          </div>
        </section>
      )}

      {/* Completed — submitted with feedback */}
      {done.length > 0 && (
        <section>
          <SectionHeader label="Completed" count={done.length} />
          <div className="space-y-4">
            {done.map((a) => (
              <SubmittedCard key={a.id} a={a} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {all.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-[#f0f7f3] flex items-center justify-center mb-4">
            <CheckCircle2 size={24} strokeWidth={1.5} className="text-[#4a7c59]" />
          </div>
          <p className="font-playfair text-xl font-bold text-[#1a1a1a] mb-1">All caught up</p>
          <p className="text-[14px] text-[#6b6459]">No assignments pending right now.</p>
        </div>
      )}
    </div>
  );
}
