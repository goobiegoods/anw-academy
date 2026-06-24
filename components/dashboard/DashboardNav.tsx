"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  GraduationCap,
  MessageSquare,
  Stethoscope,
  Award,
  Coins,
  Library,
  Bot,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",              label: "Dashboard",      icon: LayoutDashboard },
  { href: "/dashboard/courses",      label: "My Courses",     icon: BookOpen },
  { href: "/dashboard/assignments",  label: "Assignments",    icon: FileText },
  { href: "/dashboard/exams",        label: "Exams & Quizzes", icon: GraduationCap },
  { href: "/dashboard/discussions",  label: "Discussions",    icon: MessageSquare },
  { href: "/dashboard/case-studies", label: "Case Studies",   icon: Stethoscope },
  { href: "/dashboard/certifications", label: "Certifications", icon: Award },
  { href: "/dashboard/wellness-units", label: "Wellness Units", icon: Coins },
  { href: "/dashboard/resources",    label: "Resources",      icon: Library },
  { href: "/dashboard/ai-tutor",     label: "ANW Scholar",    icon: Bot },
  { href: "/dashboard/profile",      label: "My Profile",     icon: User },
];

// Dark green sidebar palette
const CREAM       = "#F3ECDA";
const GOLD        = "#D4A94A";
const ACTIVE_BG   = "rgba(212,169,74,0.18)";
const DIVIDER     = "rgba(243,236,218,0.12)";
const INACTIVE_TX = "rgba(243,236,218,0.75)";
const INACTIVE_IC = "rgba(243,236,218,0.50)";
const SIGN_OUT_TX = "rgba(243,236,218,0.55)";

export default function DashboardNav({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${DIVIDER}` }}>
        <Link href="/" onClick={onNavClick} className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-playfair flex-shrink-0"
            style={{ backgroundColor: GOLD, color: "#1C3327" }}
          >
            ANW
          </div>
          <span className="font-playfair font-semibold text-sm leading-tight" style={{ color: CREAM }}>
            Academy of Natural Wellness
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));

            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavClick}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all hover:bg-[#F3ECDA]/[0.07]"
                  style={active ? { backgroundColor: ACTIVE_BG } : undefined}
                >
                  <Icon
                    size={16}
                    className="flex-shrink-0"
                    style={{ color: active ? GOLD : INACTIVE_IC }}
                  />
                  <span style={{ color: active ? CREAM : INACTIVE_TX }}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Sign out */}
      <div className="px-2.5 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${DIVIDER}` }}>
        <Link
          href="/login"
          onClick={onNavClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all hover:bg-[#F3ECDA]/[0.07] w-full"
        >
          <LogOut size={16} className="flex-shrink-0" style={{ color: SIGN_OUT_TX }} />
          <span style={{ color: SIGN_OUT_TX }}>Sign Out</span>
        </Link>
      </div>

    </nav>
  );
}
