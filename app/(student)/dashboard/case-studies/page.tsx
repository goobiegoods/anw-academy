import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/shared/StatusBadge";

export const dynamic = "force-dynamic";

export default async function CaseStudiesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const cases = await prisma.caseStudy.findMany({ where: { userId: user.id }, orderBy: { submittedAt: "desc" }, include: { course: { select: { title: true } } } });
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a6b30]">Faculty-reviewed practice</p><h1 className="mt-2 font-playfair text-3xl font-bold text-[#1a1a1a]">Case Studies</h1><p className="mt-2 text-[13px] text-[#6b6459]">Apply Academy learning to hypothetical or fully anonymized scenarios within scope.</p></div><Link href="/dashboard/case-studies/new" className="inline-flex min-h-11 items-center rounded-xl bg-[#1C3327] px-6 text-[13px] font-semibold text-white">Begin a case study</Link></header>
      <div className="rounded-xl border border-[#e8d4a8] bg-[#fef6e7] px-5 py-4 text-[12px] leading-6 text-[#7a5c1e]"><strong>Privacy boundary:</strong> Never submit names, contact details, photographs, or other identifying client information. Case work is educational and does not authorize diagnosis or treatment.</div>
      {cases.length === 0 ? <div className="rounded-[20px] border border-[#ded7cb] bg-[#F5F0E8] p-10 text-center"><h2 className="font-playfair text-xl font-bold text-[#1C3327]">No case studies submitted</h2><p className="mt-2 text-[13px] text-[#6b6459]">Your first submission will appear here with its real review status and faculty feedback.</p></div> : <div className="space-y-4">{cases.map((item) => <article key={item.id} className="rounded-[18px] border border-[#ded7cb] bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-playfair text-xl font-bold text-[#1C3327]">{item.title}</h2><p className="mt-1 text-[11px] text-[#8a7a6a]">{item.course?.title ?? "Independent Academy case"} · Submitted {item.submittedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p></div><div className="flex items-center gap-3"><StatusBadge status={item.status} />{item.wuAwarded ? <span className="text-[12px] font-bold text-[#8a6b30]">+{item.wuAwarded} WU</span> : null}</div></div>{item.feedback ? <div className="mt-5 rounded-xl border border-[#cfe0d3] bg-[#f0f7f3] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#4a7c59]">Faculty feedback</p><p className="mt-2 whitespace-pre-wrap text-[12px] leading-6 text-[#2d5240]">{item.feedback}</p></div> : <p className="mt-4 text-[12px] italic text-[#8a7a6a]">Awaiting faculty review. No WU is awarded until an authorized reviewer approves the work.</p>}</article>)}</div>}
    </div>
  );
}
