"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import DashboardNav from "./DashboardNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#faf8f4] overflow-hidden">
      {/* Mobile header — fixed, hidden on desktop */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-[#e2ddd5] flex items-center px-4 gap-3 flex-shrink-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg text-[#6b6459] hover:bg-[#f5f1ea] transition-colors flex-shrink-0"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-[#4a7c59] flex items-center justify-center text-white text-[10px] font-bold font-playfair flex-shrink-0">
            ANW
          </div>
          <span className="font-playfair font-semibold text-[#1a1a1a] text-sm truncate">
            Academy of Natural Wellness
          </span>
        </Link>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Slide-in sidebar */}
          <div className="w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl relative">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3.5 right-3 p-1.5 rounded-lg text-[#6b6459] hover:bg-[#f5f1ea] transition-colors z-10"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
            <DashboardNav onNavClick={() => setMobileOpen(false)} />
          </div>
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white border-r border-[#e2ddd5] flex-col">
        <DashboardNav />
      </aside>

      {/* Main content — offset by mobile header height on small screens */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
