import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SCHOOL_META: Record<
  string,
  { eyebrow: string; slogan: string; tags: string[]; gradient: string }
> = {
  "herbal-medicine": {
    eyebrow: "School No. 01",
    slogan: "The plants were the first physicians.",
    tags: ["Western Herbalism", "Materia Medica", "Formulation"],
    gradient: "linear-gradient(120deg, #2d5240 0%, #4a7c59 100%)",
  },
  "traditional-chinese-medicine": {
    eyebrow: "School No. 02",
    slogan: "Five thousand years of observed pattern.",
    tags: ["Qi Theory", "Five Elements", "Meridians"],
    gradient: "linear-gradient(120deg, #5e1822 0%, #8b2635 100%)",
  },
  "homeopathic-studies": {
    eyebrow: "School No. 03",
    slogan: "Like cures like — the radical idea that endured.",
    tags: ["Classical Method", "Organon", "Repertory"],
    gradient: "linear-gradient(120deg, #1d3557 0%, #2d5282 100%)",
  },
  "functional-wellness": {
    eyebrow: "School No. 04",
    slogan: "Root cause first. Always.",
    tags: ["Nutrition", "Gut-Brain Axis", "Lifestyle Medicine"],
    gradient: "linear-gradient(120deg, #124a4a 0%, #1d6e6e 100%)",
  },
  "practice-building": {
    eyebrow: "School No. 05",
    slogan: "The craft of holding space, professionally.",
    tags: ["Consultation", "Ethics", "Scope of Practice"],
    gradient: "linear-gradient(120deg, #3d2a21 0%, #5c4033 100%)",
  },
  "wellness-entrepreneurship": {
    eyebrow: "School No. 06",
    slogan: "A calling deserves a living.",
    tags: ["Brand", "Marketing", "First 10 Clients"],
    gradient: "linear-gradient(120deg, #2f3744 0%, #4a5568 100%)",
  },
};

const TICKER_ITEMS = [
  "6 Schools",
  "48 Curated Courses",
  "360+ Lessons",
  "1,400+ Materia Medica Entries",
  "Live Office Hours",
  "AI Tutor Companion",
  "8 Certifications",
  "Self-Paced Lifetime Access",
];

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
    chips: ["6 schools", "48 courses", "Cross-enrollment"],
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

const WU_EARNING = [
  { source: "Lesson completed (quiz passed)", wu: "1 WU" },
  { source: "Discussion — original post", wu: "2 WU" },
  { source: "Discussion — peer reply", wu: "1 WU" },
  { source: "Course midterm exam passed", wu: "10 WU" },
  { source: "School final exam passed", wu: "25 WU" },
  { source: "Case study approved", wu: "10–25 WU" },
  { source: "Video capstone approved", wu: "50 WU" },
];

const STUDENT_LEVELS = [
  { level: 1, title: "Seedling", range: "0 – 150 WU", note: "First lessons, first units. Everyone starts here." },
  { level: 2, title: "Apprentice", range: "150 – 500 WU", note: "Foundations across at least one full school." },
  { level: 3, title: "Practitioner", range: "500 – 750 WU", note: "Eligible for the practitioner credential track." },
  { level: 4, title: "Advanced Practitioner", range: "750 – 1,000 WU", note: "Multi-school depth and clinical case work." },
  { level: 5, title: "Community Leader", range: "1,000 – 1,250 WU", note: "Mentoring discussions, leading study cohorts." },
  { level: 6, title: "Senior Practitioner", range: "1,250+ WU", note: "The highest standing in the Academy." },
];

const TESTIMONIALS = [
  {
    quote:
      "I had read herb books for ten years and still felt like a tourist. Six months at ANW and I finally understand why a remedy works — energetics, safety, dosage, the whole architecture.",
    name: "Sarah Whitmore",
    role: "Herbal Foundations graduate · Vermont",
    initials: "SW",
  },
  {
    quote:
      "The lesson design is unlike anything I've used. Ten cards, a real story, the masters quoted in their own words, and a quiz that actually gates progress. It respects the student.",
    name: "Marcus Delgado",
    role: "TCM Fundamentals student · Texas",
    initials: "MD",
  },
  {
    quote:
      "I left a hospital career to build a wellness practice. The Practice Building school taught me scope, ethics, and documentation — the things that let me sleep at night as a practitioner.",
    name: "Amara Osei",
    role: "Certified Natural Wellness Practitioner · London",
    initials: "AO",
  },
];

