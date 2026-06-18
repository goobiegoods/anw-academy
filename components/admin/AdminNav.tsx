"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  Award,
  Stethoscope,
  BarChart3,
  FileText,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/schools", label: "Schools", icon: School },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
  { href: "/admin/case-studies", label: "Case Studies", icon: Stethoscope },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-[#e2ddd5]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#2d5240] flex items-center justify-center text-white text-xs font-bold font-playfair">
            ANW
          </div>
          <div>
            <p className="font-playfair font-semibold text-[#1a1a1a] text-sm">ANW Admin</p>
            <p className="text-xs text-[#6b6459]">Control Panel</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-[#2d5240] text-white"
                      : "text-[#6b6459] hover:bg-[#f5f1ea] hover:text-[#1a1a1a]"
                  )}
                >
                  <Icon size={16} />
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
