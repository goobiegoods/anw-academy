"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  MessageSquare,
  BarChart3,
  Inbox,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin",             label: "Overview",    icon: LayoutDashboard },
  { href: "/admin/students",    label: "Students",    icon: Users },
  { href: "/admin/content",     label: "Content",     icon: BookOpen },
  { href: "/admin/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/admin/support",     label: "Support",     icon: Inbox },
  { href: "/admin/analytics",   label: "Analytics",   icon: BarChart3 },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
];

const FOREST  = "#1C3327";
const CREAM   = "#F3ECDA";
const GOLD    = "#D4A94A";
const DIVIDER = "rgba(243,236,218,0.12)";
const MUTED   = "rgba(243,236,218,0.55)";

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full" style={{ backgroundColor: FOREST }}>

      {/* Wordmark */}
      <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${DIVIDER}` }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-playfair flex-shrink-0"
            style={{ backgroundColor: GOLD, color: FOREST }}
          >
            ANW
          </div>
          <div>
            <p className="font-playfair font-semibold text-[13px] leading-none" style={{ color: CREAM }}>
              Academy of Natural Wellness
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Shield size={9} style={{ color: GOLD }} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: GOLD }}>
                Admin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/admin" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all hover:bg-[#F3ECDA]/[0.07]"
                  style={active ? { backgroundColor: "rgba(212,169,74,0.18)" } : undefined}
                >
                  <Icon
                    size={16}
                    className="flex-shrink-0"
                    style={{ color: active ? GOLD : "rgba(243,236,218,0.50)" }}
                  />
                  <span style={{ color: active ? CREAM : "rgba(243,236,218,0.75)" }}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Student dashboard link + sign out */}
      <div className="px-2.5 py-3 flex-shrink-0 space-y-0.5" style={{ borderTop: `1px solid ${DIVIDER}` }}>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all hover:bg-[#F3ECDA]/[0.07] w-full"
        >
          <LayoutDashboard size={16} className="flex-shrink-0" style={{ color: MUTED }} />
          <span style={{ color: MUTED }}>Student View</span>
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all hover:bg-[#F3ECDA]/[0.07] w-full"
        >
          <LogOut size={16} className="flex-shrink-0" style={{ color: MUTED }} />
          <span style={{ color: MUTED }}>Sign Out</span>
        </Link>
      </div>
    </nav>
  );
}
