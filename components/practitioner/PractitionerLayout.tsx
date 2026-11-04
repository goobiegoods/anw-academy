"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Library,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SignOutButton from "@/components/shared/SignOutButton";

const navItems = [
  { href: "/dashboard", label: "Academic Studies", icon: GraduationCap },
  { href: "/practitioner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/practitioner/clients", label: "My Clients", icon: Users },
  {
    href: "/practitioner/directory-profile",
    label: "Directory Profile",
    icon: UserCircle,
  },
  { href: "/practitioner/resources", label: "Resources", icon: Library },
  {
    href: "/practitioner/continuing-education",
    label: "Continuing Education",
    icon: GraduationCap,
  },
];

interface PractitionerLayoutProps {
  children: React.ReactNode;
}

export default function PractitionerLayout({
  children,
}: PractitionerLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-[#faf8f4] overflow-hidden">
      <aside className="w-full md:w-64 flex-shrink-0 bg-white border-r border-[#e2ddd5] flex flex-col">
        <div className="px-4 py-4 border-b border-[#e2ddd5]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#4a7c59] flex items-center justify-center text-white text-xs font-bold font-playfair">
              ANW
            </div>
            <div>
              <p className="font-playfair font-semibold text-[#1a1a1a] text-sm">
                ANW Practitioner
              </p>
              <p className="text-xs text-[#6b6459]">Portal</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-x-auto md:overflow-y-auto py-3 px-3">
          <ul className="flex md:block gap-1 md:space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== "/practitioner" && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center whitespace-nowrap gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      active
                        ? "bg-[#4a7c59] text-white"
                        : "text-[#6b6459] hover:bg-[#f5f1ea] hover:text-[#1a1a1a]",
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-[#e2ddd5]">
          <SignOutButton className="flex items-center whitespace-nowrap gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#6b6459] hover:bg-[#f5f1ea] hover:text-red-600 transition-all w-full" />
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