export default async function HomePage() {
  const schools = await prisma.school.findMany({
    orderBy: { order: "asc" },
    include: {
      departments: true,
      courses: { orderBy: { order: "asc" } },
    },
  });

  const courseCount = schools.reduce((n, s) => n + s.courses.length, 0);

  return (
    <div className="w-full">
      {/* ── TICKER BAR ─────────────────────────────────────────────── */}
      <div className="w-full bg-[#f0ece4] border-b border-[#e2ddd5] py-2 overflow-hidden">
        <div className="animate-marquee flex whitespace-nowrap w-max">
          {[0, 1].map((dup) => (
            <span key={dup} className="flex items-center">
              {TICKER_ITEMS.map((item) => (
                <span
                  key={`${dup}-${item}`}
                  className="uppercase tracking-[0.2em] text-[#9a9088]"
                  style={{ fontSize: "9px" }}
                >
                  <span className="px-3">{item}</span>
                  <span className="text-[#c9923a]">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section
        className="w-full min-h-screen flex items-center"
        style={{
          background:
            "linear-gradient(135deg,#eef5ee 0%,#faf8f4 60%,#f5f0e8 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 w-full py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-16 items-center">
            {/* LEFT */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-10 h-px bg-[#c9923a]" />
                <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#9a9088]">
                  A Modern Institution of Traditional Wellness
                </span>
              </div>

              <h1
                className="font-playfair text-left leading-[1.05]"
                style={{ fontSize: "clamp(44px,6vw,72px)" }}
              >
                <span className="block font-bold text-[#1a1a1a]">
                  Where ancient
                </span>
                <span className="block font-bold text-[#1a1a1a]">wisdom</span>
                <span className="block italic font-normal text-[#4a7c59]">
                  meets modern
                </span>
                <span className="block italic font-normal text-[#4a7c59]">
                  mastery.
                </span>
              </h1>

              <span className="block w-8 h-px bg-[#c9923a] my-7" />

              <p
                className="text-[13px] text-[#6b6459] max-w-sm"
                style={{ lineHeight: 1.9 }}
              >
                Six schools. Forty-eight curated courses. A faculty of working
                practitioners and a curriculum drawn from the primary sources —
                from the Ebers Papyrus to the Organon to the Nei Jing. Study
                herbalism, Chinese medicine, homeopathy, functional wellness,
                clinical craft, and the business of practice, at your own pace,
                for life.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-8">
                <Link
                  href="/admissions"
                  className="bg-[#4a7c59] text-white text-sm font-semibold px-7 py-3 rounded-full hover:bg-[#2d5240] transition-colors"
                >
                  Apply for Admission
                </Link>
                <Link
                  href="/schools"
                  className="text-sm font-semibold text-[#4a7c59] border border-[#4a7c59]/40 px-7 py-3 rounded-full hover:bg-[#4a7c59]/5 transition-colors"
                >
                  Explore the Schools
                </Link>
              </div>

              <p className="mt-8 text-[10px] text-[#9a9088] tracking-wide">
                36 faculty practitioners · 3,900+ students enrolled · 42
                countries reached
              </p>
            </div>

            {/* RIGHT — Catalogue card */}
            <div>
              <div className="bg-white rounded-2xl border border-[#e2ddd5] shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-6">
                <div className="flex items-center justify-between border-b border-[#e2ddd5] pb-3 mb-4">
                  <span
                    className="uppercase tracking-[0.3em] font-bold text-[#c9923a]"
                    style={{ fontSize: "8px" }}
                  >
                    Course Catalogue
                  </span>
                  <span
                    className="uppercase tracking-[0.3em] text-[#9a9088]"
                    style={{ fontSize: "8px" }}
                  >
                    Vol. 1
                  </span>
                </div>

                <p className="uppercase tracking-[0.2em] text-[9px] font-semibold text-[#9a9088] mb-2">
                  The School Index
                </p>
                <p className="font-playfair text-[26px] leading-tight">
                  <span className="font-bold text-[#1a1a1a]">Six Schools,</span>{" "}
                  <span className="italic text-[#4a7c59]">
                    One institution.
                  </span>
                </p>

                <ul className="mt-4 space-y-2.5">
                  {schools.map((school) => (
                    <li key={school.id}>
                      <Link
                        href={`/schools/${school.slug}`}
                        className="flex items-center gap-3 group"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: school.color }}
                        />
                        <span className="text-[12.5px] font-medium text-[#1a1a1a] group-hover:text-[#4a7c59] transition-colors">
                          {school.name.replace("School of ", "")}
                        </span>
                        <span className="ml-auto text-[10px] text-[#9a9088]">
                          {school.courses.length} courses
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-[#e2ddd5] my-4" />

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { n: String(schools.length || 6), label: "Schools" },
                    { n: String(courseCount || 48), label: "Courses" },
                    { n: "360+", label: "Lessons" },
                    { n: "8", label: "Certifications" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-[#f5f1ea] rounded-xl px-4 py-3 text-center"
                    >
                      <p className="font-playfair text-xl font-bold text-[#2d5240]">
                        {stat.n}
                      </p>
                      <p className="uppercase tracking-[0.18em] text-[8px] text-[#9a9088] mt-0.5">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#e2ddd5] my-4" />

                <div className="flex items-center gap-3">
                  <span
                    className="uppercase tracking-[0.15em] font-bold text-[#c9923a] border border-[#c9923a]/40 rounded-full px-2.5 py-1"
                    style={{ fontSize: "8px" }}
                  >
                    + Live
                  </span>
                  <span className="text-[11.5px] text-[#6b6459]">
                    Weekly office hours with faculty
                  </span>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#e2ddd5]">
                  <span
                    className="uppercase tracking-[0.25em] text-[#9a9088]"
                    style={{ fontSize: "8px" }}
                  >
                    Updated Weekly
                  </span>
                  <span
                    className="uppercase tracking-[0.25em] text-[#9a9088]"
                    style={{ fontSize: "8px" }}
                  >
                    Lifetime Access
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCHOOLS ────────────────────────────────────────────────── */}
      <section className="w-full bg-[#f5f1ea] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-10 h-px bg-[#c9923a]" />
            <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#9a9088]">
              The Six Schools
            </span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-3">
            One institution.{" "}
            <span className="italic font-normal text-[#4a7c59]">
              Six traditions of mastery.
            </span>
          </h2>
          <p className="text-sm text-[#6b6459] max-w-xl mb-14" style={{ lineHeight: 1.8 }}>
            Each school is a complete curriculum — its own faculty, its own
            departments, its own certification path. Study one deeply or move
            between them; your Wellness Units travel with you.
          </p>

          <div className="space-y-10">
            {schools.map((school) => {
              const meta = SCHOOL_META[school.slug] ?? {
                eyebrow: "School",
                slogan: school.description,
                tags: [],
                gradient: `linear-gradient(120deg, ${school.color} 0%, ${school.color} 100%)`,
              };
              return (
                <div
                  key={school.id}
                  className="rounded-2xl overflow-hidden border border-[#e2ddd5] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                >
                  {/* Gradient header */}
                  <div
                    className="px-8 py-10 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8"
                    style={{ background: meta.gradient }}
                  >
                    <div>
                      <p
                        className="uppercase tracking-[0.3em] font-bold text-white/60 mb-3"
                        style={{ fontSize: "9px" }}
                      >
                        {meta.eyebrow}
                      </p>
                      <h3 className="font-playfair text-3xl md:text-4xl font-bold text-white leading-tight">
                        {school.name.replace("School of ", "")}
                      </h3>
                      <p className="font-playfair italic text-white/80 mt-2 text-lg">
                        {meta.slogan}
                      </p>
                      <span className="block w-8 h-px bg-[#e8b45a] mt-5" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <p
                        className="text-[12.5px] text-white/75"
                        style={{ lineHeight: 1.8 }}
                      >
                        {school.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {meta.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] uppercase tracking-[0.12em] text-white/80 border border-white/25 rounded-full px-3 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* White body */}
                  <div className="px-8 py-8 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <p className="uppercase tracking-[0.2em] text-[9px] font-bold text-[#c9923a] mb-3">
                        Courses
                      </p>
                      <ul className="space-y-1.5">
                        {school.courses.slice(0, 5).map((course) => (
                          <li
                            key={course.id}
                            className="text-[12.5px] text-[#1a1a1a] flex items-baseline gap-2"
                          >
                            <span
                              className="w-1 h-1 rounded-full flex-shrink-0"
                              style={{ backgroundColor: school.color }}
                            />
                            {course.title}
                          </li>
                        ))}
                        {school.courses.length > 5 && (
                          <li className="text-[11px] text-[#9a9088] italic">
                            + {school.courses.length - 5} more courses
                          </li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.2em] text-[9px] font-bold text-[#c9923a] mb-3">
                        Departments
                      </p>
                      <ul className="space-y-1.5">
                        {school.departments.map((dept) => (
                          <li
                            key={dept.id}
                            className="text-[12.5px] text-[#6b6459]"
                          >
                            {dept.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col justify-between gap-4">
                      <div>
                        <p className="uppercase tracking-[0.2em] text-[9px] font-bold text-[#c9923a] mb-3">
                          Certification &amp; WU
                        </p>
                        <p className="text-[12.5px] text-[#6b6459]" style={{ lineHeight: 1.7 }}>
                          {school.courses.length} courses ·{" "}
                          {school.courses.reduce((n, c) => n + c.wuValue, 0)} WU
                          available · counts toward the school certificate and
                          the Natural Wellness Practitioner credential.
                        </p>
                      </div>
                      <Link
                        href={`/schools/${school.slug}`}
                        className="inline-flex items-center gap-2 text-[12.5px] font-semibold hover:underline"
                        style={{ color: school.color }}
                      >
                        Enter the school →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
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
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white max-w-2xl leading-tight">
              Six steps to a{" "}
              <span className="italic font-normal text-[#e8b45a]">
                life-changing credential
              </span>
            </h2>
            <div className="flex items-center gap-2">
              {JOURNEY_STEPS.map((_, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      i === 0 ? "#e8b45a" : "rgba(255,255,255,0.25)",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {JOURNEY_STEPS.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 overflow-hidden"
                style={{
                  backgroundColor: i % 2 === 0 ? "#376655" : "#325e4c",
                }}
              >
                <div className="px-7 pt-7 pb-5 border-b border-white/10">
                  <p
                    className="uppercase tracking-[0.3em] font-bold text-[#e8b45a] mb-2"
                    style={{ fontSize: "9px" }}
                  >
                    {step.eyebrow}
                  </p>
                  <h3 className="font-playfair text-2xl font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="font-playfair italic text-white/65 text-sm mt-1">
                    {step.tagline}
                  </p>
                </div>
                <div className="px-7 py-6">
                  <p
                    className="text-[12.5px] text-white/70"
                    style={{ lineHeight: 1.8 }}
                  >
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

          <div className="text-center mt-14">
            <Link
              href="/admissions"
              className="inline-block bg-[#e8b45a] text-[#2d5240] text-sm font-bold px-8 py-3.5 rounded-full hover:bg-[#c9923a] transition-colors"
            >
              Begin Step One — Apply Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── WELLNESS UNITS ─────────────────────────────────────────── */}
      <section className="w-full bg-[#faf8f4] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-10 h-px bg-[#c9923a]" />
            <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#9a9088]">
              Wellness Units
            </span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-3">
            Every effort{" "}
            <span className="italic font-normal text-[#4a7c59]">counts.</span>
          </h2>
          <p
            className="text-sm text-[#6b6459] max-w-xl mb-14"
            style={{ lineHeight: 1.8 }}
          >
            Wellness Units (WU) are the Academy&apos;s academic currency. You
            earn them for every demonstration of learning, and they carry you
            through six student levels toward certification.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Earning table */}
            <div className="bg-white rounded-2xl border border-[#e2ddd5] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden h-fit">
              <div className="px-7 py-5 border-b border-[#e2ddd5] bg-[#f5f1ea]">
                <p className="uppercase tracking-[0.2em] text-[9px] font-bold text-[#c9923a]">
                  How You Earn WU
                </p>
              </div>
              <ul>
                {WU_EARNING.map((row, i) => (
                  <li
                    key={row.source}
                    className={`flex items-center justify-between px-7 py-4 ${
                      i !== WU_EARNING.length - 1
                        ? "border-b border-[#f0ece4]"
                        : ""
                    }`}
                  >
                    <span className="text-[13px] text-[#1a1a1a]">
                      {row.source}
                    </span>
                    <span className="font-playfair font-bold text-[#c9923a] text-sm whitespace-nowrap ml-4">
                      {row.wu}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Levels */}
            <div className="space-y-4">
              {STUDENT_LEVELS.map((lvl) => (
                <div
                  key={lvl.level}
                  className="flex items-start gap-5 bg-white rounded-2xl border border-[#e2ddd5] px-6 py-5"
                >
                  <div className="w-10 h-10 rounded-full bg-[#4a7c59] flex items-center justify-center flex-shrink-0">
                    <span className="font-playfair font-bold text-white text-base">
                      {lvl.level}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-playfair font-bold text-[#1a1a1a] text-base">
                        {lvl.title}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-[#c9923a] font-bold whitespace-nowrap">
                        {lvl.range}
                      </p>
                    </div>
                    <p className="text-[12px] text-[#6b6459] mt-0.5">
                      {lvl.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────── */}
      <section className="w-full bg-[#1a2e22] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-10 h-px bg-[#e8b45a]" />
            <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-white/50">
              From the Student Body
            </span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-14">
            In their{" "}
            <span className="italic font-normal text-[#e8b45a]">
              own words.
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 flex flex-col"
              >
                <span
                  className="font-playfair text-[#e8b45a] leading-none select-none"
                  style={{ fontSize: "56px" }}
                >
                  &ldquo;
                </span>
                <p
                  className="font-playfair italic text-white/85 text-[15px] flex-1 -mt-4"
                  style={{ lineHeight: 1.8 }}
                >
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 mt-7 pt-6 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#4a7c59] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {t.initials}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-[13px] font-semibold flex items-center gap-1.5">
                      {t.name}
                      <span
                        className="inline-flex items-center text-[8px] uppercase tracking-[0.12em] text-[#e8b45a] border border-[#e8b45a]/40 rounded-full px-1.5 py-0.5"
                        title="Verified ANW student"
                      >
                        ✓ Verified
                      </span>
                    </p>
                    <p className="text-white/50 text-[11px]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="w-full bg-[#f5f1ea] py-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="font-playfair text-[#4a7c59] text-3xl mb-4 select-none">
            ❦
          </div>
          <span className="block w-10 h-px bg-[#c9923a] mx-auto mb-8" />
          <h2 className="font-playfair text-4xl md:text-6xl font-bold text-[#1a1a1a] leading-tight max-w-3xl mx-auto">
            Begin your{" "}
            <span className="italic font-normal text-[#4a7c59]">
              natural wellness
            </span>{" "}
            journey.
          </h2>
          <p
            className="text-sm text-[#6b6459] max-w-md mx-auto mt-6"
            style={{ lineHeight: 1.9 }}
          >
            Admissions are rolling, the curriculum is self-paced, and your
            access never expires. The only requirement is seriousness of
            intent.
          </p>
          <Link
            href="/admissions"
            className="inline-block bg-[#4a7c59] text-white text-sm font-bold px-10 py-4 rounded-full hover:bg-[#2d5240] transition-colors mt-10"
          >
            Apply Now — It Takes Five Minutes
          </Link>
        </div>
      </section>
    </div>
  );
}
