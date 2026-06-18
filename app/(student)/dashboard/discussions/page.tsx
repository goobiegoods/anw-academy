"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

const discussions = [
  {
    id: 1,
    title: "Your Entry into the Plant World",
    course: "Introduction to Herbal Medicine",
    school: { name: "Herbal Medicine", icon: "🌿", color: "#4a7c59" },
    prompt: "Share with your cohort: What drew you to herbal medicine?",
    postCount: 12,
    yourPost: true,
  },
  {
    id: 2,
    title: "Yin and Yang in Your Daily Life",
    course: "Yin and Yang Foundations",
    school: { name: "TCM", icon: "☯️", color: "#c0392b" },
    prompt: "Where do you observe the interplay of Yin and Yang qualities in your own life and health?",
    postCount: 8,
    yourPost: false,
  },
  {
    id: 3,
    title: "Your Current Food Environment",
    course: "Foundations of Nutrition",
    school: { name: "Functional Wellness", icon: "⚡", color: "#d4882a" },
    prompt: "Reflect on your current eating patterns. What does your food environment support, and what does it challenge?",
    postCount: 5,
    yourPost: false,
  },
];

export default function DiscussionsPage() {
  const [posts, setPosts] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<number[]>([]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Discussions</h1>
        <p className="text-[#6b6459] mt-1">Share perspectives and learn from your cohort</p>
      </div>

      <div className="space-y-5">
        {discussions.map((d) => (
          <div key={d.id} className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card overflow-hidden">
            <div className="h-1" style={{ backgroundColor: d.school.color }} />
            <div className="p-6">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div>
                  <p className="text-xs text-[#6b6459] mb-1">{d.school.icon} {d.course}</p>
                  <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">{d.title}</h2>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#6b6459]">
                  <MessageSquare size={14} />
                  {d.postCount} posts
                </div>
              </div>

              <div className="bg-[#f5f1ea] rounded-xl p-4 mb-5">
                <p className="text-sm text-[#6b6459] italic">{d.prompt}</p>
              </div>

              {d.yourPost || submitted.includes(d.id) ? (
                <div className="flex items-center gap-2 text-sm text-[#4a7c59] font-medium">
                  ✓ You have posted in this discussion
                </div>
              ) : (
                <div>
                  <textarea
                    rows={3}
                    value={posts[d.id] || ""}
                    onChange={(e) => setPosts({ ...posts, [d.id]: e.target.value })}
                    className="w-full border border-[#e2ddd5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] mb-3 resize-none"
                    placeholder="Share your perspective…"
                  />
                  <button
                    className="bg-[#4a7c59] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#2d5240] transition-colors disabled:opacity-60"
                    disabled={!posts[d.id] || posts[d.id].length < 20}
                    onClick={() => setSubmitted([...submitted, d.id])}
                  >
                    Post (+2 WU)
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
