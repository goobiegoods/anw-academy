import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";
import AcademySeal from "@/components/ui/academy-seal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our Faculty — Academy of Natural Wellness",
  description: "Practitioners, scholars, and healers who shape the Academy.",
};

const FOREST = "#1C3327";
const GOLD = "#D4A94A";

export default async function FacultyDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ school?: string }>;
}) {
  const { school: schoolFilter } = await searchParams;

  const [faculty, schools] = await Promise.all([
    prisma.faculty.findMany({
      where: { isActive: true },
      orderBy: [{ isFounding: "desc" }, { joinedAt: "asc" }],
    }),
    prisma.school.findMany({ orderBy: { order: "asc" }, select: { name: true } }),
  ]);

  const filtered = schoolFilter
    ? faculty.filter((f) => f.schools.includes(schoolFilter))
    : faculty;

  return (
    <div className="w-full bg-[#faf8f4]">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="w-full py-20" style={{ backgroundColor: FOREST }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <AcademySeal size="sm" variant="light" />
          <h1 className="font-playfair text-5xl md:text-6xl font-bold mt-5" style={{ color: "#F3ECDA" }}>
            Our Faculty
          </h1>
          <p className="font-playfair italic text-[15px] text-white/60 mt-3">
            Practitioners, scholars, and healers who shape the Academy.
          </p>
        </div>
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/faculty"
            className="text-[11px] font-semibold px-3.5 py-1.5 rounded-full border transition-colors"
            style={
              !schoolFilter
                ? { backgroundColor: FOREST, color: "#F3ECDA", borderColor: FOREST }
                : { color: "#6b6459", borderColor: "#DDD5C5" }
            }
          >
            All Schools
          </Link>
          {schools.map((s) => (
            <Link
              key={s.name}
              href={`/faculty?school=${encodeURIComponent(s.name)}`}
              className="text-[11px] font-semibold px-3.5 py-1.5 rounded-full border transition-colors"
              style={
                schoolFilter === s.name
                  ? { backgroundColor: FOREST, color: "#F3ECDA", borderColor: FOREST }
                  : { color: "#6b6459", borderColor: "#DDD5C5" }
              }
            >
              {s.name.replace("School of ", "")}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Cards ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-10 pb-24">
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#e2ddd5] rounded-2xl p-12 text-center">
            <p className="text-sm text-[#6b6459]">
              No faculty listed for this school yet — appointments are announced each term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((f) => (
              <div
                key={f.id}
                className="bg-white border border-[#e2ddd5] rounded-2xl p-7 flex flex-col items-center text-center shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
              >
                {/* Photo / initials */}
                {f.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.photoUrl}
                    alt={f.name}
                    className="w-24 h-24 rounded-full object-cover"
                    style={{ border: `3px solid ${GOLD}` }}
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: FOREST, border: `3px solid ${GOLD}` }}
                  >
                    <span className="font-playfair font-bold text-2xl" style={{ color: GOLD }}>
                      {getInitials(f.name)}
                    </span>
                  </div>
                )}

                <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mt-4">{f.name}</h2>
                <p className="font-playfair italic text-[13px] text-[#6b6459] mt-0.5">{f.title}</p>

                {f.credentials.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    {f.credentials.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "rgba(212,169,74,0.14)",
                          color: "#8a6b30",
                          border: "0.5px solid rgba(212,169,74,0.4)",
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {f.schools.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-2.5">
                    {f.schools.map((s) => (
                      <span
                        key={s}
                        className="text-[9.5px] font-medium px-2 py-0.5 rounded"
                        style={{ backgroundColor: "rgba(28,51,39,0.08)", color: FOREST }}
                      >
                        {s.replace("School of ", "")}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/faculty/${f.slug}`}
                  className="mt-5 text-[13px] font-semibold px-5 py-2 rounded-full border transition-colors hover:bg-[#1C3327] hover:text-[#F3ECDA]"
                  style={{ color: FOREST, borderColor: FOREST }}
                >
                  View Profile →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
