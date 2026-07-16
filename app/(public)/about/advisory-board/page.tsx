import Link from "next/link";
import AcademySeal from "@/components/ui/academy-seal";

export const metadata = {
  title: "Advisory Board — Academy of Natural Wellness",
};

const FOREST = "#1C3327";
const GOLD = "#D4A94A";

const OPEN_POSITIONS = [
  "Herbal Medicine & Botanical Safety",
  "Traditional Chinese Medicine",
  "Classical Homeopathy",
  "Functional & Lifestyle Medicine",
  "Clinical Ethics & Scope of Practice",
  "Wellness Education Standards",
];

export default function AdvisoryBoardPage() {
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
            Advisory Board
          </h1>
          <p className="font-playfair italic text-[14px] text-white/60 mt-3 max-w-md">
            Independent counsel for the Academy&apos;s standards, curriculum, and ethics.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div
          className="rounded-2xl px-8 py-6 mb-10 text-center"
          style={{ backgroundColor: "#F5F0E8", border: "1px solid rgba(212,169,74,0.35)" }}
        >
          <p className="font-playfair italic text-[16px]" style={{ color: FOREST }}>
            The Advisory Board is being assembled. Announcements coming soon.
          </p>
          <p className="text-[12.5px] text-[#8a7a6a] mt-2 leading-relaxed">
            The Academy is inviting senior practitioners and scholars to serve as independent
            advisors on curriculum quality, safety standards, and academic integrity.
          </p>
        </div>

        {/* Placeholder seats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {OPEN_POSITIONS.map((position) => (
            <div
              key={position}
              className="rounded-2xl p-7 flex flex-col items-center text-center"
              style={{ border: "1.5px dashed #d5cbb8", backgroundColor: "#fdfcf9" }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ border: `2px dashed ${GOLD}`, backgroundColor: "rgba(212,169,74,0.06)" }}
              >
                <span className="font-playfair text-2xl" style={{ color: "rgba(138,107,48,0.5)" }}>
                  ❦
                </span>
              </div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em] mt-4"
                style={{ color: "#8a6b30" }}
              >
                Position Open
              </p>
              <p className="font-playfair font-bold text-[15px] text-[#3a3028] mt-1.5 leading-snug">
                {position}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-12">
          <Link href="/about" className="text-[13px] text-[#6b6459] hover:text-[#1a1a1a] transition-colors">
            ← The Institution
          </Link>
          <Link href="/faculty" className="text-[13px] font-semibold text-[#4a7c59] hover:underline">
            Meet Our Faculty →
          </Link>
        </div>
      </div>
    </div>
  );
}
