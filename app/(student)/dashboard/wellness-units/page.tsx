import { getLevelTitle, getWUForLevel } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sourceColors: Record<string, string> = {
  lesson: "#4a7c59",
  quiz: "#5b4fcf",
  assignment: "#d4882a",
  discussion: "#2c6e8a",
  case_study: "#c9923a",
  capstone: "#c0392b",
  midterm: "#5b4fcf",
  final: "#8b4a3c",
};

const earnGuide = [
  { type: "Lesson",     wu: "1",     label: "WU", color: "#4a7c59" },
  { type: "Quiz",       wu: "2",     label: "WU", color: "#5b4fcf" },
  { type: "Discussion", wu: "2",     label: "WU", color: "#2c6e8a" },
  { type: "Assignment", wu: "5",     label: "WU", color: "#d4882a" },
  { type: "Case Study", wu: "10–25", label: "WU", color: "#c9923a" },
  { type: "Capstone",   wu: "50",    label: "WU", color: "#c0392b" },
];

// Shared parchment card style
const CARD_STYLE = { backgroundColor: "#FAF7F0", border: "0.5px solid #DDD5C5" } as const;

export const dynamic = "force-dynamic";

export default async function WellnessUnitsPage() {
  const user = await getCurrentUser();
  const transactions = user
    ? await prisma.wellnessUnitTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  const currentWU = user?.studentProfile?.totalWU ?? 0;
  const currentLevel = user?.studentProfile?.level ?? 1;
  const levelData = getWUForLevel(currentLevel);
  const levelProgressPct = Math.min(
    100,
    Math.max(0, Math.round(((currentWU - levelData.min) / (levelData.max - levelData.min)) * 100))
  );
  const wuToNext = Math.max(0, levelData.max - currentWU);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-[#1a1a1a]">Wellness Units</h1>
        <p className="text-[#6b6459] mt-1">Your recorded academic recognition and available activity history</p>
      </div>

      {/* ── Main stat card — dark green hero, matching Dashboard WU card ─────── */}
      <div
        className="rounded-[16px] p-6"
        style={{ backgroundColor: "#1C3327", border: "0.5px solid rgba(255,255,255,0.08)" }}
      >
        <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#D4A94A] mb-3">
          Wellness Units
        </p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-playfair font-bold text-white" style={{ fontSize: "40px", lineHeight: 1 }}>
            {currentWU}
          </span>
          <span className="font-semibold text-lg text-[#D4A94A]">WU</span>
        </div>
        <p className="text-[13px] mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
          Level {currentLevel} · {getLevelTitle(currentLevel)}
        </p>
        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${levelProgressPct}%`, backgroundColor: "#D4A94A" }}
          />
        </div>
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          {wuToNext > 0
            ? `${wuToNext} WU to Level ${currentLevel + 1} · ${getLevelTitle(currentLevel + 1)}`
            : `Level ${currentLevel} — ${getLevelTitle(currentLevel)}`}
        </p>
      </div>

      {/* ── How to Earn WU ─────────────────────────────────────────────────── */}
      <div className="rounded-[16px] p-6" style={CARD_STYLE}>
        <h2 className="font-playfair text-xl font-bold text-[#1a1a1a] mb-4">How to Earn WU</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {earnGuide.map((s) => (
            <div
              key={s.type}
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: "#FDF9F2", border: "0.5px solid #E5DDD0" }}
            >
              <div
                className="w-10 h-10 rounded-full mx-auto mb-2.5 flex items-center justify-center"
                style={{ backgroundColor: `${s.color}18` }}
              >
                <span className="font-playfair font-bold text-base" style={{ color: s.color }}>✦</span>
              </div>
              <p className="text-[11px] text-[#6b6459] mb-1.5">{s.type}</p>
              <div className="flex flex-col items-center">
                <span className="font-playfair font-bold text-[#c9923a] text-lg leading-none">{s.wu}</span>
                <span className="text-[9px] font-semibold uppercase tracking-wide text-[#c9923a]/70 mt-0.5">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recorded activity ────────────────────────────────────────────────── */}
      <div className="rounded-[16px] p-6" style={CARD_STYLE}>
        <h2 className="font-playfair text-xl font-bold text-[#1a1a1a]">Recorded Activity</h2>
        <p className="mt-1 mb-4 text-[11px] leading-5 text-[#8a7a6a]">
          This is the activity history currently available to your student record. Your recorded balance may include earlier academic recognition not itemized here.
        </p>
        {transactions.length === 0 ? (
          <div className="rounded-xl border border-[#e5ddd0] bg-white/50 px-5 py-8 text-center">
            <p className="text-[13px] font-semibold text-[#1a1a1a]">No itemized WU activity is available yet.</p>
            <p className="mt-1 text-[11px] text-[#8a7a6a]">Verified learning activity will appear here as it is recorded.</p>
          </div>
        ) : (
          <div>
            {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between gap-4 py-3 border-b last:border-0"
              style={{ borderColor: "#E8E0D0" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: sourceColors[tx.sourceType] ?? "#4a7c59" }}
                />
                <div className="min-w-0">
                  <p className="text-[13px] text-[#1a1a1a] line-clamp-1">{tx.description}</p>
                  <p className="text-[11px] text-[#8a7a6a] mt-0.5">
                    {tx.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="font-playfair font-bold text-[#c9923a] text-xl leading-none">
                  +{tx.amount}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wide text-[#c9923a]/70 mt-0.5">
                  WU
                </span>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
