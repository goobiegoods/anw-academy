"use client";

import { useState } from "react";
import { getLevelTitle, getInitials } from "@/lib/utils";
import { Send } from "lucide-react";

function MiniSeal() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="19" cy="19" r="17.5" fill="rgba(212,169,74,0.12)" stroke="#D4A94A" strokeWidth="1.2" />
      <circle cx="19" cy="19" r="12" fill="rgba(212,169,74,0.18)" stroke="#D4A94A" strokeWidth="1.2" />
      <path d="M12 19.5 L16.5 24 L26 14" stroke="#D4A94A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const awardedCerts = [
  {
    title: "Foundations of Natural Wellness",
    level: 1,
    awardedAt: "3 months ago",
  },
];

const INPUT =
  "w-full bg-[#FAF7F0] border border-[#DDD5C5] rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#a09080] focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59]/30 transition-colors";

const CARD = { backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" } as const;

const BTN =
  "text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-opacity hover:opacity-90";

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "Emma Clarke",
    email: "emma@example.com",
    bio: "Passionate student of herbal medicine and TCM. Dedicated to integrating traditional wisdom with modern wellness practice.",
    location: "Burlington, VT",
  });
  const [saved, setSaved] = useState(false);

  const [support, setSupport] = useState({ subject: "", message: "" });
  const [supportStatus, setSupportStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportStatus("sending");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: support.subject,
          message: support.message,
        }),
      });
      if (res.ok) {
        setSupportStatus("sent");
        setSupport({ subject: "", message: "" });
        setTimeout(() => setSupportStatus("idle"), 5000);
      } else {
        setSupportStatus("error");
      }
    } catch {
      setSupportStatus("error");
    }
  };

  const initials = getInitials(form.name);

  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── Header card ───────────────────────────────────────────────── */}
      <div className="rounded-[16px] p-6" style={CARD}>
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: "#1C3327",
              border: "2px solid rgba(212,169,74,0.45)",
            }}
          >
            <span
              className="font-playfair font-bold text-xl"
              style={{ color: "#D4A94A" }}
            >
              {initials}
            </span>
          </div>
          <div>
            <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">
              {form.name}
            </h2>
            <p className="text-sm font-medium mt-0.5" style={{ color: "#8a6b30" }}>
              Level 3 — {getLevelTitle(3)}
            </p>
            <p className="text-sm text-[#6b6459] mt-0.5">342 Wellness Units</p>
          </div>
        </div>
      </div>

      {/* ── Earned Certifications ─────────────────────────────────────── */}
      <div className="rounded-[16px] overflow-hidden" style={CARD}>
        <div
          className="px-6 py-4"
          style={{ borderBottom: "0.5px solid #DDD5C5" }}
        >
          <h2 className="font-playfair text-lg font-bold text-[#1a1a1a]">
            Earned Certifications
          </h2>
        </div>

        {awardedCerts.length > 0 ? (
          <div>
            {awardedCerts.map((cert, i) => (
              <div
                key={cert.title}
                className="px-6 py-4 flex items-center gap-4"
                style={
                  i < awardedCerts.length - 1
                    ? { borderBottom: "0.5px solid #DDD5C5" }
                    : undefined
                }
              >
                <div className="flex-shrink-0">
                  <MiniSeal />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[13px] text-[#1a1a1a] leading-snug">
                    {cert.title}
                  </p>
                  <p className="text-[11px] text-[#8a7a6a] mt-0.5">
                    Level {cert.level} · Awarded {cert.awardedAt}
                  </p>
                </div>
                <span
                  className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: "rgba(212,169,74,0.12)",
                    color: "#8a6b30",
                    border: "0.5px solid rgba(212,169,74,0.35)",
                  }}
                >
                  Awarded
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-6 text-center">
            <p className="text-sm text-[#6b6459] italic leading-relaxed">
              Your first certification is within reach — keep learning.
            </p>
          </div>
        )}
      </div>

      {/* ── Profile Information ───────────────────────────────────────── */}
      <div className="rounded-[16px] p-6" style={CARD}>
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-5">
          Profile Information
        </h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#3a3028] mb-1.5">
                Full Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#3a3028] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={INPUT}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[13px] font-medium text-[#3a3028] mb-1.5">
                Location
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={INPUT}
                placeholder="City, State"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[13px] font-medium text-[#3a3028] mb-1.5">
                Bio
              </label>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className={`${INPUT} resize-none`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className={BTN}
              style={{ backgroundColor: "#27500A" }}
            >
              Save Changes
            </button>
            {saved && (
              <span className="text-sm font-medium" style={{ color: "#4a7c59" }}>
                ✓ Saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* ── Change Password ───────────────────────────────────────────── */}
      <div className="rounded-[16px] p-6" style={CARD}>
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-5">
          Change Password
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-[13px] font-medium text-[#3a3028] mb-1.5">
              Current Password
            </label>
            <input type="password" className={INPUT} />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#3a3028] mb-1.5">
              New Password
            </label>
            <input type="password" className={INPUT} />
          </div>
          <div className="pt-1">
            <button
              className={BTN}
              style={{ backgroundColor: "#27500A" }}
            >
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* ── Contact Support ───────────────────────────────────────────── */}
      <div className="rounded-[16px] p-6" style={CARD}>
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-1">
          Contact Support
        </h2>
        <p className="text-[13px] text-[#6b6459] mb-5">
          Have a question or issue? Our team typically responds within one business day.
        </p>

        {supportStatus === "sent" ? (
          <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-4 flex items-center gap-3">
            <Send size={16} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-green-800">Message sent!</p>
              <p className="text-[12px] text-green-700 mt-0.5">We'll get back to you at {form.email}.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSupportSubmit} className="space-y-3">
            <div>
              <label className="block text-[13px] font-medium text-[#3a3028] mb-1.5">
                Subject
              </label>
              <input
                required
                value={support.subject}
                onChange={(e) => setSupport({ ...support, subject: e.target.value })}
                className={INPUT}
                placeholder="What do you need help with?"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#3a3028] mb-1.5">
                Message
              </label>
              <textarea
                required
                rows={4}
                value={support.message}
                onChange={(e) => setSupport({ ...support, message: e.target.value })}
                className={`${INPUT} resize-none`}
                placeholder="Describe your issue or question…"
              />
            </div>
            {supportStatus === "error" && (
              <p className="text-[12px] text-red-600">Something went wrong. Please try again.</p>
            )}
            <div className="pt-1">
              <button
                type="submit"
                disabled={supportStatus === "sending"}
                className={`${BTN} flex items-center gap-2 disabled:opacity-60`}
                style={{ backgroundColor: "#27500A" }}
              >
                <Send size={14} />
                {supportStatus === "sending" ? "Sending…" : "Send Message"}
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
