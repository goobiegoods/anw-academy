import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FOREST = "#1C3327";
const GOLD = "#D4A94A";

export default async function FacultyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!process.env.DATABASE_URL) notFound();
  const faculty = await prisma.faculty.findUnique({ where: { slug } });
  if (!faculty || !faculty.isActive) notFound();

  const [schools, courses] = await Promise.all([
    prisma.school.findMany({
      where: { name: { in: faculty.schools } },
      orderBy: { order: "asc" },
    }),
    faculty.coursesTaught.length
      ? prisma.course.findMany({
          where: {
            OR: [
              { slug: { in: faculty.coursesTaught } },
              { id: { in: faculty.coursesTaught } },
            ],
          },
          include: { school: { select: { name: true, color: true } } },
          orderBy: { order: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="w-full bg-[#faf8f4]">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="w-full py-16" style={{ backgroundColor: FOREST }}>
        <div className="max-w-4xl mx-auto px-6">
          <Link
            href="/faculty"
            className="text-[12px] text-white/50 hover:text-white/80 transition-colors"
          >
            ← Faculty Directory
          </Link>
          <div className="flex items-center gap-8 mt-6 flex-wrap">
            {faculty.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={faculty.photoUrl}
                alt={faculty.name}
                className="w-32 h-32 rounded-full object-cover flex-shrink-0"
                style={{ border: `4px solid ${GOLD}` }}
              />
            ) : (
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "rgba(212,169,74,0.15)",
                  border: `4px solid ${GOLD}`,
                }}
              >
                <span
                  className="font-playfair font-bold text-4xl"
                  style={{ color: GOLD }}
                >
                  {getInitials(faculty.name)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <h1
                className="font-playfair text-4xl md:text-5xl font-bold"
                style={{ color: "#F3ECDA" }}
              >
                {faculty.name}
              </h1>
              <p className="font-playfair italic text-[16px] text-white/65 mt-1.5">
                {faculty.title}
              </p>
              {faculty.credentials.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {faculty.credentials.map((c) => (
                    <span
                      key={c}
                      className="text-[10.5px] font-semibold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: "rgba(212,169,74,0.18)",
                        color: GOLD,
                        border: "0.5px solid rgba(212,169,74,0.45)",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-12">
        {/* ── Bio ────────────────────────────────────────────────────── */}
        <div className="prose prose-sm max-w-none text-[14px] text-[#3a3028] leading-relaxed [&>p]:mb-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {faculty.bio}
          </ReactMarkdown>
        </div>

        {/* ── Specializations ────────────────────────────────────────── */}
        {faculty.specializations.length > 0 && (
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.25em] font-bold mb-3"
              style={{ color: "#8a6b30" }}
            >
              Specializations
            </p>
            <div className="flex flex-wrap gap-2">
              {faculty.specializations.map((s) => (
                <span
                  key={s}
                  className="text-[12px] font-medium px-3.5 py-1.5 rounded-full bg-white border border-[#DDD5C5] text-[#3a3028]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Teaches In ─────────────────────────────────────────────── */}
        {schools.length > 0 && (
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.25em] font-bold mb-3"
              style={{ color: "#8a6b30" }}
            >
              Teaches In
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {schools.map((s) => (
                <Link key={s.id} href={`/schools/${s.slug}`}>
                  <div className="bg-white border border-[#e2ddd5] rounded-xl px-5 py-4 flex items-center gap-3 hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] transition-all">
                    <span className="text-xl">{s.icon}</span>
                    <span className="font-playfair font-bold text-[14px] text-[#1a1a1a]">
                      {s.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Curricula ──────────────────────────────────────────────── */}
        {courses.length > 0 && (
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.25em] font-bold mb-3"
              style={{ color: "#8a6b30" }}
            >
              Curricula
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border border-[#e2ddd5] rounded-xl overflow-hidden"
                >
                  <div
                    className="h-1"
                    style={{ backgroundColor: c.school.color }}
                  />
                  <div className="px-5 py-4">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#9a9088] mb-1">
                      {c.school.name.replace("School of ", "")}
                    </p>
                    <p className="font-playfair font-bold text-[14px] text-[#1a1a1a] leading-snug">
                      {c.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Links ──────────────────────────────────────────────────── */}
        {(faculty.linkedinUrl || faculty.personalWebsite) && (
          <div className="flex items-center gap-4">
            {faculty.linkedinUrl && (
              <a
                href={faculty.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-medium text-[#4a7c59] hover:underline"
              >
                LinkedIn →
              </a>
            )}
            {faculty.personalWebsite && (
              <a
                href={faculty.personalWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-medium text-[#4a7c59] hover:underline"
              >
                Website →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
