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
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/assignments", label: "Assignments", icon: FileText },
  { href: "/dashboard/exams", label: "Exams & Quizzes", icon: GraduationCap },
  { href: "/dashboard/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/dashboard/case-studies", label: "Case Studies", icon: Stethoscope },
  { href: "/dashboard/certifications", label: "Certifications", icon: Award },
  { href: "/dashboard/wellness-units", label: "Wellness Units", icon: Coins },
  { href: "/dashboard/resources", label: "Resources", icon: Library },
  { href: "/dashboard/ai-tutor", label: "ANW Scholar", icon: Bot },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-[#e2ddd5]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#4a7c59] flex items-center justify-center text-white text-xs font-bold font-playfair">
            ANW
          </div>
          <span className="font-playfair font-semibold text-[#1a1a1a] text-sm">
            The Academy of Natural Wellness
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-[#4a7c59] text-white"
                      : "text-[#6b6459] hover:bg-[#f5f1ea] hover:text-[#1a1a1a]"
                  )}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-3 border-t border-[#e2ddd5]">
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6b6459] hover:bg-[#f5f1ea] hover:text-red-600 transition-all w-full"
        >
          <LogOut size={16} />
          Sign Out
        </Link>
      </div>
    </nav>
  );
}
