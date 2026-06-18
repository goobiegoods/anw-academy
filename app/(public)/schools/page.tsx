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

export default async function SchoolsPage() {
  const schools = await prisma.school.findMany({
    orderBy: { order: "asc" },
    include: {
      departments: true,
      courses: { orderBy: { order: "asc" } },
    },
  });

  return (
    <div className="w-full bg-[#f5f1ea]">
      {/* Header */}
      <div className="w-full bg-[#faf8f4] border-b border-[#e2ddd5] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-10 h-px bg-[#c9923a]" />
            <span className="uppercase tracking-[0.25em] text-[10px] font-semibold text-[#9a9088]">
              The Six Schools
            </span>
          </div>
          <h1 className="font-playfair text-5xl md:text-6xl font-bold text-[#1a1a1a] leading-tight">
            Six traditions.{" "}
            <span className="italic font-normal text-[#4a7c59]">
              One institution.
            </span>
          </h1>
          <p
            className="text-sm text-[#6b6459] max-w-xl mt-5"
            style={{ lineHeight: 1.9 }}
          >
            Each school of the Academy is a complete curriculum with its own
            departments, faculty voice, and certification pathway. Begin where
            your curiosity is strongest — your Wellness Units carry across all
            six.
          </p>
        </div>
      </div>

      {/* School cards */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-10">
        {schools.map((school) => {
          const meta = SCHOOL_META[school.slug] ?? {
            eyebrow: "School",
            slogan: school.description,
            tags: [],
            gradient: `linear-gradient(120deg, ${school.color}, ${school.color})`,
          };
          return (
            <Link
              key={school.id}
              href={`/schools/${school.slug}`}
              className="block rounded-2xl overflow-hidden border border-[#e2ddd5] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all"
            >
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
                  <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white leading-tight">
                    {school.name.replace("School of ", "")}
                  </h2>
                  <p className="font-playfair italic text-white/80 mt-2 text-lg">
                    {meta.slogan}
                  </p>
                  <span className="block w-8 h-px bg-[#e8b45a] mt-5" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[12.5px] text-white/75" style={{ lineHeight: 1.8 }}>
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
                      <li key={dept.id} className="text-[12.5px] text-[#6b6459]">
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
                      available · counts toward the school certificate and the
                      Natural Wellness Practitioner credential.
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center gap-2 text-[12.5px] font-semibold"
                    style={{ color: school.color }}
                  >
                    Enter the school →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
