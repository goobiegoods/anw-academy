import Link from "next/link";
import AcademySeal from "@/components/ui/academy-seal";

export const metadata = {
  title: "A Message from Our Founder — Academy of Natural Wellness",
};

const FOREST = "#1C3327";
const GOLD = "#D4A94A";

const LETTER_PARAGRAPHS = [
  "I built the Academy of Natural Wellness because I believe the oldest healing systems in the world deserve to be taught with the same rigor and respect as any modern discipline.",
  "For over a decade, I studied homeopathy, Traditional Chinese Medicine, herbalism, and functional wellness — not as hobbies, but as serious disciplines with centuries of clinical evidence behind them. What I found was that the knowledge existed, but the credentialing did not. There was nowhere to study these traditions together, at depth, with the kind of structure that produces real practitioners.",
  "ANW is that place.",
  "Every curriculum here draws from primary sources. Every certification is publicly verifiable. Every student earns their standing. This is not a collection of videos — it is an institution, and we intend to build it for generations.",
  "Welcome to the Academy.",
];

export default function FounderPage() {
  return (
    <div className="w-full bg-[#faf8f4]">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="w-full py-20" style={{ backgroundColor: FOREST }}>
        <div className="max-w-3xl mx-auto px-6 flex flex-col items-center text-center">
          <AcademySeal size="lg" variant="gold" />
          <h1
            className="font-playfair text-4xl md:text-5xl font-bold mt-6 leading-tight"
            style={{ color: "#F3ECDA" }}
          >
            A Message from Our Founder
          </h1>
        </div>
      </div>

      {/* ── Letter ───────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex justify-center mb-10">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{ backgroundColor: FOREST, border: `3px solid ${GOLD}` }}
          >
            <span className="font-playfair font-bold text-3xl" style={{ color: GOLD }}>
              OF
            </span>
          </div>
        </div>

        <div
          className="rounded-2xl px-8 md:px-12 py-12"
          style={{ backgroundColor: "#F5F0E8", border: "1px solid rgba(212,169,74,0.35)" }}
        >
          {LETTER_PARAGRAPHS.map((p, i) => (
            <p
              key={i}
              className={`text-[15px] leading-[1.9] text-[#2a2620] ${
                i > 0 ? "mt-6" : ""
              } ${p === "ANW is that place." ? "font-playfair italic text-[18px]" : ""}`}
            >
              {p}
            </p>
          ))}

          <div className="mt-10 pt-8" style={{ borderTop: "0.5px solid rgba(138,107,48,0.35)" }}>
            <p className="font-caveat text-[34px] leading-none" style={{ color: FOREST }}>
              Orel Fitch
            </p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#7a7266] mt-2">
              Founder &amp; Academic Director
            </p>
            <p className="text-[12px] text-[#8a7a6a] mt-1">
              Academy of Natural Wellness, Est. 2026
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-10">
          <Link href="/about" className="text-[13px] text-[#6b6459] hover:text-[#1a1a1a] transition-colors">
            ← The Institution
          </Link>
          <Link href="/about/philosophy" className="text-[13px] font-semibold text-[#4a7c59] hover:underline">
            Academic Philosophy →
          </Link>
        </div>
      </div>
    </div>
  );
}
