"use client";

import { useState } from "react";
import Avatar from "@/components/shared/Avatar";
import StatusBadge from "@/components/shared/StatusBadge";

export default function DirectoryProfilePage() {
  const [form, setForm] = useState({
    displayName: "Dr. Evelyn Hartwood",
    bio: "Evelyn holds an ANW Practitioner certification and specializes in digestive health and adaptogenic herbs for stress resilience. She supports clients through online consultations and in-person sessions in Portland.",
    location: "Portland, OR",
    specialties: "Herbal Medicine, Gut Health, Women's Wellness",
    languages: "English",
    bookingUrl: "",
    virtualAvailable: true,
    inPersonAvailable: true,
  });
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Directory Profile</h1>
        <p className="text-[#6b6459] mt-1">Manage your public practitioner listing</p>
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-sm font-medium text-[#6b6459]">Directory Status:</div>
          <StatusBadge status="active" />
          <div className="flex items-center gap-1.5 text-xs text-[#4a7c59] font-medium">
            ✓ Verified ANW Graduate
          </div>
        </div>

        <div className="bg-[#f5f1ea] rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-[#6b6459] mb-2">Profile Preview</p>
          <div className="flex items-center gap-3">
            <Avatar name={form.displayName} size="md" />
            <div>
              <p className="font-semibold text-sm text-[#1a1a1a]">{form.displayName}</p>
              <p className="text-xs text-[#4a7c59]">Natural Wellness Practitioner</p>
              <p className="text-xs text-[#6b6459]">{form.location}</p>
            </div>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 3000); }}
        >
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Display Name</label>
            <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Bio</label>
            <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Languages</label>
              <input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })}
                className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Specialties (comma-separated)</label>
            <input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })}
              className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Booking URL (optional)</label>
            <input type="url" value={form.bookingUrl} onChange={(e) => setForm({ ...form, bookingUrl: e.target.value })}
              placeholder="https://calendly.com/yourname"
              className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.virtualAvailable} onChange={(e) => setForm({ ...form, virtualAvailable: e.target.checked })} />
              Virtual available
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.inPersonAvailable} onChange={(e) => setForm({ ...form, inPersonAvailable: e.target.checked })} />
              In-person available
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="bg-[#4a7c59] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#2d5240] transition-colors">
              Save Profile
            </button>
            {saved && <span className="text-sm text-[#4a7c59] font-medium">✓ Saved!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
