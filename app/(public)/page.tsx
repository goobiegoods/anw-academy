import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";
import AcademySeal from "@/components/ui/academy-seal";

export const dynamic = "force-dynamic";

const FOREST = "#1C3327";
const GOLD = "#D4A94A";
const CREAM = "#F3ECDA";

const JOURNEY_STEPS = [
  {
    eyebrow: "Step One",
    title: "Apply",
    tagline: "Tell us where you are.",
    description:
      "A short application — your background, your motivation, and the school that calls to you. No transcripts, no gatekeeping. We admit for seriousness of intent.",
    chips: ["5-minute form", "Rolling admissions", "All levels welcome"],
  },
  {
    eyebrow: "Step Two",
    title: "Choose Your School",
    tagline: "Six doors, one institution.",
    description:
      "Begin in the school that matches your fascination — herbs, classical Chinese theory, homeopathy, functional science, clinical craft, or the business of wellness. Cross-enrollment is open from day one.",
    chips: ["6 schools", "48 curricula", "Cross-enrollment"],
  },
  {
    eyebrow: "Step Three",
    title: "Study the Lessons",
    tagline: "Depth, not summaries.",
    description:
      "Every lesson is a ten-card teaching sequence: a hook, two full teachings, the masters in their own words, vocabulary, clinical relevance, and a gated quiz. University depth, self-paced rhythm.",
    chips: ["10-card lessons", "Swipe or read", "Primary sources"],
  },
  {
    eyebrow: "Step Four",
    title: "Earn Wellness Units",
    tagline: "Progress you can count.",
    description:
      "Lessons, discussions, exams, case studies, and your capstone all award Wellness Units. WU are the currency of advancement — they move you through six student levels toward certification.",
    chips: ["WU on every win", "6 levels", "Transparent ledger"],
  },
  {
    eyebrow: "Step Five",
    title: "Prove Your Practice",
    tagline: "Knowledge becomes craft.",
    description:
      "Midterms, school finals, written case studies, and a recorded teaching capstone — reviewed by faculty mentors. You graduate able to do the work, not just describe it.",
    chips: ["Mentor review", "Case studies", "Video capstone"],
  },
  {
    eyebrow: "Step Six",
    title: "Join the Network",
    tagline: "Credential, then community.",
    description:
      "Certified graduates enter the ANW Practitioner Network — a public directory of verified practitioners — with continuing education, live office hours, and referral pathways for life.",
    chips: ["Verified directory", "Lifetime access", "Office hours"],
  },
];

const WHY_ANW = [
  {
    title: "Rooted in Tradition",
    body: "Our curricula draw from the primary sources — the Organon, the Nei Jing, Culpeper's Complete Herbal — and the centuries of clinical practice behind them. You study the traditions on their own terms, in their own words.",
  },
  {
    title: "Academically Structured",
    body: "Student numbers, transcripts, gated assessments, and eight certifications with publicly verifiable diplomas. Every credential at ANW is earned, recorded, and standing behind — permanently.",
  },
  {
    title: "Taught by Practitioners",
    body: "Our faculty practice what they teach — herbalists, TCM practitioners, homeopaths, and functional wellness clinicians who bring living experience into every curriculum.",
  },
];

/** Subtle repeating botanical pattern for the hero. */
function BotanicalPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.05 }}
      aria-hidden
    >
      <defs>
        <pattern id="anw-botanical" width="120" height="120" patternUnits="userSpaceOnUse">
          <g stroke={GOLD} strokeWidth="1" fill="none" strokeLinecap="round">
            <path d="M 30,90 C 30,70 30,50 30,34" />
            <path d="M 30,60 C 22,58 16,52 14,42 C 23,44 29,51 30,60 Z" />
            <path d="M 30,60 C 38,58 44,52 46,42 C 37,44 31,51 30,60 Z" />
            <path d="M 30,42 C 26,37 26,31 30,26 C 34,31 34,37 30,42 Z" />
            <path d="M 90,50 C 90,38 90,26 90,16" />
            <path d="M 90,36 C 84,34 80,30 78,23 C 85,25 89,29 90,36 Z" />
            <path d="M 90,36 C 96,34 100,30 102,23 C 95,25 91,29 90,36 Z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#anw-botanical)" />
    </svg>
  );
}

