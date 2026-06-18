import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LEVEL_LABELS: Record<number, string> = {
  1: "Foundation",
  2: "Intermediate",
  3: "Practitioner",
  4: "Advanced",
  5: "Senior",
};

export default async function ProgramsPage() {
  const certifications = await prisma.certification.findMany({
    orderBy: [{ level: "asc" }, { requiredWU: "asc" }],
  });

  return (
    <div className="w-full bg-[#faf8f4]">
      {/* Header */}
      <div className="w-full bg-[#2d5240] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-10 h-px bg-[#e8b45a]" />
            <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-white/50">
              Certification Programs
            </span>
          </div>
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-white leading-tight">
            Eight credentials.{" "}
            <span className="italic font-normal text-[#e8b45a]">
              One ascending path.
            </span>
          </h1>
          <p
            className="text-sm text-white/70 max-w-xl mt-6"
            style={{ lineHeight: 1.9 }}
          >
            From your first foundation certificate to the Senior Natural
            Wellness Practitioner designation, every ANW credential is earned
            through Wellness Units, mentor-reviewed case work, and demonstrated
            practice — never purchased, never rushed.
          </p>
        </div>
      </div>

      {/* Certification cards */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="bg-white border border-[#e2ddd5] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col"
            >
              <div className="px-8 pt-8 pb-6 border-b border-[#f0ece4]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-white bg-[#4a7c59] rounded-full px-3 py-1.5">
                    Level {cert.level} — {LEVEL_LABELS[cert.level] ?? "Mastery"}
                  </span>
                  <span className="font-playfair font-bold text-[#c9923a] text-xl">
                    {cert.requiredWU} WU
                  </span>
                </div>
                <h2 className="font-playfair text-2xl font-bold text-[#1a1a1a] leading-snug">
                  {cert.title}
                </h2>
                <p
                  className="text-[13px] text-[#6b6459] mt-3"
                  style={{ lineHeight: 1.8 }}
                >
                  {cert.description}
                </p>
              </div>

              <div className="px-8 py-6 flex-1">
                <p className="uppercase tracking-[0.2em] text-[9px] font-bold text-[#c9923a] mb-3">
                  Requirements
                </p>
                <ul className="space-y-2">
                  <li className="text-[12.5px] text-[#1a1a1a] flex items-baseline gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c9923a] flex-shrink-0" />
                    <span>
                      <span className="font-semibold text-[#c9923a]">
                        {cert.requiredWU} Wellness Units
                      </span>{" "}
                      earned through lessons, exams, and case work
                    </span>
                  </li>
                  <li className="text-[12.5px] text-[#1a1a1a] flex items-baseline gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59] flex-shrink-0" />
                    Estimated duration: {cert.duration}, self-paced
                  </li>
                  {cert.requiredCaseStudies > 0 && (
                    <li className="text-[12.5px] text-[#1a1a1a] flex items-baseline gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59] flex-shrink-0" />
                      {cert.requiredCaseStudies} mentor-approved case{" "}
                      {cert.requiredCaseStudies === 1 ? "study" : "studies"}
                    </li>
                  )}
                  {cert.requiredCapstone && (
                    <li className="text-[12.5px] text-[#1a1a1a] flex items-baseline gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59] flex-shrink-0" />
                      Recorded video teaching capstone, faculty-reviewed
                    </li>
                  )}
                  <li className="text-[12.5px] text-[#1a1a1a] flex items-baseline gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59] flex-shrink-0" />
                    Coursework across the relevant school
                    {cert.level >= 3 ? "s — multi-school study required" : ""}
                  </li>
                </ul>
              </div>

              <div className="px-8 pb-8">
                <Link
                  href="/admissions"
                  className="block text-center bg-[#4a7c59] text-white text-sm font-semibold py-3 rounded-full hover:bg-[#2d5240] transition-colors"
                >
                  Apply for this Program
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-[#9a9088] max-w-2xl mx-auto mt-16" style={{ lineHeight: 1.8 }}>
          ANW certifications recognize completion of educational programs in
          natural wellness. They are educational credentials, not medical
          licenses. Graduates practice as wellness educators within the scope
          defined by their local regulations.
        </p>
      </div>
    </div>
  );
}
