import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getInitials } from "@/lib/utils";
import AcademySeal from "@/components/ui/academy-seal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Academic Calendar — Academy of Natural Wellness",
};

const FOREST = "#1C3327";
const GOLD = "#D4A94A";

function currentTerm(date: Date): { name: string; window: string } {
  const y = date.getFullYear();
  const m = date.getMonth();
  if (m <= 1) return { name: `Winter Term ${y}`, window: `January – February ${y}` };
  if (m <= 4) return { name: `Spring Term ${y}`, window: `March – May ${y}` };
  if (m <= 7) return { name: `Summer Term ${y}`, window: `June – August ${y}` };
  if (m <= 10) return { name: `Autumn Term ${y}`, window: `September – November ${y}` };
  return { name: `Winter Term ${y + 1}`, window: `December ${y} – February ${y + 1}` };
}

const UPCOMING_EVENTS = [
  {
    title: "New Student Orientation",
    detail: "A guided tour of the Reading Room, Wellness Units, and the six schools.",
    when: "Held continuously — begin any day",
  },
  {
    title: "Advisory Board Announcements",
    detail: "The Academy's independent Advisory Board is being assembled.",
    when: "Announcements coming soon",
  },
  {
    title: "Graduation & Diploma Ceremonies",
    detail: "Certification diplomas are issued immediately upon completion — verified publicly.",
    when: "Rolling, year-round",
  },
];

export default async function AcademicCalendarPage() {
  const term = currentTerm(new Date());

  const faculty = await prisma.faculty.findMany({
    where: { isActive: true },
    orderBy: [{ isFounding: "desc" }, { joinedAt: "asc" }],
  });

  return (
    <div className="w-full bg-[#faf8f4]">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="w-full py-20" style={{ backgroundColor: FOREST }}>
        <div className="max-w-3xl mx-auto px-6 flex flex-col items-center text-center">
          <AcademySeal size="md" variant="gold" />
          <h1
            className="font-playfair text-4xl md:text-5xl font-bold mt-6 leading-tight"
            style={{ color: "#F3ECDA" }}
          >
            Academic Calendar
          </h1>
          <p className="font-playfair italic text-[14px] text-white/60 mt-3">
            Terms, office hours, and Academy events.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        {/* ── Current term ───────────────────────────────────────────── */}
        <div
          className="rounded-2xl px-8 py-7 flex items-center justify-between gap-6 flex-wrap"
          style={{ backgroundColor: "#F5F0E8", border: "1px solid rgba(212,169,74,0.4)" }}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: "#8a6b30" }}>
              Current Term
            </p>
            <h2 className="font-playfair text-3xl font-bold mt-1.5" style={{ color: FOREST }}>
              {term.name}
            </h2>
            <p className="text-[13px] text-[#8a7a6a] mt-1">{term.window}</p>
          </div>
          <p className="text-[12.5px] text-[#6b6459] max-w-[240px] leading-relaxed">
            ANW admissions are rolling and curricula are self-paced — you may begin studies at any
            point in the term.
          </p>
        </div>

        {/* ── Faculty office hours ───────────────────────────────────── */}
        <div>
          <span className="block w-8 h-1 rounded-full mb-4" style={{ backgroundColor: GOLD }} />
          <h2 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-5">
            Faculty Office Hours
          </h2>
          <div className="bg-white border border-[#e2ddd5] rounded-2xl overflow-hidden">
            {faculty.length === 0 ? (
              <p className="text-sm text-[#6b6459] text-center py-8">
                Office hours will be announced as faculty appointments are made.
              </p>
            ) : (
              faculty.map((f, i) => (
                <div
                  key={f.id}
                  className={`flex items-center gap-4 px-6 py-4 ${
                    i < faculty.length - 1 ? "border-b border-[#f0ece4]" : ""
                  }`}
                >
                  {f.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.photoUrl}
                      alt={f.name}
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                      style={{ border: `2px solid ${GOLD}` }}
                    />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: FOREST, border: `2px solid ${GOLD}` }}
                    >
                      <span className="font-playfair font-bold text-[13px]" style={{ color: GOLD }}>
                        {getInitials(f.name)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/faculty/${f.slug}`}
                      className="text-[14px] font-semibold text-[#1a1a1a] hover:underline"
                    >
                      {f.name}
                    </Link>
                    <p className="text-[12px] text-[#8a7a6a] italic">{f.title}</p>
                  </div>
                  <span
                    className="flex-shrink-0 text-[10.5px] font-semibold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: "rgba(212,169,74,0.12)",
                      color: "#8a6b30",
                      border: "0.5px solid rgba(212,169,74,0.35)",
                    }}
                  >
                    Schedule TBD
                  </span>
                </div>
              ))
            )}
          </div>
          <p className="text-[12px] text-[#9a9088] mt-3">
            Live office hours are announced to enrolled students in the Reading Room.
          </p>
        </div>

        {/* ── Upcoming events ────────────────────────────────────────── */}
        <div>
          <span className="block w-8 h-1 rounded-full mb-4" style={{ backgroundColor: GOLD }} />
          <h2 className="font-playfair text-2xl font-bold text-[#1a1a1a] mb-5">Upcoming Events</h2>
          <div className="space-y-4">
            {UPCOMING_EVENTS.map((e) => (
              <div
                key={e.title}
                className="bg-white border border-[#e2ddd5] rounded-2xl px-6 py-5 flex items-start justify-between gap-6 flex-wrap"
              >
                <div className="min-w-0">
                  <h3 className="font-playfair font-bold text-[16px] text-[#1a1a1a]">{e.title}</h3>
                  <p className="text-[12.5px] text-[#6b6459] mt-1 leading-relaxed">{e.detail}</p>
                </div>
                <span className="text-[11px] font-semibold text-[#8a6b30] whitespace-nowrap pt-1">
                  {e.when}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid #e2ddd5" }}>
          <Link href="/about" className="text-[13px] text-[#6b6459] hover:text-[#1a1a1a] transition-colors">
            ← The Institution
          </Link>
          <Link href="/admissions" className="text-[13px] font-semibold text-[#4a7c59] hover:underline">
            Apply for Admission →
          </Link>
        </div>
      </div>
    </div>
  );
}