export default async function HomePage() {
  const [schools, facultyPreview, lessonCount, certCount] = await Promise.all([
    prisma.school.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { courses: true } } },
    }),
    prisma.faculty.findMany({
      where: { isActive: true },
      orderBy: [{ isFounding: "desc" }, { joinedAt: "asc" }],
      take: 3,
    }),
    prisma.lesson.count(),
    prisma.certification.count(),
  ]);

  const courseCount = schools.reduce((n, s) => n + s._count.courses, 0);

  const stats = [
    `${schools.length || 6} Schools`,
    `${courseCount || 48} Curricula`,
    `${lessonCount >= 360 ? "360+" : lessonCount || "360+"} Lessons`,
    `${certCount || 8} Certifications`,
    "Est. 2026",
  ];

  return (
    <div className="w-full">
      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden" style={{ backgroundColor: FOREST }}>
        <BotanicalPattern />
        <div className="relative max-w-4xl mx-auto px-6 py-24 md:py-28 flex flex-col items-center text-center">
          <AcademySeal size="xl" variant="gold" />

          <h1
            className="font-playfair font-bold mt-9 leading-[1.08]"
            style={{ color: CREAM, fontSize: "clamp(40px,6vw,68px)" }}
          >
            Academy of Natural Wellness
          </h1>

          <p
            className="font-playfair italic text-[16px] md:text-[18px] tracking-[0.14em] mt-4"
            style={{ color: GOLD }}
          >
            Natura Sanat, Sapientia Docet
          </p>

          <p className="text-[11px] uppercase tracking-[0.3em] text-white/50 mt-3">
            Established 2026
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <Link
              href="/admissions"
              className="text-sm font-bold px-8 py-3.5 rounded-full transition-colors hover:bg-white"
              style={{ backgroundColor: CREAM, color: FOREST }}
            >
              Apply for Admission
            </Link>
            <Link
              href="/schools"
              className="text-sm font-semibold px-8 py-3.5 rounded-full border transition-colors hover:bg-white/10"
              style={{ color: CREAM, borderColor: "rgba(243,236,218,0.5)" }}
            >
              Explore the Schools →
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────────────────────────── */}
      <div className="w-full bg-[#f0ece4] border-b border-[#e2ddd5] py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {stats.map((s, i) => (
            <span key={s} className="flex items-center gap-3">
              <span className="text-[12px] uppercase tracking-[0.2em] font-semibold text-[#6b6459]">
                {s}
              </span>
              {i < stats.length - 1 && <span style={{ color: GOLD }}>·</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── OUR SCHOOLS ────────────────────────────────────────────── */}
      <section className="w-full bg-[#faf8f4] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-10 h-px" style={{ backgroundColor: GOLD }} />
            <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#9a9088]">
              Our Schools
            </span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-12">
            One institution.{" "}
            <span className="italic font-normal text-[#4a7c59]">Six traditions of mastery.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <Link key={school.id} href={`/schools/${school.slug}`}>
                <div className="bg-white border border-[#e2ddd5] rounded-2xl p-7 h-full hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{school.icon}</span>
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${school.color}18`, color: school.color }}
                    >
                      {school._count.courses} {school._count.courses === 1 ? "curriculum" : "curricula"}
                    </span>
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-[#1a1a1a] leading-snug">
                    {school.name}
                  </h3>
                  <p className="text-[12.5px] text-[#6b6459] mt-2 leading-relaxed flex-1">
                    {school.description.split(". ")[0].replace(/\.$/, "")}.
                  </p>
                  <span
                    className="text-[12.5px] font-semibold mt-4"
                    style={{ color: school.color }}
                  >
                    Enter School →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ANW ────────────────────────────────────────────────── */}
      <section className="w-full bg-[#f5f1ea] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-10 h-px" style={{ backgroundColor: GOLD }} />
            <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#9a9088]">
              Why ANW
            </span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-12">
            An institution,{" "}
            <span className="italic font-normal text-[#4a7c59]">not a video library.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY_ANW.map((pillar) => (
              <div key={pillar.title} className="bg-white border border-[#e2ddd5] rounded-2xl p-8">
                <span className="block w-8 h-1 rounded-full mb-5" style={{ backgroundColor: GOLD }} />
                <h3 className="font-playfair text-xl font-bold text-[#1a1a1a]">{pillar.title}</h3>
                <p className="text-[13px] text-[#6b6459] mt-3" style={{ lineHeight: 1.85 }}>
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOURNEY ────────────────────────────────────────────────── */}
      <section className="w-full bg-[#2d5240] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-10 h-px bg-[#e8b45a]" />
            <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-white/50">
              The Student Journey
            </span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white max-w-2xl leading-tight mb-12">
            Six steps to a{" "}
            <span className="italic font-normal text-[#e8b45a]">life-changing credential</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {JOURNEY_STEPS.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 overflow-hidden"
                style={{ backgroundColor: i % 2 === 0 ? "#376655" : "#325e4c" }}
              >
                <div className="px-7 pt-7 pb-5 border-b border-white/10">
                  <p
                    className="uppercase tracking-[0.3em] font-bold text-[#e8b45a] mb-2"
                    style={{ fontSize: "9px" }}
                  >
                    {step.eyebrow}
                  </p>
                  <h3 className="font-playfair text-2xl font-bold text-white">{step.title}</h3>
                  <p className="font-playfair italic text-white/65 text-sm mt-1">{step.tagline}</p>
                </div>
                <div className="px-7 py-6">
                  <p className="text-[12.5px] text-white/70" style={{ lineHeight: 1.8 }}>
                    {step.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {step.chips.map((chip) => (
                      <span
                        key={chip}
                        className="text-[9.5px] uppercase tracking-[0.1em] text-white/70 border border-white/20 rounded-full px-2.5 py-1"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FACULTY PREVIEW ────────────────────────────────────────── */}
      <section className="w-full bg-[#faf8f4] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between gap-6 flex-wrap mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="block w-10 h-px" style={{ backgroundColor: GOLD }} />
                <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#9a9088]">
                  Meet Our Faculty
                </span>
              </div>
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#1a1a1a]">
                Taught by{" "}
                <span className="italic font-normal text-[#4a7c59]">working practitioners.</span>
              </h2>
            </div>
            <Link
              href="/faculty"
              className="text-sm font-semibold text-[#4a7c59] border border-[#4a7c59]/40 px-6 py-2.5 rounded-full hover:bg-[#4a7c59]/5 transition-colors"
            >
              View All Faculty →
            </Link>
          </div>

          {facultyPreview.length === 0 ? (
            <p className="text-sm text-[#6b6459]">Faculty appointments are announced each term.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {facultyPreview.map((f) => (
                <Link key={f.id} href={`/faculty/${f.slug}`}>
                  <div className="bg-white border border-[#e2ddd5] rounded-2xl p-7 h-full flex flex-col items-center text-center hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all">
                    {f.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.photoUrl}
                        alt={f.name}
                        className="w-20 h-20 rounded-full object-cover"
                        style={{ border: `3px solid ${GOLD}` }}
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: FOREST, border: `3px solid ${GOLD}` }}
                      >
                        <span className="font-playfair font-bold text-xl" style={{ color: GOLD }}>
                          {getInitials(f.name)}
                        </span>
                      </div>
                    )}
                    <h3 className="font-playfair text-lg font-bold text-[#1a1a1a] mt-4">{f.name}</h3>
                    <p className="font-playfair italic text-[12.5px] text-[#6b6459] mt-0.5">
                      {f.title}
                    </p>
                    {f.specializations.length > 0 && (
                      <p className="text-[11px] text-[#9a9088] mt-2">
                        {f.specializations.slice(0, 3).join(" · ")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── VERIFICATION CALLOUT ───────────────────────────────────── */}
      <section className="w-full py-20" style={{ backgroundColor: FOREST }}>
        <div className="max-w-3xl mx-auto px-6 flex flex-col items-center text-center">
          <AcademySeal size="sm" variant="gold" />
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mt-5" style={{ color: CREAM }}>
            Every ANW certification is publicly verifiable.
          </h2>
          <p className="text-[13.5px] text-white/60 mt-4 max-w-md leading-relaxed">
            Each diploma carries a certificate number that anyone — a client, an employer, a
            colleague — can verify in seconds. That is what an institution owes its graduates.
          </p>
          <Link
            href="/verify"
            className="mt-8 text-sm font-bold px-8 py-3.5 rounded-full transition-colors hover:bg-[#e8c060]"
            style={{ backgroundColor: GOLD, color: FOREST }}
          >
            Verify a Graduate →
          </Link>
        </div>
      </section>
    </div>
  );
}
