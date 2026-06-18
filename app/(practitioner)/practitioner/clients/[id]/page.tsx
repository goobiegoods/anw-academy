"use client";

import { useState } from "react";
import Link from "next/link";
import Avatar from "@/components/shared/Avatar";
import { formatDate } from "@/lib/utils";

const clientData: Record<string, {
  id: string; name: string; email: string; goals: string; notes: string; createdAt: string;
  sessions: { id: string; date: string; notes: string; followUpDate: string }[];
}> = {
  c1: {
    id: "c1",
    name: "Jennifer Mills",
    email: "jennifer@email.com",
    goals: "Stress reduction and sleep support through adaptogenic herbs and lifestyle changes. Also interested in learning about herbal teas.",
    notes: "Jennifer works in healthcare and experiences high occupational stress. Responds well to gentle education. Prefers written resources.",
    createdAt: "2026-03-15",
    sessions: [
      { id: "s1", date: "Mar 20, 2026", notes: "Initial intake. Discussed HPA axis, sleep hygiene basics, and ashwagandha overview as educational context.", followUpDate: "Apr 3, 2026" },
      { id: "s2", date: "Apr 3, 2026", notes: "Follow-up. Shared educational content on lemon balm and chamomile traditions. Client reports improved sleep onset.", followUpDate: "Jun 19, 2026" },
    ],
  },
  c2: {
    id: "c2",
    name: "Tom Bradley",
    email: "tom@email.com",
    goals: "Digestive wellness, energy optimization, gut microbiome support",
    notes: "Tom is highly motivated. Has tried multiple dietary approaches. Open to herbal education and functional wellness information.",
    createdAt: "2026-04-02",
    sessions: [
      { id: "s3", date: "Apr 10, 2026", notes: "Initial intake. Discussed gut-brain axis, fermented foods, and digestive herb traditions (ginger, fennel, slippery elm).", followUpDate: "Jun 13, 2026" },
    ],
  },
};

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = clientData[params.id] || clientData["c1"];
  const [sessionNotes, setSessionNotes] = useState("");
  const [addingSession, setAddingSession] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-[#6b6459]">
        <Link href="/practitioner/clients" className="hover:text-[#4a7c59]">Clients</Link>
        <span>/</span>
        <span className="text-[#1a1a1a]">{client.name}</span>
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
        <div className="flex items-start gap-5">
          <Avatar name={client.name} size="xl" />
          <div className="flex-1">
            <h1 className="font-playfair text-2xl font-bold text-[#1a1a1a]">{client.name}</h1>
            <p className="text-sm text-[#6b6459]">{client.email}</p>
            <p className="text-xs text-[#6b6459] mt-1">Client since {formatDate(client.createdAt)}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
          <div className="bg-[#f5f1ea] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#6b6459] uppercase tracking-wider mb-2">Goals</p>
            <p className="text-sm text-[#1a1a1a] leading-relaxed">{client.goals}</p>
          </div>
          <div className="bg-[#f5f1ea] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#6b6459] uppercase tracking-wider mb-2">Practitioner Notes</p>
            <p className="text-sm text-[#1a1a1a] leading-relaxed">{client.notes}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">Session History</h2>
          <button
            className="bg-[#4a7c59] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#2d5240] transition-colors"
            onClick={() => setAddingSession(true)}
          >
            + Log Session
          </button>
        </div>

        {addingSession && (
          <div className="bg-[#f5f1ea] rounded-xl p-4 mb-4">
            <p className="font-semibold text-sm text-[#1a1a1a] mb-3">New Session Note</p>
            <textarea
              rows={4}
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] mb-3 resize-none"
              placeholder="Session notes, educational content shared, follow-up plan…"
            />
            <div className="flex gap-3">
              <button className="bg-[#4a7c59] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#2d5240]" onClick={() => setAddingSession(false)}>Save Session</button>
              <button className="border border-[#e2ddd5] text-sm text-[#6b6459] px-4 py-2 rounded-lg hover:bg-[#f5f1ea]" onClick={() => setAddingSession(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {client.sessions.map((session, i) => (
            <div key={session.id} className="border border-[#e2ddd5] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-[#1a1a1a]">Session {i + 1} — {session.date}</p>
                <p className="text-xs text-[#6b6459]">Follow-up: {session.followUpDate}</p>
              </div>
              <p className="text-sm text-[#6b6459] leading-relaxed">{session.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
