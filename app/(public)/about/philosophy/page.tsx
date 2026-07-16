import Link from "next/link";
import AcademySeal from "@/components/ui/academy-seal";

export const metadata = {
  title: "Academic Philosophy — Academy of Natural Wellness",
};

const FOREST = "#1C3327";
const GOLD = "#D4A94A";

const PILLARS = [
  {
    number: "I",
    title: "Rooted in Primary Sources",
    paragraphs: [
      "Most natural wellness education is built on summaries of summaries — a blog post citing a book that paraphrased a tradition. At ANW, we go to the sources themselves: Hahnemann's Organon of the Medical Art, the Huang Di Nei Jing, Culpeper's Complete Herbal, Maude Grieve's A Modern Herbal. Our students read the masters in their own words, with the historical and clinical context needed to understand them.",
      "This matters because traditions are systems, not collections of tips. A remedy separated from its logic is folklore; the same remedy understood within its diagnostic framework is a discipline. Primary sources preserve the system — its reasoning, its cautions, its internal coherence — and that is what we teach.",
    ],
  },
  {
    number: "II",
    title: "Structured for Practice",
    paragraphs: [
      "A credential should mean something. ANW certifications are earned through structured curricula, gated assessments, written case studies, and capstone work — not by watching videos to the end. Wellness Units, our academic credit system, are awarded only for demonstrated learning, and every diploma we issue carries a certificate number that anyone can verify publicly.",
      "The structure exists to produce practitioners, not collectors of certificates. Each school moves from foundations to materia medica to clinical craft, with safety, contraindications, and scope of practice treated as core curriculum. When an ANW graduate sits with a client, the structure they studied inside becomes the structure they practice inside.",
    ],
  },
  {
    number: "III",
    title: "Guided by Human Mentors",
    paragraphs: [
      "The Academy Scholar — our AI study companion — is available to every student, day and night, for questions, review, and exploration. It is a remarkable tool, and it is deliberately not the teacher. Case studies are reviewed by human mentors. Capstones are evaluated by faculty. Office hours are held by practitioners who live in the traditions they teach.",
      "We hold this line because wellness practice is ultimately a human craft: listening, discernment, the judgment to refer. AI assists; humans teach and inspire. Our students graduate having been read, questioned, and challenged by people who practice what they teach — and that is not a step we will ever automate away.",
    ],
  },
];

export default function PhilosophyPage() {
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
            Academic Philosophy
          </h1>
          <p className="font-playfair italic text-[14px] text-white/60 mt-3">
            Three pillars hold up everything we teach.
          </p>
        </div>
      </div>

      {/* ── Pillars ──────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.number}
            className="bg-white border border-[#e2ddd5] rounded-2xl px-8 md:px-10 py-9"
          >
            <div className="flex items-center gap-4 mb-5">
              <span
                className="w-11 h-11 rounded-full flex items-center justify-center font-playfair font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: "rgba(212,169,74,0.14)", color: "#8a6b30", border: `1px solid ${GOLD}` }}
              >
                {pillar.number}
              </span>
              <h2 className="font-playfair text-2xl font-bold text-[#1a1a1a] leading-snug">
                {pillar.title}
              </h2>
            </div>
            {pillar.paragraphs.map((p, i) => (
              <p key={i} className={`text-[14px] text-[#4a4238] leading-[1.9] ${i > 0 ? "mt-4" : ""}`}>
                {p}
              </p>
            ))}
          </div>
        ))}

        <div className="flex items-center justify-between pt-2">
          <Link href="/about" className="text-[13px] text-[#6b6459] hover:text-[#1a1a1a] transition-colors">
            ← The Institution
          </Link>
          <Link href="/about/methodology" className="text-[13px] font-semibold text-[#4a7c59] hover:underline">
            Curriculum Methodology →
          </Link>
        </div>
      </div>
    </div>
  );
}
