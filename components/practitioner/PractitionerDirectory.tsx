"use client";

import { useMemo, useState } from "react";
import { getInitials } from "@/lib/utils";

export type DirectoryPractitioner = {
  id: string;
  displayName: string;
  bio: string;
  location: string;
  virtualAvailable: boolean;
  inPersonAvailable: boolean;
  specialties: string[];
  languages: string[];
  certifications: string[];
  bookingUrl: string | null;
};

export default function PractitionerDirectory({
  practitioners,
}: {
  practitioners: DirectoryPractitioner[];
}) {
  const [specialty, setSpecialty] = useState("all");
  const [virtualOnly, setVirtualOnly] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");

  const specialties = useMemo(() => {
    const all = new Set<string>();
    practitioners.forEach((p) => p.specialties.forEach((s) => all.add(s)));
    return Array.from(all).sort();
  }, [practitioners]);

  const filtered = practitioners.filter((p) => {
    if (specialty !== "all" && !p.specialties.includes(specialty)) return false;
    if (virtualOnly && !p.virtualAvailable) return false;
    if (
      locationQuery &&
      !p.location.toLowerCase().includes(locationQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="border border-[#e2ddd5] rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59] min-h-[44px] md:w-64"
        >
          <option value="all">All specialties</option>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          placeholder="Filter by location…"
          className="border border-[#e2ddd5] rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4a7c59] min-h-[44px] md:w-64"
        />
        <label className="flex items-center gap-2.5 text-sm text-[#1a1a1a] cursor-pointer min-h-[44px] px-1">
          <input
            type="checkbox"
            checked={virtualOnly}
            onChange={(e) => setVirtualOnly(e.target.checked)}
            className="w-4 h-4 accent-[#4a7c59]"
          />
          Virtual sessions only
        </label>
        <span className="md:ml-auto text-sm text-[#9a9088] self-center">
          {filtered.length} practitioner{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#9a9088] text-sm">
          No practitioners match those filters yet. Try broadening your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-[#e2ddd5] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-7 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#4a7c59] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold font-playfair">
                    {getInitials(p.displayName)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-playfair font-bold text-[#1a1a1a] text-base leading-snug">
                    {p.displayName}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] font-bold text-[#4a7c59] border border-[#4a7c59]/30 rounded-full px-2 py-0.5 mt-1">
                    ✓ Verified Graduate
                  </span>
                </div>
              </div>

              {p.certifications[0] && (
                <p className="text-[11px] text-[#c9923a] font-semibold mb-2">
                  {p.certifications[0]}
                </p>
              )}
              <p className="text-[12px] text-[#6b6459] flex-1" style={{ lineHeight: 1.7 }}>
                {p.bio}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {p.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] text-[#4a7c59] bg-[#4a7c59]/8 border border-[#4a7c59]/20 rounded-full px-2.5 py-1"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#f0ece4] text-[11px] text-[#9a9088]">
                <span>{p.location}</span>
                <span>
                  {[
                    p.virtualAvailable ? "Virtual" : null,
                    p.inPersonAvailable ? "In-person" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
