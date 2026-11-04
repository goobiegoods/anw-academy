import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, CheckCircle2, Circle, GraduationCap, Network, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { buildStudentSnapshot } from "@/lib/academics/student-snapshot";

export const dynamic = "force-dynamic";

export default async function AcademicPlanPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const snapshot = await buildStudentSnapshot(user.id);
  const nextCredential = snapshot.credentialRequirements.find((item) => !item.eligible);

  const stages = [
    { label: "Student identity", detail: user.studentId ? `Student No. ${user.studentId}` : "Identity record pending", complete: Boolean(user.studentId), href: "/dashboard/profile" },
    { label: "Current studies", detail: snapshot.studies.length ? `${snapshot.studies.length} active course${snapshot.studies.length === 1 ? "" : "s"}` : "Choose a course path", complete: snapshot.studies.length > 0, href: "/dashboard/courses" },
    { label: "Human Body foundation", detail: "Anatomy, physiology, evidence, safety, and school connections", complete: false, href: "/dashboard/atlas" },
    { label: "Demonstrated learning", detail: `${snapshot.completedLessonCount} lessons completed · ${snapshot.recentAttempts.filter((item) => item.passed).length} passed assessments`, complete: snapshot.completedLessonCount > 0, href: "/dashboard/transcript" },
    { label: "Faculty-reviewed practice", detail: `${snapshot.cases.filter((item) => item.status === "approved").length} approved cases · ${snapshot.capstones.filter((item) => item.status === "approved").length} approved capstones`, complete: snapshot.cases.some((item) => item.status === "approved"), href: "/dashboard/case-studies" },
    { label: "Credential pathway", detail: nextCredential ? `${nextCredential.title}: requirements still in progress` : "Recorded requirements met", complete: !nextCredential, href: "/dashboard/certifications" },
  ];

  return (
    <div className="space-y-9">
      <header className="rounded-[26px] bg-[#1C3327] px-6 py-8 text-white sm:px-9">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4A94A]">Your Academy journey</p>
        <h1 className="mt-3 font-playfair text-4xl font-bold">Academic Plan</h1>
        <p className="mt-3 max-w-3xl text-[13px] leading-7 text-white/70">
          One view of where you are, what the Academy has verified, and the next useful steps across courses, the Human Body foundation, practical work, assessment, and credentials.
        </p>
      </header>

      <section aria-labelledby="next-actions-title">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a6b30]">Priority queue</p><h2 id="next-actions-title" className="font-playfair text-2xl font-bold text-[#1a1a1a]">What to do next</h2></div>
          <span className="text-[11px] text-[#8a7a6a]">Derived from recorded Academy activity</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {snapshot.nextActions.map((action, index) => (
            <Link key={`${action.kind}-${action.href}`} href={action.href} className="group flex min-h-32 items-center justify-between gap-5 rounded-[18px] border border-[#ddd5c8] bg-white p-6 transition hover:border-[#4a7c59]">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8a7a6a]">{String(index + 1).padStart(2, "0")} · {action.kind}</p><h3 className="mt-2 font-playfair text-xl font-bold text-[#1C3327]">{action.title}</h3><p className="mt-1 text-[12px] leading-6 text-[#6b6459]">{action.description}</p></div>
              <ArrowRight className="shrink-0 text-[#4a7c59] transition-transform group-hover:translate-x-1" size={20} />
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="journey-title" className="rounded-[22px] border border-[#ddd5c8] bg-[#F5F0E8] p-6 sm:p-8">
        <div className="flex items-center gap-3"><Network size={20} className="text-[#4a7c59]" /><h2 id="journey-title" className="font-playfair text-2xl font-bold text-[#1a1a1a]">Institutional journey</h2></div>
        <div className="mt-6 grid gap-3">
          {stages.map((stage) => (
            <Link key={stage.label} href={stage.href} className="flex min-h-16 items-center gap-4 rounded-xl border border-[#e1d9cc] bg-white px-4 py-3 hover:border-[#4a7c59]">
              {stage.complete ? <CheckCircle2 size={19} className="shrink-0 text-[#4a7c59]" /> : <Circle size={19} className="shrink-0 text-[#b7aa97]" />}
              <div className="min-w-0 flex-1"><p className="text-[13px] font-semibold text-[#1a1a1a]">{stage.label}</p><p className="text-[11px] leading-5 text-[#6b6459]">{stage.detail}</p></div>
              <ArrowRight size={15} className="shrink-0 text-[#8a7a6a]" />
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Academic record summary">
        {[{ icon: BookOpen, value: snapshot.completedLessonCount, label: "Lessons completed" }, { icon: ShieldCheck, value: snapshot.recordedWU, label: "Recorded Wellness Units" }, { icon: GraduationCap, value: snapshot.credentialRequirements.filter((item) => item.eligible).length, label: "Requirement sets satisfied" }].map(({ icon: Icon, value, label }) => (
          <div key={label} className="rounded-[18px] border border-[#e2ddd5] bg-white p-5"><Icon size={18} className="text-[#8a6b30]" /><p className="mt-4 font-playfair text-3xl font-bold text-[#1C3327]">{value}</p><p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#8a7a6a]">{label}</p></div>
        ))}
      </section>

      {snapshot.wuReconciliation.drift !== 0 && (
        <p className="rounded-xl border border-[#e8d4a8] bg-[#fef6e7] px-5 py-4 text-[12px] leading-6 text-[#7a5c1e]">
          Your recorded WU balance includes academic history that may not yet be itemized in the activity ledger. The Academy treats this record as unreconciled until registrar review; it is not used here as proof of mastery.
        </p>
      )}
    </div>
  );
}
