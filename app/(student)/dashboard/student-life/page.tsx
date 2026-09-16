import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CalendarDays, MessageSquare, Users, LifeBuoy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentLifePage() {
  const announcements = await prisma.announcement.findMany({ where: { audience: { in: ["all", "students"] } }, orderBy: { createdAt: "desc" }, take: 20 });
  const links = [
    { href: "/dashboard/discussions", title: "Academic Forum", detail: "Course conversations with fellow scholars", icon: MessageSquare },
    { href: "/academic-calendar", title: "Academic Calendar", detail: "Terms, observances, and institution dates", icon: CalendarDays },
    { href: "/faculty", title: "Faculty", detail: "Meet the people responsible for Academy teaching", icon: Users },
    { href: "/dashboard/profile", title: "Student Support", detail: "Contact the Academy from your student record", icon: LifeBuoy },
  ];
  return <div className="space-y-9"><header className="rounded-[26px] bg-[#1C3327] px-6 py-8 text-white sm:px-9"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4A94A]">The living institution</p><h1 className="mt-3 font-playfair text-4xl font-bold">Student Life</h1><p className="mt-3 max-w-2xl text-[13px] leading-7 text-white/70">Announcements, academic conversation, dates, faculty, and support—kept together so the Academy feels like one institution beyond the lesson page.</p></header><section aria-labelledby="announcements-title"><h2 id="announcements-title" className="font-playfair text-2xl font-bold text-[#1a1a1a]">Academy announcements</h2>{announcements.length ? <div className="mt-4 space-y-3">{announcements.map((item) => <article key={item.id} className="rounded-[18px] border border-[#ded7cb] bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-3"><h3 className="font-playfair text-xl font-bold text-[#1C3327]">{item.title}</h3><time className="text-[10px] uppercase tracking-[0.12em] text-[#8a7a6a]">{item.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time></div><p className="mt-3 whitespace-pre-wrap text-[13px] leading-7 text-[#5f584f]">{item.body}</p></article>)}</div> : <div className="mt-4 rounded-[18px] border border-[#ded7cb] bg-[#F5F0E8] p-8"><p className="font-playfair text-lg font-bold text-[#1C3327]">No current announcements</p><p className="mt-2 text-[12px] text-[#6b6459]">Important Academy notices will appear here when published.</p></div>}</section><section className="grid gap-4 sm:grid-cols-2" aria-label="Student life services">{links.map(({ href, title, detail, icon: Icon }) => <Link key={href} href={href} className="flex min-h-28 items-center gap-4 rounded-[18px] border border-[#ded7cb] bg-white p-5 hover:border-[#4a7c59]"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#edf3ef] text-[#4a7c59]"><Icon size={19} /></span><span><span className="block font-playfair text-lg font-bold text-[#1C3327]">{title}</span><span className="mt-1 block text-[11px] leading-5 text-[#6b6459]">{detail}</span></span></Link>)}</section></div>;
}
