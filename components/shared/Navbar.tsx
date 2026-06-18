"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/schools", label: "Schools" },
  { href: "/programs", label: "Programs" },
  { href: "/admissions", label: "Admissions" },
  { href: "/practitioner-network", label: "Practitioners" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#faf8f4] border-b border-[#e2ddd5]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#4a7c59] flex items-center justify-center text-white font-bold font-playfair flex-shrink-0" style={{ fontSize: "9px", letterSpacing: "0.05em" }}>
              ANW
            </div>
            <span className="font-playfair font-semibold text-[#1a1a1a] text-sm hidden sm:block leading-tight">
              The Academy of Natural Wellness
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#6b6459] hover:text-[#1a1a1a] text-xs font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-[#4a7c59] border border-[#4a7c59]/40 px-4 py-1.5 rounded-full hover:bg-[#4a7c59]/5 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/admissions"
              className="bg-[#4a7c59] text-white text-xs font-medium px-4 py-1.5 rounded-full hover:bg-[#2d5240] transition-colors"
            >
              Apply Now
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-[#6b6459] hover:bg-[#f5f1ea]"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-[#e2ddd5] px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-[#6b6459] hover:text-[#1a1a1a] py-2 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login" className="text-sm font-medium text-[#4a7c59] py-2">
              Login
            </Link>
            <Link
              href="/admissions"
              className="bg-[#4a7c59] text-white text-sm font-medium px-4 py-2 rounded-lg text-center"
              onClick={() => setOpen(false)}
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
