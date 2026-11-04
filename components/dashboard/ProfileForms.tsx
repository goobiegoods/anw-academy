"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";

const INPUT =
  "w-full bg-[#FAF7F0] border border-[#DDD5C5] rounded-lg px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#a09080] focus:outline-none focus:border-[#4a7c59] focus:ring-1 focus:ring-[#4a7c59]/30 transition-colors";

const CARD = {
  backgroundColor: "#FAF7F0",
  border: "0.5px solid #DDD5C5",
} as const;

const BTN =
  "text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-opacity hover:opacity-90";

export default function ProfileForms({
  initialName,
  initialEmail,
  initialBio,
  initialLocation,
}: {
  initialName: string;
  initialEmail: string;
  initialBio: string;
  initialLocation: string;
}) {
  const [form, setForm] = useState({
    name: initialName,
    email: initialEmail,
    bio: initialBio,
    location: initialLocation,
  });
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordPending, setPasswordPending] = useState(false);
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setProfileError("");
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          location: form.location,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Could not save your profile.");
      setSaved(true);
      router.refresh();
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Could not save.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordPending(true);
    setPasswordMessage("");
    try {
      const supabase = createClient();
      const verification = await supabase.auth.signInWithPassword({
        email: initialEmail,
        password: currentPassword,
      });
      if (verification.error) throw verification.error;
      const update = await supabase.auth.updateUser({ password: newPassword });
      if (update.error) throw update.error;
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("Password updated.");
    } catch (error) {
      setPasswordMessage(
        error instanceof Error ? error.message : "Could not update password.",
      );
    } finally {
      setPasswordPending(false);
    }
  }

  const [support, setSupport] = useState({ subject: "", message: "" });
  const [supportStatus, setSupportStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

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

  return (
    <>
      {/* ── Personal Details ─────────────────────────────────────────── */}
      <div className="rounded-[16px] p-6" style={CARD}>
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-5">
          Personal Details
        </h2>
        <form className="space-y-4" onSubmit={saveProfile}>
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
                readOnly
                aria-label="Verified email address"
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
              disabled={saving}
              className={BTN}
              style={{ backgroundColor: "#27500A" }}
            >
              Save Changes
            </button>
            {saved && (
              <span
                className="text-sm font-medium"
                style={{ color: "#4a7c59" }}
              >
                ✓ Saved!
              </span>
            )}
          </div>
          <p role="status" className="text-sm text-red-700">
            {profileError}
          </p>
        </form>
      </div>

      {/* ── Change Password ──────────────────────────────────────────── */}
      <div className="rounded-[16px] p-6" style={CARD}>
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-5">
          Change Password
        </h2>
        <form onSubmit={changePassword} className="space-y-3">
          <div>
            <label className="block text-[13px] font-medium text-[#3a3028] mb-1.5">
              Current Password
            </label>
            <input
              required
              autoComplete="current-password"
              aria-label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#3a3028] mb-1.5">
              New Password
            </label>
            <input
              required
              minLength={10}
              autoComplete="new-password"
              aria-label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={INPUT}
            />
          </div>
          <div className="pt-1">
            <button
              disabled={passwordPending}
              className={BTN}
              style={{ backgroundColor: "#27500A" }}
            >
              Update Password
            </button>
          </div>
          <p role="status" className="text-sm">
            {passwordMessage}
          </p>
        </form>
      </div>

      {/* ── Contact Support ──────────────────────────────────────────── */}
      <div className="rounded-[16px] p-6" style={CARD}>
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-1">
          Contact Support
        </h2>
        <p className="text-[13px] text-[#6b6459] mb-5">
          Have a question or issue? Our team typically responds within one
          business day.
        </p>

        {supportStatus === "sent" ? (
          <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-4 flex items-center gap-3">
            <Send size={16} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-green-800">
                Message sent!
              </p>
              <p className="text-[12px] text-green-700 mt-0.5">
                We&apos;ll get back to you at {form.email}.
              </p>
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
                onChange={(e) =>
                  setSupport({ ...support, subject: e.target.value })
                }
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
                onChange={(e) =>
                  setSupport({ ...support, message: e.target.value })
                }
                className={`${INPUT} resize-none`}
                placeholder="Describe your issue or question…"
              />
            </div>
            {supportStatus === "error" && (
              <p className="text-[12px] text-red-600">
                Something went wrong. Please try again.
              </p>
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
    </>
  );
}
