"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import AcademySeal from "@/components/ui/academy-seal";

const navLinks = [
  { href: "/schools", label: "Schools" },
  { href: "/faculty", label: "Faculty & Practitioners" },
  { href: "/academic-calendar", label: "Academic Calendar" },
  { href: "/about", label: "The Institution" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#faf8f4] border-b border-[#e2ddd5]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <AcademySeal size="sm" variant="gold" />
            <span className="hidden sm:block leading-tight">
              <span className="block font-playfair font-semibold text-[#1a1a1a] text-sm leading-tight">
                The Academy of Natural Wellness
              </span>
              <span
                className="block font-playfair italic text-[#8a7a6a]"
                style={{ fontSize: "8.5px", letterSpacing: "0.14em" }}
              >
                Natura Sanat, Sapientia Docet
              </span>
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
              Student Login
            </Link>
            <Link
              href="/admissions"
              className="bg-[#4a7c59] text-white text-xs font-medium px-4 py-1.5 rounded-full hover:bg-[#2d5240] transition-colors"
            >
              Apply for Admission
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
              Student Login
            </Link>
            <Link
              href="/admissions"
              className="bg-[#4a7c59] text-white text-sm font-medium px-4 py-2 rounded-lg text-center"
              onClick={() => setOpen(false)}
            >
              Apply for Admission
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
