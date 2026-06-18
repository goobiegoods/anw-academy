"use client";

import { useState } from "react";
import Avatar from "@/components/shared/Avatar";
import { getLevelTitle } from "@/lib/utils";

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "Emma Clarke",
    email: "emma@example.com",
    bio: "Passionate student of herbal medicine and TCM. Dedicated to integrating traditional wisdom with modern wellness practice.",
    location: "Burlington, VT",
  });
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">My Profile</h1>
        <p className="text-[#6b6459] mt-1">Manage your account and public presence</p>
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
        <div className="flex items-center gap-5 mb-6">
          <Avatar name={form.name} size="xl" />
          <div>
            <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">{form.name}</h2>
            <p className="text-sm text-[#4a7c59] font-medium">Level 3 — {getLevelTitle(3)}</p>
            <p className="text-sm text-[#6b6459]">342 Wellness Units</p>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 3000); }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
                placeholder="City, State"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Bio</label>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59] resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="bg-[#4a7c59] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#2d5240] transition-colors"
            >
              Save Changes
            </button>
            {saved && <span className="text-sm text-[#4a7c59] font-medium">✓ Saved!</span>}
          </div>
        </form>
      </div>

      <div className="bg-white border border-[#e2ddd5] rounded-[16px] shadow-card p-6">
        <h2 className="font-playfair text-lg font-bold text-[#1a1a1a] mb-4">Change Password</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Current Password</label>
            <input type="password" className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">New Password</label>
            <input type="password" className="w-full border border-[#e2ddd5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]" />
          </div>
          <button className="bg-[#4a7c59] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#2d5240] transition-colors">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
